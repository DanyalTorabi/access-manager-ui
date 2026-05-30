# T13 — Grant Management

**Phase:** Phase 6 — Authorization features

## Ticket

**T13** — Grant management (GitHub [#8](https://github.com/DanyalTorabi/access-manager-ui/issues/8))

## Problem / motivation

The backend supports granting and revoking permissions to users and groups, and adding/removing users from groups. None of these operations are exposed in the UI. Without grant management, the access-control lifecycle is incomplete: permissions can be defined but never assigned to anyone.

## Goal

Provide UI to manage group memberships for users and permission grants for users and groups.

## API Constraint

> **Important:** The backend does **not** expose list endpoints for a user's current group memberships (`GET /users/:uid/groups`) or a user/group's directly-granted permissions (`GET /users/:uid/permissions`, `GET /groups/:gid/permissions`). The panels therefore provide stateless grant/revoke selectors; the `authz/resources` effective-access table is the only readable source of current state.

## Deliverables

### API layer
- `src/api/grants.ts` — 8 typed functions using `api/client.ts`:
  - `grantsApi.addUserToGroup(domainId, userId, groupId)` → `POST /domains/:id/users/:uid/groups/:gid` (204)
  - `grantsApi.removeUserFromGroup(domainId, userId, groupId)` → `DELETE` (204)
  - `grantsApi.grantPermissionToUser(domainId, userId, permId)` → `POST /domains/:id/users/:uid/permissions/:pid` (204)
  - `grantsApi.revokePermissionFromUser(domainId, userId, permId)` → `DELETE` (204)
  - `grantsApi.grantPermissionToGroup(domainId, groupId, permId)` → `POST /domains/:id/groups/:gid/permissions/:pid` (204)
  - `grantsApi.revokePermissionFromGroup(domainId, groupId, permId)` → `DELETE` (204)
  - `grantsApi.getUserAuthzResources(domainId, userId)` → `GET /domains/:id/users/:uid/authz/resources` → `{ data: UserAuthzResource[] }`
  - `grantsApi.getGroupAuthzResources(domainId, groupId)` → `GET /domains/:id/groups/:gid/authz/resources` → `{ data: GroupAuthzResource[] }`
- Add to `src/api/types.ts`: `UserAuthzResource`, `GroupAuthzResource` (re-exported from `schema.ts`)

### Hooks
- `src/hooks/useGrants.ts` — 6 `useMutation` hooks (one per grant/revoke operation) + 2 `useQuery` hooks for authz resources
  - User mutations invalidate `['users', domainId]` + `['userAuthzResources', domainId]`
  - Group mutations invalidate `['groups', domainId]` + `['groupAuthzResources', domainId]`

### UsersPage — "Manage Access" panel
- A new `KeyRound` icon button per user row opens a Sheet
- **Group Membership section**: native `<select>` of all domain groups + "Add to Group" button; separate select + "Remove from Group" button
- **Permission Grants section**: native `<select>` of all domain permissions + "Grant" button; separate select + "Revoke" button
- **Effective Access section**: table of resources × access type names decoded from `effective_mask` using `BigInt(mask) & BigInt(accessType.Bit) !== 0n`

### GroupsPage — "Manage Permissions" panel
- Similar icon button per group row opens a Sheet
- **Permission Grants section**: same select+button pattern for grant/revoke
- **Access Summary section**: resources × decoded mask table from `getGroupAuthzResources`

## Steps

1. Write `src/api/grants.ts` with all 8 functions; add types to `src/api/types.ts`; add MSW handlers to `src/test/handlers.ts`; write `src/api/grants.test.ts`
2. Write `src/hooks/useGrants.ts` with 6 mutation hooks + 2 query hooks; write `src/hooks/useGrants.test.ts`
3. Extend `UsersPage`: add `KeyRound` icon button per row; build `UserAccessPanel` component
4. Extend `GroupsPage`: add icon button per row; build `GroupPermissionsPanel` component

## Files / paths

- Create: `src/api/grants.ts`, `src/api/grants.test.ts`, `src/hooks/useGrants.ts`, `src/hooks/useGrants.test.ts`
- Edit: `src/api/types.ts`, `src/test/handlers.ts`, `src/pages/UsersPage.tsx`, `src/pages/GroupsPage.tsx`

## Acceptance criteria

- Grant permission to user → appears in user's permissions list immediately
- Revoke permission from user → disappears immediately
- Add user to group → group appears in user's group memberships
- Effective access table reflects current grant state
- All mutations call `invalidateQueries` correctly (no stale data)
- `make type-check && make lint && make build` pass

## Out of scope

- Permission inheritance from parent groups (backend does not implement this yet)
- Bulk grant operations

## Dependencies

T8 (UsersPage, GroupsPage), T10 (permissions exist to grant)

## Milestone

26Q2
