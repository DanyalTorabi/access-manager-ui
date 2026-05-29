# Branching Strategy

## Model

Trunk-based development. `main` is the integration branch. All work happens on short-lived topic branches merged via pull request.

Direct pushes to `main` are disabled (enforced by branch protection after first CI run).

## Branch naming

```
author/prefix/short-kebab-description
```

| Part | Rules |
|------|-------|
| `author` | Always `danyal` — including when an AI assistant creates the branch. Never use an AI tool name (`copilot`, `claude`, `cursor`, etc.). |
| `prefix` | `feat/`, `fix/`, `docs/`, `chore/` |
| `description` | Lowercase kebab-case; include ticket id when one exists |

**Examples:**
```
danyal/feat/t2-project-docs
danyal/fix/domain-search-reset
danyal/docs/frontend-architecture
danyal/chore/upgrade-tanstack
```

## Workflow

1. **Create or locate the GitHub issue** — every branch must trace back to a `[T##]` issue on the 26Q2 milestone.
   ```bash
   gh issue create --title "[T##] short imperative title" --body "..." --milestone 26Q2
   ```
2. **Sync and branch from main:**
   ```bash
   git checkout main && git pull origin main
   git checkout -b danyal/feat/t##-short-description
   ```
3. **Make changes** — commit after each logical step; each commit message should reference the ticket:
   ```
   feat(t##): implement X
   fix(t##): resolve Y
   ```
4. **Run quality gates before pushing:**
   ```bash
   make type-check && make lint && make test-run && make build
   ```
5. **Push and open PR:**
   ```bash
   git push -u origin danyal/feat/t##-short-description
   gh pr create --title "[T##] short imperative title" --base main
   ```
6. PR body must include a `Closes #nn` or `Refs #nn` ticket link.
7. CI must be green before merge.
8. **Squash merge** is the default (keeps main history clean).
9. Delete the branch after merge.

## Pull request title

Use `[T##] short imperative title` when a plan ticket exists. Otherwise a clear imperative description:

```
[T03] Add Dockerfile and docker-compose
Add missing null check in domains API client
```

## Releases

Releases are not yet in scope. When semver tagging begins, CHANGELOG.md Unreleased section moves to a versioned release header on each tag.

## Branch protection settings (maintainer)

After first green CI run, enable in Settings → Branches → `main`:
- Require pull request before merging (no direct pushes)
- Require status checks: `lint`, `type-check`, `build`, `docker`
- Require branches to be up to date before merging
