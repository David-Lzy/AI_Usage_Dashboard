# Phase 394 - Code Maintenance Hotspot Audit

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13
- audit and refactor-prep phase only

## Goal

Review current source and test hotspots after the localization expansion, then define safe maintenance boundaries before refactoring.

## Scope

- Identify the largest and most frequently touched source/test files.
- Map each candidate hotspot to its behavior tests and build checks.
- Prioritize maintenance candidates by concrete risk: translation merge conflicts, oversized aggregators, duplicated provider metadata, brittle adapter tests, and page-session test density.
- Confirm the first planned maintenance implementation remains the runtime message catalog module split in `Phase 395`.

## Preserved Boundaries

- Do not refactor runtime code in this audit phase.
- Do not change provider behavior, UI copy, locale catalogs, release artifacts, or generated evidence.
- Do not split files unless the split has a named behavior-preservation test path.

## Acceptance

- A ranked maintenance hotspot note exists in the phase closeout or a maintained docs location.
- The note identifies which files are safe to touch after localization work and which should not be edited in parallel.
- `Phase 395` has enough test mapping to proceed without rediscovering basic ownership.

## Planned Verification

- `find src -type f \\( -name '*.ts' -o -name '*.tsx' \\) -print0 | xargs -0 wc -l | sort -nr | head -40`
- `rg 'runtime-message-catalogs|provider-sources|page-session|adapter.test' src scripts Doc`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Start the runtime message catalog module split in `Phase 395` only after this audit confirms the file boundary and tests.

## Closeout

Completed on 2026-05-13.

Summary:

- Confirmed `Phase 395` should remain the first maintenance implementation after the 14-locale copy expansion.
- The next implementation should split only the internal runtime message catalog data while preserving `src/shared/runtime-message-catalogs.ts` as the public import path.
- No runtime code, provider behavior, UI copy, locale catalogs, release artifacts, or generated evidence changed in this phase.

## Hotspot Ranking

Largest current source and test files from the audit command:

| Rank | Hotspot | Lines | Risk | Recommended boundary |
| --- | ---: | ---: | --- | --- |
| 1 | `src/shared/popup-localized-copy.ts` | 2799 | translation merge conflict and bulky structured-copy review | Do not touch in `Phase 395`; only edit in future popup-copy slices with `src/shared/popup-localized-copy.test.ts`. |
| 2 | `src/shared/runtime-message-catalogs.ts` | 1826 | dense locale catalog data plus public builder/export ownership | `Phase 395` should split internal data into locale/family modules while preserving the public file and exports. |
| 3 | `src/shared/provider-source-display-extended-localized-copy.ts` | 1636 | new 14-locale provider-source wrapper catalog with raw-evidence boundary risk | Do not edit in parallel with catalog splitting; guard with `src/shared/provider-source-display-localized-copy.test.ts`. |
| 4 | `src/shared/settings-core-localized-copy.ts` | 1599 | Settings copy merge conflicts and visible UI copy drift | Keep out of `Phase 395`; guard with `src/shared/settings-localized-copy.test.ts` and Settings render tests. |
| 5 | `src/shared/provider-detail-extended-localized-copy.ts` | 1187 | Provider Detail localized copy plus raw diagnostic/source boundary | Keep out of `Phase 395`; guard with `src/shared/provider-detail-localized-copy.test.ts`. |
| 6 | `src/shared/provider-sources.ts` | 1145 | source-state semantics, provider contract labels, and source display construction share one module | Avoid behavior edits unless paired with `src/shared/provider-sources.test.ts`, popup view-model tests, and provider detail tests. |
| 7 | `src/providers/codex/adapter.test.ts` | 1083 | broad Codex adapter regression surface with personal usage and diagnostics fixtures | Do not combine with localization refactors; only touch in provider-scoped phases. |
| 8 | `src/providers/cursor/adapter.test.ts` | 930 | broad Cursor adapter regression surface with personal usage and diagnostics fixtures | Do not combine with localization refactors; only touch in provider-scoped phases. |
| 9 | `src/providers/page-session.test.ts` plus helper tests | 791 core test, 548 helper-test lines | page-session behavior is already split but integration density remains high | Avoid unless a page-session behavior phase names the affected helper and focused test. |

Touch-frequency notes:

| Hotspot | Recent history signal | Audit interpretation |
| --- | ---: | --- |
| `src/popup/PopupApp.tsx` | 39 historical touches | High churn, but recent phases already extracted popup sections and actions. Do not reopen during catalog splitting. |
| `src/shared/i18n.test.ts` | 30 historical touches | Primary catalog/registry guard. It is safe and expected to touch only if the module split needs import-path assertions. |
| `src/shared/runtime-message-catalogs.ts` | 11 historical touches | Not the highest churn, but it is the largest remaining central catalog entry point and has a clean behavior-preserving split path. |
| `src/providers/codex/adapter.test.ts` and `src/providers/cursor/adapter.test.ts` | 11 touches each | Provider adapter tests are broad and brittle enough to keep out of unrelated maintenance phases. |

## Phase 395 Boundary

Allowed write scope:

- `src/shared/runtime-message-catalogs.ts`
- new internal modules under `src/shared/runtime-message-catalogs/`
- `src/shared/i18n.test.ts` only if the public export or completeness assertions need import-path coverage
- docs and phase closeout files

Recommended split:

| Module | Contents |
| --- | --- |
| `src/shared/runtime-message-catalogs/base.ts` | `EN_RUNTIME_MESSAGES` and `RUNTIME_SHELL_MESSAGE_IDS`. |
| `src/shared/runtime-message-catalogs/overrides-cjk.ts` | `zh-CN`, `zh-TW`, `ja`, and `ko` runtime overrides. |
| `src/shared/runtime-message-catalogs/overrides-latin.ts` | `es-419`, `pt-BR`, `fr`, `de`, and `it` runtime overrides. |
| `src/shared/runtime-message-catalogs/overrides-other.ts` | `ru`, `ar`, `hi`, and `id` runtime overrides. |
| `src/shared/runtime-message-catalogs.ts` | stable public entry that imports internal modules, builds catalogs, and exports the same public helpers. |

Do not touch in `Phase 395`:

- structured copy helpers such as `popup-localized-copy.ts`, Settings copy modules, Provider Detail copy modules, and provider-source display copy modules
- provider adapters, parsers, page-session clients, source-selection semantics, host-permission behavior, manifest `_locales`, store listing drafts, release packages, and generated evidence

## Test Mapping

| Area | Required checks |
| --- | --- |
| Runtime message catalog split | `npm run i18n:check`, `npm run test -- src/shared/i18n.test.ts`, `npm run typecheck`, `npm run build` |
| Provider-source display copy | `npm run test -- src/shared/provider-source-display-localized-copy.test.ts`, `npm run test -- src/shared/provider-sources.test.ts` |
| Provider metadata/source-state changes | `npm run test -- src/shared/provider-sources.test.ts`, popup view-model tests, provider detail route tests |
| Page-session changes | `npm run test -- src/providers/page-session.test.ts` plus the relevant helper test under `src/providers/page-session-*.test.ts` |
| Adapter behavior changes | provider-specific adapter tests plus parser/capture/client tests for the touched provider |

Verification:

- `find src -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 | xargs -0 wc -l | sort -nr | head -40`
- `rg 'runtime-message-catalogs|provider-sources|page-session|adapter.test' src scripts Doc`
- `npm run docs:check`
- `git diff --check`
