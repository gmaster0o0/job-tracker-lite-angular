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
      delete: mockFactory(),
      findFirstOrThrow: mockFactory(),
      findUniqueOrThrow: mockFactory(),
    },
    contact: {
      findMany: mockFactory(),
      create: mockFactory(),
      findFirst: mockFactory(),
      update: mockFactory(),
      delete: mockFactory(),
    },
    note: {
      findMany: mockFactory(),
      create: mockFactory(),
      update: mockFactory(),
      delete: mockFactory(),
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

export function createPrismaHealthIndicatorMock(result?: any) {
  return {
    pingCheck: async () => result ?? { database: { status: 'down' } },
  };
}

export function createUptimeHealthIndicatorMock(result?: any) {
  return {
    isHealthy: async () =>
      result ?? {
        server: {
          status: 'up',
          uptime: process.uptime(),
          timestamp: Date.now(),
        },
      },
  };
}

export function createHealthCheckServiceMock(serverOnly = true) {
  return {
    check: async () => {
      if (serverOnly) {
        return {
          server: {
            status: 'up',
            uptime: process.uptime(),
            timestamp: Date.now(),
          },
        };
      }
      return {
        server: {
          status: 'up',
          uptime: process.uptime(),
          timestamp: Date.now(),
        },
        database: { status: 'down' },
      };
    },
  };
}
