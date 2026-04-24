# AI Usage Dashboard TODOs

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the maintained top-level project backlog reference, not a frozen historical plan
- refresh it whenever current execution priorities or completed-direction summaries materially change

Related doc:

- [AI_Usage_Dashboard_MVP_Design.md](./AI_Usage_Dashboard_MVP_Design.md)
- [00_Phase_Index.md](./TODOs/00_Phase_Index.md)
- [00_Strategic_Directions_Index.md](./Roadmap/00_Strategic_Directions_Index.md)

## 1. What To Build First

The work should be split into three parallel views:

1. project-level TODOs
2. provider-by-provider TODOs
3. UI TODOs

The right execution strategy is not "all providers at once".

The right strategy is:

- build the extension shell once
- then integrate one provider at a time
- stabilize the adapter contract
- only then add the next provider

## 1.1 UI Direction

Use Google Material Design 3 as the UI system.

Practical UI rules for this project:

- use Material top app bar, cards, badges, dialogs, and progress indicators as the mental model
- define color, typography, and shape through Material-style design tokens
- keep density tighter than mobile defaults because the extension lives in a side panel
- do not mix a second design language into the same interface
- keep custom styling layered on top of Material roles, not random one-off component colors

## 2. Recommended Build Order

Recommended order for the first real integrations:

1. Cursor
2. JetBrains AI
3. Claude Code
4. Gemini Code Assist
5. Codex

Why this order:

- Cursor already documents a team Admin API and dashboard usage pages
- JetBrains has explicit current-usage pages in its console
- Claude Code has official usage analytics pages for some account types, but the account models are more fragmented
- Gemini has clear quota docs, but "remaining usage" exposure is less obvious from official public docs
- Codex has official plan-limit docs and workspace billing/analytics entry points, but the public docs do not expose a simple public usage API for all plan types

## 2.1 Current Execution Queue

The project is no longer in shell-building mode.

From here, the execution priority should be:

1. connect providers one by one in this order:
   - Cursor
   - JetBrains AI
   - Claude Code
   - Gemini Code Assist
   - Codex
2. start release work only after provider wiring is stable

Delivery rule for this stage:

- do not spend the next turns on general UI polish
- prioritize browser permissions, live provider wiring, verification, and release readiness
- keep every provider slice independently testable before moving to the next one

Phase status update:

