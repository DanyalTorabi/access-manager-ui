# T10 — Permission Management

**Phase:** Phase 5 — Permission management

## Ticket

**T10** — Permission management (GitHub [#5](https://github.com/DanyalTorabi/access-manager-ui/issues/5))

## Status

**Complete.** Implementation was retroactively documented; test coverage added in this ticket.

## Problem / motivation

Permissions tie a resource to an access mask (bitwise OR of access type bits). They are the unit that can be granted to users and groups. Without permissions, the authorization model has no grantable objects.

## Goal

Full CRUD for permissions within a domain. The form accepts a resource (dropdown) and an access mask (raw text). The table resolves resource names from IDs.

## Deliverables

- `src/api/permissions.ts` — `permissionsApi.list`, `get`, `create`, `update`, `delete`; `create` takes `title`, `resourceId`, `accessMask`
- `src/hooks/usePermissions.ts` — `usePermissionsQuery`, create/update/delete mutations; query key includes `limit` (consistent with resources/access-types)
- `src/pages/PermissionsPage.tsx` — full CRUD page; resource dropdown populated from `useResourcesQuery`; resource name resolved in table cell; access mask displayed as `N (0xN)`; form uses `z.string().min(1)` for `accessMask` (raw text input, e.g. `"7"` or `"0x07"`)
- `src/api/permissions.test.ts` — full CRUD coverage: list, get, create (body spy for title/resource_id/access_mask), update, delete, ApiError propagation, query-param forwarding
- `src/hooks/usePermissions.test.ts` — query success/error, param forwarding, separate cache-entry assertion, all mutations with `invalidateQueries` spy
- `src/test/handlers.ts` — MSW GET single-permission handler added

## Steps

1. Fix missing `limit` in `usePermissionsQuery` query key (consistency with resources/access-types)
2. Add MSW GET single-permission handler to `src/test/handlers.ts`
3. Build `src/api/permissions.test.ts`
4. Build `src/hooks/usePermissions.test.ts`
5. Update CHANGELOG

## Files / paths

- Pre-existing: `src/api/permissions.ts`, `src/hooks/usePermissions.ts`, `src/pages/PermissionsPage.tsx`
- Modified: `src/hooks/usePermissions.ts` (query key fix), `src/test/handlers.ts` (GET single-permission handler)
- Created: `src/api/permissions.test.ts`, `src/hooks/usePermissions.test.ts`

## Acceptance criteria

- Permissions list, create, edit, delete within a domain
- Resource dropdown in form populated from domain's resources
- Access mask column displays `N (0xN)`
- `usePermissionsQuery` query key includes `limit` (consistent with resources and access-types)
- `src/api/permissions.test.ts` and `src/hooks/usePermissions.test.ts` pass
- `make type-check && make lint` pass

## Out of scope

- Grant/revoke permissions to users or groups (T13)
- Bit-flag checkbox picker (deferred)

## Dependencies

T9 (resources and access types must exist to populate dropdowns)

## Milestone

26Q2
