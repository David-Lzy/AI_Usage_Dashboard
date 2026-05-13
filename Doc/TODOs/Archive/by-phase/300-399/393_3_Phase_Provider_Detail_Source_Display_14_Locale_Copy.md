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
- split and archived on 2026-05-13 before runtime code changes

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

## Closeout

Summary:

- Split this umbrella phase into `Phase 393.3.1` for Provider Detail copy and `Phase 393.3.2` for provider-source display wrapper copy.
- Kept Provider Detail and provider-source display work separated so raw evidence boundaries and large catalog edits can be reviewed independently.

Verification:

- `npm run docs:check`
- `git diff --check`

## Closeout

Summary:

- Split the oversized Provider Detail/source-display localization phase into two child phases before runtime code changes.
- `Phase 393.3.1` owns Provider Detail shell, badge, label, note, generated value, hero, and progress copy.
- `Phase 393.3.2` owns provider-source display wrapper copy and preserves raw source-selection/fallback evidence boundaries.

Verification:

- split-only documentation change; runtime verification moves to child phases
- `npm run docs:check`
- `git diff --check`
