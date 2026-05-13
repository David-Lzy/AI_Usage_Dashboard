# Phase 386 - Runtime Shell Pilot Coverage Guard

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

Add a focused regression guard for the completed 14-locale runtime shell rollout, so future edits cannot silently drop a first-shell message override for one non-English locale while catalog completeness still passes through English fallback.

## Scope

- Export the runtime shell message-id coverage set from `src/shared/runtime-message-catalogs.ts`.
- Expose a narrow runtime catalog helper that reports which message ids have explicit locale overrides.
- Add a focused i18n unit test that requires every non-English runtime locale to explicitly cover the first shell pilot id set.
- Keep the static `i18n:check` locale-metadata reader compatible with exported runtime message-id types.
- Keep fallback-based deeper runtime catalog completeness unchanged.

## Preserved Boundaries

- No provider support-claim changes.
- No runtime copy changes.
- No manifest locale, Chrome Web Store listing, release package, or submitted review boundary changes.
- No attempt to require reviewed translations for deeper structured helper copy.

## Acceptance

- The focused i18n test fails if any non-English locale loses a first shell pilot override key.
- Existing complete catalog key coverage through English fallback remains intact.
- The standard i18n, typecheck, docs, test, build, and diff checks pass.

## Planned Verification

- `npm run test -- src/shared/i18n.test.ts`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Exported `RuntimeMessageId`, `RUNTIME_SHELL_MESSAGE_IDS`, and `getRuntimeMessageOverrideIds`.
- Added focused shell-pilot coverage assertions for every non-English locale in `src/shared/i18n.test.ts`.
- Updated `scripts/check-i18n-locales.mjs` so its metadata parser accepts the exported `RuntimeMessageId` type anchor.
- Updated maintained localization docs and phase indexes to record the new coverage guard.

## Verification

- `npm run test -- src/shared/i18n.test.ts`
- `npm run test`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Future translation-review phases can add separate deeper-copy guards when those surfaces receive reviewed non-English translations.
