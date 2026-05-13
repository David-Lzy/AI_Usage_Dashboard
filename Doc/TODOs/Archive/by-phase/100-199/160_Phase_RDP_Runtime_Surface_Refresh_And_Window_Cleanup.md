# Phase 160 - RDP Runtime Surface Refresh And Window Cleanup

Completion date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this archived phase marks the `Direction 10.2` RDP runtime QA refresh slice as completed

Completion summary:

- added runtime-window close support and close-after-capture behavior to the shared RDP capture helper
- extended the smoke-capture CLI to current full-page dashboard, settings, and provider-detail routes
- added one explicit runtime-window cleanup command for stale AI Usage Dashboard popup and extension windows in the RDP Chrome session
- updated the request-bound screenshot runner so seed windows and captured runtime windows do not accumulate between screenshots
- captured one refreshed real RDP runtime QA set for popup, sidepanel-settings, full-page-dashboard, full-page-settings, and full-page-provider-detail-codex
- made the popup smoke-capture boundary explicit: it is real extension runtime evidence, but not a pixel-identical toolbar-bubble screenshot

Verification:

- `npm run phase160:review`
- `npm run typecheck`
- `npm run test`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

Related closeout:

- [Phase_160_RDP_Runtime_Surface_Refresh_And_Window_Cleanup.md](../../../../testing/Archive/phase-reports/100-199/Phase_160_RDP_Runtime_Surface_Refresh_And_Window_Cleanup.md)
