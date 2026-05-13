# Phase 399 - Source Diagnostic Presentation 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 398`
- second diagnostic presentation implementation slice

## Goal

Add explicit 14-locale presentation copy for typed source-selection and source-fallback diagnostics while preserving raw source reasons.

## Scope

- Localize source kind and source preference labels used by diagnostic presentation.
- Localize source-selection summaries, no-live-path summaries, and fallback summaries generated from typed params.
- Add tests proving every non-English locale gets representative non-English source diagnostic presentation.

## Preserved Boundaries

- Do not translate raw `sourceSelectionReason` or `sourceFallbackReason`.
- Do not change source selection, fallback selection, provider source contracts, adapters, or raw evidence rendering.
- Do not start adapter-error presentation in this phase.

## Acceptance

- Source diagnostic presentation has explicit 14-locale coverage.
- Raw source-selection and source-fallback bodies remain visible and unchanged in existing tests.
- Unknown source diagnostic fallback behavior remains presentation-only and safe.

## Planned Verification

- `npm run i18n:check`
- `npm run test -- src/shared/i18n.test.ts`
- `npm run test -- src/sidepanel/settings-view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Continue to `Phase 400` adapter-error diagnostic presentation copy.
