import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { preferencesInitGuard } from './preferences-init.guard';
import { UserPreferencesService } from '@job-tracker-lite-angular/frontend-data-access';
import { createUserPreferencesServiceMock } from '@job-tracker-lite-angular/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('preferencesInitGuard', () => {
  let preferencesServiceMock: ReturnType<
    typeof createUserPreferencesServiceMock
  >;

  beforeEach(() => {
    preferencesServiceMock = createUserPreferencesServiceMock(() => vi.fn());

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: UserPreferencesService,
          useValue: preferencesServiceMock,
        },
      ],
    });
  });

  it('initializes preferences before allowing navigation', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      preferencesInitGuard({} as never, {} as never),
    );

    expect(preferencesServiceMock.init).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('allows navigation even if preferences were never previously constructed', async () => {
    // The guard's inject() call must be what constructs the service - there
    // is no earlier TestBed.inject(UserPreferencesService) call anywhere in
    // this test, mirroring the real bootstrap path where nothing else
    // touches the service before this guard runs.
    const result = await TestBed.runInInjectionContext(() =>
      preferencesInitGuard({} as never, {} as never),
    );

    expect(result).toBe(true);
  });
});
