# Strategic Directions Index

Date: 2026-04-22

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Purpose:

- capture the next high-level product directions after the currently queued release work
- separate strategic direction-setting from the active numbered phase queue
- keep the roadmap honest about what is already shipped, what is partially solved, and what is still exploratory

Important scope note:

- these roadmap files are not replacements for the active phase files in `Doc/TODOs/`
- the numbered release queue is closed through `Phase 42`; the next work should now come from the roadmap directions below

## Current Truth Snapshot

As of 2026-04-23:

- the numbered phase queue is completed through `Phase 42`
- `Phase 41` is now resolved for the narrowed RC selected on `2026-04-23`
- `Phase 42` has packaged `0.1.0-rc.2` and closed the release-closeout track for the narrowed RC
- `Phase 43` completed the first `Direction 02` slice by productizing source-fidelity semantics in the side panel
- `Phase 44` completed the next `Direction 02` slice by productizing trust-boundary and access-model semantics in the side panel
- `Phase 45` completed the next `Direction 02` slice by productizing provider-contract semantics for shipped and deferred paths in the side panel
- `Phase 46` completed the next `Direction 02` slice by productizing provider-contract visibility on the dashboard overview
- `Phase 47` completed the next `Direction 02` slice by productizing graduation-gate semantics for deferred provider contracts
- `Phase 48` completed the first `Direction 03` slice by shipping a compact toolbar popup that hands off into the full side panel
- `Phase 49` completed the next `Direction 03` slice by shipping an action badge whose meaning is the count of visible providers needing attention
- `Phase 50` completed the next `Direction 03` slice by shipping popup-to-sidepanel deep-link handoff for featured provider detail
- `Phase 51` completed the next `Direction 03` slice by shipping popup quick actions for dashboard and settings
- `Phase 52` completed the next `Direction 03` slice by making cached popup snapshot freshness explicit
- `Phase 53` completed the first `Direction 04` slice by shipping a Settings overview summary, sticky top actions, section-jump controls, and an earlier `720px` responsive collapse point
- `Phase 54` completed the next `Direction 04` slice by moving Settings source-card diagnostics behind explicit progressive disclosure
- `Phase 55` completed the next `Direction 04` slice by adding repeatable multi-width screenshot review and fixing the narrow Settings overflow it exposed
- `Phase 56` completed the next `Direction 04` slice by shipping a reduced-motion-safe motion baseline for surface entry, toast feedback, disclosure, and section jumps
- `Phase 57` completed the next `Direction 04` slice by compressing visible Settings source-card summaries and removing duplicate chip-level current-state fields from the body
- `Phase 58` completed the next `Direction 04` slice by grouping expanded Settings source-card diagnostics into clearer disclosure sections
- `Phase 59` completed the next `Direction 04` slice by compressing session-page track blocks into a compact structured layout
- `Phase 60` completed the next `Direction 04` slice by adding a repeatable compact Settings and reduced-motion QA baseline
- `Phase 61` completed the next `Direction 04` slice by unifying form-control and focus-state treatment across Settings and popup controls, then adding a repeatable keyboard interaction review pass
- `Phase 62` completed the next `Direction 04` slice by harmonizing status surfaces across dashboard, settings, popup, and toast feedback, then adding a repeatable tone review pass
- `Phase 63` completed the next `Direction 04` slice by harmonizing text hierarchy inside toned warning, error, and success surfaces, then adding a repeatable toned-content review pass
- `Phase 64` completed the next `Direction 04` slice by polishing pointer pressed states for Settings controls and adding a repeatable pointer hover plus press review pass
- `Phase 65` completed the next `Direction 04` slice by making unknown progress explicitly indeterminate, tightening compact chip tokens, and adding a repeatable chip-and-progress review pass
- `Phase 66` completed the next `Direction 04` slice by unifying supporting-surface hierarchy across provider detail and expanded Settings diagnostics, then adding a repeatable detail-supporting-surface review pass
- `Phase 67` completed the next `Direction 04` slice by shipping a fixed-width interaction-audit hub for dashboard, settings, detail, and popup surfaces, then adding a repeatable audit-hub review pass
- `Phase 68` completed the next `Direction 04` slice by adding preset-driven state shortcuts and inline status feedback to the audit hub, then adding a repeatable audit-preset review pass
- `Phase 69` completed the next `Direction 04` slice by turning those audit presets into an evidence pack with visible expectations, ordered screenshots, and machine-readable audit-state output
- `Phase 70` completed the next `Direction 04` slice by adding visible manual checks to each audit surface and generating a reusable markdown signoff pack from those checks plus the latest preset evidence
- `Phase 71` completed the next `Direction 04` slice by adding a persistent signoff workspace to the audit hub, including live draft plus JSON export and repeatable persistence review
- `Phase 72` completed the next `Direction 04` slice by adding signoff import plus local handoff support to the audit hub, including repeatable restoration review for exported workspace JSON
- `Phase 73` completed the next `Direction 04` slice by adding a visible handoff summary plus a current-state handoff bundle that links workspace conclusions to the latest preset evidence
- `Phase 74` completed the next `Direction 04` slice by adding an explicit operator workflow note plus a reusable bundle-builder command for exported signoff JSON
- `Phase 75` completed the next `Direction 04` slice by preserving review-session metadata across audit-hub export, reload, reset, import, and generated handoff bundles
- `Phase 76` completed the next `Direction 04` slice by adding direct downloadable audit artifacts plus metadata-aware filenames for local operator handoff
- `Phase 77` completed the next `Direction 04` slice by adding a live review queue with next-target guidance plus per-surface jump actions for human audit flow
- `Phase 78` completed the next `Direction 04` slice by adding a repo-backed review archive workflow plus a clearly labeled seeded baseline archive record
- `Phase 79` completed the next `Direction 04` slice by making the durable review archive self-indexing and machine-readable
- `Phase 80` completed the next `Direction 04` slice by adding a repo-backed pending operator review-request workflow for the first non-seeded human pass
- `Phase 81` completed the next `Direction 04` slice by making the request flow self-indexing plus fulfillable through one linked archived exported review record
- `Phase 82` completed the next `Direction 04` slice by making request-linked archives traceable in both directions through preserved source-request metadata
- `Phase 83` completed the next `Direction 04` slice by adding request-template integrity gates so mismatched exported workspace shapes can no longer fulfill the wrong request
- `Phase 84` completed the next `Direction 04` slice by binding exported audit workspaces to one pending request context so wrong-request exports are rejected even when shape still matches
- `Phase 85` completed the next `Direction 04` slice by surfacing pending-request template drift and rejecting stale request packages before they can be completed as current review scope
- `Phase 86` completed the next `Direction 04` slice by adding a regenerate workflow that supersedes stale requests and proves the aligned replacement request can complete end to end
- `Phase 87` completed the next `Direction 04` slice by adding a no-side-effect completion preflight that validates request-bound exports before request or archive state changes
- `Phase 88` completed the next `Direction 04` slice by making repo-backed request scope visible in the audit hub and by carrying bound request identity into downloaded artifact filenames
- `Phase 89` completed the next `Direction 04` slice by making request-bound source evidence explicit in preflight and by preserving the actual evidence path used during request completion
- `Phase 90` completed the next `Direction 04` slice by making repo-backed request packages self-contained through local evidence snapshots and by teaching preflight plus completion to prefer that request-local snapshot
- `Phase 91` completed the next `Direction 04` slice by making repo-backed request packages tamper-evident through recorded snapshot digests and by rejecting snapshot-integrity mismatches before archive state can be written
- `Phase 92` completed the next `Direction 04` slice by making repo-backed request exports revision-bound and by rejecting older exports after the same pending request package is refreshed in place
- `Phase 93` completed the next `Direction 04` slice by making request revisions visible in the audit hub plus bound download artifacts before the first real non-seeded export enters the repo
- `Phase 94` completed the next `Direction 04` slice by preserving request binding plus request revision through generated handoff bundles, durable archives, and the generated archive index
- `Phase 95` completed the next `Direction 04` slice by preserving evidence source plus integrity summary through generated handoff bundles, durable archives, and the generated archive index
- `Phase 96` completed the next `Direction 04` slice by preserving fulfillment receipt metadata inside fulfilled request manifests, request README output, and the generated request index
- `Codex` personal support is already shipped as a `session_page` path, but it currently exposes usage-window percentages and reset timing, not one absolute remaining credit balance
- `Cursor` personal support is already shipped as a `session_page` path, but it currently exposes billing-period usage context, not one exact remaining included-request counter
- the extension action now opens a compact popup on click, the popup makes cached snapshot freshness explicit, and the badge shows the count of visible providers needing attention
- the UI uses a Material-like token system, now has a small reduced-motion-safe motion baseline, and also has an intermediate `720px` responsive collapse point, a more scannable Settings entry, a less repetitive source-card summary pattern, clearer grouped diagnostics inside disclosure, a compact session-track layout, consistent keyboard-focus treatment on the main interactive controls, harmonized status surfaces across the main warning/error/success states, clearer toned-surface text hierarchy, explicit pressed states on the remaining Settings pointer controls, a more coherent compact chip system, honest indeterminate progress treatment for unknown values, a clearer supporting-surface hierarchy across provider detail and expanded Settings diagnostics, one dedicated fixed-width interaction-audit hub for the main shipped surfaces, preset-driven shortcuts plus visible expectation copy plus visible manual checks plus a persistent signoff workspace plus signoff-import handoff support plus a visible handoff summary plus an explicit operator workflow and reusable bundle-builder path for the main manual review states, and repeatable width plus compact-height plus keyboard-interaction plus pointer-interaction plus status-surface plus toned-content plus chip-progress plus supporting-surface plus audit-hub plus audit-preset plus evidence-pack plus signoff-pack plus signoff-workspace plus signoff-import plus handoff-bundle plus operator-bundle review baselines
- the current theme foundation is still light-only, still lacks user theme selection, and still does not ship dark mode or a validated user color-personalization path
- the current popup architecture is already shipped, which means future toolbar work should focus on competitive product fit, onboarding, and store discoverability rather than restarting popup shell design
- the current extension remains effectively English-only because the repo does not yet ship `_locales/`, `default_locale`, or a runtime app localization layer

