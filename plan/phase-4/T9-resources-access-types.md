# T9 — Resource and Access Type Management

**Phase:** Phase 4 — Resource and access type management

## Ticket

**T9** — Resource and access type management (GitHub [#4](https://github.com/DanyalTorabi/access-manager-ui/issues/4))

## Status

**Implemented.** This file is a retroactive spec documenting what was built.

## Problem / motivation

Resources (things being protected) and access types (named bit flags) are the building blocks of permissions. Without them, no permission can be composed.

## Goal

Full CRUD for resources and access types within a domain. Access types display their bit value in both decimal and hex to make the bitmask model clear.

## Deliverables

- `src/api/resources.ts` — `resourcesApi.list`, `get`, `create`, `update`, `delete`
- `src/api/accessTypes.ts` — `accessTypesApi.list`, `get`, `create`, `update`, `delete`; `create`/`update` carry `bit: number`
- `src/hooks/useResources.ts` — `useResourcesQuery`, create/update/delete mutations
- `src/hooks/useAccessTypes.ts` — `useAccessTypesQuery`, create/update/delete mutations
- `src/pages/ResourcesPage.tsx` — full CRUD page
- `src/pages/AccessTypesPage.tsx` — full CRUD page; bit column displays `N (0xN)` to show the hex value alongside decimal

## Steps

1. Build `api/resources.ts` and `api/accessTypes.ts`
2. Build hooks
3. Build `ResourcesPage` reusing shared components
4. Build `AccessTypesPage`; add custom column renderer for bit: `${v} (0x${v.toString(16)})`

## Files / paths

- Created: `src/api/resources.ts`, `src/api/accessTypes.ts`, `src/hooks/useResources.ts`, `src/hooks/useAccessTypes.ts`, `src/pages/ResourcesPage.tsx`, `src/pages/AccessTypesPage.tsx`

## Acceptance criteria

- Resources and access types list, create, edit, delete within a domain
- Access type bit column shows `N (0xN)` format
- `make type-check && make lint` pass

## Out of scope

- Bit-flag checkbox picker for composing access masks (deferred)

## Dependencies

T7 (shared components), T8 (domain context established)

## Milestone

26Q2
