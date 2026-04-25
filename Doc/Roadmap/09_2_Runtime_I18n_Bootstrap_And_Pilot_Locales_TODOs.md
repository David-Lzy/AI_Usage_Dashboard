# Direction 09.2 - Runtime I18n Bootstrap And Pilot Locales TODOs

Date: 2026-04-25

Document class:

- living strategy

Status note:

- direction created on `2026-04-24`
- first executable phase landed on `2026-04-24` through `Phase 170`
- second executable phase landed on `2026-04-24` through `Phase 171`
- third executable phase landed on `2026-04-24` through `Phase 172`
- fourth executable phase landed on `2026-04-24` through `Phase 173`
- fifth executable phase landed on `2026-04-24` through `Phase 174`
- sixth executable phase landed on `2026-04-24` through `Phase 175`
- seventh executable phase landed on `2026-04-24` through `Phase 176`
- eighth executable phase landed on `2026-04-25` through `Phase 177`
- ninth executable phase landed on `2026-04-25` through `Phase 178`
- tenth executable phase landed on `2026-04-25` through `Phase 179`
- eleventh executable phase landed on `2026-04-25` through `Phase 180`
- twelfth executable phase landed on `2026-04-25` through `Phase 181`
- thirteenth executable phase landed on `2026-04-25` through `Phase 182`
- fourteenth executable phase landed on `2026-04-25` through `Phase 183`
- fifteenth executable phase landed on `2026-04-25` through `Phase 184`
- sixteenth executable phase landed on `2026-04-25` through `Phase 185`
- seventeenth executable phase landed on `2026-04-25` through `Phase 186`
- eighteenth executable phase landed on `2026-04-25` through `Phase 187`
- nineteenth executable phase landed on `2026-04-25` through `Phase 188`
- twentieth executable phase landed on `2026-04-25` through `Phase 189`
- twenty-first executable phase landed on `2026-04-25` through `Phase 190`
- twenty-second executable phase landed on `2026-04-25` through `Phase 191`
- twenty-third executable phase landed on `2026-04-25` through `Phase 192`
- this child TODO keeps `Direction 09` executable as the active localization architecture track

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 09 - Internationalization Bootstrap And Pilot Locales](./09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)

## Goal

Build one maintainable localization architecture that can support manifest strings, runtime UI strings, formatting, and future store-copy coordination without forcing a one-shot ten-language translation dump.

## Detailed TODOs

### A. String Inventory

- inventory user-facing strings across:
  - manifest
  - popup
  - sidepanel
  - settings
  - provider detail
  - review workspaces
  - runbook-adjacent runtime copy that later appears in screenshots
- distinguish stable product-contract strings from more change-prone helper copy
- baseline shipped in `Phase 170`, then refreshed in `Phase 171`, `Phase 173`, and `Phase 174` as the runtime localized slice grew

### B. Stable Message-ID Policy

- define one message-id naming scheme
- keep manifest IDs and runtime IDs aligned where they represent the same product concept
- define how future copy edits preserve ID stability
- baseline shipped in `Phase 170`
- runtime shell ids expanded in `Phase 171` and `Phase 173`
- `Phase 174` kept runtime id growth intentionally narrow by moving popup/provider-detail explanatory copy under one structured localized-copy helper instead of creating one id per sentence

### C. Manifest Localization Plumbing

- add `default_locale`
- add `_locales/`
- define the first baseline catalog shape
- keep the manifest contract aligned with the runtime localization model
- completed in `Phase 170`

### D. Runtime App Localization Layer

- define one runtime string lookup layer
- decide how React surfaces consume localized messages
- keep vendor-owned live data outside the localized message catalog
- define locale persistence and startup hydration behavior
- first shell slice shipped in `Phase 171` through:
  - `src/shared/i18n.ts`
  - persisted `AppSettings.locale`
  - popup shell plus dashboard shell localization
  - shared quick theme-toggle localization
