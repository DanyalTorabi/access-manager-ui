# Contributing

Contributor guide for humans and AI assistants. Read `AGENTS.md` first for repo orientation.

---

## Before you start

1. Read `AGENTS.md` — layout, layer boundaries, security rules, post-task checklist
2. Read `docs/branching.md` — branch naming and PR policy

---

## Local development

**Prerequisites:** Node.js 18+, npm 10+, a running access-manager backend.

```bash
# Clone and install
git clone git@github.com:DanyalTorabi/access-manager-ui.git
cd access-manager-ui
cp .env.example .env.local   # set VITE_API_BASE_URL and optionally VITE_API_BEARER_TOKEN
npm install

# Start dev server
make dev                     # http://localhost:5173
```

**Quality checks (run before every PR):**

```bash
make type-check   # zero TypeScript errors
make lint         # zero ESLint errors
make build        # dist/ produced, no warnings
```

**Regenerate API types** after backend changes:

```bash
make generate-types
```

**Docker:**

```bash
make docker-build    # build image
make docker-up       # start at http://localhost:3000
make docker-down     # stop
make docker-logs     # follow logs
```

---

## Commits

- Write concise imperative commit messages: `Add domain delete confirmation dialog`
- Reference tickets: `[T03] Add domain delete confirmation dialog`
- Non-trivial behavioral changes must include a test (when test infrastructure exists)
- AI assistants: provide the proposed commit message as text — do not run `git commit` unless explicitly asked

---

## Pull requests

**Before opening a PR:**

- [ ] `make type-check` and `make lint` pass
- [ ] `make build` succeeds
- [ ] Docs updated if behavior or env vars changed
- [ ] `CHANGELOG.md` has an Unreleased entry for user-visible changes
- [ ] No secrets or real `.env` values committed

**PR title format:** `[T##] short imperative title` when a ticket exists (e.g. `[T05] GitHub PR and issue templates`). Otherwise a clear imperative description.

**PR body:** Use the pull request template. Include `Fixes #nn` or `Refs #nn` in the Ticket section to link the GitHub issue.

**Branch:** open against `main`. See `docs/branching.md`.

**Merge:** squash merge is the default to keep main history clean.

---

## Handling deferred review comments

If a valid review comment identifies work that is out of scope for the current PR, reply with the GitHub issue number (create one if needed) and add a tracking note to the relevant `plan/phase-*/Tnn-*.md` file. Do not leave silently unresolved comments.

---

## GitHub CLI

Prefer `gh` for all GitHub operations:

```bash
gh issue create --title "[T##] ..." --milestone 26Q2
gh pr create --title "[T##] ..." --body "..."
gh issue list --milestone 26Q2
```

---

## Maintainer setup

After first push:

1. **Branch protection on main** — Settings → Branches → Protect `main`:
   - Require pull request before merging (disable direct pushes)
   - After first green CI: add required status checks by job name (`lint`, `type-check`, `build`, `docker`)

2. **GHCR packages** — Settings → Actions → General: allow all actions. The `publish` CI job will push to `ghcr.io/danyaltorabi/access-manager-ui` automatically on merges to main.
