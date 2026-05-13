# Phase 373 - Traditional Chinese Runtime Shell Pilot

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Start replacing English runtime fallback for `zh-TW` with a focused Traditional Chinese shell slice that is visible immediately after selecting the language.

## Scope

- Add `zh-TW` runtime message overrides for:
  - loading and error shell
  - shared common actions and theme toggle labels
  - dashboard top bar, hero, provider section, empty state, and summary labels
  - popup loading/header/summary/triage shell labels
  - Settings top bar, overview, section navigation, summary, preference controls, and save toast labels
- Add focused runtime i18n tests for the first `zh-TW` shell slice.
- Keep deeper structured copy, provider diagnostics, raw evidence strings, and export/archive payloads outside this slice.

## Preserved Boundaries

- No provider support-claim changes.
- No raw provider evidence, diagnostic raw body, archive/export schema, or vendor-owned string translation.
- No manifest locale, Chrome Web Store listing, release package, or submitted review boundary changes.
- No runtime locale registry changes.

## Acceptance

- `createRuntimeI18n("zh-TW")` returns Traditional Chinese strings for the visible dashboard, popup, and Settings shell labels covered by this slice.
- Existing complete catalog key coverage remains intact through English fallback for uncovered deeper runtime copy.
- Focused i18n tests and the standard i18n drift check pass.

## Planned Verification

- `npm run test -- src/shared/i18n.test.ts`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Added the first `zh-TW` runtime shell override set in `src/shared/i18n.ts`.
- Added focused `zh-TW` runtime message assertions in `src/shared/i18n.test.ts`.
- Updated maintained localization docs and phase indexes to record `zh-TW` as the second runtime shell pilot locale after `zh-CN`.

## Verification

- `npm run test -- src/shared/i18n.test.ts`
- `npm run i18n:check`
- `npm run typecheck`

## Follow-Up

- Future translation-review phases should extend `zh-TW` into structured helper copy before treating it as a broad reviewed runtime locale.
