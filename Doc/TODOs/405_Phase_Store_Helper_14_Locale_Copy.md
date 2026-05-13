# Phase 405 - Store Helper 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 404`
- store-helper runtime copy implementation slice

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
