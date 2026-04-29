import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    user = {
      findMany: jest.fn(),
    };

    $connect = jest.fn().mockResolvedValue(undefined);
    $disconnect = jest.fn().mockResolvedValue(undefined);

    constructor() { /* empty */ }
  },
}));

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({})),
}));

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    process.env['DATABASE_URL'] = 'postgresql://user:pass@localhost:5432/db';

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call $connect', async () => {
      const connectSpy = jest
        .spyOn(service, '$connect')
        .mockImplementation(async () => {
          /* empty */
        });

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect', async () => {
      const disconnectSpy = jest
        .spyOn(service, '$disconnect')
        .mockImplementation(async () => {
          // Simulate successful disconnect
        });

      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('testConnection', () => {
    it('should call user.findMany and return the result', async () => {
      const expected = [{ id: 1, name: 'Test User' }];
      const findManySpy = jest
        .spyOn(service.user, 'findMany')
        .mockResolvedValue(
          expected as unknown as Awaited<
            ReturnType<typeof service.user.findMany>
          >,
        );

      await expect(service.testConnection()).resolves.toEqual(expected);
      expect(findManySpy).toHaveBeenCalled();
    });
  });

  describe('constructor', () => {
    it('should throw an error if DATABASE_URL is missing', () => {
      delete process.env['DATABASE_URL'];

      expect(() => new PrismaService()).toThrow(
        'DATABASE_URL must be set for PrismaService',
      );
    });
  });
});
