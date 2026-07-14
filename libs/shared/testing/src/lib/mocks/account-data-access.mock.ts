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

  async function confirmAccountDeletion(token: string, language: string) {
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
