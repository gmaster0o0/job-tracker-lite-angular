import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AppDatePipe } from './app-date.pipe';
import { SettingsService } from '../services/settings.service';
import { createLocalStorageMock } from '@job-tracker-lite-angular/testing';

describe('AppDatePipe', () => {
  let localStorageMock: Storage;

  const createPipe = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [AppDatePipe, SettingsService],
    });
    return TestBed.inject(AppDatePipe);
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

  it('formats using default DD-MM-YYYY', () => {
    (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      null,
    );
    const pipe = createPipe();
    const out = pipe.transform('2023-05-13');
    expect(out).toBe('13-05-2023');
  });

  it('respects custom format from settings', () => {
    (localStorageMock.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      'MM/dd/yyyy',
    );
    const pipe = createPipe();
    const out = pipe.transform('2023-05-13');
    expect(out).toBe('05/13/2023');
  });
});
