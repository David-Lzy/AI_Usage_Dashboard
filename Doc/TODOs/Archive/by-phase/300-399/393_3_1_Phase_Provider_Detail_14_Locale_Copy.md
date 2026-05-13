# Phase 393.3.1 - Provider Detail 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- child phase split from `Phase 393.3`
- active after the `Phase 393.3` split closeout

## Goal

Expand Provider Detail shell and value-wrapper copy into explicit 14-locale runtime copy.

## Scope

- Translate safe `src/shared/provider-detail-localized-copy.ts` Provider Detail labels for all 14 runtime locales.
- Cover topbar subtitle, detail-tab title, section labels, badges, field labels, notes, generated value wrappers, hero detail, and progress label.
- Add focused tests proving every non-English locale has representative translated Provider Detail copy.
- Update i18n docs when the Provider Detail bucket is complete.

## Preserved Boundaries

- Do not translate raw `warningReason`, adapter raw body text, page-capture snippets, host labels, URLs, route hints, provider ids, or archive/export schemas.
- Do not change provider-detail data semantics, diagnostic construction, locale resolution, or provider support claims.
- Do not start provider-source display wrapper copy; that remains `Phase 393.3.2`.

## Acceptance

- Provider Detail copy has explicit 14-locale coverage.
- Raw evidence and diagnostic bodies remain source truth and are not localized.
- Existing Provider Detail behavior remains unchanged.

## Planned Verification

- `npm run i18n:check`
- `npm run test -- src/shared/provider-detail-localized-copy.test.ts`
- `npm run test -- src/shared/i18n.test.ts`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Move to provider-source display wrapper copy in `Phase 393.3.2`.

## Closeout

Summary:

- Added explicit 14-locale Provider Detail helper copy through `src/shared/provider-detail-extended-localized-copy.ts`.
- Kept the existing `buildProviderDetailLocalizedCopy` and `localized-copy` export paths stable while routing non-`en`/non-`zh-CN` locales through the new Provider Detail catalog.
- Added a focused guard that every non-English locale keeps representative Provider Detail shell, badge, note, value-wrapper, and hero copy.

Verification:

- `npm run i18n:check`
- `npm run test -- src/shared/provider-detail-localized-copy.test.ts`
- `npm run test -- src/shared/i18n.test.ts`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`
