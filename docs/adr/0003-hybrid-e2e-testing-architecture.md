# ADR-0003: Hybrid E2E Testing Architecture

## Status

Proposed (planned on `feat/81-hybrid-e2e-test-framework`, not yet implemented)

## Context

`apps/frontend-e2e` currently holds two Playwright specs — `smoke.spec.ts` and `preferences-persistence.spec.ts` — running against a single, fully real stack: `api:serve` plus a Postgres instance, started by CI before the `e2e` target. That arrangement has three problems that get worse as coverage grows.

1. **Every e2e run needs the whole stack.** A developer wanting to check one job-list assertion has to bring up Postgres, run migrations, and start two dev servers. The feedback loop is minutes, so in practice the suite is not run locally, and coverage stays at two specs.
2. **Failure modes are unreachable.** A real API returns 500 only when something is genuinely broken. Loading states, malformed payloads, 429 rate limits and expired tokens cannot be produced on demand, so the error-handling paths of the UI — `backendErrorInterceptor`, the resource error states, the notification service — have no e2e coverage at all.
3. **The alternative, mocking everything, throws away the only thing e2e uniquely provides:** proof that the frontend and the real Nest API actually agree. Component tests already cover rendering against fake data; an all-mocked e2e suite would mostly re-test that with a slower runner.

Additionally, the highest-risk flows in the app are the email-mediated ones — verify email, forgot/reset password, change email with its cancellation and cooldown rules (see [ADR-0002](./0002-email-change-cancellation-and-resend-rate-limiting.md)). These span the API, the queue, the email provider and two separate browser visits, and today have no end-to-end coverage in any form.

The workspace has assets that make a better design cheap: `libs/shared/testing` already holds typed DTO fixtures shared by unit tests and the Prisma seed; `libs/shared/schemas` holds zod schemas for every DTO; `docker-compose.yml` already runs Mailpit; and `apps/api` already selects its email provider through `EmailProviderFactory` and an `EMAIL_PROVIDER` env var.

## Decision

**Adopt a three-lane hybrid architecture in which one spec suite runs against both mocked HTTP and the real stack, with lane membership chosen by the Playwright project rather than by the spec.**

- **Three Playwright projects over one `testDir`.** `mocked` (interception on, no infrastructure), `full-stack` (real API + Postgres + Mailpit), and `full-stack-mocked` (interception on, runs only tests tagged `@mock-only`). `nx run frontend-e2e:e2e` runs the latter two together, so **every test executes exactly once per CI pass**, in the only mode where it is meaningful — nothing is silently skipped in both lanes.
- **Lane membership uses Playwright's native `tag` option**, not substrings in describe titles. Untagged tests — the majority — run in both lanes.
- **Interception is a single `page.route('**/api/**')`** dispatching through an ordered, method-aware route table (`{ method, pattern: RegExp, resolve }[]`, most specific first). Unregistered endpoints fall through to the real backend, so the hybrid boundary is per-request, not only per-project.
- **Scenarios are per-domain, not global.** A `ScenarioMap` keyed by domain (`auth`, `jobs`, `contacts`, `notes`, `profile`, `preferences`, `account`, `health`) is merged over defaults, so a single test can express "the jobs API is down but auth still works".
- **Mocks are stateful.** An in-memory store, seeded per test from the shared fixtures, is mutated by the handlers — so `create → list → update → delete` is a real mocked test rather than a read-only screen check.
- **Mock responses are validated against their zod schema before being fulfilled.** A DTO change that outdates a mock fails the mocked lane with a readable schema error instead of producing a green-but-wrong test.
- **The full-stack lane provisions one real user per Playwright worker**, reused across tests via `storageState`. Because every domain row is user-scoped in the Prisma schema, this gives real isolation and lets the lane run `fullyParallel: true`.
- **Playwright code stays out of `libs/shared/testing`.** That library is imported by unit tests and by `libs/shared/prisma/src/seed.ts`; an `@playwright/test` import there would pull Playwright into both graphs. All Playwright code lives in `apps/frontend-e2e/src/support/`; only plain data fixtures cross the boundary.
- **Substitution is governed by ownership, not convenience.** Infrastructure we run — Postgres, Redis, the SMTP catcher — runs for real, as a container, in every lane that has a backend. Only vendor-run services (Resend today, any future external API) are substituted. Faking owned infrastructure hides risk rather than reducing it. The `QUEUE_DRIVER=memory` fake accepts a job and discards it; `EmailService` compensates by sending synchronously when that driver is active, so email still reaches Mailpit — but the compensation is per-call-site, so any other producer added later silently loses its job, and BullMQ scheduling, retries, backoff and the processor itself are never exercised end to end. `QUEUE_DRIVER` should therefore be split into `inline` (executes the processor) and `memory` (records jobs) and scoped to API unit tests, with e2e running real Redis.
- **Third parties are substituted from outside the process.** In the full-stack lane the API is a separate OS process, so in-process interception (`jest.mock`, `nock`, `msw/node`) cannot reach it. Every third-party client must expose an env-selected DI provider *and* an env-configurable base URL, pointed in e2e at a small in-repo stub app with a control endpoint for driving vendor failure modes. Mocked mode additionally installs a backstop route that aborts any non-localhost request, so an accidental real outbound call fails the test instead of flaking.
- **Each dependency gets one double per layer, not one overall.** In-process fakes at the API unit layer; real containers at the integration and e2e layers. In the frontend mocked lane there is no API process, so no database or queue double exists there at all — `page.route` subsumes everything below the HTTP boundary. Worker isolation is by database-per-worker (Postgres, cloned from a migrated template), BullMQ `prefix` per worker (Redis), and unique recipient addresses (Mailpit).

