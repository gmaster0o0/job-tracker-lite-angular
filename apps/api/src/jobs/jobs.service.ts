import {
  CreateJobDto,
  JobDto,
  JobStatusDto,
} from '@job-tracker-lite-angular/api-interfaces';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { Injectable } from '@nestjs/common';
import { Job, JobStatus } from '@prisma/client';

const prismaToDtoStatus: Record<JobStatus, JobStatusDto> = {
  SAVED: 'saved',
  APPLIED: 'applied',
  INTERVIEW: 'interview',
  JOB_OFFERED: 'job offered',
  REJECTED: 'rejected',
};

const dtoToPrismaStatus: Record<JobStatusDto, JobStatus> = {
  saved: 'SAVED',
  applied: 'APPLIED',
  interview: 'INTERVIEW',
  'job offered': 'JOB_OFFERED',
  rejected: 'REJECTED',
};

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<JobDto[]> {
    const jobs = await this.prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return jobs.map(mapJobToDto);
  }

  async create(createJobDto: CreateJobDto): Promise<JobDto> {
    const job = await this.prisma.job.create({
      data: createJobDto,
    });

    return mapJobToDto(job);
  }

  async updateStatus(id: number, status: JobStatusDto): Promise<JobDto> {
    const job = await this.prisma.job.update({
      where: { id },
      data: { status: dtoToPrismaStatus[status] },
    });

    return mapJobToDto(job);
  }
}

function mapJobToDto(job: Job): JobDto {
  return {
    id: job.id,
    position: job.position,
    link: job.link,
    description: job.description,
    company: job.company,
    status: prismaToDtoStatus[job.status],
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}
