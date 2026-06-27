---
applyTo: '**'
description: 'Always-on acceptance rules for implementation work in this workspace. USE WHEN: coding, refactoring, testing, or fixing bugs anywhere in the repo.'
---

# Acceptance Rules

- Do not use direct DOM manipulation.
- Do not use inline styles. Use Tailwind classes or `.scss` for complex styling.
- Do not hardcode user-facing strings. Use `@jsverse/transloco`.
- Do not introduce hardcoded test data or mocks when shared fixtures from `libs/shared/testing` should be reused.

# Verification

- Before finishing implementation work, run the narrowest relevant tests for the affected slice.
- Before closing substantial changes, validate linting and type safety for the affected slice.
- Prefer the workspace's Nx targets for validation where available.
