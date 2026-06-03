import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountSettingsComponent } from './account-settings.component';
import { AccountSettingsHarness } from './account-settings.harness';
import { AuthDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { NavigationService } from '../../../navigation/navigation.service';
import {
  accountSettingsFixtures,
  changeEmailRequestFixtures,
  changePasswordFixtures,
  createAuthDataAccessMock,
} from '@job-tracker-lite-angular/testing';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import { vi } from 'vitest';

describe('AccountSettingsComponent', () => {
  let fixture: ComponentFixture<AccountSettingsComponent>;
  let component: AccountSettingsComponent;
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
        {
          provide: NavigationService,
          useValue: {
            handleLogout: vi.fn(async () => undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSettingsComponent);
    component = fixture.componentInstance;
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      AccountSettingsHarness,
    );
  });

  it('loads and shows current email as readonly', async () => {
    expect(await harness.getCurrentEmail()).toBe(
      accountSettingsFixtures.default.email,
    );
    expect(await harness.isCurrentEmailReadonly()).toBe(true);
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

  it('logs out and redirects after successful password change', async () => {
    const navigationService = TestBed.inject(NavigationService) as any;

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
    expect(navigationService.handleLogout).toHaveBeenCalled();
  });

  it('resets password form state after successful change', async () => {
    await harness.setCurrentPassword(
      changePasswordFixtures.valid.currentPassword,
    );
    await harness.setNewPassword(changePasswordFixtures.valid.newPassword);
    await harness.setConfirmPassword(
      changePasswordFixtures.valid.confirmPassword,
    );
    await harness.submitChangePassword();

    await fixture.whenStable();
    const form = component['changePasswordForm'] as any;

    expect(form.currentPassword().touched()).toBe(false);
    expect(form.currentPassword().dirty()).toBe(false);
    expect(form.newPassword().touched()).toBe(false);
    expect(form.newPassword().dirty()).toBe(false);
    expect(form.confirmPassword().touched()).toBe(false);
    expect(form.confirmPassword().dirty()).toBe(false);
  });
});
