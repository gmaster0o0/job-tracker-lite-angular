import { MockRoute } from '../registry';
import { authSessionFixtures } from '@job-tracker-lite-angular/testing';

export const authRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/api\/auth\/get-session$/,
    resolve: ({ state, scenarios }) => {
      // simulate network delay for testing loading skeleton if needed
      if (scenarios.auth === 'loading') {
        return { status: 200, body: state.session, delayMs: 2000 };
      }
      return { status: 200, body: state.session };
    },
  },
  {
    // better-auth namespaces the credential endpoints: the app posts to
    // /api/auth/sign-in/email, not /api/auth/sign-in.
    method: 'POST',
    pattern: /^\/api\/auth\/sign-in\/email$/,
    resolve: ({ state, scenarios }) => {
      if (scenarios.auth === 'invalidCredentials') {
        return { status: 401, body: { message: 'Invalid credentials' } };
      }
      if (scenarios.auth === 'unverifiedEmail') {
        return { status: 403, body: { message: 'Email not verified' } };
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
        return { status: 409, body: { message: 'Email already in use' } };
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
