import { Test } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import {
  accountDeletionStatusFixtures,
  accountRedirectFixtures,
  accountSettingsFixtures,
  authSessionFixtures,
  changeEmailRequestFixtures,
  createAccountServiceMock,
  createAuthDataAccessMock,
  deleteAccountRequestFixtures,
  jobApplicationDeletionFixtures,
} from '@job-tracker-lite-angular/testing';

function jestify<T extends Record<string, (...args: any[]) => any>>(
  mock: T,
): { [K in keyof T]: jest.Mock<ReturnType<T[K]>, Parameters<T[K]>> } {
  const jestMock: any = {};
  for (const key of Object.keys(mock) as (keyof T)[]) {
    jestMock[key] = jest.fn(mock[key]);
  }
  return jestMock;
}

describe('AccountController', () => {
  let controller: AccountController;
  let accountDataAccessMock: ReturnType<
    typeof jestify<ReturnType<typeof createAccountServiceMock>>
  >;
  let authDataAccessMock: ReturnType<
    typeof jestify<ReturnType<typeof createAuthDataAccessMock>>
  >;

  beforeEach(async () => {
    accountDataAccessMock = jestify(
      createAccountServiceMock(
        {
          exportUserData: () => Promise.resolve(new Blob()),
          deleteJobApplications: () => Promise.resolve(undefined),
        },
        jest.fn,
      ),
    );

    authDataAccessMock = jestify(
      createAuthDataAccessMock({
        getAccountSettings: () =>
          Promise.resolve(accountSettingsFixtures.default),
        requestEmailChange: () => Promise.resolve(undefined),
        verifyEmailChange: () =>
          Promise.resolve(accountRedirectFixtures.emailChangeVerified),
      }),
    );

    const accountServiceMock = {
      ...accountDataAccessMock,
      ...authDataAccessMock,
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: accountServiceMock,
        },
      ],
    }).compile();

    controller = moduleRef.get(AccountController);
  });

  it('returns account settings for authenticated user', async () => {
    authDataAccessMock.getAccountSettings.mockResolvedValue(
      accountSettingsFixtures.default,
    );

    await expect(
      controller.getSettings(authSessionFixtures.authenticated as never),
    ).resolves.toEqual(accountSettingsFixtures.default);
  });

  it('delegates email change request to service', async () => {
    authDataAccessMock.requestEmailChange.mockResolvedValue(undefined);

    await expect(
      controller.changeEmail(
        authSessionFixtures.authenticated as never,
        changeEmailRequestFixtures.valid,
      ),
    ).resolves.toEqual({ status: true });

    expect(authDataAccessMock.requestEmailChange).toHaveBeenCalledWith(
      authSessionFixtures.authenticated?.user.id,
      changeEmailRequestFixtures.valid.newEmail,
      changeEmailRequestFixtures.valid.language,
    );
  });

  it('redirects verify endpoint to service-provided URL', async () => {
    authDataAccessMock.verifyEmailChange.mockResolvedValue(
      accountRedirectFixtures.emailChangeVerified,
    );
    const response = {
      redirect: jest.fn(),
      req: {
        url: 'http://localhost:3000/api/account/verify-email-change?token=verify-token&language=en',
      },
    } as any;

    await controller.verifyEmailChange('verify-token', 'en', response);

    expect(response.redirect).toHaveBeenCalledWith(
      accountRedirectFixtures.emailChangeVerified,
    );
  });

  it('redirects restore endpoint to service-provided URL', async () => {
    authDataAccessMock.restoreEmail.mockResolvedValue(
      accountRedirectFixtures.emailRestoreRestored,
    );
    const response = { redirect: jest.fn() } as any;

    await controller.restoreEmail('restore-token', response);

    expect(response.redirect).toHaveBeenCalledWith(
      accountRedirectFixtures.emailRestoreRestored,
    );
  });

  it('requests account deletion only for the current session user', async () => {
    accountDataAccessMock.requestAccountDeletion.mockResolvedValue(undefined);

    await expect(
      controller.requestAccountDeletion(
        authSessionFixtures.authenticated as never,
        deleteAccountRequestFixtures.english,
      ),
    ).resolves.toEqual({ status: true });

    expect(accountDataAccessMock.requestAccountDeletion).toHaveBeenCalledWith(
      authSessionFixtures.authenticated?.user.id,
      deleteAccountRequestFixtures.english.language,
    );
  });

  it('redirects confirm delete endpoint to service-provided URL', async () => {
    accountDataAccessMock.confirmAccountDeletion.mockResolvedValue(
      accountRedirectFixtures.accountDeletionConfirmed,
    );
    const response = {
      redirect: jest.fn(),
      req: {
        url: 'http://localhost:3000/api/account/confirm-delete?token=delete-token&language=en',
      },
    } as any;

    await controller.confirmAccountDeletion('delete-token', 'en', response);

    expect(response.redirect).toHaveBeenCalledWith(
      accountRedirectFixtures.accountDeletionConfirmed,
    );
  });

  it('returns deletion status for the current session user', async () => {
    accountDataAccessMock.getAccountDeletionStatus.mockResolvedValue(
      accountDeletionStatusFixtures.pending,
    );

    await expect(
      controller.getDeletionStatus(authSessionFixtures.authenticated as never),
    ).resolves.toMatchObject({
      status: 'pending_deletion',
      gracePeriodDays: 7,
    });

    expect(accountDataAccessMock.getAccountDeletionStatus).toHaveBeenCalledWith(
      authSessionFixtures.authenticated?.user.id,
    );
  });

  it('recovers deletion only for the current session user', async () => {
    accountDataAccessMock.recoverAccountDeletion.mockResolvedValue(undefined);

    await expect(
      controller.recoverDeletion(authSessionFixtures.authenticated as never),
    ).resolves.toBeUndefined();

    expect(accountDataAccessMock.recoverAccountDeletion).toHaveBeenCalledWith(
      authSessionFixtures.authenticated?.user.id,
    );
  });

  describe('exportData', () => {
    it('returns export data for the current session user', async () => {
      const mockExportData = { id: 'user-id', profile: {}, jobs: [] };
      accountDataAccessMock.exportUserData.mockResolvedValue(mockExportData);

      const result = await controller.exportData(
        authSessionFixtures.authenticated as never,
      );

      expect(result).toEqual(mockExportData);
      expect(accountDataAccessMock.exportUserData).toHaveBeenCalledWith(
        authSessionFixtures.authenticated?.user.id,
      );
    });
  });

  describe('deleteJobs', () => {
    it('delegates job deletion to service', async () => {
      accountDataAccessMock.deleteJobApplications.mockResolvedValue(undefined);

      const body = {
        email: 'test@example.com',
        cutoffDate: jobApplicationDeletionFixtures.cutoffDate,
      };
      const result = await controller.deleteJobs(
        authSessionFixtures.authenticated as never,
        body,
      );

      expect(result).toEqual({ status: true });
      expect(accountDataAccessMock.deleteJobApplications).toHaveBeenCalledWith(
        authSessionFixtures.authenticated?.user.id,
        body,
      );
    });
  });
});
