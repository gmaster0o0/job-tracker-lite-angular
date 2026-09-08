import { APIRequestContext, APIResponse } from '@playwright/test';
import { authUserSchema, AuthUserDto } from '@job-tracker-lite-angular/schemas';
import { waitForEmail, extractLink } from './mailpit.helper';
import { allJobDtoFixtures } from '@job-tracker-lite-angular/testing';

// `password` is test-only - the server never returns it, so it sits
// alongside the schema-validated fields rather than inside them.
export type ProvisionedUser = AuthUserDto & { password: string };

/**
 * Provisions a real user in the backend using the sign-up endpoint.
 * In Phase 3, this also verifies the email via Mailpit.
 */
/**
 * better-auth rejects state-changing calls that arrive without an Origin
 * header (MISSING_OR_NULL_ORIGIN), and APIRequestContext does not send one.
 * It goes on these requests specifically rather than on the whole context:
 * a context-wide Origin is also sent to Mailpit, which blocks cross-origin
 * calls to its API.
 */
const authHeaders = (origin?: string) =>
  origin ? { Origin: origin } : undefined;

/** A bare body is useless when a call fails: better-auth answers some rejections with an empty one. */
async function describeFailure(
  action: string,
  res: APIResponse,
): Promise<string> {
  const body = await res.text().catch(() => '<unreadable>');
  return `Failed to ${action}: ${res.status()} ${res.statusText()} ${res.url()} ${
    body || '<empty body>'
  }`;
}

export async function provisionUser(
  api: APIRequestContext,
  username: string,
  origin?: string,
): Promise<ProvisionedUser> {
  const email = `${username}@example.com`;
  const password = `Password123`;
  const name = `E2E ${username}`;

  // Sign up
  const res = await api.post('/api/auth/sign-up/email', {
    headers: authHeaders(origin),
    data: {
      name,
      email,
      password,
      language: 'en',
    },
  });

  if (!res.ok()) {
    throw new Error(await describeFailure(`provision user ${email}`, res));
  }

  const data = await res.json();
  const parsedUser = authUserSchema.safeParse(data.user);

  if (!parsedUser.success) {
    throw new Error(
      `Sign-up response for ${email} does not match authUserSchema: ${parsedUser.error.message}\nBody: ${JSON.stringify(data)}`,
    );
  }

  // Get verification email and verify
  const emailMsg = await waitForEmail(api, email, /Verify your email/i);
  const verifyLink = extractLink(emailMsg.HTML, '/api/auth/verify-email');
  if (!verifyLink) {
    throw new Error('Verify email link not found in email');
  }

  const verifyRes = await api.get(verifyLink);
  if (!verifyRes.ok()) {
    throw new Error(await describeFailure(`verify user ${email}`, verifyRes));
  }

  // Sign in explicitly rather than relying on autoSignIn at sign-up. The
  // verification link points straight at the API origin, so any session it
  // establishes lands in a different cookie jar than the app's - and a
  // session issued before verification is not usable anyway. This request
  // goes through baseURL, so the cookie lands on the origin the browser and
  // the seeding calls below actually use.
  const signInRes = await api.post('/api/auth/sign-in/email', {
    headers: authHeaders(origin),
    data: { email, password },
  });

  if (!signInRes.ok()) {
    throw new Error(
      await describeFailure(`sign in provisioned user ${email}`, signInRes),
    );
  }

  return {
    ...parsedUser.data,
    password,
  };
}

export async function seedUser(
  api: APIRequestContext,
  user: ProvisionedUser,
): Promise<void> {
  // Use the provided APIRequestContext (which has the user's cookies) to seed
  // data. `link` is globally unique, so per-worker users are not enough on
  // their own - every worker seeding the same fixture links would collide
  // with P2002. Discriminate by the owner's address.
  for (const job of allJobDtoFixtures) {
    const link = job.link
      ? `${job.link}?owner=${encodeURIComponent(user.email)}`
      : null;

    const createData = {
      position: job.position,
      link,
      description: job.description,
      company: job.company,
      status: job.status,
    };
    const res = await api.post('/api/jobs', { data: createData });
    if (!res.ok()) {
      throw new Error(await describeFailure(`seed job for ${user.email}`, res));
    }
  }
}

/**
 * Deletes the user from the backend. Requires the user's password.
 */
export async function deleteUser(
  api: APIRequestContext,
  user: ProvisionedUser,
  origin?: string,
): Promise<void> {
  // better-auth's delete-user endpoint is disabled in this app's config, and
  // enabling it would add a second, immediate deletion path alongside the
  // product's own request/grace-period flow - not a change to make for the
  // benefit of tests. Every call was failing and logging a warning per
  // worker.
  //
  // Nothing is leaked by skipping it: globalTeardown drops the test stack
  // with `down -v` after the run, and CI throws its database away with the
  // job. Set E2E_DELETE_USERS=true to attempt it anyway - useful only if
  // this suite is ever pointed at a long-lived environment.
  if (process.env['E2E_DELETE_USERS'] !== 'true') {
    return;
  }

  const res = await api.post('/api/auth/delete-user', {
    headers: authHeaders(origin),
    data: {
      password: user.password,
    },
  });

  if (!res.ok()) {
    console.warn(
      `[Teardown] ${await describeFailure(`delete user ${user.email}`, res)}`,
    );
  }
}
