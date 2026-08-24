import type { Page } from '@playwright/test';
import { test, expect } from '../../support/fixtures/e2e.fixtures';
import { provisionUser } from '../../support/helpers/api.helper';

const fillRegisterForm = async (
  page: Page,
  { name, email, password }: { name: string; email: string; password: string },
) => {
  await page.goto('/auth/register');
  await page.locator('#name').fill(name);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#confirmPassword').fill(password);
  // The submit button sits outside the <form>, wired to it by `form`.
  await page.locator('button[form="registerForm"]').click();
};

test.describe('sign up', { tag: '@full-stack-only' }, () => {
  test.use({ storageState: undefined });

  test('creates the account and asks for email verification', async ({
    page,
  }) => {
    await fillRegisterForm(page, {
      name: 'Sign Up Happy',
      email: `signup_${Date.now()}@example.com`,
      password: 'Password123!',
    });

    // The account exists but cannot be used yet - the app says so rather than
    // signing the visitor straight in.
    await expect(
      page.getByText(
        'Registration successful. Please check your email to verify your account.',
      ),
    ).toBeVisible();
  });

  test('rejects an email that is already registered', async ({
    page,
    request,
    baseURL,
  }) => {
    // Provisioning through the API rather than a first pass through the form
    // keeps this test about the rejection, not about registering twice.
    const existing = await provisionUser(
      request,
      `signup_taken_${Date.now()}`,
      baseURL ?? undefined,
    );

    await fillRegisterForm(page, {
      name: 'Sign Up Duplicate',
      email: existing.email,
      password: 'Password123!',
    });

    await expect(page.getByText('Registration Failed')).toBeVisible();
    await expect(
      page.getByText('An account with this email already exists.'),
    ).toBeVisible();
  });
});
