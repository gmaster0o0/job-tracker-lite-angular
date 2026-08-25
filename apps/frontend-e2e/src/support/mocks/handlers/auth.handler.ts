import { MockResponse, MockRoute } from '../registry';
import { authSessionFixtures } from '@job-tracker-lite-angular/testing';
import { AuthScenario } from '../../scenarios';

/**
 * The two transport-level failures every auth endpoint can produce.
 *
 * Both are declared on AuthScenario and listed in LOGGED_OUT_AUTH_SCENARIOS,
 * so every one of these routes is reachable under them from a logged-out
 * page. A route that does not answer them falls through to its success path
 * and the spec fails claiming the error copy never rendered - so this is
 * applied to all of them rather than fixed one route at a time.
 */
function authTransportFailure(scenario: AuthScenario): MockResponse | null {
  if (scenario === 'rateLimited') {
    return { status: 429, body: { message: 'Too many requests' } };
  }
  if (scenario === 'serverError') {
    return { status: 500, body: { message: 'Server error' } };
  }
  return null;
}

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
      const failure = authTransportFailure(scenarios.auth);
      if (failure) return failure;

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
      const failure = authTransportFailure(scenarios.auth);
      if (failure) return failure;

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
    resolve: ({ scenarios }) =>
      authTransportFailure(scenarios.auth) ?? {
        status: 200,
        body: { status: true },
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
      return (
        authTransportFailure(scenarios.auth) ?? {
          status: 200,
          body: { status: true },
        }
      );
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/auth\/send-verification-email$/,
    resolve: ({ scenarios }) =>
      authTransportFailure(scenarios.auth) ?? {
        status: 200,
        body: { status: true },
      },
  },
  {
    method: 'POST',
    pattern: /^\/api\/auth\/change-password$/,
    resolve: ({ scenarios }) => {
      if (scenarios.auth === 'invalidCredentials') {
        return { status: 400, body: { message: 'Invalid password' } };
      }
      return (
        authTransportFailure(scenarios.auth) ?? {
          status: 200,
          body: { status: true },
        }
      );
    },
  },
];
