# Phase 404 - Operator Workspace 14-Locale Copy

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived after `Phase 404`
- operator-workspace runtime copy implementation slice completed on 2026-05-13

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

## Closeout

Completed on 2026-05-13.

Summary:

- Replaced the `en` plus `zh-CN` branch in `src/shared/operator-workspace-localized-copy.ts` with a 14-locale catalog keyed by the shipped runtime locale registry.
- Kept `buildOperatorWorkspaceLocalizedCopy(i18n)` and the `src/shared/localized-copy.ts` re-export stable.
- Covered the Phase 402 approved helper-owned interaction-audit and theme-recovery buckets without moving consumer-only labels that are adjacent to export, route, request, preset, or evidence contracts.
- Added focused test coverage for every shipped locale plus representative Arabic copy.
- Updated the operator-workspace inventory, deeper i18n backlog, and roadmap state for the completed helper-owned implementation boundary.

Verification:

- `npm run i18n:check` passed.
- `npm run test -- src/shared/operator-workspace-localized-copy.test.ts` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run docs:check` passed.
- `git diff --check` passed.

Follow-up:

- `Phase 405` should translate the store-helper runtime copy from the maintained inventory.
- Consumer-only interaction-audit labels remain a later presentation/export split if a future phase can move them without altering persisted evidence or generated handoff text.
