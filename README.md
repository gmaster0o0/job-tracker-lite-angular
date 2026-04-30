# Job Tracker Lite Angular

A small Nx monorepo containing an Angular frontend and a NestJS backend.

## Project overview

- `apps/frontend` — Angular application using standalone components and `httpResource`.
- `apps/api` — NestJS backend application with a global `/api` prefix.
- `libs/api-interfaces` — shared TypeScript interfaces and types used by frontend and backend.
- `libs/frontend` — shared frontend library code, including data access services.

## Tech stack

- Nx monorepo
- Angular `~21.2.0`
- NestJS `^11.0.0`
- TypeScript `~5.9.2`
- RxJS
- Jest / Vitest for unit tests
- Playwright for e2e testing
- Angular `httpResource` for data loading

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
```

## Notes

- The frontend app loads data from `/api` using `httpResource<User>(() => '/api')`.
- The backend uses `app.setGlobalPrefix('api')`, so the API root is `http://localhost:3000/api`.
- `apps/frontend/proxy.conf.json` proxies frontend requests for `/api` to the backend.

## Useful commands

```sh
npm install
npx nx serve frontend
npx nx test frontend
npx nx test api
npx nx graph
#generate angular component example:
npx nx g @nx/angular:component   --path=apps/frontend/src/app/navigation/jobs-menu/jobs-menu   --standalone
```

## Additional resources

- [Nx docs](https://nx.dev)
- [Angular docs](https://angular.dev)
- [NestJS docs](https://nestjs.com)
