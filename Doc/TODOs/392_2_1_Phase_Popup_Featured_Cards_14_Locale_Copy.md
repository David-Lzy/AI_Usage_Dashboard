# Phase 392.2.1 - Popup Featured Cards 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- child phase split from `Phase 392.2`
- active popup localization implementation slice

## Goal

Translate popup featured-section and featured-card structured copy for all 14 runtime locales.

## Scope

- Translate `featuredSection` and `featuredCard` in `src/shared/popup-localized-copy.ts`.
- Preserve glossary terms fixed in `Phase 392.1`: `provider`, `Settings`, `Quick Setup`, `dashboard`, `popup`, `host access`, `live-ready`, `policy-only`, provider names, and product names.
- Add focused tests proving every non-English locale has translated representative featured-section and featured-card copy.
- Preserve behavior and routing; this phase changes copy only.

## Preserved Boundaries

- Do not change popup view-model decisions, action ids, route ids, provider ordering, sync behavior, or provider support claims.
- Do not translate raw provider evidence, raw diagnostic body text, archive/export schemas, request ids, filenames, route ids, or vendor page text.
- Do not change `actionSection`, `surfaceRoles`, or `aria`; those move to `Phase 392.2.2`.

## Acceptance

- Popup featured-section and featured-card copy has explicit 14-locale coverage.
- English fallback remains only for `Phase 392.2.2` buckets or protected raw evidence.
- Existing popup view-model tests still pass.

## Planned Verification

- `npm run i18n:check`
- `npm run test -- src/shared/popup-localized-copy.test.ts`
- `npm run test -- src/popup/view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Finish action-section, surface-role, and aria popup copy in `Phase 392.2.2`.
