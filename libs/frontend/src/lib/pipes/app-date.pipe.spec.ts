import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TranslocoService } from '@jsverse/transloco';
import { AppDatePipe } from './app-date.pipe';
import { UserPreferencesService } from '../services/user-preferences.service';
import { createLocalStorageMock } from '@job-tracker-lite-angular/testing';

describe('AppDatePipe', () => {
  let localStorageMock: Storage;

  const createPipe = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AppDatePipe,
        UserPreferencesService,
        { provide: TranslocoService, useValue: { setActiveLang: vi.fn() } },
      ],
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
    const pipe = createPipe();
    const out = pipe.transform('2023-05-13');
    expect(out).toBe('13-05-2023');
  });

  it('respects a custom date format set on preferences', () => {
    const pipe = createPipe();
    TestBed.inject(UserPreferencesService).setDateFormat('MM/dd/yyyy');

    const out = pipe.transform('2023-05-13');
    expect(out).toBe('05/13/2023');
  });
});
