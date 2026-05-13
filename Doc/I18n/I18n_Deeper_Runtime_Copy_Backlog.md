# I18n Deeper Runtime Copy Backlog

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- created in `Phase 391`
- update this backlog when deeper runtime copy moves from English fallback into reviewed 14-locale catalogs

## Purpose

Track runtime copy that still falls back to English after the 14-locale shell pilot, without weakening the raw-evidence boundaries that protect provider truth.

## Current Architecture

- `src/shared/runtime-message-catalogs.ts` has complete runtime message key coverage for the 14 shipped runtime locales.
- Every non-English locale has explicit first-shell runtime message overrides for dashboard, popup, Settings, common actions, and theme-toggle labels.
- Deeper structured helper copy still mostly uses explicit `zh-CN` branches plus English fallback for every other non-English locale.
- Locale registry, `rtl` mapping, runtime `lang`/`dir`, Chrome `_locales`, RDP locale validation, and store listing draft coverage are already guarded by `npm run i18n:check`.

## Translation Backlog

### P0 - Phase 392 Popup And New-User Guidance

Source bucket:

- `src/shared/popup-localized-copy.ts`

User-facing copy:

- guidance-card titles, descriptions, route labels, and action labels
- setup-coverage labels and first-run readiness language
- snapshot-status labels and stale/mixed/error summaries
- featured-section and featured-card summaries
- action-section labels and surface-route notes

Reason:

- highest first-run exposure
- directly affects toolbar onboarding and new-user clarity
- mostly stable product copy, not raw provider evidence

Preserve:

- provider names and product names
- policy-only and partial-support wording
- route ids, action ids, and provider source truth

### P0 - Phase 393 Settings And Provider Detail Helpers

Source buckets:

- `src/shared/settings-localized-copy.ts`
- `src/shared/provider-detail-localized-copy.ts`
- `src/shared/provider-source-display-localized-copy.ts`

User-facing copy:

- Settings Quick Setup and user-level helper text
- credential-card labels, placeholders, state chips, and footer text
- source-card preference labels, session-track helper text, and source-wrapper labels
- provider-detail section labels, note prefixes, status labels, and permission labels
- provider-source display wrappers generated from stable enum/helper state

Reason:

- Settings and provider detail are the next highest user-facing surfaces after popup
- source-wrapper labels are safe to translate when they are generated from repo-owned enums or helper state

Preserve:

- raw `warningReason`, `sourceSelectionReason`, `sourceFallbackReason`, adapter raw body text, URLs, host labels, route hints, and vendor-owned strings
- credential values, workspace ids, page snippets, and archive/export schema fields

### P1 - Diagnostics Presentation Follow-Up

Source bucket:

- `src/shared/provider-diagnostic-presentation.ts`

User-facing copy:

- typed diagnostic labels and short summaries for warning, source-selection, fallback, and adapter-error codes

Reason:

- useful for Settings and Provider Detail comprehension
- higher translation risk because the UI intentionally pairs localized summaries with raw evidence bodies

Preserve:

- all raw diagnostic body text
- archive/export diagnostic schemas
- unknown-code fallback behavior

Default next action:

- do not merge this into `Phase 393` unless the Settings/provider-detail copy expansion stays small after implementation starts

### P1 - Operator And Store Helper Follow-Up

Source buckets:

- `src/shared/operator-workspace-localized-copy.ts`
- `src/shared/store-workflow-localized-copy.ts`

User-facing copy:

- operator workspace shell, workflow helper copy, and action labels
- store screenshot helper route labels and submission-support captions

Reason:

- important for future QA and store workflows
- lower end-user exposure than popup, Settings, and provider detail

Preserve:

- evidence payloads, export field names, request ids, archive ids, fixture ids, filenames, preset ids, route hashes, automation titles, and final screenshot surfaces

### P2 - Explicitly Not Translated

Protected evidence:

- provider raw source-truth fields
- vendor page text and non-parseable vendor labels
- raw diagnostic bodies
- page-capture snippets
- archive/export payloads and schemas
- generated request, archive, fixture, route, preset, and filename identifiers

Reason:

- these values are evidence or compatibility data, not product UI copy
- translating them would make debugging and historical review less truthful

## Phase Mapping

- `Phase 392` should translate the popup/new-user guidance bucket for all 14 runtime locales.
- `Phase 393` should translate Settings, provider-detail, and provider-source wrapper buckets for all 14 runtime locales.
- Diagnostics, operator workspaces, and store helper routes should remain follow-up work unless `Phase 392` or `Phase 393` proves small enough to split safely.

## Verification Pattern

Every deeper-copy implementation phase should run:

- `npm run i18n:check`
- focused localized-copy tests for the touched helper
- focused view-model tests when a helper feeds view models
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Open Boundary

The current backlog does not require professional translation review before commit. It assumes machine draft plus glossary discipline and focused human/visual spot checks for representative locales, especially `ja`, `de`, and `ar`.
