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
export const JobSchema = z.object({
  id: z.cuid2(),
  position: z.string(),
  link: z.string().optional(),
  description: z.string().optional(),
  company: z.string(),
  status: jobStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type JobDto = z.infer<typeof JobSchema>;

//create job schema with DTO
export const createJobSchema = z.object({
  position: z.string().min(1),
  link: z.url().optional(),
  company: z.string().min(1),
  description: z.string().optional(),
});
export type CreateJobDto = z.infer<typeof createJobSchema>;

//update job schema with DTO
export const updateJobSchema = createJobSchema.partial().extend({
  status: jobStatusSchema.optional(),
});
export type UpdateJobDto = z.infer<typeof updateJobSchema>;

export const jobIdParamSchema = z.object({
  id: z.cuid2(),
});
