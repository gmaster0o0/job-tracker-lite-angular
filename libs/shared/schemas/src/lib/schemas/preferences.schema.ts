import { z } from 'zod';

export const themeSchema = z.enum(['light', 'dark', 'system']);

const userPreferencesFieldsSchema = z.object({
  theme: themeSchema,
  language: z.string().min(1),
  dateFormat: z.string().min(1),
});

export const userPreferencesSchema = userPreferencesFieldsSchema.extend({
  updatedAt: z.iso.datetime(),
});

export const updateUserPreferencesSchema = userPreferencesFieldsSchema
  .partial()
  .extend({
    updatedAt: z.iso.datetime(),
  });

export type Theme = z.infer<typeof themeSchema>;
export type UserPreferencesDto = z.infer<typeof userPreferencesSchema>;
export type UpdateUserPreferencesDto = z.infer<
  typeof updateUserPreferencesSchema
>;

// "Never synced" sentinel: an epoch-zero updatedAt so any real timestamp
// from either side of a sync comparison beats it. language defaults to
// 'system' (not a hardcoded language) so a fresh user's language resolves
// via system-language detection before falling back to a fixed default.
export const DEFAULT_USER_PREFERENCES: UserPreferencesDto = {
  theme: 'light',
  language: 'system',
  dateFormat: 'DD-MM-YYYY',
  updatedAt: new Date(0).toISOString(),
};
