# Implementation Plans — access-manager-ui

Plans are organised by phase. Each file is named `T##-short-name.md`. The `T##` label is stable and links to the corresponding GitHub issue. Status and scheduling live in GitHub Issues only; this directory is the executable spec.

## How to use

Work through phases in order (0 → N) unless a plan's **Dependencies** section says otherwise. When starting a ticket, split it into sub-tasks in your GitHub issue if helpful.

## Phases

| Phase | Theme | Specs | Folder |
|-------|-------|-------|--------|
| 0 | Project foundation — AI tooling, docs, Docker, CI, GitHub templates | T1–T5 | phase-0/ |
| 1 | Application routing and layout — domain navigation, sidebar, dark mode | TBD | phase-1/ |
| 2 | Domain management — full CRUD, search, pagination | TBD | phase-2/ |
| 3 | User & Group management — CRUD, membership, permission grants | TBD | phase-3/ |
| 4 | Resource & Access Type management — CRUD, bit-flag UX | TBD | phase-4/ |
| 5 | Permission management — CRUD, resource+mask composition | TBD | phase-5/ |
| 6 | Authorization checker — interactive check/mask UX | TBD | phase-6/ |
| 7 | Polish & hardening — error boundaries, loading states, accessibility, E2E tests | TBD | phase-7/ |

**Pickup from GitHub Issues.** Use `docs/frontend-architecture.md` for layer and component patterns. The current active milestone is **26Q2** (April–June 2026).
