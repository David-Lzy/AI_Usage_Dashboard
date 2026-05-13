# Phase 392.2 - Popup Featured And Surface Roles 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- child phase split from `Phase 392`
- queued after `Phase 392.1`

## Goal

Complete the remaining popup structured-copy translation after first-run guidance is already covered.

## Scope

- Translate `featuredSection`, `featuredCard`, `actionSection`, `surfaceRoles`, and `aria` in `src/shared/popup-localized-copy.ts`.
- Preserve the glossary terms fixed in `Phase 392.1`.
- Add focused tests proving every non-English locale has explicit translated copy for representative featured-card and surface-role keys.
- Update i18n docs to mark popup structured copy complete for the 14-locale runtime set.

## Preserved Boundaries

- Do not change popup behavior, routing, action execution, sync behavior, badge behavior, provider models, or store listing copy.
- Do not translate raw evidence, vendor text, route ids, action ids, request ids, filenames, or archive/export payloads.
- Do not start Settings or provider-detail copy; that remains `Phase 393`.

## Acceptance

- All popup structured-copy buckets now have explicit 14-locale coverage.
- English fallback remains only for protected raw evidence or later non-popup buckets.
- Popup view-model behavior remains unchanged.

## Planned Verification

- `npm run i18n:check`
- `npm run test -- src/shared/popup-localized-copy.test.ts`
- `npm run test -- src/popup/view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Move to Settings and provider-detail deeper runtime copy in `Phase 393`.