- the release-candidate and real-Chrome verification track through `Phase 42` is complete for the narrowed RC selected on `2026-04-23`
- `Phase 43` completed the first executable `Direction 02` slice and shipped explicit source-fidelity semantics into the side panel UI
- `Phase 44` completed the next executable `Direction 02` slice and shipped explicit trust-boundary and access-model semantics into Settings and provider detail
- `Phase 45` completed the next executable `Direction 02` slice and shipped explicit provider-contract semantics into Settings and provider detail
- `Phase 46` completed the next executable `Direction 02` slice and shipped provider-contract visibility into the dashboard overview
- `Phase 47` completed the next executable `Direction 02` slice and shipped deferred-contract graduation gates into Settings and provider detail
- `Phase 48` completed the first executable `Direction 03` slice and shipped a compact toolbar popup plus an explicit handoff into the full side panel
- `Phase 49` completed the next executable `Direction 03` slice and shipped an action badge whose single meaning is the count of visible providers needing attention
- `Phase 50` completed the next executable `Direction 03` slice and shipped popup-to-sidepanel deep-link handoff for featured provider detail
- `Phase 51` completed the next executable `Direction 03` slice and shipped popup quick actions for dashboard and settings
- `Phase 52` completed the next executable `Direction 03` slice and made cached popup snapshot freshness explicit
- `Phase 53` completed the first executable `Direction 04` slice and shipped a Settings overview summary, sticky top actions, section-jump controls, and an earlier `720px` responsive collapse point
- `Phase 54` completed the next executable `Direction 04` slice and moved Settings source-card diagnostics behind explicit progressive disclosure
- `Phase 55` completed the next executable `Direction 04` slice and added repeatable multi-width screenshot review plus a real `360px` Settings overflow fix
- `Phase 56` completed the next executable `Direction 04` slice and shipped a reduced-motion-safe motion baseline for surface entry, toast feedback, source-card disclosure, and Settings section jumps
- `Phase 57` completed the next executable `Direction 04` slice and compressed visible Settings source-card summaries so they stop duplicating chip-level current-state fields
- `Phase 58` completed the next executable `Direction 04` slice and grouped expanded Settings source-card diagnostics into clearer disclosure sections
- `Phase 59` completed the next executable `Direction 04` slice and compressed session-page track blocks into a compact structured layout
- `Phase 60` completed the next executable `Direction 04` slice and added a repeatable compact Settings plus reduced-motion QA baseline
- `Phase 61` completed the next executable `Direction 04` slice and unified focus-visible plus interaction-state treatment across the main Settings and popup controls
- `Phase 62` completed the next executable `Direction 04` slice and harmonized warning, error, and success surfaces across dashboard, settings, popup, and toast feedback
- `Phase 63` completed the next executable `Direction 04` slice and harmonized text hierarchy inside toned warning, error, and success surfaces
- `Phase 64` completed the next executable `Direction 04` slice and added explicit pointer pressed states plus a repeatable hover-and-press review baseline
- `Phase 65` completed the next executable `Direction 04` slice and made unknown progress explicitly indeterminate while adding a repeatable chip-and-progress review baseline
- `Phase 66` completed the next executable `Direction 04` slice and unified supporting-surface hierarchy across provider detail plus expanded Settings diagnostics while adding a repeatable detail-supporting-surface review baseline
- `Phase 67` completed the next executable `Direction 04` slice and shipped a fixed-width interaction-audit hub for dashboard, settings, detail, and popup while adding a repeatable audit-hub review baseline
- `Phase 68` completed the next executable `Direction 04` slice and added preset-driven review shortcuts plus inline audit-state feedback while adding a repeatable audit-preset review baseline
- `Phase 69` completed the next executable `Direction 04` slice and turned the audit-hub presets into an ordered evidence pack with visible expectations, per-preset screenshots, and machine-readable audit-state output
- `Phase 70` completed the next executable `Direction 04` slice and added visible per-surface manual checks plus a reusable markdown signoff pack built from those checks and the latest preset evidence
- `Phase 71` completed the next executable `Direction 04` slice and added a persistent signoff workspace with live draft plus JSON export, note persistence, and reset behavior inside the audit hub
- `Phase 72` completed the next executable `Direction 04` slice and added signoff import plus local handoff support so exported workspace JSON can restore the audit state in a new session
- `Phase 73` completed the next executable `Direction 04` slice and added a visible handoff summary plus a current-state handoff bundle that links the workspace to the latest preset evidence
- `Phase 74` completed the next executable `Direction 04` slice and added an explicit operator workflow plus a reusable bundle-builder command for exported signoff JSON
- `Phase 75` completed the next executable `Direction 04` slice and added explicit review-session metadata so reviewer, session label, and reviewed-at time now survive audit-hub export, reset, import, and bundle generation
- `Phase 76` completed the next executable `Direction 04` slice and added direct downloadable signoff plus handoff artifacts with metadata-aware filenames for local operator review
- `Phase 77` completed the next executable `Direction 04` slice and added a live review queue with next-target guidance plus direct surface jumps for faster human audit execution
- `Phase 78` completed the next executable `Direction 04` slice and added a repo-backed review archive workflow plus a clearly labeled seeded archive baseline for durable audit records
- `Phase 79` completed the next executable `Direction 04` slice and made the durable review archive self-indexing with a generated markdown index plus machine-readable catalog
- `Phase 80` completed the next executable `Direction 04` slice and added a repo-backed pending operator review-request workflow for the first non-seeded human pass
- `Phase 81` completed the next executable `Direction 04` slice and made the review-request flow self-indexing plus fulfillable through one linked archived exported review record
- `Phase 82` completed the next executable `Direction 04` slice and made request-linked archives traceable in both directions through preserved source-request metadata
- `Phase 83` completed the next executable `Direction 04` slice and added request-template integrity gates so mismatched exported workspace shapes can no longer fulfill the wrong request
- `Phase 84` completed the next executable `Direction 04` slice and bound exported audit workspaces to one pending request context so wrong-request exports are rejected even when shape still matches
- `Phase 85` completed the next executable `Direction 04` slice and surfaced pending-request template drift so stale request packages are flagged and rejected before completion
- `Phase 86` completed the next executable `Direction 04` slice and added a regenerate workflow so stale requests can be superseded and replaced by one aligned request instead of being hand-edited
- `Phase 87` completed the next executable `Direction 04` slice and added a no-side-effect preflight command so request-bound exports can be validated before archive or request state changes
- `Phase 88` completed the next executable `Direction 04` slice and made repo-backed request scope visible in the audit hub plus request-aware download filenames
- `Phase 89` completed the next executable `Direction 04` slice and made repo-backed request evidence resolution truthful across preflight, completion defaults, and archived review metadata
- `Phase 90` completed the next executable `Direction 04` slice and made repo-backed request packages self-contained by snapshotting evidence into the request directory and backfilling the shipped pending request to the same shape
- `Phase 91` completed the next executable `Direction 04` slice and made repo-backed request packages tamper-evident by recording evidence-snapshot digests and rejecting mismatched packaged evidence during preflight plus completion
- `Phase 92` completed the next executable `Direction 04` slice and made repo-backed request exports revision-bound so stale exports are rejected after one pending request package is refreshed in place
- `Phase 93` completed the next executable `Direction 04` slice and made request revisions visible in the audit hub plus bound download artifacts before the first real non-seeded export enters the repo
- `Phase 94` completed the next executable `Direction 04` slice and preserved request binding plus request revision through generated handoff bundles, durable archives, and the generated archive index
- `Phase 95` completed the next executable `Direction 04` slice and preserved evidence source plus integrity summary through generated handoff bundles, durable archives, and the generated archive index
- `Phase 96` completed the next executable `Direction 04` slice and preserved fulfillment receipt metadata inside fulfilled request manifests, request README output, and the generated request index
- `Phase 97` completed a documentation-only slice and added strategic roadmap directions for adaptive theming, toolbar benchmark plus discoverability, and staged internationalization
- `Phase 98` completed the first executable `Direction 05` slice and shipped shared theme-mode persistence plus the first dark-token foundation across the side panel and popup
- `Phase 99` completed the next executable `Direction 05` slice and shipped a repeatable cross-surface theme review baseline for explicit light/dark override plus system-follow behavior
- `Phase 100` completed the next executable `Direction 05` slice and shipped a repeatable dark-surface review baseline for warning, error, progress, and supporting-surface states
- `Phase 101` completed the next executable `Direction 05` slice and shipped the first preset accent system with `Default Blue`, `Meadow`, and `Sunset`, plus a repeatable preset-theme review baseline across settings, dashboard, and popup
- `Phase 102` completed the next executable `Direction 05` slice and aligned the audit hub to the same persisted theme runtime, plus a repeatable review baseline for initial hydration and live theme updates from the embedded Settings frame
- `Phase 103` completed the next executable `Direction 05` slice and shipped the first validated `Custom Seed` input with preview plus reset actions, plus a repeatable cross-surface review baseline for custom-seed propagation
- `Phase 104` completed the next executable `Direction 05` slice and shipped a repeatable popup-local plus audit-local custom-seed review baseline while normalizing themed `text-button` rendering for those local surfaces
- `Phase 105` completed the next executable `Direction 05` slice and shipped a repeatable popup plus audit non-accent surface-stability review baseline, proving custom-seed changes do not silently perturb neutral, supporting, or warning surfaces there
- `Phase 106` completed the next executable `Direction 05` slice and shipped a repeatable dashboard plus Settings plus provider-detail non-accent surface-stability review baseline, proving custom-seed changes do not silently perturb the main product surfaces there
- `Phase 107` completed the next executable `Direction 05` slice and shipped a repeatable compact-width custom-seed review baseline, proving dashboard, Settings, provider detail, and popup remain overflow-free while preserving the same saved theme state
- `Phase 108` completed the next executable `Direction 05` slice and shipped a repeatable provider-state-specific custom-seed review baseline, proving Claude and Gemini warning or error surfaces stay state-colored while Codex neutral status-chip and progress-fill surfaces still follow the active accent roles
- `Phase 109` completed the next executable `Direction 05` slice and shipped a repeatable seeded recovered-state review baseline, proving Cursor and Codex session-page surfaces recover from host-access warning treatments back to neutral healthy treatments under the same saved custom seed
- `Phase 110` completed the next executable `Direction 05` slice and shipped a repeatable preview-interaction recovered-state review baseline, proving the shipped Settings host-access controls can drive that same Cursor and Codex recovery path without losing the saved custom-seed palette
- `Phase 111` completed the next executable `Direction 05` slice and shipped a repeatable extension-mode recovered-state review baseline, proving the real unpacked MV3 runtime can carry that same Cursor and Codex recovery path with pre-granted host access plus synthetic vendor tabs
- `Phase 112` completed the next executable `Direction 05` slice and shipped one dedicated theme-recovery operator workspace plus runbook, turning the remaining native-prompt or real-session gap into an evidence-collection task instead of a tooling gap
- `Phase 113` completed the next executable `Direction 05` slice and shipped direct theme-recovery downloads plus one durable seeded archive workflow and generated archive index, turning repo-backed recovery evidence from ad-hoc `tmp/` files into one truthful baseline archive
- `Phase 114` completed the next executable `Direction 05` slice and shipped one repo-backed theme-recovery review-request workflow plus generated request index, turning the first real operator pass into a durable pending request instead of only a manual note
- `Phase 115` completed the next executable `Direction 05` slice and shipped one repo-backed theme-recovery request-completion workflow plus archive traceability, turning future real operator exports into archive-linked fulfilled receipts instead of detached manual archives
- `Phase 116` completed the next executable `Direction 05` slice and shipped request-bound theme-recovery exports plus mismatch rejection, turning future real operator exports into request-identified artifacts instead of interchangeable ad-hoc files
- `Phase 117` completed the next executable `Direction 05` slice and shipped one no-mutation theme-recovery preflight workflow, turning future real operator exports into precheckable candidates before any archive-linked completion happens
- `Phase 118` completed the first executable `Direction 06` slice and shipped one toolbar benchmark matrix plus one compact popup `Start here / Next step` guidance card, turning popup onboarding into a productized surface instead of only an implied quick-glance shell
- `Phase 119` completed the next executable `Direction 06` slice and shipped one truthful popup triage hierarchy plus one explicit featured empty-state, turning the featured-provider area from one fixed shell into a real stateful toolbar story
- `Phase 120` completed the next executable `Direction 06` slice and shipped one credential-missing popup onboarding branch, turning credential-backed setup states into explicit Settings handoffs instead of generic blocked-provider triage
- `Phase 121` completed the next executable `Direction 06` slice and shipped one compact popup setup-coverage summary, turning visible-provider readiness, access gaps, credential gaps, and policy-only coverage into one scannable onboarding layer
- `Phase 122` completed the next executable `Direction 06` slice and shipped one tighter popup setup-summary plus one repeatable width-range review, turning the new onboarding stack into a compact surface that is verified at realistic popup widths
- `Phase 123` completed the next executable `Direction 06` slice and shipped one explicit popup setup-stage hierarchy plus one repeatable width-range review for first-run setup states, turning setup coverage from a pure count grid into a clearer onboarding status layer
- `Phase 124` completed the next executable `Direction 06` slice and trimmed popup top-stack repetition, turning snapshot status into a freshness-only layer while removing the empty snapshot card from no-provider states
- `Phase 125` completed the next executable `Direction 06` slice and turned popup quick actions into a clearly secondary layer whenever guidance is present, removing duplicated primary CTAs while keeping broader navigation available
- `Phase 126` completed the next executable `Direction 06` slice and turned popup header copy plus top-summary labels into a popup-specific setup story, removing the remaining dashboard-style summary language from first-run toolbar states
- `Phase 127` completed the next executable `Direction 06` slice and turned popup featured-provider badges plus supporting copy into popup-specific story layers, keeping lower provider cards aligned with the same setup and review vocabulary already established by the toolbar header and setup stack
- `Phase 128` completed the next executable `Direction 06` slice and turned popup featured-provider CTAs into stateful routes, so setup blockers, contract-only cards, review states, and healthy states no longer all claim the same generic detail path
- `Phase 129` completed the next executable `Direction 06` slice and turned popup featured-provider cards into a lower-density popup contract, cutting chip count and replacing longer healthy/contract-only contract prose with shorter availability summaries
- `Phase 130` completed the next executable `Direction 06` slice and turned the last static popup contract footer into one lighter `Surface roles` note, so the lower popup explainer now changes honestly between setup ownership, contract review ownership, provider review ownership, and quick-glance context
- `Phase 131` completed one build-and-workflow hardening slice and stabilized extension build output names for unpacked Chrome use, while also formalizing the `commit / push / rebuild` closeout rule and the RDP Chrome unpacked-extension rule in the guardrails
- `Phase 132` completed one documentation-only slice and shipped a repo-wide documentation completion audit plus three sharper roadmap directions for doc truth, i18n bootstrap, and toolbar competitive fit
- `Phase 133` completed the first executable `Direction 08` slice and shipped one project-level documentation taxonomy plus explicit generated-ledger labeling for the repo-backed request and archive indexes
- `Phase 134` completed the next executable `Direction 08` slice and shipped one explicit freshness-label pass across the benchmark snapshot, documentation audit snapshot, historical MVP design baseline, current runbooks, maintained manual checklist, and maintained release guide
- `Phase 135` completed the next executable `Direction 08` slice and shipped one maintained-reference labeling pass across the provider notes and the page-session fixture conventions doc
- `Phase 136` completed the next executable `Direction 08` slice and shipped one lightweight `docs:check` consistency pass plus explicit labeling for the top-level backlog and index docs
- `Phase 137` completed the next executable `Direction 08` slice and shipped one package-level taxonomy pass across generated request/archive READMEs, plus one refresh command and one checker extension that now covers those package docs too
- `Phase 138` completed the next executable `Direction 08` slice and shipped one explicit `living strategy` labeling pass across the remaining roadmap direction files, plus one checker extension that now covers the full roadmap set
- `Phase 139` completed the next executable `Direction 08` slice and made the remaining convention-only doc boundary explicit, so unlabeled fixed evidence artifacts are now a documented scope choice instead of an implicit omission
- `Phase 140` completed the next executable `Direction 08` slice and moved the documentation-completion track into maintenance mode, so the default next strategic push now shifts back to `Direction 10` and then `Direction 09`
- `Phase 141` completed the first executable `Direction 10` slice and shipped one explicit competitive-fit decision matrix plus one maintained screenshot storyboard pack, so toolbar/store work now has one truthful behavior contract before more popup or listing polish
- `Phase 142` completed the next executable `Direction 10` slice and shipped one maintained screenshot-capture runbook plus one generator-backed baseline capture pack, so truthful RDP Chrome store capture is now a concrete workflow instead of only a storyboard
- `Phase 143` completed the next executable `Direction 10` slice and shipped one pending screenshot-capture request workflow, so the first real RDP Chrome store capture pass now has a durable repo-backed handoff package
- `Phase 144` completed the next executable `Direction 10` slice and shipped one completion plus archive workflow, so future real screenshot sets now have a durable repo-backed evidence path while the current repo truth remains `1 pending request / 0 archived screenshot sets`
- `Phase 145` completed the next executable `Direction 10` slice and verified that the current RDP Chrome profile can open and capture real popup plus sidepanel runtime windows, so the remaining blocker to the first archived screenshot set is truthful state selection rather than GUI uncertainty
- `Phase 146` completed the next executable `Direction 10` slice and added request-bound capture notes plus archive-preserved truth-note metadata, so future real screenshot sets can keep omission, approximation, and fallback boundaries attached to the evidence package instead of only to the runbook
- `Phase 147` completed the next executable `Direction 10` slice and added one request-bound screenshot seed plus runtime-lock workflow and one RDP capture runner, so future real screenshot sets can reproduce stable storyboard states in the real unpacked extension runtime without background sync silently drifting the capture state
- `Phase 148` completed the next executable `Direction 10` slice and added one fast-fail timeout plus stale-probe cleanup path for failed RDP capture attempts, so the next real screenshot pass can retry cleanly instead of leaving hung X11 helper processes behind
- `Phase 149` completed the next executable `Direction 10` slice and archived the first real RDP Chrome screenshot set, so the store-readiness track now has one durable archived screenshot evidence package instead of only a pending request workflow
- `Phase 150` completed the next executable `Direction 10` slice and added one maintained store-listing copy pack anchored to that first archived screenshot set, so screenshot evidence and store copy can now evolve from the same truthful source
- `Phase 151` completed the next executable `Direction 10` slice and added one maintained store-listing localization source pack anchored to the manifest, maintained listing-copy pack, and first archived screenshot set, so future translated store listings can stay aligned with the same truthful source set
- `Phase 152` completed the next executable `Direction 10` slice and added one explicit popup host-width contract plus one repeatable width review for real Chrome action-popup rendering, so the popup no longer depends on browser-guessed body width in last-mile runtime use
- `Phase 153` completed the next executable `Direction 10` slice and moved that popup width contract into the static popup bootstrap while routing repo-backed commands through one preferred local Node wrapper, so first-paint popup sizing and build/runtime verification no longer depend on post-boot class mutation or the older bundled Node runtime
- `Phase 154` completed one documentation-only planning slice and turned the agreed next work into explicit TODO docs for Direction 10 surface expansion plus ambient theme controls, Direction 10 store asset-pack follow-through, Direction 09 runtime i18n bootstrap, Direction 05 theme-recovery operator closure, and Direction 04 interaction-audit operator closure
- `Phase 155` completed the first runtime slice under that new Direction 10.2 plan and turned the future full-page shell into a real shared route-entry contract through `src/sidepanel/index.html?surface=full-page#...`
- `Phase 156` completed the popup expand CTA to the dashboard full-page tab while intentionally keeping existing popup quick actions on their current sidepanel handoff contract
- `Phase 157` completed the sidebar expand CTA to the route-preserving full-page shell across dashboard, settings, and provider-detail routes while hiding that expand control once the runtime is already in full-page mode
- `Phase 158` completed the popup plus sidebar light-dark toggle button and carried that same quick control into the standard full-page shell without replacing Settings as the advanced theme surface
- `Phase 159` completed motion polish for popup-expand and sidepanel-expand full-page entry by adding short-lived entry hints plus restrained source-aware full-page shell entry motion that stays disabled when reduced motion is requested
- `Phase 160` completed the RDP Chrome runtime QA refresh by refreshing popup, sidepanel-settings, and standard full-page dashboard/settings/provider-detail captures while adding runtime-window cleanup into the helper workflow
- `Phase 161` completed the first `Direction 10.3` slice by turning the first screenshot archive into an explicit selection/stale-review pack and by updating the storyboard toward native toolbar-bubble popup capture plus full-page depth capture
- `Phase 162` completed the next `Direction 10.3` slice by creating one refreshed pending screenshot-capture request for the post-surface-expansion asset set while tightening request-generation truth rules around manual popup capture and historical fulfilled-request refresh
- `Phase 163` completed the next `Direction 10.3` slice by probing the native toolbar popup in the current `RDP Chrome` session and confirming that the real bubble is not exposed as one separate capturable X11 top-level window, so helper-window evidence now documents that boundary without replacing manual popup capture
- `Phase 164` completed the next `Direction 10.3` slice by generating one hybrid capture plan and auto-staging full-page slots `4` and `5` inside the refreshed pending request while keeping popup slots `1` through `3` manual native-toolbar capture
- `Phase 165` completed the next `Direction 10.3` slice by turning that pending request into one dedicated manual screenshot handoff and archive-readiness preflight, so the remaining popup work is now explicit instead of being buried inside the larger request package
- `Phase 166` completed the next `Direction 10.3` slice by adding one supported manual screenshot import workflow, so a real native-toolbar popup pass can now be copied back into the pending request without hand-editing the generated package files
- `Phase 167` completed the next `Direction 10.3` slice by generating one request-bound popup-notes overlay template plus one popup-capture checklist, so the final manual popup pass now has repo-backed note scaffolding instead of ad-hoc prep work
- `Phase 168` completed the next `Direction 10.3` slice by making request completion default to the request package `captures/` directory after popup import, so the next real-world step is the popup capture itself instead of another path-resolution step
- the immediate next executable work is now the real manual native-toolbar popup capture plus import/archive completion path for that refreshed screenshot request under `Doc/Roadmap/10_3_Store_Asset_Pack_And_Submission_TODOs.md`
- the next major architecture line after that is the Direction 09 runtime i18n bootstrap captured in `Doc/Roadmap/09_2_Runtime_I18n_Bootstrap_And_Pilot_Locales_TODOs.md`
- the remaining high-value work in Direction 05 and Direction 04 is now real-operator evidence closure rather than more lifecycle tooling
- the research, parser, live-wiring, source-selection, and page-binding track through `Phase 40` is complete
- the split `Phase 41` release gate cleared the old runtime-parity ambiguity and re-proved the live `Codex` plus `Cursor` personal session-page paths in real Chrome
- `2026-04-23`: `Branch B` was selected for the current RC, so JetBrains is now a retained repo path rather than part of the active release promise
- `Phase 42` produced `release/ai-usage-dashboard-0.1.0-rc.2.zip` and closed the numbered release queue for the narrowed RC scope
- broader follow-up strategy after the current release queue is tracked in `Doc/Roadmap/`

