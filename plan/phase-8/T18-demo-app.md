# T18 — Demo Application

**Phase:** Phase 8 — Demo playground

## Ticket

**T18** — Demo application (GitHub [#13](https://github.com/DanyalTorabi/access-manager-ui/issues/13))

## Problem / motivation

After T17 seeds the Acme Corp scenario, there is still no way to *experience* access control enforcement in action. Developers integrating the service need to see what their own application would look like: UI elements that are enabled or disabled based on live `authz/check` calls, and the raw API calls those checks produce. Without this, the service remains abstract.

## Goal

A fictional demo application embedded in the same Vite app that uses live `authz/check` calls to enable or disable action buttons, with a persistent user switcher to show how the UI changes per persona, and an authorization trace panel showing the exact API calls being made.

## Deliverables

### DemoAppPage
- `src/pages/DemoAppPage.tsx` — fictional "Acme file browser" at `/demo/app`
- Displays the three resources from the Acme Corp scenario (Reports, User Management, Billing) as "folders" in a list
- Each folder row has three action buttons: **View** (Read), **Edit** (Write), **Delete** (Delete)
- Each button calls `authzApi.check(domainId, currentUserId, resourceId, accessBit)` on render; the button is enabled if `allowed: true`, disabled (greyed out with lock icon) if `allowed: false`
- Shows a clear heading: "Logged in as: {user name}" pulled from `DemoUserSwitcher`
- Shows a note explaining that this is a demo: "Buttons are enabled/disabled by live calls to `GET /authz/check`"

### DemoUserSwitcher
- `src/components/DemoUserSwitcher.tsx` — persistent dropdown in the demo app header
- Lists the 4 Acme Corp users: Alice, Bob, Charlie, Dana
- Persists the selected user ID to `sessionStorage` under key `demo_user_id`
- On change, all authz check queries for the previous user are invalidated, triggering a re-fetch

### AuthzTracePanel
- `src/components/AuthzTracePanel.tsx` — collapsible side panel (or bottom drawer) in the demo app
- Intercepts calls via a thin context: `DemoTraceContext` provides `addTrace(entry)` which `DemoAppPage` calls after each `authz/check` response
- Displays the last 20 trace entries in reverse order:
  - Method + URL: `GET /api/v1/domains/:id/authz/check?user_id=…&resource_id=…&access_bit=…`
  - Response: `{ "allowed": true, "effective_mask": "3" }` (pretty-printed JSON)
  - Timestamp (relative: "2s ago")
  - ALLOWED (green) / DENIED (red) badge

### Route and navigation
- Register `/demo/app` route
- Add "Try the Demo App" link in `DemoPage.tsx` (T17) and in the sidebar Demo section

## Steps

1. Create `src/components/DemoUserSwitcher.tsx` with sessionStorage persistence
2. Create `src/components/AuthzTracePanel.tsx` with `DemoTraceContext`
3. Create `src/pages/DemoAppPage.tsx` — resource list with per-button authz checks; wire user switcher and trace panel
4. Register `/demo/app` route; link from `DemoPage` and sidebar

## Files / paths

- Create: `src/pages/DemoAppPage.tsx`, `src/components/DemoUserSwitcher.tsx`, `src/components/AuthzTracePanel.tsx`
- Edit: `src/router.tsx`, `src/components/Sidebar.tsx`, `src/pages/DemoPage.tsx`

## Acceptance criteria

**The "aha" flow (manual verification):**
1. Seed scenario (T17) → navigate to `/demo/app`
2. Switch user to Alice → all View/Edit/Delete buttons enabled for all three resources
3. Switch user to Charlie → only View buttons enabled; Edit and Delete are disabled with lock icon
4. Go to management UI → revoke Charlie's viewer-group membership → return to `/demo/app` as Charlie → all buttons now disabled
5. Trace panel shows the `GET /authz/check` calls for each interaction with request URL and response body

**Technical:**
- Switching users invalidates all cached authz check results and triggers immediate re-fetch
- Trace panel shows at least the last 5 calls without page refresh
- No hardcoded user IDs or resource IDs — all resolved from the seeded Acme Corp data
- `make type-check && make lint && make build` pass

## Out of scope

- Intercepting non-authz API calls in the trace panel
- Exporting the trace log
- Multiple demo scenarios

## Dependencies

T14 (`authzApi.check` must exist), T17 (Acme Corp scenario must be seedable)

## Milestone

26Q2
