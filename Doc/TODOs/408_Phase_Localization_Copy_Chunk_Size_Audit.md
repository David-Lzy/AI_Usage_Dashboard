# Phase 408 - Localization Copy Chunk Size Audit

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 407`
- maintenance audit for post-localization bundle growth

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

## Follow-Up

- If needed, create an implementation phase for the chosen split or lazy-loading boundary.
