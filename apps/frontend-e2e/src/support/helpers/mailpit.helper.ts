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
    // Everything short of a clean JSON response counts as "not ready yet" and
    // is retried until the deadline: a rejected request (Mailpit not
    // listening), a non-2xx, or a body that will not parse. Nothing may
    // escape this loop - see ADR-0004, "Operating rules".
    const res = await api
      .get(`${MAILPIT}/search?query=${encodeURIComponent(`to:${to}`)}`)
      .catch(() => null);

    if (res?.ok()) {
      const { messages } = await res.json().catch(() => ({ messages: null }));
      const hit = messages?.find((m: { Subject: string }) =>
        subject.test(m.Subject),
      );
      if (hit) {
        const msgRes = await api.get(`${MAILPIT}/message/${hit.ID}`);
        return msgRes.json();
      }
    }

    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`No email to ${to} matching ${subject} within ${timeout}ms`);
}

export const extractLink = (html: string, path: string) =>
  html.match(new RegExp(`https?://[^\\s"']*${path}[^\\s"']*`))?.[0];

/**
 * Deletes EVERY message in the shared inbox. For manual cleanup between full
 * runs - never from a spec: mail isolation is by recipient, not by inbox (see
 * ADR-0004, "Operating rules").
 */
export const purgeInbox = (api: APIRequestContext) =>
  api.delete(`${MAILPIT}/messages`);
