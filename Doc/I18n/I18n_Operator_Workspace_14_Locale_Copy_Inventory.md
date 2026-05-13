# Operator Workspace 14-Locale Copy Inventory

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- created in `Phase 402`
- implementation input for `Phase 404`
- `Phase 404` completed the helper-owned bucket implementation; consumer-only labels remain follow-up unless a later phase moves them without touching export/evidence contracts
- `Phase 409` adds a maintained presentation/export split for the remaining interaction-audit consumer labels: [I18n_Interaction_Audit_Presentation_Export_Split.md](./I18n_Interaction_Audit_Presentation_Export_Split.md)
- `Phase 411` completed Review Queue display labels with 14-locale copy while preserving queue status enums and export payloads
- `Phase 412` completed Surface Card chrome labels with 14-locale copy while preserving surface definitions, manual checks, frame identity, and export payloads
- `Phase 413` completed Workspace Controls display labels and signoff-workspace feedback with 14-locale copy while preserving pasted JSON, parsed import errors, generated exports, filenames, MIME types, and request identity formatting
- `Phase 414` completed Request Scope command headings with 14-locale copy while preserving generated command text, request ids, request revisions, archive path examples, input filename examples, and export payloads
- `Phase 415` completed Handoff Summary presentation labels and safe handoff feedback with 14-locale copy while preserving handoff draft content, generated bundle command text, operator notes, surface ids, surface titles, manual-check evidence, filenames, MIME types, and signoff export schemas
- `Phase 416` completed the frame-result typed display split with stable result codes and optional raw-message evidence while preserving existing display messages and runtime behavior
- `Phase 417` completed frame-result 14-locale display copy for those typed codes while preserving raw selector/preset diagnostics as untranslated raw detail
- `Phase 418` classifies the remaining interaction-audit strings into route feedback/accessibility labels, typed import-error presentation, and surface-definition display/source split candidates
- `Phase 419` completes route feedback and accessibility-label localization, and `Phase 421` moves dynamic surface-title display to localized surface-definition copy
- `Phase 420` completes typed signoff import-error localization while keeping pasted JSON and parsed payload fields raw
- `Phase 421` completes surface-definition display/source splitting while keeping signoff export JSON and generated Markdown drafts on English source strings

## Purpose

Define the safe 14-locale implementation boundary for operator-workspace runtime copy, covering the interaction-audit and theme-recovery helper routes without translating evidence payloads, export schemas, request identities, route identities, preset identities, filenames, fixture ids, or generated command text.

## Current Runtime State

- `src/shared/operator-workspace-localized-copy.ts` has explicit helper-owned copy for all 14 runtime locales after `Phase 404`.
- `src/shared/localized-copy.ts` re-exports `buildOperatorWorkspaceLocalizedCopy`; this public path must remain stable.
- `src/shared/operator-workspace-localized-copy.test.ts` guards every shipped locale, representative Arabic copy, Simplified Chinese, English, and the legacy re-export path.
- The helper feeds:
  - `src/sidepanel/routes/InteractionAuditPage.tsx`
  - `src/sidepanel/routes/ThemeRecoveryReviewPage.tsx`
  - focused interaction-audit and theme-recovery route components under `src/sidepanel/components/`
- Several operator-route labels still live in route/component files instead of the shared helper. They are visible UI copy, but some are adjacent to archive/export evidence and should move carefully.

## Phase 404 Implemented Helper Buckets

These buckets are stable product UI copy and received explicit copy for all 14 shipped runtime locales in `Phase 404`:

- `interactionAudit.topbar`
  - title, subtitle, dashboard/settings actions
- `interactionAudit.hero`
  - eyebrow, title, explanatory detail, chip
- `interactionAudit.guidance`
  - title block, review checklist, dashboard/settings/popup open actions
- `interactionAudit.signoff`
  - session summary labels
  - reviewer/session/reviewed-at field labels and placeholders
  - request binding labels
  - bound/ad-hoc workspace explanatory copy
  - download identity copy