## 2.2 Post-RC Personal User Expansion Queue

For personal-user support, the recommended order changes to:

1. Codex personal usage pages
2. Cursor personal dashboard usage page
3. Claude personal usage page
4. Gemini Code Assist metrics page

Why this order:

- Codex already has clear personal-plan usage entry points in ChatGPT settings and is the highest-value gap in the shipped release candidate
- Cursor has an explicit personal dashboard usage page and is likely the cleanest non-admin page source
- Claude has a personal usage/settings surface, but account state, redirects, and subscription gating are more fragmented
- Gemini Cloud metrics are likely project-scoped rather than true personal quota, so the product model needs more care before implementation

Security rule for this track:

- do not persist raw cookies in extension storage
- do not ask the user to manually copy cookies or auth headers
- prefer host permission plus page-context extraction inside the already logged-in tab
- store only normalized usage snapshots and minimal connection metadata unless a later phase proves a safer need

## 3. Master TODO List

### 3.1 Product TODO

- freeze MVP scope to "usage dashboard only"
- define exactly which account types are supported in v1
- define what "supported" means:
  - exact remaining usage
  - plan and reset window only
  - current-month spend only
- define unsupported states clearly in UI

### 3.2 Architecture TODO

- implement the normalized provider adapter interface
- implement background sync engine
- implement local cache and stale-state logic
- implement per-provider permission gating
- implement provider registry and feature flags

