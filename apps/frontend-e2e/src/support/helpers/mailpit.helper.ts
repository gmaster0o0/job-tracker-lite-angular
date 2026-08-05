import { APIRequestContext } from '@playwright/test';

const MAILPIT = process.env['MAILPIT_API'] ?? 'http://localhost:8025/api/v1';

export async function waitForEmail(
  api: APIRequestContext,
  to: string,
  subject: RegExp,
  timeout = 15000,
) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const res = await api.get(
      `${MAILPIT}/search?query=${encodeURIComponent(`to:${to}`)}`,
    );
    const { messages } = await res.json();
    const hit = messages?.find((m: any) => subject.test(m.Subject));
    if (hit) {
      const msgRes = await api.get(`${MAILPIT}/message/${hit.ID}`);
      return msgRes.json();
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`No email to ${to} matching ${subject} within ${timeout}ms`);
}

export const extractLink = (html: string, path: string) =>
  html.match(new RegExp(`https?://[^\\s"']*${path}[^\\s"']*`))?.[0];

/**
 * Deletes EVERY message in the shared inbox, so it must not be called from a
 * spec: workers run in parallel against one Mailpit and would delete mail
 * another is waiting on. Specs isolate by unique recipient instead.
 */
export const purgeInbox = (api: APIRequestContext) =>
  api.delete(`${MAILPIT}/messages`);
