# Phase 184 - Adapter Diagnostic Reason-Code Plan

Date: 2026-04-25

Document class:

- closed evidence

## Goal

Plan the typed diagnostic reason-code layer that must exist before adapter-generated diagnostic bodies can be localized safely.

## Why This Phase Exists

`Phase 183` localized provider-source display wrappers because they are generated from typed enums and helper state. Adapter diagnostic bodies still carry raw source-truth evidence. This phase keeps that boundary explicit and prepares the next runtime implementation slice without changing runtime behavior.

## What Changed

- [I18n_Adapter_Diagnostic_Reason_Code_Plan.md](../../I18n/I18n_Adapter_Diagnostic_Reason_Code_Plan.md) now defines the maintained reason-code contract.
- [09_3_Adapter_Diagnostic_Reason_Code_TODOs.md](../../Roadmap/09_3_Adapter_Diagnostic_Reason_Code_TODOs.md) now breaks the work into executable future slices.
- Direction 09 docs now mark adapter diagnostic typed reason-code planning as complete and queue a type-only additive runtime model next.
- raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` fields remain protected source-truth values.
- `phase184-adapter-diagnostic-reason-code-plan-review.mjs` verifies the new plan, roadmap references, and phase closeout.

## Runtime Behavior

No runtime product behavior changed in this slice.

## Verification

- `npm run phase184:review`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Follow-Up

The next safe implementation slice is a type-only additive diagnostic model that adds optional typed diagnostics beside existing raw diagnostic strings.