### Where each double lives

A dependency does not have *a* double — it has one per layer. Empty cells are structural, not gaps: in the frontend mocked lane there is no API process, so nothing exists for a database or queue double to attach to.

| Layer | Postgres | Redis / BullMQ | Mail | 3rd-party HTTP |
| --- | --- | --- | --- | --- |
| Frontend unit / component | — | — | — | — |
| Frontend e2e `mocked` | — | — | — | — |
| API unit (`TestingModule`) | `prisma-service.mock` | queue-token fake | `email-service.mock` | client mock |
| API integration (in-process) | **real, Docker** — tx rollback | **real, Docker** | **Mailpit** | in-process stub OK |
| Full-stack e2e (black box) | **real, Docker** — db per worker | **real, Docker** — prefix per worker | **Mailpit** | **stub container**, env-pointed |

Worker isolation is by database-per-worker cloned from a migrated template (Postgres), BullMQ `prefix` per worker (Redis), and unique recipient addresses (Mailpit). Transaction-rollback-per-test is unavailable at the e2e layer: the request runs on the API process's own connection pool, so the test holds no handle on that transaction.

The full design — file layout, mock route table, scenario catalogue and phased rollout — is published as an artifact: <https://claude.ai/code/artifact/4cbed805-8c1a-4cf3-82c4-fa9786471854>

## Consequences

### Positive

- The mocked lane runs with no Docker, no Postgres and no API process, which makes e2e viable as a pre-push check and removes the main reason the suite has stayed at two specs.
- Error paths become testable. `serverError`, `loading`, `notFound`, `rateLimited` and malformed-payload scenarios get first-class coverage in `full-stack-mocked`, inside the same CI pass as the real-stack lane.
- Contract drift is caught mechanically. The zod guard turns "the mock no longer matches the DTO" from a silent false-green into a failing test with a readable message.
- The full-stack lane can run in parallel, so adding real-stack coverage costs sub-linear wall-clock time rather than linear.
- Email flows become assertable end to end via Mailpit's REST API, closing the app's largest coverage gap using infrastructure that is already in `docker-compose.yml`.
- Fixtures stay single-sourced: the same typed objects feed unit tests, the Prisma seed and the e2e mocks.

