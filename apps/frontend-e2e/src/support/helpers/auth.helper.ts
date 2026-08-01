import { expect, Page } from '@playwright/test';

/**
 * Signs in through the login form and waits for the sign-in call to settle
 * before returning.
 *
 * Asserting on the URL straight after the click races the request: the click
 * resolves as soon as the button is pressed, so the assertion can run while
 * the response is still in flight and see the login page it was about to
 * leave. Waiting on the response removes the race, and asserting on its
 * status means a genuine rejection reports as a failed sign-in rather than as
 * a confusing "still on /auth/login".
 */
export async function signInThroughUi(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/auth/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);

  const [response] = await Promise.all([
    page.waitForResponse((res) =>
      res.url().includes('/api/auth/sign-in/email'),
    ),
    // The submit button is rendered outside the form and bound by `form`.
    page.locator('button[form="loginForm"]').click(),
  ]);

  expect(
    response.ok(),
    `Sign-in for ${email} failed: ${response.status()} ${await response
      .text()
      .catch(() => '')}`,
  ).toBeTruthy();

  await expect(page).not.toHaveURL(/\/auth\/login/);
}
