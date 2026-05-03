# Job Tracker Lite Angular

[![CI](https://github.com/gmaster0o0/job-tracker-lite-angular/actions/workflows/ci.yml/badge.svg)](https://github.com/gmaster0o0/job-tracker-lite-angular/actions/workflows/ci.yml)


A modern job tracking application built as an Nx monorepo, featuring a full-stack implementation with Angular frontend and NestJS backend. It provides comprehensive job management functionality with a focus on user experience through reactive UI components and efficient data handling.

## Project overview

- `apps/frontend` — Angular application using standalone components and `httpResource`.
- `apps/api` — NestJS backend application with a global `/api` prefix.
- `libs/api-interfaces` — shared TypeScript interfaces and types used by frontend and backend.
- `libs/frontend` — shared frontend library code, including data access services.
- `libs/shared/prisma` — database schema and Prisma client for PostgreSQL integration.
- `libs/shared/testing` — centralized mock and test data utilities.
- `libs/shared-ui` — comprehensive UI component library based on spartan-ng (https://spartan.ng/).

## Features

- **Job Management**: Full CRUD operations (create, read, update, delete) for job applications.
- **Status Tracking**: Interactive status progression (Saved → Applied → Interview → Job Offered → Rejected) with visual stepper.
- **Contact Management**: CRUD operations for contacts associated with each job (name, email, phone).
- **Job Details**: Tabbed interface with Overview (markdown rendering), Contacts, Notes (coming soon), and Cover Letter (coming soon).
- **Modern UI**: Clean, responsive design using spartan-ng components, TailwindCSS, and Lucide icons.
- **Dynamic Sidenav**: Sidebar navigation adapts based on the current route, providing quick access to job details and actions.
## Tech stack

- Nx monorepo
- Angular `~21.2.0`
- NestJS `^11.0.0`
- TypeScript `~5.9.2`
- RxJS
- Prisma `^7.8.0` with PostgreSQL
- TailwindCSS `^4.2.4`
- spartan-ng (Helm/Brain) for UI components
- Jest for backend unit tests
- Vitest for frontend unit tests
- Playwright for e2e testing

## CI/CD

This project uses GitHub Actions for continuous integration and Nx Cloud for distributed task execution and caching.

- **GitHub Actions**: Runs on every push and pull request, executing linting, testing, and building.
- **Nx Cloud**: Provides fast, distributed builds and self-healing CI features.

## Database setup

This application uses PostgreSQL with Prisma ORM.

1. Ensure Docker is running and start the PostgreSQL container:

```sh
npm run docker:up
```

2. Copy `.env.example` to `.env` and fill in database credentials (default should work for local development).

3. Generate Prisma client:

```sh
npm run prisma:generate
```

4. Seed the database with sample data:

```sh
npm run db:seed
```

## Install

From the repository root:

```sh
npm install
```

## Docker Compose

This repo includes `docker-compose.yml` for shared services such as PostgreSQL.

1. Copy `.env.example` to `.env` and fill in database credentials.
2. Start containers:

```sh
npm run docker:up
```

3. Stop and remove containers:

```sh
npm run docker:down
```

4. View container logs:

```sh
npm run docker:logs
```

5. List running containers:

```sh
npm run docker:ps
```

## Start locally

The frontend is configured to proxy API requests to the backend. The backend runs on port `3000` and the frontend dev server runs on port `4200`.

1. Ensure the database is set up (see Database setup section above).

2. Start the development server:

```sh
npx nx serve frontend
```

Then open:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000/api`

## Run tests

### Frontend unit tests

```sh
npx nx test frontend
```

### Backend tests

```sh
npx nx test api
```

### End-to-end tests

Depending on your setup, there may be e2e projects in `apps/frontend-e2e` and `apps/api-e2e`. Use Nx to run the relevant target.

```sh
npx nx run frontend-e2e:e2e
npx nx run api-e2e:e2e
```

## Project structure

```text
apps/
  frontend/         # Angular app
  api/              # NestJS backend
  frontend-e2e/     # Frontend E2E tests
  api-e2e/          # API E2E tests
libs/
  api-interfaces/   # Shared API types
  frontend/         # Shared frontend utilities and services
  shared/
    prisma/         # Database schema and Prisma client
    testing/        # Centralized mock and test data utilities
    ui/             # UI components (spartan-ng based)
tmp/
  libs/             # Temporary build outputs
```

## Notes

- The frontend app loads data from `/api` using `httpResource<User>(() => '/api')`.
- The backend uses `app.setGlobalPrefix('api')`, so the API root is `http://localhost:3000/api`.
- `apps/frontend/proxy.conf.json` proxies frontend requests for `/api` to the backend.
- UI components are built using spartan-ng (https://spartan.ng/), providing a modern, accessible component library.
- Job overviews support markdown rendering for rich descriptions.
- Contact management allows associating multiple contacts with each job application.
- Status progression uses an interactive stepper component for easy status updates.

## Useful commands

```sh
# Install dependencies
npm install

# Database setup
npm run prisma:generate
npm run db:seed

# Start development server
npx nx serve frontend

# Run tests
npx nx test frontend
npx nx test api
npx nx run-many --target=test --all

# Run e2e tests
npx nx run frontend-e2e:e2e
npx nx run api-e2e:e2e

# View project graph
npx nx graph

# Generate Angular component example
npx nx g @nx/angular:component --path=apps/frontend/src/app/navigation/jobs-menu/jobs-menu --standalone
```

## Additional resources

- [Nx docs](https://nx.dev)
- [Angular docs](https://angular.dev)
- [NestJS docs](https://nestjs.com)
- [Prisma docs](https://www.prisma.io/docs)
- [spartan-ng docs](https://spartan.ng/)
- [Lucide icons](https://lucide.dev/)