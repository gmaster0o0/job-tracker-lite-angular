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
];