## Priority Order

### Active continuation order

1. [Direction 02 - Personal User Product Semantics](./02_Direction_Personal_User_Product_Semantics.md)
   Why first now:
   the main product value is increasingly on personal accounts, but the current support levels differ sharply by provider and need clearer contracts.

2. [Direction 03 - Toolbar Popup And Badge Entry](./03_Direction_Toolbar_Popup_And_Badge_Entry.md)
   Why second now:
   market examples show that "one click from the toolbar" is now a strong expectation, and Chrome supports adding that without abandoning the side panel.

3. [Direction 04 - Material, Motion, And Responsive Hardening](./04_Direction_Material_Motion_And_Responsive_Hardening.md)
   Why third now:
   the current UI is serviceable, but it is still closer to a release-candidate shell than a fully polished product surface.

### Additional requested directions from 2026-04-23

1. [Direction 05 - Adaptive Theming And Color Modes](./05_Direction_Adaptive_Theming_And_Color_Modes.md)
   Why first among the new requests:
   the current token system is a strong foundation, but the shipped UI is still light-only and lacks dark mode plus safe theme personalization.

2. [Direction 06 - Toolbar Product Benchmark And Discoverability](./06_Direction_Toolbar_Product_Benchmark_And_Discoverability.md)
   Why second among the new requests:
   the popup already exists, so the next opportunity is improving toolbar competitiveness, onboarding clarity, and store-facing product fit.

