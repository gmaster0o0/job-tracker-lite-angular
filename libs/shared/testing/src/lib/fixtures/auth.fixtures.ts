import { AuthSessionDto } from '@job-tracker-lite-angular/schemas';
import { UserListItemDto } from '@job-tracker-lite-angular/schemas';

export const authUserIdFixture = 'user_123';

export const authSessionFixtures: {
  authenticated: AuthSessionDto;
  pendingDeletion: AuthSessionDto;
  guest: AuthSessionDto;
  recruiter: AuthSessionDto;
  moderator: AuthSessionDto;
} = {
  authenticated: {
    user: {
      id: authUserIdFixture,
      name: 'Admin User',
      email: 'admin@example.com',
      emailVerified: false,
      status: 'ACTIVE',
      role: 'ADMIN',
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
      role: 'USER',
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
  recruiter: {
    user: {
      id: 'user_rec',
      name: 'Recruiter User',
      email: 'recruiter@example.com',
      emailVerified: true,
      status: 'ACTIVE',
      role: 'RECRUITER',
      image: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
    session: {
      id: 'session_rec',
      token: 'token_rec',
      expiresAt: new Date('2027-04-29T09:00:00.000Z'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      ipAddress: null,
      userAgent: null,
      userId: 'user_rec',
    },
  },
  moderator: {
    user: {
      id: 'user_mod',
      name: 'Moderator User',
      email: 'moderator@example.com',
      emailVerified: true,
      status: 'ACTIVE',
      role: 'MODERATOR',
      image: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
    session: {
      id: 'session_mod',
      token: 'token_mod',
      expiresAt: new Date('2027-04-29T09:00:00.000Z'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      ipAddress: null,
      userAgent: null,
      userId: 'user_mod',
    },
  },
  guest: null,
};

export const userRoleFixtures = {
  admin: {
    id: 'user_admin',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN' as const,
    emailVerified: true,
    status: 'ACTIVE' as const,
    image: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  },
  moderator: {
    id: 'user_mod',
    name: 'Moderator User',
    email: 'moderator@example.com',
    role: 'MODERATOR' as const,
    emailVerified: true,
    status: 'ACTIVE' as const,
    image: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  },
  recruiter: {
    id: 'user_rec',
    name: 'Recruiter User',
    email: 'recruiter@example.com',
    role: 'RECRUITER' as const,
    emailVerified: true,
    status: 'ACTIVE' as const,
    image: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  },
  user: {
    id: 'user_basic',
    name: 'Basic User',
    email: 'basic@example.com',
    role: 'USER' as const,
    emailVerified: true,
    status: 'ACTIVE' as const,
    image: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  },
};

export const userListFixtures: UserListItemDto[] = [
  {
    id: 'user_admin',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
  },
  {
    id: 'user_mod',
    name: 'Moderator User',
    email: 'moderator@example.com',
    role: 'MODERATOR',
  },
  {
    id: 'user_rec',
    name: 'Recruiter User',
    email: 'recruiter@example.com',
    role: 'RECRUITER',
  },
  {
    id: 'user_basic',
    name: 'Basic User',
    email: 'basic@example.com',
    role: 'USER',
  },
];