- `themeRecovery.topbar`
  - title, subtitle, refresh/settings actions
- `themeRecovery.hero`
  - eyebrow, title, explanatory detail, chip
- `themeRecovery.loading` and `themeRecovery.error`
  - loading and load-failure labels
- `themeRecovery.currentTruth`
  - card labels for review stage, popup snapshot, and action badge
- `themeRecovery.themeState`
  - saved-theme labels, not-set fallback, badge-source fallback, note prefixes
- `themeRecovery.requestScope`
  - repo-backed/ad-hoc request labels and explanatory copy
- `themeRecovery.workflow`
  - workflow headings, steps, and link-group labels
- `themeRecovery.links`
  - extension-surface and vendor-session link labels
- `themeRecovery.outputs`
  - output card labels, copy/download actions, success/failure feedback, workspace-note label

## Consumer Copy To Migrate Into The Helper

The following hard-coded visible UI strings are split between completed narrow slices and remaining follow-up work. Remaining labels can move into `buildOperatorWorkspaceLocalizedCopy` in a later phase if the implementation stays presentation-only and does not change route behavior or export/evidence payloads.

### Interaction Audit Review Queue - Completed In Phase 411

Source:

- `src/sidepanel/components/InteractionAuditReviewQueueSection.tsx`
- `src/sidepanel/interaction-audit-review-queue.ts`

Translatable display copy:

- section label and description
- `Jump to {surfaceTitle}` button pattern and `All surfaces ready`
- summary labels: next target, follow-up, not reviewed, pending-check surfaces, ready
- queue item metadata prefixes: signoff, checks, pending checks
- queue status labels: follow-up required, not reviewed, pending checks, ready

Preserve:

- surface ids
- queue status enum values
- surface titles when they are still sourced from evidence definitions

### Interaction Audit Surface Card - Completed In Phase 412

Source:

- `src/sidepanel/components/InteractionAuditSurfaceCard.tsx`

Translatable display copy:

- `Audit Surface`
- `Open standalone`
- `Audit state`, `Frame state`, `Loading embedded frame for audit presets.`
- `Manual checks`
- `Surface signoff`
- select option labels for not reviewed, pass, follow-up required
- `Operator notes`
- notes placeholder

Preserve:

- `data-*` attributes
- iframe titles if they are used by automation assertions
- surface ids, dimensions, paths, action ids, and preset ids

### Interaction Audit Workspace Controls - Completed In Phase 413

Source:

- `src/sidepanel/components/InteractionAuditWorkspaceControlsSection.tsx`
- feedback messages in `src/sidepanel/routes/InteractionAuditPage.tsx`

Translatable display copy:

- copy/download/reset buttons
- import signoff JSON summary, labels, placeholder, apply/clear actions
- workspace-state feedback label
- current signoff draft summary
- copy/download/import/reset success and failure messages

Preserve:

- imported JSON content
- downloaded filename values
- MIME types
- export schema field names
- parsed error semantics

### Interaction Audit Request Scope Commands - Completed In Phase 414

Source:

- `src/sidepanel/components/InteractionAuditRequestScopeSection.tsx`

Translatable display copy:

- command block labels: preflight next, complete next, archive next

Preserve:

- `npm run ...` command text
- request id and request revision values
- archive path and input filename examples

### Interaction Audit Handoff Summary - Completed In Phase 415

Source:

- `src/sidepanel/components/InteractionAuditHandoffSummarySection.tsx`

Translatable display copy:

- section label and explanatory text
- copy/download actions
- summary labels and ready/not-ready presentation
- group headings and empty-state labels
- detail labels for pending checks and workflow instructions
- preview summary labels

Preserve:

- `handoffDraft` content
- operator notes
- surface ids
- manual-check evidence text in generated drafts and exports
- generated bundle command

### Theme Recovery Provider List Prefixes

Source:

