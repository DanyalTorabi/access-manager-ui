# T10 — Permission Management

**Phase:** Phase 5 — Permission management

## Ticket

**T10** — Permission management (GitHub [#5](https://github.com/DanyalTorabi/access-manager-ui/issues/5))

## Status

**Implemented.** This file is a retroactive spec documenting what was built.

## Problem / motivation

Permissions tie a resource to an access mask (bitwise OR of access type bits). They are the unit that can be granted to users and groups. Without permissions, the authorization model has no grantable objects.

## Goal

Full CRUD for permissions within a domain. The form accepts a resource (dropdown) and an access mask (raw text). The table resolves resource names from IDs.

## Deliverables

- `src/api/permissions.ts` — `permissionsApi.list`, `get`, `create`, `update`, `delete`; `create` takes `title`, `resourceId`, `accessMask`
- `src/hooks/usePermissions.ts` — `usePermissionsQuery`, create/update/delete mutations
- `src/pages/PermissionsPage.tsx` — full CRUD page; resource dropdown populated from `useResourcesQuery`; resource name resolved in table cell; access mask displayed as `N (0xN)`; form uses `z.string().min(1)` for `accessMask` (raw text input, e.g. `"7"` or `"0x07"`)

## Steps

1. Build `api/permissions.ts`
2. Build `usePermissions.ts` hooks
3. Build `PermissionsPage` with resource dropdown and mask input

## Files / paths

- Created: `src/api/permissions.ts`, `src/hooks/usePermissions.ts`, `src/pages/PermissionsPage.tsx`

## Acceptance criteria

- Permissions list, create, edit, delete within a domain
- Resource dropdown in form populated from domain's resources
- Access mask column displays `N (0xN)`
- `make type-check && make lint` pass

## Out of scope

- Grant/revoke permissions to users or groups (T13)
- Bit-flag checkbox picker (deferred)

## Dependencies

T9 (resources and access types must exist to populate dropdowns)

## Milestone

26Q2
