# Phase 384 - Hindi Runtime Shell Pilot

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

Add the next focused runtime shell translation pilot for `hi`, so Hindi users no longer see English fallback across the first dashboard, popup, and Settings shell surfaces after selecting the language.

## Scope

- Add `hi` runtime message overrides in `src/shared/runtime-message-catalogs.ts` for:
  - loading and error shell
  - shared common actions and theme toggle labels
  - dashboard top bar, hero, provider section, empty state, and summary labels
  - popup loading/header/summary/triage shell labels
  - Settings top bar, overview, section navigation, summary, preference controls, and save toast labels
- Add focused runtime i18n tests for the first `hi` shell slice.
- Assert Hindi remains `ltr` through existing locale metadata.
- Keep deeper structured copy, provider diagnostics, raw evidence strings, and export/archive payloads outside this slice.

## Preserved Boundaries

- No provider support-claim changes.
- No raw provider evidence, diagnostic raw body, archive/export schema, or vendor-owned string translation.
- No manifest locale, Chrome Web Store listing, release package, or submitted review boundary changes.
- No runtime locale registry changes.

## Acceptance

- `createRuntimeI18n("hi")` returns Hindi strings for the visible dashboard, popup, and Settings shell labels covered by this slice.
- Hindi continues to resolve `ltr`.
- Existing complete catalog key coverage remains intact through English fallback for uncovered deeper runtime copy.
- Focused i18n tests and the standard i18n drift check pass.

## Planned Verification

- `npm run test -- src/shared/i18n.test.ts`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Added the first `hi` runtime shell override set in `src/shared/runtime-message-catalogs.ts`.
- Added focused `hi` runtime message and text-direction assertions in `src/shared/i18n.test.ts`.
- Updated maintained localization docs and phase indexes to record Hindi as the next runtime shell pilot locale after `ar`.

## Verification

- `npm run test -- src/shared/i18n.test.ts`
- `npm run test`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Future translation-review phases should extend `hi` into structured helper copy before treating it as a broad reviewed runtime locale.
