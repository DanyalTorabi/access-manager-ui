# T2 — Project Documentation

**Phase:** Phase 0 — Project foundation

## Problem / motivation

The current `README.md` is the Vite scaffold template. There is no product vision, no setup guide, no changelog, no contribution guide, and no docs directory. A new developer cannot understand what the app does or how to run it.

## Goal

Replace the template README with a comprehensive project README and create all supporting documentation.

## Deliverables

- `README.md` — what the app is, quickstart, make commands, Docker setup, env vars, docs index
- `PLAN.md` — product vision: entity model, milestone map, UI goals
- `CHANGELOG.md` — Keep a Changelog format; Unreleased section for Phase 0
- `CONTRIBUTING.md` — local dev workflow, commit conventions, PR checklist, make commands
- `Makefile` — delegates to npm; targets: `dev`, `build`, `lint`, `type-check`, `preview`, `generate-types`, `docker-*`
- `.env.example` — template showing `VITE_API_BASE_URL` and `VITE_API_BEARER_TOKEN` with empty values
- `docs/branching.md` — trunk-based strategy, branch naming, PR policy, squash-merge default
- `docs/frontend-architecture.md` — layer boundaries, TanStack patterns, shadcn/ui conventions

## Steps

1. Write `PLAN.md` (product vision): what access-manager-ui manages, entity relationships, authz UX goal, milestone phases
2. Write `README.md`: project overview, prerequisites (Node 18+), quickstart (`make dev`), env var table, Docker instructions, links to all docs
3. Write `CHANGELOG.md`: Unreleased section listing Phase 0 additions
4. Write `CONTRIBUTING.md`: how to set up local dev, `make` commands reference, commit message format, PR workflow, AI assistant expectations
5. Write `Makefile`: delegation to npm with all common targets
6. Write `.env.example`: template with inline comments
7. Write `docs/branching.md`: trunk-based model, naming convention, PR process
8. Write `docs/frontend-architecture.md`: layer diagram, data-fetching pattern, form pattern, table pattern

## Files / paths

- Replace: `README.md`
- Create: `PLAN.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `Makefile`, `.env.example`, `docs/branching.md`, `docs/frontend-architecture.md`

## Acceptance criteria

- `make dev` starts the Vite dev server
- `make type-check && make lint && make build` all pass with zero errors
- New developer can read README and get the app running in under 10 minutes
- CHANGELOG records Phase 0 work in Unreleased section

## Out of scope

- Actual feature documentation (covered per-phase)

## Dependencies

T1 (AGENTS.md defines the `make` command expectations referenced in CONTRIBUTING.md)

## Milestone

26Q2
