# Phase 04 - Provider Cards And Detail Route

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- implement the card and detail-view UI using fake normalized data

Depends on:

- phase 03

File scope:

- `src/sidepanel/components/ProviderCard.tsx`
- `src/sidepanel/components/StatusBadge.tsx`
- `src/sidepanel/components/UsageProgress.tsx`
- `src/sidepanel/routes/ProviderDetailPage.tsx`

Tasks:

- build the provider summary card
- add a status badge variant system
- add a usage progress indicator
- add a provider detail route or detail panel
- show all normalized fields using fake data

Done when:

- one fake provider can be displayed end to end
- the detail view shows plan, usage, reset time, source, and sync state
- the UI stays consistent with the Material theme

Out of scope:

- real storage
- real provider fetching
- settings and permissions

Completion date: 2026-04-20

Completion summary:

- added reusable `ProviderCard`, `StatusBadge`, and `UsageProgress` components
- replaced placeholder provider shell blocks with fake normalized provider snapshots
- added `ProviderDetailPage` and a local detail-flow that opens one provider end to end
- extended the Material theme layer to cover card metadata, progress bars, detail fields, and detail notes

Verification:

- unit tests: none added in this phase because the work was UI composition with fake data only
- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- manual checks:
  - verified the dashboard now renders provider cards instead of generic placeholder blocks
  - verified one fake provider can open into the detail view with plan, usage, reset time, source, and sync state

Follow-up:

- move into `Phase 05` for settings and permission UX
