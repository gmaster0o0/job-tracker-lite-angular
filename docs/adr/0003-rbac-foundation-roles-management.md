# ADR-0003: RBAC Foundation Roles Management UI

## Status
Accepted

## Context
The backend already exposes role-aware `/users` endpoints for moderators and administrators, plus an admin-only role update endpoint. The frontend had no session-level role signal, no route-level role guard, and no role-aware UI for listing users or updating roles. That left RBAC enforcement incomplete on the client: privileged screens could not be expressed declaratively, and there was no management surface for moderators or admins.

## Decision
- Extend `AuthSessionService` with a computed `role` signal derived from the current session, defaulting to `USER` when unauthenticated.
- Introduce a reusable `hasRoleGuard(allowedRoles)` route guard for role-gated navigation, redirecting guests to login and unauthorized users to home.
- Introduce a standalone structural `HasRoleDirective` for template-level role gating.
- Add `UsersDataAccessService` as the dedicated frontend client for `/api/users` role-management endpoints.
- Add a `/users` page for moderators and admins that lists users with their current roles.
- Add a `/profile/:slug` management shell that loads a user from the users list and allows administrators to change that user’s role through a Spartan select.
- Keep user-facing labels translated through Transloco, including role labels and role-update feedback.

## Consequences

### Positive 👍
- RBAC rules now exist consistently at service, routing, and template layers.
- Moderators can discover users, and administrators can update roles without leaving the app.
- Client-side authorization becomes reusable instead of re-implemented per screen.

### Negative 👎
- The profile management shell currently resolves the target user from the `/users` collection instead of a dedicated `/users/:id` endpoint, so it fetches more data than strictly necessary.
- Role labels and messaging add more translation keys that must stay aligned across locales.

### Risks
- Client-side RBAC improves UX but does not replace backend enforcement; route guards and directives must remain aligned with server-side `RolesGuard` rules.
- If role names or access rules change, the guard/directive usage and translation keys must be updated together.

## Alternatives Considered

### Alternative 1: Check roles inline in each component
- Why not: duplicates authorization logic, makes tests noisier, and increases the chance of inconsistent redirects or hidden states.

### Alternative 2: Use only route guards
- Why not: route guards protect navigation, but they do not solve conditional rendering inside already-authorized screens such as the admin-only role selector.

### Alternative 3: Add a dedicated `/users/:id` endpoint before building UI
- Why not: unnecessary for the current foundation scope because the existing users list already contains the data needed by the management shell.

## Related Decisions
- ADR-0001: User Preferences Persistence & Multi-Device Sync

## References
- Backend controller: `apps/api/src/app/users/users.controller.ts`
- Frontend routes: `apps/frontend/src/app/app.routes.ts`
- Shared schemas: `libs/shared/schemas/src/lib/schemas/users.schema.ts`

---
**Author:** Copilot
**Date:** 2026-08-04
**Last Updated:** 2026-08-04