- `src/sidepanel/components/ThemeRecoveryProviderList.tsx`

Translatable display copy:

- `Source detail:` prefix

Preserve:

- provider labels
- provider source-state labels/details sourced from provider view models
- recovery labels/details currently serialized into the review export

## Deferred Or Protected From Phase 404

These values are either raw evidence, automation identity, export content, or mixed presentation/export content. Do not translate them in `Phase 404` unless a dedicated compatibility split separates display copy from persisted/exported evidence.

- `INTERACTION_AUDIT_SURFACES` ids, paths, dimensions, and action ids.
- `INTERACTION_AUDIT_SURFACES` titles, descriptions, action labels, expectations, and manual checks when they are written into signoff exports or handoff drafts.
- `interaction-audit-signoff.ts` JSON shape and Markdown draft/handoff body text.
- `formatInteractionAuditSignoffRequestBinding()` and `formatInteractionAuditSignoffRequestRevision()` fallback strings when used inside exported drafts.
- `interaction-audit-frame-actions.ts` selector logic and preset ids.
- `runAuditPreset()` and `getAuditSurfaceReadiness()` English result messages unless they are first converted to typed result codes with a localized presentation layer.
- `theme-recovery-review.ts` snapshot labels/details when serialized into summary or JSON export, including recovery stage labels, scope labels, provider recovery details, popup snapshot labels, action-badge summary lines, and host-access labels.
- Provider view-model values such as provider label, current source label, current source-state label/detail, last sync label, warning reason, raw diagnostic bodies, source-selection/fallback strings, and action-badge text/title.
- Request ids, archive ids, fixture ids, filenames, route hashes, preset ids, command strings, URLs, SHA values, and generated evidence strings.

## Phase 404 Implementation Checklist

1. Keep `buildOperatorWorkspaceLocalizedCopy(i18n)` and the `src/shared/localized-copy.ts` re-export stable.
2. Replace the current `resolvedLocale === "zh-CN"` branch with a locale catalog or structured map for all 14 runtime locales.
3. Include explicit `en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es-419`, `pt-BR`, `fr`, `de`, `it`, `ru`, `ar`, `hi`, and `id` entries for the approved helper buckets.
4. Migrate the listed consumer-only display labels into the helper only where doing so does not alter export payloads, command text, route ids, or automation selectors.
5. Keep product and provider names unchanged: AI Usage Dashboard, Chrome, Cursor, Codex, Claude Code, Gemini, JetBrains.
6. Do not strengthen claims about provider support, native prompts, real vendor sessions, or screenshot/review completion.
7. Add tests proving representative non-English and Arabic operator-workspace copy does not fall back to English for the approved buckets.
8. Add or preserve tests proving export filenames, request-context formatting, route ids, action ids, and JSON schema fields stay unchanged.

## Planned Verification For Phase 404

- `npm run i18n:check`
- `npm run test -- src/shared/operator-workspace-localized-copy.test.ts`
- focused interaction-audit or theme-recovery tests if component props or helpers change
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up Boundary

If `Phase 404` cannot move all consumer-only labels without touching export/evidence contracts, it should prioritize `src/shared/operator-workspace-localized-copy.ts` helper-owned buckets first and leave a follow-up TODO for a typed presentation/export split.

`Phase 409` completed that split as documentation-only planning.

`Phase 411` completed the Review Queue slice. `Phase 412` completed the Surface Card slice. `Phase 413` completed the Workspace Controls slice. `Phase 414` completed the Request Scope command-heading slice. `Phase 415` completed the Handoff Summary slice. `Phase 416` completed the typed frame-result display/raw split. `Phase 417` completed typed frame-result localization using that split. `Phase 418` inventoried the remaining hard-coded interaction-audit presentation copy before more implementation slices. `Phase 419` completed route feedback and accessibility-label localization. `Phase 420` completed typed import-error localization. `Phase 421` completed surface-definition display/source splitting with export-preserving tests.
