export type BaseScenario =
  | 'happyPath' // 2xx, representative data
  | 'noData' // 2xx, empty list / null detail
  | 'serverError' // 500
  | 'loading'; // delayed response, unresolved within the assertion window

export type AuthScenario =
  | BaseScenario
  | 'unauthenticated' // get-session -> null
  | 'invalidCredentials' // 401
  | 'unverifiedEmail' // 403 EMAIL_NOT_VERIFIED
  | 'emailTaken' // 409 on sign-up
  | 'rateLimited'; // 429

export type JobsScenario = BaseScenario | 'notFound' | 'validationError';
export type ContactsScenario = BaseScenario | 'notFound';
export type NotesScenario = BaseScenario | 'notFound';
export type ProfileScenario = BaseScenario | 'partiallyFilled';
export type PreferencesScenario = BaseScenario;
export type AccountScenario =
  | BaseScenario
  | 'changeEmailCooldown'
  | 'deletionPending';
export type HealthScenario = 'happyPath' | 'degraded' | 'serverError';

export interface ScenarioMap {
  auth: AuthScenario;
  jobs: JobsScenario;
  contacts: ContactsScenario;
  notes: NotesScenario;
  profile: ProfileScenario;
  preferences: PreferencesScenario;
  account: AccountScenario;
  health: HealthScenario;
}

export const defaultScenarios: ScenarioMap = {
  auth: 'happyPath',
  jobs: 'happyPath',
  contacts: 'happyPath',
  notes: 'happyPath',
  profile: 'happyPath',
  preferences: 'happyPath',
  account: 'happyPath',
  health: 'happyPath',
};
