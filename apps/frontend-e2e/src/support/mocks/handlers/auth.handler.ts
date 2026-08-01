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
    method: 'POST',
    pattern: /^\/api\/auth\/sign-in$/,
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
    pattern: /^\/api\/auth\/sign-up$/,
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
];
