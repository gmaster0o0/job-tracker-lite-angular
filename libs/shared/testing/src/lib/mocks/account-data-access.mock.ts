import { accountDeletionStatusFixtures } from '../fixtures/account.fixtures';

export type AccountDataAccessMockOptions = {
  deletionStatus?: any;
  requestDeletion?: () => Promise<void>;
  recoverDeletion?: () => Promise<void>;
};

export function createAccountDataAccessMock(
  options: AccountDataAccessMockOptions = {},
) {
  const deletionStatus =
    options.deletionStatus ?? accountDeletionStatusFixtures.pending;

  async function getDeletionStatus() {
    return options.deletionStatus ?? deletionStatus;
  }

  async function requestAccountDeletion() {
    if (options.requestDeletion) return options.requestDeletion();
    return undefined;
  }

  async function recoverAccountDeletion() {
    if (options.recoverDeletion) return options.recoverDeletion();
    return undefined;
  }

  return {
    getDeletionStatus,
    requestAccountDeletion,
    recoverAccountDeletion,
  } as const;
}
