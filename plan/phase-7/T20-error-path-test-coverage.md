# T20 — Expand error-path test coverage for API operations and mutations

**Phase:** Phase 7 — Polish & hardening

## Ticket

**T20** — Expand error-path test coverage (GitHub [#22](https://github.com/DanyalTorabi/access-manager-ui/issues/22))

## Status

**Planned.**

## Problem / motivation

Test files across all entities only verify `ApiError` propagation on `list`. The operations `get`, `create`, `update`, and `delete` have no error-path tests. Similarly, all hook mutation tests verify only the happy path — there is no test that confirms `isError` is set and `invalidateQueries` is *not* called when a mutation fails.

## Goal

Provide at least one non-list error-path test per API file and one mutation error-path test per hook file, so that future changes to per-operation error handling or `onSuccess`/`onError` wiring are caught by the test suite.

## Deliverables

For each of the five entity modules (domains, users, groups, resources, access-types):

- `src/api/*.test.ts` — add one test: e.g., `create propagates ApiError on 400`
- `src/hooks/use*.test.ts` — add one mutation error-path test: override MSW handler → return 5xx → assert `isError` true, assert `invalidateQueries` not called (via `vi.spyOn`)

## Steps

1. Add non-list error tests to all five `src/api/*.test.ts` files
2. Add mutation error tests to all five `src/hooks/use*.test.ts` files
3. Verify `make test-run` passes

## Acceptance criteria

- Each API test file has at least one error-path test beyond `list`
- Each hook test file has at least one mutation error-path test with `invalidateQueries` not-called assertion
- `make test-run` passes

## Out of scope

- Error UI (toasts, banners) — covered by T15

## Dependencies

T9 (test infrastructure and MSW handlers in place)

## Milestone

26Q2
