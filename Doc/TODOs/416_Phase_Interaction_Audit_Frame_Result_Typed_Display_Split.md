# Phase 416 - Interaction Audit Frame Result Typed Display Split

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- active after `Phase 415`
- next child implementation phase from [I18n_Interaction_Audit_Presentation_Export_Split.md](../I18n/I18n_Interaction_Audit_Presentation_Export_Split.md)

## Goal

Add a typed display/raw split for interaction-audit frame readiness and preset result messages so future localization can translate stable presentation labels without rewriting raw browser, DOM, selector, or action failure evidence.

## Scope

- Audit `src/sidepanel/interaction-audit-frame-actions.ts` result messages and `InteractionAuditSurfaceCard` status rendering.
- Introduce stable result codes or typed status categories only where the current message is repo-owned and presentation-safe.
- Keep raw failure details available when the browser, iframe, selector, preset action, or DOM state returns diagnostic text.
- Update tests to prove result codes and raw messages remain separate.

## Preserved Boundaries

- Do not translate raw browser errors, DOM text, selector names, iframe identity, action ids, preset ids, route paths, or manual-check evidence.
- Do not change preset execution behavior, readiness polling behavior, iframe load behavior, signoff exports, handoff drafts, or archive/request schemas.
- Do not add localized copy until the typed/raw boundary is clear enough to protect evidence fields.

## Acceptance

- Frame readiness and preset results have a documented typed/raw split.
- Existing raw diagnostic messages remain visible or recoverable.
- Tests cover at least one ready state, one presentation-safe failure, and one raw-detail failure.
- A follow-up implementation TODO can safely localize typed result display labels after this split.

## Planned Verification

- focused interaction-audit frame-action tests
- focused operator-workspace localized-copy tests if display copy is touched
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- After this split, localize only typed frame readiness and preset result display labels. Keep raw evidence details unlocalized.
