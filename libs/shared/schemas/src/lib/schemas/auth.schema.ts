import { z } from 'zod';
import { errorCodes } from '../error-codes';
import { required } from '../validators/required';

const hasNumber = (value: string): boolean => /\d/.test(value);
const hasUppercase = (value: string): boolean => /[A-Z]/.test(value);
const hasLowercase = (value: string): boolean => /[a-z]/.test(value);
export const MIN_PASSWORD_LENGTH = 8;

export const basicPasswordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH)
  .superRefine((value, ctx) => {
    if (!hasNumber(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one number',
        errorCode: errorCodes.need_number,
      });
    }

    if (!hasUppercase(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one uppercase letter',
        errorCode: errorCodes.need_uppercase,
      });
    }

    if (!hasLowercase(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must contain at least one lowercase letter',
        errorCode: errorCodes.need_lowercase,
      });
    }
  });

export type BasicPasswordDto = z.infer<typeof basicPasswordSchema>;

export const loginSchema = z.object({
  email: required.pipe(z.email()),
  password: required,
});

export type LoginDto = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: required,
    email: required.pipe(z.email()),
    password: basicPasswordSchema,
    confirmPassword: required,
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password confirmation must match password',
        path: ['confirmPassword'],
        errorCode: errorCodes.password_mismatch,
      });
    }
  });

export type RegisterDto = z.infer<typeof registerSchema>;

export const supportLangSchema = z.enum(['en', 'hu']);
export type SupportLang = z.infer<typeof supportLangSchema>;

export const forgotPasswordSchema = z.object({
  email: required.pipe(z.email()),
  language: supportLangSchema,
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

export const sendVerificationEmailSchema = z.object({
  email: required.pipe(z.email()),
  language: supportLangSchema,
});

export type SendVerificationEmailDto = z.infer<
  typeof sendVerificationEmailSchema
>;

export const resetPasswordSchema = z
  .object({
    token: z.string(),
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

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export const authSessionSchema = z.object({
  id: z.string(),
  token: z.string(),
  expiresAt: z.union([z.string(), z.date()]),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  ipAddress: z.string().nullish(),
  userAgent: z.string().nullish(),
  userId: z.string(),
});

export const authSessionResponseSchema = z
  .object({
    user: authUserSchema,
    session: authSessionSchema,
  })
  .nullable();

export type AuthSessionDto = z.infer<typeof authSessionResponseSchema>;