### 3.2B Session-Page Architecture TODO

- add a hybrid provider-source model:
  - `official_api`
  - `session_page`
  - `policy_only`
- define page-session lifecycle rules:
  - open tab required
  - attached tab optional vs auto-discovered tab
  - stale or logged-out detection
- define an injected-page bridge for:
  - DOM extraction
  - bootstrapped JSON extraction
  - observed `fetch` or `XHR` responses when needed
- define redaction rules for captured fixtures so personal account artifacts can be tested safely
- define how page-sourced adapters coexist with existing Admin API and analytics adapters

### 3.2A Material Design TODO

- create a Material Design 3 token foundation for the side panel
- decide how tokens map into React components
- define provider card, detail page, and settings page in Material component terms
- keep light mode as the safe default theme
- preserve dark-mode and preset-theme QA before adding any seed-color personalization

### 3.3 Extension TODO

- scaffold MV3 extension
- add side panel shell
- wire `chrome.storage`
- wire `chrome.alarms`
- implement message passing between side panel and service worker
- add optional host permission request flow
- add provider connection state management

### 3.3A Session-Page Extension TODO

- add a content-script or injected-script execution path for logged-in usage pages
- add tab discovery for supported provider URLs
- add manual "use this open page" or equivalent attach flow in Settings
- add page-source heartbeat and reconnect behavior
- add a clear disconnected state when the source tab closes, navigates away, or logs out

