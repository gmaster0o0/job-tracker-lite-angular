import { RouterTestingHarness } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { PrivacySettingsComponent } from './privacy-settings.component';
import { PrivacyPolicyHarness } from './privacy-policy/privacy-policy.harness';
import { CookiePolicyHarness } from './cookie-policy/cookie-policy.harness';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { ProfileDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  createProfileDataAccessMock,
  userProfileFixtures,
} from '@job-tracker-lite-angular/testing';
import { vi } from 'vitest';

/**
 * Opening or closing a policy dialog settles across several turns: the router
 * navigation re-creates PrivacySettingsComponent, brn-dialog installs its
 * `[state]` effect from an `afterNextRender`, and the CDK overlay is attached
 * (or torn down) a microtask after that. A bare `whenStable()` has nothing to
 * wait on until that render pass has created the effect, so change detection
 * has to be pumped.
 */
const SETTLE_TIMEOUT_MS = 5_000;
const SETTLE_INTERVAL_MS = 10;

async function waitUntil(
  fixture: ComponentFixture<unknown>,
  condition: () => boolean | Promise<boolean>,
  description: string,
): Promise<void> {
  const deadline = Date.now() + SETTLE_TIMEOUT_MS;

  for (;;) {
    fixture.detectChanges();
    await fixture.whenStable();

    if (await condition()) return;

    if (Date.now() >= deadline) {
      throw new Error(
        `Timed out after ${SETTLE_TIMEOUT_MS}ms waiting for ${description}.`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, SETTLE_INTERVAL_MS));
  }
}

describe('PrivacySettingsComponent (routing integration)', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [getTranslocoModule()],
      providers: [
        {
          provide: ProfileDataAccessService,
          useValue: createProfileDataAccessMock(
            { profile: userProfileFixtures.johnDoe },
            vi.fn,
          ),
        },
        provideRouter([
          {
            path: 'settings',
            children: [
              {
                path: 'privacy',
                children: [
                  { path: '', component: PrivacySettingsComponent },
                  {
                    path: 'privacy-policy',
                    component: PrivacySettingsComponent,
                  },
                  {
                    path: 'cookie-policy',
                    component: PrivacySettingsComponent,
                  },
                ],
              },
            ],
          },
        ]),
      ],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  it('opens the privacy policy dialog when navigating directly to the url', async () => {
    await harness.navigateByUrl(
      '/settings/privacy/privacy-policy',
      PrivacySettingsComponent,
    );

    const policyHarness = await TestbedHarnessEnvironment.harnessForFixture(
      harness.fixture,
      PrivacyPolicyHarness,
    );

    await waitUntil(
      harness.fixture,
      () => policyHarness.isDialogVisible(),
      'the privacy policy dialog to open',
    );

    expect(await policyHarness.isDialogVisible()).toBe(true);
  });

  it('opens the cookie policy dialog when navigating directly to the url', async () => {
    await harness.navigateByUrl(
      '/settings/privacy/cookie-policy',
      PrivacySettingsComponent,
    );

    const policyHarness = await TestbedHarnessEnvironment.harnessForFixture(
      harness.fixture,
      CookiePolicyHarness,
    );

    await waitUntil(
      harness.fixture,
      () => policyHarness.isDialogVisible(),
      'the cookie policy dialog to open',
    );

    expect(await policyHarness.isDialogVisible()).toBe(true);
  });

  it('opens the privacy dialog after clicking the open button from the base route', async () => {
    await harness.navigateByUrl('/settings/privacy', PrivacySettingsComponent);

    const policyHarness = await TestbedHarnessEnvironment.harnessForFixture(
      harness.fixture,
      PrivacyPolicyHarness,
    );

    await policyHarness.clickOpenButton();

    await waitUntil(
      harness.fixture,
      () => router.url === '/settings/privacy/privacy-policy',
      'the router to navigate to /settings/privacy/privacy-policy',
    );
    await waitUntil(
      harness.fixture,
      () => policyHarness.isDialogVisible(),
      'the privacy policy dialog to open',
    );

    expect(router.url).toBe('/settings/privacy/privacy-policy');
    expect(await policyHarness.isDialogVisible()).toBe(true);
  });

  it('opens the cookie dialog after clicking the open button from the base route', async () => {
    await harness.navigateByUrl('/settings/privacy', PrivacySettingsComponent);

    const policyHarness = await TestbedHarnessEnvironment.harnessForFixture(
      harness.fixture,
      CookiePolicyHarness,
    );

    await policyHarness.clickOpenButton();

    await waitUntil(
      harness.fixture,
      () => router.url === '/settings/privacy/cookie-policy',
      'the router to navigate to /settings/privacy/cookie-policy',
    );
    await waitUntil(
      harness.fixture,
      () => policyHarness.isDialogVisible(),
      'the cookie policy dialog to open',
    );

    expect(router.url).toBe('/settings/privacy/cookie-policy');
    expect(await policyHarness.isDialogVisible()).toBe(true);
  });

  it('navigates back to /settings/privacy when the privacy dialog is closed', async () => {
    await harness.navigateByUrl(
      '/settings/privacy/privacy-policy',
      PrivacySettingsComponent,
    );

    const policyHarness = await TestbedHarnessEnvironment.harnessForFixture(
      harness.fixture,
      PrivacyPolicyHarness,
    );

    // The close button lives in the overlay, and the harness locator throws
    // rather than waits when it is not there yet.
    await waitUntil(
      harness.fixture,
      () => policyHarness.isDialogVisible(),
      'the privacy policy dialog to open',
    );

    await policyHarness.close();

    await waitUntil(
      harness.fixture,
      () => router.url === '/settings/privacy',
      'the router to navigate back to /settings/privacy',
    );
    await waitUntil(
      harness.fixture,
      async () => !(await policyHarness.isDialogVisible()),
      'the privacy policy dialog to be torn down',
    );

    expect(router.url).toBe('/settings/privacy');
    expect(await policyHarness.isDialogVisible()).toBe(false);
  });

  it('navigates back to /settings/privacy when the cookie dialog is closed', async () => {
    await harness.navigateByUrl(
      '/settings/privacy/cookie-policy',
      PrivacySettingsComponent,
    );

    const policyHarness = await TestbedHarnessEnvironment.harnessForFixture(
      harness.fixture,
      CookiePolicyHarness,
    );

    await waitUntil(
      harness.fixture,
      () => policyHarness.isDialogVisible(),
      'the cookie policy dialog to open',
    );

    await policyHarness.close();

    await waitUntil(
      harness.fixture,
      () => router.url === '/settings/privacy',
      'the router to navigate back to /settings/privacy',
    );
    await waitUntil(
      harness.fixture,
      async () => !(await policyHarness.isDialogVisible()),
      'the cookie policy dialog to be torn down',
    );

    expect(router.url).toBe('/settings/privacy');
    expect(await policyHarness.isDialogVisible()).toBe(false);
  });
});
