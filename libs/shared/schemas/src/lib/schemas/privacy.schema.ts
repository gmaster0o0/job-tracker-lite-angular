import z from 'zod';
import { required } from '../validators/required';

export const deleteJobApplicationsSchema = z.object({
  email: required.pipe(z.email()),
  cutoffDate: z.coerce.date().nullable(),
});

export type DeleteJobApplicationsDto = z.infer<
  typeof deleteJobApplicationsSchema
>;
