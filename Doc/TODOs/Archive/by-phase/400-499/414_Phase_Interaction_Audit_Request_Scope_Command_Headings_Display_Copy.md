# Phase 414 - Interaction Audit Request Scope Command Headings Display Copy

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
- closeout archived after moving Request Scope command headings into 14-locale operator copy

## Goal

Move the interaction-audit Request Scope command headings into 14-locale presentation copy without changing command text, request identity, request revision, archive path examples, input filename examples, or exported signoff content.

## Scope

- Add focused request-scope command heading fields under `buildOperatorWorkspaceLocalizedCopy(i18n).interactionAudit`.
- Move only these stable display headings:
  - `Preflight next`
  - `Complete next`
  - `Archive next`
- Keep the generated `npm run ...` command strings in `InteractionAuditRequestScopeSection` unchanged.

## Preserved Boundaries

- Do not translate or rewrite command text.
- Do not change request id values, request revision values, archive path examples, input filename examples, or request-scope mode detection.
- Do not change signoff export JSON, signoff draft Markdown, handoff draft Markdown, downloaded filenames, or MIME types.

## Acceptance

- Request Scope command headings have explicit coverage for all 14 runtime locales.
- Command strings remain byte-for-byte equivalent for the same request context.
- Request Scope still receives its existing signoff copy bucket for request binding and download-identity labels.

## Planned Verification

- `npm run i18n:check`
- focused operator-workspace localized-copy tests
- focused interaction-audit signoff/export tests
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Later phases may localize Handoff Summary presentation labels if they preserve handoff draft content, generated bundle command text, operator notes, surface ids, and manual-check evidence text.

## Completion Summary

`Phase 414` moved Request Scope command headings into `buildOperatorWorkspaceLocalizedCopy(i18n).interactionAudit.requestScopeCommands` with explicit copy for all 14 runtime locales.

Delivered:

- localized `Preflight next`, `Complete next`, and `Archive next` headings for all shipped runtime locales
- updated `InteractionAuditRequestScopeSection` to receive heading copy separately from the existing signoff/request binding copy bucket
- preserved generated `npm run ...` command strings, request id values, request revision values, archive path examples, input filename examples, signoff export JSON, signoff draft Markdown, handoff draft Markdown, filenames, and MIME types
- queued [415_Phase_Interaction_Audit_Handoff_Summary_Display_Copy.md](../../../415_Phase_Interaction_Audit_Handoff_Summary_Display_Copy.md) as the next narrow interaction-audit display-copy slice

## Verification

- `npm run test -- src/shared/operator-workspace-localized-copy.test.ts src/sidepanel/interaction-audit-signoff.test.ts`
- `npm run typecheck`
- `npm run i18n:check`
- `npm run docs:check`
- `git diff --check`
