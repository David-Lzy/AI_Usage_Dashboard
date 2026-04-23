# Direction 07.1 - Internationalization And Localization TODOs

Date: 2026-04-23

Document class:

- living strategy

Status note:

- direction created on `2026-04-23`
- no executable phase has started yet

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 07 - Internationalization And Localization](./07_Direction_Internationalization_And_Localization.md)

## Detailed TODOs

### A. String Inventory And Message Architecture

- inventory all user-facing strings across:
  - manifest metadata
  - popup
  - dashboard
  - settings
  - provider detail
  - audit hub
- define stable message IDs
- classify strings by change frequency so volatile product copy is easy to track

### B. Runtime Localization Layer

- decide how manifest localization and app-surface localization share one source catalog
- add locale selection rules:
  - browser locale
  - explicit user override if needed
- add locale-aware formatting for:
  - timestamps
  - counts
  - percentages
  - durations

### C. Locale Rollout Strategy

- define pilot locales for the first implementation pass
- define the first ten planned locales and the acceptance bar for each
- use Chrome Web Store country and language metrics after launch to refine priority

### D. Layout And RTL Hardening

- verify compact popup and Settings layouts under longer strings
- add explicit RTL review for Arabic
- define which icons, paddings, and alignment rules need mirroring
- verify that audit-hub screenshots and manual QA surfaces remain usable in translated layouts

### E. Translation Operations

- define how translations are authored, reviewed, and updated
- decide whether machine-assisted drafts are allowed and how human review is recorded
- prepare screenshot or snapshot review for each shipped locale tier
- prepare store-listing localization separately from in-product localization

## Out Of Scope

- machine-translating vendor-owned live data captured from provider pages
- guaranteeing simultaneous support for every locale in every documentation file
- promising ten fully polished locales in the first executable slice
