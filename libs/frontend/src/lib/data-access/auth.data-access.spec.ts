import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { AuthDataAccessService } from './auth.data-access';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  validLoginCredentials,
  validForgotPasswordCredentials,
  validResetPasswordCredentials,
  validVerificationEmailCredentials,
} from '@job-tracker-lite-angular/testing';

describe('AuthDataAccessService', () => {
  let service: AuthDataAccessService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), AuthDataAccessService],
    });

    service = TestBed.inject(AuthDataAccessService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call sign-in endpoint with credentials and then fetch session', async () => {
    const signInPromise = service.signIn(validLoginCredentials);

    const signInReq = httpMock.expectOne('/api/auth/sign-in/email');
    expect(signInReq.request.method).toBe('POST');
    expect(signInReq.request.withCredentials).toBe(true);
    expect(signInReq.request.body).toEqual(validLoginCredentials);
    signInReq.flush({ ok: true });
    await Promise.resolve();

    const sessionReq = httpMock.expectOne({
      method: 'GET',
      url: '/api/auth/get-session',
    });
    expect(sessionReq.request.withCredentials).toBe(true);
    sessionReq.flush(null);

    await expect(signInPromise).resolves.toBeNull();
  });

  it('should call request-password-reset endpoint with redirect URL', async () => {
    const requestResetPromise = service.requestPasswordReset(
      validForgotPasswordCredentials,
    );

    const resetReq = httpMock.expectOne('/api/auth/request-password-reset');
    expect(resetReq.request.method).toBe('POST');
    expect(resetReq.request.withCredentials).toBe(true);
    expect(resetReq.request.body).toEqual({
      email: validForgotPasswordCredentials.email,
      redirectTo: `${window.location.origin}/auth/reset-password?language=${validForgotPasswordCredentials.language}`,
    });
    resetReq.flush({ status: true });

    await expect(requestResetPromise).resolves.toBeUndefined();
  });

  it('should call reset-password endpoint with token and new password', async () => {
    const resetPasswordPromise = service.resetPassword(
      validResetPasswordCredentials,
    );

    const resetReq = httpMock.expectOne('/api/auth/reset-password');
    expect(resetReq.request.method).toBe('POST');
    expect(resetReq.request.withCredentials).toBe(true);
    expect(resetReq.request.body).toEqual({
      token: validResetPasswordCredentials.token,
      newPassword: validResetPasswordCredentials.newPassword,
    });
    resetReq.flush({ status: true });

    await expect(resetPasswordPromise).resolves.toBeUndefined();
  });

  it('should call send-verification-email endpoint with redirect URL', async () => {
    const sendVerificationPromise = service.sendVerificationEmail(
      validVerificationEmailCredentials,
    );

    const verificationReq = httpMock.expectOne(
      '/api/auth/send-verification-email',
    );
    expect(verificationReq.request.method).toBe('POST');
    expect(verificationReq.request.withCredentials).toBe(true);
    expect(verificationReq.request.body).toEqual({
      email: validVerificationEmailCredentials.email,
      callbackURL: `${window.location.origin}/auth/verify-email?language=${validVerificationEmailCredentials.language}`,
    });
    verificationReq.flush({ status: true });

    await expect(sendVerificationPromise).resolves.toBeUndefined();
  });
});
