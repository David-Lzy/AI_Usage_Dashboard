# Phase 408 - Localization Copy Chunk Size Audit

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-14
- maintenance audit for post-localization bundle growth landed in `Doc/I18n/I18n_Localization_Copy_Chunk_Size_Audit.md`

## Goal

Audit the bundle-size impact of the expanded localized copy catalogs and decide whether any route-level lazy loading or module split is justified before the next release package.

## Scope

- Compare current build chunk warnings and affected entry points after `Phase 404` and `Phase 405`.
- Inspect large localized-copy modules and their import paths.
- Produce a ranked recommendation for no-op, module split, route lazy loading, or later follow-up work.

## Preserved Boundaries

- Do not change runtime behavior in the audit phase unless the fix is trivial and separately verified.
- Do not remove shipped locales or locale coverage to reduce bundle size.
- Do not change provider contracts, manifest locales, or store listing localization.

## Acceptance

- A documented audit identifies whether localization copy growth is acceptable for the current extension package.
- Any proposed implementation has a narrow write scope and verification plan.
- Build output warnings are recorded with concrete chunk names and sizes.

## Planned Verification

- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Closeout

Completed on 2026-05-14.

Summary:

- ran `npm run build` and recorded the current Vite large-chunk warning
- measured built asset raw/gzip sizes after stable output rewrite
- measured localized copy and runtime catalog source sizes
- compared Phase 404/405 operator/store helper copy source deltas against commit `0d2279d`
- documented the decision in [I18n_Localization_Copy_Chunk_Size_Audit.md](../../../../I18n/I18n_Localization_Copy_Chunk_Size_Audit.md)

Decision:

- no Phase 408 runtime change
- the current side-panel warning is acceptable for the next maintenance package
- if size becomes a release blocker, the right follow-up is lazy-loading special debug/helper routes, not removing locales

Verification:

- `npm run build`
- source byte/gzip audit for localized copy and runtime catalog modules
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If needed, create an implementation phase for the chosen split or lazy-loading boundary.
