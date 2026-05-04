import { Test } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import {
  createJobFixtures,
  jobFixtures,
  jobResultFixtures,
} from '@job-tracker-lite-angular/shared-testing';

describe('JobsController', () => {
  let controller: JobsController;
  let jobsService: {
    findAll: jest.Mock;
    create: jest.Mock;
    updateStatus: jest.Mock;
    findContacts: jest.Mock;
    createContact: jest.Mock;
    updateContact: jest.Mock;
    deleteContact: jest.Mock;
  };

  beforeEach(async () => {
    jobsService = {
      findAll: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      findContacts: jest.fn(),
      createContact: jest.fn(),
      updateContact: jest.fn(),
      deleteContact: jest.fn(),
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
    jobsService.findAll.mockResolvedValue([jobFixtures.frontendEngineer]);

    await expect(controller.findAll()).resolves.toEqual([
      jobFixtures.frontendEngineer,
    ]);
  });

  it('should delegate creation to the service', async () => {
    jobsService.create.mockResolvedValue(
      jobResultFixtures.createdProductDesigner,
    );

    await expect(
      controller.create(createJobFixtures.designer),
    ).resolves.toEqual(jobResultFixtures.createdProductDesigner);
  });

  it('should delegate status changes to the service', async () => {
    jobsService.updateStatus.mockResolvedValue({
      ...jobFixtures.backendEngineer,
      id: 3,
    });

    await expect(
      controller.updateStatus(3, { status: 'applied' }),
    ).resolves.toEqual({
      ...jobFixtures.backendEngineer,
      id: 3,
    });
  });
});
