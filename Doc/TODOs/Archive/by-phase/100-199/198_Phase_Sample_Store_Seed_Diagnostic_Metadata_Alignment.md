# Phase 198 - Sample Store Seed Diagnostic Metadata Alignment

Date: 2026-04-25

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-25

## Goal

Align maintained sample and store screenshot seed diagnostic metadata where stable typed diagnostic codes already match existing raw evidence strings.

## Completed Work

- Added additive typed diagnostics to `SAMPLE_APP_STATE` for stable Cursor, JetBrains, Gemini, and Codex sample diagnostic strings.
- Added or cleared store screenshot seed typed metadata so seed-specific diagnostic codes match the active seed story.
- Added `phase198:review` and a static review artifact under `tmp/phase198-sample-store-seed-diagnostic-metadata-review/`.
- Refreshed Direction 09.3, runtime i18n TODOs, i18n references, the top-level TODO, README, and the phase index.

## Preserved Boundaries

- raw diagnostic strings stayed unchanged.
- Provider coverage claims stayed unchanged.
- Source-selection behavior and fallback order stayed unchanged.
- Archive schemas, request schemas, and screenshot assets stayed unchanged.
- Frozen historical evidence remains unchanged.

## Verification

- `npm run phase198:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `git diff --check`

## Follow-Up

Continue with diagnostic fixture and historical evidence alignment review under [09_3_Adapter_Diagnostic_Reason_Code_TODOs.md](../../../../Roadmap/09_3_Adapter_Diagnostic_Reason_Code_TODOs.md).
