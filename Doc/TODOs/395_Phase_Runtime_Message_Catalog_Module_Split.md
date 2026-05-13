# Phase 395 - Runtime Message Catalog Module Split

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- queued after `Phase 394`
- first maintenance implementation phase after deeper localization work

## Goal

Split the runtime message catalog implementation into smaller modules while preserving the existing public import path and localization behavior.

## Scope

- Keep `src/shared/runtime-message-catalogs.ts` as the stable public export entry.
- Move internal catalog data into smaller modules grouped by locale or locale family, based on the `Phase 394` audit.
- Preserve all existing message ids, fallback behavior, shipped locale tags, and runtime registry metadata.
- Add or update focused tests so catalog completeness continues to fail fast after the split.

## Preserved Boundaries

- Do not change runtime copy text except for mechanical relocation required by the split.
- Do not add or remove locales.
- Do not change locale resolution, `rtl` mapping, Settings language options, Chrome manifest `_locales`, store listing drafts, release packages, or provider behavior.
- Do not combine this refactor with new translation work.

## Acceptance

- Existing imports from `src/shared/runtime-message-catalogs.ts` continue to work.
- Catalog completeness checks see the same message ids and locale coverage before and after the split.
- The split reduces single-file catalog density without changing rendered UI behavior.
- Diff review can separate mechanical moves from any necessary test updates.

## Planned Verification

- `npm run i18n:check`
- `npm run test -- src/shared/i18n.test.ts`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Choose the next maintenance hotspot only after this split is complete and archived.
