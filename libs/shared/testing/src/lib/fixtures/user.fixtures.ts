import { Role } from '@prisma/client';

export interface UserFixture {
  id: string;
  name: string;
  slug: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  status: 'ACTIVE' | 'PENDING_DELETION';
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** A persona the seed script writes to the database. */
export interface SeededUserFixture extends UserFixture {
  credentialAccountId: string;
}

/** Password every seeded account shares. Local development only. */
export const userFixturePassword = 'Demo1234';

const fixtureDate = new Date('2026-01-01T00:00:00.000Z');

export const userFixtures = {
  admin: {
    id: 'seed-user',
    credentialAccountId: 'seed-user-credential',
    name: 'Demo User',
    slug: 'demo-user',
    email: 'user@example.com',
    role: Role.ADMIN,
    emailVerified: true,
    status: 'ACTIVE',
    image: null,
    createdAt: fixtureDate,
    updatedAt: fixtureDate,
  },
  moderator: {
    id: 'seed-user-moderator',
    credentialAccountId: 'seed-user-moderator-credential',
    name: 'Moderator User',
    slug: 'moderator-user',
    email: 'moderator@example.com',
    role: Role.MODERATOR,
    emailVerified: true,
    status: 'ACTIVE',
    image: null,
    createdAt: fixtureDate,
    updatedAt: fixtureDate,
  },
  recruiter: {
    id: 'seed-user-recruiter',
    credentialAccountId: 'seed-user-recruiter-credential',
    name: 'Recruiter User',
    slug: 'recruiter-user',
    email: 'recruiter@example.com',
    role: Role.RECRUITER,
    emailVerified: true,
    status: 'ACTIVE',
    image: null,
    createdAt: fixtureDate,
    updatedAt: fixtureDate,
  },
  /**
   * Plain USER role. Not written by the seed script - it exists so specs have a
   * non-privileged persona to authorise against.
   */
  basic: {
    id: 'seed-user-basic',
    name: 'Basic User',
    slug: 'basic-user',
    email: 'basic@example.com',
    role: Role.USER,
    emailVerified: true,
    status: 'ACTIVE',
    image: null,
    createdAt: fixtureDate,
    updatedAt: fixtureDate,
  },
} as const satisfies Record<string, UserFixture | SeededUserFixture>;

/** Every persona, in the order the users list renders them. */
export const userFixtureList: readonly UserFixture[] = [
  userFixtures.admin,
  userFixtures.moderator,
  userFixtures.recruiter,
  userFixtures.basic,
];
