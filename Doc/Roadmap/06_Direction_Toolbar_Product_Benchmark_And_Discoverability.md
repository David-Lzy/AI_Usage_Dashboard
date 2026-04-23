# Direction 06 - Toolbar Product Benchmark And Discoverability

Date: 2026-04-23

Execution note:

- latest executable slice landed on `2026-04-23` through `Phase 130`

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
- the popup now also shows one compact `Start here / Next step` guidance card for:
  - no visible providers
  - missing host access
  - missing stored credential
  - blocked provider review
  - all-visible policy-only states
- the popup now also shows one compact `Setup coverage` summary that splits visible providers into:
  - `Live ready`
  - `Host access`
  - `Credentials`
  - `Policy-only`
- the popup setup-coverage card now also carries one explicit stage label:
  - `Start setup`
  - `Needs setup`
  - `Needs review`
  - `Contract-only`
  - `Ready`
- the popup now also suppresses the empty snapshot-status card when no provider is visible, and the remaining snapshot-status copy stays focused on freshness instead of repeating setup or review guidance
- the popup actions card now also becomes explicitly secondary whenever a guidance card is present, so the primary next step is no longer duplicated in the lower action row
- the popup header and top summary are now also popup-specific, so first-run toolbar states no longer inherit the side-panel flavored `Healthy / Needs Access / Needs Attention` summary labels
- the popup featured-provider cards now also use popup-specific status labels plus a state-first lead line, so setup, review, contract-only, and healthy cards stay aligned with the toolbar story before falling back to detailed contract context
- the popup featured-provider cards now also use stateful CTA routing, so setup blockers point back to `Settings`, contract-only cards point to `Dashboard`, and review states point to provider detail instead of every state pretending `Open detail` is the next step
- the popup featured-provider cards now also use one lower-density contract treatment, so card chips stay down to `contract + freshness` and healthy or contract-only cards no longer repeat the longer `Current shipped contract ...` prose as their second line
- the popup footer note now also uses one stateful `Surface roles` treatment, so the lower popup explainer no longer stays frozen as one static side-panel-style contract note across setup, review, policy-only, and healthy states
- the repo now also ships one repeatable popup width-range review for that setup-stage layer at `360px` and `420px`, across:
  - no visible providers
  - mixed setup state
  - policy-only coverage
  - healthy visible providers
- the popup featured-provider area now also changes hierarchy honestly:
  - `Needs attention`
  - `All clear`
  - `Current contract`
  - `Nothing to triage yet`
- the badge already has one explicit meaning: visible providers needing attention
- the side panel remains the canonical detailed workspace
- the repo now also ships one benchmark matrix grounded in current Chrome docs plus current competitor listing mirrors:
  - [Toolbar_Product_Benchmark_Matrix_2026-04-23.md](../Toolbar_Product_Benchmark_Matrix_2026-04-23.md)

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

`Phase 118` completed slices `1` and the first actionable part of `2` by shipping one benchmark matrix and one compact popup next-step guidance card.
`Phase 119` then continued slice `2` by making the featured-provider area itself stateful and truthful instead of leaving one fixed `Needs attention` shell across healthy and empty states.
`Phase 120` then continued slice `3` by making credential-backed setup states route directly to Settings from the popup instead of falling through to generic provider-detail guidance.
`Phase 121` then continued slice `3` by compressing visible-provider setup coverage into one scannable popup summary instead of forcing the user to infer setup breadth from individual cards alone.
`Phase 122` then continued slice `2` and `3` by tightening the setup-summary copy and adding one repeatable width-range review so that new onboarding density stays compact at realistic popup widths.
`Phase 123` then continued slice `2` and `3` by making the setup-coverage card itself stateful through one explicit stage hierarchy and adding one repeatable width-range review for those first-run setup stages.
`Phase 124` then continued slice `2` and `3` by trimming top-stack repetition: the popup now hides the empty snapshot card for no-provider states and keeps remaining snapshot copy focused on freshness rather than repeating setup guidance already carried elsewhere.
`Phase 125` then continued slice `2` and `3` by making the popup actions card explicitly secondary whenever a guidance card is present, removing the duplicated primary CTA from the lower action row while keeping broader routes available.
`Phase 126` then continued slice `2` and `3` by making the popup header copy and top summary specific to popup setup story, so first-run toolbar states now read as `Visible / Live ready / Setup blockers / Policy-only` instead of borrowing the broader dashboard summary vocabulary.
`Phase 127` then continued slice `2` and `3` by making featured-provider badges plus supporting copy popup-specific, so lower provider cards now stay aligned with the same setup and review story already established by the header, setup coverage, and guidance layers.
`Phase 128` then continued slice `2` and `3` by making featured-provider CTAs stateful, so setup blockers now route to settings, contract-only cards route to dashboard, and review states route to provider detail instead of every card reusing the same generic button label.
`Phase 129` then continued slice `2` and `3` by compressing featured-provider density, so chips are reduced to contract plus freshness and healthy or contract-only cards use shorter availability summaries instead of replaying the longer side-panel contract prose.
`Phase 130` then continued slice `2` and `3` by replacing the last static popup contract explainer with one lighter stateful `Surface roles` note, so the footer now tells the user which surface owns setup, contract review, provider review, or quick-glance context in the current state.

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
