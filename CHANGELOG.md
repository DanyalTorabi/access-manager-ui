# Changelog

All notable changes to access-manager-ui are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — Semantic Versioning.

---

## [Unreleased]

### Added

- **UI** — Left sidebar navigation with icons (Globe, Users, Layers, Package, Key, ShieldCheck) and "Access Manager" branding
- **UI** — Light/dark theme toggle in sidebar footer with localStorage persistence (`ThemeProvider`, `ThemeToggle`)
- **UI** — Six entity pages: Domains, Users, Groups, Resources, Access Types, Permissions — all with list, search, sort, and offset-based pagination
- **UI** — Domain-scoped sub-entity navigation: clicking into a domain shows its Users, Groups, Resources, Access Types, and Permissions
- **UI** — Edit drawer (right-side sheet) opens on row double-click for in-place record editing
- **UI** — Delete confirmation modal with entity name shown before confirming destructive action
- **UI** — Form validation via React Hook Form + Zod on all create/edit forms; required fields enforced before save
- **UI** — Shared `EntityTable` component (TanStack Table) with server-side sort, client-side search, double-click to edit
- **API** — Typed API modules for Users, Groups, Resources, Access Types, Permissions (`src/api/`)
- **API** — `api/client.ts` now handles 204 No Content responses correctly (no JSON parse attempt)
- **Hooks** — TanStack Query hooks for all six entities with proper `invalidateQueries` after mutations (`src/hooks/`)
- **Tests** — Vitest + Testing Library + MSW test suite; 32 unit/integration tests covering API layer, hooks, components, and DomainsPage
- **Routing** — Full TanStack Router route tree: `/domains`, `/domains/:domainId/users|groups|resources|access-types|permissions`

- **T1** — `AGENTS.md`: AI contributor guide covering repo layout, layer boundaries, security rules, post-task checklist, and branching policy
- **T1** — `.cursor/rules/access-manager-ui.mdc`: Cursor always-apply rules
- **T1** — `.cursor/rules/code-review.mdc`: Cursor conditional code-review checklist
- **T1** — `.github/copilot-instructions.md`: GitHub Copilot code-review standards
- **T2** — `README.md`: comprehensive project README replacing Vite template
- **T2** — `PLAN.md`: product vision, entity model, and milestone map
- **T2** — `CONTRIBUTING.md`: developer and AI contributor workflow
- **T2** — `Makefile`: delegates to npm; targets for dev, build, lint, type-check, docker
- **T2** — `.env.example`: env var template
- **T2** — `docs/branching.md`: trunk-based branching strategy
- **T2** — `docs/frontend-architecture.md`: layer boundary rules and TanStack patterns
- **T3** — `Dockerfile`: multi-stage (Node 18 build + nginx serve), non-root
- **T3** — `docker-compose.yml`: local app service at `127.0.0.1:3000`
- **T3** — `.dockerignore`
- **T4** — `.github/workflows/ci.yml`: lint, type-check, build, Docker smoke, GHCR publish on main
- **T5** — `.github/pull_request_template.md`
- **T5** — `.github/ISSUE_TEMPLATE/bug_report.md`
- **T5** — `.github/ISSUE_TEMPLATE/task.md`
- **T5** — `.github/ISSUE_TEMPLATE/config.yml`
- **Phase 0 bootstrap** — Vite 5 + React 18 + TypeScript strict + TanStack Router/Query/Table + shadcn/ui + Tailwind CSS + React Hook Form + Zod
- Auto-generated `src/api/schema.ts` from backend OpenAPI spec; typed API client; Domains CRUD page
- **T7** — Domains full CRUD: `EntityTable` (TanStack Table, sort, client-side search, pagination), `EntityDrawer` (Sheet-based create/edit), `ConfirmDeleteDialog`; `api/client.ts` fetch wrapper with auth header and 204 handling; `api/domains.ts` typed API module; `hooks/useDomains.ts` TanStack Query wrappers; `DomainsPage` wired with React Hook Form + Zod validation

### Fixed

- **T7** — `DomainsPage` Title column lacked an explicit `id`, causing `onSortChange` to emit `'Title'` (PascalCase) instead of the API-expected `'title'`; added `id: 'title'` to the column definition
- **T7** — `vitest.config.ts` now pins `VITE_API_BASE_URL` via `define` so the test suite is independent of `.env.local` overrides (tests no longer fail when the local dev URL differs from MSW handler registrations)

---

<!-- Links (update on release) -->
[Unreleased]: https://github.com/DanyalTorabi/access-manager-ui/compare/HEAD...HEAD
