# Phase 392.1 - Popup First-Run Guidance 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- child phase split from `Phase 392`
- active first popup localization implementation slice

## Goal

Expand the first-run popup guidance, setup coverage, snapshot status, and header copy into explicit 14-locale structured copy.

## Scope

- Translate `snapshotStatus`, `guidance`, `setupCoverage`, and `header` in `src/shared/popup-localized-copy.ts`.
- Keep `provider`, `Settings`, `Quick Setup`, `dashboard`, `popup`, `host access`, `live-ready`, `policy-only`, provider names, and product names stable across locales.
- Add focused tests proving every non-English locale has non-English popup first-run copy for representative keys.
- Preserve behavior and routing; this phase changes copy only.

## Preserved Boundaries

- Do not translate raw provider evidence, raw diagnostic body text, archive/export schemas, request ids, filenames, route ids, or vendor page text.
- Do not change popup view-model decisions, action ids, route ids, provider ordering, sync behavior, or provider support claims.
- Do not change featured provider cards, action-section copy, surface-role copy, or aria copy; those move to `Phase 392.2`.

## Acceptance

- First-run popup guidance and setup copy has explicit 14-locale coverage for the scoped buckets.
- English fallback remains only for `Phase 392.2` buckets or protected raw evidence.
- Arabic continues to use the existing `rtl` runtime direction boundary.
- Existing popup view-model tests still pass.

## Planned Verification

- `npm run i18n:check`
- `npm run test -- src/shared/popup-localized-copy.test.ts`
- `npm run test -- src/popup/view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Finish the remaining popup featured-card, action-section, surface-role, and aria copy in `Phase 392.2`.
