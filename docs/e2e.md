# E2E Testing Conventions & Workflows

This document outlines the guidelines and workflow for the Hybrid E2E architecture in `apps/frontend-e2e`. For the foundational architecture decisions, refer to [ADR-0004: Hybrid E2E Testing Architecture](./adr/0004-hybrid-e2e-testing-architecture.md).

## 1. E2E Conventions

### Tags (`@mock-only` / `@full-stack-only`)

We use native Playwright tags to control which lane tests execute in:

- **`@mock-only`**: Used for tests asserting behavior a real backend cannot reliably produce (500s, malformed responses, rate limits).
- **`@full-stack-only`**: Used for tests requiring real external infrastructure flows (e.g., confirming a verification email landed in Mailpit).
- **Untagged**: The vast majority of our tests. These run in **both** the mocked lane (for quick feedback loop) and the full-stack lane (acting as our contract).

```typescript
test.describe('job list — API down', { tag: '@mock-only' }, () => { ... });
test('verification email arrives', { tag: '@full-stack-only' }, async () => { ... });
// Default: runs in both:
test('create job', async () => { ... });
```

### Shared Fixtures & Setup

All Playwright tests **must** import `test` and `expect` from the single entry point. Do not construct your own data inline or make ad-hoc fetch requests.

```typescript
import { test, expect } from '../support/fixtures/e2e.fixtures';
```

Mock data should utilize the typed shared fixtures from `@job-tracker-lite-angular/testing` to seed in-memory states instead of using raw JSON blobs.

### Scenarios

Scenarios allow you to simulate explicit states per domain without affecting the rest of the application. Override default scenarios for a specific test or block using the `scenarios` fixture option:

```typescript
test.describe('When Jobs API is down', { tag: '@mock-only' }, () => {
  // Overrides only the jobs scenario, auth and others remain default (happyPath)
  test.use({ scenarios: { jobs: 'serverError' } });

  test('renders error state', async ({ page }) => { ... });
});
```

`loading` is the one scenario that changes timing rather than payload: `setupMockApi` holds every response in that domain for `LOADING_DELAY_MS` before answering, which is long enough to assert a skeleton and short enough not to eat the test budget. The response itself is unchanged, so the resolved state still arrives.

Asserting the skeleton alone does **not** prove the scenario is applied — it is briefly visible on any load, so such a test passes even when the delay is silently not happening. Assert the delay itself:

```typescript
test.describe('loading state', { tag: '@mock-only' }, () => {
  test.use({ scenarios: { jobs: 'loading' } });

  test('holds the response back so the skeleton stays up', async ({ page }) => {
    const jobsResponse = page.waitForResponse((r) =>
      /\/api\/jobs$/.test(new URL(r.url()).pathname),
    );
    const startedAt = Date.now();

    await page.goto('/jobs');
    await expect(page.getByTestId('loading-state')).toBeVisible();
    await jobsResponse;

    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(LOADING_DELAY_MS / 2);
    await expect(page.getByTestId('job-card').first()).toBeVisible();
  });
});
```

---

## 2. PR Checklist for New E2E Tests

- [ ] Uses the shared fixtures; no copy-pasted selectors or ad-hoc `fetch` calls
- [ ] Correctly tagged (`@mock-only` / `@full-stack-only`) or intentionally untagged for both lanes
- [ ] Mock responses come from typed fixtures and pass the contract guard
- [ ] Any entity created mid-test is registered for cleanup
- [ ] No dependency on another test's side effects
- [ ] No fixed `waitForTimeout`; uses web-first assertions
- [ ] New UI touched by the test carries a kebab-case `data-testid`

---

## 3. Flake Tracking Policy

Flaky tests degrade CI confidence. Ensure tests remain reliable by strictly adhering to the following rules:

1. **Quarantining**: Actively track flakes. If a test randomly fails on `main`, immediately mark it using `test.skip()`. Include a comment linking to an investigation ticket.
2. **Investigation using traces**: Do not rely exclusively on local reproduction. `playwright.config.ts` sets `trace: 'on-first-retry'`, so a test that fails once and passes on retry still leaves a trace behind, written under `dist/.playwright/apps/frontend-e2e/test-output/<test>/trace.zip` and opened with `npx playwright show-trace <path>`. Note that CI does **not** upload these today — the workflow publishes only the unified coverage report — so a CI-only flake has to be reproduced locally or the artifact upload has to be added first. No video or screenshot is captured in either place.
3. **Timeouts & Web-First Assertions**: **Never** manually use `page.waitForTimeout()`. Rely entirely on Playwright's auto-wait mechanisms and web-first assertions (`expect(locator).toBeVisible()`). If an action requires extensive delay, wait on a network response via `page.waitForResponse()` rather than inflating the global timeout or using fixed delays.

---

## 4. Targets & CI Workflow

### The targets

- **`nx run frontend-e2e:e2e-mocked`** — local only. Runs the `mocked` project alone, decoupled from backend infrastructure (no Docker, Postgres or API process), which is what makes it usable in a dev cycle or a pre-push hook.
- **`nx run frontend-e2e:e2e-local`** — local full-stack. Brings up `docker-compose.test.yml` (Postgres and Redis on offset ports) plus the `mailpit` service from `docker-compose.yml`, migrates the database, then runs the lanes that need a backend. Mailpit is not part of the test stack because its ports cannot be offset — see the note at the bottom of `docker-compose.test.yml` — and every full-stack test needs it, since `provisionUser` verifies each user through the inbox. The test stack is torn down afterwards by `globalTeardown`; set `E2E_KEEP_STACK=true` to leave it running between runs.
- **`nx run frontend-e2e:e2e`** — what CI runs, via `nx affected -t lint test build typecheck e2e`. With no `--project` filter this executes **all three** Playwright projects: `mocked`, `full-stack` and `full-stack-mocked`. CI does not run `e2e-mocked` separately, so the mocked specs execute as part of this one target.

### Infrastructure & Services

Infrastructure we own runs as real service containers in the workflow rather than as patched mocks. The API and frontend are started by the workflow itself, before the Nx run, and the servers are shared by the whole suite:

- **Postgres** — one service container, one `test_db`. Workers share it; isolation comes from each worker provisioning its own user and every row being user-scoped, not from a database per worker.
- **Redis** — one service container, shared. `QUEUE_DRIVER` is deliberately left unset so e2e exercises real BullMQ rather than a fake (see [ADR-0004](./adr/0004-hybrid-e2e-testing-architecture.md)).
- **Mailpit** — one service container. Isolation is by unique recipient address per worker, with `waitForEmail` filtering on `to:`; never purge the shared inbox mid-run.

`nxE2EPreset` keys several settings off `CI`: under it Playwright runs `workers: 1` with `retries: 2` and `forbidOnly`, and adds a `blob` reporter alongside the HTML one, written to `dist/.playwright/apps/frontend-e2e/blob-report`. So a blob report _is_ produced on every CI run — but the run is not sharded, so there is nothing to merge it with, and like the traces in §3 it is never uploaded. Both become useful the moment an `upload-artifact` step is added.
