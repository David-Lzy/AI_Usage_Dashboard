# Phase 410 - Store Helper Error Presentation Split

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed on `2026-05-14`
- follow-up for store-helper visible errors left outside `Phase 405`
- closeout archived after adding [I18n_Store_Helper_Error_Presentation_Split.md](../../../../I18n/I18n_Store_Helper_Error_Presentation_Split.md)

## Goal

Decide whether store-helper invalid-preset, malformed-seed, and background/runtime error strings should gain localized presentation wrappers without changing automation or raw error evidence.

## Scope

- Review `StoreScreenshotSeedPage.tsx`, `StoreScreenshotNativePopupProbePage.tsx`, and `src/sidepanel/store-screenshot-seed.ts`.
- Separate user-visible helper labels from automation titles, thrown raw errors, and generated evidence values.
- Implement a small typed presentation wrapper only if the boundary is clear.

## Preserved Boundaries

- Do not change automation document titles.
- Do not translate preset ids, route hashes, capture-plan truth fields, request/archive ids, filenames, generated capture evidence, or final screenshot surfaces.
- Do not change screenshot request, archive, or release packaging scripts.

## Acceptance

- Store-helper error presentation has a documented implementation boundary.
- Any localized display wrapper preserves raw error strings where they are evidence or debugging inputs.
- Unknown preset behavior remains stable.

## Planned Verification

- focused store route/helper tests if code changes land
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If the split is implemented, consider whether the same pattern is useful for remaining operator-only helper routes.

## Completion Summary

`Phase 410` implemented the small typed presentation wrapper because the boundary was clear: the helper routes can localize the surrounding error presentation while preserving the raw error message as debugging evidence.

Delivered:

- added `screenshotSeed.errorDetail(rawMessage)` and `nativePopupProbe.errorDetail(rawMessage)` to `buildStoreWorkflowLocalizedCopy`
- added explicit 14-locale wrappers for seed-route and native-popup-probe errors
- updated `StoreScreenshotSeedPage.tsx` and `StoreScreenshotNativePopupProbePage.tsx` to render localized wrappers around raw error messages
- preserved automation document titles, preset ids, route hashes, capture-plan identities, request/archive identities, filenames, generated evidence, final screenshot surfaces, and store listing text
- documented the boundary in [I18n_Store_Helper_Error_Presentation_Split.md](../../../../I18n/I18n_Store_Helper_Error_Presentation_Split.md)

## Verification

- `npm run test -- src/shared/store-workflow-localized-copy.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
