import { createNotificationServiceMock } from '@job-tracker-lite-angular/testing';
import { NotificationService } from '@job-tracker-lite-angular/frontend-data-access';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import {
  createAuthDataAccessMock,
  createBackendError,
  validForgotPasswordCredentials,
} from '@job-tracker-lite-angular/testing';
import { ForgotPasswordHarness } from './forgot-password.harness';

describe('ForgotPasswordComponent', () => {
  let harness: ForgotPasswordHarness;
  let authDataAccessMock: ReturnType<typeof createAuthDataAccessMock>;
  let notificationMock: ReturnType<typeof createNotificationServiceMock>;
  beforeEach(async () => {
    authDataAccessMock = createAuthDataAccessMock();
    vi.spyOn(authDataAccessMock, 'requestPasswordReset');
    notificationMock = createNotificationServiceMock();
    vi.spyOn(notificationMock, 'success');
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, getTranslocoModule()],
      providers: [
        {
          provide: NotificationService,
          useValue: notificationMock,
        },
        {
          provide: AuthDataAccessService,
          useValue: authDataAccessMock,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ForgotPasswordHarness,
    );
  });

  it('should enable submit button when form is valid', async () => {
    expect(await harness.isSubmitDisabled()).toBe(true);

    await harness.setEmail(validForgotPasswordCredentials.email);

    expect(await harness.isSubmitDisabled()).toBe(false);
  });

  it('should call requestPasswordReset on submit', async () => {
    await harness.setEmail(validForgotPasswordCredentials.email);
    await harness.submit();

    expect(authDataAccessMock.requestPasswordReset).toHaveBeenCalledWith(
      validForgotPasswordCredentials,
    );
    expect(notificationMock.success).toHaveBeenCalledTimes(1);
    expect(notificationMock.success).toHaveBeenCalledWith(
      'If an account exists for this email, a reset link has been sent.',
    );
  });

  it('should show error message on failure', async () => {
    vi.mocked(authDataAccessMock.requestPasswordReset).mockRejectedValue(
      createBackendError('unknown', 500),
    );

    await harness.setEmail(validForgotPasswordCredentials.email);
    await harness.submit();

    const alert = await harness.getErrorAlert();
    expect(alert).not.toBeNull();
    expect(await alert?.getDescription()).toContain(
      'Unable to send reset link',
    );
  });
});