### Negative

- Two lanes means two ways for a test to fail, and a class of bug that appears in only one of them. The mitigation is the assertion-asymmetry rule (exact values when mocked, shape when real), but it is a real cognitive cost for contributors.
- The mock layer is code that must be maintained alongside the API. Every new endpoint needs a handler, and a stateful store is more to keep correct than a lookup table.
- Specs gain a concept — lanes and tags — that a contributor has to learn before writing their first test. Mitigated by a conventions guide and the PR checklist, but it is not zero.
- The `data-testid` normalisation sweep touches components unrelated to testing, producing a diff that is wide but shallow.

### Risks

- **Mocks drifting into fiction.** The zod guard validates response *shape*, not semantics — a handler can be schema-valid and still behave unlike the real API (wrong status code, wrong ordering, missing side effect). The full-stack lane is the backstop, which is why untagged tests must run in both lanes and why the `@mock-only` set should stay small and deliberately chosen.
- **Per-worker users leaking.** If a teardown fails, orphaned users accumulate in the test database. Low impact against an ephemeral CI database; worth a periodic cleanup if the pattern is reused against a shared environment.
- **Mailpit search flakiness.** Waiting on an inbox is inherently a polling operation. Bounded by unique per-worker addresses and an explicit timeout that fails loudly rather than hanging.
- **The nested-Nx deadlock.** Any new e2e target that invokes `nx run` from inside an already-running Nx task will deadlock in CI, where the daemon is disabled. The existing `dependsOn: []` plus servers-started-outside-Nx arrangement must be preserved by anything added here.

## Alternatives Considered

### Alternative 1: Keep the suite full-stack only

Continue running every spec against a real API and database, as today.

- Pros: no mock layer to maintain; every test exercises the real contract; nothing new to learn.
- Cons: infrastructure required for every run, so the suite stays unused locally; error and loading states remain untestable; wall-clock cost grows linearly with coverage.
- Why not: the two problems compound — the reason coverage is at two specs is that running them is expensive, and the failure modes most worth covering are exactly the ones a real backend won't produce.

### Alternative 2: Mock everything, drop the real-stack lane

Run the whole suite against intercepted HTTP, with no backend involved.

- Pros: fastest possible suite; fully deterministic; trivial CI.
- Cons: proves nothing about the real contract; every mock is an assumption that can silently diverge; email, session and persistence flows become untestable.
- Why not: it duplicates what component tests already do against fake data, while giving up the only thing e2e uniquely provides. The zod guard narrows drift but cannot detect a backend that changed its status codes or side effects.

### Alternative 3: Two separate spec suites, one per mode

Maintain `*.mocked.spec.ts` and `*.e2e.spec.ts` as parallel files.

- Pros: each spec is simple, with no runtime branching and no shared abstraction.
- Cons: the same flow is written twice and the two copies drift; a fix applied to one is forgotten in the other; coverage becomes hard to reason about because the sets overlap partially.
- Why not: duplication across two suites is the failure mode this design exists to avoid. The lane concept costs less than keeping two descriptions of the same flow in sync.

### Alternative 4: Consumer-driven contract testing (Pact or similar)

Formalise the frontend/API contract with a broker instead of hybrid e2e.

- Pros: rigorous, versioned contract; catches breaking API changes before deploy; decouples the two sides' pipelines.
- Cons: substantial infrastructure and process overhead; verifies request/response pairs, not user flows across screens; a second contract artefact to keep in sync with the zod schemas that already exist.
- Why not: disproportionate for a single-team monorepo where both sides ship together and zod schemas already serve as the shared contract. The zod guard captures most of the value at a fraction of the cost. Worth revisiting if the API ever gains external consumers.

### Alternative 5: Fake the owned infrastructure too (in-memory queue, in-memory database)

Replace Redis and Postgres with in-process fakes in the full-stack lane, so e2e needs no containers at all.