### 3.4 Data TODO

- define normalized usage fields
- define partial-data behavior
- define "unknown" vs "0" rules
- define reset-time formatting rules
- define warning-threshold rules
- define sync error codes

### 3.5 QA TODO

- test no-provider state
- test permission denied state
- test stale cache state
- test sync failure state
- test mixed provider success/failure state
- test Chrome profile with multiple logged-in vendor sessions

## 4. Provider Research Checklist Template

Use this same checklist for every provider before coding the adapter.

### 4.1 Research TODO

- identify supported account types
- find official pricing page
- find official quota or limit page
- find official usage page or analytics page
- determine whether a public API exists
- determine whether an admin API exists
- determine whether page parsing is allowed and practical
- determine whether local CLI-only usage can be observed at all

### 4.2 Integration Decision TODO

- choose source priority:
  - official API
  - official dashboard page
  - logged-in page parse
  - not supported for v1
- define minimum useful fields this provider can return
- define which host permissions are required
- define whether `scripting` is required

### 4.3 Adapter TODO

- create provider adapter folder
- define account-type matrix
- implement official fetch path if available
- implement page parser fallback if needed
- add runtime validation for parsed output
- add provider-specific error messages
- add sample fixtures for tests

## 5. Provider Matrix

## 5.1 Summary Table

| Provider | Official usage/quota source | Public/admin API | MVP recommendation |
| --- | --- | --- | --- |
| Cursor | Yes | Yes, for teams | Do first |
| JetBrains AI | Yes | No public usage API found; official console pages exist | Do second |
| Claude Code | Yes, but depends on plan type | Yes, official analytics dashboards and Admin API now exist for org usage | Do third |
| Gemini Code Assist | Quota docs yes; remaining usage exposure unclear | No public usage API found from official docs reviewed | Do later |
| Codex | Plan limits and workspace analytics entry points exist | No simple public usage API found from official docs reviewed | Do later |

Inference note:

- "No public API found" means I did not find an official public usage API in the vendor docs reviewed on 2026-04-20. It does not prove no internal or private API exists.

## 6. Cursor TODO

### 6.1 What official sources exist

Official docs reviewed:

- Cursor pricing and usage:
  https://docs.cursor.com/en/account/usage
- Cursor dashboard:
  https://docs.cursor.com/en/account/teams/dashboard
- Cursor admin API:
  https://docs.cursor.com/en/account/teams/admin-api
- Cursor analytics:
  https://docs.cursor.com/account/teams/analytics

What these sources indicate:

- team admins can create Admin API keys from `cursor.com/dashboard`
- the Admin API exposes team data including usage metrics and spending details
- the dashboard includes billing, usage, and team settings
- analytics export exists for teams

### 6.2 MVP support decision

Support in v1:

- Cursor Teams
- Cursor individual accounts only if dashboard parsing turns out stable enough

### 6.3 Data source strategy

Selected for MVP:

- `A1`: Cursor Admin API for Teams

Fallback:

- `B1`: parse logged-in dashboard pages for individual or non-API cases

### 6.4 Cursor TODO list

- verify Admin API authentication flow end to end
- verify exact endpoint shapes for usage and spending
- define team vs individual account model
- implement Cursor team adapter using Admin API
- implement dashboard parser only if individual usage is needed for v1
- map Cursor fields into normalized model
- test monthly included usage, overage, pooled team usage, and spending limits

### 6.5 Why Cursor should be first

- best documented official integration path among the reviewed providers
- clear admin dashboard concept
- likely lowest DOM fragility if the Admin API is enough

## 7. JetBrains AI TODO

### 7.1 What official sources exist

Official docs reviewed:

- JetBrains AI plans and usage:
  https://www.jetbrains.com/help/ai-assistant/licensing-and-subscriptions.html
- AI management:
  https://www.jetbrains.com/help/jetbrains-console/ai-management.html
- Users and licensing:
  https://www.jetbrains.com/help/jetbrains-console/ai-users-and-licensing.html
- Monitoring current AI Credits usage:
  https://www.jetbrains.com/help/jetbrains-console/monitor-current-ai-credits-usage.html
- Top-up AI credits:
  https://www.jetbrains.com/help/jetbrains-console/top-up-ai-credits.html

What these sources indicate:

- JetBrains AI quota is expressed in AI Credits
- quota resets every 30 days from first use
- Central Console shows current monthly usage and remaining balance
- org-level pages exist for users, licensing, and current usage
- top-up credits and per-user limits also exist

### 7.2 MVP support decision

Support in v1:

- JetBrains org/admin console users
- possibly personal accounts later, but org/admin console is easier to reason about first

### 7.3 Data source strategy

Selected for MVP:

- `A1`: official logged-in Central Console pages

Fallback:

- `B1`: page parsing of the current usage tables in Central Console

Current limitation:

- no public official usage API was found in the reviewed docs

### 7.4 JetBrains TODO list

- verify actual Central Console URLs after login
- inspect whether current AI usage is rendered server-side or via JSON fetches
- capture the exact fields exposed on the Users and licensing page
- implement page parser for current AI Credits usage
- implement parser for plan tier and reset window
- map monthly quota + top-up limits into normalized model
- decide whether to support only admin-visible org usage in v1

### 7.5 Why JetBrains is good early work

- official docs clearly describe where usage is shown
- credit model is explicit
- admin console is likely more stable than consumer-facing marketing pages

## 8. Claude Code TODO

### 8.1 What official sources exist

Official docs reviewed:

- Claude Code costs:
  https://docs.anthropic.com/en/docs/claude-code/costs
- Claude Code analytics:
  https://code.claude.com/docs/en/analytics
- Claude Code usage analytics:
  https://support.claude.com/en/articles/12157520-claude-code-usage-analytics
- Claude Code Analytics Admin API:
  https://platform.claude.com/docs/en/build-with-claude/claude-code-analytics-api
- Admin API overview:
  https://platform.claude.com/docs/en/api/administration-api
- Claude Code with Team / Enterprise:
  https://support.claude.com/en/articles/11845131-use-claude-code-with-your-team-or-enterprise-plan
- Extra usage for Team / Enterprise:
  https://support.claude.com/en/articles/12005970-extra-usage-for-claude-for-work-team-and-enterprise-plans
- Claude Pro plan usage:
  https://support.anthropic.com/en/articles/8324991-about-claude-s-pro-plan-usage
- Claude Code with Pro or Max:
  https://support.anthropic.com/fr/articles/11145838-utilisation-de-claude-code-avec-votre-forfait-pro-ou-max

