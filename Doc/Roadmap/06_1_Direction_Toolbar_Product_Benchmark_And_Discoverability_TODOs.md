# Direction 06.1 - Toolbar Product Benchmark And Discoverability TODOs

Date: 2026-04-23

Status note:

- direction created on `2026-04-23`
- `Phase 118` completed the first executable slice on `2026-04-23` by shipping one benchmark matrix plus one compact popup `Start here / Next step` guidance card
- `Phase 119` completed the next executable slice on `2026-04-23` by shipping one truthful popup triage hierarchy plus an explicit featured empty-state
- `Phase 120` completed the next executable slice on `2026-04-23` by shipping one credential-missing onboarding branch that routes credential-backed setup states back to Settings
- `Phase 121` completed the next executable slice on `2026-04-23` by shipping one compact popup setup-coverage summary for live-ready, host-access, credentials, and policy-only states
- `Phase 122` completed the next executable slice on `2026-04-23` by compressing popup setup-summary copy and adding one repeatable width-range review for no-visible, mixed-setup, and healthy popup states
- `Phase 123` completed the next executable slice on `2026-04-23` by adding one explicit popup setup-stage hierarchy plus one repeatable width-range review for no-visible, mixed-setup, policy-only, and healthy setup stages
- `Phase 124` completed the next executable slice on `2026-04-23` by hiding the empty snapshot-status card for no-provider states and adding one repeatable width-range review for the popup top-stack density contract
- `Phase 125` completed the next executable slice on `2026-04-23` by making popup quick actions explicitly secondary whenever a guidance card is present and adding one repeatable review for action hierarchy
- `Phase 126` completed the next executable slice on `2026-04-23` by making popup header copy and top-summary labels specific to first-run toolbar setup story and adding one repeatable review for that header plus summary contract
- `Phase 127` completed the next executable slice on `2026-04-23` by making popup featured-provider badges plus supporting copy popup-specific and adding one repeatable review for featured-card story alignment
- `Phase 128` completed the next executable slice on `2026-04-23` by making popup featured-provider CTA routing stateful and adding one repeatable review for featured-card action hierarchy
- `Phase 129` completed the next executable slice on `2026-04-23` by reducing popup featured-provider chip density and replacing longer healthy/contract-only contract prose with shorter availability summaries, plus one repeatable density review
- `Phase 130` completed the next executable slice on `2026-04-23` by replacing the last static popup contract explainer with one stateful `Surface roles` note and adding one repeatable width review for that footer-note contract

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
- ship one compact popup `Start here / Next step` guidance card for:
  - no visible providers
  - missing host access
  - missing stored credential
  - blocked provider review
  - all-visible policy-only states
- make the featured-provider area switch honestly between:
  - `Needs attention`
  - `All clear`
  - `Current contract`
  - `Nothing to triage yet`
- decide whether the popup should add:
  - stronger reset timing emphasis
  - one more prominent "needs attention now" surface
  - better first-run or no-provider states beyond the now-shipped guidance card
- keep the popup within one clearly scannable compact story
- keep featured-provider badges and supporting copy aligned with the popup-first setup story instead of dropping straight back into side-panel contract prose
- keep featured-provider CTAs aligned with the same popup-first story instead of implying every provider state should route to detail
- keep featured-provider chips and secondary copy dense enough for a popup, not a side-panel card
- keep the remaining popup footer note lightweight and stateful instead of falling back to one static side-panel-style contract explainer

### C. Entry, Badge, And Onboarding

- re-evaluate whether the current badge semantics remain the best single ambient signal
- define first-run handoff states for:
  - no providers enabled
  - no permissions granted
  - no credentials configured
  - all visible providers policy-only
- keep credential-backed setup work routed to Settings instead of implying provider detail can configure secrets
- keep one compact setup-coverage summary in the popup so visible-provider breadth does not need to be inferred from four separate cards
- keep popup setup-summary copy short enough that the onboarding stack still reads cleanly at `360px` and `420px`
- keep popup setup-stage labels compact enough that `Start setup`, `Needs setup`, `Needs review`, `Contract-only`, and `Ready` remain scannable in the same header row
- keep snapshot-status copy focused on freshness once guidance and setup-stage layers already explain the action state
- keep the lower popup actions card secondary whenever a guidance card already provides one clear primary next step
- keep the popup header and top summary specific to toolbar-first setup story instead of reusing broader dashboard wording
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
- keep one repeatable width-range review for popup onboarding density, not only for pure layout overflow
- keep one repeatable width-range review for popup setup-stage hierarchy, not only setup bucket counts
- keep one repeatable width-range review for popup top-stack density so no-provider states do not keep a redundant empty snapshot card
- keep one repeatable action-hierarchy review so the primary guidance action does not reappear unchanged in the lower action row
- keep one repeatable header-plus-summary review so popup top-line wording does not drift back to dashboard semantics
- verify onboarding language does not overclaim unsupported providers
- review benchmark-inspired changes against Chrome Web Store privacy and program policies

## Out Of Scope

- replacing the side panel with a full popup app
- adding hidden cookie scraping or internal API usage just because a competitor does it
- rewriting the product contract solely for marketing parity
