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
import { Injectable, NotFoundException } from '@nestjs/common';
import { Contact, Job, JobStatus, Note } from '@prisma/client';

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

  async findOne(id: string): Promise<JobDto> {
    const job = await this.prisma.job.findUniqueOrThrow({
      where: { id },
    });

    return mapJobToDto(job);
  }

  async updateStatus(id: string, status: JobStatusDto): Promise<JobDto> {
    const job = await this.prisma.job.update({
      where: { id },
      data: { status: dtoToPrismaStatus[status] },
    });

    return mapJobToDto(job);
  }

  async update(id: string, updateJobDto: UpdateJobDto): Promise<JobDto> {
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

  async delete(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.job.delete({
      where: { id },
    });
  }

  async findContacts(jobId: string): Promise<ContactDto[]> {
    const contacts = await this.prisma.contact.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
    });

    return contacts.map(mapContactToDto);
  }

  async createContact(
    jobId: string,
    createContactDto: CreateContactDto,
  ): Promise<ContactDto> {
    const contact = await this.prisma.contact.create({
      data: {
        ...createContactDto,
        jobId,
      },
    });

    return mapContactToDto(contact);
  }

  async updateContact(
    jobId: string,
    contactId: string,
    updateContactDto: UpdateContactDto,
  ): Promise<ContactDto> {
    const contact = await this.prisma.contact.update({
      where: {
        id: contactId,
        jobId: jobId,
      },
      data: updateContactDto,
    });

    return mapContactToDto(contact);
  }

  async deleteContact(jobId: string, contactId: string): Promise<void> {
    await this.prisma.contact.delete({
      where: {
        id: contactId,
        jobId: jobId,
      },
    });
  }
  /**
   * Fetches all notes for a given job, ordered by creation date (newest first).
   * @param jobId - The ID of the job to fetch notes for.
   * @returns A promise that resolves to an array of NoteDto objects.
   */
  async findNotes(jobId: string): Promise<NoteDto[]> {
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
    jobId: string,
    noteContent: CreateNoteDto,
  ): Promise<NoteDto> {
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
    jobId: string,
    noteId: string,
    updateContent: UpdateNoteDto,
  ): Promise<NoteDto> {
    const note = await this.prisma.note.update({
      where: { id: noteId, jobId },
      data: updateContent,
    });

    return mapNoteToDto(note);
  }
  /**
   * Deletes a note for a given job.
   * @param jobId - The ID of the job the note belongs to.
   * @param noteId - The ID of the note to delete.
   */
  async deleteNote(jobId: string, noteId: string): Promise<void> {
    await this.prisma.note.delete({
      where: { id: noteId, jobId },
    });
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
    title: note.title,
    body: note.body,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}
