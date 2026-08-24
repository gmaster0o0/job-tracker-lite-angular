import { MockRoute } from '../registry';
import { authSessionFixtures } from '@job-tracker-lite-angular/testing';

export const authRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/api\/auth\/get-session$/,
    // The `loading` delay is applied by domain in setupMockApi, so this does
    // not need to special-case it.
    resolve: ({ state }) => ({ status: 200, body: state.session }),
  },
  {
    // better-auth namespaces the credential endpoints: the app posts to
    // /api/auth/sign-in/email, not /api/auth/sign-in.
    method: 'POST',
    pattern: /^\/api\/auth\/sign-in\/email$/,
    resolve: ({ state, scenarios }) => {
      if (scenarios.auth === 'invalidCredentials') {
        return {
          status: 401,
          body: {
            statusCode: 401,
            errorCode: 'INVALID_EMAIL_OR_PASSWORD',
            message: 'Invalid email or password',
          },
        };
      }
      if (scenarios.auth === 'unverifiedEmail') {
        return {
          status: 403,
          body: {
            statusCode: 403,
            errorCode: 'EMAIL_NOT_VERIFIED',
            message: 'Email not verified',
          },
        };
      }
      // Both of these are declared on AuthScenario and listed as logged-out
      // scenarios, so they are reachable from the login form. Falling through
      // to the success path signed the visitor in instead, and a spec
      // asserting an error would fail claiming the message never appeared.
      if (scenarios.auth === 'rateLimited') {
        return { status: 429, body: { message: 'Too many requests' } };
      }
      if (scenarios.auth === 'serverError') {
        return { status: 500, body: { message: 'Server error' } };
      }
      state.session = structuredClone(authSessionFixtures.authenticated);
      return { status: 200, body: state.session };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/auth\/sign-up\/email$/,
    resolve: ({ state, scenarios }) => {
      if (scenarios.auth === 'emailTaken') {
        // BetterAuthExceptionFilter answers with { statusCode, errorCode,
        // message }. Without the errorCode the interceptor falls back to
        // internal_server_error and the form renders a translation key that
        // does not exist instead of the "already registered" copy.
        return {
          status: 409,
          body: {
            statusCode: 409,
            errorCode: 'USER_ALREADY_EXISTS',
            message: 'User already exists',
          },
        };
      }
      if (scenarios.auth === 'serverError') {
        return { status: 500, body: { message: 'Server error' } };
      }
      state.session = structuredClone(authSessionFixtures.authenticated);
      return { status: 200, body: state.session };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/auth\/sign-out$/,
    resolve: ({ state }) => {
      state.session = null;
      return { status: 200, body: { success: true } };
    },
  },
  {
    // Password reset request. The real endpoint answers 200 whether or not the
    // address exists, so the UI cannot be used to enumerate accounts.
    method: 'POST',
    pattern: /^\/api\/auth\/request-password-reset$/,
    resolve: ({ scenarios }) => {
      if (scenarios.auth === 'rateLimited') {
        return { status: 429, body: { message: 'Too many requests' } };
      }
      if (scenarios.auth === 'serverError') {
        return { status: 500, body: { message: 'Server error' } };
      }
      return { status: 200, body: { status: true } };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/auth\/reset-password$/,
    resolve: ({ scenarios }) => {
      if (scenarios.auth === 'invalidCredentials') {
        return {
          status: 400,
          body: { message: 'Invalid or expired token' },
        };
      }
      return { status: 200, body: { status: true } };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/auth\/send-verification-email$/,
    resolve: ({ scenarios }) => {
      if (scenarios.auth === 'rateLimited') {
        return { status: 429, body: { message: 'Too many requests' } };
      }
      return { status: 200, body: { status: true } };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/auth\/change-password$/,
    resolve: ({ scenarios }) => {
      if (scenarios.auth === 'invalidCredentials') {
        return { status: 400, body: { message: 'Invalid password' } };
      }
      return { status: 200, body: { status: true } };
    },
  },
];
