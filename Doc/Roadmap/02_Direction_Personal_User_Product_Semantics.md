# Direction 02 - Personal User Product Semantics

Date: 2026-04-22

Document class:

- living strategy

Status note:

- this file is a living roadmap direction and should be refreshed when direction state, priority, or completed slices change

Status: in progress

Execution note:

- the latest executable slice landed on `2026-04-23` through `Phase 47`

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Priority:

- `P1`

## Why This Direction Exists

The project started from stronger enterprise and admin surfaces, but the highest everyday product value is now shifting toward personal users.

That does not mean every provider can expose the same fields.

The main strategic problem is not "how do we show more numbers?".
It is:

- which personal metrics are truly observable
- which are only partial
- which are only inferable
- and which should not be shipped at all

## Current Truth

As of 2026-05-11:

- `Codex` personal support is already shipped through a logged-in ChatGPT page session and currently returns usage-window percentages plus reset timing
- `Codex` still does not expose one absolute remaining personal credit balance in the current shipped path
- `Cursor` personal support is already shipped through a logged-in usage page, but it currently exposes billing-period context instead of an exact remaining included-request counter
- `Claude` Team support is now shipped in current source through a logged-in `claude.ai/settings/usage` page-session path, while the old free-account upgrade redirect remains an unsupported account state and individual Pro / Max behavior remains unclaimed
- `Gemini` personal support is deferred because the observed metrics route is project-scoped rather than a clean personal quota surface
- `Phase 43` now exposes source-fidelity semantics in the UI so the shipped `Codex` and `Cursor` personal paths are visibly labeled as `Window-only vendor value`
- the UI also distinguishes current enterprise/admin analytics paths as `Analytics snapshot` so they are not confused with live remaining counters
- `Phase 44` now exposes trust-boundary semantics in the UI so users can see which paths depend on stored credentials, logged-in page sessions, host access, and the explicit cookie ban
- `Phase 45` now exposes provider-contract semantics in the UI so shipped personal partial paths, shipped admin or enterprise analytics paths, and deferred tracks are labeled explicitly instead of being implied through notes
- `Phase 46` now brings the current provider contract onto dashboard cards so the main overview reflects the same honesty model as Settings and provider detail
- `Phase 47` now exposes explicit graduation gates for deferred tracks; after `Phase 300`, Claude Team has graduated while Gemini project metrics and JetBrains org-console still require explicit evidence or product acceptance

## What External Market Signals Say

Current Chrome Web Store competitors show that there is real demand for personal-usage tracking:

- `Ai Usage 100%` presents itself as a toolbar-first personal usage dashboard and claims local counting plus cookie-backed API access
- `QuotaMeter` presents a popup-first multi-service quota dashboard and explicitly advertises `Codex` weekly and 5-hour quota percentages

Those products prove the demand.
They do not automatically prove that every aggressive data path is aligned with this project's current guardrails.

## Direction Goal

Define a personal-user product contract that is:

- honest
- stable enough to maintain
- compatible with the project's security posture
- useful even when exact absolute quotas are unavailable

## Strategic Decisions

1. Separate personal fidelity levels explicitly.
   Recommended product labels:
   - `exact`
   - `window_only`
   - `local_estimate`
   - `policy_only`

   Implementation note:
   the current UI also uses `Analytics snapshot` for non-personal admin and enterprise analytics paths so those sources do not masquerade as live quota balances.

2. Keep enterprise analytics and personal session pages semantically separate.
   A provider may have two shipped sources without those sources meaning the same thing.

3. Treat "local estimate" as optional and clearly experimental.
   If the project ever adds request interception or locally counted inferred quotas, that should be a separately labeled mode, not merged into `exact`.

4. Keep cookie export and raw credential harvesting out of scope.
   Competitors may use those paths, but they increase product-policy, security, and trust risk.

## Success Criteria

- every personal provider mode has a clear honesty label
- the UI no longer implies that all personal providers can surface one exact remaining counter
- `Codex` and `Cursor` personal paths are framed as shipped but partial where necessary
- future aggressive inference work, if accepted, is isolated behind a separate product contract

## Main Risks

- overclaiming exactness where only a rolling window or page-local number exists
- mixing inferred local counters with vendor-reported live usage
- expanding personal support in a way that conflicts with Chrome Web Store privacy expectations

## Child TODO

- [02_1_Direction_Personal_User_Product_Semantics_TODOs.md](./02_1_Direction_Personal_User_Product_Semantics_TODOs.md)
