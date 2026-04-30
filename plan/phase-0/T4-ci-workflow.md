# T4 — CI/CD Workflow

**Phase:** Phase 0 — Project foundation

## Problem / motivation

There is no automated quality gate. Broken TypeScript, lint errors, or build failures can land on main without anyone noticing. There is no published container image.

## Goal

Add a GitHub Actions CI workflow that runs on every PR and push to main, enforcing type safety, linting, build success, and Docker smoke test. Publish the image to GHCR on main.

## Deliverables

- `.github/workflows/ci.yml` — four/five jobs: lint, type-check, build, docker-smoke, publish

## Job design

| Job | Trigger | Steps |
|-----|---------|-------|
| `lint` | PR + push | `npm ci`, `npm run lint` |
| `type-check` | PR + push | `npm ci`, `npx tsc -b --noEmit` |
| `build` | PR + push | `npm ci`, `npm run build` |
| `docker` | PR + push | `docker compose build`, `docker compose up -d`, health check loop (curl `/` until 200 or 30×), `docker compose down` |
| `publish` | push to main only; needs: [lint, type-check, build, docker] | Login to GHCR, build+push `ghcr.io/<owner>/access-manager-ui:latest` and `:sha-<commit>` |

## Steps

1. Write `.github/workflows/ci.yml` with all 5 jobs
2. Add `concurrency: cancel-in-progress` to avoid queue pile-up on PRs
3. Pin Node version to `18.x`; note upgrade path to 20 in comment
4. Use `GITHUB_TOKEN` for GHCR publish (packages: write)

## Files / paths

- Create: `.github/workflows/ci.yml`

## Acceptance criteria

- Workflow appears in GitHub Actions on first push
- All 4 jobs pass on a clean main branch
- Image `ghcr.io/danyaltorabi/access-manager-ui:latest` is pushed after first merge to main
- PR checks are visible and blockable via branch protection settings (instruction in CONTRIBUTING.md)

## Out of scope

- E2E tests against live backend (future phase when test fixtures exist)
- Code coverage reporting

## Dependencies

T3 (docker-compose.yml needed for docker job)

## Milestone

26Q2
