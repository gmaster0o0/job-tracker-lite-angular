import { accountDeletionStatusFixtures } from '../fixtures/account.fixtures';
import {
  AccountDeletionStatusDto,
  AccountSettingsDto,
  SupportLang,
} from '@job-tracker-lite-angular/schemas';

/**
 * Creates a mock function using whichever test framework is currently running
 * (Vitest's `vi.fn` or Jest's `jest.fn`), so this mock module never has to
 * import a specific test framework directly.
 *
 * Pass a custom `mockFactory` as the second argument to any of the
 * `create*Mock` functions below if auto-detection isn't suitable
 * (e.g. a different framework, or a non-global test runner setup).
 */
function defaultMockFactory(): any {
  const globalScope = globalThis as any;

  if (typeof globalScope.vi?.fn === 'function') {
    return globalScope.vi.fn();
  }

  if (typeof globalScope.jest?.fn === 'function') {
    return globalScope.jest.fn();
  }

  throw new Error(
    'No mock function factory could be auto-detected (expected a global `vi` or `jest`). ' +
      'Pass a mockFactory explicitly, e.g. createAccountDataAccessMock(options, vi.fn).',
  );
}

export type AccountDataAccessMockOptions = {
  deletionStatus?: any;
  requestDeletion?: () => Promise<void>;
  recoverDeletion?: () => Promise<void>;
  exportUserData?: () => Promise<Blob>;
  deleteJobApplications?: () => Promise<void>;
  confirmAccountDeletion?: (
    token: string,
    language: SupportLang,
  ) => Promise<string>;
};

export function createAccountDataAccessMock(
  options: AccountDataAccessMockOptions = {},
  mockFactory: () => any = defaultMockFactory,
) {
  const deletionStatus =
    options.deletionStatus ?? accountDeletionStatusFixtures.pending;

  const getDeletionStatus = mockFactory();
  const requestAccountDeletion = mockFactory();
  const recoverAccountDeletion = mockFactory();
  const exportUserData = mockFactory();
  const deleteJobApplications = mockFactory();
  const confirmAccountDeletion = mockFactory();

  getDeletionStatus.mockImplementation(async () => deletionStatus);

  requestAccountDeletion.mockImplementation(async (_language?: string) => {
    if (options.requestDeletion) return options.requestDeletion();
    return undefined;
  });

  recoverAccountDeletion.mockImplementation(async () => {
    if (options.recoverDeletion) return options.recoverDeletion();
    return undefined;
  });

  exportUserData.mockImplementation(async () => {
    if (options.exportUserData) return options.exportUserData();
    return new Blob();
  });

  deleteJobApplications.mockImplementation(async (_email?: string) => {
    if (options.deleteJobApplications) return options.deleteJobApplications();
    return undefined;
  });

  confirmAccountDeletion.mockImplementation(
    async (token: string, language: SupportLang) => {
      if (options.confirmAccountDeletion) {
        return options.confirmAccountDeletion(token, language);
      }
      return '';
    },
  );

  return {
    getDeletionStatus,
    requestAccountDeletion,
    confirmAccountDeletion,
    recoverAccountDeletion,
    exportUserData,
    deleteJobApplications,
  };
}

/**
 * Creates a mock implementation of the AccountService interface for testing purposes.
 * @param options - Optional configuration for the mock behavior.
 * @param mockFactory - Factory that creates a mock function (e.g. vi.fn, jest.fn).
 *   Defaults to auto-detecting the running test framework.
 * @returns An object containing mock implementations of the AccountService methods.
 */
export type AccountServiceMockOptions = {
  accountSettings?: AccountSettingsDto;
  deletionStatus?: AccountDeletionStatusDto;
  requestEmailChange?: () => Promise<void>;
  verifyEmailChange?: () => Promise<void>;
  restoreEmail?: () => Promise<string>;
  requestAccountDeletion?: () => Promise<void>;
  confirmAccountDeletion?: (
    token: string,
    language: SupportLang,
  ) => Promise<string>;
  recoverAccountDeletion?: () => Promise<string>;
  exportUserData?: () => Promise<unknown>;
  deleteJobApplications?: () => Promise<void>;
  executeScheduledDeletion?: () => Promise<void>;
};

export function createAccountServiceMock(
  options: AccountServiceMockOptions = {},
  mockFactory: () => any = defaultMockFactory,
) {
  const getAccountSettings = mockFactory();
  const requestEmailChange = mockFactory();
  const verifyEmailChange = mockFactory();
  const restoreEmail = mockFactory();
  const requestAccountDeletion = mockFactory();
  const confirmAccountDeletion = mockFactory();
  const getAccountDeletionStatus = mockFactory();
  const recoverAccountDeletion = mockFactory();
  const exportUserData = mockFactory();
  const deleteJobApplications = mockFactory();
  const executeScheduledDeletion = mockFactory();

  getAccountSettings.mockImplementation(async (_userId: string) => {
    return options.accountSettings;
  });

  requestEmailChange.mockImplementation(
    async (_userId: string, _newEmail: string) => {
      if (options.requestEmailChange) return options.requestEmailChange();
      return undefined;
    },
  );

  verifyEmailChange.mockImplementation(
    async (_userId: string, _token: string) => {
      if (options.verifyEmailChange) return options.verifyEmailChange();
      return undefined;
    },
  );

  restoreEmail.mockImplementation(async (_userId: string) => {
    if (options.restoreEmail) return options.restoreEmail();
    return undefined;
  });

  requestAccountDeletion.mockImplementation(
    async (_userId: string, _language: string) => {
      if (options.requestAccountDeletion)
        return options.requestAccountDeletion();
      return undefined;
    },
  );

  confirmAccountDeletion.mockImplementation(
    async (token: string, language: SupportLang) => {
      if (options.confirmAccountDeletion) {
        return options.confirmAccountDeletion(token, language);
      }
      return '';
    },
  );

  getAccountDeletionStatus.mockImplementation(async (_userId: string) => {
    return options.deletionStatus;
  });

  recoverAccountDeletion.mockImplementation(async (_userId: string) => {
    if (options.recoverAccountDeletion) return options.recoverAccountDeletion();
    return undefined;
  });

  exportUserData.mockImplementation(async (_userId: string) => {
    if (options.exportUserData) return options.exportUserData();
    return {};
  });

  deleteJobApplications.mockImplementation(
    async (_userId: string, _email: string) => {
      if (options.deleteJobApplications) return options.deleteJobApplications();
      return undefined;
    },
  );

  executeScheduledDeletion.mockImplementation(async () => {
    if (options.executeScheduledDeletion)
      return options.executeScheduledDeletion();
    return undefined;
  });

  return {
    getAccountSettings,
    requestEmailChange,
    verifyEmailChange,
    restoreEmail,
    requestAccountDeletion,
    confirmAccountDeletion,
    getAccountDeletionStatus,
    recoverAccountDeletion,
    exportUserData,
    deleteJobApplications,
    executeScheduledDeletion,
  };
}