- settings-shell slice shipped in `Phase 173`
- popup explanatory plus provider-detail shell/static slice shipped in `Phase 174`
- remaining work:
  - deeper operator evidence/export payload copy that should stay explicit until archive compatibility is reviewed
  - adapter diagnostic bodies that need typed reason codes before localization can be safe

### E. Locale-Aware Formatting

- add locale-aware formatting for:
  - counts
  - percentages
  - dates
  - times
  - durations
- first shipped formatting slice landed in `Phase 172` for:
  - generated counts
  - percentages
  - parseable timestamp primitives
- `Phase 176` extended that formatting slice to:
  - popup snapshot-status freshness labels
  - popup featured-provider freshness chips
  - dashboard provider-card freshness and duration-bearing reset labels
- remaining formatting work still includes:
  - compact popup QA for longer localized duration-bearing value strings
  - deliberate policy for any broader relative-time rollout beyond the currently shipped surfaces
  - deliberate handling for non-parseable vendor-owned raw window labels

### E.1 Settings-Shell Pilot Rollout

- broader runtime pilot rollout started in `Phase 173`
- shipped settings-surface scope now includes:
  - top bar title plus actions
  - settings overview card
  - section navigation
  - summary-strip labels
  - global preferences labels
  - locale selector
  - theme mode and accent preset labels
  - top-level credentials, sources, and permissions section headings
  - preferences-saved toast copy

### E.2 Popup Explanatory And Provider-Detail Shell Rollout

- broader runtime pilot rollout continued in `Phase 174`
- shipped popup/provider-detail scope now includes:
  - popup guidance-card copy
  - popup setup-coverage labels and detail
  - popup snapshot-status copy
  - popup featured-section and featured-card story copy
  - popup action-section detail and surface-roles copy
  - popup explanatory aria labels
  - provider-detail top bar subtitle and expand title
  - provider-detail section labels, field labels, note labels, note prefixes, and helper value labels
  - provider-detail localized status badge and localized helper values such as granted/missing/unknown
  - provider-detail hero explanatory paragraph
- truth boundary preserved in `Phase 174`:
  - deeper settings helper copy remains English
  - raw provider source-truth detail strings still intentionally remain closer to underlying source output
  - operator workspaces remain English

### E.3 Deeper Settings Helper Rollout

- broader runtime pilot rollout continued in `Phase 175`
- shipped settings-helper scope now includes:
  - theme-customization status messaging
  - credential-card section labels, state chips, help copy, footer copy, placeholders, and action labels
  - source-card preference labels, session-track labels, diagnostics disclosure labels, and diagnostic group and field labels
  - permission-prompt status and action labels
- truth boundary preserved in `Phase 175`:
  - raw provider source-truth detail strings still intentionally remain closer to underlying source output
  - operator workspaces remain English

### E.4 Duration And Freshness Label Rollout

- broader runtime pilot rollout continued in `Phase 176`
- shipped duration/freshness scope now includes:
  - popup snapshot-status freshness labels
  - popup featured-provider freshness chips
  - dashboard provider-card freshness and duration-bearing reset labels
- truth boundary preserved in `Phase 176`:
  - raw provider source-truth detail strings still intentionally remain closer to underlying source output
  - operator workspaces remain English
  - compact-width and RTL hardening still remained next before any broader locale-tier expansion

### F. Pilot Locales

- first pilot:
  - `en`
  - `zh_CN`
- next tier after pilot proof:
  - `zh_TW`
  - `ja`
  - `ko`
  - `es_419`
- defer broader rollout until pilot layout and operations are stable

### G. Compact-Width And RTL QA Gates

- first hardening slice shipped in `Phase 177` through:
  - runtime `lang` and `dir` sync on popup, sidepanel, and full-page roots
  - preview `?app-dir=rtl` and `?app-dir=ltr` overrides for route-by-route QA without claiming one shipped RTL locale
  - logical-property hardening for list padding, inline button padding, checklist padding, and disclosure chevrons
  - tighter compact-width action sizing for top-app-bar actions plus popup action rows
