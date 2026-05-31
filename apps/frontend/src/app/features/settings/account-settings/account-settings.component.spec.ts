import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { AccountSettingsComponent } from './account-settings.component';
import { AccountSettingsHarness } from './account-settings.harness';
import { AuthDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import {
  accountSettingsFixtures,
  changeEmailRequestFixtures,
  changePasswordFixtures,
  createAuthDataAccessMock,
} from '@job-tracker-lite-angular/testing';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { vi } from 'vitest';

describe('AccountSettingsComponent', () => {
  let harness: AccountSettingsHarness;
  let authDataAccessMock: ReturnType<typeof createAuthDataAccessMock>;

  beforeEach(async () => {
    authDataAccessMock = createAuthDataAccessMock({
      accountSettings: accountSettingsFixtures.default,
    });

    vi.spyOn(authDataAccessMock, 'requestEmailChange');
    vi.spyOn(authDataAccessMock, 'changePassword');

    await TestBed.configureTestingModule({
      imports: [AccountSettingsComponent, getTranslocoModule()],
      providers: [
        {
          provide: AuthDataAccessService,
          useValue: authDataAccessMock,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AccountSettingsComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      AccountSettingsHarness,
    );
  });

  it('loads and shows current email as readonly', async () => {
    expect(await harness.getCurrentEmail()).toBe(
      accountSettingsFixtures.default.email,
    );
    expect(await harness.isCurrentEmailDisabled()).toBe(true);
  });

  it('submits change email form', async () => {
    await harness.setNewEmail(changeEmailRequestFixtures.valid.newEmail);
    await harness.submitChangeEmail();

    expect(authDataAccessMock.requestEmailChange).toHaveBeenCalledWith(
      changeEmailRequestFixtures.valid,
    );
  });

  it('toggles new password visibility', async () => {
    expect(await harness.getNewPasswordInputType()).toBe('password');

    await harness.toggleNewPasswordVisibility();

    expect(await harness.getNewPasswordInputType()).toBe('text');
  });

  it('submits change password form', async () => {
    await harness.setCurrentPassword(
      changePasswordFixtures.valid.currentPassword,
    );
    await harness.setNewPassword(changePasswordFixtures.valid.newPassword);
    await harness.setConfirmPassword(
      changePasswordFixtures.valid.confirmPassword,
    );
    await harness.submitChangePassword();

    expect(authDataAccessMock.changePassword).toHaveBeenCalledWith(
      changePasswordFixtures.valid,
    );
  });
});
