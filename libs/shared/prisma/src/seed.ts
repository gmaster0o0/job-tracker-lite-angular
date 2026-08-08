console.log('Seed script started');

import { PrismaClient, JobStatus, Prisma } from '@prisma/client';
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
  seedUserFixtures,
  seedUserFixtureList,
  seedUserPassword,
  SeededUserFixture,
  userProfileFixtures,
  userPreferencesFixtures,
} from '@job-tracker-lite-angular/testing';

const envPath = path.join(process.cwd(), '.env');
dotenv.config({ path: envPath });

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

async function upsertSeedUser(
  prisma: PrismaClient,
  user: SeededUserFixture,
  extra: Partial<Prisma.UserCreateInput> = {},
) {
  const record = await prisma.user.upsert({
    where: { id: user.id },
    update: {
      name: user.name,
      slug: user.slug,
      email: user.email,
      emailVerified: true,
      role: user.role,
      ...extra,
    },
    create: {
      id: user.id,
      name: user.name,
      slug: user.slug,
      email: user.email,
      emailVerified: true,
      role: user.role,
      ...extra,
    },
  });

  await prisma.emailChangeToken.deleteMany({ where: { userId: user.id } });
  await prisma.account.deleteMany({
    where: { userId: user.id, providerId: 'credential' },
  });

  await prisma.account.create({
    data: {
      id: user.credentialAccountId,
      accountId: user.id,
      providerId: 'credential',
      userId: user.id,
      password: await hashPassword(seedUserPassword),
    },
  });

  return record;
}

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

  const seedUser = await upsertSeedUser(prisma, seedUserFixtures.demo, {
    pendingEmail: null,
    preferences: userPreferencesFixtures.johnDoe,
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
      name: seedUserFixtures.demo.name, // Keep the profile in step with the user
      personalVisibility: 0,
      contactVisibility: 0,
      skillsVisibility: 0,
      preferenceVisibility: 0,
    },
    create: {
      ...profileFixture,
      userId: seedUser.id,
      name: seedUserFixtures.demo.name,
      personalVisibility: 0,
      contactVisibility: 0,
      skillsVisibility: 0,
      preferenceVisibility: 0,
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

  console.log('Seeding Recruiter user...');
  await upsertSeedUser(prisma, seedUserFixtures.recruiter);

  console.log('Seeding Moderator user...');
  await upsertSeedUser(prisma, seedUserFixtures.moderator);

  await prisma.$disconnect();

  console.log(
    `Seeded ${seedJobs.length} jobs with 0-2 contacts and 0-1 notes each (deterministic).`,
  );

  for (const user of seedUserFixtureList) {
    console.log(
      `${user.role} login: ${user.email} / ${seedUserPassword} (/profile/${user.slug})`,
    );
  }
}

main().catch(async (error) => {
  console.error('Failed to seed jobs.', error);
  process.exitCode = 1;
});
