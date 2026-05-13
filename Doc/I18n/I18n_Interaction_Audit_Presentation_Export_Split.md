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
- `Phase 411` completed the Review Queue display-copy slice; `Phase 412` completed the Surface Card display-copy slice; `Phase 413` completed the Workspace Controls display-copy slice; `Phase 414` completed the Request Scope command-heading slice; `Phase 415` completed the Handoff Summary display-copy slice; `Phase 416` completed the frame-result typed display split; `Phase 417` completed typed frame-result 14-locale display copy

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

Remaining after `Phase 417`:

- surface-definition strings that are both visible UI copy and export/handoff source truth
- route feedback, accessibility labels, and import parse errors that still need typed presentation boundaries

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

Typed/raw split added after `Phase 416` and localized after `Phase 417`:

- frame readiness and preset result codes now have stable `code` values plus optional raw-message evidence; display localization is implemented through `interactionAudit.frameResults`
- `interactionAudit.frameResults` now maps the typed frame-readiness and preset-result codes to 14-locale display messages
- `rawMessage` remains raw selector/preset diagnostic evidence and is displayed separately as untranslated raw detail

## Safe Presentation-Only Labels

This section records the historical `Phase 409` migration plan. Review Queue, Surface Card chrome, Workspace Controls, Request Scope command headings, Handoff Summary, and typed frame-result display copy are now closed through `Phase 417`. The remaining candidate buckets are listed in the `Phase 418` inventory below.

## Phase 418 Remaining Inventory

| Bucket | Source | Classification | Safe next step |
| --- | --- | --- | --- |
| Surface titles, descriptions, action labels, action expectations, and manual checks | `src/sidepanel/interaction-audit-surfaces.ts` plus `interactionAudit.surfaceDefinitions` | mixed visible UI plus export/handoff source truth | completed in `Phase 421`; visible UI renders localized display copy while `INTERACTION_AUDIT_SIGNOFF_SURFACES`, JSON exports, signoff drafts, and handoff drafts stay on English source strings |
| Surface title usage in Review Queue and Handoff Summary | `src/sidepanel/components/InteractionAuditReviewQueueSection.tsx`, `src/sidepanel/components/InteractionAuditHandoffSummarySection.tsx` | UI display titles, not export evidence | completed in `Phase 421`; Review Queue and Handoff Summary render localized display titles while generated drafts keep source titles |
| Jump-to-surface feedback | `src/sidepanel/routes/InteractionAuditPage.tsx` | visible workspace feedback, not export-bound | completed in `Phase 419`; after `Phase 421`, dynamic surface titles render from the localized surface-definition display map |
| Grid and iframe accessibility labels | `src/sidepanel/components/InteractionAuditSurfaceGridSection.tsx`, `src/sidepanel/components/InteractionAuditSurfaceCard.tsx` | screen-reader-visible presentation copy | completed in `Phase 419`; route paths, iframe identity, and surface ids remain unchanged |
| Signoff import parse errors | `src/sidepanel/interaction-audit-signoff.ts` | visible workspace feedback from parser failures | completed in `Phase 420`; pasted JSON and parsed payload fields remain raw |
| Request binding fallback labels | `src/sidepanel/interaction-audit-signoff.ts` | currently shared by UI display and generated drafts | keep `none`, `not recorded`, and `sha256:` formatting raw until display and generated-draft paths are separated |
| Generated signoff and handoff Markdown | `src/sidepanel/interaction-audit-signoff.ts` | export evidence | do not localize in runtime copy; any future localized preview must be separate from downloadable draft content |
| Frame-action fallback `message` and `rawMessage` values | `src/sidepanel/interaction-audit-frame-actions.ts` | fallback plus raw selector/preset diagnostics | keep English fallback fields and raw diagnostics unchanged; `interactionAudit.frameResults` is the localized display layer |

Recommended follow-up order:

1. route feedback and accessibility labels, because they are presentation-only and low risk
2. typed import-error presentation, because parser errors need stable codes before localization
3. surface-definition display/source split, because those strings feed both UI and export evidence

