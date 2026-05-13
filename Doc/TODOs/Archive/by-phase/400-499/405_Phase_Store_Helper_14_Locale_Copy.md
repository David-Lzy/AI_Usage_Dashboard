# Phase 405 - Store Helper 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived after `Phase 405`
- store-helper runtime copy implementation slice completed on 2026-05-14

## Goal

Add explicit 14-locale copy for the store-helper UI buckets approved by `Phase 403`, while preserving screenshot workflow evidence and automation identity strings.

## Scope

- Expand translatable copy in `src/shared/store-workflow-localized-copy.ts` to the shipped 14 runtime locales.
- Add focused tests for representative non-English and RTL store-helper copy.
- Keep compatibility re-exports and public helper names stable.
- Update i18n backlog and roadmap docs after implementation.

## Preserved Boundaries

- Do not translate automation titles, preset ids, route hashes, final screenshot surfaces, request ids, archive ids, filenames, generated capture evidence, or Chrome Web Store listing source text.
- Do not change screenshot capture plans, archive generation, request generation, or release packaging.
- Do not change locale registry, shipped locale set, or fallback behavior outside the touched helper.

## Acceptance

- Approved store-helper UI copy has explicit 14-locale coverage.
- Protected automation/evidence fields stay raw.
- Focused tests prove representative non-English and Arabic copy does not fall back to English for the covered buckets.

## Planned Verification

- `npm run i18n:check`
- focused store-workflow localized-copy tests
- focused store route tests if helper consumers change
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Decide whether the next queue should be visual QA for localized operator/store routes, release packaging, or a maintenance hotspot from `Phase 394`.

## Closeout

Completed on 2026-05-14.

Summary:

- Replaced the `en` plus `zh-CN` branch in `src/shared/store-workflow-localized-copy.ts` with a 14-locale catalog keyed by the shipped runtime locale registry.
- Kept `buildStoreWorkflowLocalizedCopy(i18n)` and the `src/shared/localized-copy.ts` re-export stable.
- Preserved unknown preset fallback behavior for `presetHeadline()` and `presetDetail()`.
- Preserved empty caption behavior for unknown preset ids and the `unlock` preset.
- Kept automation titles, route hashes, preset ids, capture-plan identity fields, generated evidence, final screenshot surfaces, and Chrome Web Store listing source text outside localization.
- Added focused test coverage for every shipped locale, representative Arabic copy, preset interpolation, unknown fallback, empty unsupported captions, and legacy re-export behavior.

Verification:

- `npm run i18n:check` passed.
- `npm run test -- src/shared/store-workflow-localized-copy.test.ts` passed.
- `npm run test -- src/shared/i18n.test.ts` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run docs:check` passed.
- `git diff --check` passed.

Follow-up:

- The numbered queue is intentionally empty at closeout; the next unattended planning slice should create a new queue for visual QA, a release-gate pass, or a maintenance hotspot from `Phase 394`.
