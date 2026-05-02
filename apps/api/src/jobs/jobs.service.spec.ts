import { Test } from '@nestjs/testing';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { JobStatus } from '@prisma/client';
import { JobsService } from './jobs.service';
import {
  contactFixtures,
  createContactFixtures,
  createJobFixtures,
  createPrismaServiceMock,
  jobFixtures,
  prismaContactFixtures,
  prismaJobFixtures,
  prismaJobResultFixtures,
} from '@job-tracker-lite-angular/shared-testing';

describe('JobsService', () => {
  let service: JobsService;
  let prismaMock: ReturnType<typeof createPrismaServiceMock>;

  beforeEach(async () => {
    prismaMock = createPrismaServiceMock(jest.fn);

    const moduleRef = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = moduleRef.get(JobsService);
  });

  it('should map Prisma jobs into DTOs', async () => {
    prismaMock.job.findMany.mockResolvedValue([
      prismaJobFixtures.frontendEngineer,
    ]);

    await expect(service.findAll()).resolves.toEqual([
      jobFixtures.frontendEngineer,
    ]);
  });

  it('should persist a new job and keep the default saved status', async () => {
    prismaMock.job.create.mockResolvedValue(
      prismaJobResultFixtures.createdProductDesigner,
    );

    const job = await service.create(createJobFixtures.productDesigner);

    expect(prismaMock.job.create).toHaveBeenCalledWith({
      data: createJobFixtures.productDesigner,
    });
    expect(job.status).toBe('saved');
  });

  it('should update job status', async () => {
    prismaMock.job.update.mockResolvedValue(
      prismaJobResultFixtures.updatedBackendEngineerInterview,
    );

    const job = await service.updateStatus(9, 'interview');

    expect(prismaMock.job.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { status: JobStatus.INTERVIEW },
    });
    expect(job.status).toBe('interview');
  });

  it('should return contacts for a job', async () => {
    prismaMock.job.findUniqueOrThrow.mockResolvedValue({ id: 10 });
    prismaMock.contact.findMany.mockResolvedValue([
      prismaContactFixtures.janeDoe,
    ]);

    await expect(service.findContacts(10)).resolves.toEqual([
      contactFixtures.janeDoe,
    ]);
  });

  it('should create a contact for a job', async () => {
    prismaMock.job.findUniqueOrThrow.mockResolvedValue({ id: 10 });
    prismaMock.contact.create.mockResolvedValue(prismaContactFixtures.johnDoe);

    const created = await service.createContact(
      10,
      createContactFixtures.johnDoe,
    );

    expect(prismaMock.contact.create).toHaveBeenCalledWith({
      data: {
        jobId: 10,
        ...createContactFixtures.johnDoe,
      },
    });
    expect(created.id).toBe(2);
  });
});
