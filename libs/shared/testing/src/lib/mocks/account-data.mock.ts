import { accountDeletionStatusFixtures } from '../fixtures/account.fixtures';
import {
  AccountDeletionStatusDto,
  AccountSettingsDto,
  SupportLang,
} from '@job-tracker-lite-angular/schemas';

export type AccountDataAccessMockOptions = {
  deletionStatus?: any;
  requestDeletion?: () => Promise<void>;
  recoverDeletion?: () => Promise<void>;
  exportUserData?: () => Promise<any>;
  deleteJobApplications?: () => Promise<void>;
  confirmAccountDeletion?: (
    token: string,
    language: SupportLang,
  ) => Promise<string>;
};
/**
 * Creates a mock implementation of the AccountDataAccess interface for testing purposes.
 * @param options - Optional configuration for the mock behavior.
 * @returns An object containing mock implementations of the AccountDataAccess methods.
 */
export function createAccountDataAccessMock(
  options: AccountDataAccessMockOptions = {},
) {
  const deletionStatus =
    options.deletionStatus ?? accountDeletionStatusFixtures.pending;

  async function getDeletionStatus() {
    return deletionStatus;
  }

  async function requestAccountDeletion(_language?: string) {
    if (options.requestDeletion) return options.requestDeletion();
    return undefined;
  }

  async function recoverAccountDeletion() {
    if (options.recoverDeletion) return options.recoverDeletion();
    return undefined;
  }

  async function exportUserData() {
    if (options.exportUserData) return options.exportUserData();
    return new Blob();
  }

  async function deleteJobApplications(_email?: string) {
    if (options.deleteJobApplications) return options.deleteJobApplications();
    return undefined;
  }

  async function confirmAccountDeletion(token: string, language: SupportLang) {
    if (options.confirmAccountDeletion) {
      return options.confirmAccountDeletion(token, language);
    }
    return '';
  }

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
 * @param options  - Optional configuration for the mock behavior.
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
) {
  async function getAccountSettings(_userId: string) {
    return options.accountSettings;
  }

  async function requestEmailChange(_userId: string, _newEmail: string) {
    if (options.requestEmailChange) return options.requestEmailChange();
    return undefined;
  }

  async function verifyEmailChange(_userId: string, _token: string) {
    if (options.verifyEmailChange) return options.verifyEmailChange();
    return undefined;
  }

  async function restoreEmail(_userId: string) {
    if (options.restoreEmail) return options.restoreEmail();
    return undefined;
  }

  async function requestAccountDeletion(_userId: string, _language: string) {
    if (options.requestAccountDeletion) return options.requestAccountDeletion();
    return undefined;
  }

  async function confirmAccountDeletion(token: string, language: SupportLang) {
    if (options.confirmAccountDeletion) {
      return options.confirmAccountDeletion(token, language);
    }
    return '';
  }

  async function getAccountDeletionStatus(_userId: string) {
    return options.deletionStatus;
  }

  async function recoverAccountDeletion(_userId: string) {
    if (options.recoverAccountDeletion) return options.recoverAccountDeletion();
    return undefined;
  }

  async function exportUserData(_userId: string) {
    if (options.exportUserData) return options.exportUserData();
    return {};
  }

  async function deleteJobApplications(_userId: string, _email: string) {
    if (options.deleteJobApplications) return options.deleteJobApplications();
    return undefined;
  }

  async function executeScheduledDeletion() {
    if (options.executeScheduledDeletion)
      return options.executeScheduledDeletion();
    return undefined;
  }

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
