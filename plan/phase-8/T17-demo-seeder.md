# T17 — Demo Scenario Seeder

**Phase:** Phase 8 — Demo playground

## Ticket

**T17** — Demo scenario seeder (GitHub [#12](https://github.com/DanyalTorabi/access-manager-ui/issues/12))

## Problem / motivation

A new viewer opening the app sees an empty domain list and has no immediate way to understand what the access-manager service models. Manually creating a representative scenario takes minutes and requires understanding the data model. This "cold start" problem makes demos ineffective and makes it hard for developers to explore the service's capabilities.

## Goal

A one-click seeder that creates a complete, realistic scenario ("Acme Corp") via the real API, so any visitor can instantly explore a fully configured access-control setup without manual data entry.

## Deliverables

- `src/api/seed.ts` — orchestration module (not a general API function; demo-only). Calls existing `domainsApi`, `usersApi`, `groupsApi`, `resourcesApi`, `accessTypesApi`, `permissionsApi`, and `grantsApi` in sequence to build the Acme Corp scenario:
  - **Domain**: `Acme Corp`
  - **Users**: Alice (admin), Bob (editor), Charlie (viewer), Dana (no access)
  - **Groups**: `admins`, `editors`, `viewers`
  - **Resources**: `Reports`, `User Management`, `Billing`
  - **Access Types**: `Read` (bit=1), `Write` (bit=2), `Delete` (bit=4), `Admin` (bit=8)
  - **Permissions**: `Reports:Read` (mask=1), `Reports:Write` (mask=3), `Reports:Full` (mask=7), `UserMgmt:Admin` (mask=8), `Billing:Read` (mask=1)
  - **Grants**: Alice → `admins` group; Bob → `editors` group; Charlie → `viewers` group; `admins` group → all permissions; `editors` group → write permissions; `viewers` group → read permissions; Dana → no groups, no permissions
  - **Idempotent**: checks if a domain named "Acme Corp" already exists before creating; if present, returns its ID without duplicating data
- `src/pages/DemoPage.tsx` — landing page at `/demo`:
  - Brief description of the scenario and what it demonstrates
  - "Load Acme Corp Scenario" button (disabled while seeding)
  - Step-by-step progress log displayed during seeding (e.g. "✓ Created domain", "✓ Created 4 users", …)
  - On completion: "Scenario ready" message with links to the domain overview and the demo app (`/demo/app`)
  - On error: shows which step failed with the `ApiError.message`
- Register `/demo` route and add "Demo" section in `Sidebar.tsx` (top-level, not domain-scoped)

## Steps

1. Write `src/api/seed.ts` with typed step functions and an async `seedAcmeCorp(onProgress)` orchestrator
2. Create `src/pages/DemoPage.tsx` with progress feedback UI
3. Register `/demo` route in `src/router.tsx`
4. Add "Demo" nav section in `Sidebar.tsx` above the domain list

## Files / paths

- Create: `src/api/seed.ts`, `src/pages/DemoPage.tsx`
- Edit: `src/router.tsx`, `src/components/Sidebar.tsx`

## Acceptance criteria

- Clicking "Load Acme Corp Scenario" creates all entities via the real API (visible in management UI)
- Progress log shows each step completing in real time
- Running the seeder a second time does not duplicate the domain or its entities
- After seeding, navigating to the domain overview shows correct counts (4 users, 3 groups, 3 resources, 4 access types, 5 permissions)
- `make type-check && make lint && make build` pass

## Out of scope

- A "reset / delete scenario" button (manual deletion via management UI)
- Multiple canned scenarios
- Seed data for any entity other than the Acme Corp scenario

## Dependencies

T13 (grants API must exist), T12 (domain overview to verify result)

## Milestone

26Q2
