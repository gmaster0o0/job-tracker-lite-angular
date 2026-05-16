import { z } from 'zod';
import { errorCodes } from '../error-codes';

export const required = z.string().superRefine((value, ctx) => {
  if (!value || value.trim().length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'This field is required',
      errorCode: errorCodes.required,
    });
  }
});
