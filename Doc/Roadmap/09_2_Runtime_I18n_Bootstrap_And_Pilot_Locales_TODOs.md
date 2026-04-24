# Direction 09.2 - Runtime I18n Bootstrap And Pilot Locales TODOs

Date: 2026-04-24

Document class:

- living strategy

Status note:

- direction created on `2026-04-24`
- no executable phase has started yet
- this child TODO turns `Direction 09` into the next major architecture track after the current `Direction 10` surface-expansion work

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

### B. Stable Message-ID Policy

- define one message-id naming scheme
- keep manifest IDs and runtime IDs aligned where they represent the same product concept
- define how future copy edits preserve ID stability

### C. Manifest Localization Plumbing

- add `default_locale`
- add `_locales/`
- define the first baseline catalog shape
- keep the manifest contract aligned with the runtime localization model

### D. Runtime App Localization Layer

- define one runtime string lookup layer
- decide how React surfaces consume localized messages
- keep vendor-owned live data outside the localized message catalog
- define locale persistence and startup hydration behavior

### E. Locale-Aware Formatting

- add locale-aware formatting for:
  - counts
  - percentages
  - dates
  - times
  - durations
- define how compact popup states handle longer localized formats

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

1. string inventory and message-id contract
2. manifest `_locales` plus `default_locale`
3. runtime localization layer
4. locale-aware formatting
5. `en` plus `zh_CN` pilot rollout
6. compact-width and RTL hardening

## Out Of Scope

- translating vendor-owned provider-page text
- promising all ten languages in the first runtime slice
- shipping Arabic before explicit RTL review exists
