import {
  allPrismaContactFixtures,
  allPrismaJobFixtures,
} from '../fixtures/prisma.fixtures';

export function createPrismaServiceMock(mockFactory: () => any) {
  return {
    testConnection: mockFactory(),
    job: {
      findMany: mockFactory(),
      create: mockFactory(),
      update: mockFactory(),
      findUniqueOrThrow: mockFactory(),
    },
    contact: {
      findMany: mockFactory(),
      create: mockFactory(),
      findFirst: mockFactory(),
      update: mockFactory(),
      delete: mockFactory(),
    },
    __fixtures: {
      jobs: allPrismaJobFixtures,
      contacts: allPrismaContactFixtures,
    },
  };
}
