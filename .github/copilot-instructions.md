# GitHub Copilot Instructions — access-manager-ui

This file governs Copilot's code review and completion behavior for this repository. Read `AGENTS.md` for full context.

---

## Architecture

```
src/api/client.ts       ← fetch wrapper, ApiError, auth header
src/api/*.ts            ← typed functions per entity
src/hooks/              ← TanStack Query wrappers
src/pages/              ← route-level components (thin)
src/components/         ← shared UI (shadcn/ui)
src/lib/                ← pure utilities
```

**Layer rule:** pages → hooks → `api/*.ts` → `api/client.ts`. Do NOT cross layers.

---

## Security (critical)

- Never commit secrets, API keys, tokens, or `.env.local` values
- `VITE_API_BEARER_TOKEN` must live in env only — never hardcoded
- All API calls must go through `api/client.ts` (which adds the auth header)
- Do not suggest CORS wildcard (`*`) or `0.0.0.0` without noting the security implication

---

## TypeScript

- `strict: true` is enforced — no `any`, no `@ts-ignore` without explicit justification
- API types must come from `src/api/types.ts` (derived from OpenAPI schema) — do not redefine inline
- Zod schemas must align with the generated OpenAPI types

---

## React patterns

- Server state: `useQuery` / `useMutation` from TanStack Query. No manual `useState + fetch` for remote data.
- Query keys must include all variables the query depends on: `['domains', offset, search]`
- Always call `queryClient.invalidateQueries` after successful mutation
- Forms: React Hook Form + `zodResolver`. No manual `onChange` state for form fields.
- Tables: TanStack Table `useReactTable` — do not rebuild table logic manually

---

## Error handling

- `ApiError` (from `api/client.ts`) carries `status` and `message` — use both in error display
- Show user-facing error messages for `isError` states — never silent failure
- Destructive actions (delete, overwrite) must show a confirmation step

---

## Component style

- Keep pages thin: data fetching in hooks, rendering in JSX
- Extract `InlineEditForm`, confirmation dialogs, and table row actions into named components
- Use `cn()` from `src/lib/utils.ts` for conditional class merging (not template literals)
- No inline styles — use Tailwind utility classes

---

## PR expectations

- `make type-check` and `make lint` pass before PR
- `make build` produces `dist/` with no warnings
- Docs updated if behavior or env vars changed
- Unreleased entry in `CHANGELOG.md` for user-visible changes
- No secrets or real `.env` values committed

---

## PR ↔ Issue linking

Use `Fixes #nn`, `Closes #nn`, or `Refs #nn` in the PR body Ticket section. Optional `Tnn` plan file reference.

---

## Code Review Mode

When reviewing a PR diff:

1. Review **every changed file** — do not skip "low-risk" files
2. For each issue: file path, what's wrong, concrete fix
3. Verify layer boundaries are not crossed
4. Check that secrets are never present
5. Verify query keys include all dependencies
6. Confirm mutations invalidate relevant queries
7. Check `CHANGELOG.md` has an Unreleased entry if user-facing
8. List any unresolved review comments with their status

---

## Git policy for AI assistants

### Branch naming

Format: `author/prefix/short-kebab-description` (lowercase). See `docs/branching.md`.

**The `author` segment is always `danyal`** — never an AI tool name such as `copilot`, `claude`, or `cursor`.

Examples:
```
danyal/feat/t6-routing-layout
danyal/fix/sidebar-active-state
danyal/chore/bump-deps
```

### Full workflow

1. Ensure a `[T##]` GitHub issue exists — create one with `gh issue create --milestone 26Q2` if missing
2. `git checkout main && git pull && git checkout -b danyal/feat/t##-description`
3. Commit after each logical step; reference the issue in the message (`Refs #nn`)
4. `make type-check && make lint && make test-run && make build` — all must pass
5. `git push -u origin danyal/feat/t##-description`
6. `gh pr create --title "[T##] ..." --base main` — body must include `Closes #nn` or `Refs #nn`

### Guard rails

- Do NOT run `git commit`, `git push`, or `gh pr create` unless explicitly asked
- Provide proposed commit message and PR body as text for the user to review first
