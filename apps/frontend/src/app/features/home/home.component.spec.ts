import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HomeComponent } from './home.component';
import { HomeHarness } from './home.harness';
import { provideRouter } from '@angular/router';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  authSessionFixtures,
  createAuthSessionServiceMock,
} from '@job-tracker-lite-angular/testing';
import { vi } from 'vitest';

describe('HomeComponent', () => {
  async function setup(isAuthenticated: boolean): Promise<HomeHarness> {
    const authSessionMock = createAuthSessionServiceMock(() => vi.fn(), {
      loadSession: async () =>
        isAuthenticated
          ? authSessionFixtures.authenticated
          : authSessionFixtures.guest,
    });
    authSessionMock.isAuthenticated = signal(isAuthenticated);

    await TestBed.configureTestingModule({
      imports: [HomeComponent, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: AuthSessionService, useValue: authSessionMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomeComponent);
    return TestbedHarnessEnvironment.harnessForFixture(fixture, HomeHarness);
  }

  it('should create', async () => {
    const harness = await setup(false);
    expect(harness).toBeTruthy();
  });

  it('should render guest landing for guests', async () => {
    const harness = await setup(false);

    expect(await harness.hasHeroSection()).toBe(true);
    expect(await harness.hasPublicProfiles()).toBe(true);
    expect(await harness.hasLandingDashboard()).toBe(false);
  });

  it('should render dashboard for authenticated users', async () => {
    const harness = await setup(true);

    expect(await harness.hasLandingDashboard()).toBe(true);
  });

  it('should render all dashboard cards for authenticated users', async () => {
    const harness = await setup(true);
    const dashboard = await harness.getLandingDashboardHarness();

    expect(dashboard).toBeTruthy();
    expect(await dashboard?.getHomeCardCount()).toBe(3);
  });

  it('should show guest cta links for guests', async () => {
    const harness = await setup(false);
    const hero = await harness.getHeroHarness();

    expect(hero).toBeTruthy();
    expect(await hero?.getRegisterLink()).toBe('/auth/register');
    expect(await hero?.getLoginLink()).toBe('/auth/login');
  });

  it('should render public profile list for guests', async () => {
    const harness = await setup(false);
    const profiles = await harness.getPublicProfilesHarness();

    expect(profiles).toBeTruthy();
    expect((await profiles?.getProfileNames())?.length).toBe(3);
  });
});
