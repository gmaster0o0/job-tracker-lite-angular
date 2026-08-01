import { APIRequestContext, APIResponse } from '@playwright/test';
import { MIN_PASSWORD_LENGTH } from '@job-tracker-lite-angular/schemas';
import { waitForEmail, extractLink } from './mailpit.helper';
import { allJobDtoFixtures } from '@job-tracker-lite-angular/testing';

export interface ProvisionedUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

/**
 * better-auth rejects state-changing calls with no Origin header, and
 * APIRequestContext sends none. Set per request rather than on the context,
 * which would also send it to Mailpit - and Mailpit blocks cross-origin
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
  const userId = data.user?.id;

  if (!userId) {
    throw new Error(
      `Provisioning returned no user id: ${JSON.stringify(data)}`,
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

  // autoSignIn at sign-up is not enough: the verification link targets the API
  // origin, so the session it establishes lands in a different cookie jar than
  // the app's. Signing in through baseURL puts the cookie where the browser
  // and the seeding calls below will look for it.
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
    id: userId,
    name,
    email,
    password,
  };
}

export async function seedUser(
  api: APIRequestContext,
  user: ProvisionedUser,
): Promise<void> {
  // `link` is unique across all users, so per-worker users are not enough:
  // every worker seeding the same fixtures would collide with P2002.
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
  // Off by default: better-auth's delete-user endpoint is disabled in this
  // app's config, and the test database is discarded after the run anyway.
  // Enable only when pointing this suite at a long-lived environment.
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
