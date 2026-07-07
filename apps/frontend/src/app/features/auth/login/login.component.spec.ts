import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
  AccountDataAccessService,
  AuthDataAccessService,
} from '@job-tracker-lite-angular/frontend-data-access';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import {
  accountDeletionStatusFixtures,
  createAuthDataAccessMock,
  validLoginCredentials,
  createBackendError,
} from '@job-tracker-lite-angular/testing';
import { LoginComponent } from './login.component';
import { LoginHarness } from './login.harness';
import { vi } from 'vitest';

describe('LoginComponent', () => {
  let harness: LoginHarness;
  let authDataAccessMock: ReturnType<typeof createAuthDataAccessMock>;
  let accountDataAccessMock: {
    getDeletionStatus: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    authDataAccessMock = createAuthDataAccessMock();
    accountDataAccessMock = {
      getDeletionStatus: vi
        .fn()
        .mockResolvedValue(accountDeletionStatusFixtures.active),
    };
    vi.spyOn(authDataAccessMock, 'signIn');

    await TestBed.configureTestingModule({
      imports: [LoginComponent, getTranslocoModule()],
      providers: [
        provideRouter([]),
        {
          provide: AuthDataAccessService,
          useValue: authDataAccessMock,
        },
        {
          provide: AccountDataAccessService,
          useValue: accountDataAccessMock,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      LoginHarness,
    );
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  it('should enable submit button when form is valid', async () => {
    expect(await harness.isSubmitDisabled()).toBe(true);

    await harness.setEmail(validLoginCredentials.email);
    await harness.setPassword(validLoginCredentials.password);

    expect(await harness.isSubmitDisabled()).toBe(false);
  });

  it('should call signIn and navigate on success', async () => {
    await harness.setEmail(validLoginCredentials.email);
    await harness.setPassword(validLoginCredentials.password);
    await harness.submit();

    expect(authDataAccessMock.signIn).toHaveBeenCalledWith(
      validLoginCredentials,
    );
    expect(accountDataAccessMock.getDeletionStatus).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/jobs');
  });

  it('should redirect to delete pending page for pending deletion accounts', async () => {
    accountDataAccessMock.getDeletionStatus.mockResolvedValue(
      accountDeletionStatusFixtures.pending,
    );

    await harness.setEmail(validLoginCredentials.email);
    await harness.setPassword(validLoginCredentials.password);
    await harness.submit();

    expect(router.navigateByUrl).toHaveBeenCalledWith(
      '/privacy/delete-pending',
    );
  });

  it('should show error message on failure', async () => {
    vi.mocked(authDataAccessMock.signIn).mockRejectedValue(
      createBackendError('invalid_email_or_password', 401),
    );

    await harness.setEmail(validLoginCredentials.email);
    await harness.setPassword(validLoginCredentials.password);
    await harness.submit();

    const alert = await harness.getErrorAlert();
    expect(alert).not.toBeNull();
    expect(await alert?.getDescription()).toContain(
      'Invalid email or password',
    );
  });

  it('should redirect to verify email notice when account is not verified', async () => {
    vi.mocked(authDataAccessMock.signIn).mockRejectedValue(
      createBackendError('EMAIL_NOT_VERIFIED', 401),
    );

    await harness.setEmail(validLoginCredentials.email);
    await harness.setPassword(validLoginCredentials.password);
    await harness.submit();

    expect(router.navigateByUrl).toHaveBeenCalledWith(
      `/auth/verify-email-notice?email=${encodeURIComponent(
        validLoginCredentials.email,
      )}`,
    );

    const alert = await harness.getErrorAlert();
    expect(await alert?.isVisible()).toBe(false);
  });
});
