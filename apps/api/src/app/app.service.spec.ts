import { Test } from '@nestjs/testing';
import { AppService } from './app.service';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { createPrismaServiceMock } from '@job-tracker-lite-angular/shared-testing';

describe('AppService', () => {
  let service: AppService;
  let mockPrismaService: ReturnType<typeof createPrismaServiceMock>;

  beforeAll(async () => {
    mockPrismaService = createPrismaServiceMock(jest.fn);
    mockPrismaService.testConnection.mockResolvedValue([]);

    const app = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('checkHealth', () => {
    it('should return health status and timestamp', async () => {
      const response = await service.checkHealth();

      expect(response.status).toBe('UP');
      expect(response.database).toBe('UP');
      expect(new Date(response.timestamp).toString()).not.toBe('Invalid Date');
    });

    it('should report DOWN when the database check fails', async () => {
      mockPrismaService.testConnection.mockRejectedValueOnce(
        new Error('DB unavailable'),
      );

      const response = await service.checkHealth();

      expect(response.status).toBe('DOWN');
      expect(response.database).toBe('DOWN');
      expect(new Date(response.timestamp).toString()).not.toBe('Invalid Date');
    });
  });
});
