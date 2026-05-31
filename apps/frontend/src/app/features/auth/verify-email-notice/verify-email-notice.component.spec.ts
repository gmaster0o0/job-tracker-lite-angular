import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import {
  createAuthDataAccessMock,
  createBackendError,
  validVerificationEmailCredentials,
} from '@job-tracker-lite-angular/testing';
import { vi } from 'vitest';
import { VerifyEmailNoticeComponent } from './verify-email-notice.component';
import { VerifyEmailNoticeHarness } from './verify-email-notice.harness';

describe('VerifyEmailNoticeComponent', () => {
  let harness: VerifyEmailNoticeHarness;
  let authDataAccessMock: ReturnType<typeof createAuthDataAccessMock>;

  beforeEach(async () => {
    authDataAccessMock = createAuthDataAccessMock();
    vi.spyOn(authDataAccessMock, 'sendVerificationEmail');

    await TestBed.configureTestingModule({
      imports: [VerifyEmailNoticeComponent, getTranslocoModule()],
      providers: [
        provideRouter([]),
        {
          provide: AuthDataAccessService,
          useValue: authDataAccessMock,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(VerifyEmailNoticeComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      VerifyEmailNoticeHarness,
    );
  });

  it('should enable submit button when form is valid', async () => {
    expect(await harness.isSubmitDisabled()).toBe(true);

    await harness.setEmail(validVerificationEmailCredentials.email);

    expect(await harness.isSubmitDisabled()).toBe(false);
  });

  it('should call sendVerificationEmail on submit', async () => {
    await harness.setEmail(validVerificationEmailCredentials.email);
    await harness.submit();

    expect(authDataAccessMock.sendVerificationEmail).toHaveBeenCalledWith(
      validVerificationEmailCredentials,
    );
  });

  it('should show error message on failure', async () => {
    vi.mocked(authDataAccessMock.sendVerificationEmail).mockRejectedValue(
      createBackendError('unknown', 500),
    );

    await harness.setEmail(validVerificationEmailCredentials.email);
    await harness.submit();

    const alert = await harness.getErrorAlert();
    expect(alert).not.toBeNull();
    expect(await alert?.getDescription()).toContain(
      'Unable to send verification email right now',
    );
  });
});
