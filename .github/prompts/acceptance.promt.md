---
description: Template for defining acceptance criteria for a feature or bugfix.
---

# Acceptance Criteria

## 🚫 Forbidden Patterns (Anti-Patterns)
- [ ] NO direct DOM manipulation.
- [ ] NO inline styles (use Tailwind or `.scss` for complex cases).
- [ ] NO hardcoded strings (use `@jsverse/transloco`).
- [ ] NO hardcoded testdata and mock (use `libs\shared\testing`).

## 🧪 Verification & Testing
- [ ] **Unit Tests**: Pass `npm run test` to run all test in the project.
- [ ] **Linting**: Pass `npm run lint` with ESLint.
- [ ] **Type Checking**: Pass `npm run typecheck` to ensure type safety.