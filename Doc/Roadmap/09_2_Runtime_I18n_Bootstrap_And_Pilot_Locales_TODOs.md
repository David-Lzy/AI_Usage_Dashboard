# Direction 09.2 - Runtime I18n Bootstrap And Pilot Locales TODOs

Date: 2026-04-24

Document class:

- living strategy

Status note:

- direction created on `2026-04-24`
- first executable phase landed on `2026-04-24` through `Phase 170`
- second executable phase landed on `2026-04-24` through `Phase 171`
- third executable phase landed on `2026-04-24` through `Phase 172`
- fourth executable phase landed on `2026-04-24` through `Phase 173`
- fifth executable phase landed on `2026-04-24` through `Phase 174`
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
  - deeper settings helper copy
  - raw provider source-truth detail strings that should stay explicit but still need a deliberate localization policy
  - operator workspaces

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
- remaining formatting work still includes:
  - localized durations
  - relative freshness phrasing
  - compact popup QA for longer localized value strings

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
  - localized durations still remain future work
  - operator workspaces remain English

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

- add popup compact-width translation review
- add sidebar and settings translation review
- define one explicit RTL checklist before `ar`
- identify where icons, padding, alignment, and disclosure direction need mirroring

## Planned Numbered Slices

1. string inventory and message-id contract - completed in `Phase 170`
2. manifest `_locales` plus `default_locale` - completed in `Phase 170`
3. runtime localization layer first shell slice - completed in `Phase 171`
4. locale-aware formatting for generated counts, percentages, and parseable timestamp primitives - completed in `Phase 172`
5. settings shell, overview, and locale selector rollout - completed in `Phase 173`
6. popup explanatory copy plus provider-detail shell/static rollout - completed in `Phase 174`
7. deeper settings helper copy plus locale-aware durations, compact-width review, and RTL hardening - next

## Out Of Scope

- translating vendor-owned provider-page text
- promising all ten languages in the first runtime slice
- shipping Arabic before explicit RTL review exists
