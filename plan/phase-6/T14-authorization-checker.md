# T14 — Authorization Checker

**Phase:** Phase 6 — Authorization features

## Ticket

**T14** — Authorization checker (GitHub [#9](https://github.com/DanyalTorabi/access-manager-ui/issues/9))

## Problem / motivation

The central value proposition of the access-manager service is the authorization check: given a user, a resource, and an access type, does the user have access? This question cannot currently be answered from the UI. Developers integrating the service have no interactive way to verify their permission configuration is correct.

## Goal

An interactive authorization checker page that demonstrates the core product value: configure access → verify it works → see the exact API call the developer's backend would make.

## Deliverables

### API layer
- `src/api/authz.ts`:
  - `authzApi.check(domainId, userId, resourceId, accessBit)` → `GET /api/v1/domains/:id/authz/check?user_id=…&resource_id=…&access_bit=…` → `AuthzCheckResponse`
  - `authzApi.getMasks(domainId, userId, resourceId)` → `GET /api/v1/domains/:id/authz/masks?user_id=…&resource_id=…` → `AuthzMasksResponse`
- Add to `src/api/types.ts`: `AuthzCheckResponse { allowed: boolean; effective_mask: string }`, `AuthzMasksResponse { masks: number[] }`

### Hooks
- `src/hooks/useAuthz.ts`:
  - `useAuthzCheck(domainId, params)` — `useQuery` with `enabled: !!(domainId && params.userId && params.resourceId && params.accessBit !== undefined)`; `queryKey: ['authz-check', domainId, userId, resourceId, accessBit]`
  - `useAuthzMasks(domainId, params)` — similar pattern; used to decode the full effective access for a user+resource pair

### AuthzCheckerPage
- `src/pages/AuthzCheckerPage.tsx` — React Hook Form with Zod: `userId` (required string), `resourceId` (required string), `accessBit` (required number)
- **User selector**: searchable combobox backed by `useUsersQuery`; shows user title
- **Resource selector**: searchable combobox backed by `useResourcesQuery`; shows resource title
- **Access Type selector**: dropdown populated from `useAccessTypesQuery`; displays `{title} (bit: N)`; submits the integer `bit` value
- **Submit**: runs `useAuthzCheck` + `useAuthzMasks`
- **Result card**:
  - Prominent **ALLOWED** (green) / **DENIED** (red) badge
  - "Effective access" section: list of access type names whose bits are set in `effective_mask` (bitwise AND with each `AccessType.bit`)
  - "All grants" section: each mask from `useAuthzMasks` decoded to named access types — shows the user's direct grants and inherited group grants
- Register route `/domains/:id/authz-check`
- Add "Check Access" link in `Sidebar.tsx` domain sub-nav (with a lock icon)

## Steps

1. Write `src/api/authz.ts`
2. Add missing types to `src/api/types.ts`
3. Write `src/hooks/useAuthz.ts`
4. Create `src/pages/AuthzCheckerPage.tsx` with the form, comboboxes, and result card
5. Register route and sidebar link

## Files / paths

- Create: `src/api/authz.ts`, `src/hooks/useAuthz.ts`, `src/pages/AuthzCheckerPage.tsx`
- Edit: `src/api/types.ts`, `src/router.tsx`, `src/components/Sidebar.tsx`

## Acceptance criteria

- Selecting user + resource + access type and submitting shows accurate ALLOWED/DENIED
- ALLOWED/DENIED is consistent with grant state managed in T13 (grant → ALLOWED; revoke → DENIED)
- Effective mask decoded to named access type labels (not raw numbers)
- All-grants section shows each mask source decoded
- Comboboxes search live against the backend (server-side search from T11)
- `make type-check && make lint && make build` pass

## Out of scope

- Batch authorization checks
- Resource hierarchy traversal (backend does not yet support)

## Dependencies

T11 (server-side search for comboboxes), T13 (grants must be manageable to verify results)

## Milestone

26Q2
