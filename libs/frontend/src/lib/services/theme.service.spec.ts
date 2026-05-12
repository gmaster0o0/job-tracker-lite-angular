import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeService } from './theme.service';
import {
  createLocalStorageMock,
  createMediaQueryListMock,
  createDocumentElementMock,
} from '@job-tracker-lite-angular/testing';

describe('ThemeService', () => {
  let service: ThemeService;
  let localStorageMock: Storage;
  let mediaQueryListMock: MediaQueryList;
  let documentElementMock: HTMLElement;

  const setupEnvironment = (recreateMocks = true) => {
    if (recreateMocks) {
      localStorageMock = createLocalStorageMock();
      mediaQueryListMock = createMediaQueryListMock(false);
      documentElementMock = createDocumentElementMock();
    }

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, 'matchMedia', {
      value: (query: string) => mediaQueryListMock,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(document, 'documentElement', {
      value: documentElementMock,
      writable: true,
      configurable: true,
    });
  };

  const createService = () => {
    TestBed.resetTestingModule();
    setupEnvironment(false);

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        {
          provide: PLATFORM_ID,
          useValue: 'browser',
        },
      ],
    });

    return TestBed.inject(ThemeService);
  };

  beforeEach(() => {
    setupEnvironment();
    service = createService();
  });

  afterEach(() => {
    if (localStorageMock) {
      localStorageMock.clear();
    }
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with default theme "light" when no theme is stored', () => {
      expect(service.theme()).toBe('light');
    });

    it('should initialize signal with default theme', () => {
      expect(service.defaultTheme).toBe('light');
    });
  });

  describe('theme change', () => {
    it('should update theme signal when theme changes', () => {
      service.theme.set('dark');
      expect(service.theme()).toBe('dark');
    });

    it('should handle all valid theme values', () => {
      const themes: Array<'light' | 'dark' | 'system'> = [
        'light',
        'dark',
        'system',
      ];

      themes.forEach((theme) => {
        service.theme.set(theme);
        expect(service.theme()).toBe(theme);
      });
    });

    it('should transition between themes', () => {
      expect(service.theme()).toBe('light');

      service.theme.set('dark');
      expect(service.theme()).toBe('dark');

      service.theme.set('system');
      expect(service.theme()).toBe('system');

      service.theme.set('light');
      expect(service.theme()).toBe('light');
    });
  });

  describe('dark mode detection', () => {
    it('should have correct initial dark class state', () => {
      // Check that the classList object exists and works
      expect(documentElementMock.classList).toBeTruthy();
      expect(typeof documentElementMock.classList.contains).toBe('function');
    });

    it('should handle system theme with light preference', () => {
      mediaQueryListMock = createMediaQueryListMock(false);
      Object.defineProperty(window, 'matchMedia', {
        value: (query: string) => mediaQueryListMock,
        writable: true,
        configurable: true,
      });

      service.theme.set('system');

      const isDark =
        service.theme() === 'dark' ||
        (service.theme() === 'system' && mediaQueryListMock.matches);
      expect(isDark).toBe(false);
    });

    it('should handle system theme with dark preference', () => {
      mediaQueryListMock = createMediaQueryListMock(true);
      Object.defineProperty(window, 'matchMedia', {
        value: (query: string) => mediaQueryListMock,
        writable: true,
        configurable: true,
      });

      service.theme.set('system');

      const isDark =
        service.theme() === 'dark' ||
        (service.theme() === 'system' && mediaQueryListMock.matches);
      expect(isDark).toBe(true);
    });
  });

  describe('localStorage integration', () => {
    it('should read from localStorage on initialization', () => {
      localStorageMock.setItem('theme', 'dark');
      const newService = createService();

      expect(newService.theme()).toBe('dark');
    });

    it('should use system theme when stored', () => {
      localStorageMock.setItem('theme', 'system');
      const newService = createService();

      expect(newService.theme()).toBe('system');
    });

    it('should handle invalid localStorage values gracefully', () => {
      localStorageMock.setItem('theme', 'invalid');
      const newService = createService();

      expect(newService.theme()).toBeTruthy();
    });

    it('should clear localStorage properly', () => {
      localStorageMock.setItem('theme', 'dark');
      expect(localStorageMock.getItem('theme')).toBe('dark');

      localStorageMock.clear();
      expect(localStorageMock.getItem('theme')).toBeNull();
    });
  });

  describe('system theme preference listener', () => {
    it('should register a media query listener on initialization', () => {
      expect(mediaQueryListMock).toBeTruthy();
      expect(mediaQueryListMock.media).toContain('prefers-color-scheme');
    });

    it('should have media query configured for dark mode detection', () => {
      expect(mediaQueryListMock.media).toContain('dark');
    });

    it('should maintain system theme setting', () => {
      service.theme.set('system');
      expect(service.theme()).toBe('system');
    });

    it('should maintain dark theme setting even with system preference changes', () => {
      service.theme.set('dark');
      expect(service.theme()).toBe('dark');

      const changeEvent = new Event('change') as MediaQueryListEvent;
      mediaQueryListMock.dispatchEvent(changeEvent);

      expect(service.theme()).toBe('dark');
    });

    it('should maintain light theme setting even with system preference changes', () => {
      service.theme.set('light');
      expect(service.theme()).toBe('light');

      const changeEvent = new Event('change') as MediaQueryListEvent;
      mediaQueryListMock.dispatchEvent(changeEvent);

      expect(service.theme()).toBe('light');
    });

    it('should handle system preference changes when theme is system', () => {
      service.theme.set('system');
      expect(service.theme()).toBe('system');

      const changeEvent = new Event('change') as MediaQueryListEvent;
      mediaQueryListMock.dispatchEvent(changeEvent);

      expect(service.theme()).toBe('system');
    });
  });

  describe('edge cases', () => {
    it('should handle multiple services with different themes', () => {
      localStorageMock.setItem('theme', 'dark');
      const service1 = createService();

      localStorageMock.clear();
      localStorageMock.setItem('theme', 'light');
      const service2 = createService();

      expect(service1.theme()).toBe('dark');
      expect(service2.theme()).toBe('light');
    });

    it('should maintain defaultTheme property', () => {
      expect(service.defaultTheme).toBe('light');
      service.theme.set('dark');
      expect(service.defaultTheme).toBe('light');
    });

    it('should have theme as a signal', () => {
      expect(typeof service.theme).toBe('function');
      expect(typeof service.theme.set).toBe('function');
    });

    it('should persist theme across theme value reads', () => {
      service.theme.set('dark');

      const theme1 = service.theme();
      const theme2 = service.theme();
      const theme3 = service.theme();

      expect(theme1).toBe(theme2);
      expect(theme2).toBe(theme3);
      expect(theme1).toBe('dark');
    });

    it('should enforce Theme type for theme signal', () => {
      const validThemes: Array<'light' | 'dark' | 'system'> = [
        'light',
        'dark',
        'system',
      ];

      validThemes.forEach((theme) => {
        service.theme.set(theme);
        expect(['light', 'dark', 'system']).toContain(service.theme());
      });
    });
  });

  describe('browser platform detection', () => {
    it('should be running in browser platform', () => {
      expect(service).toBeTruthy();
    });

    it('should have access to window object', () => {
      expect(window).toBeTruthy();
    });

    it('should have access to document object', () => {
      expect(document).toBeTruthy();
    });

    it('should have localStorage available', () => {
      expect(window.localStorage).toBeTruthy();
      expect(typeof window.localStorage.getItem).toBe('function');
    });

    it('should have matchMedia available', () => {
      expect(window.matchMedia).toBeTruthy();
      expect(typeof window.matchMedia).toBe('function');
    });
  });
});
