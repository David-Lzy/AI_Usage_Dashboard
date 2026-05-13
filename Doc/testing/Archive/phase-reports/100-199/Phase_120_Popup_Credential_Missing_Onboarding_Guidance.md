# Phase 120 - Popup Credential-Missing Onboarding Guidance

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

## Goal

Continue `Direction 06` by closing one remaining onboarding gap in the popup:

- when a visible provider is blocked on a missing stored credential, the popup should point back to Settings directly instead of only surfacing a generic blocked-provider card

## What Shipped

- one new popup guidance branch for `credential_missing`
- one clearer CTA for credential-backed paths:
  - one provider -> `Add credentials for <provider>`
  - multiple providers -> `Add credentials in settings`
- one additional popup view-model test that proves a credential-backed provider now routes to Settings rather than falling through to generic provider-detail guidance

## Files

- `src/popup/view-models.ts`
- `src/popup/view-models.test.ts`

## Verification

Executed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
```

Key truthful results:

- popup tests now cover missing-credential guidance in addition to no-provider, missing-access, healthy, and policy-only states
- the popup still routes credential-backed setup work to Settings instead of pretending provider detail can configure secrets
- this phase did not change badge semantics, provider contracts, or side-panel navigation structure

## Not Claimed

- that all popup onboarding is complete
- that provider detail now edits credentials
- that store assets or listing copy are already refreshed
