# Phase 158 - Popup And Sidebar Light-Dark Toggle

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this file records the `Phase 158` closeout for the popup plus sidebar quick-theme slice under `Direction 10.2`

## Goal

Ship one near-surface `Light / Dark` quick toggle in popup and standard sidepanel routes, carry that same control into the standard full-page shell, and keep `Settings` as the only advanced theme-configuration surface for `system`, preset accents, and custom-seed state.

## Implemented

- added one shared quick-theme helper that flips between explicit `light` and `dark` from the current resolved runtime mode, including the `system -> opposite explicit mode` rule:
  - [theme.ts](../../../../../src/shared/theme.ts)
  - [theme.test.ts](../../../../../src/shared/theme.test.ts)
- extended the shared top bar so standard sidepanel and full-page routes can expose one compact quick-theme control without replacing the existing expand/back/refresh/settings actions:
  - [TopBar.tsx](../../../../../src/sidepanel/components/TopBar.tsx)
  - [TopBar.test.tsx](../../../../../src/sidepanel/components/TopBar.test.tsx)
- wired the standard operational sidepanel routes to expose that quick light-dark toggle through the shared top bar:
  - [App.tsx](../../../../../src/sidepanel/App.tsx)
  - [DashboardPage.tsx](../../../../../src/sidepanel/routes/DashboardPage.tsx)
  - [SettingsPage.tsx](../../../../../src/sidepanel/routes/SettingsPage.tsx)
  - [ProviderDetailPage.tsx](../../../../../src/sidepanel/routes/ProviderDetailPage.tsx)
- added one popup-header quick-theme toggle that updates shared settings state without disturbing the existing refresh and dashboard-tab actions:
  - [PopupApp.tsx](../../../../../src/popup/PopupApp.tsx)
- added one repeatable runtime review for popup, sidepanel dashboard, and full-page settings quick-theme behavior:
  - [phase158-popup-sidebar-theme-toggle-review.mjs](../../../../../scripts/phase158-popup-sidebar-theme-toggle-review.mjs)

## Verification

- `npm run docs:check`
- `npm run phase158:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Result

Popup, sidepanel, and the standard full-page shell now share one near-surface light-dark flip without collapsing the advanced theme contract into header controls. This slice did not add the planned expand/open motion polish yet; that remains the next `Direction 10.2` runtime work.
