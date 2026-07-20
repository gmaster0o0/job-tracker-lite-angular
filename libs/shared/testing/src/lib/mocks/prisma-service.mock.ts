import {
  allPrismaContactFixtures,
  allPrismaJobFixtures,
} from '../fixtures/prisma.fixtures';

export type MockAccountStatus = 'ACTIVE' | 'PENDING_DELETION' | 'SUSPENDED';

export function createPrismaServiceMock(mockFactory: () => any) {
  return {
    testConnection: mockFactory(),
    job: {
      findMany: mockFactory(),
      create: mockFactory(),
      update: mockFactory(),
      delete: mockFactory(),
      findFirstOrThrow: mockFactory(),
      findUniqueOrThrow: mockFactory(),
      deleteMany: mockFactory(),
    },
    contact: {
      findMany: mockFactory(),
      create: mockFactory(),
      findFirst: mockFactory(),
      update: mockFactory(),
      delete: mockFactory(),
      deleteMany: mockFactory(),
    },
    note: {
      findMany: mockFactory(),
      create: mockFactory(),
      update: mockFactory(),
      delete: mockFactory(),
      deleteMany: mockFactory(),
    },
    user: {
      findUnique: mockFactory(),
      findUniqueOrThrow: mockFactory(),
      findFirst: mockFactory(),
      update: mockFactory(),
      deleteMany: mockFactory(),
    },
    userProfile: {
      findUnique: mockFactory(),
      create: mockFactory(),
      update: mockFactory(),
      upsert: mockFactory(),
    },
    session: {
      deleteMany: mockFactory(),
    },
    emailChangeToken: {
      findUnique: mockFactory(),
      delete: mockFactory(),
      deleteMany: mockFactory(),
      create: mockFactory(),
    },
    accountDeletionToken: {
      findUnique: mockFactory(),
      delete: mockFactory(),
      deleteMany: mockFactory(),
      create: mockFactory(),
    },
    $transaction: mockFactory(),
    __fixtures: {
      jobs: allPrismaJobFixtures,
      contacts: allPrismaContactFixtures,
    },
  };
}
