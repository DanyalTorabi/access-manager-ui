# T6 — Application Routing and Layout

**Phase:** Phase 1 — Application routing and layout

## Ticket

**T6** — Establish application shell: routing, layout, and theme (GitHub [#1](https://github.com/DanyalTorabi/access-manager-ui/issues/1))

## Status

**Done.**

## Problem / motivation

The scaffolded Vite app had no routing, no navigation, and no consistent layout. Without a domain-first navigation model, users had no way to move between the six entity management areas. Light/dark theme was not supported.

## Goal

Establish the full application shell: router, persistent sidebar, domain-scoped sub-navigation, and dark-mode toggle.

## Deliverables

- `src/router.tsx` — TanStack Router with routes: `/`, `/domains`, `/domains/:id/users`, `/domains/:id/groups`, `/domains/:id/resources`, `/domains/:id/access-types`, `/domains/:id/permissions`
- `src/main.tsx` — `QueryClientProvider` → `ThemeProvider` → `RouterProvider` provider stack; `RootLayout` with `<Sidebar>` + `<Outlet>`
- `src/pages/DomainDetailLayout.tsx` — layout wrapper that prefetches the domain record and renders sub-nav in the sidebar
- `src/components/Sidebar.tsx` — fixed left sidebar (w-56); top-level "Domains" link; domain sub-nav (← All Domains, Users, Groups, Resources, Access Types, Permissions); dark-mode toggle in footer
- `src/components/ThemeProvider.tsx` and `src/components/ThemeToggle.tsx` — `localStorage`-persisted theme
- Redirect `/` → `/domains`
- Removed orphaned Vite scaffold files: `src/App.tsx`, `src/App.css`

## Steps

1. Install TanStack Router (`@tanstack/react-router`)
2. Define all routes in `src/router.tsx`
3. Build `Sidebar` with conditional top-level / domain sub-nav rendering
4. Implement `ThemeProvider` using `localStorage` and `class` on `<html>`
5. Wrap app in `QueryClientProvider` → `ThemeProvider` → `RouterProvider` in `src/main.tsx`
6. Remove orphaned Vite scaffold files (`src/App.tsx`, `src/App.css`)

## Files / paths

- Created: `src/router.tsx`, `src/components/Sidebar.tsx`, `src/components/ThemeProvider.tsx`, `src/components/ThemeToggle.tsx`, `src/pages/DomainDetailLayout.tsx`
- Edited: `src/main.tsx`
- Deleted: `src/App.tsx`, `src/App.css`

## Acceptance criteria

- `/` redirects to `/domains`
- Clicking into a domain switches sidebar to sub-nav showing domain title
- "← All Domains" returns to `/domains`
- Dark/light toggle persists across page refresh
- `src/App.tsx` and `src/App.css` do not exist in the repository
- `make type-check && make lint && make test-run && make build` all pass

## Out of scope

- Entity CRUD pages (T7–T10)
- Breadcrumbs (T15)

## Dependencies

T1–T5 (project foundation complete)

## Milestone

26Q2
