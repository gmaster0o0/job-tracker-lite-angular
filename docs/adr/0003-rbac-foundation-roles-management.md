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
- Implement dual-profile architecture:
  - `/users/:slug` - Public profile view with edit button (owner/admin/moderator only). Slug-only: `GET /api/users/:slug` never falls back to id, so this surface never leaks a raw database id into a shareable URL.
  - `/profile/:idOrSlug` - Admin/moderator edit page with compact header, auto-save role dropdown, and injected ProfileComponent. Accepts either identifier so an id-based link (bookmarked, or shared before a user's slug changed) keeps working; on load it replaces the URL with the canonical id form via `Router.navigate(..., { replaceUrl: true })`.
- Add dedicated `GET/PATCH /api/users/:idOrSlug/profile` endpoints for fetching and updating any user's full profile data (MODERATOR/ADMIN only), resolving either the user's id or slug to the same record.
- Refactor ProfileComponent to accept external data via `profileData` input for reusability across contexts.
- Implement auto-save for role changes with 1-second debounce to reduce API calls.
- Keep user-facing labels translated through Transloco, including role labels and role-update feedback.

## Consequences

### Positive 👍
- RBAC rules now exist consistently at service, routing, and template layers.
- Moderators can discover users, and administrators can update roles without leaving the app.
- Client-side authorization becomes reusable instead of re-implemented per screen.
- Dual-profile architecture separates public view from admin editing, improving UX and maintainability.
- Dedicated `/api/users/:idOrSlug/profile` endpoint provides efficient single-user profile fetching for moderators/admins, and accepting either identifier means id-based links never break even after a slug is regenerated.
- ProfileComponent is now reusable across own-profile and moderation contexts via input-based data injection.
- Auto-save role dropdown improves admin UX by eliminating manual save button clicks.

### Negative 👎
- Role labels and messaging add translation keys that must stay aligned across locales.
- Public profile at `/users/:slug` currently shows minimal information and could be enhanced with more user details.
- Landing on `/profile/:idOrSlug` with a slug triggers a second network request after the redirect to the id form, since the routed component is recreated at the new URL. Acceptable for an admin-only, low-traffic page; would need a resolver-based approach to avoid if this pattern is reused somewhere more latency-sensitive.

### Risks
- Client-side RBAC improves UX but does not replace backend enforcement; route guards and directives must remain aligned with server-side `RolesGuard` rules.
- If role names or access rules change, the guard/directive usage and translation keys must be updated together.
- The id-or-slug resolution on `/profile/:idOrSlug` depends on `User.slug` being unique and always present; slug generation and its uniqueness strategy are decided at the schema/auth layer (`libs/shared/core-utils/.../slug.util.ts`, `AuthConfigFactory`), not by this ADR.

## Alternatives Considered

### Alternative 1: Check roles inline in each component
- Why not: duplicates authorization logic, makes tests noisier, and increases the chance of inconsistent redirects or hidden states.

### Alternative 2: Use only route guards
- Why not: route guards protect navigation, but they do not solve conditional rendering inside already-authorized screens such as the admin-only role selector.

### Alternative 3: Keep profile management in single shell with no public view
- Why not: Forces users to navigate through admin-only routes to view profiles, and mixes public profile viewing with privileged editing in a single component.

### Alternative 4: Immediate role save without debounce
- Why not: Creates excessive API calls on rapid dropdown changes, potentially overwhelming the server with unnecessary updates.

## Related Decisions
- ADR-0001: User Preferences Persistence & Multi-Device Sync

## References
- Backend controller: `apps/api/src/app/users/users.controller.ts`
- Backend service: `apps/api/src/app/users/users.service.ts`
- Frontend routes: `apps/frontend/src/app/app.routes.ts`
- Frontend data access: `libs/frontend/src/lib/data-access/users.data-access.ts`
- Shared schemas: `libs/shared/schemas/src/lib/schemas/users.schema.ts`, `user-details.schema.ts`

---
**Author:** Copilot
**Date:** 2026-08-04
**Last Updated:** 2026-08-08
