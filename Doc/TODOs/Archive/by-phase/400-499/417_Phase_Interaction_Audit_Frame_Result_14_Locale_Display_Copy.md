# Phase 417 - Interaction Audit Frame Result 14-Locale Display Copy

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed on 2026-05-14
- archived after `Phase 417`
- next child implementation phase from [I18n_Interaction_Audit_Presentation_Export_Split.md](../../../../I18n/I18n_Interaction_Audit_Presentation_Export_Split.md)

## Goal

Localize interaction-audit frame readiness and preset result display labels for all 14 runtime locales using the typed result codes from `Phase 416`, while preserving raw diagnostic details as untranslated evidence.

## Scope

- Add a focused `interactionAudit.frameResults` copy bucket under `buildOperatorWorkspaceLocalizedCopy`.
- Map `AuditFrameReadinessCode` and `AuditPresetResultCode` values to localized display messages.
- Render localized display text in `InteractionAuditSurfaceCard` or a presentation helper.
- Keep `rawMessage` available and unlocalized when present.

## Preserved Boundaries

- Do not translate `rawMessage`, selector names, action ids, preset ids, route paths, iframe identity, DOM text, or browser errors.
- Do not change preset execution behavior, readiness polling behavior, iframe behavior, signoff exports, handoff drafts, or archive/request schemas.
- Do not remove the existing English `message` fallback until tests prove typed display coverage is complete.

## Acceptance

- Typed frame readiness and preset result display messages have explicit coverage for all 14 runtime locales.
- Raw diagnostic details remain visible or recoverable and untranslated.
- Existing `message` fields remain compatible fallback text.
- Tests cover localized ready, waiting, action success, typed failure, and raw-detail failure display.

## Planned Verification

- `npm run i18n:check`
- focused operator-workspace localized-copy tests
- focused interaction-audit frame-action tests
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- `Phase 418` should review whether any remaining interaction-audit text is still hard-coded presentation copy or intentionally raw evidence.

## Completion Summary

- Added `interactionAudit.frameResults` 14-locale copy for frame readiness and preset result codes.
- Moved frame result code unions into a shared type file so the frame-action helper and localized-copy registry use the same stable contract.
- Added a presentation helper that renders localized display text from typed codes while preserving existing English `message` fallback values.
- Kept `rawMessage` untranslated and visible as raw detail evidence when selector, preset, or readiness diagnostics are present.
- Updated the interaction-audit route and surface card to show localized frame-result status without changing iframe readiness, preset execution, signoff exports, handoff drafts, or archive/request schemas.

## Verification

- `npm run test -- src/shared/operator-workspace-localized-copy.test.ts src/sidepanel/interaction-audit-frame-actions.test.ts src/sidepanel/interaction-audit-frame-result-presentation.test.ts`
- `npm run typecheck`
- `npm run i18n:check`
- `npm run docs:check`
- `git diff --check`
