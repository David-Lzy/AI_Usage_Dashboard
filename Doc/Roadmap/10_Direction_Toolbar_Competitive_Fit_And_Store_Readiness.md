# Direction 10 - Toolbar Competitive Fit And Store Readiness

Date: 2026-04-24

Document class:

- living strategy

Status note:

- this file is a living roadmap direction and should be refreshed when direction state, priority, or completed slices change

Execution note:

- first executable slice landed on `2026-04-24` through `Phase 141`
- second executable slice landed on `2026-04-24` through `Phase 142`
- this direction sharpens [Direction 06 - Toolbar Product Benchmark And Discoverability](./06_Direction_Toolbar_Product_Benchmark_And_Discoverability.md) into a more explicit next-stage productization track

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Priority:

- `P5`

## Why This Direction Exists

The popup is no longer missing.
It is already shipped and materially better than before.

The next question is:

- is the current toolbar surface competitive enough against the best available extensions
- and is the product story ready for store-facing assets, screenshots, and one-click user expectations

This is now a distinct direction because the project already has:

- a real popup
- a real badge
- stateful onboarding
- stateful featured-provider routing
- a first benchmark matrix

So the remaining work is not popup shell design.
It is competitive fit, screenshot-ready polish, and store readiness.

## Current Truth

As of 2026-04-24:

- the popup already has a compact setup story, featured-provider story, and stateful CTA hierarchy
- one toolbar benchmark matrix already exists:
  - [Toolbar_Product_Benchmark_Matrix_2026-04-23.md](../Toolbar_Product_Benchmark_Matrix_2026-04-23.md)
- the repo now also ships one explicit competitive-fit decision matrix:
  - [Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md](../Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md)
- the repo now also ships one maintained screenshot storyboard pack for truthful store captures:
  - [Store_Screenshot_Storyboard.md](../Store_Screenshot_Storyboard.md)
- the repo now also ships one maintained screenshot-capture runbook plus one generator-backed baseline capture pack:
  - [Store_Screenshot_Capture_Runbook.md](../testing/Store_Screenshot_Capture_Runbook.md)
  - [Store_Screenshot_Capture_Packs.md](../testing/Store_Screenshot_Capture_Packs.md)
- the popup still has some remaining overlap between top story, featured card, and lower surface-role explanation
- the repo still does not yet ship a full store-readiness pack for listing copy hierarchy and localized listing variants
- the project now has an RDP Chrome environment available for truthful extension-mode capture and review

External signals:

- Chrome's `action` popup model rewards quick, compact, click-first surfaces
- Chrome Web Store discovery guidance emphasizes pleasant design, clear purpose, and ease of use
- current competitors already market toolbar-first value, remembered state, multi-language support, and faster setup recognition

## Direction Goal

Turn the current popup from "already shipped and increasingly polished" into one clearly competitive, store-ready toolbar product surface.

## Strategic Decisions

1. Benchmark against surface behavior, not hidden data tactics.
   Competitor use of internal APIs or more aggressive collection does not automatically change this product's trust model.

2. Keep popup scope compact.
   The side panel remains the deep workspace.
   The popup should win on clarity, not on feature count.

3. Use RDP Chrome as the primary truthful capture environment.
   Store screenshots and last-mile popup QA should prefer the real unpacked extension runtime.

4. Align screenshots, listing copy, and popup behavior.
   The store should promise exactly what the popup and side panel now actually do.

5. Treat setup story as the main competitive differentiator.
   The popup should make first-run, blocked, policy-only, and healthy states legible faster than competing surfaces.

## Success Criteria

- one toolbar click communicates value and next step within seconds
- popup copy, badge meaning, and screenshot story all match
- the repo has a reusable store-readiness pack for screenshots and listing structure
- extension-mode screenshots are captured from a truthful runtime, not only from browser preview
- benchmark refreshes make explicit which competitor behaviors are adopted, adapted, or rejected

## Main Risks

- adding too many store-facing promises before the product contract is stable
- letting screenshot polish drift away from actual shipped states
- comparing against competitor claims without preserving the current trust boundary
- continuing popup micro-polish without deciding what the store story actually is

## Recommendation

This direction is feasible and should continue after the current popup IA work.

Recommended rollout:

1. refresh competitive benchmark with accept or reject conclusions
2. tighten popup story overlap using the real extension runtime
3. define one screenshot storyboard pack
4. draft one truthful store-copy hierarchy
5. only then prepare broader listing-localization work

`Phase 141` completed the first executable part of steps `1` and `3` by shipping one current competitive-fit decision matrix with explicit `adopt / adapt / reject` outcomes and one maintained screenshot storyboard pack for truthful extension-mode capture.

`Phase 142` completed the next executable part of step `3` by shipping one maintained screenshot-capture runbook, one generator-backed baseline capture pack, and one repeatable review pass for the store screenshot workflow.

## References

- Chrome `action` API:
  https://developer.chrome.com/docs/extensions/reference/api/action
- Chrome Web Store discovery:
  https://developer.chrome.com/docs/webstore/discovery/
- Chrome Web Store best listing:
  https://developer.chrome.com/docs/webstore/best-listing
- `Ai Usage 100%` listing:
  https://chromewebstore.google.com/detail/ai-usage-100%25/jjlkgogdgdflbifbmojbmleifblpekid
- `Ai Usage 100%` listing mirror:
  https://chrome-stats.com/d/jjlkgogdgdflbifbmojbmleifblpekid
- `QuotaMeter` listing:
  https://chromewebstore.google.com/detail/quotameter/mbbkamghkbadgggdnjpflfobkfaepbbo
- [Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md](../Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md)
- [Store_Screenshot_Storyboard.md](../Store_Screenshot_Storyboard.md)
- [Store_Screenshot_Capture_Runbook.md](../testing/Store_Screenshot_Capture_Runbook.md)
- [Store_Screenshot_Capture_Packs.md](../testing/Store_Screenshot_Capture_Packs.md)

## Child TODO

- [10_1_Direction_Toolbar_Competitive_Fit_And_Store_Readiness_TODOs.md](./10_1_Direction_Toolbar_Competitive_Fit_And_Store_Readiness_TODOs.md)
