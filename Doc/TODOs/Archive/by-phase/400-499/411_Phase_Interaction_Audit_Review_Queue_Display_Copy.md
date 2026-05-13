# Phase 411 - Interaction Audit Review Queue Display Copy

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed on `2026-05-14`
- child implementation phase created by `Phase 409`
- closeout archived after moving Review Queue display labels into 14-locale operator copy

## Goal

Move the interaction-audit Review Queue display labels into 14-locale presentation copy without changing review ordering, signoff state, exported signoff JSON, generated handoff drafts, route ids, or automation hooks.

## Scope

- Use [I18n_Interaction_Audit_Presentation_Export_Split.md](../../../../I18n/I18n_Interaction_Audit_Presentation_Export_Split.md) as the boundary reference.
- Add a focused `interactionAudit.reviewQueue` copy bucket under `buildOperatorWorkspaceLocalizedCopy`.
- Keep `src/sidepanel/interaction-audit-review-queue.ts` responsible for queue status enums, counts, ordering, and next-target selection.
- Move only Review Queue section labels, summary labels, queue metadata prefixes, all-ready labels, and jump-action labels into localized display copy.
- Add or update focused tests for queue behavior and localized display copy.

## Preserved Boundaries

- Do not translate signoff exports, handoff drafts, operator notes, request ids, archive ids, route hashes, action ids, preset ids, data attributes, or downloaded filenames.
- Do not change queue status enum values: `follow_up`, `not_reviewed`, `pending_checks`, `ready`.
- Do not change surface ids, surface titles, manual-check text, or surface definition strings in this phase.
- Do not change interaction-audit workflow behavior.

## Acceptance

- Review Queue visible labels have explicit coverage for all 14 runtime locales.
- Queue ordering, next target, summary counts, and status enum values remain unchanged.
- Existing signoff export JSON and generated handoff draft behavior remain unchanged.

## Planned Verification

- `npm run i18n:check`
- focused tests for `src/sidepanel/interaction-audit-review-queue.ts`
- focused operator-workspace localized-copy tests
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Later phases may localize Surface Card, Workspace Controls, Request-Scope command headings, and Handoff Summary presentation labels, but only after preserving their export/raw-evidence boundaries with focused tests.

## Completion Summary

`Phase 411` moved the Review Queue presentation labels into `buildOperatorWorkspaceLocalizedCopy(i18n).interactionAudit.reviewQueue` with explicit copy for all 14 runtime locales.

Delivered:

- added Review Queue display copy for section labels, details, next-target actions, all-ready states, summary labels, item metadata, pending-check labels, queue status labels, and signoff status labels
- updated `InteractionAuditReviewQueueSection` to render labels from localized copy
- updated `buildInteractionAuditReviewQueue` so queue behavior keeps returning status enums, signoff status, counts, ordering, and next-target identity instead of English display labels
- preserved surface ids, surface titles, manual-check text, signoff export JSON, generated handoff drafts, route ids, action ids, preset ids, data attributes, and downloaded filenames
- queued [412_Phase_Interaction_Audit_Surface_Card_Display_Copy.md](../../../412_Phase_Interaction_Audit_Surface_Card_Display_Copy.md) as the next narrow interaction-audit display-copy slice

## Verification

- `npm run test -- src/shared/operator-workspace-localized-copy.test.ts src/sidepanel/interaction-audit-review-queue.test.ts src/sidepanel/interaction-audit-signoff.test.ts`
- `npm run typecheck`
- `npm run i18n:check`
- `npm run docs:check`
- `git diff --check`
