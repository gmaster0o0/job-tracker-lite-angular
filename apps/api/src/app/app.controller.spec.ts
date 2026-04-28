import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    const mockAppService = {
      checkHealth: jest.fn().mockResolvedValue({
        status: 'UP',
        database: 'UP',
        timestamp: new Date().toISOString(),
      }),
    };

    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();
  });

  describe('checkHealth', () => {
    it('should return health status and timestamp', async () => {
      const appController = app.get<AppController>(AppController);
      const response = await appController.checkHealth();

      expect(response.status).toBe('UP');
      expect(response.database).toBe('UP');
      expect(new Date(response.timestamp).toString()).not.toBe('Invalid Date');
    });
  });
});
