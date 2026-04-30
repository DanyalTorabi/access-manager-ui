# Changelog

All notable changes to access-manager-ui are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — Semantic Versioning.

---

## [Unreleased]

### Added

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

---

<!-- Links (update on release) -->
[Unreleased]: https://github.com/DanyalTorabi/access-manager-ui/compare/HEAD...HEAD