What these sources indicate:

- Team / Enterprise have official Claude Code usage analytics dashboards
- Anthropic now has an official Claude Code Analytics Admin API for organization analytics
- API / Console organizations can access a structured JSON analytics source with Admin API access
- Team and seat-based Enterprise usage still uses included windows and optional extra usage, which does not map cleanly to an exact remaining-quota API from the reviewed docs
- Pro / Max usage is also windowed every 5 hours, but public docs still describe ranges instead of a stable account-level usage API
- `/cost` remains session-local and is not a centralized account dashboard

### 8.2 MVP support decision

Support in v1:

- organizations with Admin API access first

Maybe later:

- Team / seat-based Enterprise dashboard parsing
- Pro / Max, but likely only with reduced fidelity unless a stable page can be parsed

### 8.3 Data source strategy

Preferred:

- `A1`: official Claude Code Analytics Admin API for orgs with Admin API access

Fallback:

- `B1`: page parse of `claude.ai/analytics/claude-code` or `platform.claude.com/claude-code`

Not recommended for v1:

- using CLI `/cost` as the main data source

Reason:

- the Admin API is structured and official
- the dashboard path is still useful as a fallback, but the reviewed docs do not publish a stable JSON contract for it
- `/cost` only reflects current-session usage, not account-level aggregated quota

### 8.4 Claude TODO list

- separate Admin API org analytics from Team / seat-based Enterprise and Pro / Max
- verify Admin API authentication flow end to end
- capture sanitized Admin API fixtures
- define how Claude analytics maps into the quota-centric shared model
- implement Admin API-backed Claude adapter
- keep Team / seat-based Enterprise page parsing as a later fallback path
- explicitly mark Pro / Max as unsupported initially

### 8.5 Important product note

Claude Code actually represents multiple billing modes:

- subscription usage windows for Team premium seats, seat-based Enterprise, Pro, and Max
- token-spend / analytics-oriented organization model for usage-based Enterprise and Console Admin API contexts

That means the adapter needs account-type branching from day one.

## 9. Gemini Code Assist TODO

### 9.1 What official sources exist

Official docs reviewed:

- Gemini Code Assist quotas and limits:
  https://developers.google.com/gemini-code-assist/resources/quotas
- Gemini Code Assist FAQs:
  https://developers.google.com/gemini-code-assist/resources/faqs
- Manage licenses:
  https://developers.google.com/gemini-code-assist/docs/manage-licenses
- Set up Standard / Enterprise:
  https://developers.google.com/gemini-code-assist/docs/set-up-gemini-standard-enterprise

What these sources indicate:

- Gemini Code Assist and Gemini CLI share quotas in some cases
- quotas differ by edition and plan
- request-per-minute and request-per-day limits are clearly documented
- standard and enterprise are managed through Google Cloud / Google Developer Program paths

### 9.2 Current limitation

The reviewed public docs clearly expose quota rules, but they do not clearly expose a simple public "remaining usage API" or a straightforward account usage dashboard for individuals.

So for Gemini there are two possible MVP levels:

- level 1: show known quota policy based on plan
- level 2: show actual consumed and remaining usage after inspecting real logged-in pages

### 9.3 Data source strategy

Preferred:

- `A1`: official quota docs for static plan metadata
- `A2`: inspect Google Cloud / Gemini account pages for actual remaining usage if rendered there

Fallback:

- `B1`: logged-in page parse in Google Cloud console or Gemini-related settings pages

### 9.4 Gemini TODO list

- decide whether v1 Gemini support means "static quota reference" or "live remaining usage"
- test free, Pro/Ultra, Standard, and Enterprise account paths separately
- inspect whether Google Cloud console exposes quota consumption for Gemini Code Assist directly
- inspect whether Gemini Code Assist IDE extension surfaces remaining usage that can be tied to a web account page
- implement plan-to-quota mapping from official docs
- only build a live-usage adapter if a stable logged-in page or JSON endpoint is confirmed

### 9.5 Product recommendation

Do not promise "remaining Gemini usage" in v1 until an actual stable source is confirmed.

Support it first as:

- plan
- quota window
- documented limits

Then upgrade to live usage later if feasible.

## 10. Codex TODO

### 10.1 What official sources exist

Official docs reviewed:

- Using Codex with your ChatGPT plan:
  https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan/
- Codex pricing for teams:
  https://openai.com/index/codex-flexible-pricing-for-teams/
- Codex rate card:
  https://help-lb.openai.com/en/articles/20001106-codex-rate-card
- ChatGPT Business credits and spend controls:
  https://help.openai.com/en/articles/20001155-managing-credits-and-spend-controls-in-chatgpt-business
- Codex GA announcement:
  https://openai.com/index/codex-now-generally-available/

What these sources indicate:

- Codex usage limits depend on plan
- Plus / Pro use rolling windows with plan-specific limits
- Business and Enterprise can involve credits, spend controls, and workspace analytics
- Business billing docs explicitly reference workspace settings, billing, credits, and usage analytics for Codex
- enterprise analytics exist for Codex-enabled workspaces
- Compliance API includes cloud/web Codex usage, but not local usage

### 10.2 Current limitation

The reviewed docs do not expose a simple public usage API suitable for all Codex users.

That means Codex support likely splits into:

- personal plans: page-based or "plan-limit only"
- Business / Enterprise: workspace analytics or billing pages

### 10.3 Data source strategy

Preferred:

- `A1`: Business / Enterprise workspace billing and analytics pages

Fallback:

- `B1`: logged-in page parse from ChatGPT workspace settings

Not supported in v1:

- accurate local CLI-only usage tracking through the browser extension alone

Reason:

- local usage is not exposed through the Compliance API according to the help article snippet reviewed

### 10.4 Codex TODO list

- split account types:
  - Plus / Pro
  - Business
  - Enterprise / Edu
- verify the actual UI paths under ChatGPT workspace settings after login
- inspect whether billing and analytics pages expose JSON data behind the UI
- determine whether personal plans expose enough usage detail to be worth supporting
- implement Business / Enterprise adapter first if stable analytics pages are available
- defer local-only CLI fidelity claims until a real source is confirmed

### 10.5 Product recommendation

For v1, prefer:

- Codex Business / Enterprise workspace support

Defer:

- personal plan live-remaining-usage support

## 11. UI Shape

The MVP UI should be a side panel with a compact dashboard and a light detail view.

### 11.1 Primary UI goals

- status at a glance
- one-click refresh
- low reading cost
- no table-heavy enterprise look for the main view

### 11.2 Main screen layout

```text
+--------------------------------------------------+
| AI Usage Dashboard          Refresh   Settings   |
+--------------------------------------------------+
| Connected: 3   Warning: 1   Errors: 1           |
+--------------------------------------------------+
| [Cursor]      OK                                  |
| Pro Team                                           |
| Used 320 / 500 req                                |
| Resets in 12 days                                 |
| Last sync 2m ago                                  |
| [Open] [Refresh]                                  |
+--------------------------------------------------+
| [JetBrains]   Warning                             |
| AI Pro                                             |
| 16 / 20 credits used                              |
| Resets in 6 days                                  |
| Last sync 4m ago                                  |
| [Open] [Refresh]                                  |
+--------------------------------------------------+
| [Claude Code] Error                               |
| Team Premium                                       |
| Could not sync latest data                         |
| Last good snapshot: 34m ago                        |
| [Open] [Retry]                                     |
+--------------------------------------------------+
```

