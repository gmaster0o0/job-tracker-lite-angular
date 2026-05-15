import { ContactDto, NoteDto, JobDto } from '@job-tracker-lite-angular/schemas';
import { Contact, Job, Note } from '@prisma/client';

/**
 * Mapper function to map a Job entity from Prisma
 * to a JobDto for the API response.
 * @param job - The Job entity from Prisma.
 * @returns The mapped JobDto object.
 */
export const mapJobToDto = (job: Job): JobDto => {
  return {
    id: job.id,
    position: job.position,
    link: job.link,
    description: job.description,
    company: job.company,
    status: job.status,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
};
/**
 * Mapper function to map a Contact entity from Prisma
 * to a ContactDto for the API response.
 * @param contact - The Contact entity from Prisma.
 * @returns The mapped ContactDto object.
 */
export const mapContactToDto = (contact: Contact): ContactDto => {
  return {
    id: contact.id,
    jobId: contact.jobId,
    name: contact.name,
    email: contact.email,
    phoneNumber: contact.phoneNumber,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
};
/**
 * Mapper function to map a Note entity from Prisma
 * to a NoteDto for the API response.
 * @param note - The Note entity from Prisma.
 * @returns The mapped NoteDto object.
 */
export const mapNoteToDto = (note: Note): NoteDto => {
  return {
    id: note.id,
    jobId: note.jobId,
    title: note.title,
    body: note.body,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
};
