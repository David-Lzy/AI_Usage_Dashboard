# Phase 393.3 - Provider Detail Source Display 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- child phase split from `Phase 393`
- queued after `Phase 393.2`

## Goal

Expand Provider Detail copy and provider-source display wrappers into explicit 14-locale runtime copy.

## Scope

- Translate `src/shared/provider-detail-localized-copy.ts` for Provider Detail shell, section labels, field labels, badges, notes, and generated value wrappers.
- Translate safe wrapper copy in `src/shared/provider-source-display-localized-copy.ts`.
- Add focused tests proving every non-English locale has representative translated provider-detail and provider-source display copy.
- Update i18n docs when the Provider Detail/source-display bucket is complete.

## Preserved Boundaries

- Do not translate raw `warningReason`, `sourceSelectionReason`, `sourceFallbackReason`, adapter raw body text, page-capture snippets, host labels, URLs, route hints, provider ids, or archive/export schemas.
- Do not change provider-detail data semantics, source-selection semantics, diagnostic construction, locale resolution, or provider support claims.
- Do not start diagnostics-body, operator-workspace, or store-helper localization.

## Acceptance

- Provider Detail and provider-source wrapper copy has explicit 14-locale coverage.
- Raw evidence and diagnostic bodies remain source truth and are not localized.
- Existing provider-detail, source-display, and Settings source-card behavior remains unchanged.

## Planned Verification

- `npm run i18n:check`
- `npm run test -- src/shared/provider-detail-localized-copy.test.ts`
- `npm run test -- src/shared/provider-source-display-localized-copy.test.ts`
- `npm run test -- src/shared/i18n.test.ts`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Move to `Phase 394` maintenance hotspot audit before any module-splitting implementation.
