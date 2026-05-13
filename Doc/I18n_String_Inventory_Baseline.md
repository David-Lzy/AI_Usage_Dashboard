# I18n String Inventory Baseline

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the current baseline inventory for user-facing strings that move under the runtime i18n layer
- refresh it when localized surface scope changes materially

## Current Localized Scope

Localized through `Phase 170`, `Phase 171`, `Phase 172`, `Phase 173`, `Phase 174`, `Phase 175`, `Phase 176`, `Phase 177`, `Phase 179`, `Phase 180`, `Phase 181`, `Phase 183`, `Phase 193`, `Phase 194`, `Phase 195`, the `Phase 367` 14-locale architecture/manifest/listing draft expansion, the `Phase 368` RTL fallback text-direction hardening, the `Phase 369` RDP locale capture guard, the `Phase 370` i18n registry drift guard, the `Phase 372` store listing draft structure guard, the `Phase 373` Traditional Chinese runtime shell pilot, and the `Phase 374` Japanese runtime shell pilot.

Compact diagnostic presentation QA shipped in `Phase 196`. Diagnostic archive/export compatibility review shipped in `Phase 197`. Sample/store seed diagnostic metadata alignment shipped in `Phase 198`. Diagnostic fixture and historical evidence alignment review shipped in `Phase 199`.

Boundary-reviewed through `Phase 182`:

- raw provider source-truth policy and presentation-only wrapper candidate classification

Localized runtime surfaces:

- manifest `name`
- manifest `description`
- manifest `action.default_title`
- locale registry metadata for 14 runtime locale tags, Chrome `_locales` directory names, native labels, Intl/html language tags, and text direction
- popup loading and error shell
- popup header shell and top summary labels
- popup quick refresh plus full-page-tab action labels
- popup explanatory copy:
  - guidance-card copy
  - setup-coverage copy
  - snapshot-status copy
  - featured-section and featured-card story copy
  - action-section detail
  - surface-roles detail
- dashboard top bar, hero, providers section, empty state, and summary labels
- settings shell, overview, section navigation, and locale selector
- settings global-preferences labels, theme preset labels, summary-strip labels, and top-level section headings
- settings preferences-saved toast copy
- deeper settings helper copy:
  - theme-customization status messaging
  - credential-card section labels, state chips, help copy, footer copy, placeholders, and action labels
  - source-card preference labels, session-track labels, diagnostics disclosure labels, and diagnostic group and field labels
  - permission-prompt status and action labels
- provider-detail shell plus popup explanatory copy
- provider-detail static shell copy:
  - top bar subtitle and actions
  - section labels
  - field labels
  - note labels and prefixes
  - status badge labels
  - helper values such as granted/missing/unknown
  - hero explanatory paragraph
- shared quick theme-toggle labels for popup and standard sidepanel/full-page top bars
- generated dashboard and popup summary counts
- generated provider-card and provider-detail numeric values plus parseable reset/sync timestamps
- duration-bearing runtime labels:
  - popup snapshot-status freshness labels
  - popup featured-provider freshness chips
  - dashboard provider-card freshness and duration-bearing reset labels
- operator-workspace shell copy:
  - interaction-audit top bar, hero, guidance, signoff summary labels, request-scope labels, and shell helper copy
  - theme-recovery top bar, hero, loading/error labels, current-truth section labels, theme-state labels, request-scope labels, workflow helper copy, quick-link labels, output action labels, and generic feedback messages
- store-screenshot runtime helper copy:
  - screenshot seed helper headings, status copy, preset-applied helper copy, and route-contract copy
  - screenshot seed submission-support captions that map current preset ids to localized store-caption guidance
  - native toolbar popup probe headings, status copy, accepted-state helper copy, and route-contract copy
- provider-source display wrapper copy:
  - source kind and preference labels
  - rollout, availability, fidelity, connection, and contract labels
  - generated fidelity, access-model, credential, cookie, manual-cookie-import, host-access, page-binding, and fallback source-state helper descriptions
  - generated availability summaries
- typed warning diagnostic presentation:
  - localized labels for known warning diagnostic codes
  - short localized diagnostic summaries generated from typed params
  - raw warning bodies preserved beside the localized presentation
- typed source diagnostic presentation:
  - localized labels for known source-selection and fallback diagnostic codes
  - short localized summaries generated from source diagnostic params
  - raw source-selection and fallback bodies preserved beside the localized presentation
- typed adapter-error diagnostic presentation:
  - localized labels for known `adapter.*` diagnostic codes
  - short localized summaries generated from adapter diagnostic params
  - raw adapter warning bodies preserved beside the localized presentation

These now ship through:

