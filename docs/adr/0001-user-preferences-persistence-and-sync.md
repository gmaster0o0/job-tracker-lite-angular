  # ADR-0001: User Preferences Persistence & Multi-Device Sync

  ## Status
  Accepted (Phase 1 merged to `main` in #132; Phase 2 implemented on `feat/129-improve-save-preference`, pending PR)

  ## Context
  Theme, language, and date format were three separate `providedIn: 'root'` services, each reading its own `localStorage` key. Angular only constructs a root singleton on first injection, and nothing guaranteed all three were injected before first render — so a hard refresh (F5) rendered with defaults until the user happened to visit `/settings/preferences`.

  Separately, preferences lived only in `localStorage`: a new device or browser profile meant starting from defaults with no way to recover values set elsewhere, since there was no server-side representation at all.

  ## Decision

  **Phase 1 — centralize state, gate first render.** Merge the three services into one `UserPreferencesService`, backed by a single `user-preferences` localStorage key. Add `preferencesInitGuard`, a `CanActivateFn` (mirroring `sessionInitGuard`) that `await`s `init()` before any route activates, including guest routes — route activation, not injection order, is the point Angular guarantees runs before render, which is what actually fixes the bug.

  **Phase 2 — server persistence, sync, offline tolerance.**
  - **Sync lives inside `UserPreferencesService`**, not a separate service, talking to the backend only through `PreferencesDataAccessService`. See Alternative 1.
  - **Storage is a nullable `Json` column** (`User.preferences`), not a normalized table. See Alternative 3.
  - **`UserPreferencesDto`/`UpdateUserPreferencesDto` are defined once**, in `libs/shared/schemas`, and consumed by both the NestJS controller and the Angular data-access service (`.parse()` on every response) — one source of truth for the wire shape. `language`/`dateFormat` stay loose strings: which values are valid is a frontend i18n concern, not part of the contract.
  - **Conflict resolution is last-write-wins on a required `updatedAt`.** See Alternative 2. Whenever the local copy wins — including a "never synced" tie against an empty server default — it's pushed with a *freshly generated* timestamp, never its own. Without this, a second, genuinely-fresh device could tie against a first device's already-synced-but-stale-stamped data and silently overwrite it.
  - **`NetworkService` is a plain signal** driven by `navigator.onLine` and the `online`/`offline` window events. See Alternative 4.
  - **`isSynced` is local-only**, declared in a `StoredPreferences` interface that extends the shared DTO rather than in the shared schema itself — the backend never receives or returns it, so the shared schema stays an accurate description of what the server actually stores.
  - **`PreferencesDataAccessService` has no eager fetch on construction.** `preferencesInitGuard` runs on every route, including anonymous ones (local-only preferences must work logged out), so an eager `httpResource` would fire a doomed authenticated GET on every guest page view.
  - **Language gets a persistent "System" option**, mirroring theme's `light`/`dark`/`system`. `DEFAULT_USER_PREFERENCES.language` is `'system'`, which resolves through `navigator.languages` to an available language and then to a hardcoded default — the option and the new-user fallback chain are the same mechanism.
  - **Sync failures are silent**: the error interceptor exempts `/preferences` requests from the global error toast; failure surfaces only as `isSynced: false`, retried on next login or reconnect.
  - **No legacy-key migration.** See Alternative 5.

  ## Consequences

  ### Positive 👍
  - The bug class is closed structurally (via routing) rather than patched — correct on first paint for every case: fresh load, refresh, guest, authenticated.
  - Preferences follow the user across devices, with defined behavior online, offline, or intermittently connected.
  - A shared schema means frontend and backend can't silently drift on what a "preference" is.
  - The sync algorithm is two comparisons (`serverWins`, `isSynced`) — no distributed-systems machinery to operate or debug.

  ### Negative 👎
  - LWW is a real information-loss strategy: concurrent offline edits on two devices silently drop one. Acceptable for low-stakes display settings; would not be for higher-value data.
  - `UserPreferencesService` is now a large service (state + persistence + two sync effects + login/reconnect orchestration) — it's the one place all preference behavior has to be understood.

  ### Risks
  - If preferences ever grow beyond low-stakes scalar settings, LWW will need revisiting — it doesn't scale to data where losing a concurrent edit is actually costly.
  - The JSON-column approach rewrites the whole blob on every change; fine at today's size, worth reconsidering if the object grows large or gains fields with independent lifecycles.

  ## Alternatives Considered

  ### Alternative 1: Separate `PreferencesSyncService`
  - Why not: sync policy needs read/write access to the same signal `UserPreferencesService` owns; a split would duplicate state or reach into the other service's internals — worse coupling, not less.

  ### Alternative 2: CRDT / Operational Transform for conflict resolution
  - Why not: overkill for a handful of independent scalar fields with no realistic concurrent-edit scenario worth the complexity; LWW is sufficient and far simpler to implement and test.

  ### Alternative 3: Normalized `UserPreferences` table
  - Why not: preferences have no independent identity or lifecycle from the user — a JSON column matches the actual data shape without extra migration or join overhead.

  ### Alternative 4: `httpResource()`-based `NetworkService`
  - Why not: `resource()` is pull/request-driven (re-fires on reactive parameter changes); modeling push-based `online`/`offline` events through it fights the API instead of fitting it.

  ### Alternative 5: Migrate legacy (pre-Phase-1) localStorage keys
  - Why not: dropped as premature complexity — the app has no real users yet, so there's no legacy local data to protect. Trivial to reintroduce before a real launch if ever needed.

  ## Related Decisions
  - None yet (first ADR in this repo).

  ## References
  - Phase 1 PR: #132 (`fix/131-preferences-not-applied-on-refresh`)
  - Tracking issue: #129
  - Migration: `libs/shared/prisma/db-schema/migrations/20260722091854_add_user_preferences_json/`

  ---
  **Author:** @gabor-kotel
  **Date:** 2026-07-22
  **Last Updated:** 2026-07-22
