import { MockRoute } from '../registry';

export const healthRoutes: MockRoute[] = [
  {
    method: 'GET',
    pattern: /^\/api\/health$/,
    resolve: () => {
      return { status: 200, body: { status: 'ok' } };
    },
  },
];
