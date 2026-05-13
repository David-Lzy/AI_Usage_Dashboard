# Phase 398 - Warning Diagnostic Presentation 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 397`
- first diagnostic presentation implementation slice

## Goal

Add explicit 14-locale presentation copy for typed warning diagnostics while keeping raw warning bodies unchanged.

## Scope

- Localize warning diagnostic labels and short summaries generated from typed params.
- Cover credential, host-access, page-session, usage-threshold, policy-only, and sync-stale warning presentation that currently branches only for `zh-CN`.
- Add tests proving every non-English locale gets representative non-English warning diagnostic presentation.

## Preserved Boundaries

- Do not translate or rewrite raw `warningReason`.
- Do not change diagnostic builders, provider adapters, source-state classification, archive/export schemas, or view-model raw evidence rendering.
- Do not start source-selection/fallback or adapter-error presentation in this phase.

## Acceptance

- Warning diagnostic presentation has explicit 14-locale coverage.
- Raw warning bodies remain visible and unchanged in existing tests.
- Unknown warning diagnostic fallback behavior remains presentation-only and safe.

## Planned Verification

- `npm run i18n:check`
- `npm run test -- src/shared/i18n.test.ts`
- `npm run test -- src/sidepanel/settings-view-models.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Continue to `Phase 399` source-selection and fallback diagnostic presentation copy.
