# Phase 409 - Interaction Audit Consumer Copy Presentation Split

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 408`
- follow-up for consumer-only interaction-audit labels left outside `Phase 404`

## Goal

Design the smallest safe presentation/export split for interaction-audit consumer-only labels that are still hard-coded in route components.

## Scope

- Revisit the consumer-copy list in [I18n_Operator_Workspace_14_Locale_Copy_Inventory.md](../I18n/I18n_Operator_Workspace_14_Locale_Copy_Inventory.md).
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
