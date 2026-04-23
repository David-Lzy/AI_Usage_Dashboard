# Strategic Directions Index

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- living strategy

Status note:

- this file is the current strategic priority index for roadmap directions
- refresh it whenever latest completed slices or direction-priority ordering changes

Purpose:

- capture the next high-level product directions after the currently queued release work
- separate strategic direction-setting from the active numbered phase queue
- keep the roadmap honest about what is already shipped, what is partially solved, and what is still exploratory

Important scope note:

- these roadmap files are not replacements for the active phase files in `Doc/TODOs/`
- the numbered release queue is closed through `Phase 42`; the next work should now come from the roadmap directions below

## Current Truth Snapshot

As of 2026-04-24:

- the numbered phase queue is now completed through `Phase 136`
- the numbered phase queue is now completed through `Phase 139`
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
- `Phase 97` completed a documentation-only slice that expanded the roadmap for adaptive theming, toolbar product benchmark work, and staged internationalization
- `Phase 98` completed the first `Direction 05` slice by shipping shared `System / Light / Dark` theme-mode support plus the first dark-token foundation
- `Phase 99` completed the next `Direction 05` slice by shipping a repeatable theme review baseline for explicit-mode override plus `System` follow behavior across settings, dashboard, and popup
- `Phase 100` completed the next `Direction 05` slice by shipping a repeatable dark-surface review baseline for warning, error, progress, and supporting surfaces across dashboard, settings, and provider detail
- `Phase 101` completed the next `Direction 05` slice by shipping the first preset accent system with `Default Blue`, `Meadow`, and `Sunset`, plus a repeatable preset-theme review baseline across settings, dashboard, and popup
- `Phase 102` completed the next `Direction 05` slice by aligning the audit hub to the same persisted theme runtime and by shipping a repeatable review baseline for initial theme hydration plus live updates from the embedded Settings frame
- `Phase 103` completed the next `Direction 05` slice by shipping the first validated custom-seed input with preview plus reset actions and by shipping a repeatable cross-surface review baseline for custom-seed propagation
- `Phase 104` completed the next `Direction 05` slice by shipping a repeatable popup-local plus audit-local custom-seed review baseline and by normalizing themed text-button rendering so local accent surfaces no longer fall back to default blue
- `Phase 105` completed the next `Direction 05` slice by shipping a repeatable popup plus audit non-accent surface-stability review baseline so custom-seed changes do not silently perturb neutral, supporting, or warning surfaces
- `Phase 106` completed the next `Direction 05` slice by shipping a repeatable dashboard plus Settings plus provider-detail non-accent surface-stability review baseline so custom-seed changes do not silently perturb the main product surfaces
- `Phase 107` completed the next `Direction 05` slice by shipping a repeatable compact-width custom-seed review baseline so dashboard, Settings, provider detail, and popup stay overflow-free while preserving the same saved theme state
- `Phase 108` completed the next `Direction 05` slice by shipping a repeatable provider-state-specific custom-seed review baseline so warning or error treatments stay state-colored while neutral accent-bound surfaces still follow the active seed
- `Phase 109` completed the next `Direction 05` slice by shipping a repeatable seeded recovered-state review baseline so Cursor and Codex session-page surfaces can be proven to recover from host-access warnings back to neutral healthy treatments under the same saved seed
- `Phase 110` completed the next `Direction 05` slice by shipping a repeatable preview-interaction recovered-state review baseline so the shipped Settings host-access controls can drive that same Cursor and Codex recovery path without theme drift
- `Phase 111` completed the next `Direction 05` slice by shipping a repeatable extension-mode recovered-state review baseline so the real unpacked MV3 runtime can carry that same Cursor and Codex recovery path with pre-granted host access plus synthetic vendor tabs
- `Phase 112` completed the next `Direction 05` slice by shipping one dedicated theme-recovery operator workspace plus runbook so the remaining native-prompt or real-session gap is now about human evidence, not missing review tooling
- `Phase 113` completed the next `Direction 05` slice by shipping direct theme-recovery downloads plus a durable seeded archive workflow and generated archive index so recovery evidence no longer has to stay only in `tmp/`
- `Phase 114` completed the next `Direction 05` slice by shipping one repo-backed theme-recovery review-request workflow and generated request index so the first real operator pass now has a durable pending request package
- `Phase 115` completed the next `Direction 05` slice by shipping one repo-backed theme-recovery request-completion workflow and archive traceability so a future real operator export can now fulfill that pending request into one durable archive-linked receipt
- `Phase 116` completed the next `Direction 05` slice by shipping request-bound theme-recovery exports plus mismatch rejection so future real operator exports now preserve explicit request identity instead of remaining interchangeable
- `Phase 117` completed the next `Direction 05` slice by shipping one no-mutation theme-recovery preflight workflow so future real operator exports can now be checked safely before the archive-linked completion step
- `Phase 118` completed the first `Direction 06` slice by shipping one toolbar benchmark matrix plus one compact popup next-step guidance card for no-provider, missing-access, blocked-provider, and policy-only states
- `Phase 119` completed the next `Direction 06` slice by making the popup featured-provider area switch honestly between attention, healthy, policy-only, and empty states instead of keeping one fixed hierarchy
- `Phase 120` completed the next `Direction 06` slice by routing credential-backed setup states back to Settings directly from the popup instead of falling through to generic blocked-provider guidance
- `Phase 121` completed the next `Direction 06` slice by adding one compact popup setup-coverage summary so visible-provider breadth is scannable before the user drills into one next step
- `Phase 122` completed the next `Direction 06` slice by tightening popup setup-summary copy and adding one repeatable `360px` plus `420px` width review for the onboarding stack
- `Phase 123` completed the next `Direction 06` slice by making popup setup coverage itself stateful through one explicit stage hierarchy and adding one repeatable `360px` plus `420px` width review for those first-run setup states
- `Phase 124` completed the next `Direction 06` slice by suppressing the empty popup snapshot card for no-provider states and adding one repeatable `360px` plus `420px` width review for top-stack density
- `Phase 125` completed the next `Direction 06` slice by making popup quick actions explicitly secondary when a guidance card already provides the primary next step, and adding one repeatable action-hierarchy review
- `Phase 126` completed the next `Direction 06` slice by making popup header copy and top-summary labels specific to toolbar setup story, and adding one repeatable header-plus-summary review
- `Phase 127` completed the next `Direction 06` slice by making popup featured-provider badges plus supporting copy popup-specific, and adding one repeatable featured-card story review
- `Phase 128` completed the next `Direction 06` slice by making popup featured-provider CTA routing stateful, and adding one repeatable featured-card action review
- `Phase 129` completed the next `Direction 06` slice by reducing popup featured-provider density through fewer chips and shorter healthy or contract-only secondary copy, and adding one repeatable featured-card density review
- `Phase 130` completed the next `Direction 06` slice by replacing the last static popup contract explainer with one stateful `Surface roles` note, and adding one repeatable width review for that lower popup story layer
- `Phase 131` completed one build-and-workflow hardening slice by stabilizing unpacked-extension build entry names and formalizing the `commit / push / rebuild` closeout rule plus the RDP Chrome reload rule
- `Phase 132` completed one documentation-only slice by auditing current documentation completion truth and adding three sharper roadmap directions for doc completion, i18n bootstrap, and toolbar competitive fit
- `Phase 133` completed the first executable `Direction 08` slice by shipping a project-level documentation taxonomy, guardrail rules for doc classes, and explicit `generated operational ledger` labeling for the repo-backed request and archive indexes
- `Phase 134` completed the next executable `Direction 08` slice by shipping explicit freshness labels for the benchmark snapshot, documentation audit snapshot, historical MVP design baseline, current runbooks, the maintained manual checklist, and the maintained release guide
- `Phase 135` completed the next executable `Direction 08` slice by extending those explicit maintained-reference and freshness labels into all provider notes plus the page-session fixture conventions doc
- `Phase 136` completed the next executable `Direction 08` slice by labeling the remaining ambiguity-prone backlog plus index docs and by adding one lightweight executable taxonomy consistency check
- `Phase 137` completed the next executable `Direction 08` slice by labeling generated request/archive package READMEs, refreshing the current repo packages through generator-driven output, and extending the taxonomy consistency check to package-level docs
- `Phase 138` completed the next executable `Direction 08` slice by labeling the remaining roadmap direction files as explicit `living strategy` docs and extending the taxonomy consistency check to the full roadmap set
- `Phase 139` completed the next executable `Direction 08` slice by making the remaining convention-only doc boundary explicit and surfacing that policy through checker output
- the broader `Doc/` tree is not "fully done" even though the numbered phase queue is completed through `Phase 139`, because roadmap, request, archive-index, package-record, and reference docs remain living or maintained by design
- the numbered phase queue is now completed through `Phase 139`, and the repo now has one explicit documentation-class vocabulary plus one explicit freshness-label vocabulary plus one lightweight executable consistency check that also covers generated package READMEs, the full roadmap set, and the current convention-only boundary
- `Codex` personal support is already shipped as a `session_page` path, but it currently exposes usage-window percentages and reset timing, not one absolute remaining credit balance
- `Cursor` personal support is already shipped as a `session_page` path, but it currently exposes billing-period usage context, not one exact remaining included-request counter
- the extension action now opens a compact popup on click, the popup makes cached snapshot freshness explicit, and the badge shows the count of visible providers needing attention
- the popup now also includes one compact `Start here / Next step` guidance card, so the current toolbar-first story is no longer only freshness plus featured-provider cards
- the popup setup-coverage card now also carries one explicit stage hierarchy, so first-run setup state is visible before the user has to interpret individual counts
- the popup snapshot-status layer now also stays narrower in scope, so freshness stops repeating setup or action guidance already carried by the other top-stack cards
- the popup action row now also has a clearer hierarchy, so guidance owns the primary CTA and lower actions stay supplemental
- the popup header and top summary now also communicate setup state more directly, so first-run toolbar states stop borrowing broader dashboard summary language
- the popup featured-provider cards now also use popup-specific status labels plus a state-first lead line, so lower provider cards stop jumping back into side-panel contract prose immediately after the popup top story establishes setup context
- the popup featured-provider cards now also use stateful CTA routing, so setup blockers and contract-only states stop implying that provider detail is always the next surface
- the popup featured-provider cards now also use a lower-density chip and secondary-copy contract, so popup cards stop carrying three chips plus long side-panel contract prose in healthy and contract-only states
- the popup featured-provider area now also changes hierarchy honestly, so healthy and empty states no longer masquerade as `Needs attention`
- the popup now also distinguishes missing stored credentials from generic blocked-provider states, so credential-backed setup work now routes directly to Settings
- the popup now also exposes one compact setup-coverage summary, so users can see visible-provider readiness, access gaps, credential gaps, and policy-only coverage at a glance
- the popup onboarding stack now also has one repeatable width-range proof, so the newer guidance plus setup-summary layers are checked at realistic compact popup widths instead of only in one default preview size
- the UI uses a Material-like token system, now has a small reduced-motion-safe motion baseline, and also has an intermediate `720px` responsive collapse point, a more scannable Settings entry, a less repetitive source-card summary pattern, clearer grouped diagnostics inside disclosure, a compact session-track layout, consistent keyboard-focus treatment on the main interactive controls, harmonized status surfaces across the main warning/error/success states, clearer toned-surface text hierarchy, explicit pressed states on the remaining Settings pointer controls, a more coherent compact chip system, honest indeterminate progress treatment for unknown values, a clearer supporting-surface hierarchy across provider detail and expanded Settings diagnostics, one dedicated fixed-width interaction-audit hub for the main shipped surfaces, preset-driven shortcuts plus visible expectation copy plus visible manual checks plus a persistent signoff workspace plus signoff-import handoff support plus a visible handoff summary plus an explicit operator workflow and reusable bundle-builder path for the main manual review states, and repeatable width plus compact-height plus keyboard-interaction plus pointer-interaction plus status-surface plus toned-content plus chip-progress plus supporting-surface plus audit-hub plus audit-preset plus evidence-pack plus signoff-pack plus signoff-workspace plus signoff-import plus handoff-bundle plus operator-bundle review baselines
- the current theme foundation now ships shared `System / Light / Dark` mode selection, the first shipped preset accents, one validated custom-seed path, one repeatable explicit-override plus system-follow QA baseline, one repeatable dark-surface review baseline, one repeatable preset-theme review baseline, one repeatable audit-hub theme-alignment review baseline, one repeatable custom-seed review baseline, one repeatable popup-local plus audit-local custom-seed review baseline, one repeatable popup plus audit non-accent surface-stability review baseline, one repeatable dashboard plus Settings plus provider-detail non-accent surface-stability review baseline, one repeatable compact-width custom-seed review baseline, one repeatable provider-state-specific custom-seed review baseline, one repeatable seeded recovered-state review baseline, one repeatable preview-interaction recovered-state review baseline, one repeatable extension-mode recovered-state review baseline, one dedicated theme-recovery operator workspace plus runbook, one durable seeded theme-recovery archive workflow plus generated archive index, and one durable pending theme-recovery request workflow plus generated request index, but it still lacks any real fulfilled operator or native-prompt recovery archive and any decision on dual light-dark seeds
- the current popup architecture is already shipped, which means future toolbar work should focus on competitive product fit, onboarding, and store discoverability rather than restarting popup shell design
- the current extension remains effectively English-only because the repo does not yet ship `_locales/`, `default_locale`, or a runtime app localization layer

