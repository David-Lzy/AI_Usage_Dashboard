# Phase 157 - Sidebar Expand CTA To Route-Preserving Full-Page Shell

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this file records the `Phase 157` closeout for the route-preserving sidebar expand slice under `Direction 10.2`

## Goal

Ship one compact sidepanel top-bar expand control that opens the current `dashboard`, `settings`, or `provider-detail` route in the shared full-page shell without inventing a second route model or leaving the expand control visible once the runtime is already inside full-page mode.

## Implemented

- extended the shared sidepanel top bar with one optional full-page expand action and added unit coverage for that optional third button:
  - [TopBar.tsx](../../src/sidepanel/components/TopBar.tsx)
  - [TopBar.test.tsx](../../src/sidepanel/components/TopBar.test.tsx)
- wired the standard operational sidepanel routes to expose that compact `Tab` action with route-specific labels:
  - [DashboardPage.tsx](../../src/sidepanel/routes/DashboardPage.tsx)
  - [SettingsPage.tsx](../../src/sidepanel/routes/SettingsPage.tsx)
  - [ProviderDetailPage.tsx](../../src/sidepanel/routes/ProviderDetailPage.tsx)
- added one shared current-route full-page opener inside the standard sidepanel app instead of inventing a second route contract:
  - [App.tsx](../../src/sidepanel/App.tsx)
- kept the full-page shell honest by hiding the sidebar expand action when the runtime is already inside `?surface=full-page`
- added one repeatable runtime review for dashboard, settings, and provider-detail route-preserving expand targets:
  - [phase157-sidebar-expand-route-preserving-review.mjs](../../scripts/phase157-sidebar-expand-route-preserving-review.mjs)

## Verification

- `npm run docs:check`
- `npm run phase157:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Result

The sidepanel now has its own compact route-preserving jump into the shared full-page shell, and the standard operational routes no longer need to reset back to the dashboard before opening a full-page tab. This slice did not add the popup plus sidebar ambient light-dark toggle yet; that stays as the next `Direction 10.2` runtime work.
