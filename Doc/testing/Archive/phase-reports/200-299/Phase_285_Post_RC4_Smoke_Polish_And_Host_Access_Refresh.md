# Phase 285 - Post RC4 Smoke Polish And Host Access Refresh

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- records post-rc4 smoke polish and the RDP smoke check

## Scope

Phase 285 handles small visual/runtime issues found during human smoke review:

- circular provider-card usage cells keep visible internal boundaries
- source chips remain horizontal on wide dashboard cards
- Settings section chips move slightly upward/right inside the sticky top bar
- Settings back-to-top FAB remains viewport-fixed on full-page tab surfaces
- Codex or another single missing-host provider can trigger the Chrome host access prompt directly from refresh

## Review Coverage

- `npm run test -- src/shared/host-access-request.test.ts src/sidepanel/standard-app-actions.test.ts src/sidepanel/components/SettingsNavigation.test.tsx src/sidepanel/components/ProviderCard.test.tsx --run`
  - verifies host-access refresh candidate selection
  - verifies side-panel refresh requests host access before refreshing one missing provider
  - verifies denied host access stops refresh cleanly
  - verifies Settings navigation and provider-card component contracts still render
- `npm run phase285:review`
  - verifies runtime, CSS, test, and documentation markers
- `npm run phase160:review`
  - RDP smoke check across popup, side-panel Settings, full-page dashboard, full-page Settings, and Codex provider detail routes

## Commands

- `npm run test -- src/shared/host-access-request.test.ts src/sidepanel/standard-app-actions.test.ts src/sidepanel/components/SettingsNavigation.test.tsx src/sidepanel/components/ProviderCard.test.tsx --run`
- `npm run phase285:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `npm run phase160:review`
- `git diff --check`
