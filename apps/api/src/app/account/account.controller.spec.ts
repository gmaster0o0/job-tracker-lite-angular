import { Test } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import {
  accountSettingsFixtures,
  authSessionFixtures,
  changeEmailRequestFixtures,
} from '@job-tracker-lite-angular/testing';

describe('AccountController', () => {
  let controller: AccountController;
  let serviceMock: {
    getAccountSettings: jest.Mock;
    requestEmailChange: jest.Mock;
    verifyEmailChange: jest.Mock;
    restoreEmail: jest.Mock;
  };

  beforeEach(async () => {
    serviceMock = {
      getAccountSettings: jest.fn(),
      requestEmailChange: jest.fn(),
      verifyEmailChange: jest.fn(),
      restoreEmail: jest.fn(),
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
    );
  });

  it('redirects verify endpoint to service-provided URL', async () => {
    serviceMock.verifyEmailChange.mockResolvedValue(
      'http://localhost:4200/settings/account?emailChange=verified',
    );
    const response = { redirect: jest.fn() } as any;

    await controller.verifyEmailChange('verify-token', response);

    expect(response.redirect).toHaveBeenCalledWith(
      'http://localhost:4200/settings/account?emailChange=verified',
    );
  });

  it('redirects restore endpoint to service-provided URL', async () => {
    serviceMock.restoreEmail.mockResolvedValue(
      'http://localhost:4200/auth/login?emailRestore=restored',
    );
    const response = { redirect: jest.fn() } as any;

    await controller.restoreEmail('restore-token', response);

    expect(response.redirect).toHaveBeenCalledWith(
      'http://localhost:4200/auth/login?emailRestore=restored',
    );
  });
});
