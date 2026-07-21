import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';

export type Theme = 'light' | 'dark' | 'system';

export interface UserPreferences {
  theme: Theme;
  language: string;
  dateFormat: string;
}

export const DEFAULT_LANGUAGE = 'hu';

const STORAGE_KEY = 'user-preferences';
const LEGACY_THEME_KEY = 'theme';
const LEGACY_LANGUAGE_KEY = 'user-lang';
const LEGACY_DATE_FORMAT_KEY = 'setttings';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  language: DEFAULT_LANGUAGE,
  dateFormat: 'DD-MM-YYYY',
};

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private transloco = inject(TranslocoService);

  private mediaQuery =
    this.isBrowser && typeof window?.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  private readonly preferences = signal<UserPreferences>(DEFAULT_PREFERENCES);

  readonly theme = computed(() => this.preferences().theme);
  readonly language = computed(() => this.preferences().language);
  readonly dateFormat = computed(() => this.preferences().dateFormat);

  constructor() {
    if (this.mediaQuery) {
      this.mediaQuery.addEventListener('change', () => {
        if (this.preferences().theme === 'system') {
          this.applyThemeClass('system');
        }
      });
    }
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
    this.transloco.setActiveLang(prefs.language);
  }

  setTheme(theme: Theme): void {
    this.preferences.update((prefs) => ({ ...prefs, theme }));
    this.applyThemeClass(theme);
    this.persist();
  }

  setLanguage(language: string): void {
    this.preferences.update((prefs) => ({ ...prefs, language }));
    this.transloco.setActiveLang(language);
    this.persist();
  }

  setDateFormat(dateFormat: string): void {
    this.preferences.update((prefs) => ({ ...prefs, dateFormat }));
    this.persist();
  }

  private loadFromStorage(): UserPreferences {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
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
  // path on the next call.
  private migrateFromLegacyKeys(): UserPreferences {
    const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY) as Theme | null;
    const legacyLanguage = localStorage.getItem(LEGACY_LANGUAGE_KEY);
    const legacyDateFormat = localStorage.getItem(LEGACY_DATE_FORMAT_KEY);

    if (!legacyTheme && !legacyLanguage && !legacyDateFormat) {
      return DEFAULT_PREFERENCES;
    }

    const migrated: UserPreferences = {
      theme: legacyTheme ?? DEFAULT_PREFERENCES.theme,
      language: legacyLanguage ?? DEFAULT_PREFERENCES.language,
      dateFormat: legacyDateFormat ?? DEFAULT_PREFERENCES.dateFormat,
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
