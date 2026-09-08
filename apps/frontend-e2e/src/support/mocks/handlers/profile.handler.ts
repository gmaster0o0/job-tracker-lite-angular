import { MockRoute } from '../registry';
import { UpdateUserProfileDto } from '@job-tracker-lite-angular/schemas';

export const profileRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/api\/profile$/,
    resolve: ({ state, scenarios }) => {
      if (scenarios.profile === 'serverError') {
        return { status: 500, body: { message: 'Server error' } };
      }
      return { status: 200, body: state.profile };
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/api\/profile$/,
    resolve: ({ state, body }) => {
      const updated = {
        ...state.profile,
        ...(body as UpdateUserProfileDto),
      };
      state.profile = updated;
      return { status: 200, body: updated };
    },
  },
];