3. [Direction 07 - Internationalization And Localization](./07_Direction_Internationalization_And_Localization.md)
   Why third among the new requests:
   full multi-language support is feasible, but it is broad, cross-cutting, and should follow one real localization architecture instead of a rushed ten-language text dump.

Completed first:

- [Direction 01 - Release Truthfulness And Closeout](./01_Direction_Release_Truthfulness_And_Closeout.md)
  Result:
  the narrowed RC was made truthful, verified, and packaged as `0.1.0-rc.2` on `2026-04-23`.

## External Reference Set

These links informed the roadmap decisions:

- Chrome `sidePanel` API:
  https://developer.chrome.com/docs/extensions/reference/api/sidePanel
- Chrome `action` API:
  https://developer.chrome.com/docs/extensions/reference/api/action
- Chrome extension i18n:
  https://developer.chrome.com/docs/extensions/develop/ui/i18n
- Chrome Web Store Program Policies:
  https://developer.chrome.com/docs/webstore/program-policies/policies
- Chrome Web Store user data guidance:
  https://developer.chrome.com/docs/webstore/program-policies/user-data-faq
- Chrome Web Store discovery:
  https://developer.chrome.com/docs/webstore/discovery/
- Chrome Web Store listing guidance:
  https://developer.chrome.com/docs/webstore/best-listing
