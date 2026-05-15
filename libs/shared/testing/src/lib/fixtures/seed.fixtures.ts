import { ContactDto, JobDto, NoteDto } from '@job-tracker-lite-angular/schemas';
import { jobFixtures } from './jobs.fixtures';

export interface SeedContactTemplate {
  name: string;
  email: string;
  phoneNumber: string;
}

export interface SeedNoteTemplate {
  title: string;
  body: string;
}

export const seedJobFixtures: readonly JobDto[] = [
  jobFixtures.frontendEngineer,
  jobFixtures.backendEngineer,
  jobFixtures.fullStackEngineer,
  jobFixtures.productDesigner,
  jobFixtures.engineeringManager,
  jobFixtures.devopsEngineer,
  jobFixtures.qaAutomationEngineer,
  jobFixtures.dataAnalyst,
  jobFixtures.technicalRecruiter,
  jobFixtures.platformEngineer,
  jobFixtures.juniorReactDeveloper,
];

const contactNamePool = [
  ['Alex Kovacs', 'Maya Horvath'],
  ['Daniel Szabo', 'Reka Toth'],
  ['Peter Nagy', 'Anna Fodor'],
  ['Levente Varga', 'Eszter Simon'],
] as const;

const noteContentPool = [
  'Follow up with the recruiter about the next steps.',
  'Research the company culture and recent news.',
  'Prepare answers for common interview questions.',
  'Review the job description and requirements.',
] as const;

const noteTitlePool = [
  'Follow-up',
  'Company Research',
  'Interview Prep',
  'Job Description Review',
] as const;

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function aliasify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '.');
}

export function getSeedContactsForJob(
  jobIndex: number,
  company: string,
): SeedContactTemplate[] {
  const contactCount = jobIndex % 3;

  return Array.from({ length: contactCount }, (_, contactIndex) => {
    const [primaryName, secondaryName] =
      contactNamePool[jobIndex % contactNamePool.length];
    const name = contactIndex === 0 ? primaryName : secondaryName;

    return {
      name,
      email: `${aliasify(name)}.${jobIndex + 1}@${slugify(company)}.example.com`,
      phoneNumber: `+36-1-555-${String(1000 + jobIndex * 10 + contactIndex)}`,
    };
  });
}

export function getSeedNotesForJob(jobIndex: number): SeedNoteTemplate[] {
  const noteCount = (jobIndex % 2) + 1; // 1 or 2 notes per job

  return Array.from({ length: noteCount }, (_, noteIndex) => ({
    title: noteTitlePool[(jobIndex + noteIndex) % noteTitlePool.length],
    body: noteContentPool[(jobIndex + noteIndex) % noteContentPool.length],
  }));
}

export const seedContactFixtures: readonly ContactDto[] = (() => {
  let contactIdCounter = 1;
  return seedJobFixtures.flatMap((job, jobIndex) =>
    getSeedContactsForJob(jobIndex, job.company).map(
      (contact, contactIndex) => ({
        id: `ck12345679${String(contactIdCounter++).padStart(2, '0')}`,
        jobId: job.id,
        ...contact,
        createdAt: '2026-04-29T09:00:00.000Z',
        updatedAt: '2026-04-29T09:00:00.000Z',
      }),
    ),
  );
})();

export const seedNoteFixtures: readonly NoteDto[] = (() => {
  let noteIdCounter = 1;
  return seedJobFixtures.flatMap((job, jobIndex) =>
    getSeedNotesForJob(jobIndex).map((note, noteIndex) => ({
      id: `ck12345679${String(noteIdCounter++).padStart(2, '0')}`,
      jobId: job.id,
      ...note,
      createdAt: '2026-04-29T09:00:00.000Z',
      updatedAt: '2026-04-29T09:00:00.000Z',
    })),
  );
})();
