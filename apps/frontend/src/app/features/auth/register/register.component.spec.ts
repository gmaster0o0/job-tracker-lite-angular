import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthDataAccessService } from '@job-tracker-lite-angular/frontend-data-access';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';
import {
  createAuthDataAccessMock,
  validRegisterCredentials,
  createBackendError,
} from '@job-tracker-lite-angular/testing';
import { RegisterComponent } from './register.component';
import { RegisterHarness } from './register.harness';
import { vi } from 'vitest';

describe('RegisterComponent', () => {
  let harness: RegisterHarness;
  let authDataAccessMock: ReturnType<typeof createAuthDataAccessMock>;
  let router: Router;

  beforeEach(async () => {
    authDataAccessMock = createAuthDataAccessMock();
    vi.spyOn(authDataAccessMock, 'signUp');

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, getTranslocoModule()],
      providers: [
        provideRouter([]),
        {
          provide: AuthDataAccessService,
          useValue: authDataAccessMock,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RegisterComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      RegisterHarness,
    );
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl');
  });

  it('should enable submit button when form is valid', async () => {
    expect(await harness.isSubmitDisabled()).toBe(true);

    await harness.setName(validRegisterCredentials.name);
    await harness.setEmail(validRegisterCredentials.email);
    await harness.setPassword(validRegisterCredentials.password);
    await harness.setConfirmPassword(validRegisterCredentials.confirmPassword);

    expect(await harness.isSubmitDisabled()).toBe(false);
  });

  it('should call signUp and navigate on success', async () => {
    await harness.setName(validRegisterCredentials.name);
    await harness.setEmail(validRegisterCredentials.email);
    await harness.setPassword(validRegisterCredentials.password);
    await harness.setConfirmPassword(validRegisterCredentials.confirmPassword);
    await harness.submit();

    expect(authDataAccessMock.signUp).toHaveBeenCalledWith({
      name: validRegisterCredentials.name,
      email: validRegisterCredentials.email,
      password: validRegisterCredentials.password,
      confirmPassword: validRegisterCredentials.confirmPassword,
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith(
      `/auth/verify-email-notice?email=${encodeURIComponent(
        validRegisterCredentials.email,
      )}`,
    );
  });

  it('should show error message on failure', async () => {
    vi.mocked(authDataAccessMock.signUp).mockRejectedValue(
      createBackendError('user_already_exists', 409),
    );

    await harness.setName(validRegisterCredentials.name);
    await harness.setEmail(validRegisterCredentials.email);
    await harness.setPassword(validRegisterCredentials.password);
    await harness.setConfirmPassword(validRegisterCredentials.confirmPassword);
    await harness.submit();

    const alert = await harness.getErrorAlert();
    expect(alert).not.toBeNull();
    expect(await alert?.getDescription()).toContain(
      'An account with this email already exists',
    );
  });
});
