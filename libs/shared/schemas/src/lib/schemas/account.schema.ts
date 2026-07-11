import { z } from 'zod';
import { basicPasswordSchema, supportLangSchema } from './auth.schema';
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
  language: supportLangSchema,
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

export const deleteAccountSchema = z.object({
  language: supportLangSchema,
});

export type DeleteAccountDto = z.infer<typeof deleteAccountSchema>;

export const accountStatusSchema = z.enum(['active', 'pending_deletion']);
export type AccountStatusDto = z.infer<typeof accountStatusSchema>;

export const accountDeletionStatusSchema = z.object({
  status: accountStatusSchema,
  gracePeriodRequestedAt: z.coerce.date().nullable(),
  scheduledDeletionAt: z.coerce.date().nullable(),
  gracePeriodDays: z.number().int().positive(),
});

export type AccountDeletionStatusDto = z.infer<
  typeof accountDeletionStatusSchema
>;
