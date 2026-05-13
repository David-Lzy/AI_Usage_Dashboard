# Phase 111 - Custom Seed Extension-Mode Recovered-State Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Status:

- completed
- archived

## Objective

Prove the shipped custom-seed path survives one real MV3 extension runtime recovery flow for the shipped Cursor and Codex session-page providers.

## Why This Phase Existed

`Phase 103` had already shipped the first validated custom-seed input and the first cross-surface propagation proof.

`Phase 104` through `Phase 108` had already covered local accent surfaces, non-accent surface stability, compact widths, and provider-state-specific semantics.

`Phase 109` had already covered one deterministic seeded recovered-state path.

`Phase 110` had already covered one preview-interaction recovered-state path through shipped Settings controls.

That still left one remaining truth gap:

- the product could prove seeded and preview-only recovery paths
- but it had not yet proven that the same custom-seed contract survives a real extension runtime with:
  - `chrome.permissions`
  - `chrome.tabs`
  - `chrome.scripting`
  - `chrome.action`
  - unpacked `dist/`

This phase existed to close that gap with the next smallest honest contract:

- one repeatable extension-mode review
- synthetic vendor tabs instead of claimed real live sessions
- pre-granted optional host origins instead of claimed native prompt completion
- explicit proof that warning states return to healthy states without theme drift across settings, dashboard, popup, detail, and action badge

## Exit Criteria

- one repeatable extension-mode recovered-state custom-seed review script exists
- the review uses the real unpacked extension from `dist/`
- the review proves the real extension runtime can observe degraded and recovered host-permission states
- the review proves Cursor and Codex session-page surfaces recover under the same saved custom seed
- the review proves action badge, settings, dashboard, popup, and provider detail agree on the same recovery outcome
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
- repeatable provider-state-specific custom-seed QA from `Phase 108`
- repeatable seeded recovered-state custom-seed QA from `Phase 109`
- repeatable preview-interaction recovered-state custom-seed QA from `Phase 110`
- repeatable extension-mode recovered-state custom-seed QA from `Phase 111`

## Remaining Honest Gap

`Phase 111` does not claim:

- native host-permission prompt completion in headless Chromium
- real live vendor sessions
- operator GUI signoff for the extension-mode recovery path

The current truth after this phase is narrower and better:

- extension-mode runtime recovery is now proven with real MV3 APIs plus synthetic vendor tabs
- native prompt and real-session operator recovery remain future work
