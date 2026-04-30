# AGENTS.md — AI Contributor Guide

This file orients AI contributors (Claude, GitHub Copilot, Cursor) to this repository. Read it before touching any code. The rules here apply equally to human contributors.

---

## Repository shape

```
access-manager-ui/
├── src/
│   ├── api/          # API client + typed functions per entity (client.ts, domains.ts, …)
│   ├── components/   # Shared UI components (shadcn/ui components live here)
│   ├── hooks/        # Custom TanStack Query hooks and mutations
│   ├── lib/          # Pure utilities — cn(), date helpers, etc.
│   ├── pages/        # Route-level page components (one per route)
│   ├── routes/       # TanStack Router route definitions (when file-based routing is used)
│   └── main.tsx      # App entry: QueryClient + RouterProvider
├── plan/             # Phase-based implementation specs (T01, T02, …)
├── docs/             # branching.md, frontend-architecture.md
├── .github/          # CI workflow, PR template, issue templates, Copilot instructions
├── .cursor/          # Cursor IDE rules
├── Makefile          # Delegates to npm — single interface for all tooling
└── PLAN.md           # Product vision and milestone map
```

Work is tracked in **GitHub Issues only**. Plan files under `plan/` are executable specs; GitHub Issues drive scheduling and status.

---

## Layer boundaries — keep these clean

```
pages/          ← thin: render + local UI state only
  ↓ uses
hooks/          ← TanStack Query hooks (useQuery, useMutation wrappers)
  ↓ calls
api/*.ts        ← named, typed functions per entity (domainsApi.list(), usersApi.create(), …)
  ↓ uses
api/client.ts   ← fetch wrapper, ApiError class, base URL, auth header
```

**Rules:**
- Pages must NOT import `api/client.ts` directly — always go through `api/*.ts` named functions.
- No business logic in JSX — extract to hooks or helpers.
- `api/client.ts` must not import anything from React.
- `src/lib/` contains pure utilities only (no React, no API calls).

---

## Security

- **Never commit secrets**, API keys, tokens, `.env.local`, or any credential to source.
- `.env.local` is gitignored. Use `.env.example` as a template (empty values only).
- `VITE_API_BEARER_TOKEN` must only be set in `.env.local` or CI secrets — never hardcoded.
- Default `VITE_API_BASE_URL=http://127.0.0.1:8080` for local dev.
- Do not suggest `0.0.0.0` or wildcard origins without explicitly noting the security implication.

---

## No unused code

Do not add uncalled functions, components, or types. Defer speculative additions to a GitHub issue. Reference future work with `// TODO(T##): brief reason` where a ticket number is known.

---

## After each task (lightweight checklist)

Run these before considering work done:

```bash
make type-check   # zero TypeScript errors
make lint         # zero ESLint errors
make build        # dist/ produced, no warnings
```

For behavioral changes: add or update a test (when test infrastructure exists). For UI changes visible to users: add an Unreleased bullet to `CHANGELOG.md`.

---

## Commits and PRs (AI assistant defaults)

- Create a topic branch from up-to-date `main` BEFORE making file changes.
- Branch naming: `author/prefix/short-kebab-description` (all lowercase). See `docs/branching.md`.
- Do **NOT** run `git commit`, `git push`, or `gh pr create` unless the user explicitly asks.
- When asked to create a PR: provide the proposed commit message and PR body; do not push unless told.
- PR title format: `[T##] short imperative title` when a ticket number exists.
- PR body: include `Fixes #nn` or `Refs #nn` in the Ticket section.

---

## Current milestone

**26Q2** — April–June 2026 (due 2026-06-30). All new GitHub Issues must be assigned to this milestone.

---

## Key commands

```bash
make dev              # start Vite dev server at http://localhost:5173
make type-check       # TypeScript compiler check (no emit)
make lint             # ESLint
make build            # production build → dist/
make generate-types   # regenerate src/api/schema.ts from the OpenAPI spec
make docker-build     # build Docker image
make docker-up        # start container at http://localhost:3000
make docker-down      # stop container
```

---

## GitHub CLI

Prefer `gh` for all GitHub operations:

```bash
gh issue create --title "[T##] ..." --body "..."
gh pr create --title "[T##] ..." --body "..."
gh issue list --milestone 26Q2
```

---

## Related files

- `PLAN.md` — product vision and roadmap
- `plan/README.md` — phase and T-number index
- `docs/branching.md` — branch naming and PR policy
- `docs/frontend-architecture.md` — layer patterns and component conventions
- `CONTRIBUTING.md` — developer workflow
- `.github/copilot-instructions.md` — Copilot code-review standards
- `.cursor/rules/` — Cursor IDE rules
