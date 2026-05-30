# T8 — User and Group Management

**Phase:** Phase 3 — User and group management

## Ticket

**T8** — User and group management (GitHub [#3](https://github.com/DanyalTorabi/access-manager-ui/issues/3))

## Status

**Complete.** Implementation and full test coverage in place.

## Problem / motivation

After domains were manageable, the next critical entities were users and groups. Groups support an optional parent-group relationship (tree structure), which required a dropdown resolved from existing groups within the same domain.

## Goal

Full CRUD for users and groups within a domain, including the parent-group relationship for groups, with test coverage matching the T7 pattern (API layer + hooks layer).

## Deliverables

- `src/api/users.ts` — `usersApi.list`, `get`, `create`, `update`, `delete`
- `src/api/groups.ts` — `groupsApi.list`, `get`, `create`, `update`, `delete`; `create`/`update` support `parentGroupId?: string | null`
- `src/hooks/useUsers.ts` — `useUsersQuery`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`
- `src/hooks/useGroups.ts` — `useGroupsQuery`, `useCreateGroup`, `useUpdateGroup`, `useDeleteGroup`
- `src/pages/UsersPage.tsx` — full CRUD page using `EntityTable`, `EntityDrawer`, `ConfirmDeleteDialog`
- `src/pages/GroupsPage.tsx` — full CRUD page; form includes parent-group `<select>` populated from `useGroupsQuery`; table column resolves parent group name via map lookup
- `src/api/users.test.ts` — list, create, update, delete, error propagation
- `src/api/groups.test.ts` — list (with/without parent), create (with/without parent), update, delete, error propagation
- `src/hooks/useUsers.test.ts` — `useUsersQuery` success/error, `useCreateUser`, `useDeleteUser`
- `src/hooks/useGroups.test.ts` — `useGroupsQuery` success/error, `useCreateGroup` (with parent), `useDeleteGroup`

## Steps

1. Build `api/users.ts` and `api/groups.ts` following the `buildQuery` + `ListParams` pattern from T7
2. Build hooks with same `invalidateQueries` pattern
3. Build `UsersPage` reusing shared components
4. Build `GroupsPage` with added parent-group dropdown; resolve parent name in table cell using a `Map<id, title>` built from the full groups list
5. Add `src/api/groups.test.ts` covering CRUD and error paths (mirrors `users.test.ts`)
6. Add `src/hooks/useUsers.test.ts` and `src/hooks/useGroups.test.ts` (mirrors `useDomains.test.ts` pattern)

## Files / paths

- Created: `src/api/users.ts`, `src/api/groups.ts`, `src/hooks/useUsers.ts`, `src/hooks/useGroups.ts`, `src/pages/UsersPage.tsx`, `src/pages/GroupsPage.tsx`
- Created tests: `src/api/users.test.ts`, `src/api/groups.test.ts`, `src/hooks/useUsers.test.ts`, `src/hooks/useGroups.test.ts`
- MSW handlers added: users, groups in `src/test/handlers.ts`

## Acceptance criteria

- Users and groups list, create, edit, delete within a domain
- Group form shows parent-group dropdown; parent name resolved in table
- `src/api/groups.test.ts` covers: list, list-with-parent, create, create-with-parent, update, delete, 401 error
- `src/hooks/useUsers.test.ts` and `src/hooks/useGroups.test.ts` cover: query success/error, create mutation, delete mutation
- `make type-check && make lint && make test-run` all pass

## Out of scope

- Grant management — assigning permissions to users/groups (T13)
- Group membership management (T13)

## Dependencies

T7 (shared components and API client pattern)

## Milestone

26Q2
