# Phase 413 - Interaction Audit Workspace Controls Display Copy

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- active after `Phase 412`
- next child implementation phase from [I18n_Interaction_Audit_Presentation_Export_Split.md](../I18n/I18n_Interaction_Audit_Presentation_Export_Split.md)

## Goal

Move the interaction-audit Workspace Controls display labels and route-owned feedback messages into 14-locale presentation copy without changing imported JSON, exported JSON, Markdown drafts, filenames, MIME types, parsed import errors, or clipboard/download behavior.

## Scope

- Add a focused `interactionAudit.workspaceControls` copy bucket under `buildOperatorWorkspaceLocalizedCopy`.
- Move stable button/disclosure labels:
  - copy/download signoff draft buttons
  - copy/download signoff JSON buttons
  - reset signoff button
  - import disclosure, textarea label, placeholder, apply/clear actions
  - workspace-state label
  - current signoff draft disclosure
- Move route-owned feedback messages from `InteractionAuditPage.tsx` only when they are presentation-only.

## Preserved Boundaries

- Do not translate pasted JSON content, exported JSON field names, generated Markdown draft content, generated handoff content, downloaded filename values, MIME types, or parsed import error semantics.
- Do not change clipboard unavailable-vs-failed branching.
- Do not change download helper behavior.
- Do not change signoff storage keys, signoff schema, request binding, or request revision formatting.

## Acceptance

- Workspace Controls visible labels and safe feedback messages have explicit coverage for all 14 runtime locales.
- Signoff export JSON, signoff draft Markdown, and handoff draft Markdown remain unchanged.
- Import parse errors remain raw unless a separate typed parser error presentation split is added.

## Planned Verification

- `npm run i18n:check`
- focused operator-workspace localized-copy tests
- focused interaction-audit signoff/export tests
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Later phases may localize Request-Scope command headings and Handoff Summary presentation labels if they preserve raw/export evidence boundaries.
