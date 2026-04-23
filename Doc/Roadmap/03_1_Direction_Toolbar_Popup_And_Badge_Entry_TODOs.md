# Direction 03.1 - Toolbar Popup And Badge Entry TODOs

Date: 2026-04-22

Status note:

- `Phase 48` completed the first executable slice on `2026-04-23` by shipping a compact toolbar popup that reuses the shared app-state model and opens the side panel on demand
- `Phase 49` completed the next executable slice on `2026-04-23` by shipping an action badge that counts visible providers needing attention
- `Phase 50` completed the next executable slice on `2026-04-23` by shipping deep-link handoff from popup featured providers into side-panel detail routes
- `Phase 51` completed the next executable slice on `2026-04-23` by shipping direct settings handoff and clearer quick actions inside the popup
- `Phase 52` completed the next executable slice on `2026-04-23` by making cached snapshot freshness explicit inside the popup

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 03 - Toolbar Popup And Badge Entry](./03_Direction_Toolbar_Popup_And_Badge_Entry.md)

## Detailed TODOs

### A. Entry Architecture

- decide the final click behavior:
  - popup only
  - popup with "open side panel" button
  - side panel fallback when popup is disabled
- define whether the popup is global or tab-sensitive
- current shipped baseline:
  - the action now opens a popup
  - the popup includes `Open dashboard` to open the side panel
  - the popup reads the shared stored app state through a lightweight `app:read-state` path instead of running a full sync on every open
  - the side panel now accepts hash-based routes for dashboard, settings, and provider detail so popup actions can deep-link into the correct detailed screen

### B. Popup Information Design

- show only compact, high-signal content:
  - summary strip
  - top one to three provider warnings
  - last refresh status
  - one primary call to action into the full dashboard
- keep settings and deep source diagnostics out of the popup
- current shipped baseline:
  - the popup shows the summary strip, a compact quick-glance contract note, and up to three featured providers
  - the popup now also shows a snapshot-status card so cached freshness and mixed state are explicit
  - featured popup providers now have an `Open detail` handoff that targets the matching side-panel provider route
  - the popup now also has direct quick actions for dashboard and settings so provider controls are one click away

### C. Badge Semantics

- test candidate badge meanings:
  - number of providers needing attention
  - worst severity only
  - most relevant provider remaining percentage
- choose one interpretation and reject the rest
- current shipped baseline:
  - the badge shows the number of visible providers whose current state is not healthy
  - warning vs error color comes from the worst visible provider state in that count
  - the product does not currently overload the badge with provider names, percentages, or per-plan numbers

### D. Shared State And Navigation

- reuse the existing app-state and view-model logic instead of creating popup-only data paths
- add a dedicated popup route tree only if the shared side-panel route tree is too heavy
- define how popup actions can open the side panel through a user gesture

### E. Verification

- verify popup sizing on narrow and wide Chrome layouts
- verify badge updates stay cheap and readable
- verify the action behavior remains understandable after pinning

## Out Of Scope

- replacing the side panel with a popup
- badge animations
- provider-specific popup settings panels
