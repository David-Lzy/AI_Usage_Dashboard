# Interaction Audit Presentation And Export Split

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- created in `Phase 409`
- defines which remaining interaction-audit visible labels can be localized without changing signoff exports, handoff drafts, request identities, automation hooks, or raw evidence
- use this document before moving any remaining interaction-audit component strings into `buildOperatorWorkspaceLocalizedCopy`
- `Phase 411` completed the Review Queue display-copy slice; `Phase 412` completed the Surface Card display-copy slice; `Phase 413` completed the Workspace Controls display-copy slice; `Phase 414` completed the Request Scope command-heading slice; `Phase 415` completed the Handoff Summary display-copy slice; `Phase 416` completed the frame-result typed display split; typed frame-result localization is next

## Purpose

`Phase 404` localized the helper-owned interaction-audit shell, guidance, and signoff session copy for all 14 shipped runtime locales. Some visible interaction-audit labels still live in route and component files because they sit beside export, handoff, automation, or evidence data.

This reference separates:

- presentation-only labels that are safe to localize
- mixed labels that need a typed display layer before localization
- raw/export-bound values that must remain unchanged

## Current Runtime Boundary

Implementation entry points:

- `src/shared/operator-workspace-localized-copy.ts`
- `src/shared/localized-copy.ts`
- `src/sidepanel/routes/InteractionAuditPage.tsx`
- `src/sidepanel/components/InteractionAuditReviewQueueSection.tsx`
- `src/sidepanel/components/InteractionAuditSurfaceCard.tsx`
- `src/sidepanel/components/InteractionAuditWorkspaceControlsSection.tsx`
- `src/sidepanel/components/InteractionAuditRequestScopeSection.tsx`
- `src/sidepanel/components/InteractionAuditHandoffSummarySection.tsx`
- `src/sidepanel/interaction-audit-review-queue.ts`
- `src/sidepanel/interaction-audit-signoff.ts`
- `src/sidepanel/interaction-audit-surfaces.ts`
- `src/sidepanel/interaction-audit-frame-actions.ts`

Already localized through `Phase 404`:

- top bar labels
- hero copy
- guidance card copy
- signoff session summary labels and field labels
- request-scope labels sourced from the signoff copy bucket

Not localized in `Phase 409`:

- frame readiness and preset result display labels until `Phase 417` localizes the `Phase 416` typed result codes

Localized after `Phase 411`:

- Review Queue section labels, summary labels, status labels, signoff status labels, next-target actions, and pending-check display patterns

Localized after `Phase 412`:

- Surface Card chrome labels, status headings, loading fallback, manual-check heading, signoff option labels, notes label, and notes placeholder

Localized after `Phase 413`:

- Workspace Controls labels, import UI labels, workspace-state label, current-draft disclosure, and signoff-workspace feedback messages

Localized after `Phase 414`:

- Request Scope command headings for preflight, completion, and archive commands

Localized after `Phase 415`:

- Handoff Summary presentation labels, safe count patterns, workflow instructions, and handoff copy/download feedback

Typed/raw split added after `Phase 416`:

- frame readiness and preset result codes now have stable `code` values plus optional raw-message evidence; display localization is queued separately

## Safe Presentation-Only Labels

These labels can move into `buildOperatorWorkspaceLocalizedCopy(i18n).interactionAudit` as display copy in a later implementation phase. Moving them must not alter exported JSON, downloaded filenames, generated Markdown drafts, route ids, action ids, preset ids, or automation selectors.

### Review Queue

Source:

- `src/sidepanel/components/InteractionAuditReviewQueueSection.tsx`

Safe display copy:

- section label: `Review Queue`
- section description
- next-target button pattern: `Jump to {surfaceTitle}`
- all-ready button/summary labels
- summary labels: `Next target`, `Follow-up`, `Not reviewed`, `Pending-check surfaces`, `Ready`
- queue item metadata prefixes: `Signoff`, `Checks`, `Pending checks`
- jump action label: `Jump to surface`

Preserve:

- `data-audit-review-queue-*` attributes
- `surface.id`
- `surface.title` until surface definitions gain a separate localized display title
- queue status enum values: `follow_up`, `not_reviewed`, `pending_checks`, `ready`

### Surface Card Chrome

Source:

- `src/sidepanel/components/InteractionAuditSurfaceCard.tsx`

Safe display copy:

- `Audit Surface`
- `Open standalone`
- `Audit state`
- `Frame state`
- loading fallback: `Loading embedded frame for audit presets.`
- `Manual checks`
- `Surface signoff`
- select option labels for `not_reviewed`, `pass`, and `follow_up`
- `Operator notes`
- notes placeholder

Preserve:

- `data-audit-*` attributes
- iframe `title` until automation assertions are audited
- `surface.id`
- `surface.path`
- dimensions
- action ids and preset ids
- `surface.title`, `surface.description`, `action.label`, `action.expectation`, and `manualChecks` until display/export separation exists for surface definitions

### Workspace Controls

Source:

- `src/sidepanel/components/InteractionAuditWorkspaceControlsSection.tsx`
- `src/sidepanel/routes/InteractionAuditPage.tsx`

Safe display copy:

