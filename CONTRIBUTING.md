# Contributing

Thank you for contributing! This document covers the recommended workflow for schema changes (Prisma migrations) and a concise checklist for adding a new component that requires a database field.

## Prisma migrations (recommended workflow)

1. Update the schema
   - Edit `libs/shared/prisma/db-schema/schema.prisma` with the model/field changes.

2. Create & apply migration (local/dev)

```bash
cd libs/shared/prisma
npx prisma migrate dev --name add_<change> --schema=libs/shared/prisma/db-schema/schema.prisma
```

- Ensure the local DB is running and `.env` contains `DATABASE_URL`.
- `migrate dev` creates a migration folder under `libs/shared/prisma/db-schema/migrations` and applies it to your local DB.

3. Generate client & verify

```bash
npx prisma generate --schema=libs/shared/prisma/db-schema/schema.prisma
pnpm nx build prisma
pnpm run db:seed   # optional
pnpm test
```

4. Commit & push

- Commit `schema.prisma` and the new migration folder(s).
- Open a PR so CI can run tests and verify migrations.

5. Apply in staging/production

- Take a DB backup or snapshot before applying migrations in staging/production.
- Apply migrations non-interactively (CI / server):

```bash
npx prisma migrate deploy --schema=libs/shared/prisma/db-schema/schema.prisma
```

- Do not run `prisma migrate dev` in production.

## Fast iteration tips (development)

- To reset local DB and reapply all migrations (destroys data):

```bash
npx prisma migrate reset --schema=libs/shared/prisma/db-schema/schema.prisma --force
```

- If you accidentally create multiple small migrations, consider resetting local DB and re-running `migrate dev` once you have the final schema.

## Checklist — Adding a new component that requires a DB field

When you create a new UI component that also requires a database field, follow this checklist to keep frontend, backend, and shared code in sync.

- DB / Prisma (schema & migrations)
  - Update the Prisma schema: `libs/shared/prisma/db-schema/schema.prisma`
  - Create and apply a migration and regenerate the client:

    ```bash
    npx prisma migrate dev --schema=libs/shared/prisma/db-schema/schema.prisma --name add_<field>
    npm run prisma:generate
    ```
  - Update seed data if needed and run `npm run db:seed`

- Backend (API)
  - Add or update NestJS controllers and services under `apps/api/src/app/...` to expose the new endpoint/field
  - Update DTOs / validation and mapping logic as needed (DTOs may also live in `libs/api-interfaces`)
  - Add or update backend unit tests and integration tests: `npx nx test api`

- Frontend
  - Update shared interfaces in `libs/api-interfaces`
  - Update or extend the frontend data-access library (`@job-tracker-lite-angular/frontend-data-access`, in `libs/frontend`)
  - Implement the component and template in `apps/frontend/src/app/features/...` and update styles if needed
  - Add route(s) if required in `apps/frontend/src/app/app.routes.ts`
  - Update navigation (sidenav / jobs menu) if the component needs a link: see `apps/frontend/src/app/navigation/`
  - Add or update frontend unit tests: `npx nx test frontend`

- Shared / Tests / CI
  - Update seed data (if needed) and run `npm run db:seed`
  - Add or update centralized mocks in `libs/shared/testing`
  - Update e2e tests and run them: `npx nx run frontend-e2e:e2e` / `npx nx run api-e2e:e2e`
  - Run linting and type checks: `npm run lint` / `npm run typecheck`

- Final steps
  - Run full test suite: `npm test`
  - Push changes and open a PR; ensure GitHub Actions CI passes
  - Update the changelog or docs if needed

## Commands quick reference

```bash
# create & apply migration (dev)
cd libs/shared/prisma
npx prisma migrate dev --name add_<change> --schema=libs/shared/prisma/db-schema/schema.prisma

# generate client
npx prisma generate --schema=libs/shared/prisma/db-schema/schema.prisma

# apply migrations in CI/production
npx prisma migrate deploy --schema=libs/shared/prisma/db-schema/schema.prisma

# reset local DB (destructive)
npx prisma migrate reset --schema=libs/shared/prisma/db-schema/schema.prisma --force
```

Thanks for contributing — open a PR and request review when ready.
