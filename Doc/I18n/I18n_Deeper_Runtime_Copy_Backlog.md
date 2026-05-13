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
- Popup first-run guidance, setup coverage, snapshot status, header, featured-section, featured-card, action-section, surface-role, and aria helper copy now has explicit 14-locale coverage through `Phase 392.4`.
- Settings core helper copy for layout, Quick Setup, preferences, and theme-customization buckets now has explicit 14-locale coverage through `Phase 393.1`.
- Settings credential helper copy now has explicit 14-locale coverage through `Phase 393.2.1`.
- Settings source-card and permission helper copy now has explicit 14-locale coverage through `Phase 393.2.2`.
- Provider Detail helper copy now has explicit 14-locale coverage through `Phase 393.3.1`.
- Provider-source display wrapper copy now has explicit 14-locale coverage through `Phase 393.3.2`.
- Deeper structured helper copy outside the popup, Settings, Provider Detail, and provider-source display slices still mostly uses explicit `zh-CN` branches plus English fallback for every other non-English locale.
- Locale registry, `rtl` mapping, runtime `lang`/`dir`, Chrome `_locales`, RDP locale validation, and store listing draft coverage are already guarded by `npm run i18n:check`.

## Translation Backlog

### P0 - Phase 392 Popup And New-User Guidance

Source bucket:

- `src/shared/popup-localized-copy.ts`

User-facing copy:

- `Phase 392.1` shipped explicit 14-locale coverage for guidance-card first-run titles, setup coverage, snapshot status, and header readiness copy
- `Phase 392.3` shipped explicit 14-locale coverage for featured-section summaries plus featured-card labels and actions
- `Phase 392.4` shipped explicit 14-locale coverage for action-section labels, surface-route notes, and aria copy

Reason:

- highest first-run exposure
- directly affects toolbar onboarding and new-user clarity
- mostly stable product copy, not raw provider evidence

Preserve:

- provider names and product names
- policy-only and partial-support wording
- route ids, action ids, and provider source truth

### P0 - Phase 393.1 Through 393.3.2 Settings And Provider Detail Helpers

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

- `Phase 392.1` translated the popup first-run guidance, setup coverage, snapshot status, and header buckets for all 14 runtime locales.
- `Phase 392.3` translated the popup featured-section and featured-card buckets for all 14 runtime locales.
- `Phase 392.4` translated the popup action-section, surface-role, and aria buckets for all 14 runtime locales.
- `Phase 393` split Settings/provider-detail work into three implementation phases before runtime code changes.
- `Phase 393.1` translated Settings layout, Quick Setup, preferences, and theme-customization buckets for all 14 runtime locales.
- `Phase 393.2` split Settings source-control work into credential and source/permission child phases before runtime code changes.
- `Phase 393.2.1` translated Settings credential buckets for all 14 runtime locales.
- `Phase 393.2.2` translated Settings source-card helper labels and permission buckets for all 14 runtime locales.
- `Phase 393.3` split Provider Detail and provider-source display wrapper work into child phases before runtime code changes.
- `Phase 393.3.1` translated Provider Detail buckets for all 14 runtime locales.
- `Phase 393.3.2` translated provider-source display wrapper buckets for all 14 runtime locales.
- Diagnostics, operator workspaces, and store helper routes remain follow-up work.

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
