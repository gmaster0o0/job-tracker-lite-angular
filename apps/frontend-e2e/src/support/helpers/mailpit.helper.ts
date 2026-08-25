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
    // is retried until the deadline: the request itself failing, a non-2xx
    // answer, and a body that will not parse.
    //
    // The request has to be inside the tolerance, not just the response.
    // Mailpit has no healthcheck in CI and the local stack shares the dev
    // one, so the first search can reach a port nothing is listening on -
    // which never produces a response at all, it rejects with ECONNREFUSED.
    // Guarding only `res.ok()` still let that escape on the first attempt.
    // This runs inside the workerUser fixture, and CI runs one worker, so an
    // escape here takes down the entire suite with a connection error instead
    // of the timeout message below.
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
