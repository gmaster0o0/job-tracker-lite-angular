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
    // accountDeletionStatusSchema, not a bare { deletionPending } flag: the
    // page reads `status` and counts down to `scheduledDeletionAt`.
    method: 'GET',
    pattern: /^\/api\/account\/delete\/status$/,
    resolve: ({ scenarios }) => {
      const gracePeriodDays = 7;

      if (scenarios.account !== 'deletionPending') {
        return {
          status: 200,
          body: {
            status: 'active',
            gracePeriodRequestedAt: null,
            scheduledDeletionAt: null,
            gracePeriodDays,
          },
        };
      }

      const gracePeriodRequestedAt = new Date();
      const scheduledDeletionAt = new Date(
        gracePeriodRequestedAt.getTime() +
          gracePeriodDays * 24 * 60 * 60 * 1000,
      );

      return {
        status: 200,
        body: {
          status: 'pending_deletion',
          gracePeriodRequestedAt: gracePeriodRequestedAt.toISOString(),
          scheduledDeletionAt: scheduledDeletionAt.toISOString(),
          gracePeriodDays,
        },
      };
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/account\/delete\/recover$/,
    resolve: ({ state }) => {
      // The page reloads the session straight after recovering and then
      // navigates to /settings/privacy. authGuard sends a still-pending user
      // back to the deletion page, so the recovery has to clear that status
      // here or the navigation never sticks.
      if (state.session) {
        state.session = {
          ...state.session,
          user: { ...state.session.user, status: 'ACTIVE' },
        };
      }
      return { status: 200, body: { status: true } };
    },
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
