import { z } from 'zod';
import { userListItemSchema } from './users.schema';
import { userProfileSchema } from './profile.schema';

const identitySchema = userListItemSchema.pick({
  id: true,
  role: true,
  name: true,
  email: true,
});
const profileFieldsSchema = userProfileSchema.omit({ name: true, email: true });

export const userDetailsSchema = profileFieldsSchema
  .extend({ user: identitySchema })
  .transform(({ user, ...profile }) => ({ ...profile, ...user }))
  .pipe(profileFieldsSchema.extend(identitySchema.shape));

export type UserDetailsDto = z.infer<typeof userDetailsSchema>;
