import { ContactDto, JobDto } from '@job-tracker-lite-angular/api-interfaces';
import { jobFixtures } from './jobs.fixtures';

export interface SeedContactTemplate {
  name: string;
  email: string;
  phoneNumber: string;
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

export const seedContactFixtures: readonly ContactDto[] =
  seedJobFixtures.flatMap((job, jobIndex) =>
    getSeedContactsForJob(jobIndex, job.company).map(
      (contact, contactIndex) => ({
        id: job.id * 10 + contactIndex + 1,
        jobId: job.id,
        ...contact,
        createdAt: '2026-04-29T09:00:00.000Z',
        updatedAt: '2026-04-29T09:00:00.000Z',
      }),
    ),
  );
