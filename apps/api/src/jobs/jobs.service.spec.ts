import { Test } from '@nestjs/testing';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { JobStatus } from '@prisma/client';
import { JobsService } from './jobs.service';

describe('JobsService', () => {
  let service: JobsService;
  let prismaMock: {
    job: {
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      job: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

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
      {
        id: 1,
        position: 'Frontend Engineer',
        link: 'https://example.com/jobs/frontend-engineer',
        description: 'Build Angular apps',
        company: 'Acme',
        status: JobStatus.SAVED,
        createdAt: new Date('2026-04-29T09:00:00.000Z'),
        updatedAt: new Date('2026-04-29T09:30:00.000Z'),
      },
    ]);

    await expect(service.findAll()).resolves.toEqual([
      {
        id: 1,
        position: 'Frontend Engineer',
        link: 'https://example.com/jobs/frontend-engineer',
        description: 'Build Angular apps',
        company: 'Acme',
        status: 'saved',
        createdAt: '2026-04-29T09:00:00.000Z',
        updatedAt: '2026-04-29T09:30:00.000Z',
      },
    ]);
  });

  it('should persist a new job and keep the default saved status', async () => {
    prismaMock.job.create.mockResolvedValue({
      id: 7,
      position: 'Product Designer',
      link: 'https://example.com/jobs/product-designer',
      description: 'Design the experience',
      company: 'Northwind',
      status: JobStatus.SAVED,
      createdAt: new Date('2026-04-29T09:00:00.000Z'),
      updatedAt: new Date('2026-04-29T09:00:00.000Z'),
    });

    const job = await service.create({
      position: 'Product Designer',
      link: 'https://example.com/jobs/product-designer',
      description: 'Design the experience',
      company: 'Northwind',
    });

    expect(prismaMock.job.create).toHaveBeenCalledWith({
      data: {
        position: 'Product Designer',
        link: 'https://example.com/jobs/product-designer',
        description: 'Design the experience',
        company: 'Northwind',
      },
    });
    expect(job.status).toBe('saved');
  });

  it('should update job status', async () => {
    prismaMock.job.update.mockResolvedValue({
      id: 9,
      position: 'Backend Engineer',
      link: 'https://example.com/jobs/backend-engineer',
      description: 'Own API delivery',
      company: 'Globex',
      status: JobStatus.INTERVIEW,
      createdAt: new Date('2026-04-29T09:00:00.000Z'),
      updatedAt: new Date('2026-04-29T10:00:00.000Z'),
    });

    const job = await service.updateStatus(9, 'interview');

    expect(prismaMock.job.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { status: JobStatus.INTERVIEW },
    });
    expect(job.status).toBe('interview');
  });
});
