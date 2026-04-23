# Direction 02.1 - Personal User Product Semantics TODOs

Date: 2026-04-22

Document class:

- living strategy

Status note:

- `Phase 43` completed the first executable slice on `2026-04-23` by shipping the visible fidelity vocabulary and field-level source availability labels in the side panel
- `Phase 44` completed the next slice on `2026-04-23` by surfacing trust-boundary and access-model semantics in Settings and provider detail
- `Phase 45` completed the next slice on `2026-04-23` by surfacing explicit provider-contract labels for shipped, policy-only, and deferred paths
- `Phase 46` completed the next slice on `2026-04-23` by surfacing the current provider contract directly on dashboard cards
- `Phase 47` completed the next slice on `2026-04-23` by surfacing explicit graduation gates for deferred provider contracts

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 02 - Personal User Product Semantics](./02_Direction_Personal_User_Product_Semantics.md)

## Detailed TODOs

### A. Product Contract

- freeze a cross-provider fidelity vocabulary:
  - exact vendor value
  - window-only vendor value
  - local estimate
  - documented policy
- decide how that vocabulary appears in provider cards, detail pages, and settings
- current shipped baseline:
  - provider cards now show the current source fidelity label
  - provider detail now shows source fidelity plus used/remaining/reset availability
  - Settings source cards now show fidelity detail and availability summaries
  - Settings and provider detail now show the current provider contract and the retained session-page contract when those promises differ
  - dashboard cards now show the current provider contract and can surface a different retained session-page contract for mixed-source providers

### B. Codex Personal Track

- keep the shipped session-page percentage path as the baseline
- document clearly that current support is for visible usage windows, not one absolute remaining balance
- investigate whether a separate opt-in `local_estimate` mode is worth exploring for Codex task counting and plan-limit heuristics
- reject that mode if it cannot be made obviously distinct from vendor-reported usage

### C. Cursor Personal Track

- keep the shipped billing-period page path as the baseline
- evaluate whether the personal page exposes enough stable structure to improve "usage unknown" into a more useful partial summary
- only pursue request-counter style inference if the team explicitly accepts a separate `local_estimate` mode

### D. Deferred Providers

- keep `Claude` personal deferred until a real Pro or Max usage page is captured
- keep `Gemini` personal deferred until the product model for project-scoped metrics is intentionally accepted
- avoid vague "coming soon" language where the route itself is not yet defensible
- current shipped baseline:
  - deferred `Claude`, `Gemini`, and `JetBrains` tracks are now labeled explicitly in the UI as deferred contracts instead of being left inside implementation notes only
  - deferred `Claude`, `Gemini`, and `JetBrains` tracks now also expose explicit graduation gates so the product states what concrete condition must be met before the contract can change

### E. Compliance And Trust

- document which personal paths depend on:
  - host permissions
  - page-session parsing
  - local counters
  - cookies or internal APIs
- prefer the first three
- require explicit leadership approval before adding the fourth
- current shipped baseline:
  - Settings and provider detail now expose access model, credential persistence, host-access requirement, cookie policy, and manual-cookie-import policy
  - the visible product contract now says cookies are forbidden instead of leaving that only in docs

## Out Of Scope

- store submission wording
- enterprise analytics feature expansion
- inventing synthetic balances where no stable source exists