### 11.3 Provider detail page

When user opens a provider:

```text
+--------------------------------------------------+
| <- Cursor                                         |
+--------------------------------------------------+
| Status: OK                                        |
| Source: Official API                              |
| Plan: Teams                                       |
| Quota model: monthly requests                     |
| Used: 320                                         |
| Remaining: 180                                    |
| Reset at: 2026-05-01 00:00                        |
| Last sync: 2026-04-20 10:33                       |
|                                                    |
| Host access: Granted                              |
| Account type: Team admin                          |
| Raw summary: ...                                  |
|                                                    |
| [Refresh now] [Disconnect provider]               |
+--------------------------------------------------+
```

### 11.4 UI components TODO

- top bar
- summary strip
- provider card
- status badge
- progress bar or usage bar
- provider detail page
- settings page
- permission request modal
- empty state
- error state

### 11.5 UI behavior TODO

- sort by severity first
- then sort by earliest reset
- show stale badge if last sync is old
- keep the last good snapshot visible on failure
- use a collapsed list by default, not tabs

## 12. UI-Specific TODO List

### 12.1 Dashboard TODO

- build dashboard shell
- add provider list
- add loading skeletons
- add warning and error badges
- add refresh controls
- add empty state copy

### 12.2 Detail TODO

- build provider detail route
- show normalized fields
- show source type
- show host permission state
- show last sync metadata
- show disconnect action

### 12.3 Settings TODO

- global sync interval
- stale threshold
- warning threshold
- toggle provider visibility
- permission management

## 13. Suggested Sprint Breakdown

### Sprint 1

- scaffold MV3 extension
- create Material theme foundation
- create side panel shell
- fake provider cards
- define normalized model

### Sprint 2

- build storage and sync engine
- add refresh actions
- add stale / error states
- complete Cursor integration

### Sprint 3

- add JetBrains integration
- add permission request flow
- add provider detail page

### Sprint 4

- add Claude Team / Enterprise integration
- evaluate Gemini feasibility
- evaluate Codex Business / Enterprise feasibility

## 14. Practical Decision Rules

Use these rules while building:

- if a provider has an official API, use it first
- if a provider has only an official dashboard, prefer parsing the logged-in dashboard over scraping marketing pages
- if a provider only exposes local CLI session stats, do not pretend it is full account usage
- if a provider exposes only quota policy but not current usage, label it clearly as quota reference, not live usage
- if a provider requires broad host access with no clear value, postpone that provider

## 15. Current Source Links

These are the official sources reviewed while preparing this TODO document:

- Cursor usage:
  https://docs.cursor.com/en/account/usage
- Cursor dashboard:
  https://docs.cursor.com/en/account/teams/dashboard
- Cursor admin API:
  https://docs.cursor.com/en/account/teams/admin-api
- Cursor analytics:
  https://docs.cursor.com/account/teams/analytics
- JetBrains plans and usage:
  https://www.jetbrains.com/help/ai-assistant/licensing-and-subscriptions.html
- JetBrains users and licensing:
  https://www.jetbrains.com/help/jetbrains-console/ai-users-and-licensing.html
- JetBrains current AI Credits usage:
  https://www.jetbrains.com/help/jetbrains-console/monitor-current-ai-credits-usage.html
- Anthropic Claude Code costs:
  https://docs.anthropic.com/en/docs/claude-code/costs
- Anthropic Claude Code usage analytics:
  https://support.anthropic.com/en/articles/12157520-claude-code-usage-analytics
- Anthropic Team / Enterprise usage:
  https://support.anthropic.com/en/articles/11845131-using-claude-code-with-your-enterprise-plan
- Anthropic Pro usage:
  https://support.anthropic.com/en/articles/8324991-about-claude-s-pro-plan-usage
- Google Gemini Code Assist quotas:
  https://developers.google.com/gemini-code-assist/resources/quotas
- Google Gemini Code Assist FAQs:
  https://developers.google.com/gemini-code-assist/resources/faqs
- Google Gemini Code Assist manage licenses:
  https://developers.google.com/gemini-code-assist/docs/manage-licenses
- OpenAI Codex plan usage:
  https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan/
- OpenAI Codex flexible pricing:
  https://openai.com/index/codex-flexible-pricing-for-teams/
- OpenAI Codex rate card:
  https://help-lb.openai.com/en/articles/20001106-codex-rate-card
- OpenAI Business credits and spend controls:
  https://help.openai.com/en/articles/20001155-managing-credits-and-spend-controls-in-chatgpt-business
- Material Design 3:
  https://m3.material.io/
- Material Web theming:
  https://material-web.dev/theming/material-theming/

## 16. Personal-User Support Track

This section covers the next product track after the release-candidate work.

Goal:

- make the extension useful for individual users who do not have team Admin APIs or Enterprise analytics access

Current product stance:

- use logged-in official usage pages when they expose defensible data
- avoid raw cookie harvesting as the primary design
- treat page-session access as a browser-context integration, not as a credential-export feature

Observed candidate pages from the current local Chrome profile on 2026-04-21:

- Codex:
  - `https://chatgpt.com/codex/settings/usage`
  - `https://chatgpt.com/codex/cloud/settings/usage`
  - `https://chatgpt.com/codex/cloud/settings/analytics#usage`
- Cursor:
  - `https://cursor.com/cn/dashboard/usage`
- Gemini:
  - `https://console.cloud.google.com/gemini-code-assist/metrics?project=sincere-office-460607-g9`
- Claude:
  - `https://claude.ai/settings/usage`

### 16.1 Common TODO

- define the hybrid source model in code and UI
- add tab-bound page-source adapters
- add provider-specific page fixture capture and redaction
- define which numbers are:
  - exact
  - inferred from page copy
  - analytics-only
  - unavailable
- make unsupported states honest instead of forcing a fake remaining field

### 16.2 Codex Personal TODO

- compare `chatgpt.com/codex/settings/usage` against both `chatgpt.com/codex/cloud/settings/usage` and `chatgpt.com/codex/cloud/settings/analytics#usage`
- determine whether personal plans expose:
  - exact remaining usage
  - usage window status only
  - usage analytics without remaining quota
- inspect whether the page exposes:
  - stable DOM fields
  - preloaded route data
  - same-origin JSON calls that can be observed from page context
- define a personal-user path that coexists with the existing Enterprise analytics integration

Current findings from the 2026-04-21 spikes:

- copied ChatGPT sessions are not a reliable extraction path for Codex personal support
- the next real implementation step had to target the already-open logged-in ChatGPT tab
- the first successful live capture matched `https://chatgpt.com/codex/cloud/settings/analytics#usage`
- that live page exposed exact remaining percentages and reset times directly in rendered DOM
- `https://chatgpt.com/codex/settings/usage` remains an observed candidate route, but it is not yet the first proven extraction surface

