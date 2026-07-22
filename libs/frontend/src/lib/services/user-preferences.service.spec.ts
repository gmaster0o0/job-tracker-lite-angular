import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, signal } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TranslocoService } from '@jsverse/transloco';
import { UserPreferencesService } from './user-preferences.service';
import { AuthSessionService } from './auth-session.service';
import { NetworkService } from './network.service';
import { PreferencesDataAccessService } from '../data-access/preferences.data-access';
import {
  createLocalStorageMock,
  createMediaQueryListMock,
  createDocumentElementMock,
  userPreferencesFixtures,
} from '@job-tracker-lite-angular/testing';

describe('UserPreferencesService', () => {
  let localStorageMock: Storage;
  let mediaQueryListMock: MediaQueryList;
  let documentElementMock: HTMLElement;
  let translocoServiceMock: { setActiveLang: ReturnType<typeof vi.fn> };
  let authSessionServiceMock: { isAuthenticated: ReturnType<typeof signal> };
  let networkServiceMock: { isOnline: ReturnType<typeof signal> };
  let preferencesDataAccessMock: {
    getPreferences: ReturnType<typeof vi.fn>;
    updatePreferences: ReturnType<typeof vi.fn>;
  };
  let windowAddEventListenerSpy: ReturnType<typeof vi.spyOn>;

  const storeItems = (items: Record<string, string | null>) => {
    (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockImplementation(
      (key: string) => items[key] ?? null,
    );
  };

  const stubSystemLanguage = (language: string) => {
    Object.defineProperty(navigator, 'language', {
      value: language,
      configurable: true,
    });
    Object.defineProperty(navigator, 'languages', {
      value: [language],
      configurable: true,
    });
  };

  const languagechangeListener = () => {
    const call = windowAddEventListenerSpy.mock.calls.find(
      (call: unknown[]) => call[0] === 'languagechange',
    );
    return call?.[1] as (() => void) | undefined;
  };

  const createService = (platform: 'browser' | 'server' = 'browser') => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UserPreferencesService,
        { provide: PLATFORM_ID, useValue: platform },
        { provide: TranslocoService, useValue: translocoServiceMock },
        { provide: AuthSessionService, useValue: authSessionServiceMock },
        { provide: NetworkService, useValue: networkServiceMock },
        {
          provide: PreferencesDataAccessService,
          useValue: preferencesDataAccessMock,
        },
      ],
    });
    return TestBed.inject(UserPreferencesService);
  };

  beforeEach(() => {
    localStorageMock = createLocalStorageMock(() => vi.fn());
    mediaQueryListMock = createMediaQueryListMock(false, () => vi.fn());
    documentElementMock = createDocumentElementMock(() => vi.fn());
    translocoServiceMock = { setActiveLang: vi.fn() };
    authSessionServiceMock = { isAuthenticated: signal(false) };
    networkServiceMock = { isOnline: signal(true) };
    preferencesDataAccessMock = {
      getPreferences: vi
        .fn()
        .mockResolvedValue(userPreferencesFixtures.default),
      updatePreferences: vi
        .fn()
        .mockResolvedValue(userPreferencesFixtures.default),
    };

    vi.stubGlobal('localStorage', localStorageMock);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mediaQueryListMock));
    Object.defineProperty(document, 'documentElement', {
      value: documentElementMock,
      configurable: true,
    });
    windowAddEventListenerSpy = vi.spyOn(window, 'addEventListener');
    // Deliberately not 'en'/'hu' so system-language resolution deterministically
    // falls through to DEFAULT_LANGUAGE unless a test opts in with stubSystemLanguage.
    stubSystemLanguage('de-DE');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(createService()).toBeTruthy();
  });

  it('should not touch storage, DOM, or transloco before init() is called', () => {
    const service = createService();

    expect(service.theme()).toBe('light');
    expect(service.language()).toBe('system');
    expect(service.dateFormat()).toBe('DD-MM-YYYY');
    expect(documentElementMock.classList.toggle).not.toHaveBeenCalled();
    expect(translocoServiceMock.setActiveLang).not.toHaveBeenCalled();
  });

  describe('defaults and language resolution', () => {
    it('should default the stored choice to system and resolve it to an available language', async () => {
      stubSystemLanguage('en-US');
      storeItems({});
      const service = createService();

      await service.init();

      expect(service.theme()).toBe('light');
      expect(service.language()).toBe('system');
      expect(service.dateFormat()).toBe('DD-MM-YYYY');
      expect(translocoServiceMock.setActiveLang).toHaveBeenCalledWith('en');
    });

    it('should fall back to DEFAULT_LANGUAGE when the system language is not available', async () => {
      stubSystemLanguage('de-DE');
      storeItems({});
      const service = createService();

      await service.init();

      expect(service.language()).toBe('system');
      expect(translocoServiceMock.setActiveLang).toHaveBeenCalledWith('hu');
    });
  });

  it('should apply the stored preferences blob on init()', async () => {
    storeItems({
      'user-preferences': JSON.stringify({
        theme: 'dark',
        language: 'en',
        dateFormat: 'YYYY-MM-DD',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    });
    const service = createService();

    await service.init();

    expect(service.theme()).toBe('dark');
    expect(service.language()).toBe('en');
    expect(service.dateFormat()).toBe('YYYY-MM-DD');
    expect(documentElementMock.classList.toggle).toHaveBeenCalledWith(
      'dark',
      true,
    );
    expect(translocoServiceMock.setActiveLang).toHaveBeenCalledWith('en');
  });

  it('should fall back to defaults when the stored blob is corrupt JSON', async () => {
    storeItems({ 'user-preferences': '{not-json' });
    const service = createService();

    await service.init();

    expect(service.theme()).toBe('light');
    expect(service.language()).toBe('system');
    expect(service.dateFormat()).toBe('DD-MM-YYYY');
  });

  it('should reject an invalid theme value and fall back to defaults', async () => {
    storeItems({
      'user-preferences': JSON.stringify({
        theme: 'invalid',
        language: 'en',
        dateFormat: 'DD-MM-YYYY',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    });
    const service = createService();

    await service.init();

    expect(service.theme()).toBe('light');
  });

  describe('legacy key migration', () => {
    it('should migrate all three legacy keys into the unified key and remove them', async () => {
      storeItems({
        theme: 'dark',
        'user-lang': 'en',
        setttings: 'YYYY-MM-DD',
      });
      const service = createService();

      await service.init();

      expect(service.theme()).toBe('dark');
      expect(service.language()).toBe('en');
      expect(service.dateFormat()).toBe('YYYY-MM-DD');

      const setItem = localStorageMock.setItem as ReturnType<typeof vi.fn>;
      const migratedCall = setItem.mock.calls.find(
        ([key]) => key === 'user-preferences',
      );
      const migratedValue = JSON.parse(migratedCall?.[1] as string);
      expect(migratedValue).toMatchObject({
        theme: 'dark',
        language: 'en',
        dateFormat: 'YYYY-MM-DD',
        isSynced: true,
      });

      const removeItem = localStorageMock.removeItem as ReturnType<
        typeof vi.fn
      >;
      expect(removeItem).toHaveBeenCalledWith('theme');
      expect(removeItem).toHaveBeenCalledWith('user-lang');
      expect(removeItem).toHaveBeenCalledWith('setttings');
    });

    it('should migrate partial legacy keys, defaulting language to system and dateFormat', async () => {
      storeItems({ theme: 'dark' });
      const service = createService();

      await service.init();

      expect(service.theme()).toBe('dark');
      expect(service.language()).toBe('system');
      expect(service.dateFormat()).toBe('DD-MM-YYYY');
    });

    it('should prefer the unified key over legacy keys when both are present', async () => {
      storeItems({
        'user-preferences': JSON.stringify({
          theme: 'light',
          language: 'hu',
          dateFormat: 'DD-MM-YYYY',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
        theme: 'dark',
        'user-lang': 'en',
      });
      const service = createService();

      await service.init();

      expect(service.theme()).toBe('light');
      expect(service.language()).toBe('hu');
    });
  });

  describe('setters (guest, local-only)', () => {
    it('should update theme, apply the DOM class, and persist', async () => {
      storeItems({});
      const service = createService();
      await service.init();

      service.setTheme('dark');

      expect(service.theme()).toBe('dark');
      expect(documentElementMock.classList.toggle).toHaveBeenCalledWith(
        'dark',
        true,
      );
      const setItem = localStorageMock.setItem as ReturnType<typeof vi.fn>;
      const persisted = JSON.parse(
        setItem.mock.calls[setItem.mock.calls.length - 1][1] as string,
      );
      expect(persisted.theme).toBe('dark');
      expect(new Date(persisted.updatedAt).getTime()).not.toBeNaN();
    });

    it('should update language, notify transloco, and persist', async () => {
      storeItems({});
      const service = createService();
      await service.init();

      service.setLanguage('en');

      expect(service.language()).toBe('en');
      expect(translocoServiceMock.setActiveLang).toHaveBeenCalledWith('en');
    });

    it('should update dateFormat and persist', async () => {
      storeItems({});
      const service = createService();
      await service.init();

      service.setDateFormat('YYYY-MM-DD');

      expect(service.dateFormat()).toBe('YYYY-MM-DD');
    });

    it('should not attempt a remote sync for an unauthenticated guest', async () => {
      storeItems({});
      const service = createService();
      await service.init();

      service.setTheme('dark');
      await vi.waitFor(() => expect(service.theme()).toBe('dark'));

      expect(
        preferencesDataAccessMock.updatePreferences,
      ).not.toHaveBeenCalled();
    });
  });

  it('should re-apply dark class on system preference change while theme is system', async () => {
    storeItems({
      'user-preferences': JSON.stringify({
        theme: 'system',
        language: 'hu',
        dateFormat: 'DD-MM-YYYY',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    });
    const service = createService();
    await service.init();

    const addSpy = mediaQueryListMock.addEventListener as ReturnType<
      typeof vi.fn
    >;
    const [, listener] = addSpy.mock.calls[0] ?? [];
    (mediaQueryListMock as { matches: boolean }).matches = true;
    listener?.(new Event('change'));

    expect(documentElementMock.classList.toggle).toHaveBeenCalledWith(
      'dark',
      true,
    );
  });

  it('should ignore system preference change when theme is not system', async () => {
    storeItems({
      'user-preferences': JSON.stringify({
        theme: 'dark',
        language: 'hu',
        dateFormat: 'DD-MM-YYYY',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    });
    const service = createService();
    await service.init();

    (
      documentElementMock.classList.toggle as ReturnType<typeof vi.fn>
    ).mockClear();

    const addSpy = mediaQueryListMock.addEventListener as ReturnType<
      typeof vi.fn
    >;
    const [, listener] = addSpy.mock.calls[0] ?? [];
    listener?.(new Event('change'));

    expect(documentElementMock.classList.toggle).not.toHaveBeenCalled();
  });

  describe('language "system" live tracking', () => {
    it('should re-resolve the active language when the browser language changes while choice is system', async () => {
      stubSystemLanguage('de-DE');
      storeItems({
        'user-preferences': JSON.stringify({
          theme: 'light',
          language: 'system',
          dateFormat: 'DD-MM-YYYY',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
      });
      const service = createService();
      await service.init();
      expect(translocoServiceMock.setActiveLang).toHaveBeenCalledWith('hu');

      stubSystemLanguage('en-US');
      languagechangeListener()?.();

      expect(translocoServiceMock.setActiveLang).toHaveBeenCalledWith('en');
      expect(service.language()).toBe('system');
    });

    it('should ignore a browser language change when the choice is not system', async () => {
      storeItems({
        'user-preferences': JSON.stringify({
          theme: 'light',
          language: 'en',
          dateFormat: 'DD-MM-YYYY',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
      });
      const service = createService();
      await service.init();
      translocoServiceMock.setActiveLang.mockClear();

      stubSystemLanguage('hu-HU');
      languagechangeListener()?.();

      expect(translocoServiceMock.setActiveLang).not.toHaveBeenCalled();
    });
  });

  describe('sync on login/session-restore', () => {
    it('should apply the server value when it is newer than local', async () => {
      storeItems({
        'user-preferences': JSON.stringify({
          theme: 'light',
          language: 'hu',
          dateFormat: 'DD-MM-YYYY',
          updatedAt: '2020-01-01T00:00:00.000Z',
        }),
      });
      const serverPrefs = {
        theme: 'dark' as const,
        language: 'en',
        dateFormat: 'YYYY-MM-DD',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      preferencesDataAccessMock.getPreferences.mockResolvedValue(serverPrefs);

      const service = createService();
      await service.init();

      authSessionServiceMock.isAuthenticated.set(true);
      TestBed.flushEffects();

      await vi.waitFor(() => expect(service.theme()).toBe('dark'));
      expect(service.language()).toBe('en');
      expect(service.dateFormat()).toBe('YYYY-MM-DD');
      expect(
        preferencesDataAccessMock.updatePreferences,
      ).not.toHaveBeenCalled();
    });

    it('should push local to the server with a fresh timestamp when local is newer', async () => {
      storeItems({
        'user-preferences': JSON.stringify({
          theme: 'dark',
          language: 'en',
          dateFormat: 'YYYY-MM-DD',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
      });
      preferencesDataAccessMock.getPreferences.mockResolvedValue(
        userPreferencesFixtures.default, // epoch-zero updatedAt - older than local
      );
      preferencesDataAccessMock.updatePreferences.mockImplementation(
        async (dto) => dto,
      );

      const service = createService();
      await service.init();

      authSessionServiceMock.isAuthenticated.set(true);
      TestBed.flushEffects();

      await vi.waitFor(() =>
        expect(preferencesDataAccessMock.updatePreferences).toHaveBeenCalled(),
      );
      const pushedDto =
        preferencesDataAccessMock.updatePreferences.mock.calls[0][0];
      expect(pushedDto.theme).toBe('dark');
      expect(pushedDto.updatedAt).not.toBe('2026-01-01T00:00:00.000Z');
      expect(new Date(pushedDto.updatedAt).getTime()).toBeGreaterThan(
        new Date('2026-01-01T00:00:00.000Z').getTime(),
      );
    });

    it('should push local with a fresh timestamp (not clobber-able by a later fresh device) when both sides are untouched', async () => {
      // Both local and server are the untouched, epoch-zero sentinel default -
      // this is the exact scenario that would let a second, genuinely fresh
      // device silently overwrite a first device's real synced choice if the
      // pushed timestamp weren't freshly stamped here.
      storeItems({});
      preferencesDataAccessMock.getPreferences.mockResolvedValue(
        userPreferencesFixtures.default,
      );
      preferencesDataAccessMock.updatePreferences.mockImplementation(
        async (dto) => dto,
      );

      const service = createService();
      await service.init();

      authSessionServiceMock.isAuthenticated.set(true);
      TestBed.flushEffects();

      await vi.waitFor(() =>
        expect(preferencesDataAccessMock.updatePreferences).toHaveBeenCalled(),
      );
      const pushedDto =
        preferencesDataAccessMock.updatePreferences.mock.calls[0][0];
      expect(new Date(pushedDto.updatedAt).getTime()).toBeGreaterThan(0);
    });

    it('should mark unsynced when the push fails', async () => {
      storeItems({
        'user-preferences': JSON.stringify({
          theme: 'dark',
          language: 'en',
          dateFormat: 'YYYY-MM-DD',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
      });
      preferencesDataAccessMock.getPreferences.mockResolvedValue(
        userPreferencesFixtures.default,
      );
      preferencesDataAccessMock.updatePreferences.mockRejectedValue(
        new Error('network error'),
      );

      const service = createService();
      await service.init();

      authSessionServiceMock.isAuthenticated.set(true);
      TestBed.flushEffects();

      await vi.waitFor(() => {
        const setItem = localStorageMock.setItem as ReturnType<typeof vi.fn>;
        const last = JSON.parse(
          setItem.mock.calls[setItem.mock.calls.length - 1][1] as string,
        );
        expect(last.isSynced).toBe(false);
      });
    });

    it('should keep working from local, unchanged, when the backend is unreachable', async () => {
      storeItems({
        'user-preferences': JSON.stringify({
          theme: 'dark',
          language: 'en',
          dateFormat: 'YYYY-MM-DD',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
      });
      preferencesDataAccessMock.getPreferences.mockRejectedValue(
        new Error('network error'),
      );

      const service = createService();
      await service.init();

      authSessionServiceMock.isAuthenticated.set(true);
      TestBed.flushEffects();
      await vi.waitFor(() =>
        expect(preferencesDataAccessMock.getPreferences).toHaveBeenCalled(),
      );

      expect(service.theme()).toBe('dark');
      expect(
        preferencesDataAccessMock.updatePreferences,
      ).not.toHaveBeenCalled();
    });
  });

  describe('in-session sync (case 3)', () => {
    it('should push an optimistic change to the backend while online and authenticated', async () => {
      storeItems({});
      const service = createService();
      await service.init();
      authSessionServiceMock.isAuthenticated.set(true);
      TestBed.flushEffects();
      await vi.waitFor(() =>
        expect(preferencesDataAccessMock.getPreferences).toHaveBeenCalled(),
      );
      preferencesDataAccessMock.updatePreferences.mockClear();
      preferencesDataAccessMock.updatePreferences.mockImplementation(
        async (dto) => dto,
      );

      service.setTheme('dark');

      await vi.waitFor(() =>
        expect(preferencesDataAccessMock.updatePreferences).toHaveBeenCalled(),
      );
    });

    it('should mark unsynced without calling the backend while offline', async () => {
      storeItems({});
      networkServiceMock.isOnline.set(false);
      const service = createService();
      await service.init();
      authSessionServiceMock.isAuthenticated.set(true);
      TestBed.flushEffects();

      service.setTheme('dark');
      await vi.waitFor(() => {
        const setItem = localStorageMock.setItem as ReturnType<typeof vi.fn>;
        const last = JSON.parse(
          setItem.mock.calls[setItem.mock.calls.length - 1][1] as string,
        );
        expect(last.isSynced).toBe(false);
      });

      expect(
        preferencesDataAccessMock.updatePreferences,
      ).not.toHaveBeenCalled();
    });
  });

  describe('reconnect push', () => {
    it('should push pending changes when coming back online while authenticated', async () => {
      storeItems({});
      networkServiceMock.isOnline.set(false);
      const service = createService();
      await service.init();
      authSessionServiceMock.isAuthenticated.set(true);
      TestBed.flushEffects();

      service.setTheme('dark');
      await vi.waitFor(() => {
        const setItem = localStorageMock.setItem as ReturnType<typeof vi.fn>;
        const last = JSON.parse(
          setItem.mock.calls[setItem.mock.calls.length - 1][1] as string,
        );
        expect(last.isSynced).toBe(false);
      });

      preferencesDataAccessMock.updatePreferences.mockImplementation(
        async (dto) => dto,
      );
      networkServiceMock.isOnline.set(true);
      TestBed.flushEffects();

      await vi.waitFor(() =>
        expect(preferencesDataAccessMock.updatePreferences).toHaveBeenCalled(),
      );
    });

    it('should not push when coming back online as a guest', async () => {
      storeItems({});
      networkServiceMock.isOnline.set(false);
      const service = createService();
      await service.init();

      service.setTheme('dark');
      networkServiceMock.isOnline.set(true);
      TestBed.flushEffects();
      await vi.waitFor(() => expect(service.theme()).toBe('dark'));

      expect(
        preferencesDataAccessMock.updatePreferences,
      ).not.toHaveBeenCalled();
    });
  });

  it('should no-op init() on the server (no localStorage/DOM access)', async () => {
    const service = createService('server');

    await expect(service.init()).resolves.toBeUndefined();
    expect(service.theme()).toBe('light');
  });
});
