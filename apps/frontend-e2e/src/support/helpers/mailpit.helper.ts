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

    // Anything that is not a clean JSON response is treated as "not ready
    // yet" and retried. Mailpit has no healthcheck in CI, so the first search
    // can land before it is listening; parsing that unconditionally threw out
    // of the loop on the first attempt, never reaching the retry or the
    // deadline. This helper runs inside the workerUser fixture, so that took
    // down every test on the worker and reported a JSON parse error instead
    // of the timeout message below.
    if (res.ok()) {
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
 * Deletes EVERY message in the shared inbox.
 *
 * Do not call this from a spec. Workers run in parallel against one Mailpit,
 * so purging mid-run deletes mail another worker is waiting on - which is
 * what made the mail specs fail intermittently. Isolation comes instead from
 * each worker provisioning a unique recipient, with waitForEmail filtering
 * on `to:`. Kept for manual cleanup between full runs.
 */
export const purgeInbox = (api: APIRequestContext) =>
  api.delete(`${MAILPIT}/messages`);
