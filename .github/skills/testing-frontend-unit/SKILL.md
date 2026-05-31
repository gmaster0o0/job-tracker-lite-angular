---
name: testing-frontend-unit
description: Short guidance for writing frontend unit tests and using centralized fixtures.
---

# testing-frontend-unit

Purpose: Keep frontend unit tests simple and consistent.

Key points to keep:

- **Use Vitest**: write and run unit tests with `vitest` (preferred runner for fast feedback).

- **Centralized fixtures & mocks**: keep test data and lightweight mocks in `libs/shared/testing/src/lib/fixtures/` and `libs/shared/testing/src/lib/mocks/`, export from `libs/shared/testing/src/index.ts`, and reuse across tests.

- **Generate and use harnesses**: generate Angular harnesses for UI components and use test harness APIs (e.g., `TestbedHarnessEnvironment`) to interact with components in tests.

Example usage:

```typescript
import { createContactFixtures } from '@job-tracker-lite-angular/testing';
// Vitest test
test('shows email error for invalid email', async () => {
  await harness.fillForm(createContactFixtures.invalidEmail);
  await harness.submit();
  expect(await harness.getEmailErrorText()).toBeTruthy();
});
```

Checklist:

- Check existing fixtures before adding new ones.
- Export new fixtures from `libs/shared/testing/src/index.ts`.
- Prefer reuse; avoid duplicated fixture objects.
- Avoid manual change detection: don't call `fixture.detectChanges()` when using `TestbedHarnessEnvironment`; use harness APIs instead.

Keep tests focused and fast: prefer small, semantic fixtures, simple mocks, and harness-driven UI interaction.
