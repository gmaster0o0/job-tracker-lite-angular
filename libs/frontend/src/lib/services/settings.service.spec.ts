import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SettingsService } from './settings.service';
import { createLocalStorageMock } from '@job-tracker-lite-angular/testing';

describe('SettingsService', () => {
  let localStorageMock: Storage;

  const createService = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [SettingsService] });
    return TestBed.inject(SettingsService);
  };

  beforeEach(() => {
    localStorageMock = createLocalStorageMock(() => vi.fn());
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(createService()).toBeTruthy();
  });

  it('should default to DD-MM-YYYY when nothing is stored', () => {
    (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      null,
    );
    const svc = createService();
    expect(svc.dateFormat).toBe('DD-MM-YYYY');
  });

  it('should read stored date format on init', () => {
    (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      'MM/dd/yyyy',
    );
    const svc = createService();
    expect(svc.dateFormat).toBe('MM/dd/yyyy');
  });

  it('should persist date format when set', () => {
    const svc = createService();
    svc.dateFormat = 'yyyy-MM-dd';

    expect(
      (localStorageMock.setItem as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBeGreaterThan(0);
    // ensure getter returns new value
    expect(svc.dateFormat).toBe('yyyy-MM-dd');
  });
});
