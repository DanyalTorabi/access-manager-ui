# T16 — First Release (v0.1.0)

**Phase:** Phase 7 — Polish and hardening

## Ticket

**T16** — First release v0.1.0 (GitHub [#11](https://github.com/DanyalTorabi/access-manager-ui/issues/11))

## Problem / motivation

All work since project inception lives in `[Unreleased]` in `CHANGELOG.md`. There is no tagged release, no versioned Docker image, and no stable reference point for the codebase. Shipping a `v0.1.0` tag marks the completion of the initial build phase and enables semantic versioning going forward.

## Goal

Cut the first versioned release: update CHANGELOG, tag the commit, and verify CI publishes the tagged Docker image to GHCR.

## Deliverables

- `CHANGELOG.md` — move the `[Unreleased]` block to `## [0.1.0] — YYYY-MM-DD`; add a new empty `[Unreleased]` section above it; add a compare link at the bottom (`[0.1.0]: https://github.com/DanyalTorabi/access-manager-ui/releases/tag/v0.1.0`)
- Git tag `v0.1.0` on the merge commit of T15's PR
- GitHub Release created from the tag with the CHANGELOG content as release notes
- CI `publish` job produces `ghcr.io/danyaltorabi/access-manager-ui:v0.1.0` and updates `:latest`
- `README.md` — add GHCR badge and note that `v0.1.0` is the current stable tag

## Steps

1. Ensure `make type-check && make lint && make build && make test` all pass on `main`
2. Edit `CHANGELOG.md`: rename `[Unreleased]` to `[0.1.0] — <today's date>`; add fresh `[Unreleased]` above; add compare link footer
3. Commit: `chore: release v0.1.0`
4. Tag: `git tag v0.1.0`
5. Push tag: `git push origin v0.1.0`
6. Create GitHub Release pointing to the tag; paste CHANGELOG section as notes
7. Verify CI publish job completes and image is visible in GHCR

## Files / paths

- Edit: `CHANGELOG.md`, `README.md`

## Acceptance criteria

- `CHANGELOG.md` has a dated `[0.1.0]` section with no `[Unreleased]` content mixed in
- `git tag` shows `v0.1.0`
- GitHub Release page shows the release with notes
- `docker pull ghcr.io/danyaltorabi/access-manager-ui:v0.1.0` succeeds
- `:latest` is also updated

## Out of scope

- Automated release tooling (semantic-release, release-please) — future improvement
- npm publish

## Dependencies

T15 (all polish and tests must pass before tagging)

## Milestone

26Q2
