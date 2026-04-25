# Direction 10.2 - Surface Expansion And Ambient Theme Controls TODOs

Date: 2026-04-26

Document class:

- living strategy

Status note:

- direction created on `2026-04-24`
- first executable slice landed on `2026-04-24` through `Phase 155`
- second executable slice landed on `2026-04-24` through `Phase 156`
- third executable slice landed on `2026-04-24` through `Phase 157`
- fourth executable slice landed on `2026-04-24` through `Phase 158`
- fifth executable slice landed on `2026-04-24` through `Phase 159`
- sixth executable slice landed on `2026-04-24` through `Phase 160`
- compact popup progress-density follow-up landed on `2026-04-26` through `Phase 209`
- per-surface progress-style preference follow-up landed on `2026-04-26` through `Phase 210`
- this child TODO turns the agreed popup / sidebar / full-page expansion contract into the next executable `Direction 10` track

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 10 - Toolbar Competitive Fit And Store Readiness](./10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)

Related design contract:

- [Surface_Expansion_And_Ambient_Theme_Controls.md](../Surface_Expansion_And_Ambient_Theme_Controls.md)

## Agreed Surface Contract

- popup stays compact and task-focused:
  - quick status
  - quick freshness
  - quick next-step actions
  - no attempt to become a second full workspace
- sidebar stays richer and operational:
  - settings
  - source diagnostics
  - provider detail
  - broader multi-provider dashboard context
- full-page shell is a separate extension surface:
  - not a browser-preview fallback
  - not a generic external website tab
  - not a reset to dashboard when the user is already deep inside sidebar state

## Agreed Expansion Behavior

- popup expand opens one dashboard full-page tab
- sidebar expand opens one route-preserving full-page shell
- full-page shell should reuse the existing route-state model instead of inventing a disconnected navigation contract
- popup and sidebar should keep their current role boundaries even after full-page entry exists

## Agreed Theme-Control Behavior

- a small light-dark toggle appears in popup and sidebar
- the full-page shell inherits the sidebar top-bar control
- the small toggle only handles immediate light/dark switching
- Settings remains the only full theme configuration surface for:
  - `system`
  - preset accents
  - custom seed
- the quick toggle must not silently rewrite preset or custom-seed state

## Implementation Ladder

### A. Full-Page Shell Plumbing

- add one extension full-page shell entry
- define how it reuses current sidepanel route state
- define how popup opens dashboard there
- define how sidebar opens the current route there
- verify the shell preserves shared data state and theme state
- `Phase 155` completed the first shared route-entry contract by shipping:
  - one shared sidepanel/full-page path helper
  - one explicit `?surface=full-page` route contract
  - one repeatable preview review for dashboard, settings, and provider-detail full-page states

### B. Popup Expand CTA

- add one compact expand control in the popup header or top action row
- keep it visually secondary to the primary setup / refresh action
- route it to the dashboard full-page tab
- re-review popup density after the new top action lands
- `Phase 156` completed this popup-only expansion slice by shipping:
  - one compact popup-header expand control
  - one dashboard full-page tab opener for popup runtime
  - one repeatable popup-expand review for the full-page dashboard target
- current boundary after `Phase 156`:
  - popup header expand now opens the full-page dashboard tab
  - existing popup quick actions still keep their current sidepanel handoff contract in this slice

### C. Sidebar Expand CTA

- add one compact expand control in the sidebar top bar
- preserve the current route:
  - dashboard
  - settings
  - provider detail
  - future debug or review surfaces only if intentionally supported
- define what happens when the current route is not valid for full-page mode
- `Phase 157` completed this route-preserving sidebar expansion slice by shipping:
  - one optional top-bar `Tab` control across dashboard, settings, and provider-detail routes
  - one shared current-route full-page opener inside the standard sidepanel app
  - one rule that hides the expand control once the runtime is already inside `?surface=full-page`
  - one repeatable preview review for dashboard, settings, and provider-detail route-preserving expand targets
- current boundary after `Phase 157`:
  - popup expand opens the dashboard full-page tab
  - sidebar expand preserves dashboard, settings, and provider-detail routes into the full-page shell
  - the next runtime slice is the ambient popup plus sidebar light-dark toggle

### D. Ambient Theme Toggle Wiring

- add one small light/dark toggle to popup
- add one small light/dark toggle to sidebar
- make full-page shell inherit the sidebar control
- define explicit behavior when the saved theme mode is currently `system`
- keep Settings as the authoritative advanced theme surface
- `Phase 158` completed this ambient theme slice by shipping:
  - one shared quick-toggle helper that flips between explicit light and dark from the current resolved mode
  - one popup-header quick theme toggle
  - one shared sidepanel/full-page top-bar quick theme toggle across standard operational routes
  - one repeatable popup plus sidebar plus full-page runtime review for the quick toggle
