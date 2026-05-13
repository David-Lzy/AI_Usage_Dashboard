# Phase 207 - Codex Merged Window Label Parser

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Make Codex personal usage-page parsing tolerate snippets where the usage-window label and remaining percent are merged into the same DOM text.

## Why This Phase Exists

`Phase 206` handled merged remaining-value snippets such as `32% remaining`. A live DOM can also merge the label and remaining value into one snippet, for example `每周使用限额 32% 剩余`. That shape should still produce a normalized usage window without polluting the label with the runtime percentage.

## What Changed

- Added label-plus-percent parsing for Codex usage-window snippets.
- Stripped inline runtime values from stored window labels before normalization.
- Preserved inline reset extraction when the reset time is merged into the same label/value snippet.
- Added regression coverage for merged base-window and model-window snippets.
- Added `npm run phase207:review` to verify parser, test, and closeout-document markers.

## Preserved Boundaries

- No provider coverage claims changed.
- Codex personal remains a visible-window usage path rather than one full plan-wide absolute remaining-balance path.
- Flex credit balance remains supplemental context.
- Popup, dashboard, settings, source-selection, and other providers did not change.

## Artifacts

- `scripts/phase207-codex-merged-window-label-review.mjs`
- `tmp/phase207-codex-merged-window-label-review/codex-merged-window-label-review.json`

## Verification

- `npm run test -- --run src/providers/codex/personal-page-parser.test.ts`
- `npm run phase207:review`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

If a real authenticated Codex page is available, re-run an operator pass against the live route. Otherwise keep future work similarly narrow and focused on current provider robustness.