- Pros: no Docker anywhere; fastest possible full-stack run; no worker-isolation problem to solve.
- Cons: the fakes have different semantics from the real thing — job scheduling and retries, transaction isolation, constraint enforcement, TTL and eviction — so the lane stops proving what it exists to prove.
- Why not: this was the plan's original position and it is wrong. The `QUEUE_DRIVER` fake in the tree shows the shape of the problem: it accepts a job, returns a fake id and discards it, and only survives today because `EmailService` special-cases that driver with a synchronous send. Every future producer would need the same hand-written compensation, and none of the queue's actual behaviour is covered either way. Containers for owned services are cheap; per-call-site compensation for a fake is not.

### Alternative 6: A mock server process (MSW, WireMock) instead of `page.route`

Run a standalone mock backend that the frontend proxies to.

- Pros: mocks a real network hop; reusable outside Playwright; independent of browser APIs.
- Cons: another process to start and health-check; per-test scenario switching needs an out-of-band control channel; the passthrough-to-real-backend fallback becomes proxy configuration rather than one line.
- Why not: `page.route` gives per-test isolation for free, needs no lifecycle management, and keeps scenario selection inside the test's own type system. The passthrough fallback in particular is much simpler in-browser.

## Implementation

- Full design — file layout, mock route table, scenario catalogue: <https://claude.ai/code/artifact/4cbed805-8c1a-4cf3-82c4-fa9786471854>
- Phased rollout. Phases 0–2 are load-bearing: (0) `support/` skeleton, scenarios, three-project config, `e2e-mocked` target; (1) mock route table, stateful store, contract guard, jobs specs in the mocked lane; (2) full-stack lane with worker-scoped users and `storageState`. Phases 3–5 are additive and can land independently: (3) test-stack compose overlay and email flows; (4) remaining domains and the `data-testid` sweep; (5) CI split and conventions guide.
- Supporting change in `apps/api`: split the existing `QUEUE_DRIVER` fake in `queue.module.ts` into `inline` (runs the processor synchronously) and `memory` (records enqueued jobs), and scope both to unit tests — today a single fake silently discards the job.
- Test infrastructure: a `docker-compose.test.yml` overlay running Postgres, Redis and Mailpit on test-only ports, plus template-database provisioning so each Playwright worker gets its own database. `TEST_DATABASE_URL`, `TEST_DB_NAME` and `TEST_DB_PORT` already exist unused in `.env.example` for this purpose.
- Supporting change across `apps/frontend` and `libs/frontend`: normalise `data-testid` attributes to kebab-case and set `testIdAttribute` in the Playwright config.
- CI split: `frontend-e2e:e2e-mocked` on every PR with no services; `frontend-e2e:e2e` on main and nightly with `postgres` and `mailpit` service containers. The existing "start dev servers outside Nx, `dependsOn: []`" arrangement is preserved.
- Testing approach: the architecture is validated by its own definition of done (§15) — the mocked lane green with no infrastructure in under ~90 s, the full-stack lane green with `fullyParallel: true`, and a deliberately outdated mock proving the zod guard fails the run.

## Related Decisions

- [ADR-0002](./0002-email-change-cancellation-and-resend-rate-limiting.md): Email Change Cancellation & Resend Rate-Limiting — its cooldown and cancel-loop regressions are among the flows the full-stack lane is meant to cover end to end.
- [ADR-0001](./0001-user-preferences-persistence-and-sync.md): User Preferences Persistence & Multi-Device Sync — the existing `preferences-persistence.spec.ts` regression test moves onto the new fixture in phase 0.

## References

- Branch: `feat/81-hybrid-e2e-test-framework`
- Full design (artifact): <https://claude.ai/code/artifact/4cbed805-8c1a-4cf3-82c4-fa9786471854>
- E2E app: `apps/frontend-e2e/`
- Shared fixtures: `libs/shared/testing/src/index.ts`
- Shared schemas: `libs/shared/schemas/src/index.ts`

---

**Author:** @gabor-kotel
**Date:** 2026-08-01
**Last Updated:** 2026-08-01
