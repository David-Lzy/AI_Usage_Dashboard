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
- baseline shipped in `Phase 170`, then refreshed in `Phase 171` and `Phase 173` as the runtime localized slice grew

### B. Stable Message-ID Policy

- define one message-id naming scheme
- keep manifest IDs and runtime IDs aligned where they represent the same product concept
- define how future copy edits preserve ID stability
- baseline shipped in `Phase 170`; runtime ids expanded in `Phase 171` and `Phase 173`

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
- remaining work:
  - deeper settings helper copy
  - provider-detail body copy
  - popup explanatory cards
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
- truth boundary preserved in `Phase 173`:
  - deeper source-card diagnostics remain English
  - credential help paragraphs remain English
  - provider-detail and most popup explanatory copy remain English
  - localized durations still remain future work

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
6. provider-detail, popup explanatory, and deeper settings-copy rollout - next
7. locale-aware durations plus compact-width and RTL hardening

## Out Of Scope

- translating vendor-owned provider-page text
- promising all ten languages in the first runtime slice
- shipping Arabic before explicit RTL review exists
