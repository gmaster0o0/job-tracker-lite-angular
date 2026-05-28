import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { Request, Response } from 'express';

const authHandlerMock = jest.fn();

jest.mock('./auth.config', () => ({
  BETTER_AUTH: Symbol('BETTER_AUTH'),
}));

jest.mock('better-auth/node', () => ({
  toNodeHandler: jest.fn(() => authHandlerMock),
}));

const { BETTER_AUTH } = jest.requireMock('./auth.config') as {
  BETTER_AUTH: symbol;
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    authHandlerMock.mockReset();

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: BETTER_AUTH,
          useValue: {},
        },
      ],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  it('should delegate all auth requests to better-auth node handler', async () => {
    const request = {} as Request;
    const response = {} as Response;

    await controller.handleAuth(request, response);

    expect(authHandlerMock).toHaveBeenCalledWith(request, response);
  });
});
