# Store Screenshot Storyboard

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the current maintained storyboard for truthful Chrome Web Store screenshot capture
- `Phase 296` archived the earlier mixed store-candidate pack after RDP Chrome capture
- `Phase 493` archived the public-readiness screenshot set for the open-source/store handoff
- refresh it when the popup story, provider truth boundary, store positioning, or capture workflow changes materially

Purpose:

- define the minimum truthful screenshot pack for store-facing assets
- keep screenshot order aligned with the popup and full-depth workspace product story
- force screenshot capture to come from real extension-mode runtime, not static mocks

## Capture Rules

1. Use `RDP Chrome` with the unpacked extension reloaded from current `dist/`.
2. Capture from the real extension runtime whenever the screenshot is intended for store use.
3. Keep screenshots aligned with Chrome Web Store guidance:
   - actual user experience
   - latest shipped functionality
   - minimal text in the image itself
4. Do not stage unsupported providers or fake healthy states that the runtime cannot currently reproduce honestly.
5. If a screenshot is resized, cropped, or uses an app-window instead of a native toolbar bubble, record that boundary in capture notes.
6. Do not claim light-mode or split light/dark visuals unless those pixels come from a real light-mode capture pass.

## Current Candidate Pack

The current public-readiness candidate pack is:

1. toolbar popup quick glance with provider cards and quota rings
2. full-page dashboard overview with multiple provider cards
3. Codex provider detail with usage-window/source-boundary review
4. Settings overview showing language/theme/sync/badge/icon/progress configuration
5. Settings quick-setup and appearance controls showing the provider carousel and display controls

The screenshots were captured from RDP Chrome on `2026-05-16` and archived as
[2026-05-16-public-store-readiness-request-archive](../testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/README.md).

## Screenshot Storyboard Order

### 1. Toolbar popup quick glance

- Surface:
  - toolbar popup app-window runtime capture
- Runtime state:
  - current dark-mode provider quick-glance state
- Claim it proves:
  - one click gives a compact AI usage snapshot
- Must visibly show:
  - popup header, provider card, quota/progress visualization, and settings/tab actions

### 2. Dashboard overview

- Surface:
  - full-page shell `Dashboard`
- Runtime state:
  - current provider overview state
- Claim it proves:
  - one dashboard collects AI coding quota signals and provider status
- Must visibly show:
  - dashboard navigation, provider cards, quota/progress display, and Material 3 framing

### 3. Provider detail contract

- Surface:
  - full-page provider detail
- Runtime state:
  - Codex usage-window detail
- Claim it proves:
  - provider cards expose useful usage-window detail without claiming one absolute balance
- Must visibly show:
  - provider status, remaining percentages, reset timing, diagnostic/source sections, and source-truth context

### 4. Settings overview and theme controls

- Surface:
  - full-page `Settings`
- Runtime state:
  - current dark-mode settings surface
- Claim it proves:
  - users can tune language, theme, sync, toolbar badge/icon, and progress display
- Must visibly show:
  - settings navigation, theme/language controls, appearance/sync controls, and stable responsive layout

### 5. Quick setup and appearance

- Surface:
  - focused Settings quick-setup/appearance area
- Runtime state:
  - current provider setup and appearance controls
- Claim it proves:
  - provider setup and visual customization stay in one extension workspace
- Must visibly show:
  - provider carousel or setup controls plus appearance/sync controls

## Optional Promo Follow-Up

The user asked whether a light/dark split promotional image would help. It would,
but it should not be fabricated from the current dark-mode screenshots. A future
promo pass should:

- capture the same store-ready surface once in light mode and once in dark mode
- compose a `1280x800` split only from those real runtime captures
- record the source captures and composition notes in a new screenshot archive

## Screenshot-to-Claim Map

| Screenshot | Main store claim |
| --- | --- |
| 1 | Quick glance in one click |
| 2 | One dashboard collects quota and status |
| 3 | Provider detail keeps source boundaries visible |
| 4 | Settings covers language, theme, sync, badge, icon, and progress display |
| 5 | Quick setup and appearance controls stay inside the extension |

## Do Not Capture

- preview-only states that are not reproducible in extension mode
- unsupported provider combinations presented as healthy
- dark screenshots described as light-mode or split-mode assets
- screenshots whose only story is internal tooling or debug routes
- text-heavy mockups that exceed what the product actually shows

## Related Docs

- [Store_Screenshot_Selection_Pack.md](./Store_Screenshot_Selection_Pack.md)
- [Store_Listing_Copy_Pack.md](./Store_Listing_Copy_Pack.md)
- [Store_Public_Release_6_Locale_Handoff.md](./Store_Public_Release_6_Locale_Handoff.md)
- [Direction 10 - Toolbar Competitive Fit And Store Readiness](../Roadmap/10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)
