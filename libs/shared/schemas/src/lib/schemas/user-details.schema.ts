import { z } from 'zod';
import { userListItemSchema } from './users.schema';
import { userProfileSchema } from './profile.schema';

const identitySchema = userListItemSchema.pick({ name: true, email: true });
const profileFieldsSchema = userProfileSchema.omit({ name: true, email: true });

export const userDetailsSchema = profileFieldsSchema
  .extend({
    user: userListItemSchema.pick({ id: true, name: true, email: true }),
  })
  .transform(({ user, ...profile }) => ({
    ...profile,
    name: user.name,
    email: user.email,
  }))
  .pipe(profileFieldsSchema.extend(identitySchema.shape));

export type UserDetailsDto = z.infer<typeof userDetailsSchema>;
