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
 * Auth scenarios describing what a logged-out visitor runs into. None can
 * start from a live session: every /auth/* route is behind `guestGuard`,
 * which bounces an authenticated browser to /jobs before a spec can assert.
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

/**
 * authGuard routes on the session's own status, not on the deletion-status
 * endpoint: only a PENDING_DELETION user may open /privacy/delete-pending,
 * and any other route bounces them back to it. So the scenario has to be
 * reflected in the session too, not just in the delete/status response.
 */
function sessionFor(scenarios: ScenarioMap): AuthSessionDto {
  if (LOGGED_OUT_AUTH_SCENARIOS.has(scenarios.auth)) {
    return null;
  }

  return structuredClone(
    scenarios.account === 'deletionPending'
      ? authSessionFixtures.pendingDeletion
      : authSessionFixtures.authenticated,
  );
}

export function createMockState(scenarios: ScenarioMap): MockState {
  return {
    session: sessionFor(scenarios),
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
