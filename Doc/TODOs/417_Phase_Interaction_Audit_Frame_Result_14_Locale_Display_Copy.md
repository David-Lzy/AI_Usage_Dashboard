# Phase 417 - Interaction Audit Frame Result 14-Locale Display Copy

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- active after `Phase 416`
- next child implementation phase from [I18n_Interaction_Audit_Presentation_Export_Split.md](../I18n/I18n_Interaction_Audit_Presentation_Export_Split.md)

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

- After this slice, review whether any remaining interaction-audit text is still hard-coded presentation copy or intentionally raw evidence.
