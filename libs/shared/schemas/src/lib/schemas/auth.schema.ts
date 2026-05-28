import { z } from 'zod';
import { errorCodes } from '../error-codes';
import { required } from '../validators/required';

const hasNumber = (value: string): boolean => /\d/.test(value);
const hasUppercase = (value: string): boolean => /[A-Z]/.test(value);
const hasLowercase = (value: string): boolean => /[a-z]/.test(value);
export const MIN_PASSWORD_LENGTH = 8;

export const basicPasswordSchema = z.string().superRefine((value, ctx) => {
  if (value.length < MIN_PASSWORD_LENGTH) {
    ctx.addIssue({
      code: 'custom',
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      errorCode: errorCodes.min_length,
    });
  }

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

export const changePasswordSchema = z
  .object({
    currentPassword: required,
    newPassword: basicPasswordSchema,
    confirmNewPassword: required,
  })
  .superRefine((value, ctx) => {
    if (value.newPassword !== value.confirmNewPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password confirmation must match password',
        path: ['confirmNewPassword'],
        errorCode: errorCodes.password_mismatch,
      });
    }
  });

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

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
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  userId: z.string(),
});

export const authSessionResponseSchema = z
  .object({
    user: authUserSchema,
    session: authSessionSchema,
  })
  .nullable();

export type AuthSessionDto = z.infer<typeof authSessionResponseSchema>;
