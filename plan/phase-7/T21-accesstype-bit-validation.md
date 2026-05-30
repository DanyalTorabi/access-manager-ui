# T21 — Add client-side numeric validation for AccessType bit field

**Phase:** Phase 7 — Polish & hardening

## Ticket

**T21** — AccessType bit field validation (GitHub [#23](https://github.com/DanyalTorabi/access-manager-ui/issues/23))

## Status

**Planned.**

## Problem / motivation

`AccessTypesPage` validates the `bit` form field only for non-empty (`z.string().min(1)`). A non-numeric input like `'abc'` passes client-side validation and reaches the API, where `parseInt('abc', 10)` silently returns `NaN`, violating the `AccessType.Bit: number` runtime contract.

## Goal

Add a Zod regex refinement to the `AccessTypesPage` form schema so only non-negative integers are accepted. No change to the API layer or OpenAPI types — `bit` remains `string` in the request body per the server contract.

## Deliverables

- `src/pages/AccessTypesPage.tsx` — update Zod schema:
  ```ts
  bit: z.string().regex(/^\d+$/, 'Bit must be a non-negative integer')
  ```

## Steps

1. Update the Zod schema in `AccessTypesPage`
2. Verify the validation error message renders in the form
3. Verify `make type-check && make lint` pass

## Acceptance criteria

- Submitting a non-numeric bit value shows a validation error; form does not submit
- `make type-check && make lint` pass

## Out of scope

- Hex input support (e.g., `0x4`) — the server accepts hex strings but adding hex validation to the Zod schema is a separate concern

## Dependencies

T9 (AccessTypesPage form in place)

## Milestone

26Q2
