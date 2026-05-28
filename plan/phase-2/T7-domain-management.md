# T7 — Domain Management

**Phase:** Phase 2 — Domain management

## Ticket

**T7** — Domain management (GitHub [#2](https://github.com/DanyalTorabi/access-manager-ui/issues/2))

## Status

**Implemented.** This file is a retroactive spec documenting what was built.

## Problem / motivation

No CRUD interface existed for domains. Domains are the top-level namespace that all other entities belong to; they must be created before any other management work can be done.

## Goal

Full domain management: list, search, sort, paginate, create, edit, delete — with shared table and drawer components reusable by all subsequent entity pages.

## Deliverables

- `src/api/client.ts` — fetch wrapper, `ApiError` class, auth header from `VITE_API_BEARER_TOKEN`, 204 No Content handling
- `src/api/domains.ts` — `domainsApi.list`, `get`, `create`, `update`, `delete`
- `src/api/types.ts` — `Domain`, `User`, `Group`, `Resource`, `AccessType`, `Permission`, `ListMeta`, `ErrorBody`, `ListResponse<T>`, `ListParams`
- `src/hooks/useDomains.ts` — `useDomainsQuery`, `useCreateDomain`, `useUpdateDomain`, `useDeleteDomain`
- `src/components/EntityTable.tsx` — TanStack Table with client-side `globalFilter`, column sort (asc/desc toggle), offset pagination (prev/next, page N/total), configurable columns via `ColumnDef[]`
- `src/components/EntityDrawer.tsx` — right-side Sheet that opens on "+ New" button or row double-click; renders form slot
- `src/components/ConfirmDeleteDialog.tsx` — AlertDialog shown before destructive delete, displays entity name
- `src/pages/DomainsPage.tsx` — thin page: React Hook Form + Zod schema, wires EntityTable + EntityDrawer + ConfirmDeleteDialog

## Steps

1. Build `api/client.ts` with `get`, `post`, `patch`, `delete` methods
2. Generate `api/schema.ts` from OpenAPI spec (`make generate-types`)
3. Define `api/types.ts` re-exports
4. Build `api/domains.ts` using `buildQuery` helper for `ListParams` serialization
5. Build `hooks/useDomains.ts` with `useQuery` + `useMutation` wrappers; `invalidateQueries` on success
6. Build `EntityTable`, `EntityDrawer`, `ConfirmDeleteDialog` shared components
7. Build `DomainsPage` wiring all pieces together

## Files / paths

- Created: `src/api/client.ts`, `src/api/schema.ts`, `src/api/types.ts`, `src/api/domains.ts`, `src/hooks/useDomains.ts`, `src/components/EntityTable.tsx`, `src/components/EntityDrawer.tsx`, `src/components/ConfirmDeleteDialog.tsx`, `src/pages/DomainsPage.tsx`
- Created tests: `src/api/domains.test.ts`, `src/hooks/useDomains.test.ts`, `src/pages/DomainsPage.test.tsx`, `src/test/handlers.ts`, `src/test/server.ts`, `src/test/setup.ts`

## Acceptance criteria

- Domains list loads with sort, pagination, and client-side search
- Create/edit via drawer with React Hook Form + Zod validation
- Delete via confirmation dialog
- `make type-check && make lint` pass

## Out of scope

- Server-side search (T11)
- Cross-entity relationships

## Dependencies

T6 (routing must exist to register `/domains` route)

## Milestone

26Q2
