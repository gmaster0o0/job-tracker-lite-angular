import { APIRequestContext } from '@playwright/test';
import { MIN_PASSWORD_LENGTH } from '@job-tracker-lite-angular/schemas';
import { waitForEmail, extractLink } from './mailpit.helper';

export interface ProvisionedUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

/**
 * Provisions a real user in the backend using the sign-up endpoint.
 * In Phase 3, this also verifies the email via Mailpit.
 */
export async function provisionUser(
  api: APIRequestContext,
  username: string,
): Promise<ProvisionedUser> {
  const email = `${username}@example.com`;
  const password = `Password123`;
  const name = `E2E ${username}`;

  // Sign up
  const res = await api.post('/api/auth/sign-up/email', {
    data: {
      name,
      email,
      password,
      language: 'en',
    },
  });

  if (!res.ok()) {
    throw new Error(`Failed to provision user ${email}: ${await res.text()}`);
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
    throw new Error(
      `Failed to verify user ${email}: ${await verifyRes.text()}`,
    );
  }

  return {
    id: userId,
    name,
    email,
    password,
  };
}

/**
 * Deletes the user from the backend. Requires the user's password.
 */
import { allJobDtoFixtures } from '@job-tracker-lite-angular/testing';

export async function seedUser(api: APIRequestContext): Promise<void> {
  // Use the provided APIRequestContext (which has the user's cookies) to seed data
  for (const job of allJobDtoFixtures) {
    const createData = {
      position: job.position,
      link: job.link,
      description: job.description,
      company: job.company,
      status: job.status,
    };
    const res = await api.post('/api/jobs', { data: createData });
    if (!res.ok()) {
      console.warn(`[Seed Warning] Failed to seed job: ${await res.text()}`);
    }
  }
}

/**
 * Deletes the user from the backend. Requires the user's password.
 */
export async function deleteUser(
  api: APIRequestContext,
  user: ProvisionedUser,
): Promise<void> {
  // Try to use the standard better-auth delete-user endpoint
  const res = await api.post('/api/auth/delete-user', {
    data: {
      password: user.password,
    },
  });

  if (!res.ok()) {
    console.warn(
      `[Teardown Warning] Failed to delete user ${user.email} (might already be deleted): ${await res.text()}`,
    );
  }
}
