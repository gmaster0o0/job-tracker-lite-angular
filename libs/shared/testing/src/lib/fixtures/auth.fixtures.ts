import { AuthSessionDto } from '@job-tracker-lite-angular/schemas';

export const authUserIdFixture = 'user_123';

export const authSessionFixtures: {
  authenticated: AuthSessionDto;
  pendingDeletion: AuthSessionDto;
  guest: AuthSessionDto;
} = {
  authenticated: {
    user: {
      id: authUserIdFixture,
      name: 'Admin User',
      email: 'admin@example.com',
      emailVerified: false,
      status: 'ACTIVE',
      image: null,
      createdAt: new Date('2026-04-29T09:00:00.000Z'),
      updatedAt: new Date('2026-04-29T09:00:00.000Z'),
    },
    session: {
      id: 'session_123',
      token: 'token_123',
      expiresAt: new Date('2027-04-29T09:00:00.000Z'),
      createdAt: new Date('2026-04-29T09:00:00.000Z'),
      updatedAt: new Date('2026-04-29T09:00:00.000Z'),
      ipAddress: null,
      userAgent: null,
      userId: authUserIdFixture,
    },
  },
  pendingDeletion: {
    user: {
      id: authUserIdFixture,
      name: 'Admin User',
      email: 'admin@example.com',
      emailVerified: false,
      status: 'PENDING_DELETION',
      image: null,
      createdAt: new Date('2026-04-29T09:00:00.000Z'),
      updatedAt: new Date('2026-04-29T09:00:00.000Z'),
    },
    session: {
      id: 'session_123',
      token: 'token_123',
      expiresAt: new Date('2027-04-29T09:00:00.000Z'),
      createdAt: new Date('2026-04-29T09:00:00.000Z'),
      updatedAt: new Date('2026-04-29T09:00:00.000Z'),
      ipAddress: null,
      userAgent: null,
      userId: authUserIdFixture,
    },
  },
  guest: null,
};
