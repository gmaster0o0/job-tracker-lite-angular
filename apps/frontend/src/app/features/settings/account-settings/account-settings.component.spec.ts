import { createNotificationServiceMock } from '@job-tracker-lite-angular/testing';
import { NotificationService } from '@job-tracker-lite-angular/frontend-data-access';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { AuthService } from '../../auth/auth.service';

describe('AccountSettingsComponent', () => {
  let fixture: ComponentFixture<AccountSettingsComponent>;
  let component: AccountSettingsComponent;
  let harness: AccountSettingsHarness;
  let authDataAccessMock: ReturnType<typeof createAuthDataAccessMock>;
  let authServiceMock: { handleLogout: ReturnType<typeof vi.fn> };
  let notificationMock: ReturnType<typeof createNotificationServiceMock>;

  async function setup(
    accountSettings = accountSettingsFixtures.default,
  ): Promise<void> {
    TestBed.resetTestingModule();

    authDataAccessMock = createAuthDataAccessMock({
      accountSettings,
    });

    vi.spyOn(authDataAccessMock, 'requestEmailChange');
    vi.spyOn(authDataAccessMock, 'cancelEmailChange');
    vi.spyOn(authDataAccessMock, 'changePassword');

    authServiceMock = {
      handleLogout: vi.fn(async () => undefined),
    };
    notificationMock = createNotificationServiceMock();
    vi.spyOn(notificationMock, 'success');

    await TestBed.configureTestingModule({
      imports: [AccountSettingsComponent, getTranslocoModule()],
      providers: [
        {
          provide: NotificationService,
          useValue: notificationMock,
        },
        {
          provide: AuthDataAccessService,
          useValue: authDataAccessMock,
        },
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSettingsComponent);
    component = fixture.componentInstance;
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      AccountSettingsHarness,
    );
  }

  beforeEach(async () => {
    await setup();
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
    expect(notificationMock.success).toHaveBeenCalledWith(
      'Verification email sent to your new address.',
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
    expect(notificationMock.success).toHaveBeenCalledWith(
      'Password updated successfully.',
    );
  });

  it('logs out and redirects after successful password change', async () => {
    const authService = TestBed.inject(AuthService) as any;

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
    expect(authService.handleLogout).toHaveBeenCalledWith({
      passwordChanged: true,
    });
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

    const form = component['changePasswordForm'] as any;

    expect(form.currentPassword().touched()).toBe(false);
    expect(form.currentPassword().dirty()).toBe(false);
    expect(form.newPassword().touched()).toBe(false);
    expect(form.newPassword().dirty()).toBe(false);
    expect(form.confirmPassword().touched()).toBe(false);
    expect(form.confirmPassword().dirty()).toBe(false);
  });

  describe('pending email change', () => {
    beforeEach(async () => {
      await setup(accountSettingsFixtures.withPendingEmail);
    });

    it('does not show a cancel button when there is no pending email change', async () => {
      await setup(accountSettingsFixtures.default);
      expect(await harness.hasCancelEmailChangeButton()).toBe(false);
    });

    it('shows the cancel button when an email change is pending', async () => {
      expect(await harness.hasCancelEmailChangeButton()).toBe(true);
    });

    it('cancels the pending request immediately on click, without confirmation', async () => {
      await harness.clickCancelEmailChangeButton();

      expect(authDataAccessMock.cancelEmailChange).toHaveBeenCalled();
      expect(notificationMock.success).toHaveBeenCalledWith(
        'Pending email change request canceled.',
      );
      expect(component['accountSettings']().pendingEmail).toBeNull();
    });

    it('shows a backend error when cancellation fails', async () => {
      vi.spyOn(authDataAccessMock, 'cancelEmailChange').mockRejectedValue(
        new Error('boom'),
      );

      await harness.clickCancelEmailChangeButton();

      expect(component['cancelEmailChangeError']()).toBe('unknown');
    });
  });

  describe('resend cooldown', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows an enabled Save button when there is no pending email change', async () => {
      await harness.setNewEmail(changeEmailRequestFixtures.valid.newEmail);

      expect(await harness.getChangeEmailButtonText()).toContain('Save');
      expect(await harness.isChangeEmailButtonDisabled()).toBe(false);
    });

    it('prefills the field and shows a disabled countdown while the cooldown is active', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:30.000Z')); // 30s left of the 60s cooldown

      await setup(accountSettingsFixtures.withPendingEmail);
      await vi.advanceTimersByTimeAsync(350); // let the debounce settle

      expect(await harness.getNewEmailValue()).toBe(
        accountSettingsFixtures.withPendingEmail.pendingEmail,
      );
      expect(await harness.getChangeEmailButtonText()).toContain(
        'Resend (30s)',
      );
      expect(await harness.isChangeEmailButtonDisabled()).toBe(true);
    });

    it('shows an enabled Resend button once the cooldown has elapsed', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:01:30.000Z')); // 30s past the 60s cooldown

      await setup(accountSettingsFixtures.withPendingEmail);
      await vi.advanceTimersByTimeAsync(350);

      expect(await harness.getChangeEmailButtonText()).toContain('Resend');
      expect(await harness.getChangeEmailButtonText()).not.toContain('(');
      expect(await harness.isChangeEmailButtonDisabled()).toBe(false);
    });

    it('switches to an enabled Save button when the typed address differs from the pending target', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:30.000Z'));

      await setup(accountSettingsFixtures.withPendingEmail);
      await vi.advanceTimersByTimeAsync(350);

      await harness.setNewEmail('someone-else@example.com');
      await vi.advanceTimersByTimeAsync(350);

      expect(await harness.getChangeEmailButtonText()).toContain('Save');
      expect(await harness.isChangeEmailButtonDisabled()).toBe(false);
    });

    it('re-derives the cooldown from the server sentAt, not a client timer, after typing away and back', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:30.000Z')); // 30s left of cooldown

      await setup(accountSettingsFixtures.withPendingEmail);
      await vi.advanceTimersByTimeAsync(350);

      // Detour: type a different address, then type the pending one back.
      await harness.setNewEmail('someone-else@example.com');
      await vi.advanceTimersByTimeAsync(350);
      await harness.setNewEmail(
        accountSettingsFixtures.withPendingEmail.pendingEmail as string,
      );
      await vi.advanceTimersByTimeAsync(350);

      // Still disabled, with a cooldown derived from the server's sentAt
      // timestamp (a couple of seconds under the original 30s, from the
      // elapsed debounce waits above) -- not reset to the full 60s by a
      // client-side timer that would've restarted on the detour.
      const text = await harness.getChangeEmailButtonText();
      const match = text.match(/Resend \((\d+)s\)/);
      expect(match).not.toBeNull();
      const remainingSeconds = Number(match?.[1]);
      expect(remainingSeconds).toBeGreaterThan(0);
      expect(remainingSeconds).toBeLessThanOrEqual(30);
      expect(await harness.isChangeEmailButtonDisabled()).toBe(true);
    });
  });
});
