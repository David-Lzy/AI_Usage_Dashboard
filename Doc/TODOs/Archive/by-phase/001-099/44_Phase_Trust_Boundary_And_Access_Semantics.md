# Phase 44 - Trust Boundary And Access Semantics

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- make the extension's trust boundary explicit by surfacing how each provider actually accesses data and which risky paths remain intentionally forbidden

Depends on:

- phase 43
- [Direction 02 - Personal User Product Semantics](../../../../Roadmap/02_Direction_Personal_User_Product_Semantics.md)

File scope:

- `src/shared/`
- `src/sidepanel/`
- `README.md`
- `Doc/`

Tasks:

- define user-facing labels for access model, credential persistence, cookie policy, and manual cookie import policy
- surface those labels in Settings and provider detail so the user can tell which providers rely on page sessions, host access, or stored credentials
- make the current trust boundary visible without implying that cookie-backed or hidden-API paths are part of the shipped product
- update docs if the visible product contract changes

Done when:

- Settings and provider detail expose the provider trust boundary clearly
- the UI makes it obvious that raw cookie storage and manual cookie import are forbidden
- tests and build checks pass
- preview is restarted on the latest build

Out of scope:

- new provider integrations
- cookie-backed experiments
- request-count interception or `local_estimate` work

Completion date: 2026-04-23

Completion summary:

- turned the existing provider-source blueprint security constraints into explicit UI semantics for access model, credential persistence, cookie policy, manual cookie import, and host-access requirement
- surfaced those semantics in Settings source cards and provider detail instead of leaving them only in technical docs
- made the shipped trust boundary visible: page-session paths attach to logged-in tabs, credential paths stay extension-local, and cookie-backed paths remain forbidden

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run src/shared/provider-sources.test.ts src/sidepanel/view-models.test.ts`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- preview:
  - command: `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist`
  - URL: `http://127.0.0.1:4173/src/sidepanel/index.html`

Follow-up:

- continue `Direction 02` with provider-specific personal-contract hardening for deferred providers or an explicit accept/reject decision on any future `local_estimate` track
