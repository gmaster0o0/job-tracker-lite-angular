import { z } from 'zod';
import { HttpMethod, MockResponse } from './registry';
import {
  jobSchema,
  authSessionResponseSchema,
  authUserSchema,
} from '@job-tracker-lite-angular/schemas';

// Simple mapping from path/method to Zod schemas.
// Extend as needed for other API endpoints.
export function schemaFor(
  path: string,
  method: HttpMethod,
): z.ZodTypeAny | null {
  if (path.match(/^\/api\/jobs$/)) {
    if (method === 'GET') return z.array(jobSchema);
    if (method === 'POST') return jobSchema;
  }

  if (path.match(/^\/api\/jobs\/[^/]+$/)) {
    if (method === 'GET' || method === 'PATCH' || method === 'PUT')
      return jobSchema;
  }

  if (path.match(/^\/api\/jobs\/[^/]+\/status$/)) {
    if (method === 'PATCH') return jobSchema;
  }

  if (path.match(/^\/api\/auth\/get-session$/)) {
    if (method === 'GET') return authSessionResponseSchema;
  }

  if (
    path.match(/^\/api\/auth\/sign-in$/) ||
    path.match(/^\/api\/auth\/sign-up$/)
  ) {
    if (method === 'POST') return authSessionResponseSchema;
  }

  if (path.match(/^\/api\/auth\/sign-out$/)) {
    if (method === 'POST')
      return z.object({ success: z.boolean() }).passthrough(); // or appropriate
  }

  return null;
}

export function assertMatchesContract(
  path: string,
  method: HttpMethod,
  res: MockResponse,
): void {
  // If it's a 4xx or 5xx, we typically don't have a rigid positive schema. Skip schema validation for errors for now.
  if (res.status >= 300) return;
  if (!res.body) return;

  const schema = schemaFor(path, method);
  if (!schema) return;

  const result = schema.safeParse(res.body);
  if (!result.success) {
    // In Zod 3+, you can format issues, but `z.prettifyError` doesn't exist natively unless using a custom formatter,
    // so we'll just format it simply.
    const issues = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    throw new Error(
      `Mock response for ${method} ${path} violates its schema:\n${issues}\nBody: ${JSON.stringify(res.body, null, 2)}`,
    );
  }
}
