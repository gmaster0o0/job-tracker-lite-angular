# ADR-0002: Email Change Cancellation & Resend Rate-Limiting

## Status

Proposed (implemented on `feat/128-improve-change-email`, not yet merged to `main`)

## Context

The "Change Email" flow already used a two-phase token model:

- `EmailChangeTokenType.VERIFY` — created on `requestEmailChange`, emailed to the **new** address, confirms the requester owns it.
- `EmailChangeTokenType.RESTORE` — created only *after* a VERIFY token is consumed (inside `verifyEmailChange`), emailed to the **old** address as an undo safety-net.

Two gaps existed around the VERIFY phase:

1. **No visibility or control over a pending request.** Once a user submitted a new address, the UI gave no way to see when it was sent, when it expired, or to cancel it — the only path forward was waiting out the token or contacting support.
2. **No rate limit on resending — and once one existed, it was bypassable.** A first attempt tied the resend cooldown to the active `EmailChangeToken`'s `createdAt`. Since cancelling deleted that token outright, a user could loop **request → cancel → request → cancel → ...**, sending unlimited verification emails instantly — a real spam/cost/abuse vector. The same loophole also worked by cycling through different throwaway target addresses each time, not just the same one.

## Decision

**Add a cancel action and richer pending-state display, backed by a resend cooldown that is global per-user and stored independently of the cancellable token.**

- **`lastEmailChangeRequestedAt DateTime?` on `User`** is the single source of truth for the cooldown. It is set on every successful `requestEmailChange` and is **never reset by `cancelEmailChange`** — that's the entire fix. `cancelEmailChange` only clears `pendingEmail` and deletes the VERIFY token, exactly as before.
- **The cooldown is global per-user, not scoped to the target email.** `requestEmailChange` checks `lastEmailChangeRequestedAt` unconditionally, regardless of what address is being requested. See Alternative 1 for why per-target scoping was rejected.
- **The cooldown end (`emailChangeResendAvailableAt`) is server-authoritative and computed unconditionally** in `getAccountSettings`, independent of whether a request is currently pending — so it applies immediately after a cancel, and survives page reloads, typing away and back, or switching to a different address mid-cooldown. See Alternative 2 for why a client-side timer was rejected.
- **Frontend button is a single Save/Resend control with four states** (`Save` / `Save (Xs)` / `Resend` / `Resend (Xs)`), where the Save-vs-Resend label choice is debounced against whether the currently typed address matches the pending one, but the cooldown/disabling itself is independent of that and always enforced.
- **Cooldown ticking and disabling live inside the shared submit button** (`SubmitButtonComponent`, via optional `cooldownUntil` / `cooldownLabel` / `cooldownTooltip` inputs), not in each feature component — `account-settings.component.ts` only supplies the server timestamp and a label-translation callback.
- **Default cooldown is 60 seconds**, configurable via `getEmailChangeResendCooldownSeconds()`.

## Consequences

### Positive

- Closes the spam loophole structurally: neither the same-address nor the different-address cancel-loop variant can bypass the limit, since the timestamp that gates the check is untouched by cancellation.
- Users get real visibility (sent time, expiry, relative countdown) and a one-click, no-confirmation cancel for a pending request — cancelling a pending email change is a cheap, easily-reversible action, so a confirmation dialog was deliberately not added.
- The cooldown UI is reusable: any future submit button that needs a server-driven cooldown gets ticking, disabling, and an optional tooltip for free.

### Negative

- A user who made a typo in the new address must wait out the same cooldown to correct it — accepted trade-off of a global (vs. per-target) limit.

### Risks

- **TOCTOU race**: two concurrent `requestEmailChange` calls could both read `lastEmailChangeRequestedAt` before either write commits, both passing the check. Not worsened by this change (the same shape of race existed with the token-based check it replaced) and explicitly scoped out — flagged as a candidate follow-up, not bundled into this fix.

## Alternatives Considered

### Alternative 1: Per-target-email cooldown

Cooldown keyed on `(userId, newEmail)` instead of just `userId`.

- Why not: doesn't close the loophole — a user cycling through different throwaway addresses each time would sail straight through. Rejected in favor of a global per-user limit after evaluating both loop variants.

### Alternative 2: Client-side cooldown timer

Compute "resend available in Xs" purely in the browser from the moment of submission.

- Why not: trivially bypassed by a page reload, or by never letting the countdown run out client-side while still calling the API. The cooldown has to be re-derivable from a server timestamp on every load, not carried in transient client state.

### Alternative 3: Keep deriving the cooldown from `EmailChangeToken.createdAt`

The original implementation, before the cancel-loop bug was found.

- Why not: this is the literal bug — the token used for the cooldown check is the same one `cancelEmailChange` deletes, so cancelling always reset the clock. Any fix keeping the cooldown coupled to a cancellable resource reintroduces the same class of bypass.

## Implementation

- Migration: `libs/shared/prisma/db-schema/migrations/20260724200000_add_last_email_change_requested_at/` — adds `lastEmailChangeRequestedAt` to `user`.
- Backend: `apps/api/src/app/account/account.service.ts` — `requestEmailChange` (cooldown check + set), `cancelEmailChange` (deliberately does not touch the field), `getAccountSettings` (unconditional `emailChangeResendAvailableAt` computation).
- Shared contract: `libs/shared/schemas/src/lib/schemas/account.schema.ts` — `accountSettingsSchema.emailChangeResendAvailableAt`.
- Frontend: `apps/frontend/src/app/features/settings/account-settings/account-settings.component.ts`/`.html` — pending-state alert, cancel action, Save/Resend button wiring.
- Shared UI: `apps/frontend/src/app/shared/submit-button/submit-button.component.ts` — cooldown ticking/disabling/tooltip owned by the button itself (`cooldownUntil`, `cooldownLabel`, `cooldownTooltip` inputs), reused unchanged by 5 other call sites that don't need a cooldown.
- Testing: regression tests cover the specific exploit (`requestEmailChange` → `cancelEmailChange` → immediate `requestEmailChange`, both same- and different-address, asserted still rejected) in both `account.service.spec.ts` and `account-settings.component.spec.ts`.

## Related Decisions

- None yet.

## References

- Branch: `feat/128-improve-change-email`
- Migration: `libs/shared/prisma/db-schema/migrations/20260724200000_add_last_email_change_requested_at/`

---
**Author:** @gabor-kotel
**Date:** 2026-07-26
**Last Updated:** 2026-07-26
