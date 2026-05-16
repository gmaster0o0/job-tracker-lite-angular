import { z } from 'zod';
import { JobStatus as PrismaJobStatus } from '@prisma/client';
import { required } from '../validators';
//Job status can be one of the following: applied, interviewing, offer, rejected
export const jobStatusSchema = z.enum(PrismaJobStatus);
export type JobStatusDto = z.infer<typeof jobStatusSchema>;
// Exporting the JobStatus to hide the Prisma enum from the rest of the application
// and to ensure that only valid statuses are used throughout the app
export const JobStatus = PrismaJobStatus;

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
  position: z.string().pipe(required),
  company: z.string().pipe(required),
  link: z.url().nullish(),
  description: z.string().nullish(),

  status: jobStatusSchema.default(JobStatus.SAVED),
});
export type CreateJobDto = z.infer<typeof createJobSchema>;

//update job schema with DTO
export const updateJobSchema = createJobSchema.partial();
export type UpdateJobDto = z.infer<typeof updateJobSchema>;

//update job status schema with DTO
export const updateJobStatusSchema = z.object({
  status: jobStatusSchema,
});
export type UpdateJobStatusDto = z.infer<typeof updateJobStatusSchema>;

//job id param schema
export const jobIdParamSchema = z.cuid2();
