# Phase 107 - Custom Seed Compact Width Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Status:

- completed
- archived

## Objective

Prove the shipped custom-seed path remains overflow-safe and state-coherent across the main product surfaces at compact widths.

## Why This Phase Existed

`Phase 103` had already shipped the first validated custom-seed input and the initial cross-surface propagation proof.

`Phase 104` had already covered popup-local and audit-local accent surfaces.

`Phase 105` had already covered popup and audit-hub non-accent stability.

`Phase 106` had already covered dashboard, Settings, and provider-detail non-accent stability at normal widths.

That still left one important truth gap:

- the product could prove custom-seed behavior at normal widths
- but it had not yet proven that the same saved seed stayed stable when the layout collapsed into compact side-panel and popup widths

This phase existed to close that gap with the next smallest honest contract:

- one repeatable compact-width review for the shipped custom-seed path
- at `360px` and `420px`
- across dashboard, Settings, provider detail, and popup

## Exit Criteria

- one repeatable compact-width custom-seed review script exists
- the review proves dashboard, Settings, provider detail, and popup remain overflow-free at `360px` and `420px`
- the review proves the saved custom seed remains coherent across all checked routes at those widths
- the review proves the Settings sticky top bar still behaves correctly after scroll
- screenshots plus machine-readable output are written

## Result

This phase is complete.

`Direction 05` now has:

- runtime theme-mode infrastructure from `Phase 98`
- cross-surface mode-resolution QA from `Phase 99`
- dark-surface-specific toned and supporting-surface QA from `Phase 100`
- the first shipped preset accent system plus repeatable preset-theme QA from `Phase 101`
- audit-hub theme alignment plus repeatable hydration-and-live-update QA from `Phase 102`
- the first validated custom-seed path plus repeatable cross-surface custom-seed QA from `Phase 103`
- repeatable popup-local plus audit-local accent QA from `Phase 104`
- repeatable popup plus audit non-accent surface-stability QA from `Phase 105`
- repeatable dashboard plus Settings plus provider-detail non-accent surface-stability QA from `Phase 106`
- repeatable compact-width custom-seed QA from `Phase 107`
