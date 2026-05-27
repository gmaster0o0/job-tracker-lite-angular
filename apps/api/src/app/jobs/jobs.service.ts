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

  async findAll(): Promise<JobDto[]> {
    const jobs = await this.prisma.job.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return jobs.map(this.mapDates);
  }

  async create(createJobDto: CreateJobDto): Promise<JobDto> {
    const dataForPrisma = {
      ...createJobDto,
      link: this.cleanOptionalField(createJobDto.link),
      description: this.cleanOptionalField(createJobDto.description),
    };

    const job = await this.prisma.job.create({
      data: dataForPrisma,
    });

    return this.mapDates(job);
  }

  async findOne(id: string): Promise<JobDto> {
    const job = await this.prisma.job.findUniqueOrThrow({
      where: { id },
    });

    return this.mapDates(job);
  }

  async updateStatus(id: string, status: JobStatusDto): Promise<JobDto> {
    const job = await this.prisma.job.update({
      where: { id },
      data: { status: status },
    });

    return this.mapDates(job);
  }

  // Update job details, allowing partial updates. If status is included, it will be updated;
  //  otherwise, it remains unchanged.
  async update(id: string, updateJobDto: UpdateJobDto): Promise<JobDto> {
    const { status, ...rest } = updateJobDto;
    const job = await this.prisma.job.update({
      where: { id },
      data: {
        ...rest,
        ...(status ? { status: status } : {}),
      },
    });

    return this.mapDates(job);
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

    return contacts.map(this.mapDates);
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

    return this.mapDates(contact);
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

    return this.mapDates(contact);
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

    return notes.map(this.mapDates);
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

    return this.mapDates(note);
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

    return this.mapDates(note);
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
  /**
   * Cleans an optional string field by trimming whitespace and converting empty strings to null.
   * @param value - The string value to clean.
   * @returns The cleaned string or null if the input was empty or undefined.
   */
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
