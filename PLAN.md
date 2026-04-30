# PLAN.md — Product Vision

## What is access-manager-ui?

A web-based admin dashboard that connects to the [access-manager](https://github.com/DanyalTorabi/access-manager) backend service and lets operators manage domain-scoped access control:

- Create and manage **domains** (isolated access-control namespaces — one per application or tenant)
- Manage **users** and **groups** within a domain
- Define **resources** (things being protected) and **access types** (named bit flags: read=1, write=2, admin=4…)
- Compose **permissions** (resource + access mask) and grant them to users or groups
- **Check authorization**: given a user, resource, and access mask — does the user have access?
- **List grants**: all users with access to a resource, all resources accessible to a user

## Entity model

```
Domain
  ├── Users
  ├── Groups (optional parent group — tree structure)
  ├── Resources
  ├── Access Types (each = single named bit)
  └── Permissions (resource + access mask = OR of access type bits)
       ├── granted to Users
       └── granted to Groups
```

Access check: `(user's direct permissions ∪ permissions from all their groups) ∩ requested mask != 0`

## UI goals

- Fast and keyboard-friendly: tables with search, sort, and pagination
- Domain-first navigation: pick a domain → manage everything within it
- Safe mutations: confirmation dialogs for destructive actions, inline edit for quick updates
- Authorization checker: interactive form to test access in real time

## Backend

REST API at `http://127.0.0.1:8080/api/v1` (default). See [access-manager repo](https://github.com/DanyalTorabi/access-manager) for API spec (`api/openapi.yaml`).

Authentication: optional Bearer token via `VITE_API_BEARER_TOKEN` env var.

## Milestone map

| Phase | Milestone | Theme |
|-------|-----------|-------|
| 0 | 26Q2 | Project foundation (docs, Docker, CI, templates) |
| 1 | 26Q2 | Routing and layout |
| 2 | 26Q2 | Domain management |
| 3 | 26Q2 | User and group management |
| 4–5 | TBD | Resource, access type, permission management |
| 6 | TBD | Authorization checker |
| 7 | TBD | Polish, accessibility, E2E tests |

## Tech stack

| Layer | Choice |
|-------|--------|
| Build | Vite 5 + TypeScript strict |
| Framework | React 18 |
| Routing | TanStack Router (code-based; migrate to file-based when Node ≥ 20) |
| Server state | TanStack Query v5 |
| Tables | TanStack Table v8 |
| Forms | React Hook Form + Zod |
| UI | shadcn/ui + Tailwind CSS |
| HTTP | native fetch (thin wrapper in `src/api/client.ts`) |
| API types | openapi-typescript (generated from backend OpenAPI spec) |
