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
  - raw provider source-truth detail strings that should stay explicit but still need a deliberate localization policy
  - deeper operator evidence/export payload copy that should stay explicit until archive compatibility is reviewed

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

- next recommended slice
- define which remaining English provider detail strings are source-truth evidence and must stay raw
- define which surrounding provider explanations are presentation-only wrappers that can safely enter structured runtime copy
- keep vendor-owned wording and generated evidence payloads out of the translated catalog unless an explicit compatibility review approves them
- do not use this slice to rewrite provider coverage claims; current provider coverage gaps still remain truthful and unchanged

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
14. raw provider source-truth localization policy and presentation-only wrapper review - next

## Out Of Scope

- translating vendor-owned provider-page text
- promising all ten languages in the first runtime slice
- shipping Arabic before explicit RTL review exists
- localizing operator evidence schemas or archive-facing generated strings before archive compatibility is reviewed
- translating generated store-listing source docs inside runtime code unless that copy is shown by the extension
- translating raw provider source-truth strings before the next policy slice separates evidence from presentation-only wrapper copy
