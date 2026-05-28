# T11 — Fix Server-side Search

**Phase:** Phase 6 — Authorization features

## Ticket

**T11** — Fix server-side search (GitHub [#6](https://github.com/DanyalTorabi/access-manager-ui/issues/6))

## Problem / motivation

`EntityTable`'s search input uses TanStack Table's internal `globalFilter` state, which filters only the rows currently loaded in memory (~20 rows per page). The backend supports full-text search via `?search=` query param, and `ListParams.search` is structurally wired through to every hook's query key — but no page ever sets a `search` state variable, and `EntityTable` never calls back to the parent. The result is silently broken search across all 6 entity pages.

## Goal

Replace the client-side-only search with a controlled, debounced search that drives backend query parameters on all entity pages.

## Deliverables

- `EntityTable` gets two new props: `search: string` (controlled) and `onSearchChange: (v: string) => void` (callback). Internal `globalFilter` state is removed. A 300ms debounce inside the component batches keystrokes before firing the callback. The `getFilteredRowModel()` TanStack Table plugin is removed.
- All 6 pages (`DomainsPage`, `UsersPage`, `GroupsPage`, `ResourcesPage`, `AccessTypesPage`, `PermissionsPage`) add a `search` `useState('')`, pass it to their hook's `ListParams`, reset `offset` to `0` when search changes, and pass `search` + `onSearchChange` to `EntityTable`.
- No hook changes required — query keys already include `params.search`.

## Steps

1. Edit `src/components/EntityTable.tsx`: add `search` + `onSearchChange` props, add internal debounced state that calls `onSearchChange`, remove `globalFilter` and `getFilteredRowModel`
2. Edit each of the 6 pages: add `const [search, setSearch] = useState('')`; pass `{ search }` to their query hook; pass `search={search}` and `onSearchChange={setSearch}` to `EntityTable`; reset offset in the `onSearchChange` handler

## Files / paths

- Edit: `src/components/EntityTable.tsx`
- Edit: `src/pages/DomainsPage.tsx`, `src/pages/UsersPage.tsx`, `src/pages/GroupsPage.tsx`, `src/pages/ResourcesPage.tsx`, `src/pages/AccessTypesPage.tsx`, `src/pages/PermissionsPage.tsx`

## Acceptance criteria

- Typing in the search box on any entity page sends `?search=<term>` to the backend and refetches
- Search queries the full dataset, not just the current page
- Clearing the search box resets to the full unfiltered list
- Pagination offset resets to 0 on each new search
- `make type-check && make lint && make build` pass

## Out of scope

- `search_type` param UI (contains / starts_with / ends_with / exact) — future improvement
- Access mask search in PermissionsPage

## Dependencies

T7 (EntityTable exists), T8–T10 (all pages exist)

## Milestone

26Q2
