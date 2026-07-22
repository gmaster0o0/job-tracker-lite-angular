import {
  computed,
  effect,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
  untracked,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';
import {
  DEFAULT_USER_PREFERENCES,
  Theme,
  UserPreferencesDto,
  userPreferencesSchema,
} from '@job-tracker-lite-angular/schemas';
import { AuthSessionService } from './auth-session.service';
import { NetworkService } from './network.service';
import { PreferencesDataAccessService } from '../data-access/preferences.data-access';
import { resolveSystemLanguage } from '../utils/system-language.util';

export type { Theme };

export const AVAILABLE_LANGUAGES = ['hu', 'en'] as const;
export const DEFAULT_LANGUAGE = 'hu';

const STORAGE_KEY = 'user-preferences';
const LEGACY_THEME_KEY = 'theme';
const LEGACY_LANGUAGE_KEY = 'user-lang';
const LEGACY_DATE_FORMAT_KEY = 'setttings';

// The DTO shape (theme/language/dateFormat/updatedAt) is the shared,
// backend-facing contract from @job-tracker-lite-angular/schemas. isSynced
// is purely client-local bookkeeping for the offline queue - the backend
// never sees or persists it, so it's added here rather than in the shared
// schema.
interface StoredPreferences extends UserPreferencesDto {
  isSynced: boolean;
}

const DEFAULT_STORED_PREFERENCES: StoredPreferences = {
  ...DEFAULT_USER_PREFERENCES,
  isSynced: true,
};

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private transloco = inject(TranslocoService);
  private preferencesDataAccess = inject(PreferencesDataAccessService);
  private networkService = inject(NetworkService);
  private authSession = inject(AuthSessionService);

  private mediaQuery =
    this.isBrowser && typeof window?.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  private readonly preferences = signal<StoredPreferences>(
    DEFAULT_STORED_PREFERENCES,
  );

  readonly theme = computed(() => this.preferences().theme);
  readonly language = computed(() => this.preferences().language);
  readonly dateFormat = computed(() => this.preferences().dateFormat);

  private previousAuthenticated = this.authSession.isAuthenticated();
  private previousOnline = this.networkService.isOnline();

  constructor() {
    if (this.mediaQuery) {
      this.mediaQuery.addEventListener('change', () => {
        if (this.preferences().theme === 'system') {
          this.applyThemeClass('system');
        }
      });
    }

    if (this.isBrowser && typeof window?.addEventListener === 'function') {
      window.addEventListener('languagechange', () => {
        if (this.preferences().language === 'system') {
          this.transloco.setActiveLang(this.resolveActiveLanguage('system'));
        }
      });
    }

    // Fresh login or session-restore-on-refresh: reconcile local vs server.
    effect(() => {
      const authenticated = this.authSession.isAuthenticated();
      const justAuthenticated = authenticated && !this.previousAuthenticated;
      this.previousAuthenticated = authenticated;

      if (justAuthenticated) {
        untracked(() => void this.syncOnLogin());
      }
    });

    // Coming back online: push any change that was made while offline.
    effect(() => {
      const online = this.networkService.isOnline();
      const justCameOnline = online && !this.previousOnline;
      this.previousOnline = online;

      if (justCameOnline) {
        untracked(() => {
          if (
            this.authSession.isAuthenticated() &&
            !this.preferences().isSynced
          ) {
            void this.attemptRemoteSync();
          }
        });
      }
    });
  }

  // Reads (and, on a legacy user, migrates) stored preferences and applies
  // them synchronously before returning. This is awaited by
  // preferencesInitGuard so the app never renders with default preferences
  // before the real, stored ones are applied - see that guard for why.
  async init(): Promise<void> {
    if (!this.isBrowser) return;

    const prefs = this.loadFromStorage();
    this.preferences.set(prefs);
    this.applyThemeClass(prefs.theme);
    this.transloco.setActiveLang(this.resolveActiveLanguage(prefs.language));
  }

  setTheme(theme: Theme): void {
    this.updateAndSync({ theme });
    this.applyThemeClass(theme);
  }

  setLanguage(language: string): void {
    this.updateAndSync({ language });
    this.transloco.setActiveLang(this.resolveActiveLanguage(language));
  }

  setDateFormat(dateFormat: string): void {
    this.updateAndSync({ dateFormat });
  }

  private updateAndSync(
    patch: Partial<
      Pick<UserPreferencesDto, 'theme' | 'language' | 'dateFormat'>
    >,
  ): void {
    const updatedAt = new Date().toISOString();
    this.preferences.update((prefs) => ({ ...prefs, ...patch, updatedAt }));
    this.persist();
    void this.attemptRemoteSync();
  }

  // Optimistic push for an in-session change (or a queued offline one, via
  // the reconnect effect above). Never throws - failure just falls back to
  // isSynced:false so it's retried on the next login or reconnect.
  private async attemptRemoteSync(): Promise<void> {
    if (!this.authSession.isAuthenticated()) return;
    if (!this.networkService.isOnline()) {
      this.markUnsynced();
      return;
    }

    try {
      const { isSynced: _isSynced, ...dto } = this.preferences();
      await this.preferencesDataAccess.updatePreferences(dto);
      this.preferences.update((prefs) => ({ ...prefs, isSynced: true }));
      this.persist();
    } catch {
      this.markUnsynced();
    }
  }

  // Fresh login (empty local) and login-with-existing-local-data collapse
  // into one last-write-wins comparison: an untouched side always carries
  // DEFAULT_USER_PREFERENCES.updatedAt (epoch-zero), so it always loses to
  // any side with a real timestamp. When local wins, it's pushed with a
  // FRESH timestamp rather than its own (possibly epoch-zero) one - so a
  // later, genuinely-fresh device can never tie against it and clobber it.
  private async syncOnLogin(): Promise<void> {
    if (!this.isBrowser) return;

    try {
      const server = await this.preferencesDataAccess.getPreferences();
      const local = this.preferences();
      const serverWins =
        new Date(server.updatedAt).getTime() >
        new Date(local.updatedAt).getTime();

      if (serverWins) {
        this.applyAndPersist({ ...server, isSynced: true });
        return;
      }

      const {
        isSynced: _isSynced,
        updatedAt: _staleUpdatedAt,
        ...fields
      } = local;
      const freshDto: UserPreferencesDto = {
        ...fields,
        updatedAt: new Date().toISOString(),
      };

      try {
        const pushed =
          await this.preferencesDataAccess.updatePreferences(freshDto);
        this.applyAndPersist({ ...pushed, isSynced: true });
      } catch {
        this.markUnsynced();
      }
    } catch {
      // Couldn't reach the backend to compare - keep working from local,
      // unchanged (same as if Phase 2 sync didn't exist).
    }
  }

  private applyAndPersist(prefs: StoredPreferences): void {
    this.preferences.set(prefs);
    this.applyThemeClass(prefs.theme);
    this.transloco.setActiveLang(this.resolveActiveLanguage(prefs.language));
    this.persist();
  }

  private markUnsynced(): void {
    this.preferences.update((prefs) => ({ ...prefs, isSynced: false }));
    this.persist();
  }

  // 'system' is a reserved choice (alongside real language codes) that
  // continuously tracks the browser/OS language - see the 'languagechange'
  // listener above and theme's identical 'system' handling.
  private resolveActiveLanguage(choice: string): string {
    if (choice !== 'system') return choice;
    return resolveSystemLanguage(AVAILABLE_LANGUAGES) ?? DEFAULT_LANGUAGE;
  }

  private loadFromStorage(): StoredPreferences {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const merged = { ...DEFAULT_USER_PREFERENCES, ...parsed };
        const result = userPreferencesSchema.safeParse(merged);
        if (result.success) {
          return { ...result.data, isSynced: parsed.isSynced ?? true };
        }
      } catch {
        // Corrupt blob - fall through to legacy keys / defaults below.
      }
    }

    return this.migrateFromLegacyKeys();
  }

  // One-time migration for users with preferences saved under the old,
  // per-concern keys (from before theme/language/date-format were merged
  // into a single UserPreferencesService). Safe to run every time init() is
  // called: once migrated, STORAGE_KEY is populated and short-circuits this
  // path on the next call. A legacy user who never touched language ends up
  // with the same 'system' default as a genuinely fresh user - they never
  // expressed a preference either.
  private migrateFromLegacyKeys(): StoredPreferences {
    const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY) as Theme | null;
    const legacyLanguage = localStorage.getItem(LEGACY_LANGUAGE_KEY);
    const legacyDateFormat = localStorage.getItem(LEGACY_DATE_FORMAT_KEY);

    if (!legacyTheme && !legacyLanguage && !legacyDateFormat) {
      return DEFAULT_STORED_PREFERENCES;
    }

    const migrated: StoredPreferences = {
      theme: legacyTheme ?? DEFAULT_STORED_PREFERENCES.theme,
      language: legacyLanguage ?? DEFAULT_STORED_PREFERENCES.language,
      dateFormat: legacyDateFormat ?? DEFAULT_STORED_PREFERENCES.dateFormat,
      updatedAt: DEFAULT_USER_PREFERENCES.updatedAt,
      isSynced: true,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    localStorage.removeItem(LEGACY_THEME_KEY);
    localStorage.removeItem(LEGACY_LANGUAGE_KEY);
    localStorage.removeItem(LEGACY_DATE_FORMAT_KEY);

    return migrated;
  }

  private applyThemeClass(theme: Theme): void {
    if (!this.isBrowser) return;

    const root = document.documentElement;
    const isDark =
      theme === 'dark' || (theme === 'system' && this.mediaQuery?.matches);

    root.classList.toggle('dark', isDark);
  }

  private persist(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences()));
  }
}
