console.log('Seed script started');

import { PrismaClient, JobStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { JobDto } from '@job-tracker-lite-angular/schemas';
import {
  getSeedContactsForJob,
  seedJobFixtures,
  SeedContactTemplate,
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
  position: job.position,
  link: job.link,
  description: job.description,
  company: job.company,
  status: statusMap[job.status] ?? JobStatus.REJECTED,
}));

async function main() {
  console.log('Starting seed...');
  const databaseUrl = process.env['DATABASE_URL']?.trim();
  console.log('DATABASE_URL:', databaseUrl ? 'set' : 'not set');

  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set');
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) });

  await prisma.$connect();
  console.log('Connected to database');

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
          title: note.title,
          body: note.body,
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
