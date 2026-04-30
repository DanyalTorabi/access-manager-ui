# T1 — AI Tooling and Contributor Context

**Phase:** Phase 0 — Project foundation

## Problem / motivation

New contributors (human or AI) opening this repo have no orientation: no layout map, no security rules, no post-task checklist, no IDE-specific guidance. This leads to inconsistent code style, secrets in commits, and wasted review cycles.

## Goal

Give every contributor (human, Claude, Copilot, Cursor) a consistent set of repo-specific rules: layout, security defaults, layer boundaries, how to run checks, what to do after a change.

## Deliverables

- `AGENTS.md` — primary AI guide: repo shape, `src/` layout, security, API layer boundary, post-task checklist, branching policy, git command defaults
- `.cursor/rules/access-manager-ui.mdc` — `alwaysApply` Cursor rules mirroring AGENTS.md
- `.cursor/rules/code-review.mdc` — conditional code-review checklist for Cursor
- `.github/copilot-instructions.md` — GitHub Copilot code-review standards (React/TS-specific)

## Steps

1. Write `AGENTS.md` covering: module purpose, `src/` directory map, layer boundaries (pages → hooks → api/* functions → client.ts), security rules, after-task steps, branching naming, git command policy for AI agents
2. Write `.cursor/rules/access-manager-ui.mdc` (`alwaysApply: true`) — distilled rules from AGENTS.md suitable for inline Cursor guidance
3. Write `.cursor/rules/code-review.mdc` (`alwaysApply: false`) — line-by-line review checklist
4. Write `.github/copilot-instructions.md` — code review standards: React patterns, TS strictness, API layer, security, testing

## Files / paths

- Create: `AGENTS.md`, `.cursor/rules/access-manager-ui.mdc`, `.cursor/rules/code-review.mdc`, `.github/copilot-instructions.md`

## Acceptance criteria

- Any AI tool can open `AGENTS.md` and understand the repo layout, security rules, and post-task steps in under 2 minutes
- `.cursor/rules/` is loaded automatically by Cursor on file open
- `.github/copilot-instructions.md` is loaded by Copilot during code review

## Out of scope

- README content (T2), Docker (T3), CI (T4), GitHub templates (T5)

## Dependencies

None — first in phase 0.

## Milestone

26Q2
