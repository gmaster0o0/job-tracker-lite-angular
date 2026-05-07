import { Contact, Note, Job, JobStatus } from '@prisma/client';
import { ContactDto, NoteDto } from '@job-tracker-lite-angular/api-interfaces';
import { contactFixtures } from './contacts.fixtures';
import { noteFixtures } from './notes.fixtures';
import { jobFixtures, jobResultFixtures } from './jobs.fixtures';
import {
  seedContactFixtures,
  seedJobFixtures,
  seedNoteFixtures,
} from './seed.fixtures';

function toPrismaJobStatus(status: string): JobStatus {
  switch (status) {
    case 'saved':
      return JobStatus.SAVED;
    case 'applied':
      return JobStatus.APPLIED;
    case 'interview':
      return JobStatus.INTERVIEW;
    case 'job offered':
      return JobStatus.JOB_OFFERED;
    case 'rejected':
      return JobStatus.REJECTED;
    default:
      return JobStatus.SAVED;
  }
}

function toPrismaJob(job: (typeof seedJobFixtures)[number]): Job {
  return {
    ...job,
    status: toPrismaJobStatus(job.status),
    createdAt: new Date(job.createdAt),
    updatedAt: new Date(job.updatedAt),
  } as Job;
}

function toPrismaContact(contact: ContactDto): Contact {
  return {
    ...contact,
    createdAt: new Date(contact.createdAt),
    updatedAt: new Date(contact.updatedAt),
  } as Contact;
}

function toPrismaNote(note: NoteDto): Note {
  return {
    ...note,
    createdAt: new Date(note.createdAt),
    updatedAt: new Date(note.updatedAt),
  } as Note;
}

export interface PrismaJobFixturesMap {
  frontendEngineer: Job;
  backendEngineer: Job;
  fullStackEngineer: Job;
  productDesigner: Job;
  engineeringManager: Job;
  devopsEngineer: Job;
  qaAutomationEngineer: Job;
  dataAnalyst: Job;
  technicalRecruiter: Job;
  platformEngineer: Job;
  juniorReactDeveloper: Job;
}

export const prismaJobFixtures: PrismaJobFixturesMap = {
  frontendEngineer: toPrismaJob(jobFixtures.frontendEngineer),
  backendEngineer: toPrismaJob(jobFixtures.backendEngineer),
  fullStackEngineer: toPrismaJob(jobFixtures.fullStackEngineer),
  productDesigner: toPrismaJob(jobFixtures.productDesigner),
  engineeringManager: toPrismaJob(jobFixtures.engineeringManager),
  devopsEngineer: toPrismaJob(jobFixtures.devopsEngineer),
  qaAutomationEngineer: toPrismaJob(jobFixtures.qaAutomationEngineer),
  dataAnalyst: toPrismaJob(jobFixtures.dataAnalyst),
  technicalRecruiter: toPrismaJob(jobFixtures.technicalRecruiter),
  platformEngineer: toPrismaJob(jobFixtures.platformEngineer),
  juniorReactDeveloper: toPrismaJob(jobFixtures.juniorReactDeveloper),
};

export const allPrismaJobFixtures: Job[] = seedJobFixtures.map((job) =>
  toPrismaJob(job),
);

export interface PrismaJobResultFixturesMap {
  createdProductDesigner: Job;
  updatedBackendEngineerInterview: Job;
}

export const prismaJobResultFixtures: PrismaJobResultFixturesMap = {
  createdProductDesigner: {
    ...prismaJobFixtures.productDesigner,
    ...jobResultFixtures.createdProductDesigner,
    status: JobStatus.SAVED,
    createdAt: new Date(jobResultFixtures.createdProductDesigner.createdAt),
    updatedAt: new Date(jobResultFixtures.createdProductDesigner.updatedAt),
  },
  updatedBackendEngineerInterview: {
    ...prismaJobFixtures.backendEngineer,
    ...jobResultFixtures.updatedBackendEngineerInterview,
    status: JobStatus.INTERVIEW,
    createdAt: new Date(
      jobResultFixtures.updatedBackendEngineerInterview.createdAt,
    ),
    updatedAt: new Date(
      jobResultFixtures.updatedBackendEngineerInterview.updatedAt,
    ),
  },
};

export interface PrismaContactFixturesMap {
  janeDoe: Contact;
  johnDoe: Contact;
  updatedContact: Contact;
}

export interface PrismaNoteFixturesMap {
  janeDoe: Note;
  johnDoe: Note;
  updatedNote: Note;
}

export const prismaContactFixtures: PrismaContactFixturesMap = {
  janeDoe: toPrismaContact(contactFixtures.janeDoe),
  johnDoe: toPrismaContact(contactFixtures.johnDoe),
  updatedContact: toPrismaContact(contactFixtures.updatedContact),
};

export const allPrismaContactFixtures: Contact[] = [
  prismaContactFixtures.janeDoe,
  prismaContactFixtures.johnDoe,
  prismaContactFixtures.updatedContact,
  ...seedContactFixtures.map((contact) => toPrismaContact(contact)),
];

export const prismaNoteFixtures: PrismaNoteFixturesMap = {
  janeDoe: toPrismaNote(noteFixtures.janeDoe),
  johnDoe: toPrismaNote(noteFixtures.johnDoe),
  updatedNote: toPrismaNote(noteFixtures.updatedNote),
};

export const allPrismaNoteFixtures: Note[] = [
  prismaNoteFixtures.janeDoe,
  prismaNoteFixtures.johnDoe,
  prismaNoteFixtures.updatedNote,
  ...seedNoteFixtures.map((note) => toPrismaNote(note)),
];