Recommendation:

- do this first
- start implementation from the proven `cloud/settings/analytics#usage` DOM surface, then backfill the non-cloud route only if a later live fixture proves it equivalent

### 16.3 Cursor Personal TODO

- inspect `cursor.com/cn/dashboard/usage`
- determine whether the usage page is server-rendered, client-rendered, or hydrated from boot JSON
- avoid locale-specific selectors if the page can also appear under non-`/cn/` routes
- define whether personal Cursor support returns:
  - exact used / remaining values
  - current billing-period usage only
  - plan metadata plus warning states

Current findings from the 2026-04-21 spike:

- the live route `https://cursor.com/cn/dashboard/usage` rendered mostly English UI copy despite the `/cn/` path
- the live page visibly exposed plan cards, on-demand usage state, a billing-period usage chart, and CSV export
- the page did not visibly expose an exact remaining included-request counter
- `view-source` showed repeated `self.__next_f.push(...)` flight payloads and no `__NEXT_DATA__`
- the most honest first implementation target is a boot-data / flight parser with DOM fallback

Decision:

- treat Cursor personal support as `current billing-period usage only` for now
- do not promise exact remaining included requests unless a later fixture proves they are actually present

Recommendation:

- do this second

### 16.4 Claude Personal TODO

- inspect `claude.ai/settings/usage`
- classify outcomes:
  - logged out
  - free / no paid usage page
  - Pro / Max usage page available
  - redirected or gated account states
- determine whether the page offers exact remaining usage, rolling-window status, or only subscription copy
- keep unsupported personal states explicit if the page is too fragile or too incomplete

Current findings from the 2026-04-22 spike:

- in the current logged-in browser session, `https://claude.ai/settings/usage` redirected to `https://claude.ai/upgrade`
- the live page exposed only plan and upgrade content:
  - `Free`
  - `Pro`
  - `Max`
  - `Individual`
  - `Team and Enterprise`
- no usage meter, remaining allowance, rolling window, or reset time was visible

Decision:

- keep personal Claude unsupported for now
- treat redirected or upgrade-only states as first-class account states
- revisit only after capturing a real Pro or Max usage page, if one exists

Recommendation:

- do this third

### 16.5 Gemini Metrics TODO

- inspect `console.cloud.google.com/gemini-code-assist/metrics`
- decide whether it is project usage, org usage, or user usage
- avoid presenting project metrics as personal quota
- define whether Gemini should remain:
  - `policy_only`
  - `project_metrics`
  - or unsupported for personal users

Current findings from the 2026-04-22 spike:

- the current desktop Chrome session recorded the live route title as `Gemini Code Assist Metrics`
- the route is explicitly project-scoped:
  - `https://console.cloud.google.com/gemini-code-assist/metrics?project=sincere-office-460607-g9`
- the same session also recorded the companion overview route with the same project id
- Chrome session metadata showed Google Cloud console frame markers rather than a simple standalone usage page:
  - `dynamicFrame`
  - `p/bscframe`
  - `pangolin/iframe.html`
- direct unauthenticated access redirects to Google sign-in for `service=cloudconsole`

Decision:

- keep Gemini `policy_only` in the shipped extension
- keep Gemini unsupported for the current personal-user support track
- revisit only if the product later chooses to add explicit `project metrics` support with honest labels and bound-tab behavior

Recommendation:

- do this fourth and treat it as a product-modeling task, not just a parser task

### 16.6 Completed Research And UX Queue

- [28_Phase_Hybrid_Source_Model_Design.md](./TODOs/Archive/28_Phase_Hybrid_Source_Model_Design.md)
- [29_Phase_Page_Session_Adapter_Framework.md](./TODOs/Archive/29_Phase_Page_Session_Adapter_Framework.md)
- [30_Phase_Codex_Personal_Usage_Page_Spike.md](./TODOs/Archive/30_Phase_Codex_Personal_Usage_Page_Spike.md)
- [30_1_Phase_Codex_Live_Tab_Fixture_Capture.md](./TODOs/Archive/30_1_Phase_Codex_Live_Tab_Fixture_Capture.md)
- [31_Phase_Cursor_Personal_Usage_Page_Spike.md](./TODOs/Archive/31_Phase_Cursor_Personal_Usage_Page_Spike.md)
- [32_Phase_Claude_Personal_Usage_Page_Spike.md](./TODOs/Archive/32_Phase_Claude_Personal_Usage_Page_Spike.md)
- [33_Phase_Gemini_Project_Metrics_Page_Spike.md](./TODOs/Archive/33_Phase_Gemini_Project_Metrics_Page_Spike.md)
- [34_Phase_Hybrid_Source_UX_And_QA.md](./TODOs/Archive/34_Phase_Hybrid_Source_UX_And_QA.md)

### 16.7 Review After Phase 34

Current state after the completed hybrid-source queue:

- the release-candidate product shell is stable and fully verified for the shipped sources
- `JetBrains AI` is the first shipped `session_page` provider and proves that the page-session framework works in production
- `Codex` and `Cursor` now have enough personal-user evidence to justify implementation work, not more first-pass research
- `Claude personal` remains deferred until a real paid usage page is captured
- `Gemini` remains `policy_only` unless the product later chooses to support explicitly labeled project metrics

Next direction:

- do not spend the next cycle on generic UI polish
- do not reopen provider research unless new evidence appears
- ship the two highest-value personal-user paths first:
  - `Codex`
  - `Cursor`
- after that, harden source arbitration, bound-tab reconnect, and mixed-source verification before cutting the next RC

### 16.8 Next Phase Queue

- [35_Phase_Codex_Personal_Snapshot_Parser.md](./TODOs/Archive/35_Phase_Codex_Personal_Snapshot_Parser.md)
- [36_Phase_Codex_Personal_Live_Wiring.md](./TODOs/Archive/36_Phase_Codex_Personal_Live_Wiring.md)
- [37_Phase_Cursor_Personal_Snapshot_Parser.md](./TODOs/Archive/37_Phase_Cursor_Personal_Snapshot_Parser.md)
- [38_Phase_Cursor_Personal_Live_Wiring.md](./TODOs/Archive/38_Phase_Cursor_Personal_Live_Wiring.md)
- [39_Phase_Hybrid_Source_Selection_And_Fallback.md](./TODOs/Archive/39_Phase_Hybrid_Source_Selection_And_Fallback.md)
- [40_Phase_Page_Binding_Persistence_And_Reconnect.md](./TODOs/Archive/40_Phase_Page_Binding_Persistence_And_Reconnect.md)
- [41_Phase_Personal_Mixed_Source_Real_Chrome_Verification.md](./TODOs/Archive/41_Phase_Personal_Mixed_Source_Real_Chrome_Verification.md)
- [42_Phase_RC2_Packaging_And_Release_Docs.md](./TODOs/Archive/42_Phase_RC2_Packaging_And_Release_Docs.md)
