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
- Typed diagnostic presentation copy now has explicit 14-locale coverage for warning, source-selection, source-fallback, and adapter-error diagnostics through `Phase 400`.
- Operator-workspace helper-owned copy now has explicit 14-locale coverage through `Phase 404`; consumer-only interaction-audit labels next to export/automation boundaries are moving in narrow follow-up slices, with Review Queue, Surface Card, Workspace Controls, Request Scope command headings, Handoff Summary, frame-result typed display split, and frame-result 14-locale display copy completed through `Phase 417`.
- The interaction-audit consumer-label follow-up now has a presentation/export split reference from `Phase 409`: [I18n_Interaction_Audit_Presentation_Export_Split.md](./I18n_Interaction_Audit_Presentation_Export_Split.md).
- Interaction-audit Review Queue display labels have explicit 14-locale coverage through `Phase 411`; Surface Card chrome labels have explicit 14-locale coverage through `Phase 412`; Workspace Controls labels and signoff-workspace feedback have explicit 14-locale coverage through `Phase 413`; Request Scope command headings have explicit 14-locale coverage through `Phase 414`; Handoff Summary presentation labels and safe feedback have explicit 14-locale coverage through `Phase 415`; frame readiness and preset result messages have a typed display/raw split through `Phase 416`; 14-locale typed display copy is complete through `Phase 417`.
- Store-helper copy now has explicit 14-locale coverage through `Phase 405` while screenshot workflow evidence and automation identity fields remain raw.
- Store-helper visible error presentation now has explicit 14-locale wrappers through `Phase 410`, with raw helper error text preserved inside the wrapper.
- Deeper structured helper copy outside the popup, Settings, Provider Detail, provider-source display, typed diagnostic presentation, operator-workspace helper, and store-helper slices still mostly uses explicit `zh-CN` branches plus English fallback for every other non-English locale.
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
- `src/shared/provider-diagnostic-warning-copy.ts`
- `src/shared/provider-diagnostic-source-copy.ts`
- `src/shared/provider-diagnostic-adapter-error-copy.ts`
- [I18n_Diagnostic_Presentation_14_Locale_Inventory.md](./I18n_Diagnostic_Presentation_14_Locale_Inventory.md)

User-facing copy:

- typed warning diagnostic labels and summaries already have explicit 14-locale coverage after `Phase 398`
- typed source-selection and source-fallback labels and summaries already have explicit 14-locale coverage after `Phase 399`
- typed adapter-error diagnostic labels and summaries already have explicit 14-locale coverage after `Phase 400`

Reason:

- useful for Settings and Provider Detail comprehension
- higher translation risk because the UI intentionally pairs localized summaries with raw evidence bodies

Preserve:

- all raw diagnostic body text
- archive/export diagnostic schemas
- unknown-code fallback behavior

Default next action:

- `Phase 397` inventoried typed diagnostic presentation copy and keeps the implementation code/code-list mapping in [I18n_Diagnostic_Presentation_14_Locale_Inventory.md](./I18n_Diagnostic_Presentation_14_Locale_Inventory.md).
- `Phase 398` handled warning diagnostic presentation copy.
- `Phase 399` handled source-selection and fallback diagnostic presentation copy.
- `Phase 400` handled adapter-error diagnostic presentation copy.
- `Phase 401` is the post-diagnostic localization release check before the remaining operator/store helper slices.
- `Phase 402` and `Phase 403` inventory operator-workspace and store-helper 14-locale copy boundaries before implementation.

### P1 - Operator And Store Helper Follow-Up

Source buckets:

- `src/shared/operator-workspace-localized-copy.ts`
- `src/shared/store-workflow-localized-copy.ts`
- [I18n_Operator_Workspace_14_Locale_Copy_Inventory.md](./I18n_Operator_Workspace_14_Locale_Copy_Inventory.md)
- [I18n_Store_Helper_14_Locale_Copy_Inventory.md](./I18n_Store_Helper_14_Locale_Copy_Inventory.md)
- [402_Phase_Operator_Workspace_14_Locale_Copy_Inventory.md](../TODOs/Archive/by-phase/400-499/402_Phase_Operator_Workspace_14_Locale_Copy_Inventory.md)
- [403_Phase_Store_Helper_14_Locale_Copy_Inventory.md](../TODOs/Archive/by-phase/400-499/403_Phase_Store_Helper_14_Locale_Copy_Inventory.md)

User-facing copy:

