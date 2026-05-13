# Phase 404 - Operator Workspace 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 403`
- operator-workspace runtime copy implementation slice

## Goal

Add explicit 14-locale copy for the operator-workspace UI buckets approved by `Phase 402`, while preserving evidence/export payloads as raw compatibility data.

## Scope

- Expand translatable copy in `src/shared/operator-workspace-localized-copy.ts` to the shipped 14 runtime locales.
- Add focused tests for representative non-English and RTL operator-workspace copy.
- Keep compatibility re-exports and public helper names stable.
- Update i18n backlog and roadmap docs after implementation.

## Preserved Boundaries

- Do not translate operator evidence payloads, request identifiers, preset ids, filenames, route hashes, archive ids, fixture ids, or export schemas.
- Do not change interaction-audit or theme-recovery workflow behavior.
- Do not change locale registry, shipped locale set, or fallback behavior outside the touched helper.

## Acceptance

- Approved operator-workspace UI copy has explicit 14-locale coverage.
- Protected evidence/export fields stay raw.
- Focused tests prove representative non-English and Arabic copy does not fall back to English for the covered buckets.

## Planned Verification

- `npm run i18n:check`
- focused operator-workspace localized-copy tests
- focused interaction-audit/theme-recovery tests if helper consumers change
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Continue with `Phase 405` store-helper 14-locale copy.
