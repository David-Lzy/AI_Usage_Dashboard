# Toolbar Competitive Fit Decision Matrix - 2026-04-24

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- dated snapshot

Status note:

- this file captures the competitive-fit decision view from `2026-04-24`
- it records which toolbar behaviors this repo should adopt, adapt, or reject based on current public competitor signals and current Chrome Web Store guidance

Purpose:

- turn competitive observations into explicit product decisions
- keep store-facing inspiration separate from trust-boundary drift
- give later popup polish and store-copy work one stable toolbar contract

## Sources

- Chrome `action` API:
  https://developer.chrome.com/docs/extensions/reference/api/action
- Chrome Web Store best listing guidance:
  https://developer.chrome.com/docs/webstore/best-listing
- Chrome Web Store discovery guidance:
  https://developer.chrome.com/docs/webstore/discovery/
- `Ai Usage 100%` listing mirror:
  https://chrome-stats.com/d/jjlkgogdgdflbifbmojbmleifblpekid
- `QuotaMeter` listing mirror:
  https://chrome-stats.com/d/mbbkamghkbadgggdnjpflfobkfaepbbo
- historical benchmark snapshot:
  [Toolbar_Product_Benchmark_Matrix_2026-04-23.md](./Toolbar_Product_Benchmark_Matrix_2026-04-23.md)

## Adopt

| Signal | Public evidence | Decision | Why |
| --- | --- | --- | --- |
| Toolbar-first value must be obvious in one click | Chrome Web Store guidance emphasizes clear purpose, intuitive onboarding, and ease of use; competitors market immediate toolbar utility. | `Adopt` | The popup must explain value in seconds instead of assuming the user will infer it from raw cards. |
| Store screenshots should show real product states | Chrome guidance says screenshots should show actual user experience and up-to-date functionality. | `Adopt` | This fits the repo's truth model and the new RDP Chrome workflow. |
| Listing copy should stay concise and feature-led | Chrome guidance recommends concise, informative descriptions with one overview paragraph plus short feature list. | `Adopt` | This matches the current popup story and reduces temptation to overclaim unsupported coverage. |
| Setup and onboarding clarity should be treated as ranking and quality work, not only UX polish | Chrome discovery guidance explicitly ties quality to clear purpose, intuitive onboarding, and ease of use. | `Adopt` | This validates the current popup setup-story track as real product work. |

## Adapt

| Competitor pattern | Public evidence | Decision | How this repo should adapt it |
| --- | --- | --- | --- |
| “Everything in one popup” dashboard positioning | QuotaMeter markets a unified popup dashboard across multiple services. | `Adapt` | Keep the popup compact and use the side panel for depth; adapt the clarity, not the full-surface scope. |
| Badge as a primary selling surface | `Ai Usage 100%` and QuotaMeter both imply ambient badge value. | `Adapt` | Keep the badge single-meaning and subordinate to the popup story instead of turning it into a dense multistate display. |
| Language support as a store-facing differentiator | `Ai Usage 100%` publicly advertises multiple languages. | `Adapt` | Treat listing localization as future leverage, but do not promise multilingual product support before `Direction 09` ships. |
| Remembered context and quick reopen behavior | `Ai Usage 100%` markets tab memory and instant reopen context. | `Adapt` | Preserve popup continuity where it helps orientation, but keep routes honest about whether setup, review, or dashboard depth owns the next step. |

## Reject

| Competitor or market pressure | Public evidence | Decision | Why this repo rejects it |
| --- | --- | --- | --- |
| Broad host capture or aggressive interception just to match feature breadth | `Ai Usage 100%` and QuotaMeter both advertise broader service reach and stronger collection posture than this repo's current trust boundary. | `Reject` | This project stays contract-first and does not widen permissions or hidden collection tactics for parity marketing. |
| Popup as a second full app shell | Competitive listings often imply a self-sufficient dashboard in the toolbar. | `Reject` | The popup should stay a quick-glance surface; deep contract review and settings remain side-panel work. |
| Store claims that imply unsupported live provider coverage | Competitors market wider service breadth, alerts, and unified monitoring. | `Reject` | This repo must keep the current provider truth boundary visible and must not promise live support the runtime does not ship. |
| Keyword-heavy or superlative listing language | Chrome guidance explicitly discourages repetitive or irrelevant keywords and generic superlatives. | `Reject` | Store copy should stay factual, compact, and contract-aligned. |

## Working Decisions For Next Slices

1. Use `RDP Chrome` as the source of truth for future store screenshots.
2. Keep the popup compact; do not chase “all data in one popup.”
3. Treat setup-story clarity as the main competitive wedge.
4. Defer multilingual store promises until `Direction 09` ships at least pilot locales.
5. Write store copy around current truthful scope:
   - quick glance
   - setup guidance
   - side-panel depth
   - honest provider coverage

## Result

The next toolbar/store slices should optimize for:

- truthful screenshot capture
- clearer popup-first value story
- concise listing claims

They should not optimize for:

- broader permissions
- inflated support claims
- a second full dashboard inside the popup