- remaining gate work still includes:
  - broader route-by-route compact-width review under the localized pilot
  - Arabic-specific mirrored icon and disclosure validation before any shipped RTL locale tier

### H. Operator Workspace Boundary And Extraction

- first boundary and extraction review shipped in `Phase 178`
- maintained reference:
  - [I18n_Operator_Workspace_Boundary_And_Extraction.md](../I18n_Operator_Workspace_Boundary_And_Extraction.md)
- workspaces covered:
  - interaction-audit operator workspace
  - theme-recovery operator workspace
- candidate localizable categories:
  - top bar titles and subtitles
  - section labels and section titles
  - navigation, refresh, copy, download, reset, import, and export action labels
  - non-evidence helper paragraphs
  - generic feedback and empty-state messages
- evidence-preserving categories that stay English until archive compatibility is reviewed:
  - exported JSON field names
  - request ids, archive ids, revision labels, and generated filenames
  - fixture or preset ids
  - vendor-owned strings and raw provider source-truth wording
  - status terms already used as source-truth evidence labels in archives or request manifests

### H.1 Operator Workspace Shell Localization

- first shell localization slice shipped in `Phase 179`
- implementation scope:
  - `buildOperatorWorkspaceLocalizedCopy` in [localized-copy.ts](../../src/shared/localized-copy.ts)
  - interaction-audit top bar, hero, guidance, signoff summary labels, request-scope labels, and shell helper copy
  - theme-recovery top bar, hero, loading/error labels, current-truth labels, theme-state labels, request-scope labels, workflow helper copy, extension/vendor quick-link labels, output action labels, and generic feedback messages
  - special debug routes now receive the same runtime i18n from [App.tsx](../../src/sidepanel/App.tsx)
- truth boundary preserved:
  - exported JSON field names remain English
  - generated evidence markdown remains English
  - request ids, archive ids, revision strings, fixture ids, filenames, provider source-truth values, and vendor-owned wording remain unchanged
  - deeper operator evidence copy now needs archive-compatibility review before any future localization

### I. Store Runtime Helper Copy

- first store-helper localization slice shipped in `Phase 180`
- screenshot-adjacent submission-support caption slice shipped in `Phase 181`
- maintained boundary reference:
  - [I18n_Store_Runtime_Helper_Copy.md](../I18n_Store_Runtime_Helper_Copy.md)
- implementation scope:
  - `buildStoreWorkflowLocalizedCopy` in [localized-copy.ts](../../src/shared/localized-copy.ts)
  - screenshot seed route labels, headings, preset-applied helper copy, and route-contract copy
  - screenshot seed route preset-to-caption support copy that helps the operator match a preset to the store-listing story
  - native toolbar popup probe route labels, headings, accepted-state helper copy, and route-contract copy
  - special debug routes now receive runtime i18n from [App.tsx](../../src/sidepanel/App.tsx)
- preserved automation and truth boundary:
  - `document.title` automation signals remain English and stable
  - screenshot preset ids remain unchanged
  - debug route hashes remain unchanged
  - helper pages still explicitly state they are not final store screenshot surfaces
  - submission-support captions are not injected into final popup, side-panel, or full-page screenshots
  - manual native-toolbar popup capture remains a real `Direction 10.3` dependency

### J. Raw Provider Source-Truth Policy

- policy and first field review shipped in `Phase 182`
- maintained boundary reference:
  - [I18n_Raw_Provider_Source_Truth_Policy.md](../I18n_Raw_Provider_Source_Truth_Policy.md)
