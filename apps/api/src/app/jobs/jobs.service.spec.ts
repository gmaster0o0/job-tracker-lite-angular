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
} from '@job-tracker-lite-angular/testing';

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
    expect(job.status).toBe(JobStatus.SAVED);
  });

  it('should update job status', async () => {
    prismaMock.job.update.mockResolvedValue(
      prismaJobResultFixtures.updatedBackendEngineerInterview,
    );

    const job = await service.updateStatus('ck1234567891', 'INTERVIEW');

    expect(prismaMock.job.update).toHaveBeenCalledWith({
      where: { id: 'ck1234567891' },
      data: { status: JobStatus.INTERVIEW },
    });
    expect(job.status).toBe(JobStatus.INTERVIEW);
  });

  it('should return contacts for a job', async () => {
    prismaMock.job.findUniqueOrThrow.mockResolvedValue({ id: 'ck1234567899' });
    prismaMock.contact.findMany.mockResolvedValue([
      prismaContactFixtures.janeDoe,
    ]);

    await expect(service.findContacts('ck1234567899')).resolves.toEqual([
      contactFixtures.janeDoe,
    ]);
  });

  it('should create a contact for a job', async () => {
    prismaMock.job.findUniqueOrThrow.mockResolvedValue({ id: 'ck1234567899' });
    prismaMock.contact.create.mockResolvedValue(prismaContactFixtures.johnDoe);

    const created = await service.createContact(
      'ck1234567899',
      createContactFixtures.johnDoe,
    );

    expect(prismaMock.contact.create).toHaveBeenCalledWith({
      data: {
        jobId: 'ck1234567899',
        ...createContactFixtures.johnDoe,
      },
    });
    expect(created.id).toBe('ck1234567902');
  });
});
