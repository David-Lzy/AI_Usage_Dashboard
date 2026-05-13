# Phase 419 - Interaction Audit Route Feedback A11y 14-Locale Copy

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed on 2026-05-14
- archived after `Phase 419`
- first implementation slice from the remaining interaction-audit presentation-copy inventory

## Goal

Localize interaction-audit route feedback and accessibility-only labels for all 14 runtime locales without touching export evidence or surface definitions.

## Scope

- Add focused copy for jump-to-surface feedback in `InteractionAuditPage`.
- Localize the interaction-audit surface-grid `aria-label`.
- Localize the iframe title suffix currently rendered as `{surface.title} audit frame`.
- Keep dynamic surface titles source-bound until the later surface-definition display/source split.

## Preserved Boundaries

- Do not translate surface titles, descriptions, action labels, expectations, or manual checks in this phase.
- Do not change route paths, iframe sources, surface ids, action ids, preset ids, `data-*` hooks, signoff exports, handoff drafts, or archive/request schemas.
- Do not change jump-to-surface behavior; only display feedback and accessibility labels move to localized copy.

## Acceptance

- Route feedback and a11y labels have explicit copy for all 14 runtime locales.
- Jump feedback still includes the selected surface title without rewriting source-bound title values.
- Tests cover English, one non-English locale, and the all-locale completeness path.

## Planned Verification

- `npm run i18n:check`
- focused operator-workspace localized-copy tests
- focused interaction-audit route/component tests if present or added
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- `Phase 420` should continue with typed signoff import-error presentation before the larger surface-definition display/source split.

## Completion Summary

- Added 14-locale `interactionAudit.routeFeedback` copy for missing-surface and jumped-to-surface workspace feedback.
- Added 14-locale `interactionAudit.accessibility` copy for the surface-grid `aria-label` and iframe title suffix.
- Updated the interaction-audit route, grid section, and surface card to render those localized labels without changing surface titles, descriptions, action labels, expectations, manual checks, route paths, iframe sources, ids, presets, signoff exports, handoff drafts, or archive/request schemas.
- Preserved dynamic surface titles as source-bound values until the later surface-definition display/source split.

## Verification

- `npm run i18n:check`
- `npm run test -- src/shared/operator-workspace-localized-copy.test.ts`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
