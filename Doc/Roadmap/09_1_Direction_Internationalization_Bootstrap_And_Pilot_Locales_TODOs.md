# Direction 09.1 - Internationalization Bootstrap And Pilot Locales TODOs

Date: 2026-04-24

Status note:

- direction created on `2026-04-24`
- no executable phase has started yet

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 09 - Internationalization Bootstrap And Pilot Locales](./09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)

## Detailed TODOs

### A. String Inventory And Message IDs

- inventory user-facing strings across:
  - manifest
  - popup
  - side panel
  - settings
  - provider detail
  - audit and recovery workspaces
- define stable message IDs
- classify strings by volatility so frequently changing product copy is easy to track

### B. Localization Architecture

- define one source-of-truth contract for message IDs
- decide how manifest localization and runtime localization share IDs
- choose runtime formatting primitives for:
  - dates
  - counts
  - percentages
  - durations

### C. Pilot Locale Rollout

- ship architecture-only groundwork first
- define first pilot locales:
  - `en`
  - `zh_CN`
- define acceptance criteria for the next tier:
  - `zh_TW`
  - `ja`
  - `ko`
  - `es_419`

### D. Layout And RTL QA

- add width review for translated popup states
- add width review for translated Settings and provider detail states
- define one explicit RTL hardening checklist before `ar`
- identify alignment, icon, and padding mirroring needs

### E. Translation Operations

- define how translations are authored, reviewed, and updated
- decide whether machine-assisted drafts are allowed and how they are reviewed
- define how store-listing localization is tracked separately from in-product localization
- plan how screenshots and review artifacts will be captured per shipped locale tier

### F. Rollout To Ten Planned Locales

- after pilot proof, plan staged addition of:
  - `pt_BR`
  - `fr`
  - `de`
  - `ar`
- use Chrome Web Store country and language metrics to refine order after launch

## Out Of Scope

- translating vendor-owned live data captured from provider pages
- promising all ten locales in the first executable slice
- shipping Arabic without explicit RTL review
