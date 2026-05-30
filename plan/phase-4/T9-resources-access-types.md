# T9 — Resource and Access Type Management

**Phase:** Phase 4 — Resource and access type management

## Ticket

**T9** — Resource and access type management (GitHub [#4](https://github.com/DanyalTorabi/access-manager-ui/issues/4))

## Status

**Complete.**

## Problem / motivation

Resources (things being protected) and access types (named bit flags) are the building blocks of permissions. Without them, no permission can be composed.

## Goal

Full CRUD for resources and access types within a domain. Access types display their bit value in both decimal and hex to make the bitmask model clear.

## Deliverables

- `src/api/resources.ts` — `resourcesApi.list`, `get`, `create`, `update`, `delete`
- `src/api/accessTypes.ts` — `accessTypesApi.list`, `get`, `create`, `update`, `delete`; `create`/`update` carry `bit: number`
- `src/hooks/useResources.ts` — `useResourcesQuery`, create/update/delete mutations; `limit` included in query key
- `src/hooks/useAccessTypes.ts` — `useAccessTypesQuery`, create/update/delete mutations; `limit` included in query key
- `src/pages/ResourcesPage.tsx` — full CRUD page
- `src/pages/AccessTypesPage.tsx` — full CRUD page; bit column displays `N (0xN)` to show the hex value alongside decimal
- `src/api/resources.test.ts` — full CRUD coverage, error propagation, query-param forwarding spy
- `src/api/accessTypes.test.ts` — full CRUD coverage including `Bit` field parsing, error propagation, query-param forwarding spy
- `src/hooks/useResources.test.ts` — query success/error; all three mutations with `invalidateQueries` spy assertions
- `src/hooks/useAccessTypes.test.ts` — query success/error; all three mutations with `invalidateQueries` spy assertions
- `src/test/handlers.ts` — single-GET MSW handlers for `GET .../resources/:id` and `GET .../access-types/:id`

## Steps

1. Build `api/resources.ts` and `api/accessTypes.ts`
2. Build hooks
3. Build `ResourcesPage` reusing shared components
4. Build `AccessTypesPage`; add custom column renderer for bit: `${v} (0x${v.toString(16)})`
5. Fix `limit` missing from query keys in both hooks (cache collision bug)
6. Add single-GET MSW handlers for resources and access-types
7. Write `src/api/resources.test.ts` and `src/api/accessTypes.test.ts`
8. Write `src/hooks/useResources.test.ts` and `src/hooks/useAccessTypes.test.ts`

## Files / paths

- Created: `src/api/resources.ts`, `src/api/accessTypes.ts`, `src/hooks/useResources.ts`, `src/hooks/useAccessTypes.ts`, `src/pages/ResourcesPage.tsx`, `src/pages/AccessTypesPage.tsx`

## Acceptance criteria

- Resources and access types list, create, edit, delete within a domain
- Access type bit column shows `N (0xN)` format
- `limit` param included in `useResourcesQuery` and `useAccessTypesQuery` query keys
- All three mutations (`create`, `update`, `delete`) for both entities covered with `invalidateQueries` spy assertions
- Query-param forwarding verified via URL spy in API tests
- `make type-check && make lint && make test-run` pass

## Out of scope

- Bit-flag checkbox picker for composing access masks (deferred)

## Dependencies

T7 (shared components), T8 (domain context established)

## Milestone

26Q2
