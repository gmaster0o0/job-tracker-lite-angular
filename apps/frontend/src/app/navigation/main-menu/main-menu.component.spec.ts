import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { MainMenuComponent } from './main-menu.component';
import { MainMenuHarness } from './main-menu.harness';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  createAuthSessionServiceMock,
  authSessionFixtures,
} from '@job-tracker-lite-angular/testing';
import { NavigationService } from '../navigation.service';

const noop = () => {
  //emptsy function for matchMedia event listeners
};

function mockMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: noop,
      removeListener: noop,
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => true,
    }),
  });
}

describe('MainMenuComponent', () => {
  beforeAll(() => mockMatchMedia());

  async function setup(isAuthenticated: boolean) {
    const authSessionMock = createAuthSessionServiceMock(() => vi.fn(), {
      loadSession: async () =>
        isAuthenticated
          ? authSessionFixtures.authenticated
          : authSessionFixtures.guest,
    });
    authSessionMock.isAuthenticated = signal(isAuthenticated);

    await TestBed.configureTestingModule({
      imports: [MainMenuComponent, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: AuthSessionService, useValue: authSessionMock },
        NavigationService,
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(MainMenuComponent);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      MainMenuHarness,
    );
    return { harness };
  }

  describe('guest menu', () => {
    it('shows settings/about/login/register only', async () => {
      const { harness } = await setup(false);

      expect(await harness.getLinkLabels()).toEqual([
        'Settings',
        'About',
        'Login',
        'Register',
      ]);
      expect(await harness.hasLinkTo('/jobs')).toBe(false);
      expect(await harness.hasLinkTo('/profile')).toBe(false);
      expect(await harness.hasLinkTo('/auth/login')).toBe(true);
      expect(await harness.hasLinkTo('/auth/register')).toBe(true);
    });
  });

  describe('authenticated menu', () => {
    it('shows jobs/profile/settings/about only', async () => {
      const { harness } = await setup(true);

      expect(await harness.getLinkLabels()).toEqual([
        'Jobs',
        'Profile',
        'Settings',
        'About',
      ]);
      expect(await harness.hasLinkTo('/jobs')).toBe(true);
      expect(await harness.hasLinkTo('/profile')).toBe(true);
      expect(await harness.hasLinkTo('/auth/login')).toBe(false);
      expect(await harness.hasLinkTo('/auth/register')).toBe(false);
    });
  });
});
