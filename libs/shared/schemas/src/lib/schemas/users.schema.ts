import { z } from 'zod';
import { Role } from '@prisma/client';

export const userSchema = z.object({
  id: z.cuid2(),
  email: z.email(),
  name: z.string(),
  role: z.enum(Role).optional().default(Role.USER),
});

export type UserDto = z.infer<typeof userSchema>;

export const userListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  role: z.enum(Role),
});

export type UserListItemDto = z.infer<typeof userListItemSchema>;

export const updateUserRoleSchema = z.object({
  role: z.enum(Role),
});

export type UpdateUserRoleDto = z.infer<typeof updateUserRoleSchema>;
