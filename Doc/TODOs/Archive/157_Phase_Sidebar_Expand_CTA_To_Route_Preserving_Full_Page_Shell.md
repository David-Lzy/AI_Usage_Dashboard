# Phase 157 - Sidebar Expand CTA To Route-Preserving Full-Page Shell

Completion date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this archived phase marks the route-preserving sidebar expand slice under `Direction 10.2` as completed

Completion summary:

- shipped one compact sidepanel top-bar `Tab` expand control across dashboard, settings, and provider-detail routes
- routed that control to the shared `src/sidepanel/index.html?surface=full-page#...` contract while preserving the current route
- hid the expand control once the runtime is already inside the full-page shell
- added one repeatable route-preserving sidebar-expand review plus one `TopBar` unit test

Verification:

- `npm run docs:check`
- `npm run phase157:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

Related closeout:

- [Phase_157_Sidebar_Expand_CTA_To_Route_Preserving_Full_Page_Shell.md](../../testing/Phase_157_Sidebar_Expand_CTA_To_Route_Preserving_Full_Page_Shell.md)
