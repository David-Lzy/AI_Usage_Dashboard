# Store Screenshot Storyboard

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the current maintained storyboard for truthful Chrome Web Store screenshot capture
- `Phase 161` now treats the first archived screenshot set as a historical baseline rather than the final submission pack after the popup/full-page surface-expansion line
- refresh it when the popup story, provider truth boundary, store positioning, or capture workflow changes materially

Purpose:

- define the minimum truthful screenshot pack for store-facing assets
- keep screenshot order aligned with the popup and full-depth workspace product story
- force screenshot capture to come from real extension-mode runtime, not only from browser preview

## Capture Rules

1. Use `RDP Chrome` with the unpacked extension reloaded from current `dist/`.
2. Capture from the real extension runtime, not from standalone preview, whenever the screenshot is intended for store use.
3. Keep screenshots aligned with Chrome Web Store guidance:
   - actual user experience
   - latest shipped functionality
   - minimal text in the image itself
4. Popup screenshots intended for final submission should use the native toolbar action bubble.
5. Popup app-window smoke capture is still valuable QA evidence, but it is not the final replacement for the real toolbar bubble.
6. Use the popup as the first three screenshots only; use the full-page shell for depth proof now that popup/sidebar expand is shipped.
7. Do not stage unsupported providers or fake healthy states that the runtime cannot currently reproduce honestly.

## Screenshot Storyboard Order

### 1. Toolbar-first quick glance

- Surface:
  - native toolbar popup bubble
- Runtime state:
  - healthy or near-healthy visible-provider state
- Claim it proves:
  - one click gives a compact, readable AI usage snapshot
- Must visibly show:
  - popup header, top summary, setup coverage, featured provider, and badge-compatible quick-glance framing

### 2. Setup guidance

- Surface:
  - native toolbar popup bubble
- Runtime state:
  - mixed setup blockers
- Claim it proves:
  - the product tells the user what to do next instead of only showing raw usage cards
- Must visibly show:
  - guidance card, setup stage, and stateful CTA

### 3. Honest contract-only or policy-only state

- Surface:
  - native toolbar popup bubble
- Runtime state:
  - policy-only or contract-only provider mix
- Claim it proves:
  - the extension is honest about provider coverage and does not fake live precision
- Must visibly show:
  - setup or contract story without pretending unsupported live data exists

### 4. Settings and setup depth

- Surface:
  - full-page shell `Settings`
- Runtime state:
  - real setup-oriented state
- Claim it proves:
  - setup ownership lives in the deeper workspace instead of a bloated popup
- Must visibly show:
  - theme and source/setup controls with enough surrounding context to read as an expanded extension workspace

### 5. Provider or dashboard depth

- Surface:
  - full-page shell `Provider detail` by default, `Dashboard` if it tells the clearer truthful story
- Runtime state:
  - truthful detail-review state
- Claim it proves:
  - the expanded workspace owns deeper review, contract context, and provider detail
- Must visibly show:
  - one deeper inspection surface that clearly extends beyond the popup quick-glance role

## Optional Sixth Screenshot

- Surface:
  - theme or audit-related workspace only if it directly supports the store story
- Default decision:
  - omit unless it clarifies a real user value without diluting the toolbar-first narrative

## Screenshot-to-Claim Map

| Screenshot | Main store claim |
| --- | --- |
| 1 | Quick glance in one click |
| 2 | Clear next step when setup is blocked |
| 3 | Honest provider coverage |
| 4 | Setup belongs to a deeper workspace |
| 5 | Detailed review belongs to the expanded workspace |

## Current Baseline Note

- the first archived screenshot set remains one truthful historical evidence package
- after `Phase 161`, that first archive is no longer the final recommended submission set because the shipped popup/full-page surface contract changed materially
- the next store-asset slice should create one refreshed screenshot request against this storyboard instead of reusing the first archive unchanged

## Do Not Capture

- preview-only states that are not reproducible in extension mode
- unsupported provider combinations presented as healthy
- popup app-window smoke captures as the final replacement for native toolbar-bubble screenshots
- screenshots whose only story is internal tooling or debug routes
- text-heavy mockups that exceed what the product actually shows

## Related Docs

- [Store_Screenshot_Selection_Pack.md](./Store_Screenshot_Selection_Pack.md)
- [Direction 10 - Toolbar Competitive Fit And Store Readiness](./Roadmap/10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)
- [Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md](./Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md)
- [Toolbar_Product_Benchmark_Matrix_2026-04-23.md](./Toolbar_Product_Benchmark_Matrix_2026-04-23.md)
