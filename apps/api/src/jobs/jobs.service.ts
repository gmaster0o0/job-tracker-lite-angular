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
} from '@job-tracker-lite-angular/api-interfaces';
import { PrismaService } from '@job-tracker-lite-angular/prisma';
import { Injectable } from '@nestjs/common';
import { Contact, Job, JobStatus, Note } from '@prisma/client';
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
  /**
   * Fetches all notes for a given job, ordered by creation date (newest first).
   * @param jobId - The ID of the job to fetch notes for.
   * @returns A promise that resolves to an array of NoteDto objects.
   */
  async findNotes(jobId: number): Promise<NoteDto[]> {
    await this.assertJobExists(jobId);

    const notes = await this.prisma.note.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
    });

    return notes.map(mapNoteToDto);
  }
  /**
   * Creates a new note for a given job.
   * @param jobId - The ID of the job to create the note for.
   * @param noteContent - The content of the note to create.
   * @returns A promise that resolves to the created NoteDto object.
   */
  async createNote(
    jobId: number,
    noteContent: CreateNoteDto,
  ): Promise<NoteDto> {
    await this.assertJobExists(jobId);

    const note = await this.prisma.note.create({
      data: {
        ...noteContent,
        jobId,
      },
    });

    return mapNoteToDto(note);
  }
  /**
   * Updates an existing note for a given job.
   * @param jobId - The ID of the job the note belongs to.
   * @param noteId - The ID of the note to update.
   * @param updateContent - The content to update the note with.
   * @returns A promise that resolves to the updated NoteDto object.
   */
  async updateNote(
    jobId: number,
    noteId: number,
    updateContent: UpdateNoteDto,
  ): Promise<NoteDto> {
    const existing = await this.prisma.note.findFirst({
      where: { id: noteId, jobId },
    });

    if (!existing) {
      throw new Error('NOT_FOUND');
    }

    const note = await this.prisma.note.update({
      where: { id: noteId },
      data: updateContent,
    });

    return mapNoteToDto(note);
  }
  /**
   * Deletes a note for a given job.
   * @param jobId - The ID of the job the note belongs to.
   * @param noteId - The ID of the note to delete.
   */
  async deleteNote(jobId: number, noteId: number): Promise<void> {
    const existing = await this.prisma.note.findFirst({
      where: { id: noteId, jobId },
      select: { id: true },
    });

    if (!existing) {
      throw new Error('NOT_FOUND');
    }

    await this.prisma.note.delete({
      where: { id: noteId },
    });
  }

  /**
   * Helper method to check if a job exists.
   * Throws a NOT_FOUND error if it doesn't.
   * @param jobId - The ID of the job to check.
   */
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
/**
 * Mapper function to map a Job entity from Prisma
 * to a JobDto for the API response.
 * @param job - The Job entity from Prisma.
 * @returns The mapped JobDto object.
 */
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
/**
 * Mapper function to map a Contact entity from Prisma
 * to a ContactDto for the API response.
 * @param contact - The Contact entity from Prisma.
 * @returns The mapped ContactDto object.
 */
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
/**
 * Mapper function to map a Note entity from Prisma
 * to a NoteDto for the API response.
 * @param note - The Note entity from Prisma.
 * @returns The mapped NoteDto object.
 */
function mapNoteToDto(note: Note): NoteDto {
  return {
    id: note.id,
    jobId: note.jobId,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}
