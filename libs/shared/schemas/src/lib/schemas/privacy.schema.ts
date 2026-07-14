import z from 'zod';
import { required } from '../validators/required';

export const deleteJobApplicationsSchema = z.object({
  email: required.pipe(z.email()),
});

export type DeleteJobApplicationsDto = z.infer<
  typeof deleteJobApplicationsSchema
>;
