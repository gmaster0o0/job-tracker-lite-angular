import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { HealthResponseDto } from '@job-tracker-lite-angular/schemas';
import { SidenavComponent } from './sidenav.component';
import { SidenavHarness } from './sidenav.harness';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import {
  AuthDataAccessService,
  AuthSessionService,
  HealthDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';
import {
  createAuthDataAccessMock,
  createAuthSessionServiceMock,
  createHealthDataAccessMock,
  createMediaQueryListMock,
  healthFixture,
  degradedHealth,
} from '@job-tracker-lite-angular/testing';
import { NavigationService } from '../navigation.service';
import { vi } from 'vitest';

describe('SidenavComponent', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        ...createMediaQueryListMock(false, () => vi.fn()),
        media: query,
      })),
    });
  });

  async function setup(options?: {
    health?: HealthResponseDto | null;
    isLoading?: boolean;
    error?: unknown;
    hasValue?: boolean;
  }) {
    const authSessionMock = createAuthSessionServiceMock(() => () => undefined);
    authSessionMock.isAuthenticated = signal(true);

    await TestBed.configureTestingModule({
      imports: [SidenavComponent, getTranslocoModule()],
      providers: [
        provideRouter([]),
        NavigationService,
        { provide: AuthSessionService, useValue: authSessionMock },
        {
          provide: AuthDataAccessService,
          useValue: createAuthDataAccessMock(),
        },
        {
          provide: HealthDataAccessService,
          useValue: createHealthDataAccessMock(options),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SidenavComponent);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SidenavHarness,
    );

    return { fixture, harness };
  }

  it('should create', async () => {
    const { harness } = await setup();
    expect(harness).toBeTruthy();
  });

  it('should show an operational badge when the health check is ok', async () => {
    const { harness } = await setup({ health: healthFixture });

    expect(await harness.getStatusBadgeText()).toContain('Status');
    expect(await harness.getStatusIconName()).toBe('lucideCircleCheck');
  });

  it('should show the ok badge while the health resource is loading', async () => {
    const { harness } = await setup({
      health: null,
      hasValue: false,
      isLoading: true,
    });

    expect(await harness.getStatusIconName()).toBe('lucideCircleCheck');
  });

  it('should show a warning badge when the health check reports a degraded status', async () => {
    const { harness } = await setup({ health: degradedHealth });

    expect(await harness.getStatusIconName()).toBe('lucideTriangleAlert');
  });

  it('should show a warning badge when the backend is unreachable', async () => {
    const { harness } = await setup({
      health: null,
      hasValue: false,
      isLoading: false,
      error: new HttpErrorResponse({ status: 0 }),
    });

    expect(await harness.getStatusIconName()).toBe('lucideTriangleAlert');
  });
});
