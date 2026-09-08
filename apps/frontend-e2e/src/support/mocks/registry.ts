import { ScenarioDomain, ScenarioMap } from '../scenarios';
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

/** A route plus the scenario domain it answers for, stamped on registration. */
export type RegisteredMockRoute = MockRoute & { domain: ScenarioDomain };

/**
 * Each handler file covers exactly one domain, so registering by domain lets
 * the dispatcher apply domain-wide behaviour - the `loading` delay - without
 * every handler having to remember to.
 */
export function registerRoutes(
  groups: Record<ScenarioDomain, MockRoute[]>,
): RegisteredMockRoute[] {
  return (Object.entries(groups) as [ScenarioDomain, MockRoute[]][]).flatMap(
    ([domain, routes]) => routes.map((route) => ({ ...route, domain })),
  );
}

import { authRoutes } from './handlers/auth.handler';
import { jobsRoutes } from './handlers/jobs.handler';
import { contactsRoutes } from './handlers/contacts.handler';
import { notesRoutes } from './handlers/notes.handler';
import { profileRoutes } from './handlers/profile.handler';
import { preferencesRoutes } from './handlers/preferences.handler';
import { accountRoutes } from './handlers/account.handler';
import { healthRoutes } from './handlers/health.handler';

export const allRoutes = registerRoutes({
  auth: authRoutes,
  jobs: jobsRoutes,
  contacts: contactsRoutes,
  notes: notesRoutes,
  profile: profileRoutes,
  preferences: preferencesRoutes,
  account: accountRoutes,
  health: healthRoutes,
});
