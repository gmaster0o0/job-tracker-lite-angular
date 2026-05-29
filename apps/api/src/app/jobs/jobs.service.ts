import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { Injectable } from '@nestjs/common';
import {
  ContactDto,
  CreateContactDto,
  CreateJobDto,
  CreateNoteDto,
  JobDto,
  JobStatusDto,
  NoteDto,
  UpdateContactDto,
  UpdateJobDto,
  UpdateNoteDto,
} from '@job-tracker-lite-angular/schemas';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<JobDto[]> {
    const jobs = await this.prisma.job.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        position: true,
        link: true,
        description: true,
        company: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return jobs.map(this.mapDates);
  }

  async create(userId: string, createJobDto: CreateJobDto): Promise<JobDto> {
    const dataForPrisma = {
      ...createJobDto,
      userId,
      link: this.cleanOptionalField(createJobDto.link),
      description: this.cleanOptionalField(createJobDto.description),
    };

    const job = await this.prisma.job.create({
      data: dataForPrisma,
      select: {
        id: true,
        position: true,
        link: true,
        description: true,
        company: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.mapDates(job);
  }

  async findOne(userId: string, id: string): Promise<JobDto> {
    const job = await this.prisma.job.findFirstOrThrow({
      where: { id, userId },
      select: {
        id: true,
        position: true,
        link: true,
        description: true,
        company: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.mapDates(job);
  }

  async updateStatus(
    userId: string,
    id: string,
    status: JobStatusDto,
  ): Promise<JobDto> {
    await this.assertJobAccess(userId, id);

    const job = await this.prisma.job.update({
      where: { id },
      data: { status: status },
      select: {
        id: true,
        position: true,
        link: true,
        description: true,
        company: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.mapDates(job);
  }

  async update(
    userId: string,
    id: string,
    updateJobDto: UpdateJobDto,
  ): Promise<JobDto> {
    await this.assertJobAccess(userId, id);

    const { status, ...rest } = updateJobDto;
    const job = await this.prisma.job.update({
      where: { id },
      data: {
        ...rest,
        ...(status ? { status: status } : {}),
      },
      select: {
        id: true,
        position: true,
        link: true,
        description: true,
        company: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.mapDates(job);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.assertJobAccess(userId, id);

    await this.prisma.job.delete({
      where: { id },
    });
  }

  async findContacts(userId: string, jobId: string): Promise<ContactDto[]> {
    await this.assertJobAccess(userId, jobId);

    const contacts = await this.prisma.contact.findMany({
      where: { jobId, userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        jobId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return contacts.map(this.mapDates);
  }

  async createContact(
    userId: string,
    jobId: string,
    createContactDto: CreateContactDto,
  ): Promise<ContactDto> {
    await this.assertJobAccess(userId, jobId);

    const contact = await this.prisma.contact.create({
      data: {
        ...createContactDto,
        jobId,
        userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        jobId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.mapDates(contact);
  }

  async updateContact(
    userId: string,
    jobId: string,
    contactId: string,
    updateContactDto: UpdateContactDto,
  ): Promise<ContactDto> {
    await this.assertJobAccess(userId, jobId);

    const contact = await this.prisma.contact.update({
      where: {
        id: contactId,
        jobId: jobId,
        userId,
      },
      data: updateContactDto,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        jobId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.mapDates(contact);
  }

  async deleteContact(
    userId: string,
    jobId: string,
    contactId: string,
  ): Promise<void> {
    await this.assertJobAccess(userId, jobId);

    await this.prisma.contact.delete({
      where: {
        id: contactId,
        jobId: jobId,
        userId,
      },
    });
  }

  async findNotes(userId: string, jobId: string): Promise<NoteDto[]> {
    await this.assertJobAccess(userId, jobId);

    const notes = await this.prisma.note.findMany({
      where: { jobId, userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        body: true,
        jobId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return notes.map(this.mapDates);
  }

  async createNote(
    userId: string,
    jobId: string,
    noteContent: CreateNoteDto,
  ): Promise<NoteDto> {
    await this.assertJobAccess(userId, jobId);

    const note = await this.prisma.note.create({
      data: {
        ...noteContent,
        jobId,
        userId,
      },
      select: {
        id: true,
        title: true,
        body: true,
        jobId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.mapDates(note);
  }

  async updateNote(
    userId: string,
    jobId: string,
    noteId: string,
    updateContent: UpdateNoteDto,
  ): Promise<NoteDto> {
    await this.assertJobAccess(userId, jobId);

    const note = await this.prisma.note.update({
      where: { id: noteId, jobId, userId },
      data: updateContent,
      select: {
        id: true,
        title: true,
        body: true,
        jobId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.mapDates(note);
  }

  async deleteNote(
    userId: string,
    jobId: string,
    noteId: string,
  ): Promise<void> {
    await this.assertJobAccess(userId, jobId);

    await this.prisma.note.delete({
      where: { id: noteId, jobId, userId },
    });
  }

  private async assertJobAccess(userId: string, jobId: string): Promise<void> {
    await this.prisma.job.findFirstOrThrow({
      where: {
        id: jobId,
        userId,
      },
      select: {
        id: true,
      },
    });
  }

  private cleanOptionalField(value: string | undefined | null): string | null {
    if (!value || value.trim() === '') {
      return null;
    }
    return value.trim();
  }

  private mapDates = <T extends { createdAt: Date; updatedAt: Date }>(
    entity: T,
  ): Omit<T, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
  } => ({
    ...entity,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  });
}