- defined which remaining English provider detail strings are source-truth evidence and must stay raw
- defined which surrounding provider explanations are presentation-only wrappers that can safely enter structured runtime copy
- keep vendor-owned wording and generated evidence payloads out of the translated catalog unless an explicit compatibility review approves them
- do not use this slice to rewrite provider coverage claims; current provider coverage gaps still remain truthful and unchanged

### K. Provider-Source Display Wrapper Localization

- shipped in `Phase 183`
- localized presentation-only provider-source display wrappers:
  - source kind labels
  - source preference labels
  - rollout stage labels
  - field availability labels
  - source fidelity labels and helper descriptions
  - source contract labels
  - connection-mode labels and helper descriptions
  - credential, cookie, manual-cookie-import, host-access, and page-binding helper labels
  - generated availability summaries
- preserve raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` values unchanged
- preserve source-contract evidence fields until a later stable message-id model exists

### L. Adapter Diagnostic Reason-Code Plan

- completed in `Phase 184`
- maintained reference:
  - [I18n_Adapter_Diagnostic_Reason_Code_Plan.md](../I18n_Adapter_Diagnostic_Reason_Code_Plan.md)
- child TODO:
  - [09_3_Adapter_Diagnostic_Reason_Code_TODOs.md](./09_3_Adapter_Diagnostic_Reason_Code_TODOs.md)
- design typed reason codes for adapter-generated diagnostics before localizing diagnostic bodies
- keep current raw adapter strings visible for evidence and archive compatibility during the transition
- decide whether reason-code payloads need parameterized values, provider-specific fallback text, or a compatibility map for historical archives
- do not use this slice to change provider coverage claims, fallback order, or source-selection behavior

### M. Type-Only Additive Diagnostic Model

- completed in `Phase 185`
- add optional typed diagnostic fields beside current raw diagnostic string fields
- add helper types and narrow builders without changing rendered UI behavior
- prove raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` fields still pass through unchanged
- keep localized diagnostic bodies out of scope until typed coverage and compatibility fallback tests exist

### N. Source Selection And Fallback Builders

- completed for Cursor and Codex in `Phase 186` and `Phase 187`
- populate typed source-selection and source-fallback diagnostics in one narrow provider path
- Cursor now populates typed source-selection and fallback diagnostics beside raw adapter strings
- Codex now populates typed source-selection and fallback diagnostics beside raw adapter strings
- preserve raw `sourceSelectionReason` and `sourceFallbackReason` strings exactly
- keep rendered UI behavior unchanged

### O. Codex Source Selection And Fallback Builders

- completed in `Phase 187`
- reuse the shared source-selection and fallback diagnostic builders
- populate Codex typed source-selection and fallback diagnostics beside raw adapter strings
- preserve exact raw `sourceSelectionReason` and `sourceFallbackReason` strings
- keep rendered UI behavior unchanged
- do not change source-selection order, fallback order, provider coverage claims, or personal-usage fidelity semantics

### P. Credential And Host-Access Diagnostics

- completed in `Phase 188`
- populate typed `warningDiagnostic` metadata for missing credential and missing host-access states
- start with Cursor and Codex because source diagnostics now exist there and both adapters have explicit credential or host-access blockers
- preserve raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` strings exactly
- keep rendered UI behavior unchanged
- keep raw English source-state classification fallback until typed warning coverage is broader

### Q. Page-Session Diagnostics

- completed in `Phase 189`
- populate typed `warningDiagnostic` metadata for open-page-required, logged-out, parser failure, and capture-unavailable page-session states
- start with Cursor and Codex because both have explicit personal page parser result states
- preserve raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` strings exactly
- keep rendered UI behavior unchanged
- keep source-state classification raw-string fallback until typed coverage is broad enough to switch safely

### R. Usage Threshold And Policy-Only Diagnostics

