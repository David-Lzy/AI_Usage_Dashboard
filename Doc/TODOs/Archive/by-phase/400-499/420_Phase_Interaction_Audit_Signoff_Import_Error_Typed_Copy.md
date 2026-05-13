# Phase 420 - Interaction Audit Signoff Import Error Typed Copy

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed on 2026-05-14
- archived after `Phase 420`
- second implementation slice from the remaining interaction-audit presentation-copy inventory

## Goal

Split signoff import parser failures into typed error codes and localized display copy while keeping pasted JSON and parsed payload fields raw.

## Scope

- Add stable error codes for empty import input, JSON parse failure, and unsupported workspace/export shape.
- Keep parser behavior and import state reconstruction unchanged.
- Add localized display copy under the interaction-audit workspace copy area.
- Update route feedback to use localized import-error presentation.

## Preserved Boundaries

- Do not translate pasted JSON, exported JSON field names, imported operator notes, request context values, or surface ids.
- Do not change accepted legacy workspace state imports or current signoff export imports.
- Do not change signoff export JSON, generated Markdown drafts, filenames, MIME types, localStorage keys, or request binding/revision formatting.

## Acceptance

- Import parser failures expose stable typed codes plus fallback messages.
- Route feedback renders localized import-error copy for all 14 runtime locales.
- Existing parser tests continue to prove import compatibility.

## Planned Verification

- `npm run i18n:check`
- focused signoff/import tests
- focused operator-workspace localized-copy tests
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- `Phase 421` should proceed to the surface-definition display/source split now that typed import-error copy is stable.

## Completion Summary

- Added stable signoff import-error codes for empty input, invalid JSON, and unsupported workspace/export shape.
- Preserved the existing English `error` fallback messages while rendering localized route feedback from `interactionAudit.importErrors`.
- Added 14-locale import-error copy under the operator workspace interaction-audit copy.
- Kept pasted JSON, parsed payload fields, operator notes, request context values, surface ids, accepted legacy workspace imports, current signoff export imports, generated drafts, filenames, MIME types, localStorage keys, and request binding/revision formatting unchanged.

## Verification

- `npm run i18n:check`
- `npm run test -- src/sidepanel/interaction-audit-signoff.test.ts src/shared/operator-workspace-localized-copy.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
