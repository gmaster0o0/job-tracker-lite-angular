import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthDataAccessService } from './auth.data-access';

describe('AuthDataAccessService', () => {
  let service: AuthDataAccessService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthDataAccessService],
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
    const signInPromise = service.signIn({
      email: 'user@example.com',
      password: 'Password1',
    });

    const signInReq = httpMock.expectOne('/api/auth/sign-in/email');
    expect(signInReq.request.method).toBe('POST');
    expect(signInReq.request.withCredentials).toBe(true);
    expect(signInReq.request.body).toEqual({
      email: 'user@example.com',
      password: 'Password1',
    });
    signInReq.flush({ ok: true });

    const sessionReq = httpMock.expectOne('/api/auth/get-session');
    expect(sessionReq.request.method).toBe('GET');
    expect(sessionReq.request.withCredentials).toBe(true);
    sessionReq.flush(null);

    await expect(signInPromise).resolves.toBeNull();
  });
});
