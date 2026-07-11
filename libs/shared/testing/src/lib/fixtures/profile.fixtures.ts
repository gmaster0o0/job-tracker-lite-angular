import {
  UserProfileDto,
  UpdateUserProfileDto,
} from '@job-tracker-lite-angular/schemas';
import { authUserIdFixture } from './auth.fixtures';

export const userProfileFixtures = {
  johnDoe: {
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
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UserProfileDto,
  empty: {
    id: 'profile_2',
    userId: authUserIdFixture,
    coreSkills: [],
    personalVisibility: 0,
    contactVisibility: 0,
    skillsVisibility: 0,
    preferenceVisibility: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
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
  } as UserProfileDto,
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
