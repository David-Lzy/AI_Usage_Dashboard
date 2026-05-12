# Phase 345 - Interaction Audit Guidance Card Component

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

Move the interaction-audit guidance checklist and surface-open links out of `InteractionAuditPage.tsx` into one focused component.

## Scope

- Add a dedicated guidance-card component under `src/sidepanel/components/`.
- Keep URL construction owned by the route through the existing `buildAuditUrl` callback.
- Preserve existing visible copy, link hrefs, target behavior, CSS classes, and `data-theme-local-surface` hook on the Settings link.

## Preserved Boundaries

- No signoff state, iframe readiness, preset actions, import/export, provider, storage, release package, or Chrome automation changes.
- No copy rewrite beyond moving existing rendering into the component.
- No changes to linked extension routes.

## Acceptance

- `InteractionAuditPage.tsx` renders the guidance checklist and route links through the new component.
- The route keeps `buildAuditUrl` as the URL construction boundary.
- Existing checklist items, links, classes, and data hooks remain unchanged.

## Planned Verification

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Completion Summary

- Added `InteractionAuditGuidanceCard` for the operator guidance checklist and extension surface links.
- Kept URL construction owned by `InteractionAuditPage.tsx` through the existing `buildAuditUrl` callback.
- Preserved existing visible copy, checklist order, link hrefs, target behavior, CSS classes, and the Settings link data hook.

## Verification

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Follow-Up

- None. Future guidance-card changes should use a behavior phase if they alter copy, route targets, link hooks, or audit workspace flow.