- current boundary after `Phase 158`:
  - popup expand and sidebar expand are both in place
  - popup and sidepanel quick theme toggles now ship for standard operational surfaces
  - full-page shell inherits that same top-bar toggle
  - the next runtime slice is motion polish for expand/open transitions

### E. Motion Polish

- add one restrained open / expand animation language
- do not fake true cross-window shared-element motion
- prefer one lightweight continuity treatment that feels intentional without becoming brittle
- preserve reduced-motion behavior
- `Phase 159` completed this motion-polish slice by shipping:
  - one short-lived full-page entry helper that records whether the new tab came from popup expand or sidepanel expand
  - one full-page boot hook that consumes that entry hint once and exposes it as a runtime dataset marker
  - one restrained source-aware motion treatment for popup-driven and sidepanel-driven full-page entry
  - one reduced-motion guard that keeps those entry animations disabled when motion reduction is requested
  - one repeatable review for popup-expand, sidepanel-expand, and reduced-motion full-page entry behavior
- current boundary after `Phase 159`:
  - popup expand now seeds a popup-specific full-page entry hint before opening the dashboard tab
  - sidepanel expand now seeds a sidepanel-specific full-page entry hint before opening the route-preserving full-page shell
  - standard full-page routes now use restrained source-aware entry motion while reduced-motion mode keeps the full-page shell animation-free
  - the next runtime slice is the RDP extension-mode QA refresh for popup, sidepanel, and full-page captures after the shipped expand, theme, and motion work

### F. RDP Extension-Mode QA Refresh

- capture popup after the new expand and theme controls land
- capture sidebar after the new expand and theme controls land
- capture the full-page shell in dashboard and route-preserving states
- close popup or tabs between captures to avoid session buildup and OOM in RDP Chrome
- `Phase 160` completed this runtime QA refresh slice by shipping:
  - one runtime-window cleanup helper that closes stale AI Usage Dashboard popup and extension windows in the RDP Chrome session
  - one upgraded smoke-capture helper that now supports popup, standard sidepanel, and full-page dashboard/settings/provider-detail routes
  - one hygiene update for the request-bound RDP screenshot runner so seed windows and captured runtime windows do not accumulate between screenshots
  - one repeatable real RDP runtime review that refreshed popup, sidepanel-settings, full-page-dashboard, full-page-settings, and full-page-provider-detail captures from the unpacked extension
- current boundary after `Phase 160`:
  - RDP runtime refresh now has current evidence for popup, sidepanel, and standard full-page surfaces after the shipped expand, quick-theme, and motion slices
  - the helper now closes the extension windows it opens, so repeated runtime QA passes no longer depend on manual cleanup alone
  - popup app-window smoke capture remains QA-only evidence and is not a pixel-identical replacement for the true toolbar action bubble
  - the next execution line now moves to `Direction 10.3` store asset-pack refresh on top of the updated runtime evidence

## Acceptance Criteria

- popup remains compact and readable after expand plus theme controls are added
- structured popup usage windows render as compact circular progress rather than more long quota text
- popup, sidebar, and full-page tab can independently choose line or circle quota progress
- sidebar still reads as the operational surface rather than a stretched popup
- popup expand always opens the dashboard full-page tab
- sidebar expand preserves the current route when full-page mode supports it
- quick light/dark toggle works in popup, sidebar, and full-page shell
- quick toggle does not overwrite preset or custom-seed choices
- Settings still exposes the full theme contract and remains the only advanced theme surface
- reduced-motion remains honored

## RDP Runtime Review Checklist

- reload the unpacked extension after a fresh build
- close already-open popup or extension tabs before opening new runtime surfaces
- verify popup width remains stable when opened from the toolbar icon
- verify the new expand action opens the intended target surface instead of a preview fallback
- verify the quick light/dark toggle updates the current runtime surface immediately
- verify full-page shell screenshots are collected from real extension-mode runtime, not preview-only browser tabs

## Planned Numbered Slices

1. full-page shell route and extension entry plumbing - completed in `Phase 155`
2. popup expand CTA to dashboard full-page tab - completed in `Phase 156`
3. sidebar expand CTA to route-preserving full-page shell - completed in `Phase 157`
4. popup plus sidebar light-dark toggle button - completed in `Phase 158`
5. animation and motion polish for expand/open transitions - completed in `Phase 159`
6. RDP Chrome runtime QA and screenshot refresh - completed in `Phase 160`

## Out Of Scope

- replacing the sidepanel with a single full-page-only app
- exposing full theme configuration directly inside the popup header
- inventing a separate product language for full-page mode
