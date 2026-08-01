import { expect, Page } from '@playwright/test';

/**
 * Waits on the sign-in response rather than the URL: the click resolves as
 * soon as the button is pressed, so a URL assertion can run while the request
 * is still in flight and see the page it is about to leave.
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