- operator workspace shell, workflow helper copy, and action labels now have explicit 14-locale helper-owned coverage through `Phase 404`
- consumer-only interaction-audit labels are moving in narrow follow-up slices; Review Queue completed in `Phase 411`, Surface Card completed in `Phase 412`, Workspace Controls completed in `Phase 413`, Request Scope command headings completed in `Phase 414`, and Handoff Summary completed in `Phase 415`
- store screenshot helper route labels and submission-support captions now have explicit 14-locale coverage through `Phase 405`

Reason:

- important for future QA and store workflows
- lower end-user exposure than popup, Settings, and provider detail

Preserve:

- evidence payloads, export field names, request ids, archive ids, fixture ids, filenames, preset ids, route hashes, automation titles, and final screenshot surfaces

Default next action:

- `Phase 402` inventoried the operator-workspace helper and consumer-copy boundary for `Phase 404`.
- `Phase 403` inventoried the store-helper boundary for `Phase 405`.
- `Phase 404` translated the operator-workspace helper-owned buckets for all 14 runtime locales while leaving consumer-only labels and export-adjacent strings on the documented boundary.
- `Phase 405` translated the store-helper screenshot seed and native popup probe buckets for all 14 runtime locales while preserving automation titles, preset ids, route hashes, capture-plan identity fields, generated evidence, and listing source text.
- `Phase 409` documented the remaining interaction-audit presentation/export split and queued `Phase 411` for the first Review Queue display-copy implementation slice.
- `Phase 411` translated Review Queue display labels for all 14 runtime locales while preserving queue status enums, surface titles, signoff exports, and generated handoff drafts.
- `Phase 412` translated Surface Card chrome labels for all 14 runtime locales while preserving surface definitions, manual checks, frame-action raw messages, iframe identity, signoff exports, and generated handoff drafts.
- `Phase 413` translated Workspace Controls labels and signoff-workspace feedback for all 14 runtime locales while preserving pasted JSON, parsed import errors, signoff export JSON, generated Markdown drafts, filenames, MIME types, storage keys, request binding, and request revision formatting.
- `Phase 414` translated Request Scope command headings for all 14 runtime locales while preserving generated command text, request ids, request revisions, archive path examples, input filename examples, signoff export JSON, generated Markdown drafts, filenames, and MIME types.
- `Phase 415` translated Handoff Summary presentation labels and safe handoff feedback for all 14 runtime locales while preserving handoff draft content, generated bundle command text, operator notes, surface ids, surface titles, manual-check evidence, filenames, MIME types, and signoff export schemas.
- `Phase 416` added typed frame-readiness and preset-result codes with optional raw-message evidence while preserving current display messages and runtime behavior.
- `Phase 417` added localized frame-readiness and preset-result display copy for all 14 runtime locales while keeping raw selector/preset diagnostics untranslated and visible.

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
- `Phase 397` inventoried the typed diagnostic presentation bucket and split it into warning, source, and adapter-error implementation phases.
- `Phase 398` translated typed warning diagnostic presentation for all 14 runtime locales.
- `Phase 399` translated typed source-selection and source-fallback diagnostic presentation for all 14 runtime locales.
- `Phase 400` translated typed adapter-error diagnostic presentation for all 14 runtime locales.
- `Phase 401` reran the full release gate after typed diagnostic presentation reached 14-locale coverage.
- `Phase 402` inventoried operator-workspace helper copy for the next implementation slice.
- `Phase 403` inventoried store-helper runtime copy for the next implementation slice.
- `Phase 404` translated operator-workspace helper-owned buckets for all 14 runtime locales.
- `Phase 405` translated store-helper screenshot seed and native popup probe buckets for all 14 runtime locales.
- `Phase 410` added localized store-helper error wrappers while preserving raw invalid-preset, malformed-seed, and native popup probe error strings inside the displayed message.
- `Phase 411` translated interaction-audit Review Queue display labels for all 14 runtime locales.
- `Phase 412` translated interaction-audit Surface Card chrome labels for all 14 runtime locales.
- `Phase 413` translated interaction-audit Workspace Controls labels and signoff-workspace feedback for all 14 runtime locales.
- `Phase 414` translated interaction-audit Request Scope command headings for all 14 runtime locales.
- `Phase 415` translated interaction-audit Handoff Summary presentation labels and safe handoff feedback for all 14 runtime locales.
- `Phase 416` added the interaction-audit frame-result typed display split before localization.
- `Phase 417` localized the typed frame-result display messages for all 14 runtime locales.
- `Phase 418` inventoried the remaining interaction-audit presentation-copy boundary: route feedback/accessibility labels are presentation-only, import parse errors need typed presentation, and surface definitions need a display/source split before localization.
- `Phase 419` completed route feedback and accessibility-label localization; `Phase 420` completed typed import-error presentation; `Phase 421` is active for the surface-definition display/source split.

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
