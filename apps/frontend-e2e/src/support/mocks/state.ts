import {
  AuthSessionDto,
  JobDto,
  ContactDto,
  NoteDto,
  UserProfileDto,
  UserPreferencesDto,
  AccountSettingsDto,
} from '@job-tracker-lite-angular/schemas';
import {
  authSessionFixtures,
  allJobDtoFixtures,
  seedContactFixtures,
  seedNoteFixtures,
  userProfileFixtures,
  userPreferencesFixtures,
  accountSettingsFixtures,
} from '@job-tracker-lite-angular/testing';
import { AuthScenario, ScenarioMap } from '../scenarios';

/**
 * Auth scenarios that describe something a logged-out visitor runs into:
 * bad credentials, an unverified or already-taken address, a rate-limited
 * or failing password-reset request. None of them can start from a live
 * session - every /auth/* route is behind `guestGuard`, which bounces an
 * authenticated browser to /jobs before the spec can assert anything.
 */
const LOGGED_OUT_AUTH_SCENARIOS = new Set<AuthScenario>([
  'unauthenticated',
  'invalidCredentials',
  'unverifiedEmail',
  'emailTaken',
  'rateLimited',
  'serverError',
]);

export interface MockState {
  session: AuthSessionDto | null;
  jobs: JobDto[];
  contacts: ContactDto[];
  notes: NoteDto[];
  profile: UserProfileDto;
  preferences: UserPreferencesDto;
  account: AccountSettingsDto;
}

export function createMockState(scenarios: ScenarioMap): MockState {
  return {
    session: LOGGED_OUT_AUTH_SCENARIOS.has(scenarios.auth)
      ? null
      : structuredClone(authSessionFixtures.authenticated),
    jobs: scenarios.jobs === 'noData' ? [] : structuredClone(allJobDtoFixtures),
    contacts:
      scenarios.contacts === 'noData'
        ? []
        : structuredClone(seedContactFixtures as ContactDto[]),
    notes:
      scenarios.notes === 'noData'
        ? []
        : structuredClone(seedNoteFixtures as NoteDto[]),
    profile:
      scenarios.profile === 'partiallyFilled'
        ? {
            ...structuredClone(userProfileFixtures.johnDoe),
            bio: null,
            city: null,
          }
        : structuredClone(userProfileFixtures.johnDoe),
    preferences: structuredClone(userPreferencesFixtures.default),
    account: structuredClone(accountSettingsFixtures.default),
  };
}
