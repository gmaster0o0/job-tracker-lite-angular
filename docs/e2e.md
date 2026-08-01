# E2E Testing Conventions & Workflows

This document outlines the guidelines and workflow for the Hybrid E2E architecture in `apps/frontend-e2e`. For the foundational architecture decisions, refer to [ADR-0003: Hybrid E2E Testing Architecture](./adr/0003-hybrid-e2e-testing-architecture.md).

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
2. **Investigation using Artifacts**: Do not rely exclusively on local reproduction for flakes. Our CI configuration uses `retain-on-failure`. Always download the traces, videos, and screenshots from the failing CI workflow before blindly tweaking assertions or locators.
3. **Timeouts & Web-First Assertions**: **Never** manually use `page.waitForTimeout()`. Rely entirely on Playwright's auto-wait mechanisms and web-first assertions (`expect(locator).toBeVisible()`). If an action requires extensive delay, wait on a network response via `page.waitForResponse()` rather than inflating the global timeout or using fixed delays.

---

## 4. CI Workflow

Our CI environment validates both inner loop speed and contract adherence across two primary execution targets:

### The Split Lanes
- **Mocked Lane (`nx run frontend-e2e:e2e-mocked`)**: Completely decoupled from backend infrastructure (No Docker, Postgres, or API node process). Suitable for dev cycles and pre-push hooks where it runs in under ~90s.
- **Full-Stack Lane (`nx run frontend-e2e:e2e`)**: Validates the end-to-end integration by pairing the Playwright specs with the real Nest API process and local database infrastructure. (Contains both `full-stack` and `full-stack-mocked` Playwright project runs).

### Infrastructure & Services
Infrastructure that we own runs as real service containers inside the CI workflow context rather than patched mocks:
- **Postgres**: Live cloned DB instance per parallel worker.
- **Redis**: Containerized Redis for queue tasks mapped across isolated worker prefixes.
- **Mailpit**: Container mapped properly through environment outputs allowing actual intercept assertions for outbound emails.

### Reporting via Blob
In distributed or sharded CI topologies, Playwright `['blob']` reporters coalesce results across runners. This allows GitHub pipelines to merge all split testing outputs into a single, comprehensive HTML report.