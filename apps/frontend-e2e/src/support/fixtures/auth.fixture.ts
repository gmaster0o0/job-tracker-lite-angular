import { test as base, APIRequestContext } from '@playwright/test';
import {
  provisionUser,
  deleteUser,
  ProvisionedUser,
} from '../helpers/api.helper';

export interface WorkerAuthFixtures {
  workerUser: (ProvisionedUser & { storageState: any }) | null;
  storageState: any | undefined;
}

export const authFixtures = base.extend<WorkerAuthFixtures>({
  workerUser: [
    async ({ browser }, use, workerInfo) => {
      // Note: we'll check `useMocks` in e2e.fixtures.ts, but `auth.fixture` doesn't know about `useMocks`
      // natively if we just extend base here. Let's assume we can merge it cleanly later.
    },
    { scope: 'worker' },
  ],
});
