import { Test } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import {
  createJobFixtures,
  jobFixtures,
  jobResultFixtures,
  createJobsServiceMock,
} from '@job-tracker-lite-angular/testing';
import { JobStatus } from '@job-tracker-lite-angular/schemas';

describe('JobsController', () => {
  let controller: JobsController;
  let jobsService: any;

  beforeEach(async () => {
    jobsService = createJobsServiceMock(jest.fn);

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
      id: 'ck1234567892',
    });

    await expect(
      controller.updateStatus('ck1234567892', { status: JobStatus.APPLIED }),
    ).resolves.toEqual({
      ...jobFixtures.backendEngineer,
      id: 'ck1234567892',
    });
  });
});
