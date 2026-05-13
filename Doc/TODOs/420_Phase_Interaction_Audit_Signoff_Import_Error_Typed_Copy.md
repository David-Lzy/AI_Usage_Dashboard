# Phase 420 - Interaction Audit Signoff Import Error Typed Copy

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- active after `Phase 419`
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

- Proceed to the surface-definition display/source split only after typed import-error copy is stable.
