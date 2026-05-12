# Phase 336 - Interaction Audit Request Scope Component

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Move the interaction-audit request-scope rendering and next-command display out of `InteractionAuditPage.tsx` into one focused component.

## Scope

- Add a dedicated request-scope component under `src/sidepanel/components/`.
- Keep signoff request-context state, persistence, import/export, and review-session metadata owned by the route.
- Preserve existing request binding/revision formatting, command strings, CSS classes, and `data-audit-request-scope*` attributes.
- Update closeout docs so the maintenance boundary is explicit.

## Preserved Boundaries

- No signoff schema, archive, request lifecycle, storage, or export format changes.
- No provider, popup, Settings, release package, or Chrome automation changes.
- No copy rewrite beyond moving existing labels into the component.

## Acceptance

- `InteractionAuditPage.tsx` renders request scope through the new component.
- Bound-request and ad-hoc command displays keep the same visible text and test hooks.
- The route remains responsible for request-context state and only passes current state into the component.

## Planned Verification

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `InteractionAuditRequestScopeSection` for the existing request-scope summary and next-command display.
- Kept request-context state, persistence, review-session summary, imports, exports, and route-owned signoff behavior in `InteractionAuditPage.tsx`.
- Preserved existing request-scope CSS classes, command strings, and `data-audit-request-scope*` hooks.

## Verification

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Further interaction-audit route splitting should remain maintenance-driven and avoid signoff schema, export, request lifecycle, or provider-surface changes.
