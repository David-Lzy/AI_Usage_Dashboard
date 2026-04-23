# Direction 03 - Toolbar Popup And Badge Entry

Date: 2026-04-22

Document class:

- living strategy

Status note:

- this file is a living roadmap direction and should be refreshed when direction state, priority, or completed slices change

Execution note:

- the latest executable slice landed on `2026-04-23` through `Phase 52`

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Priority:

- `P2`

## Why This Direction Exists

The current project is side-panel first.

That is valid, but current market patterns show a different default expectation:

- pin the extension
- click once
- get a compact quota summary immediately

This does not require abandoning the side panel.
It requires adding a better quick-entry layer.

## Current Truth

As of 2026-04-23:

- the manifest now defines an `action` with `default_popup`
- the toolbar popup now shows a compact shared-state summary plus an `Open dashboard` handoff into the side panel
- featured popup providers can now open the matching side-panel detail route instead of always dropping the user at the dashboard root
- the popup now also exposes a direct settings handoff and clearer quick-action copy
- the popup now makes cached snapshot freshness explicit instead of forcing users to infer it from provider cards alone
- the background worker no longer uses direct `openPanelOnActionClick` behavior as the main entry
- the action badge now shows the number of visible providers currently needing attention

Chrome platform constraints matter here:

- action popups are small HTML surfaces with a maximum size of `800x600`
- if an action popup is defined, `action.onClicked` does not fire for that click
- a side panel can still be opened from user interaction through `chrome.sidePanel.open()`

## External Market Signals

Two current store examples point in the same direction:

- `Ai Usage 100%` markets itself as "right in the toolbar" and also advertises a toolbar badge
- `QuotaMeter` markets a clean popup as the main quota surface

This means "toolbar-first quick glance" is now a product expectation, not a niche preference.

## Direction Goal

Add a fast, compact, low-friction toolbar entry that:

- gives the user an immediate status overview
- keeps the side panel as the richer workspace for details and settings
- does not fragment the underlying data model

## Strategic Decisions

1. Keep the side panel.
   It is still the right place for deep settings, source diagnostics, and multi-provider drill-down.

2. Add a popup, not a replacement shell.
   The popup should summarize and route, not duplicate every screen.

3. Add a badge only if its meaning stays obvious.
   A badge is useful for one high-priority signal, but not for dense multi-provider state.
   Current shipped meaning:
   the badge shows the count of visible providers whose current state is not healthy.

4. Keep the action flow simple.
   Recommended stack:
   - badge for ambient signal
   - popup for quick glance
   - `Open dashboard` for the side panel

## Success Criteria

- the user can get value from one toolbar click
- the side panel remains the canonical detailed surface
- popup, badge, and side panel all read from one shared app-state model
- the badge meaning is documented in one sentence

## Main Risks

- duplicating the entire side panel into an undersized popup
- inventing too many badge states
- letting popup-only UI diverge from the main product truth

## Child TODO

- [03_1_Direction_Toolbar_Popup_And_Badge_Entry_TODOs.md](./03_1_Direction_Toolbar_Popup_And_Badge_Entry_TODOs.md)