- copy/download/reset button labels
- import disclosure labels
- import textarea label and placeholder
- apply/clear import actions
- workspace feedback label: `Workspace state`
- signoff preview disclosure label
- route-owned feedback messages for local UI actions

Preserve:

- pasted JSON content
- export JSON field names
- Markdown draft content
- downloaded filename values
- MIME types
- parsed import error semantics from `parseInteractionAuditSignoffImport`

### Request-Scope Command Headings

Source:

- `src/sidepanel/components/InteractionAuditRequestScopeSection.tsx`

Safe display copy:

- `Preflight next`
- `Complete next`
- `Archive next`

Preserve:

- command text
- request id values
- request revision values
- archive path examples
- input filename examples

### Handoff Summary Presentation

Source:

- `src/sidepanel/components/InteractionAuditHandoffSummarySection.tsx`

Safe display copy:

- section label and description
- copy/download action labels
- summary labels: `Ready for signoff`, `Follow-up surfaces`, `Not reviewed`, `Pending checks`
- ready/not-ready presentation labels
- status note labels and descriptions
- group headings
- empty-state label `None`
- pending-check count patterns
- preview disclosure labels

Preserve:

- `handoffDraft` content
- operator notes
- surface ids
- generated bundle command
- manual-check evidence text until surface definitions gain display/export separation

## Mixed Labels Requiring A Typed Display Layer

These values are visible today but should not be translated by passing raw strings through a catalog. They need a typed result or separate display field first.

### Review Queue Status Labels

Source:

- `src/sidepanel/interaction-audit-review-queue.ts`

Current issue:

- queue labels and signoff labels are built as English strings inside the queue helper
- the helper output is currently presentation-oriented, but tests assert the English labels

Required split:

- keep `queueStatus` and `signoffStatus` as stable enum values
- move localized labels to the component or a presentation helper
- update tests so ordering and status enums are behavior truth while labels are display truth

### Frame Readiness And Preset Result Messages

Source:

- `src/sidepanel/interaction-audit-frame-actions.ts`

Current issue:

- readiness and preset-action helpers return English messages
- these messages are debugging/operator evidence for embedded-frame state

Required split:

- add typed result codes before localizing
- preserve unknown result messages as raw debugging evidence
- do not translate selector, preset, or iframe identity failures without a raw field beside the display message

### Surface Definition Copy

Source:

- `src/sidepanel/interaction-audit-surfaces.ts`
- `src/sidepanel/interaction-audit-signoff.ts`

Current issue:

- surface titles, descriptions, action labels, expectations, and manual checks are visible UI strings
- the same values also feed signoff exports and handoff drafts

Required split:

- add separate display fields or a localized presentation map
- keep export definitions and handoff drafts on the existing source-truth strings
- add tests proving exported JSON and generated Markdown retain the existing English source values

## Raw And Export-Bound Values

Do not translate these values:

- signoff export JSON schema fields
- generated signoff Markdown draft content
- generated handoff Markdown draft content
- request ids and request revisions
- archive ids and archive paths
- route hashes and route paths
- surface ids
- action ids and preset ids
- automation selectors and `data-*` attributes
- downloaded filenames
- MIME types
- imported JSON content
- operator notes entered by a reviewer
- manual-check evidence text until a display/export split is implemented
- frame-action raw failure messages until typed result codes exist

## Implementation Decision From Phase 409

`Phase 409` does not change runtime code. The remaining interaction-audit migration is broad enough that a runtime change should be implemented as a narrow child phase with focused tests.

The first safe child phase started with Review Queue display labels because:

- it is visible operator UI
- it has stable enum status values
- it can preserve sorting, next-target behavior, `data-*` hooks, and signoff/export payloads
- it can avoid touching surface definitions, frame-action raw messages, and generated handoff drafts

## Planned Next Runtime Slice

`Phase 411` moved Review Queue display labels into localized copy.

`Phase 412` moved Surface Card chrome labels into localized copy while preserving surface titles, descriptions, action labels, action expectations, manual checks, iframe titles, preset ids, action ids, and frame-action raw messages.

`Phase 413` moved Workspace Controls display labels and signoff-workspace feedback into localized copy while preserving pasted JSON, exported JSON field names, generated Markdown drafts, downloaded filenames, MIME types, and parsed import error semantics.

`Phase 414` moved Request Scope command headings into localized copy while preserving command text, request ids, request revisions, archive path examples, and input filename examples.

`Phase 415` moved Handoff Summary presentation labels and safe handoff feedback into localized copy while preserving handoff draft content, generated bundle command text, operator notes, surface ids, and manual-check evidence text.

`Phase 416` added stable typed result codes and optional raw-message evidence for frame readiness and preset results while keeping existing display messages unchanged.

The next safe child phase is `Phase 417`, covering 14-locale display copy for typed frame readiness and preset result codes only. Raw-message evidence must remain untranslated.

Required tests for completed and later interaction-audit display-copy slices:

- review queue helper still returns stable status enums and ordering
- localized labels render from copy without changing `queueStatus`
- signoff export JSON remains unchanged
- handoff draft Markdown remains unchanged
- unknown/raw evidence strings remain raw
