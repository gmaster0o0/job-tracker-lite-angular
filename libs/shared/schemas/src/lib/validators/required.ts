import { z } from 'zod';
import { errorCodes } from '../error-codes';

/**
 * A required is a more Angular like required validator.
 * It checks if the value is not empty or whitespace only.
 * It has better error messages than the default zod minLength validator.
 */
export const required = z.string().superRefine((value, ctx) => {
  if (!value || value.trim().length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'This field is required',
      errorCode: errorCodes.required,
    });
  }
});
