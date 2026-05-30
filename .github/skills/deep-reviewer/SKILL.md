---
name: deep-reviewer
description: 'Deep PR code reviewer for access-manager-ui. Fetches a GitHub PR, reviews every changed file for logic/structure/principle problems, and writes numbered issues to a comments file. Use when: reviewing PR, deep review, PR review, code review PR, review pull request, LCM issues, review #N.'
argument-hint: 'PR number to review (e.g. 21)'
---

# Deep Reviewer

Performs a thorough, critical review of a GitHub pull request. Focuses exclusively on **problems** — logic errors, structural violations, missed edge cases, principle violations — not praise. Writes findings to a `comments-PR#[PRN].md` file in the repo root.

## When to Use

- "Review PR #N"
- "Deep review pull request N"
- "Give me a deep review of PR N"
- "Find problems in PR N"

---

## Procedure

### Step 1 — Get the PR Number

If the user has not supplied a PR number (PRN), ask:

> "Which PR number should I review?"

Assign it to `PRN`. The target URL is:
```
https://github.com/DanyalTorabi/access-manager-ui/pull/[PRN]
```

---

### Step 2 — Gather Context (run in parallel where possible)

**2a. Fetch PR metadata and diff**
Use `fetch_webpage` to load:
- The PR page: `https://github.com/DanyalTorabi/access-manager-ui/pull/[PRN]`
- The unified diff: `https://github.com/DanyalTorabi/access-manager-ui/pull/[PRN].diff`
- The PR files tab: `https://github.com/DanyalTorabi/access-manager-ui/pull/[PRN]/files`

Extract:
- PR title, description, linked issue numbers
- List of all changed files and their diffs

**2b. Pull the branch into the sandbox**
Run in terminal:
```bash
git fetch origin && git checkout <PR-branch> 2>/dev/null || git fetch origin <PR-branch>:<PR-branch> && git checkout <PR-branch>
```
If the branch name is unknown, derive it from the PR page. After checkout, the workspace files reflect the PR state and can be read directly with file tools.

**2c. Read ticket context**
Find the T-number from the PR title or linked issue. Read:
- `plan/` — find the matching `T##-*.md` file using `file_search`
- `CHANGELOG.md` — Unreleased section
- `AGENTS.md` and `.github/copilot-instructions.md` — project rules

---

### Step 3 — Read Every Changed File

For each file in the diff:
- Read the full file from the checked-out branch using `read_file`
- Cross-reference with the diff to understand what changed vs what already existed
- Do NOT skip files labelled "low-risk" or "small"

Files to pay extra attention to per project rules:
- `src/api/client.ts` — auth header, error handling
- `src/api/*.ts` — typed API functions, layer boundary
- `src/hooks/*.ts` — query keys, invalidation after mutations
- `src/pages/*.tsx` — must stay thin; no direct api/client.ts imports
- `src/components/*.tsx` — no inline styles, use `cn()`, confirm dialogs for destructive actions
- `src/lib/` — must be pure utilities, no React/API calls

---

### Step 4 — Identify Issues

Review for (non-exhaustive):

**Architecture / Layer Boundaries**
- Page importing `api/client.ts` directly instead of going through `api/*.ts`
- Business logic in JSX instead of hooks or helpers
- `src/lib/` files importing React or making API calls
- `api/client.ts` importing from React

**TypeScript**
- `any` types or `@ts-ignore` without justification
- Inline type definitions that should come from `src/api/types.ts`
- Zod schemas misaligned with OpenAPI types

**React / TanStack Query**
- Manual `useState + fetch` for remote data instead of `useQuery`
- Query keys missing variables the query depends on
- Mutations that do not call `queryClient.invalidateQueries` after success
- Forms using manual `onChange` state instead of React Hook Form + `zodResolver`

**Security (OWASP / project rules)**
- Hardcoded secrets, tokens, or bearer values
- CORS wildcard without security note
- `0.0.0.0` binding without security note
- User input reaching API without validation

**Error Handling**
- Silent failure on `isError` — no user-visible message
- Destructive actions (delete, overwrite) without a confirmation step
- `ApiError` status/message not surfaced in UI

**Code Quality**
- Dead code or unused exports introduced by the PR
- Speculative abstractions added for future use
- Inline styles instead of Tailwind utilities
- Template-literal class merging instead of `cn()`
- Missing `CHANGELOG.md` Unreleased entry for user-visible changes

**Scope Creep**
- Changes that go beyond what the linked ticket (`T##`) specifies
- Refactors or "improvements" not requested

---

### Step 5 — Write the Review File

Write all findings to `comments-PR#[PRN].md` in the repo root.

**Format:**

```markdown
# PR #[PRN] Deep Review

> PR: https://github.com/DanyalTorabi/access-manager-ui/pull/[PRN]
> Ticket scope: [T## title from plan file]
> Branch: [branch name]
> Reviewed: [today's date]

---

## Issues

### LCM-[PRN]-1 — [Short title]

**File:** [path/to/file.ts](path/to/file.ts#L##)
**Severity:** [Critical | High | Medium | Low]
**Category:** [Layer Boundary | TypeScript | Security | React/Query | Error Handling | Code Quality | Scope]

[1–3 sentence description of the problem and why it matters.]

**Suggested fix:** [Concrete code snippet or description of the fix.]

---

### LCM-[PRN]-2 — [Short title]
...
```

Rules for the output file:
- Number issues sequentially: `LCM-[PRN]-1` through `LCM-[PRN]-N`. Do **not** cap at 10.
- Include **only problems** — no praise, no "this looks good" comments.
- Every issue must reference the exact file (with line link if possible).
- If the file already exists (`comments-PR#[PRN].md`), overwrite it completely.
- After writing, print a summary line: `Found N issues (LCM-[PRN]-1 … LCM-[PRN]-N).`

---

### Step 6 — Return to main branch

After the review is complete:
```bash
git checkout -
```

---

## Scope Boundaries

- Review only changes introduced by the PR (not pre-existing issues unless the PR worsens them).
- Measure changes against the ticket's plan file (`plan/phase-*/T##-*.md`) — flag anything outside scope.
- Do not suggest new features, architecture overhauls, or changes unrelated to the PR.

---

## Reference Files

- [AGENTS.md](../../AGENTS.md) — layer rules, security, commit policy
- [.github/copilot-instructions.md](../copilot-instructions.md) — TypeScript, React, error-handling rules
- [CHANGELOG.md](../../CHANGELOG.md) — expected Unreleased entries
- [plan/](../../plan/) — ticket specs (T-numbers)