- completed in `Phase 190`
- populate typed `warningDiagnostic` metadata for shared usage-threshold warnings and policy-only provider states
- start with shared normalization output and Gemini policy-only output because those paths already have stable usage or policy blocker semantics
- preserve raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` strings exactly
- keep rendered UI behavior unchanged
- keep source-state classification raw-string fallback until typed coverage is broad enough to switch safely

### S. Sync-Stale Diagnostics

- completed in `Phase 191`
- populate typed `warningDiagnostic` metadata for stale cached-state and overdue automatic-sync states
- start with sync-engine generated stale warnings because those strings are local, stable, and already separate from provider-owned source text
- preserve raw `warningReason`, `sourceSelectionReason`, and `sourceFallbackReason` strings exactly
- keep rendered UI behavior unchanged
- keep source-state classification raw-string fallback until typed coverage is broad enough to switch safely

### T. Source-State Classification Typed Diagnostic Fallback

- completed in `Phase 192`
- make provider source-state classification prefer typed diagnostic categories where available
- keep raw English `warningReason` matching as the compatibility fallback for older stored snapshots, screenshot seeds, and archives
- preserve rendered labels, state tones, and raw diagnostic strings unless a typed diagnostic already maps to the same current state
- add tests for typed policy-only, host-access, credential, page-session, usage-threshold, and sync-stale inputs plus absent/unknown diagnostic fallback

### U. Localized Diagnostic Presentation Follow-Up

- next recommended slice
- render short localized diagnostic labels or summaries from typed diagnostic codes and params
- keep raw diagnostic bodies visible where evidence, details, exports, or archive compatibility still need the source-truth wording
- add unknown-code fallback tests that preserve raw diagnostic strings
- avoid translating raw adapter or sync-engine diagnostic bodies directly

## Planned Numbered Slices

1. string inventory and message-id contract - completed in `Phase 170`
2. manifest `_locales` plus `default_locale` - completed in `Phase 170`
3. runtime localization layer first shell slice - completed in `Phase 171`
4. locale-aware formatting for generated counts, percentages, and parseable timestamp primitives - completed in `Phase 172`
5. settings shell, overview, and locale selector rollout - completed in `Phase 173`
6. popup explanatory copy plus provider-detail shell/static rollout - completed in `Phase 174`
7. deeper settings helper copy rollout - completed in `Phase 175`
8. locale-aware durations and freshness label rollout - completed in `Phase 176`
9. compact-width review and RTL hardening - completed in `Phase 177`
10. audit and recovery workspace localization boundary and first extraction review - completed in `Phase 178`
11. first operator-workspace shell localization slice - completed in `Phase 179`
12. store-facing runtime helper copy - completed in `Phase 180`
13. screenshot-adjacent captions inside actual product screenshot surfaces or submission-support UI - completed in `Phase 181`
14. raw provider source-truth localization policy and presentation-only wrapper review - completed in `Phase 182`
15. provider-source display wrapper localization - completed in `Phase 183`
16. adapter diagnostic typed reason-code plan - completed in `Phase 184`
17. type-only additive diagnostic model - completed in `Phase 185`
18. Cursor source selection and fallback builders - completed in `Phase 186`
19. Codex source selection and fallback builders - completed in `Phase 187`
20. credential and host-access diagnostics - completed in `Phase 188`
21. page-session diagnostics - completed in `Phase 189`
22. usage-threshold and policy-only diagnostics - completed in `Phase 190`
23. sync-stale diagnostics - completed in `Phase 191`
24. source-state classification typed-diagnostic fallback - completed in `Phase 192`
25. localized diagnostic presentation follow-up - next

## Out Of Scope

- translating vendor-owned provider-page text
- promising all ten languages in the first runtime slice
- shipping Arabic before explicit RTL review exists
- localizing operator evidence schemas or archive-facing generated strings before archive compatibility is reviewed
- translating generated store-listing source docs inside runtime code unless that copy is shown by the extension
- translating raw provider source-truth strings outside the `Phase 182` and `Phase 183` policy boundary
- localizing adapter diagnostics before typed reason codes exist
