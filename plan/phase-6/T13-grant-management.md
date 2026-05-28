# T13 — Grant Management

**Phase:** Phase 6 — Authorization features

## Ticket

**T13** — Grant management (GitHub [#8](https://github.com/DanyalTorabi/access-manager-ui/issues/8))

## Problem / motivation

The backend supports granting and revoking permissions to users and groups, and adding/removing users from groups. None of these operations are exposed in the UI. Without grant management, the access-control lifecycle is incomplete: permissions can be defined but never assigned to anyone.

## Goal

Provide UI to manage group memberships for users and permission grants for users and groups.

## Deliverables

### API layer
- `src/api/grants.ts` — 6 typed functions using `api/client.ts`:
  - `grantsApi.addUserToGroup(domainId, userId, groupId)` → `POST /domains/:id/users/:uid/groups/:gid` (204)
  - `grantsApi.removeUserFromGroup(domainId, userId, groupId)` → `DELETE` (204)
  - `grantsApi.grantPermissionToUser(domainId, userId, permId)` → `POST /domains/:id/users/:uid/permissions/:pid` (204)
  - `grantsApi.revokePermissionFromUser(domainId, userId, permId)` → `DELETE` (204)
  - `grantsApi.grantPermissionToGroup(domainId, groupId, permId)` → `POST /domains/:id/groups/:gid/permissions/:pid` (204)
  - `grantsApi.revokePermissionFromGroup(domainId, groupId, permId)` → `DELETE` (204)
- Add to `src/api/types.ts`: `UserAuthzResource`, `GroupAuthzResource` (re-exported from `schema.ts`)

### Hooks
- `src/hooks/useGrants.ts` — one `useMutation` per operation; on success each invalidates the relevant query key (`['users', domainId]`, `['groups', domainId]`)

### UsersPage — "Manage Access" panel
- A new icon button per user row opens a second Sheet (or tabs inside `EntityDrawer`)
- **Group memberships tab**: list the user's current groups (query `GET /domains/:id/groups?user_id=…` or derive from groups list); combobox to add the user to a group; trash icon to remove
- **Permissions tab**: list currently granted permissions for the user; combobox to grant a permission (populated from `usePermissionsQuery`); trash icon to revoke
- **Effective access summary**: table of resources with effective access mask decoded to named access type bits (from `GET /domains/:id/users/:uid/authz/resources`)

### GroupsPage — "Manage Permissions" panel
- Similar icon button per group row opens a Sheet
- List granted permissions; combobox to grant; trash icon to revoke

## Steps

1. Write `src/api/grants.ts` with all 6 functions
2. Add missing types to `src/api/types.ts`
3. Write `src/hooks/useGrants.ts`
4. Extend `UsersPage`: add "Manage Access" button per row; build the `UserAccessPanel` component (group memberships + permissions tabs + effective access)
5. Extend `GroupsPage`: add "Manage Permissions" button per row; build `GroupPermissionsPanel`

## Files / paths

- Create: `src/api/grants.ts`, `src/hooks/useGrants.ts`
- Edit: `src/api/types.ts`, `src/pages/UsersPage.tsx`, `src/pages/GroupsPage.tsx`

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
