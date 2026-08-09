import {
  UserProfileDto,
  UpdateUserProfileDto,
} from '@job-tracker-lite-angular/schemas';
import { Role } from '@prisma/client';
import { authUserIdFixture } from './auth.fixtures';
import { userFixtures } from './user.fixtures';

// Vitest runs with `isolate: false`, so specs share this module and a fixture
// mutated in place leaks into every later spec file.
const frozen = <T>(profile: T): T => {
  Object.values(profile as Record<string, unknown>).forEach((value) => {
    if (Array.isArray(value)) {
      Object.freeze(value);
    }
  });
  return Object.freeze(profile);
};

export const userProfileFixtures = {
  johnDoe: frozen({
    id: 'profile_1',
    userId: authUserIdFixture,
    name: 'John Doe',
    title: 'Senior Software Engineer',
    city: 'New York',
    bio: 'Love building things with Angular and NestJS.',
    email: 'john.doe@example.com',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    webpage: 'https://johndoe.com',
    coreSkills: ['Angular', 'NestJS', 'TypeScript', 'Prisma'],
    experienceLevel: 'SENIOR',
    workingStyle: 'REMOTE',
    careerType: 'FULL_TIME',
    personalVisibility: 0,
    contactVisibility: 0,
    skillsVisibility: 0,
    preferenceVisibility: 0,
  } as UserProfileDto),
  empty: frozen({
    id: 'profile_2',
    userId: authUserIdFixture,
    coreSkills: [],
    personalVisibility: 0,
    contactVisibility: 0,
    skillsVisibility: 0,
    preferenceVisibility: 0,
    name: null,
    title: null,
    city: null,
    bio: null,
    email: null,
    linkedin: null,
    github: null,
    webpage: null,
    experienceLevel: null,
    workingStyle: null,
    careerType: null,
  } as UserProfileDto),
};

export const updateUserProfileFixtures = {
  updateJohnDoe: {
    title: 'Lead Software Engineer',
    experienceLevel: 'LEAD',
  } as UpdateUserProfileDto,
};

export const prismaUserProfileFixtures = {
  johnDoe: {
    ...userProfileFixtures.johnDoe,
  },
};

/**
 * Shape of `prisma.userProfile.findUnique({ include: { user: { select... } } })`,
 * as consumed by `UsersService.getUserProfile`/`updateUserProfile`.
 */
export interface PrismaUserProfileWithUserFixture {
  userId: string;
  title: string | null;
  city: string | null;
  bio: string | null;
  linkedin: string | null;
  github: string | null;
  webpage: string | null;
  coreSkills: string[];
  experienceLevel: string | null;
  workingStyle: string | null;
  careerType: string | null;
  personalVisibility: number;
  contactVisibility: number;
  skillsVisibility: number;
  preferenceVisibility: number;
  user: {
    id: string;
    role: Role;
    name: string;
    email: string;
  };
}

export const prismaUserProfileWithUserFixtures = {
  basic: frozen({
    userId: userFixtures.basic.id,
    title: 'Senior Developer',
    city: 'New York',
    bio: 'Experienced developer',
    linkedin: 'https://linkedin.com/in/user',
    github: 'https://github.com/user',
    webpage: 'https://user.dev',
    coreSkills: ['TypeScript', 'Angular'],
    experienceLevel: 'SENIOR',
    workingStyle: 'REMOTE',
    careerType: 'FULL_TIME',
    personalVisibility: 20,
    contactVisibility: 10,
    skillsVisibility: 20,
    preferenceVisibility: 20,
    user: {
      id: userFixtures.basic.id,
      role: Role.USER,
      name: userFixtures.basic.name,
      email: userFixtures.basic.email,
    },
  }),
  moderator: frozen({
    userId: userFixtures.moderator.id,
    title: null,
    city: null,
    bio: null,
    linkedin: null,
    github: null,
    webpage: null,
    coreSkills: [],
    experienceLevel: null,
    workingStyle: null,
    careerType: null,
    personalVisibility: 0,
    contactVisibility: 0,
    skillsVisibility: 0,
    preferenceVisibility: 0,
    user: {
      id: userFixtures.moderator.id,
      role: Role.MODERATOR,
      name: userFixtures.moderator.name,
      email: userFixtures.moderator.email,
    },
  }),
} as const satisfies Record<string, PrismaUserProfileWithUserFixture>;
