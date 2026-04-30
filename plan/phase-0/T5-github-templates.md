# T5 — GitHub Templates

**Phase:** Phase 0 — Project foundation

## Problem / motivation

PRs and issues are opened without structure: missing ticket references, missing checklists, inconsistent reproduction steps. This creates review friction and loses traceability between issues and plan files.

## Goal

Add PR template and issue templates that match the discipline in `AGENTS.md` and `CONTRIBUTING.md`.

## Deliverables

- `.github/pull_request_template.md` — Summary, Ticket, Checklist
- `.github/ISSUE_TEMPLATE/config.yml` — allow blank issues
- `.github/ISSUE_TEMPLATE/bug_report.md` — structured bug report
- `.github/ISSUE_TEMPLATE/task.md` — plan-linked task ticket with `[T##]` title format

## PR template checklist items

- `make type-check` and `make lint` pass
- `make build` succeeds
- Docs updated if behavior or setup changed
- No secrets or real `.env` values committed
- Ticket reference included (`Fixes #nn` or `Refs #nn`)

## Issue template — task format

- Title: `[T##] short imperative title` (use next free T-number; check `plan/phase-*/`)
- Sections: Problem/motivation, Proposed work, Plan file link (`plan/phase-N/T##-*.md`), Acceptance criteria, Discovered in / related

## Steps

1. Write `.github/ISSUE_TEMPLATE/config.yml`
2. Write `.github/ISSUE_TEMPLATE/bug_report.md`
3. Write `.github/ISSUE_TEMPLATE/task.md`
4. Write `.github/pull_request_template.md`

## Files / paths

- Create: `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/task.md`

## Acceptance criteria

- Opening a new PR shows the template automatically
- Opening a new issue offers Bug report and Task options
- Templates reference `make type-check lint` (not raw `npx tsc` or `eslint` commands)

## Out of scope

- CODEOWNERS file
- Label automation

## Dependencies

T2 (Makefile must exist so checklist references real commands)

## Milestone

26Q2
