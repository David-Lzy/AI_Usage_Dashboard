# Phase 105 - Custom Seed Surface Stability Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Status:

- completed
- archived

## Objective

Prove the shipped custom-seed path changes only the intended accent roles while popup and audit-hub non-accent surfaces stay visually stable.

## Why This Phase Existed

`Phase 103` had already shipped the first validated custom-seed input and cross-surface propagation proof.

`Phase 104` had already shipped popup-local and audit-local accent-surface review, and it also normalized themed text-button rendering.

That still left one important truth gap:

- the product could show that accent roles moved with the saved seed
- but it had not yet proven that neutral, supporting, and warning surfaces in popup and audit hub were *not* drifting at the same time

This phase existed to close that gap with the smallest honest contract:

- one repeatable stability comparison between `default` and `custom`
- within the same explicit theme mode
- across popup and audit-hub non-accent surfaces

## Exit Criteria

- popup exposes stable selectors for the neutral and warning cards needed by the stability review
- one repeatable surface-stability review script exists
- the review proves accent roles change while selected popup and audit non-accent surfaces stay stable
- screenshots plus machine-readable output are written
- the review passes in both explicit light and explicit dark modes

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
