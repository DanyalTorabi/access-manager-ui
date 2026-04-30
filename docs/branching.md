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
| `author` | Your short identifier (e.g. `danyal`, `danto`) |
| `prefix` | `feature/`, `fix/`, `docs/`, `chore/` |
| `description` | Lowercase kebab-case; optionally include ticket id |

**Examples:**
```
danyal/feature/t2-project-docs
danyal/fix/domain-search-reset
danyal/docs/frontend-architecture
danyal/chore/upgrade-tanstack
```

## Workflow

1. Sync with main: `git checkout main && git pull origin main`
2. Create branch: `git checkout -b danyal/feature/t03-docker`
3. Make changes; run `make type-check && make lint && make build`
4. Push branch and open PR into `main`
5. CI must be green before merge
6. **Squash merge** is the default (keeps main history clean)
7. Delete the branch after merge

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