- `src/manifest.json`
- `public/_locales/en/messages.json`
- `public/_locales/zh_CN/messages.json`
- `public/_locales/zh_TW/messages.json`
- `public/_locales/ja/messages.json`
- `public/_locales/ko/messages.json`
- `public/_locales/es_419/messages.json`
- `public/_locales/pt_BR/messages.json`
- `public/_locales/fr/messages.json`
- `public/_locales/de/messages.json`
- `public/_locales/it/messages.json`
- `public/_locales/ru/messages.json`
- `public/_locales/ar/messages.json`
- `public/_locales/hi/messages.json`
- `public/_locales/id/messages.json`
- `src/shared/i18n.ts`
- `src/shared/localized-copy.ts`
- `Doc/Store_Listing_Localization_14_Locale_Draft.md`

Phase 367 note:

- runtime catalog key coverage now exists for `en`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es-419`, `pt-BR`, `fr`, `de`, `it`, `ru`, `ar`, `hi`, and `id`
- `zh-CN` has broad reviewed non-English runtime copy in the current source; `zh-TW` and `ja` now have first runtime shell pilots for dashboard, popup, Settings, common actions, and theme-toggle labels; other non-English runtime locales may fall back to English copy until a future translation-review slice replaces those strings
- Chrome manifest strings and Chrome Web Store listing draft copy have 14-locale coverage
- `npm run i18n:check` guards runtime locale metadata, registry-derived Chrome locale directories, manifest catalog completeness, the RDP capture helper locale list, and store listing draft locale-section structure
- `Phase 368` adds shared typography-level `unicode-bidi: plaintext` protection for common text-bearing elements under `data-app-direction="rtl"`, so English fallback copy remains readable until reviewed translations land

## Store Runtime Helper Boundary

`Phase 180` added a maintained store-runtime helper copy reference, and `Phase 181` extended that reference with helper-only submission-support captions:

- [I18n_Store_Runtime_Helper_Copy.md](./I18n_Store_Runtime_Helper_Copy.md)

That reference covers the `#debug-store-screenshot-seed` and `#debug-native-popup-probe` helper routes. It localizes visible operator helper copy and preset-to-caption support guidance while preserving automation titles, preset ids, route hashes, and the truth boundary that helper pages are not final store screenshot surfaces. The added submission-support captions are not injected into final popup, side-panel, or full-page screenshots.

## Operator Workspace Boundary

`Phase 178` added a maintained operator-workspace boundary reference and `Phase 179` shipped the first shell-localized slice:

- [I18n_Operator_Workspace_Boundary_And_Extraction.md](./I18n_Operator_Workspace_Boundary_And_Extraction.md)

That reference covers the interaction-audit and theme-recovery workspaces. It separates shipped shell/helper copy from evidence-preserving English such as request ids, archive ids, generated filenames, export fields, fixture ids, vendor-owned strings, and status terms that currently serve as source-truth labels.

## Raw Provider Source-Truth Boundary

`Phase 182` added a maintained provider source-truth localization policy:

- [I18n_Raw_Provider_Source_Truth_Policy.md](./I18n_Raw_Provider_Source_Truth_Policy.md)

That reference protects raw `warningReason`, `sourceSelectionReason`, `sourceFallbackReason`, provider-source contract evidence, non-parseable vendor or policy labels, provider identifiers, host labels, route hints, URLs, and API names. `Phase 183` localized the safe provider-source display wrappers generated from enums or helper state while keeping those raw evidence fields unchanged.

`Phase 184` added the maintained adapter diagnostic reason-code plan:

- [I18n_Adapter_Diagnostic_Reason_Code_Plan.md](./I18n_Adapter_Diagnostic_Reason_Code_Plan.md)

That reference defines the additive typed diagnostic model that should exist before any raw adapter diagnostic bodies are localized.

`Phase 185` implemented the type-only additive diagnostic model while keeping rendered UI behavior and raw diagnostic strings unchanged.

`Phase 186` populated Cursor source-selection and fallback diagnostics beside the existing raw strings. The shared diagnostic builders now map stable source metadata into typed codes while preserving Cursor raw source-selection and fallback output exactly.

`Phase 187` populated Codex source-selection and fallback diagnostics through the same builders while preserving Codex raw source-selection and fallback output exactly.

`Phase 188` populated Cursor and Codex credential and host-access diagnostics while preserving raw warning output exactly.

`Phase 189` populated Cursor and Codex page-session diagnostics while preserving raw warning output exactly.

`Phase 190` populated usage-threshold and policy-only diagnostics while preserving raw warning output exactly.

`Phase 191` populated sync-stale diagnostics while preserving raw sync-engine stale warning output exactly and leaving rendered UI behavior unchanged.

`Phase 192` made source-state classification prefer typed warning diagnostics while preserving raw English warning-pattern fallback for absent or unknown typed diagnostics.

`Phase 193` added localized warning diagnostic presentation from typed warning codes and params while preserving raw warning, source-selection, and fallback bodies.

`Phase 194` added localized source diagnostic presentation from typed source-selection and fallback codes and params while preserving raw source-selection and fallback bodies.