`Phase 419` completed the route feedback and accessibility-label slice. `Phase 421` then moved dynamic surface-title display to the localized surface-definition map.

`Phase 420` completed typed import-error presentation. Parser failures now expose stable codes plus English fallback messages, and the route renders localized feedback from `interactionAudit.importErrors`.

`Phase 421` completed the surface-definition display/source split. Surface cards, Review Queue, Handoff Summary, iframe titles, and jump feedback now render `interactionAudit.surfaceDefinitions` display copy while signoff exports and generated Markdown drafts keep the original English source definitions.

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
- source `surface.id`, queue status enum values, signoff exports, and generated handoff drafts
- localized UI title from `interactionAudit.surfaceDefinitions`
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
- iframe identity, source route, and data hooks
- `surface.id`
- `surface.path`
- dimensions
- action ids and preset ids
- source `surface.title`, `surface.description`, `action.label`, `action.expectation`, and `manualChecks` for export and data attributes
- localized visible title, description, action text, and manual-check labels from `interactionAudit.surfaceDefinitions`

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
- manual-check evidence text in generated drafts and exports
- localized pending manual-check display text in the Handoff Summary UI only

## Mixed Labels Requiring A Typed Display Layer

These values are visible today but should not be translated by passing raw strings through a catalog. Completed buckets are kept here as closed examples; remaining buckets still need a typed result or separate display field first.

### Review Queue Status Labels

Source:

- `src/sidepanel/interaction-audit-review-queue.ts`

Status:

- closed in `Phase 411`
- queue labels and signoff labels now render from localized copy while the queue helper keeps stable enum values

Preserved split:

- keep `queueStatus` and `signoffStatus` as stable enum values
- keep ordering and next-target behavior as helper truth
- keep source surface ids and queue ordering source-bound
- render surface titles from `interactionAudit.surfaceDefinitions` in UI only

### Frame Readiness And Preset Result Messages

Source:

- `src/sidepanel/interaction-audit-frame-actions.ts`

Status:

- typed/raw split closed in `Phase 416`
- 14-locale typed display copy closed in `Phase 417`
- helper `message` values remain English fallback fields and `rawMessage` values remain untranslated diagnostics

Preserved split:

- keep typed result codes as display keys
- keep unknown result messages as fallback evidence
- do not translate selector, preset, or iframe identity failures; show them through `rawMessage`

### Surface Definition Copy

Source:

- `src/sidepanel/interaction-audit-surfaces.ts`
- `src/sidepanel/interaction-audit-signoff.ts`

Status:

- closed in `Phase 421`
- surface titles, descriptions, action labels, expectations, and manual checks now have a localized display map
- the source values still feed signoff exports and handoff drafts

Preserved split:

- keep export definitions and handoff drafts on the existing source-truth strings
- keep tests proving exported JSON and generated Markdown retain the existing English source values

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
- manual-check evidence text in generated drafts and exports
- frame-action `rawMessage` selector/preset diagnostics and English fallback `message` values

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

`Phase 417` added 14-locale display copy for typed frame readiness and preset result codes only. Raw-message evidence remains untranslated.

`Phase 418` inventoried the remaining interaction-audit presentation copy boundaries.

`Phase 419` localized route feedback and accessibility labels while preserving surface source strings, route paths, iframe sources, ids, presets, signoff exports, handoff drafts, and archive/request schemas.

`Phase 420` added typed signoff import-error codes and 14-locale display copy while preserving pasted JSON, parsed payload fields, accepted import compatibility, generated drafts, filenames, MIME types, storage keys, and request binding/revision formatting.

`Phase 421` added 14-locale surface-definition display copy while preserving source ids, data attributes, route paths, preset ids, signoff export JSON, signoff Markdown drafts, and handoff Markdown drafts.

No further interaction-audit display-copy child phase is currently selected.

Required tests for completed and later interaction-audit display-copy slices:

- review queue helper still returns stable status enums and ordering
- localized labels render from copy without changing `queueStatus`
- signoff export JSON remains unchanged
- handoff draft Markdown remains unchanged
- unknown/raw evidence strings remain raw
