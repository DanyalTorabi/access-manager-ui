# T11 — Implement Server-side Search on All Entity Pages

**Phase:** Phase 6 — Authorization features

## Ticket

**T11** — Implement server-side search on all entity pages (GitHub [#6](https://github.com/DanyalTorabi/access-manager-ui/issues/6))

## Problem / motivation

`EntityTable`'s search input uses TanStack Table's internal `globalFilter` state, which filters only the rows currently loaded in memory (~20 rows per page). The backend supports full-text search via `?search=` query param, and `ListParams.search` is structurally wired through to every hook's query key — but no page ever sets a `search` state variable, and `EntityTable` never calls back to the parent. The result is silently broken search across all 6 entity pages.

> **Note:** A partial stub (`searchValue?` / `onSearchChange?`) was added to `EntityTable` as optional props in a prior commit. This ticket promotes those to required, controlled props (`search` / `onSearchChange`) with debouncing and removes the internal `globalFilter` fallback.

## Goal

Replace the client-side-only search with a controlled, debounced search that drives backend query parameters on all entity pages.

## Deliverables

- `EntityTable` has two required props: `search: string` (controlled value from parent) and `onSearchChange: (v: string) => void` (callback). The component keeps a local `inputValue` state for immediate display, synced via a 300 ms debounce before firing the callback. The old optional `searchValue?` stub is promoted to required `search`. The `getFilteredRowModel()` TanStack Table plugin and `globalFilter` state are removed.
- All 6 pages (`DomainsPage`, `UsersPage`, `GroupsPage`, `ResourcesPage`, `AccessTypesPage`, `PermissionsPage`) add a `search` `useState('')`, pass it to their hook's `ListParams`, reset `offset` to `0` when search changes, and pass `search` + `onSearchChange` to `EntityTable`.
- No hook changes required — query keys already include `params.search`.

## Steps

1. Update `plan/phase-6/T11-server-side-search.md`: correct naming discrepancy (`searchValue` → `search`), note the pre-existing stub
2. Edit `src/components/EntityTable.tsx`: promote optional `searchValue?` stub to required `search` prop; add local `inputValue` state + `useRef` 300 ms debounce calling `onSearchChange`; remove `globalFilter`, `onGlobalFilterChange`, and `getFilteredRowModel` from `useReactTable`
3. Edit `src/components/EntityTable.test.tsx`: add required `search`/`onSearchChange` props to all existing renders; replace client-side filter test with a debounce callback-invocation test using `vi.useFakeTimers()`
4. Edit each of the 6 pages: add `const [search, setSearch] = useState('')`; pass `{ search }` to their query hook; pass `search={search}` and `onSearchChange={(v) => { setSearch(v); setOffset(0) }}` to `EntityTable`
5. Update `CHANGELOG.md` with Unreleased entry

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
