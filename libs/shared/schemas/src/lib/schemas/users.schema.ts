import { z } from 'zod';

export const userSchema = z.object({
  id: z.cuid2(),
  email: z.email(),
  name: z.string(),
});

export type UserDto = z.infer<typeof userSchema>;
