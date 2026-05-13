# Phase 34 - Hybrid Source UX And QA

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- finalize the user-facing connection flow, source labeling, and QA rules for providers that can now come from both Admin APIs and logged-in usage pages

Depends on:

- phase 28
- phase 29
- phase 30
- phase 31
- phase 32
- phase 33

File scope:

- `src/sidepanel/`
- `src/shared/`
- `Doc/testing/`
- `README.md`

Tasks:

- add settings UX for attaching to supported open pages
- surface source labels clearly:
  - `Official API`
  - `Session page`
  - `Policy only`
- show logged-out, tab-closed, and source-gated states without crashing or showing stale authority
- update manual QA and smoke-test coverage for hybrid providers
- update release docs so personal-user support boundaries are honest

Done when:

- the extension can explain where each provider's numbers come from
- hybrid-source failure modes are readable and testable
- the product is ready for another real-user verification pass

Out of scope:

- adding new providers beyond the current supported set

Completion date: 2026-04-22

Completion summary:

- added user-facing source labels across dashboard cards, provider detail, and settings so providers now read as `Official API`, `Session page`, or `Policy only` instead of raw internal sync buckets
- added a new `Source Connections` settings section with current source state, fallback path, and honest session-page rollout labels
- added a shipped session-page helper for JetBrains that can find an already-open `Users and licensing` tab or open the expected route in extension mode
- classified readable source failure states such as host access missing, credential missing, open page required, logged-out page, and policy-only mode
- updated README, manual QA guidance, and the Playwright smoke script to cover the new hybrid-source UX

Verification:

- `npm run typecheck`
- `npm run test`
- `npm run build`
- `node ./scripts/phase19-smoke.mjs`
- restarted preview service and confirmed both preview URLs return HTTP 200

Follow-up:

- no further queued phases in the current hybrid-source track
