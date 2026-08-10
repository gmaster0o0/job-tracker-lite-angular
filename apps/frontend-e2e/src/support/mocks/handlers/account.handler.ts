import { MockRoute } from '../registry';
import { AccountSettingsDto } from '@job-tracker-lite-angular/schemas';

export const accountRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/api\/account$/,
    resolve: ({ state }) => {
      return { status: 200, body: state.account };
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/api\/account$/,
    resolve: ({ state, body }) => {
      const updated = {
        ...state.account,
        ...(body as Partial<AccountSettingsDto>),
      };
      state.account = updated;
      return { status: 200, body: updated };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/account\/change-email$/,
    resolve: ({ state, scenarios, body }) => {
      if (scenarios.account === 'changeEmailCooldown') {
        return {
          status: 429,
          body: { message: 'Please wait before requesting again' },
        };
      }

      const { newEmail } = (body ?? {}) as { newEmail?: string };
      state.account = { ...state.account, pendingEmail: newEmail ?? null };
      return { status: 200, body: state.account };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/account\/change-email\/cancel$/,
    resolve: ({ state }) => {
      state.account = { ...state.account, pendingEmail: null };
      return { status: 200, body: state.account };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/account\/delete\/request$/,
    resolve: ({ scenarios }) => {
      if (scenarios.account === 'serverError') {
        return { status: 500, body: { message: 'Server error' } };
      }
      return { status: 200, body: { status: true } };
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/account\/delete\/status$/,
    resolve: ({ scenarios }) => ({
      status: 200,
      body: {
        deletionPending: scenarios.account === 'deletionPending',
      },
    }),
  },
  {
    method: 'POST',
    pattern: /^\/api\/account\/delete\/recover$/,
    resolve: () => ({ status: 200, body: { status: true } }),
  },
  {
    method: 'POST',
    pattern: /^\/api\/account\/delete\/jobs$/,
    resolve: ({ state }) => {
      state.jobs = [];
      return { status: 200, body: { status: true } };
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/account\/export-data$/,
    resolve: ({ state }) => ({
      status: 200,
      body: { jobs: state.jobs, profile: state.profile },
    }),
  },
];
