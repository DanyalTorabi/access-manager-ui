# access-manager-ui

A web-based admin dashboard for the [access-manager](https://github.com/DanyalTorabi/access-manager) backend. Lets operators manage domain-scoped access control: users, groups, resources, access types, permissions, and authorization checks.

## What it does

- **Domain management** — create and switch between isolated access-control namespaces
- **User & Group management** — CRUD, group membership, permission grants
- **Resource & Access Type management** — define protected resources and named bit flags
- **Permission management** — compose permissions and grant them to users or groups
- **Authorization checker** — test whether a user has access to a resource

## Prerequisites

- Node.js 18+ (20+ recommended)
- npm 10+
- A running [access-manager](https://github.com/DanyalTorabi/access-manager) instance (defaults to `http://127.0.0.1:8080`)

## Quickstart

```bash
git clone git@github.com:DanyalTorabi/access-manager-ui.git
cd access-manager-ui
cp .env.example .env.local   # edit VITE_API_BASE_URL if needed
npm install
make dev                     # → http://localhost:5173
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8080` | Base URL of the access-manager backend |
| `VITE_API_BEARER_TOKEN` | _(empty)_ | Optional Bearer token (matches `API_BEARER_TOKEN` on the backend) |

Copy `.env.example` to `.env.local` and fill in your values. **Never commit `.env.local`.**

## Commands

```bash
make dev              # start Vite dev server (http://localhost:5173, HMR)
make build            # production build → dist/
make type-check       # TypeScript check (no emit)
make lint             # ESLint
make preview          # serve dist/ locally
make generate-types   # regenerate src/api/schema.ts from OpenAPI spec
make docker-build     # build Docker image
make docker-up        # start Docker container (http://localhost:3000)
make docker-down      # stop Docker container
make docker-logs      # follow Docker logs
```

## Docker

The Docker image is a two-stage build: Node 18 builds the app, nginx serves the static files.

```bash
make docker-build
make docker-up
# → http://localhost:3000
make docker-down
```

Pass a custom API URL at build time:

```bash
VITE_API_BASE_URL=https://api.example.com make docker-build
```

The published image is available at `ghcr.io/danyaltorabi/access-manager-ui:latest`.

## API types

TypeScript types in `src/api/schema.ts` are auto-generated from the backend's OpenAPI spec:

```bash
make generate-types
```

The OpenAPI spec is sourced from the sibling `access-manager` repo at `../access-manager/api/openapi.yaml`.

## Project structure

```
src/
├── api/          # API client + typed entity functions
├── components/   # Shared UI components
├── hooks/        # TanStack Query hooks
├── lib/          # Pure utilities
├── pages/        # Route-level page components
└── main.tsx      # App entry point
```

See `docs/frontend-architecture.md` for layer boundary rules.

## Documentation

| Doc | Purpose |
|-----|---------|
| `PLAN.md` | Product vision and entity model |
| `plan/README.md` | Phase/ticket index |
| `AGENTS.md` | AI contributor guide |
| `CONTRIBUTING.md` | Developer workflow |
| `CHANGELOG.md` | Version history |
| `docs/branching.md` | Branch naming and PR policy |
| `docs/frontend-architecture.md` | Layer patterns and conventions |

## Contributing

See `CONTRIBUTING.md`. Quick summary:
1. Branch from main: `author/feature/short-description`
2. `make type-check && make lint && make build` must pass
3. Open PR with the template; include `Fixes #nn` or `Refs #nn`

## License

MIT
