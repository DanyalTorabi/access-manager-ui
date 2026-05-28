# T12 — Domain Overview Dashboard

**Phase:** Phase 6 — Authorization features

## Ticket

**T12** — Domain overview dashboard (GitHub [#7](https://github.com/DanyalTorabi/access-manager-ui/issues/7))

## Problem / motivation

After clicking into a domain, the user is immediately redirected to the Users sub-page. There is no at-a-glance summary of the domain's content. A developer evaluating the service cannot quickly see what is configured in a domain without visiting five separate pages.

## Goal

Create a domain overview page that displays entity counts and provides quick navigation to each sub-section.

## Deliverables

- `src/pages/DomainOverviewPage.tsx` — 5 stat cards displayed in a grid: Users, Groups, Resources, Access Types, Permissions. Each card shows the entity count (from `meta.total` via a `limit=1` query) and links to the corresponding sub-page. The domain title is shown as the page heading.
- Register `/domains/:id` route in `src/router.tsx` pointing to `DomainOverviewPage` (currently the route either redirects or is undefined). Update the `DomainDetailLayout` back-link or sidebar to include an "Overview" entry.
- Add "Overview" link as the first item in the domain sub-nav in `src/components/Sidebar.tsx`.
- No new hooks needed — reuse existing `useXxxQuery` hooks with `{ limit: 1 }`.

## Steps

1. Create `src/pages/DomainOverviewPage.tsx` with 5 `useXxxQuery(domainId, { limit: 1 })` calls; render a grid of stat cards using Tailwind utility classes; each card is a `<Link>` to the sub-page route
2. Register `/domains/:id` in `src/router.tsx` → `DomainOverviewPage`
3. Add "Overview" nav link in `Sidebar.tsx` domain sub-nav section

## Files / paths

- Create: `src/pages/DomainOverviewPage.tsx`
- Edit: `src/router.tsx`, `src/components/Sidebar.tsx`

## Acceptance criteria

- Clicking a domain in the domains list navigates to `/domains/:id` showing the overview page
- Each stat card shows the correct count matching the corresponding sub-entity page
- Each stat card links to the correct sub-page
- Loading states are handled gracefully (show `—` or skeleton while loading)
- `make type-check && make lint && make build` pass

## Out of scope

- "Recent activity" or time-sorted entity lists (backend does not expose created_at)
- Graphical charts or visualizations

## Dependencies

T6 (routing), T7–T10 (all hooks exist)

## Milestone

26Q2
