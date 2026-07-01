console.log('Seed script started');

import { PrismaClient, JobStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from 'better-auth/crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { JobDto } from '@job-tracker-lite-angular/schemas';
import {
  getSeedContactsForJob,
  seedJobFixtures,
  SeedContactTemplate,
  getSeedNotesForJob,
  SeedNoteTemplate,
  userProfileFixtures,
} from '@job-tracker-lite-angular/testing';

const envPath = path.join(process.cwd(), '.env');
dotenv.config({ path: envPath });

const seedUserEmail = 'user@example.com';
const seedUserPassword = 'Demo1234';
const systemUserId = 'seed-user';
const seedCredentialAccountId = 'seed-user-credential';

const seedJobs = seedJobFixtures.map((job: JobDto) => {
  if (job.link == null) {
    throw new Error(`Seed job missing link for job ${job.position}`);
  }

  return {
    position: job.position,
    link: job.link,
    description: job.description,
    company: job.company,
    status: job.status as JobStatus,
  };
});

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

  const seedUser = await prisma.user.upsert({
    where: { id: systemUserId },
    update: {
      name: 'Demo User',
      email: seedUserEmail,
      pendingEmail: null,
      emailVerified: true,
    },
    create: {
      id: systemUserId,
      name: 'Demo User',
      email: seedUserEmail,
      pendingEmail: null,
      emailVerified: true,
    },
  });

  await prisma.emailChangeToken.deleteMany({
    where: {
      userId: seedUser.id,
    },
  });

  const seedUserPasswordHash = await hashPassword(seedUserPassword);

  await prisma.account.deleteMany({
    where: {
      userId: seedUser.id,
      providerId: 'credential',
    },
  });

  await prisma.account.create({
    data: {
      id: seedCredentialAccountId,
      accountId: seedUser.id,
      providerId: 'credential',
      userId: seedUser.id,
      password: seedUserPasswordHash,
    },
  });

  console.log('Seeding User Profile...');

  const {
    id: _id,
    userId: _userId,
    ...profileFixture
  } = userProfileFixtures.johnDoe;
  await prisma.userProfile.upsert({
    where: { userId: seedUser.id },
    update: {
      ...profileFixture,
      name: 'Demo User', // Keeping the name consistent with the seed user
      isPublic: true,
      personalVisibility: true,
      contactVisibility: true,
      skillsVisibility: true,
      preferenceVisibility: true,
    },
    create: {
      ...profileFixture,
      userId: seedUser.id,
      name: 'Demo User',
      isPublic: true,
      personalVisibility: true,
      contactVisibility: true,
      skillsVisibility: true,
      preferenceVisibility: true,
    },
  });

  for (const [jobIndex, job] of seedJobs.entries()) {
    const seededJob = await prisma.job.upsert({
      where: { link: job.link },
      update: {
        position: job.position,
        description: job.description,
        company: job.company,
        status: job.status,
        userId: seedUser.id,
      },
      create: {
        ...job,
        userId: seedUser.id,
      },
    });

    const contacts = getSeedContactsForJob(jobIndex, job.company);
    await prisma.contact.deleteMany({ where: { jobId: seededJob.id } });

    if (contacts.length > 0) {
      await prisma.contact.createMany({
        data: contacts.map((contact: SeedContactTemplate) => ({
          jobId: seededJob.id,
          userId: seedUser.id,
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
          userId: seedUser.id,
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
  console.log(`Demo login: ${seedUserEmail} / ${seedUserPassword}`);
}

main().catch(async (error) => {
  console.error('Failed to seed jobs.', error);
  process.exitCode = 1;
});
