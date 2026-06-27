import { z } from 'zod';

export const experienceLevelSchema = z.enum([
  'INTERN',
  'JUNIOR',
  'MID',
  'SENIOR',
  'LEAD',
  'EXPERT',
]);

export const workingStyleSchema = z.enum(['REMOTE', 'HYBRID', 'ON_SITE']);

export const careerPreferenceTypeSchema = z.enum([
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
]);

export const userProfileSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  email: z.email().or(z.literal('')).nullable().optional(),
  linkedin: z.url().or(z.literal('')).nullable().optional(),
  github: z.url().or(z.literal('')).nullable().optional(),
  webpage: z.url().or(z.literal('')).nullable().optional(),
  coreSkills: z.array(z.string()),
  experienceLevel: experienceLevelSchema.nullable().optional(),
  workingStyle: workingStyleSchema.nullable().optional(),
  careerType: careerPreferenceTypeSchema.nullable().optional(),
  isPublic: z.boolean().default(false),
  personalVisibility: z.boolean().default(true),
  contactVisibility: z.boolean().default(true),
  skillsVisibility: z.boolean().default(true),
  preferenceVisibility: z.boolean().default(true),
});

export const updateUserProfileSchema = userProfileSchema
  .omit({
    id: true,
    userId: true,
  })
  .partial();

export type UserProfileDto = z.infer<typeof userProfileSchema>;
export type UpdateUserProfileDto = z.infer<typeof updateUserProfileSchema>;
export type ExperienceLevel = z.infer<typeof experienceLevelSchema>;
export type WorkingStyle = z.infer<typeof workingStyleSchema>;
export type CareerPreferenceType = z.infer<typeof careerPreferenceTypeSchema>;
