# T19 — Extract shared test base URL constant

**Phase:** Phase 7 — Polish & hardening

## Ticket

**T19** — Extract shared test base URL constant (GitHub [#18](https://github.com/DanyalTorabi/access-manager-ui/issues/18))

## Status

**Open.**

## Problem / motivation

`http://127.0.0.1:8080` appears in two independent places with no shared source of truth:

```ts
// src/api/client.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8080'

// src/test/handlers.ts
const BASE = 'http://127.0.0.1:8080'
```

If the local dev backend port changes (e.g. to `8081`), both must be updated in sync. There is no type system or lint rule to catch a missed edit. The `client.ts` fallback and `handlers.ts` constant serve different purposes (runtime fallback vs. test mock base), but they must stay aligned.

## Goal

Introduce a single constant that `handlers.ts` can import so there are only two definitions: the env-driven runtime value in `client.ts` and a derived test constant that references the same default.

## Deliverables

- `src/test/constants.ts` — exports `TEST_BASE_URL = 'http://127.0.0.1:8080'`
- `src/test/handlers.ts` — imports `TEST_BASE_URL` from `constants.ts` instead of the inline literal
- `client.ts` fallback stays as-is (it is the authoritative default; test constants should match it)

## Steps

1. Create `src/test/constants.ts` exporting `TEST_BASE_URL`
2. Replace the inline `const BASE = 'http://127.0.0.1:8080'` in `handlers.ts` with an import
3. Run `make type-check && make lint && make test-run` — all must pass

## Files / paths

- Created: `src/test/constants.ts`
- Edited: `src/test/handlers.ts`

## Acceptance criteria

- `http://127.0.0.1:8080` appears only twice in the codebase: once as the `VITE_API_BASE_URL` fallback in `client.ts` and once in `src/test/constants.ts`
- All 34+ existing tests pass
- `make type-check && make lint` pass

## Out of scope

- Changing the `client.ts` fallback mechanism
- Making the test constant derive from a runtime import of `client.ts`

## Dependencies

T6 (routing and layout, tests established), T7 (MSW handlers introduced)

## Milestone

26Q2