- Chrome Web Store metrics:
  https://developer.chrome.com/docs/webstore/metrics/
- Material Web theming:
  https://material-web.dev/theming/material-theming/
- Material Web color:
  https://material-web.dev/theming/color/
- Material Web dark theme support note:
  https://material-web.dev/about/support/
- `Ai Usage 100%` Chrome Web Store listing:
  https://chromewebstore.google.com/detail/ai-usage-100%25/jjlkgogdgdflbifbmojbmleifblpekid
- `QuotaMeter` Chrome Web Store listing:
  https://chromewebstore.google.com/detail/quotameter/mbbkamghkbadgggdnjpflfobkfaepbbo

## Direction Files

- [01_Direction_Release_Truthfulness_And_Closeout.md](./01_Direction_Release_Truthfulness_And_Closeout.md)
- [01_1_Direction_Release_Truthfulness_And_Closeout_TODOs.md](./01_1_Direction_Release_Truthfulness_And_Closeout_TODOs.md)
- [01_2_Direction_JetBrains_Gate_Resolution.md](./01_2_Direction_JetBrains_Gate_Resolution.md)
- [01_2_Direction_JetBrains_Gate_Resolution_TODOs.md](./01_2_Direction_JetBrains_Gate_Resolution_TODOs.md)
- [02_Direction_Personal_User_Product_Semantics.md](./02_Direction_Personal_User_Product_Semantics.md)
- [02_1_Direction_Personal_User_Product_Semantics_TODOs.md](./02_1_Direction_Personal_User_Product_Semantics_TODOs.md)
- [03_Direction_Toolbar_Popup_And_Badge_Entry.md](./03_Direction_Toolbar_Popup_And_Badge_Entry.md)
- [03_1_Direction_Toolbar_Popup_And_Badge_Entry_TODOs.md](./03_1_Direction_Toolbar_Popup_And_Badge_Entry_TODOs.md)
- [04_Direction_Material_Motion_And_Responsive_Hardening.md](./04_Direction_Material_Motion_And_Responsive_Hardening.md)
- [04_1_Direction_Material_Motion_And_Responsive_Hardening_TODOs.md](./04_1_Direction_Material_Motion_And_Responsive_Hardening_TODOs.md)
- [05_Direction_Adaptive_Theming_And_Color_Modes.md](./05_Direction_Adaptive_Theming_And_Color_Modes.md)
- [05_1_Direction_Adaptive_Theming_And_Color_Modes_TODOs.md](./05_1_Direction_Adaptive_Theming_And_Color_Modes_TODOs.md)
- [06_Direction_Toolbar_Product_Benchmark_And_Discoverability.md](./06_Direction_Toolbar_Product_Benchmark_And_Discoverability.md)
- [06_1_Direction_Toolbar_Product_Benchmark_And_Discoverability_TODOs.md](./06_1_Direction_Toolbar_Product_Benchmark_And_Discoverability_TODOs.md)
- [07_Direction_Internationalization_And_Localization.md](./07_Direction_Internationalization_And_Localization.md)
- [07_1_Direction_Internationalization_And_Localization_TODOs.md](./07_1_Direction_Internationalization_And_Localization_TODOs.md)
