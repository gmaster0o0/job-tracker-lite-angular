import {
  ContactDto,
  CreateContactDto,
  CreateJobDto,
  JobDto,
  JobStatusDto,
  UpdateContactDto,
  UpdateJobDto,
} from '@job-tracker-lite-angular/api-interfaces';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { Injectable } from '@nestjs/common';
import { Contact, Job, JobStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

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

  async findOne(id: number): Promise<JobDto> {
    try {
      const job = await this.prisma.job.findUniqueOrThrow({
        where: { id },
      });

      return mapJobToDto(job);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new Error('NOT_FOUND');
      }

      throw error;
    }
  }

  async updateStatus(id: number, status: JobStatusDto): Promise<JobDto> {
    const job = await this.prisma.job.update({
      where: { id },
      data: { status: dtoToPrismaStatus[status] },
    });

    return mapJobToDto(job);
  }

  async update(id: number, updateJobDto: UpdateJobDto): Promise<JobDto> {
    const { status, ...rest } = updateJobDto;
    const job = await this.prisma.job.update({
      where: { id },
      data: {
        ...rest,
        ...(status ? { status: dtoToPrismaStatus[status] } : {}),
      },
    });

    return mapJobToDto(job);
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.job.delete({
      where: { id },
    });
  }

  async findContacts(jobId: number): Promise<ContactDto[]> {
    await this.assertJobExists(jobId);

    const contacts = await this.prisma.contact.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
    });

    return contacts.map(mapContactToDto);
  }

  async createContact(
    jobId: number,
    createContactDto: CreateContactDto,
  ): Promise<ContactDto> {
    await this.assertJobExists(jobId);

    const contact = await this.prisma.contact.create({
      data: {
        ...createContactDto,
        jobId,
      },
    });

    return mapContactToDto(contact);
  }

  async updateContact(
    jobId: number,
    contactId: number,
    updateContactDto: UpdateContactDto,
  ): Promise<ContactDto> {
    const existing = await this.prisma.contact.findFirst({
      where: { id: contactId, jobId },
    });

    if (!existing) {
      throw new Error('NOT_FOUND');
    }

    const contact = await this.prisma.contact.update({
      where: { id: contactId },
      data: updateContactDto,
    });

    return mapContactToDto(contact);
  }

  async deleteContact(jobId: number, contactId: number): Promise<void> {
    const existing = await this.prisma.contact.findFirst({
      where: { id: contactId, jobId },
      select: { id: true },
    });

    if (!existing) {
      throw new Error('NOT_FOUND');
    }

    await this.prisma.contact.delete({
      where: { id: contactId },
    });
  }

  private async assertJobExists(jobId: number): Promise<void> {
    try {
      await this.prisma.job.findUniqueOrThrow({
        where: { id: jobId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new Error('NOT_FOUND');
      }

      throw error;
    }
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

function mapContactToDto(contact: Contact): ContactDto {
  return {
    id: contact.id,
    jobId: contact.jobId,
    name: contact.name,
    email: contact.email,
    phoneNumber: contact.phoneNumber,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}
