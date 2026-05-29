import { TestBed } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import {
  createAuthDataAccessMock,
  createBackendError,
  validResetPasswordCredentials,
} from '@job-tracker-lite-angular/testing';
import { ResetPasswordHarness } from './reset-password.harness';
import { ActivatedRoute } from '@angular/router';

describe('ResetPasswordComponent', () => {
  let harness: ResetPasswordHarness;
  let authDataAccessMock: ReturnType<typeof createAuthDataAccessMock>;
  let router: Router;

  beforeEach(async () => {
    authDataAccessMock = createAuthDataAccessMock();
    vi.spyOn(authDataAccessMock, 'resetPassword');

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, getTranslocoModule()],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({
                token: validResetPasswordCredentials.token,
              }),
            },
          },
        },
        {
          provide: AuthDataAccessService,
          useValue: authDataAccessMock,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ResetPasswordComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      ResetPasswordHarness,
    );
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl');
  });

  it('should enable submit button when form is valid', async () => {
    expect(await harness.isSubmitDisabled()).toBe(true);

    await harness.setNewPassword(validResetPasswordCredentials.newPassword);
    await harness.setConfirmPassword(
      validResetPasswordCredentials.confirmPassword,
    );

    expect(await harness.isSubmitDisabled()).toBe(false);
  });

  it('should call resetPassword and navigate on success', async () => {
    await harness.setNewPassword(validResetPasswordCredentials.newPassword);
    await harness.setConfirmPassword(
      validResetPasswordCredentials.confirmPassword,
    );
    await harness.submit();

    expect(authDataAccessMock.resetPassword).toHaveBeenCalledWith(
      validResetPasswordCredentials,
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });

  it('should show error message on failure', async () => {
    vi.mocked(authDataAccessMock.resetPassword).mockRejectedValue(
      createBackendError('invalid_token', 400),
    );

    await harness.setNewPassword(validResetPasswordCredentials.newPassword);
    await harness.setConfirmPassword(
      validResetPasswordCredentials.confirmPassword,
    );
    await harness.submit();

    const alert = await harness.getErrorAlert();
    expect(alert).not.toBeNull();
    expect(await alert?.getDescription()).toContain('Reset link is invalid');
  });
});
