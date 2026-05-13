# Phase 419 - Interaction Audit Route Feedback A11y 14-Locale Copy

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- active after `Phase 418`
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

- Continue with typed signoff import-error presentation before the larger surface-definition display/source split.
