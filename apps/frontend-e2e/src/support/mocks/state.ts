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
import { ScenarioMap } from '../scenarios';

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
    session:
      scenarios.auth === 'unauthenticated'
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
