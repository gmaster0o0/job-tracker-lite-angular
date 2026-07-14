import { accountDeletionStatusFixtures } from '../fixtures/account.fixtures';

export type AccountDataAccessMockOptions = {
  deletionStatus?: any;
  requestDeletion?: () => Promise<void>;
  recoverDeletion?: () => Promise<void>;
  exportUserData?: () => Promise<any>;
  deleteJobApplications?: () => Promise<void>;
  confirmAccountDeletion?: (token: string, language: string) => Promise<string>;
};

export function createAccountDataAccessMock(
  options: AccountDataAccessMockOptions = {},
) {
  const deletionStatus =
    options.deletionStatus ?? accountDeletionStatusFixtures.pending;

  async function getAccountDeletionStatus(_userId: string) {
    return deletionStatus;
  }

  async function requestAccountDeletion(_userId: string, _language?: string) {
    if (options.requestDeletion) return options.requestDeletion();
    return undefined;
  }

  async function recoverAccountDeletion(_userId: string) {
    if (options.recoverDeletion) return options.recoverDeletion();
    return undefined;
  }

  async function exportUserData(_userId: string) {
    if (options.exportUserData) return options.exportUserData();
    return new Blob();
  }

  async function deleteJobApplications(_userId: string, _email?: string) {
    if (options.deleteJobApplications) return options.deleteJobApplications();
    return undefined;
  }

  async function confirmAccountDeletion(token: string, language: string) {
    if (options.confirmAccountDeletion) {
      return options.confirmAccountDeletion(token, language);
    }
    return '';
  }

  return {
    getAccountDeletionStatus,
    requestAccountDeletion,
    confirmAccountDeletion,
    recoverAccountDeletion,
    exportUserData,
    deleteJobApplications,
  };
}
