# Phase 154 - Plan Expansion Into TODO Docs

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this file records the `Phase 154` closeout for the documentation-only planning slice that expanded the current roadmap into explicit next-step TODO docs

## Goal

Turn the newly agreed next-work plan into explicit roadmap TODO markdowns so later runtime implementation can proceed stepwise without reopening product strategy on every turn.

## Implemented

- created one new Direction 10 execution-ready child TODO for popup plus sidepanel plus full-page surface expansion and ambient theme controls:
  - [10_2_Surface_Expansion_And_Ambient_Theme_Controls_TODOs.md](../Roadmap/10_2_Surface_Expansion_And_Ambient_Theme_Controls_TODOs.md)
- created one new Direction 10 execution-ready child TODO for store asset-pack and submission follow-through:
  - [10_3_Store_Asset_Pack_And_Submission_TODOs.md](../Roadmap/10_3_Store_Asset_Pack_And_Submission_TODOs.md)
- created one new Direction 09 execution-ready child TODO for runtime i18n bootstrap plus pilot locales:
  - [09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md](../Roadmap/09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md)
- created one new Direction 05 execution-ready child TODO for theme-recovery real-operator closure:
  - [05_2_Theme_Recovery_Real_Operator_Closure_TODOs.md](../Roadmap/05_2_Theme_Recovery_Real_Operator_Closure_TODOs.md)
- created one new Direction 04 execution-ready child TODO for interaction-audit real-operator closure:
  - [04_2_Interaction_Audit_Real_Operator_Closure_TODOs.md](../Roadmap/04_2_Interaction_Audit_Real_Operator_Closure_TODOs.md)
- created one maintained reference for the agreed next surface contract:
  - [Surface_Expansion_And_Ambient_Theme_Controls.md](../Surface_Expansion_And_Ambient_Theme_Controls.md)
- updated the parent roadmap directions, the strategic index, the top-level backlog, and the phase index so those new TODO docs now form the official next-step map
- reordered the documented priority so the immediate next executable work is now the new Direction 10 surface-expansion plus ambient-theme line, followed by Direction 10 store asset follow-through and then Direction 09 i18n bootstrap
- clarified that Direction 05 and Direction 04 now mainly need real-operator evidence closure, not more lifecycle tooling

## Verification

- `npm run docs:check`
- `git diff --check`
- `npm run build`

## Result

The repo now has an explicit documentation-backed execution map for the next product, store-readiness, internationalization, and evidence-closure slices. This phase only expanded planning docs; it did not change runtime product behavior.