## Priority Order

### 2026-04-24 strategic refresh

1. [Direction 08 - Documentation Completion And Truth Audit](./08_Direction_Documentation_Completion_And_Truth_Audit.md)
   Why first now:
   this direction answers the current ambiguity about whether previous documentation work is actually "finished" and creates one shared status model before more roadmap expansion.

2. [Direction 10 - Toolbar Competitive Fit And Store Readiness](./10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)
   Why second now:
   the popup is already materially productized, so the next high-leverage local work is competitive fit, truthful extension-mode screenshots, and store-readiness rather than more shell redesign.

3. [Direction 09 - Internationalization Bootstrap And Pilot Locales](./09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)
   Why third now:
   internationalization is important and feasible, but it should begin with architecture and pilot locales, not an immediate ten-language dump into an English-only runtime.

### Active continuation order

1. [Direction 06 - Toolbar Product Benchmark And Discoverability](./06_Direction_Toolbar_Product_Benchmark_And_Discoverability.md)
   Why first now:
   `Direction 05` is now close to an honest human-evidence boundary, while the popup has just started its benchmark and onboarding track and offers a higher-leverage product surface for the next fully local slices.

2. [Direction 05 - Adaptive Theming And Color Modes](./05_Direction_Adaptive_Theming_And_Color_Modes.md)
   Why second now:
   the current theme system is mature and truthful, but its next highest-value step now depends more on real operator evidence than on more local tooling.

