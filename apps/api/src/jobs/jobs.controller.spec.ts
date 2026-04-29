import { Test } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

describe('JobsController', () => {
  let controller: JobsController;
  let jobsService: {
    findAll: jest.Mock;
    create: jest.Mock;
    updateStatus: jest.Mock;
  };

  beforeEach(async () => {
    jobsService = {
      findAll: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        {
          provide: JobsService,
          useValue: jobsService,
        },
      ],
    }).compile();

    controller = moduleRef.get(JobsController);
  });

  it('should return jobs from the service', async () => {
    jobsService.findAll.mockResolvedValue([{ id: 1, position: 'Angular Dev' }]);

    await expect(controller.findAll()).resolves.toEqual([
      { id: 1, position: 'Angular Dev' },
    ]);
  });

  it('should delegate creation to the service', async () => {
    jobsService.create.mockResolvedValue({ id: 3, status: 'saved' });

    await expect(
      controller.create({
        position: 'Designer',
        link: 'https://example.com/jobs/designer',
        description: 'Shape product UI',
        company: 'Initech',
      }),
    ).resolves.toEqual({ id: 3, status: 'saved' });
  });

  it('should delegate status changes to the service', async () => {
    jobsService.updateStatus.mockResolvedValue({ id: 3, status: 'applied' });

    await expect(
      controller.updateStatus(3, { status: 'applied' }),
    ).resolves.toEqual({ id: 3, status: 'applied' });
  });
});
