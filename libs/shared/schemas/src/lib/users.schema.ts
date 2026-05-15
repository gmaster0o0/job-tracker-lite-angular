import { z } from 'zod';

export const userSchema = z.object({
  id: z.cuid2(),
  email: z.string().email(),
  name: z.string(),
});
