# Direction 06 - Toolbar Product Benchmark And Discoverability

Date: 2026-04-23

Execution note:

- no executable slice has shipped under this direction yet

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Priority:

- `P5`

## Why This Direction Exists

The project already has a real popup and badge.

So the next toolbar question is no longer "should we add a popup?"
It is:

- is the current popup competitive enough
- does it communicate value fast enough
- does the store-facing product story match what users see after one click

This matters because toolbar-first extensions are increasingly judged on:

- one-click clarity
- quick value before setup fatigue
- compact but trustworthy status presentation
- a clear store listing and screenshot story

## Current Truth

As of 2026-04-23:

- the Chrome action already opens a popup
- the popup already shows cached shared state, snapshot freshness, quick actions, and deep links into the side panel
- the badge already has one explicit meaning: visible providers needing attention
- the side panel remains the canonical detailed workspace

External product signals:

- Chrome's `action` popup model is explicitly designed for click-to-open compact HTML surfaces
- if a popup is configured, `action.onClicked` does not fire for that click
- the popup size must stay within Chrome's popup bounds, which makes focused information design mandatory
- the current `Ai Usage 100%` store listing strongly markets toolbar-first visibility, live refresh, badge semantics, remembered context, and language switching
- Chrome Web Store discovery guidance emphasizes pleasant design, clear purpose, intuitive onboarding, and ease of use

## Direction Goal

Turn the already-shipped popup into a more competitive and better-positioned toolbar product surface while keeping the current data-contract honesty intact.

This direction should improve:

- first-click value
- first-run understanding
- store listing clarity
- popup information density
- discoverability without product overclaim

## Strategic Decisions

1. Benchmark product expectations separately from data-collection tactics.
   Competing extensions may use cookies, internal APIs, or request interception.
   Those patterns can inform expectations, but they should not automatically redefine this product's trust model.

2. Keep the popup compact.
   The popup should remain a quick-glance and routing layer, not a second full app shell.

3. Align store promises with the actual shipped contract.
   The listing, screenshots, popup copy, and in-product empty states should all tell the same story.

4. Treat onboarding as part of toolbar quality.
   A popup is only competitive if first-run states, permission prompts, and empty states are easy to understand.

5. Treat screenshots and listing assets as product work, not only marketing work.
   The Chrome Web Store ranks and features products partly on design quality, clarity, and usability.

## Success Criteria

- one toolbar click communicates the product's core value within seconds
- first-run popup and side-panel states are understandable without reading long docs
- store listing text and screenshots match the real current product contract
- popup density improves without duplicating the entire side panel
- badge, popup, and onboarding remain truthful about provider coverage

## Main Risks

- copying competitor behavior that conflicts with current privacy and trust boundaries
- overfilling the popup with too many provider-specific controls
- drifting into marketing claims that exceed current provider truth
- optimizing the store listing before the popup story is stable

## Recommendation

This direction is feasible and worthwhile, but it should build on the popup that already exists rather than restarting popup architecture work.

The right first slices are:

1. benchmark matrix
2. popup information-architecture tuning
3. first-run empty states and onboarding
4. store listing and screenshot alignment

## References

- Chrome `action` API:
  https://developer.chrome.com/docs/extensions/reference/api/action
- Chrome Web Store discovery:
  https://developer.chrome.com/docs/webstore/discovery/
- Chrome Web Store listing guidance:
  https://developer.chrome.com/docs/webstore/best-listing
- `Ai Usage 100%` Chrome Web Store listing:
  https://chromewebstore.google.com/detail/ai-usage-100%25/jjlkgogdgdflbifbmojbmleifblpekid

## Child TODO

- [06_1_Direction_Toolbar_Product_Benchmark_And_Discoverability_TODOs.md](./06_1_Direction_Toolbar_Product_Benchmark_And_Discoverability_TODOs.md)
