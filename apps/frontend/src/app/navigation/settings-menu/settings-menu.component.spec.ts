import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, expect, it, beforeAll, vi } from 'vitest';
import { SettingsMenuComponent } from './settings-menu.component';
import { SettingsMenuHarness } from './settings-menu.harness';
import { provideRouter } from '@angular/router';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { AuthSessionService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  authSessionFixtures,
  createAuthSessionServiceMock,
} from '@job-tracker-lite-angular/testing';
import { NavigationService } from '../navigation.service';

describe('SettingsMenuComponent', () => {
  const noop = () => {
    // empty function for matchMedia event listeners
  };

  function mockMatchMedia() {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: noop,
        removeListener: noop,
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: () => false,
      })),
    });
  }

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
      imports: [SettingsMenuComponent, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: AuthSessionService, useValue: authSessionMock },
        NavigationService,
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SettingsMenuComponent);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      SettingsMenuHarness,
    );
    return { harness };
  }

  it('shows only preferences for guests', async () => {
    const { harness } = await setup(false);

    const items = await harness.getMenuItemsText();
    expect(items.length).toBe(1);
    expect(items.some((item) => item.includes('Preferences'))).toBe(true);
    expect(items.some((item) => item.includes('Account'))).toBe(false);
    expect(items.some((item) => item.includes('Privacy'))).toBe(false);

    const preferencesLink = await harness.getMenuItemLink('Preferences');
    expect(preferencesLink).toContain('/settings/preferences');
  });

  it('shows all settings items for authenticated users', async () => {
    const { harness } = await setup(true);

    const items = await harness.getMenuItemsText();
    expect(items.length).toBe(3);
    expect(items.some((item) => item.includes('Preferences'))).toBe(true);
    expect(items.some((item) => item.includes('Account'))).toBe(true);
    expect(items.some((item) => item.includes('Privacy'))).toBe(true);

    const accountLink = await harness.getMenuItemLink('Account');
    expect(accountLink).toContain('/settings/account');

    const privacyLink = await harness.getMenuItemLink('Privacy');
    expect(privacyLink).toContain('/settings/privacy');
  });
});
