import { ScenarioMap } from '../scenarios';
import { MockState } from './state';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface MockContext {
  scenarios: ScenarioMap;
  state: MockState;
  method: HttpMethod;
  url: URL;
  params: Record<string, string>; // from named regex groups
  body: unknown; // parsed JSON request body
}

export interface MockResponse {
  status: number;
  body?: unknown;
  delayMs?: number;
}

export interface MockRoute {
  method: HttpMethod | HttpMethod[];
  pattern: RegExp; // e.g. /^\/api\/jobs\/(?<id>[^/]+)\/status$/
  resolve: (ctx: MockContext) => MockResponse | Promise<MockResponse>;
}

export function registerRoutes(routes: MockRoute[][]): MockRoute[] {
  return routes.flat();
}

import { authRoutes } from './handlers/auth.handler';
import { jobsRoutes } from './handlers/jobs.handler';
import { contactsRoutes } from './handlers/contacts.handler';
import { notesRoutes } from './handlers/notes.handler';
import { profileRoutes } from './handlers/profile.handler';
import { preferencesRoutes } from './handlers/preferences.handler';
import { accountRoutes } from './handlers/account.handler';
import { healthRoutes } from './handlers/health.handler';

export const allRoutes = registerRoutes([
  authRoutes,
  jobsRoutes,
  contactsRoutes,
  notesRoutes,
  profileRoutes,
  preferencesRoutes,
  accountRoutes,
  healthRoutes,
]);
