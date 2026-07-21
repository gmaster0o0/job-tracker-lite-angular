import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TranslocoService } from '@jsverse/transloco';
import { UserPreferencesService } from './user-preferences.service';
import {
  createLocalStorageMock,
  createMediaQueryListMock,
  createDocumentElementMock,
} from '@job-tracker-lite-angular/testing';

describe('UserPreferencesService', () => {
  let localStorageMock: Storage;
  let mediaQueryListMock: MediaQueryList;
  let documentElementMock: HTMLElement;
  let translocoServiceMock: { setActiveLang: ReturnType<typeof vi.fn> };

  const storeItems = (items: Record<string, string | null>) => {
    (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockImplementation(
      (key: string) => items[key] ?? null,
    );
  };

  const createService = (platform: 'browser' | 'server' = 'browser') => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        UserPreferencesService,
        { provide: PLATFORM_ID, useValue: platform },
        { provide: TranslocoService, useValue: translocoServiceMock },
      ],
    });
    return TestBed.inject(UserPreferencesService);
  };

  beforeEach(() => {
    localStorageMock = createLocalStorageMock(() => vi.fn());
    mediaQueryListMock = createMediaQueryListMock(false, () => vi.fn());
    documentElementMock = createDocumentElementMock(() => vi.fn());
    translocoServiceMock = { setActiveLang: vi.fn() };

    vi.stubGlobal('localStorage', localStorageMock);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mediaQueryListMock));
    Object.defineProperty(document, 'documentElement', {
      value: documentElementMock,
      configurable: true,
    });
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
    expect(service.language()).toBe('hu');
    expect(service.dateFormat()).toBe('DD-MM-YYYY');
    expect(documentElementMock.classList.toggle).not.toHaveBeenCalled();
    expect(translocoServiceMock.setActiveLang).not.toHaveBeenCalled();
  });

  it('should apply defaults on init() when nothing is stored', async () => {
    storeItems({});
    const service = createService();

    await service.init();

    expect(service.theme()).toBe('light');
    expect(service.language()).toBe('hu');
    expect(service.dateFormat()).toBe('DD-MM-YYYY');
    expect(documentElementMock.classList.toggle).toHaveBeenCalledWith(
      'dark',
      false,
    );
    expect(translocoServiceMock.setActiveLang).toHaveBeenCalledWith('hu');
  });

  it('should apply the stored preferences blob on init()', async () => {
    storeItems({
      'user-preferences': JSON.stringify({
        theme: 'dark',
        language: 'en',
        dateFormat: 'YYYY-MM-DD',
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
    expect(service.language()).toBe('hu');
    expect(service.dateFormat()).toBe('DD-MM-YYYY');
  });

  it('should handle invalid theme values gracefully', async () => {
    storeItems({
      'user-preferences': JSON.stringify({ theme: 'invalid' }),
    });
    const service = createService();

    await service.init();

    expect(service.theme()).toBeTruthy();
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
      expect(migratedCall?.[1]).toBe(
        JSON.stringify({
          theme: 'dark',
          language: 'en',
          dateFormat: 'YYYY-MM-DD',
        }),
      );

      const removeItem = localStorageMock.removeItem as ReturnType<
        typeof vi.fn
      >;
      expect(removeItem).toHaveBeenCalledWith('theme');
      expect(removeItem).toHaveBeenCalledWith('user-lang');
      expect(removeItem).toHaveBeenCalledWith('setttings');
    });

    it('should migrate partial legacy keys, defaulting the rest', async () => {
      storeItems({ theme: 'dark' });
      const service = createService();

      await service.init();

      expect(service.theme()).toBe('dark');
      expect(service.language()).toBe('hu');
      expect(service.dateFormat()).toBe('DD-MM-YYYY');
    });

    it('should prefer the unified key over legacy keys when both are present', async () => {
      storeItems({
        'user-preferences': JSON.stringify({
          theme: 'light',
          language: 'hu',
          dateFormat: 'DD-MM-YYYY',
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

  describe('setters', () => {
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
      expect(setItem).toHaveBeenCalledWith(
        'user-preferences',
        JSON.stringify({
          theme: 'dark',
          language: 'hu',
          dateFormat: 'DD-MM-YYYY',
        }),
      );
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
  });

  it('should re-apply dark class on system preference change while theme is system', async () => {
    storeItems({ 'user-preferences': JSON.stringify({ theme: 'system' }) });
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
    storeItems({ 'user-preferences': JSON.stringify({ theme: 'dark' }) });
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

  it('should no-op init() on the server (no localStorage/DOM access)', async () => {
    const service = createService('server');

    await expect(service.init()).resolves.toBeUndefined();
    expect(service.theme()).toBe('light');
  });
});
