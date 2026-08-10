import { MockRoute } from '../registry';
import { UpdateUserPreferencesDto } from '@job-tracker-lite-angular/schemas';

export const preferencesRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/api\/preferences$/,
    resolve: ({ state }) => {
      return { status: 200, body: state.preferences };
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/api\/preferences$/,
    resolve: ({ state, body }) => {
      const updated = {
        ...state.preferences,
        ...(body as UpdateUserPreferencesDto),
      };
      state.preferences = updated;
      return { status: 200, body: updated };
    },
  },
];
