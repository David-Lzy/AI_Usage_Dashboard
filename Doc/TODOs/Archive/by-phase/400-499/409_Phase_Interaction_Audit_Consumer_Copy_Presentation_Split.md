# Phase 409 - Interaction Audit Consumer Copy Presentation Split

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed on `2026-05-14`
- follow-up for consumer-only interaction-audit labels left outside `Phase 404`
- closeout archived after creating [I18n_Interaction_Audit_Presentation_Export_Split.md](../../../../I18n/I18n_Interaction_Audit_Presentation_Export_Split.md)

## Goal

Design the smallest safe presentation/export split for interaction-audit consumer-only labels that are still hard-coded in route components.

## Scope

- Revisit the consumer-copy list in [I18n_Operator_Workspace_14_Locale_Copy_Inventory.md](../../../../I18n/I18n_Operator_Workspace_14_Locale_Copy_Inventory.md).
- Identify labels that can move into localized display copy without changing persisted signoff exports, handoff drafts, route ids, preset ids, or automation selectors.
- Either implement a narrow first split or create child TODOs if the migration is too broad.

## Preserved Boundaries

- Do not translate exported evidence text, generated handoff body text, request ids, archive ids, route hashes, action ids, preset ids, or manual-check evidence strings.
- Do not change interaction-audit workflow behavior.
- Do not change signoff JSON schema or downloaded filenames.

## Acceptance

- The repo has a concrete list of consumer-only labels that are safe to localize and labels that remain raw/export-bound.
- If code changes land, focused tests prove export payloads and unknown evidence values remain unchanged.

## Planned Verification

- focused interaction-audit tests for any touched code
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Implement child phases for any remaining interaction-audit UI labels that require larger component or export splits.

## Completion Summary

`Phase 409` completed as a documentation and planning split rather than a runtime implementation. The remaining interaction-audit labels are visible operator UI, but the broad component set touches signoff exports, generated handoff drafts, frame diagnostics, automation hooks, and surface-definition evidence. A single code change would be too easy to overreach.

Delivered:

- added [I18n_Interaction_Audit_Presentation_Export_Split.md](../../../../I18n/I18n_Interaction_Audit_Presentation_Export_Split.md)
- identified safe presentation-only labels for Review Queue, Surface Card chrome, Workspace Controls, Request-Scope command headings, and Handoff Summary presentation
- identified mixed labels that require typed display/raw separation before localization
- kept signoff exports, handoff drafts, request ids, route ids, preset ids, data attributes, filenames, command text, and manual-check evidence text outside translation scope
- queued [411_Phase_Interaction_Audit_Review_Queue_Display_Copy.md](../../../411_Phase_Interaction_Audit_Review_Queue_Display_Copy.md) as the first narrow runtime slice after `Phase 410`

## Verification

- documentation-only phase; no runtime code changed
- `npm run docs:check`
- `git diff --check`
