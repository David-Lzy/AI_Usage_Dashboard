# Phase 03 - Side Panel App Shell

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- build the basic Material Design 3 side panel layout using fake data

Depends on:

- phase 02

File scope:

- `src/sidepanel/App.tsx`
- `src/sidepanel/routes/DashboardPage.tsx`
- `src/sidepanel/components/TopBar.tsx`
- `src/sidepanel/components/SummaryStrip.tsx`

Tasks:

- create the top app bar
- create the summary strip
- create the one-column dashboard layout
- add placeholder content blocks for provider cards
- keep spacing and hierarchy aligned with the Material theme

Done when:

- the side panel looks like a usable dashboard shell
- fake content demonstrates the intended visual structure
- the layout works in the narrow side panel width

Out of scope:

- real provider card behavior
- settings page
- storage wiring

Completion date: 2026-04-20

Completion summary:

- replaced the Phase 02 theme demo page with a reusable dashboard shell route
- added `TopBar` and `SummaryStrip` components for the side panel header and high-level metrics
- added a one-column `DashboardPage` with fake provider shell cards to preview future usage states
- extended the Material theme layer to support summary pills, provider shell cards, status chips, and shell actions

Verification:

- unit tests: none added in this phase because the work was layout-shell composition only
- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- manual checks:
  - verified the side panel source now renders through `DashboardPage`
  - verified build output still contains a valid manifest and side panel asset bundle

Follow-up:

- move into `Phase 04` to formalize provider cards and the detail route
