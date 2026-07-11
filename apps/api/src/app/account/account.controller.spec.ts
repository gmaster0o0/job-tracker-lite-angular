import { Test } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import {
  accountDeletionStatusFixtures,
  accountRedirectFixtures,
  accountSettingsFixtures,
  authSessionFixtures,
  changeEmailRequestFixtures,
  deleteAccountRequestFixtures,
} from '@job-tracker-lite-angular/testing';

describe('AccountController', () => {
  let controller: AccountController;
  let serviceMock: {
    getAccountSettings: jest.Mock;
    requestEmailChange: jest.Mock;
    verifyEmailChange: jest.Mock;
    restoreEmail: jest.Mock;
    requestAccountDeletion: jest.Mock;
    confirmAccountDeletion: jest.Mock;
    getAccountDeletionStatus: jest.Mock;
    recoverAccountDeletion: jest.Mock;
  };

  beforeEach(async () => {
    serviceMock = {
      getAccountSettings: jest.fn(),
      requestEmailChange: jest.fn(),
      verifyEmailChange: jest.fn(),
      restoreEmail: jest.fn(),
      requestAccountDeletion: jest.fn(),
      confirmAccountDeletion: jest.fn(),
      getAccountDeletionStatus: jest.fn(),
      recoverAccountDeletion: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = moduleRef.get(AccountController);
  });

  it('returns account settings for authenticated user', async () => {
    serviceMock.getAccountSettings.mockResolvedValue(
      accountSettingsFixtures.default,
    );

    await expect(
      controller.getSettings(authSessionFixtures.authenticated as never),
    ).resolves.toEqual(accountSettingsFixtures.default);
  });

  it('delegates email change request to service', async () => {
    serviceMock.requestEmailChange.mockResolvedValue(undefined);

    await expect(
      controller.changeEmail(
        authSessionFixtures.authenticated as never,
        changeEmailRequestFixtures.valid,
      ),
    ).resolves.toEqual({ status: true });

    expect(serviceMock.requestEmailChange).toHaveBeenCalledWith(
      authSessionFixtures.authenticated?.user.id,
      changeEmailRequestFixtures.valid.newEmail,
      changeEmailRequestFixtures.valid.language,
    );
  });

  it('redirects verify endpoint to service-provided URL', async () => {
    serviceMock.verifyEmailChange.mockResolvedValue(
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
    serviceMock.restoreEmail.mockResolvedValue(
      accountRedirectFixtures.emailRestoreRestored,
    );
    const response = { redirect: jest.fn() } as any;

    await controller.restoreEmail('restore-token', response);

    expect(response.redirect).toHaveBeenCalledWith(
      accountRedirectFixtures.emailRestoreRestored,
    );
  });

  it('requests account deletion only for the current session user', async () => {
    serviceMock.requestAccountDeletion.mockResolvedValue(undefined);

    await expect(
      controller.requestAccountDeletion(
        authSessionFixtures.authenticated as never,
        deleteAccountRequestFixtures.english,
      ),
    ).resolves.toEqual({ status: true });

    expect(serviceMock.requestAccountDeletion).toHaveBeenCalledWith(
      authSessionFixtures.authenticated?.user.id,
      deleteAccountRequestFixtures.english.language,
    );
  });

  it('redirects confirm delete endpoint to service-provided URL', async () => {
    serviceMock.confirmAccountDeletion.mockResolvedValue(
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
    serviceMock.getAccountDeletionStatus.mockResolvedValue(
      accountDeletionStatusFixtures.pending,
    );

    await expect(
      controller.getDeletionStatus(authSessionFixtures.authenticated as never),
    ).resolves.toMatchObject({
      status: 'pending_deletion',
      gracePeriodDays: 7,
    });

    expect(serviceMock.getAccountDeletionStatus).toHaveBeenCalledWith(
      authSessionFixtures.authenticated?.user.id,
    );
  });

  it('recovers deletion only for the current session user', async () => {
    serviceMock.recoverAccountDeletion.mockResolvedValue(undefined);

    await expect(
      controller.recoverDeletion(authSessionFixtures.authenticated as never),
    ).resolves.toBeUndefined();

    expect(serviceMock.recoverAccountDeletion).toHaveBeenCalledWith(
      authSessionFixtures.authenticated?.user.id,
    );
  });
});