3. [Direction 04 - Material, Motion, And Responsive Hardening](./04_Direction_Material_Motion_And_Responsive_Hardening.md)
   Why third now:
   the interaction-audit and operator-review workflow is mature, but it still needs real-browser review closure beyond the tooling layers.

### Additional requested directions from 2026-04-23

1. [Direction 06 - Toolbar Product Benchmark And Discoverability](./06_Direction_Toolbar_Product_Benchmark_And_Discoverability.md)
   Why first among the new requests:
   the popup already exists, and `Phase 118` has now started the benchmark plus onboarding track with a fully local product slice that does not depend on future operator evidence.

2. [Direction 05 - Adaptive Theming And Color Modes](./05_Direction_Adaptive_Theming_And_Color_Modes.md)
   Why second among the new requests:
   the theme system is strong and truthful, but its next most valuable slice is increasingly tied to real operator recovery evidence rather than more local-only tooling.

3. [Direction 07 - Internationalization And Localization](./07_Direction_Internationalization_And_Localization.md)
   Why third among the new requests:
   full multi-language support is feasible, but it is broad, cross-cutting, and should follow one real localization architecture instead of a rushed ten-language text dump.

### Additional requested directions from 2026-04-24

1. [Direction 08 - Documentation Completion And Truth Audit](./08_Direction_Documentation_Completion_And_Truth_Audit.md)
   Why first among the new requests:
   the numbered phase queue is closed through `Phase 139`, and the repo now has one explicit documentation taxonomy plus one freshness-label model plus one lightweight consistency check that reaches package-level generated docs, the full roadmap set, and the current convention-only boundary; the next work is to decide whether any remaining low-value docs still need promotion into explicit labeling.

2. [Direction 10 - Toolbar Competitive Fit And Store Readiness](./10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)
   Why second among the new requests:
   the popup already has real onboarding and stateful CTA behavior, so the next high-value step is competitive fit plus store-readiness, not popup shell invention.

3. [Direction 09 - Internationalization Bootstrap And Pilot Locales](./09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)
   Why third among the new requests:
   the project is still effectively English-only, but the safe next move is architecture plus pilot locales before promising a full ten-language rollout.

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
- [08_Direction_Documentation_Completion_And_Truth_Audit.md](./08_Direction_Documentation_Completion_And_Truth_Audit.md)
- [08_1_Direction_Documentation_Completion_And_Truth_Audit_TODOs.md](./08_1_Direction_Documentation_Completion_And_Truth_Audit_TODOs.md)
- [09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md](./09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)
- [09_1_Direction_Internationalization_Bootstrap_And_Pilot_Locales_TODOs.md](./09_1_Direction_Internationalization_Bootstrap_And_Pilot_Locales_TODOs.md)
- [10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md](./10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)
- [10_1_Direction_Toolbar_Competitive_Fit_And_Store_Readiness_TODOs.md](./10_1_Direction_Toolbar_Competitive_Fit_And_Store_Readiness_TODOs.md)
