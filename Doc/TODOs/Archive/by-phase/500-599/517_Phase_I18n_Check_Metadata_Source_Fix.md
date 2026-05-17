# Phase 517 - I18n Check Metadata Source Fix

Date: 2026-05-17

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- completed phase note

Freshness model:

- historical evidence; current summary is maintained in [00_Phase_Index.md](../../../00_Phase_Index.md)

## Goal

Restore `npm run i18n:check` after the locale metadata extraction.

## Scope

- Update `scripts/check-i18n-locales.mjs` so the runtime locale registry and Chrome locale metadata are read from `src/shared/i18n-locale-metadata.ts`.
- Preserve the existing locale completeness assertions, manifest catalog checks, RDP locale checks, and store listing localization checks.
- Record the current maintenance-review finding without changing runtime locale behavior.

## Preserved Boundaries

- No runtime i18n resolution, message catalog, manifest locale catalog, or store listing text changed.
- No provider, Settings, popup, or sidepanel behavior changed.
- No release package was cut.

## Acceptance

- `npm run i18n:check` passes with the extracted metadata source.
- The script still fails if runtime locale tags, Chrome locale directory names, manifest catalogs, RDP locale route support, or store listing locales drift.
- Project current-fact docs identify the source as ahead of `0.1.0-rc.23` through this phase.

## Verification

- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `npm run test`
- `npm run build`
- `git diff --check`

## Follow-Up

- If another source-of-truth extraction happens, update the matching checker in the same phase as the extraction instead of leaving a post-hoc fix.
