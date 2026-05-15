import { z } from 'zod';
//Job status can be one of the following: applied, interviewing, offer, rejected
export const jobStatusSchema = z.enum([
  'saved',
  'applied',
  'interview',
  'job offered',
  'rejected',
]);
export type JobStatusDto = z.infer<typeof jobStatusSchema>;

//Job schema with DTO
export const jobSchema = z.object({
  id: z.cuid2(),
  position: z.string(),
  company: z.string(),
  link: z.url().nullable(),
  description: z.string().nullable(),
  status: jobStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type JobDto = z.infer<typeof jobSchema>;

//create job schema with DTO
export const createJobSchema = z.object({
  position: z.string().min(1),
  company: z.string().min(1),
  link: z.url().nullable(),
  description: z.string().nullable(),
  status: jobStatusSchema.default('saved'),
});
export type CreateJobDto = z.infer<typeof createJobSchema>;

//update job schema with DTO
export const updateJobSchema = createJobSchema.partial();
export type UpdateJobDto = z.infer<typeof updateJobSchema>;

export const jobIdParamSchema = z.object({
  id: z.cuid2(),
});

export const jobResponseSchema = z.object({
  id: z.cuid2(),
  position: z.string(),
  company: z.string(),
  link: z.url().nullable(),
  description: z.string().nullable(),
  status: jobStatusSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type JobResponseDto = z.infer<typeof jobResponseSchema>;
