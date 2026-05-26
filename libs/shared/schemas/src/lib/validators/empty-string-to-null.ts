import { z } from 'zod';

export function emptyStringToNull<T extends z.ZodType<any, any, any>>(
  schema: T,
) {
  return z.preprocess((value) => (value === '' ? null : value), schema);
}
