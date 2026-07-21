import { z } from 'zod';

export const healthIndicatorSchema = z.object({
  status: z.enum(['up', 'down']),
  uptime: z.string().optional(),
  timestamp: z.string().optional(),
});
export type HealthIndicator = z.infer<typeof healthIndicatorSchema>;

export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  info: z.object({
    server: healthIndicatorSchema.optional(),
    database: healthIndicatorSchema.optional(),
    redis: healthIndicatorSchema.optional(),
  }),
  error: z.object({
    server: healthIndicatorSchema.optional(),
    database: healthIndicatorSchema.optional(),
    redis: healthIndicatorSchema.optional(),
  }),
  details: z.object({
    server: healthIndicatorSchema.optional(),
    database: healthIndicatorSchema.optional(),
    redis: healthIndicatorSchema.optional(),
  }),
});

export type HealthResponseDto = z.infer<typeof healthResponseSchema>;
