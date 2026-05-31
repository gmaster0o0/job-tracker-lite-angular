import { z } from 'zod';
import { basicPasswordSchema } from './auth.schema';
import { errorCodes } from '../error-codes';
import { required } from '../validators/required';

export const accountSettingsSchema = z.object({
  email: z.email(),
  pendingEmail: z.email().nullable(),
  emailVerified: z.boolean(),
});

export type AccountSettingsDto = z.infer<typeof accountSettingsSchema>;

export const changeEmailRequestSchema = z.object({
  newEmail: required.pipe(z.email()),
});

export type ChangeEmailRequestDto = z.infer<typeof changeEmailRequestSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: required,
    newPassword: basicPasswordSchema,
    confirmPassword: required,
  })
  .superRefine((value, ctx) => {
    if (value.newPassword !== value.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password confirmation must match password',
        path: ['confirmPassword'],
        errorCode: errorCodes.password_mismatch,
      });
    }
  });

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
