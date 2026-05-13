# Phase 412 - Interaction Audit Surface Card Display Copy

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed on `2026-05-14`
- next child implementation phase from [I18n_Interaction_Audit_Presentation_Export_Split.md](../../../../I18n/I18n_Interaction_Audit_Presentation_Export_Split.md)
- closeout archived after moving Surface Card chrome labels into 14-locale operator copy

## Goal

Move the interaction-audit Surface Card chrome labels into 14-locale presentation copy without translating surface definitions, manual-check evidence text, action labels, action expectations, route ids, action ids, preset ids, iframe identity, or automation hooks.

## Scope

- Add a focused `interactionAudit.surfaceCard` copy bucket under `buildOperatorWorkspaceLocalizedCopy`.
- Move only the stable card chrome labels:
  - `Audit Surface`
  - `Open standalone`
  - `Audit state`
  - `Frame state`
  - loading fallback text
  - `Manual checks`
  - `Surface signoff`
  - select option display labels
  - `Operator notes`
  - notes placeholder
- Keep `src/sidepanel/interaction-audit-surfaces.ts` surface titles, descriptions, action labels, expectations, and manual-check text unchanged.

## Preserved Boundaries

- Do not translate signoff exports, handoff drafts, operator notes, request ids, archive ids, route hashes, action ids, preset ids, data attributes, iframe titles, downloaded filenames, or manual-check evidence text.
- Do not change surface dimensions, paths, action behavior, frame readiness checks, or preset execution behavior.
- Do not change signoff status enum values.

## Acceptance

- Surface Card chrome labels have explicit coverage for all 14 runtime locales.
- Surface definition strings and generated signoff/handoff output remain unchanged.
- Frame readiness and preset result messages remain raw until a typed display/raw split exists.

## Planned Verification

- `npm run i18n:check`
- focused operator-workspace localized-copy tests
- focused interaction-audit signoff/export tests
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Later phases may localize Workspace Controls, Request-Scope command headings, and Handoff Summary presentation labels if they preserve raw/export evidence boundaries.

## Completion Summary

`Phase 412` moved Surface Card chrome labels into `buildOperatorWorkspaceLocalizedCopy(i18n).interactionAudit.surfaceCard` with explicit copy for all 14 runtime locales.

Delivered:

- localized stable Surface Card chrome labels: section label, open-standalone action, status labels, loading fallback, manual-checks heading, signoff field label, signoff option display labels, notes label, and notes placeholder
- updated `InteractionAuditSurfaceCard` and `InteractionAuditSurfaceGridSection` to receive display copy from the route
- preserved surface titles, descriptions, action labels, action expectations, manual-check text, iframe title, surface ids, dimensions, paths, data attributes, action ids, preset ids, frame readiness raw messages, signoff exports, and generated handoff drafts
- queued [413_Phase_Interaction_Audit_Workspace_Controls_Display_Copy.md](./413_Phase_Interaction_Audit_Workspace_Controls_Display_Copy.md) as the next narrow interaction-audit display-copy slice

## Verification

- `npm run test -- src/shared/operator-workspace-localized-copy.test.ts src/sidepanel/interaction-audit-signoff.test.ts`
- `npm run typecheck`
- `npm run i18n:check`
- `npm run docs:check`
- `git diff --check`
