import { JobStatus } from '@prisma/client';
import { PrismaService } from './lib/prisma.service';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { JobDto } from '@job-tracker-lite-angular/api-interfaces';
import {
  getSeedContactsForJob,
  seedJobFixtures,
  SeedContactTemplate,
} from '@job-tracker-lite-angular/shared-testing';
import {
  getSeedContactsForJob,
  seedJobFixtures,
  SeedContactTemplate,
} from '@job-tracker-lite-angular/testing';
import {
  getSeedNotesForJob,
  SeedNoteTemplate,
} from '@job-tracker-lite-angular/shared-testing';
import {
  getSeedNotesForJob,
  SeedNoteTemplate,
} from '@job-tracker-lite-angular/testing';

const envPath = path.join(process.cwd(), '.env');
dotenv.config({ path: envPath });

const statusMap: Record<string, JobStatus> = {
  saved: JobStatus.SAVED,
  applied: JobStatus.APPLIED,
  interview: JobStatus.INTERVIEW,
  'job offered': JobStatus.JOB_OFFERED,
  rejected: JobStatus.REJECTED,
};

const seedJobs = seedJobFixtures.map((job: JobDto) => ({
  ...job,
  status: statusMap[job.status] ?? JobStatus.REJECTED,
}));

async function main() {
  const prisma = new PrismaService();

  await prisma.$connect();

  for (const [jobIndex, job] of seedJobs.entries()) {
    const seededJob = await prisma.job.upsert({
      where: { link: job.link },
      update: {
        position: job.position,
        description: job.description,
        company: job.company,
        status: job.status,
      },
      create: job,
    });

    const contacts = getSeedContactsForJob(jobIndex, job.company);
    await prisma.contact.deleteMany({ where: { jobId: seededJob.id } });

    if (contacts.length > 0) {
      await prisma.contact.createMany({
        data: contacts.map((contact: SeedContactTemplate) => ({
          jobId: seededJob.id,
          name: contact.name,
          email: contact.email,
          phoneNumber: contact.phoneNumber,
        })),
      });
    }

    const notes = getSeedNotesForJob(jobIndex);
    await prisma.note.deleteMany({ where: { jobId: seededJob.id } });

    if (notes.length > 0) {
      await prisma.note.createMany({
        data: notes.map((note: SeedNoteTemplate) => ({
          jobId: seededJob.id,
          content: note.content,
        })),
      });
    }
  }

  await prisma.$disconnect();

  console.log(
    `Seeded ${seedJobs.length} jobs with 0-2 contacts and 0-1 notes each (deterministic).`,
  );
}

main().catch(async (error) => {
  console.error('Failed to seed jobs.', error);
  process.exitCode = 1;
});
