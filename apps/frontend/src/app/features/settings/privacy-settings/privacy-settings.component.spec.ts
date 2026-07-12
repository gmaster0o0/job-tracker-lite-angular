import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { PrivacySettingsComponent } from './privacy-settings.component';
import { PrivacyPolicyHarness } from './privacy-policy/privacy-policy.harness';
import { CookiePolicyHarness } from './cookie-policy/cookie-policy.harness';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { filter } from 'rxjs/operators';

describe('PrivacySettingsComponent (routing integration)', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [getTranslocoModule()],
      providers: [
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
    harness.detectChanges();

    const policyHarness = await TestbedHarnessEnvironment.harnessForFixture(
      harness.fixture,
      PrivacyPolicyHarness,
    );

    expect(await policyHarness.isDialogVisible()).toBe(true);
  });

  it('opens the cookie policy dialog when navigating directly to the url', async () => {
    await harness.navigateByUrl(
      '/settings/privacy/cookie-policy',
      PrivacySettingsComponent,
    );
    harness.detectChanges();

    const policyHarness = await TestbedHarnessEnvironment.harnessForFixture(
      harness.fixture,
      CookiePolicyHarness,
    );

    expect(await policyHarness.isDialogVisible()).toBe(true);
  });

  it('opens the privacy dialog after clicking the open button from the base route', async () => {
    await harness.navigateByUrl('/settings/privacy', PrivacySettingsComponent);
    harness.detectChanges();

    const policyHarness = await TestbedHarnessEnvironment.harnessForFixture(
      harness.fixture,
      PrivacyPolicyHarness,
    );

    const navigationEnd = firstValueFrom(
      router.events.pipe(filter((e) => e instanceof NavigationEnd)),
    );

    await policyHarness.clickOpenButton();

    await navigationEnd;

    harness.detectChanges();

    expect(router.url).toBe('/settings/privacy/privacy-policy');
    expect(await policyHarness.isDialogVisible()).toBe(true);
  });

  it('opens the cookie dialog after clicking the open button from the base route', async () => {
    await harness.navigateByUrl('/settings/privacy', PrivacySettingsComponent);
    harness.detectChanges();

    const policyHarness = await TestbedHarnessEnvironment.harnessForFixture(
      harness.fixture,
      CookiePolicyHarness,
    );

    const navigationEnd = firstValueFrom(
      router.events.pipe(filter((e) => e instanceof NavigationEnd)),
    );

    await policyHarness.clickOpenButton();

    await navigationEnd;

    harness.detectChanges();

    expect(router.url).toBe('/settings/privacy/cookie-policy');
    expect(await policyHarness.isDialogVisible()).toBe(true);
  });

  it('navigates back to /settings/privacy when the privacydialog is closed', async () => {
    await harness.navigateByUrl(
      '/settings/privacy/privacy-policy',
      PrivacySettingsComponent,
    );
    harness.detectChanges();

    const policyHarness = await TestbedHarnessEnvironment.harnessForFixture(
      harness.fixture,
      PrivacyPolicyHarness,
    );

    await policyHarness.close();
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(router.url).toBe('/settings/privacy');
    expect(await policyHarness.isDialogVisible()).toBe(false);
  });

  it('navigates back to /settings/privacy when the cookie dialog is closed', async () => {
    await harness.navigateByUrl(
      '/settings/privacy/cookie-policy',
      PrivacySettingsComponent,
    );
    harness.detectChanges();

    const policyHarness = await TestbedHarnessEnvironment.harnessForFixture(
      harness.fixture,
      CookiePolicyHarness,
    );

    await policyHarness.close();
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(router.url).toBe('/settings/privacy');
    expect(await policyHarness.isDialogVisible()).toBe(false);
  });
});
