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
  let localStorageMock: Storage;
  let mediaQueryListMock: MediaQueryList;

  const createService = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: PLATFORM_ID, useValue: 'browser' }],
    });
    return TestBed.inject(ThemeService);
  };

  beforeEach(() => {
    localStorageMock = createLocalStorageMock(() => vi.fn());
    mediaQueryListMock = createMediaQueryListMock(false, () => vi.fn());

    vi.stubGlobal('localStorage', localStorageMock);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mediaQueryListMock));
    Object.defineProperty(document, 'documentElement', {
      value: createDocumentElementMock(() => vi.fn()),
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

  it('should default to light when nothing is stored', () => {
    (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      null,
    );
    expect(createService().theme()).toBe('light');
  });

  it('should read stored dark theme on init', () => {
    (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      'dark',
    );
    expect(createService().theme()).toBe('dark');
  });

  it('should read stored system theme on init', () => {
    (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      'system',
    );
    expect(createService().theme()).toBe('system');
  });

  it('should handle invalid localStorage values gracefully', () => {
    (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      'invalid',
    );
    expect(createService().theme()).toBeTruthy();
  });

  it('should update the theme signal', () => {
    const service = createService();
    service.theme.set('dark');
    expect(service.theme()).toBe('dark');
  });

  it('should accept all valid theme values', () => {
    const service = createService();
    for (const theme of ['light', 'dark', 'system'] as const) {
      service.theme.set(theme);
      expect(service.theme()).toBe(theme);
    }
  });

  it('should not mutate defaultTheme when theme signal changes', () => {
    const service = createService();
    service.theme.set('dark');
    expect(service.defaultTheme).toBe('light');
  });

  it('should persist theme to localStorage when changed', () => {
    const service = createService();
    service.theme.set('dark');

    (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      'dark',
    );
    const newService = createService();
    expect(newService.theme()).toBe('dark');
  });

  it('should keep the theme when system preference change event fires', () => {
    const service = createService();
    service.theme.set('dark');

    const addSpy = mediaQueryListMock.addEventListener as ReturnType<
      typeof vi.fn
    >;
    const [, listener] = addSpy.mock.calls[0] ?? [];
    listener?.(new Event('change'));

    expect(service.theme()).toBe('dark');
  });
});
