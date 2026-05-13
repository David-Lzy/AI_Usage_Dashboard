# Phase 106 - Custom Seed Main Surface Stability Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Status:

- completed
- archived

## Objective

Prove the shipped custom-seed path changes only the intended accent roles while dashboard, Settings, and provider-detail non-accent surfaces stay visually stable.

## Why This Phase Existed

`Phase 103` had already shipped the first validated custom-seed input and the initial cross-surface propagation proof.

`Phase 104` had already shipped popup-local and audit-local accent-surface review.

`Phase 105` had already shipped popup and audit-hub non-accent surface-stability review.

That still left one important truth gap:

- the product could prove custom-seed propagation across the main surfaces
- and it could prove popup plus audit shell surfaces were stable
- but it had not yet proven that dashboard, Settings, and provider-detail neutral, supporting, and warning surfaces were *not* drifting at the same time

This phase existed to close that gap with the next smallest honest contract:

- one repeatable stability comparison between `default` and `custom`
- within the same explicit theme mode
- across dashboard, Settings, and provider-detail non-accent surfaces

## Exit Criteria

- dashboard, Settings, and provider detail expose stable selectors for the main neutral, warning, and supporting surfaces needed by the stability review
- one repeatable main-surface stability review script exists
- the review proves accent roles change while selected dashboard, Settings, and provider-detail non-accent surfaces stay stable
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
- repeatable dashboard plus Settings plus provider-detail non-accent surface-stability QA from `Phase 106`
