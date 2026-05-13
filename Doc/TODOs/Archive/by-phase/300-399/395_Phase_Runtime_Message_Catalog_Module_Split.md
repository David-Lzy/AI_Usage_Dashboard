# Phase 395 - Runtime Message Catalog Module Split

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13
- first maintenance implementation phase after deeper localization work

## Goal

Split the runtime message catalog implementation into smaller modules while preserving the existing public import path and localization behavior.

## Scope

- Keep `src/shared/runtime-message-catalogs.ts` as the stable public export entry.
- Move internal catalog data into smaller modules grouped by locale or locale family, based on the `Phase 394` audit.
- Preserve all existing message ids, fallback behavior, shipped locale tags, and runtime registry metadata.
- Add or update focused tests so catalog completeness continues to fail fast after the split.

## Phase 394 Audit Input

- `src/shared/runtime-message-catalogs.ts` is the safest first maintenance target because only `src/shared/i18n.ts` and `src/shared/i18n.test.ts` import it directly.
- Use this write scope only:
  - `src/shared/runtime-message-catalogs.ts`
  - new internal modules under `src/shared/runtime-message-catalog-data/`
  - `src/shared/i18n.test.ts` only if stable import/completeness assertions need adjustment
  - docs and phase closeout files
- Recommended module shape:
  - `runtime-message-catalog-data/base.ts` for `EN_RUNTIME_MESSAGES` and `RUNTIME_SHELL_MESSAGE_IDS`
  - `runtime-message-catalog-data/overrides-cjk.ts` for `zh-CN`, `zh-TW`, `ja`, and `ko`
  - `runtime-message-catalog-data/overrides-latin.ts` for `es-419`, `pt-BR`, `fr`, `de`, and `it`
  - `runtime-message-catalog-data/overrides-other.ts` for `ru`, `ar`, `hi`, and `id`
  - `runtime-message-catalogs.ts` remains the public entrypoint that imports those internal modules and exports the same helpers
- Do not touch structured-copy helpers, provider adapters, parsers, page-session clients, provider source contracts, manifest catalogs, store listing drafts, release packages, or generated evidence.

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

## Closeout

Completed on 2026-05-13.

Summary:

- Kept `src/shared/runtime-message-catalogs.ts` as the stable public import path for `buildRuntimeMessages`, `getRuntimeMessageOverrideIds`, and `RUNTIME_SHELL_MESSAGE_IDS`.
- Moved internal catalog data into smaller modules:
  - `src/shared/runtime-message-catalog-data/base.ts`
  - `src/shared/runtime-message-catalog-data/overrides-cjk.ts`
  - `src/shared/runtime-message-catalog-data/overrides-latin.ts`
  - `src/shared/runtime-message-catalog-data/overrides-other.ts`
- Used `runtime-message-catalog-data/` instead of the audit's proposed `runtime-message-catalogs/` directory after implementation exposed resolver ambiguity with the existing public `runtime-message-catalogs.ts` entry.
- Preserved all message ids, locale tags, fallback behavior, runtime registry metadata, UI copy text, manifest catalogs, store listing drafts, provider behavior, release artifacts, and generated evidence.

Size result:

| File | Lines after split |
| --- | ---: |
| `src/shared/runtime-message-catalogs.ts` | 33 |
| `src/shared/runtime-message-catalog-data/base.ts` | 264 |
| `src/shared/runtime-message-catalog-data/overrides-cjk.ts` | 497 |
| `src/shared/runtime-message-catalog-data/overrides-latin.ts` | 584 |
| `src/shared/runtime-message-catalog-data/overrides-other.ts` | 468 |

Verification:

- `npm run i18n:check`
- `npm run test -- src/shared/i18n.test.ts`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`
