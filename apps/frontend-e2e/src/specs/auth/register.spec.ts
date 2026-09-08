import type { Page } from '@playwright/test';
import { test, expect } from '../../support/fixtures/e2e.fixtures';

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
});

/**
 * Mocked deliberately. Against the real backend a duplicate sign-up returns
 * 2xx and the form walks on to the verification notice, which contradicts the
 * error path the app is written around (`user_already_exists` has copy and a
 * 409 mapping). Until that is settled - deliberate anti-enumeration, or a
 * hole - this asserts the intended contract rather than the live behaviour.
 */
test.describe('sign up - duplicate address', { tag: '@mock-only' }, () => {
  test.use({ scenarios: { auth: 'emailTaken' } });

  test('rejects an email that is already registered', async ({ page }) => {
    await fillRegisterForm(page, {
      name: 'Sign Up Duplicate',
      email: 'taken@example.com',
      password: 'Password123!',
    });

    await expect(page.getByText('Registration Failed')).toBeVisible();
    await expect(
      page.getByText('An account with this email already exists.'),
    ).toBeVisible();
  });
});
