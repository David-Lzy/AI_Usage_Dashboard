# Direction 06.1 - Toolbar Product Benchmark And Discoverability TODOs

Date: 2026-04-23

Status note:

- direction created on `2026-04-23`
- no executable phase has started yet

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 06 - Toolbar Product Benchmark And Discoverability](./06_Direction_Toolbar_Product_Benchmark_And_Discoverability.md)

## Detailed TODOs

### A. Competitive Benchmark

- build a benchmark matrix for current comparable extensions:
  - toolbar entry pattern
  - popup layout depth
  - badge meaning
  - onboarding style
  - language support
  - privacy and permission posture
- separate "surface expectations" from "data-collection choices"
- document which competitor behaviors are acceptable references and which are intentionally rejected

### B. Popup Information Architecture

- audit current popup content for:
  - top-level headline clarity
  - featured-provider usefulness
  - empty-state readability
  - stale-state explanation density
- decide whether the popup should add:
  - stronger reset timing emphasis
  - one more prominent "needs attention now" surface
  - better first-run or no-provider states
- keep the popup within one clearly scannable compact story

### C. Entry, Badge, And Onboarding

- re-evaluate whether the current badge semantics remain the best single ambient signal
- define first-run handoff states for:
  - no providers enabled
  - no permissions granted
  - no credentials configured
  - all visible providers policy-only
- define whether onboarding belongs in popup, side panel, or both

### D. Store Listing And Visual Assets

- prepare a store-listing message hierarchy:
  - title
  - summary
  - description
  - screenshots
- ensure every screenshot matches a shipped UI state
- prepare a screenshot set that tells a toolbar-first story without hiding the side panel's role
- plan listing localization separately from in-product localization

### E. Verification And Policy Review

- verify popup sizing at the lower and upper ends of realistic Chrome popup widths
- verify onboarding language does not overclaim unsupported providers
- review benchmark-inspired changes against Chrome Web Store privacy and program policies

## Out Of Scope

- replacing the side panel with a full popup app
- adding hidden cookie scraping or internal API usage just because a competitor does it
- rewriting the product contract solely for marketing parity