`Phase 195` added localized adapter-error diagnostic presentation from typed adapter codes and params while preserving raw adapter warning bodies.

`Phase 196` added compact-width QA for the combined warning/source/adapter diagnostic presentation stack while preserving raw diagnostic evidence visibility.

`Phase 197` added [I18n_Diagnostic_Archive_Export_Compatibility.md](./I18n_Diagnostic_Archive_Export_Compatibility.md), confirming that archive/export schemas keep raw diagnostic evidence fields stable and treat localized diagnostic presentation as UI output.

`Phase 198` aligned maintained sample and store seed typed diagnostic metadata where stable codes already matched raw evidence strings. This did not add translated diagnostic bodies and did not change raw `warningReason`, `sourceSelectionReason`, or `sourceFallbackReason` values.

`Phase 199` added [I18n_Diagnostic_Fixture_And_Historical_Evidence_Alignment.md](./I18n_Diagnostic_Fixture_And_Historical_Evidence_Alignment.md), separating mutable maintained fixtures from generated request/handoff packages and frozen historical archives.

## Runtime Surfaces Still Mostly English

The following surfaces still need broader runtime localization work:

- raw provider source-truth detail strings that still intentionally surface current contract or vendor wording without translation
- non-`zh-CN` deep runtime structured copy that currently falls back to English until reviewed translations are added
- deeper interaction-audit evidence, preset, queue, import, and export payload copy
- deeper theme-recovery evidence summary and provider source-truth copy

## Runtime Inventory Buckets

Recommended next extraction order:

1. adapter diagnostic raw fallback regression review
2. revisit deeper operator-workspace evidence copy only after archive-compatibility rules are explicit
3. revisit generated store-listing source localization only after refreshed screenshot assets replace the historical baseline

## Truth Boundary

- the extension is no longer manifest-English-only after `Phase 170`
- the runtime app now has a broader but still partial localized slice plus locale-aware formatting after `Phase 183`, and a 14-locale runtime/manifest architecture after `Phase 367`; this is not yet a fully reviewed translated rollout for every runtime string
- `en` and `zh_CN` currently cover manifest surfaces plus popup/dashboard shell strings, popup explanatory copy, the first settings-shell slice, deeper settings helper copy, provider-detail shell/static copy, provider-source display wrappers, quick theme-toggle labels, generated counts, percentages, parseable timestamp primitives, duration-bearing runtime freshness/reset labels, operator-workspace shell copy, store-screenshot runtime helper copy plus seed-route submission-support captions, and one first compact-width plus RTL hardening pass
- `zh_TW`, `ja`, `ko`, `es_419`, `pt_BR`, `fr`, `de`, `it`, `ru`, `ar`, `hi`, and `id` currently cover Chrome manifest surfaces and Chrome Web Store listing drafts; `zh-TW` and `ja` also cover first runtime shell slices, while deeper runtime copy falls back to English where translation review has not occurred
- runtime document roots now sync `lang` and `dir`, `ar` resolves to `rtl`, English fallback text in RTL surfaces is direction-isolated, and preview/QA can still force `?app-dir=rtl` plus `?app-locale=<supported-locale>` for extension-window checks
- raw provider source-truth detail strings and deeper operator evidence payloads still remain outside the shipped pilot, but operator-workspace boundaries are now explicitly documented after `Phase 178` and the shell slice is shipped after `Phase 179`
- provider source-truth values now have an explicit policy boundary after `Phase 182`, provider-source display wrappers are localized after `Phase 183`, typed adapter diagnostic planning is documented after `Phase 184`, the type-only additive model exists after `Phase 185`, Cursor source-selection/fallback diagnostics are populated after `Phase 186`, Codex source-selection/fallback diagnostics are populated after `Phase 187`, Cursor/Codex credential plus host-access diagnostics are populated after `Phase 188`, Cursor/Codex page-session diagnostics are populated after `Phase 189`, usage-threshold plus policy-only diagnostics are populated after `Phase 190`, sync-stale diagnostics are populated after `Phase 191`, source-state classification prefers typed warning diagnostics after `Phase 192`, localized warning diagnostic presentation ships after `Phase 193`, localized source diagnostic presentation ships after `Phase 194`, adapter-error diagnostic presentation ships after `Phase 195`, compact diagnostic presentation QA ships after `Phase 196`, archive/export compatibility review ships after `Phase 197`, sample/store seed diagnostic metadata alignment ships after `Phase 198`, and diagnostic fixture/historical evidence alignment review ships after `Phase 199`; adapter diagnostic raw fallback regression review remains the next safe diagnostic work, but `Phase 200` shifted short-term execution to functional Codex personal quota surfacing
- non-parseable vendor-owned window labels such as `Mar 23 - Apr 21` still remain raw strings until a later explicit product decision localizes them
