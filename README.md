# ts-starter-202410

My fullstack typescript starter with Remix and hono.

## Features

### General
- [x] Biome for basic lint and format
- [x] ESLint for only tailwindcss
- [x] Valibot for validation
- [x] tRPC for API connection
- [x] Renovate for package updates
- [x] GitHub Actions for basic linting and testing

### Frongend

- [x] Remix x Cloudflare for CSR/SSR FE
- [x] TailwindCSS
- [x] Shadcn/ui
- [x] React Query (tPRC)
- [x] vitest ( .n. prefix runs on node env, .b. prefix runs on browser env)
- [x] Storybook
- [x] Scaffdog for component template

### Backend

- [x] Hono with Docker for backend
- [x] Postgresql
- [x] Prisma
- [x] vitest
- [x] Dockerfile for deployment
- [x] Password-less email authentication example with React Email
- [x] GCP Cloud Trace (Open Telemetry) and Cloud Logging (logs) Support. It can integrate each other.

## Development

Run docker compose for postgresql:

```bash
docker compose up -d
```

Run prisma migration:

```bash
cd apps/api-hono
pnpm migrate
```

Run the dev server:

```bash
# in root folder
pnpm dev
```

Other commands:

```bash
## Frontend Commands

# Create a new component
pnpm gen-c

# storybook
pnpm storybook

# run test
pnpm test

## Backend Commands

# db
pnpm migrate
pnpm migrate:reset

# run test
pnpm test
```
