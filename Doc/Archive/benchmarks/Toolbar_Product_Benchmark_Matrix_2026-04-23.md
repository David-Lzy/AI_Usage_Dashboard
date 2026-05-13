# Toolbar Product Benchmark Matrix - 2026-04-23

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- dated snapshot

Status note:

- this file captures the toolbar benchmark view from `2026-04-23`
- it is useful as a historical benchmark snapshot, but it should not be mistaken for a continuously refreshed current-state competitor audit

Purpose:

- capture the current toolbar-first product expectations around popup clarity, onboarding, and store-facing discoverability
- separate popup surface expectations from any competitor data-collection tactics that do not fit this repo's trust model

## Sources

- Chrome `action` API:
  https://developer.chrome.com/docs/extensions/reference/api/action
- Chrome Web Store listing guidance:
  https://developer.chrome.com/docs/webstore/best-listing
- Chrome Web Store discovery guidance:
  https://developer.chrome.com/docs/webstore/discovery/
- `Ai Usage 100%` listing mirror:
  https://chrome-stats.com/d/jjlkgogdgdflbifbmojbmleifblpekid
- `QuotaMeter` listing mirror:
  https://chrome-stats.com/d/mbbkamghkbadgggdnjpflfobkfaepbbo

## Matrix

| Product | Entry Pattern | One-Click Story | Badge / Ambient Signal | Onboarding Signal | Language / Store Signal | Trust-Model Note | What This Repo Should Learn |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AI Usage Dashboard (current before `Phase 118`) | Chrome action opens a popup; side panel stays canonical detail surface. | Quick glance, snapshot freshness, quick actions, featured providers. | Badge means count of visible providers needing attention. | Weakest area before this slice: no single explicit `Start here` or `Next step` card in the popup. | English-only product today. | Strongly contract-first and privacy-constrained. | Keep the compact popup shell, but tighten first-click guidance. |
| Ai Usage 100% | Toolbar-first positioning is explicit in the listing and screenshots. | Markets fast usage visibility, remembered context, refresh, and language switching from a compact surface. | Listing strongly implies the badge and popup are both core signals. | Store-facing copy emphasizes immediate usefulness after one click. | Listing calls out language switching as part of product value. | Data-collection tactics are not the point of reference here. | Users expect a toolbar popup to explain value and next steps immediately, not only show raw cards. |
| QuotaMeter | Also toolbar-first and quick-glance oriented. | Emphasizes compact usage monitoring across supported AI products. | Ambient value is implied through fast glanceability rather than full-app depth. | Listing is simpler, but still makes the toolbar surface feel like the primary promise. | Less emphasis on language than `Ai Usage 100%`. | Treat as a surface benchmark, not as a permission benchmark. | Compact layout can stay small if the story is sharper. |
| Chrome platform guidance | `action.default_popup` is the supported compact entry model. | The popup should communicate purpose quickly because click handlers do not fire when a popup is configured. | Ambient signals need one explicit meaning. | Store guidance rewards clear purpose, pleasant design, and intuitive onboarding. | Listing assets and screenshots are product work, not only marketing work. | Chrome guidance does not justify overclaiming product coverage. | The popup must explain itself in seconds and align with screenshots plus listing language. |

## Benchmark Conclusions

1. The repo does not need a new popup architecture.
   The current architecture already matches Chrome's supported `action` popup model.

2. The current product gap is onboarding clarity, not raw surface count.
   The popup already has snapshot status, quick actions, and featured providers, but it did not previously explain the most important next action strongly enough.

3. Competing listings sell toolbar value in one sentence.
   This repo should match that clarity in-product without copying unsupported data-collection tactics.

4. The most actionable near-term popup improvements are:
   - one explicit `Start here` state for `no visible providers`
   - one explicit `Next step` state for `missing host access`
   - one compact pointer toward provider detail when a specific provider is blocked
   - one clearer bridge between popup copy and eventual store screenshots

## Rejected References

- hidden cookie scraping
- internal API usage that exceeds the current trust boundary
- turning the popup into a second full app shell
- store claims that exceed the current provider contract
