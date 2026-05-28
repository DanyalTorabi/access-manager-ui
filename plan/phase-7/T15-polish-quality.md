# T15 — Polish and Quality

**Phase:** Phase 7 — Polish and hardening

## Ticket

**T15** — Polish and quality (GitHub [#10](https://github.com/DanyalTorabi/access-manager-ui/issues/10))

## Problem / motivation

The application has no feedback on successful mutations (silent success), crashes entirely on unhandled React errors, shows plain "Loading…" text instead of skeleton placeholders, has no contextual breadcrumb, and has incomplete test coverage (MSW handlers and page tests only exist for Domains, Users, and Groups).

## Goal

Harden the UX and improve test coverage across all entity pages and the new authorization features from T11–T14.

## Deliverables

### Toast notifications
- Install `sonner` (Vite-compatible, used by shadcn/ui ecosystem)
- Add `<Toaster />` to `src/main.tsx` or `src/App.tsx`
- In every `useMutation` `onSuccess` callback: call `toast.success('Created "…"')` / `toast.success('Updated "…"')` / `toast.success('Deleted "…"')`
- In every `useMutation` `onError` callback: call `toast.error(err.message)` (using `ApiError.message`)
- Affects: `useDomains`, `useUsers`, `useGroups`, `useResources`, `useAccessTypes`, `usePermissions`, `useGrants` (T13)

### Breadcrumbs
- Add shadcn `breadcrumb` component (`src/components/ui/breadcrumb.tsx`)
- Add `<Breadcrumb>` above each page `<h1>` on domain sub-pages: `Domains > {domain.title} > {Page Name}`
- Domain title is available from `DomainDetailLayout` context via TanStack Router `useParams` + existing domain query

### Error boundaries
- Create `src/components/ErrorBoundary.tsx` (React class component with `componentDidCatch`)
- Renders a friendly "Something went wrong" card with a "Try again" button that calls `this.setState({ hasError: false })`
- Wrap each route-level page in `src/router.tsx` (or via `errorComponent` in TanStack Router route definitions)

### Loading skeletons
- Add shadcn `skeleton` component (`src/components/ui/skeleton.tsx`)
- In `EntityTable`: when `isLoading` is true, render N skeleton rows (matching `limit` prop) instead of the real table body

### Test coverage
- Add MSW handlers for Resources, AccessTypes, Permissions in `src/test/handlers.ts`
- Add page-level render tests for `ResourcesPage`, `AccessTypesPage`, `PermissionsPage`
- Add a test for `AuthzCheckerPage` (T14): mock `authz/check` handler returning `{ allowed: true, effective_mask: "1" }` → verify ALLOWED badge renders
- Add tests for grant mutations (T13) covering the `UserAccessPanel` happy path

## Steps

1. `npm install sonner`; add `<Toaster>` to app; add `toast.success` / `toast.error` to all mutation hooks
2. Generate shadcn breadcrumb: `npx shadcn@latest add breadcrumb`; add to all domain sub-pages
3. Write `ErrorBoundary.tsx`; apply to routes
4. Generate shadcn skeleton: `npx shadcn@latest add skeleton`; integrate into `EntityTable`
5. Expand `src/test/handlers.ts` with missing entity handlers; add page tests

## Files / paths

- Create: `src/components/ErrorBoundary.tsx`, `src/components/ui/breadcrumb.tsx`, `src/components/ui/skeleton.tsx`
- Edit: `src/main.tsx`, all mutation hooks (`useDomains.ts`, `useUsers.ts`, `useGroups.ts`, `useResources.ts`, `useAccessTypes.ts`, `usePermissions.ts`, `useGrants.ts`), `src/components/EntityTable.tsx`, `src/test/handlers.ts`
- Create tests: `src/pages/ResourcesPage.test.tsx`, `src/pages/AccessTypesPage.test.tsx`, `src/pages/PermissionsPage.test.tsx`, `src/pages/AuthzCheckerPage.test.tsx`

## Acceptance criteria

- Every mutation shows a toast on success and error
- Breadcrumbs appear on all domain sub-pages with correct hierarchy
- React rendering errors are caught by `ErrorBoundary` and show a recovery UI instead of a blank page
- `EntityTable` shows skeleton rows while loading
- `make test` passes including all new tests
- `make type-check && make lint && make build` pass

## Out of scope

- E2E tests with Playwright (deferred)
- Accessibility audit (deferred)
- i18n

## Dependencies

T11–T14 (features must exist to test), T7 (EntityTable)

## Milestone

26Q2
