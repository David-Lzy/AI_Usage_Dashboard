# AI Usage Dashboard TODOs

Date: 2026-05-13

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

The project is no longer in shell-building or first provider-wiring mode.

Current post-`Phase 369` execution priority:

1. `P0` - keep `release/ai-usage-dashboard-0.1.0-rc.13.zip` as the submitted Chrome Web Store review boundary. Do not silently mutate or rewrite the [RC13 upload-candidate milestone](./Milestones/2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md) while that submission remains the human-reviewed baseline.
2. `P0` - treat `release/ai-usage-dashboard-0.1.0-rc.15.zip` as the current packaged follow-up candidate. It includes the previous `rc.14` follow-up work plus post-`rc.14` local-safe maintenance through `Phase 363`, and is ready if review feedback or an explicit resubmission decision needs a newer build.
3. `P0` - keep the refreshed `Direction 10.3` screenshot evidence archived and ready, not pending: [2026-05-04-rc11-mixed-store-candidate-archive](./testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md) still fulfills the latest reviewed screenshot pack with `5/5` images and `3` explicit truth-boundary notes.
4. `P1` - if a resubmission becomes necessary, use [2026-05-13_RC15_Maintenance_Follow_Up_Release_Candidate.md](./Milestones/2026-05-13_RC15_Maintenance_Follow_Up_Release_Candidate.md) as the current packaged-source reference and cut a fresh submission milestone from that boundary instead of mutating RC13 history.
5. `P2` - no numbered phase is currently queued after `Phase 369`. If continuing, review the project and create a new small TODO before changing behavior.
6. `P2` - keep the `Phase 309` first-provider setup behavior stable: zero-provider Settings now recommends one personal-user provider in Quick Setup and popup zero-provider actions deep-link to that same setup card.
7. `P2` - keep the `Phase 310` cached-first guard stable: standard dashboard routes must keep rendering cached app state while background bootstrap is still loading.
8. `P2` - keep the `Phase 311` popup view-model split behavior-only: `src/popup/view-models.ts` remains the public aggregator and the extracted setup-coverage / featured-card modules should not change popup UI semantics.
9. `P2` - keep the `Phase 312` RDP route-contract guard stable: ordinary Chrome tab/app-window captures of dashboard, Settings, focused Settings, and provider detail must use the full-page surface path, while `popup` remains the only popup app-window route.
10. `P2` - keep the `Phase 313` store screenshot route-config reuse stable: request-bound screenshot plans should keep route path, title, and size values aligned with the shared RDP extension-window route table instead of duplicating those strings.
11. `P2` - keep the `Phase 314` interaction-audit frame-action split behavior-only: iframe readiness and preset-action helpers live outside the route component, but signoff state, exports, request binding, and operator copy stay unchanged.
12. `P2` - keep the `Phase 315` operator download-helper split behavior-only: interaction-audit and theme-recovery exports share one tested browser download helper, but artifact content, filenames, and schemas stay unchanged.
13. `P2` - keep the `Phase 316` operator clipboard-helper split behavior-only: interaction-audit and theme-recovery share clipboard writes, while interaction-audit still distinguishes unavailable clipboard access from failed writes.
14. `P2` - keep the `Phase 317` operator runtime-i18n helper split behavior-only: interaction-audit and theme-recovery share default `system` locale bootstrap without changing runtime locale resolution rules.
15. `P2` - keep the `Phase 318` Settings focused deep-link guard stable: popup setup/problem targets should keep landing on Quick Setup or Advanced source cards instead of degrading to a generic Settings open.
16. `P2` - keep the `Phase 366` first-run onboarding focus stable: zero-provider dashboard users should have a direct Quick Setup action, and hidden-provider Quick Setup deep links should land on the Quick Setup section instead of the top of Settings.
17. `P2` - keep the `Phase 367` through `Phase 369` localization expansion stable: Settings language options must keep coming from the 14-locale registry, Arabic must resolve `rtl`, manifest `_locales` catalogs must keep the stable manifest ids, English fallback text in RTL surfaces must keep natural punctuation order, RDP locale smoke captures must validate `--locale` against the 14 runtime tags, and non-reviewed runtime locales may fall back to English rather than translating raw evidence fields.
18. `P2` - keep the `Phase 319` popup Settings-focus helper stable: explicit provider Settings actions should target Quick Setup, while generic Settings actions derive the first relevant visible-provider target.
19. `P2` - keep the `Phase 320` popup source-page tab-selection helper stable: exact preferred routes, active tabs, recent tabs, and numeric tab ids should keep the same precedence before page binding or tab activation.
20. `P2` - keep the `Phase 321` popup route-action helper stable: side-panel, full-page, Settings, dashboard, and provider-detail handoffs should continue to preserve focused hashes and pending full-page entries.
21. `P2` - keep the `Phase 322` popup sidePanel route-action guard stable: active-tab and current-window Chrome sidePanel branches should continue to set the expected path and close the popup.
22. `P2` - keep the `Phase 323` popup source-page action helper stable: unsupported-provider fallback, direct window open, existing-tab binding plus refresh, and created-tab binding should keep their current behavior.
23. `P2` - keep the `Phase 324` popup refresh action helper stable: direct refresh, one-provider host-access prompting, denied-access messaging, browser rejection fallback, and granted-access continuation should keep their current behavior.
24. `P2` - keep the `Phase 325` popup theme-toggle action helper stable: light/dark/system-resolved next-mode selection should keep sending only `themeMode` through the existing `app:update-settings` path.
25. `P2` - keep the `Phase 326` popup hide-provider action helper stable: hide/ignore provider actions should keep using `app:set-provider-enabled` with `enabled: false`.
26. `P2` - keep the `Phase 327` popup guidance action helper stable: Settings focus, dashboard, provider-detail, source-page, and hide-provider no-op routing should keep using the existing popup route/source helpers.
27. `P2` - keep the `Phase 328` popup provider progress component stable: usage-window-first rendering, single-value fallback, and empty percent-only suppression should keep matching dashboard truth boundaries.
28. `P2` - keep the `Phase 329` popup snapshot-status split stable: no-provider, aligned, mixed timestamp, missing permission, and sync-error status decisions should remain covered outside the view-model aggregator.
29. `P2` - keep the `Phase 330` popup guidance-card split stable: first setup, missing access, missing credential, blocked provider, policy-only, and ready-provider guidance decisions should remain covered outside the view-model aggregator.
30. `P2` - keep the `Phase 331` popup featured-section split stable: zero-provider, needs-attention, policy-only, and all-clear section stories should remain covered outside the view-model aggregator.
31. `P2` - keep the `Phase 332` popup surface-route split stable: secondary action selection and surface-ownership copy should remain covered outside the view-model aggregator.
32. `P2` - keep the `Phase 333` popup localized view-model split stable: localized popup orchestration should remain outside the raw view-model builder while preserving the public re-export path.
33. `P2` - keep the `Phase 348` popup featured-provider list split stable: quota-first provider-card rendering should stay outside `PopupApp.tsx` while action execution and settings-focus targeting remain route-owned.
34. `P2` - keep the `Phase 349` popup header split stable: refresh, theme-toggle, and dashboard-tab header controls should stay outside `PopupApp.tsx` while route-owned handlers and pending states remain unchanged.
35. `P2` - keep the `Phase 350` popup guidance-card rendering split stable: no-featured-provider guidance-card markup should stay outside `PopupApp.tsx` while route-owned action routing and settings-focus targeting remain unchanged.
36. `P2` - keep the `Phase 351` popup setup-coverage rendering split stable: no-featured-provider setup-coverage markup should stay outside `PopupApp.tsx` while route-owned action routing and settings-focus targeting remain unchanged.
37. `P2` - keep the `Phase 352` popup snapshot-status rendering split stable: no-featured-provider snapshot-status markup should stay outside `PopupApp.tsx` while route-owned display gating remains unchanged.
38. `P2` - keep the `Phase 353` popup action-section rendering split stable: no-featured-provider action-card markup should stay outside `PopupApp.tsx` while route-owned action execution remains unchanged.
39. `P2` - keep the `Phase 354` popup surface-roles rendering split stable: no-featured-provider surface-roles markup should stay outside `PopupApp.tsx` while route-owned display gating remains unchanged.
40. `P2` - keep the `Phase 355` popup featured-section rendering split stable: no-featured-provider featured-section and empty-state markup should stay outside `PopupApp.tsx` while route-owned display gating remains unchanged.
41. `P2` - keep the `Phase 356` popup load-state rendering split stable: loading/error card markup should stay outside `PopupApp.tsx` while route-owned retry and open actions remain unchanged.
42. `P2` - keep the `Phase 357` Settings source-card view-model split stable: compact fields, session-track, and diagnostics model construction should stay outside `settings-view-models.ts` while compatibility re-exports remain intact.
43. `P2` - keep the `Phase 358` Settings Quick Setup view-model split stable: action ids, card construction, setup-state resolution, and helper text selection should stay outside `settings-view-models.ts` while compatibility re-exports remain intact.
44. `P2` - keep the `Phase 359` page-session tab-priority helper stable: exact URL, hash-stripped URL, prefix URL, matched-title, active-tab boost, and recency weighting should stay covered outside the large page-session client.
45. `P2` - keep the `Phase 360` page-session tab-lifecycle helper stable: open-missing-tab, reload-tab, load-wait, reload-option normalization, and close cleanup semantics should stay covered outside the large page-session client.
46. `P2` - keep the `Phase 361` page-session script-capture helper stable: script-result execution, isolated DOM snapshots, main-world window-value reads, selector/key normalization, and truncation semantics should stay covered outside the large page-session client.
47. `P2` - keep the `Phase 362` page-session network-observer helper stable: bridge install/read behavior, fetch/XHR capture defaults, bridge id, and malformed snapshot fallback should stay covered outside the large page-session client.
48. `P2` - keep the `Phase 363` page-session candidate-tabs helper stable: bound-tab lookup, query-only bound fallback, duplicate filtering, binding-missing reporting, and auto priority sorting should stay covered outside the large page-session client.
49. `P2` - keep the `Phase 334` interaction-audit surface-card split stable: per-surface iframe, preset-action, manual-check, and signoff controls should stay outside the large operator route while route-owned state remains in the route.
50. `P2` - keep the `Phase 335` interaction-audit review-queue split stable: queue summary and jump-list rendering should stay outside the large operator route while queue construction remains route-owned.
51. `P2` - keep the `Phase 336` interaction-audit request-scope split stable: request binding summaries and next-command display should stay outside the large operator route while request-context state remains route-owned.
52. `P2` - keep the `Phase 337` interaction-audit signoff-session split stable: signoff workspace header, summary metrics, metadata fields, timestamp action, and session-summary note should stay outside the large operator route while metadata state remains route-owned.
53. `P2` - keep the `Phase 338` interaction-audit handoff-summary split stable: handoff counts, grouped surface lists, preview text, and operator workflow display should stay outside the large operator route while draft generation and copy/download handlers remain route-owned.
54. `P2` - keep the `Phase 345` interaction-audit guidance-card split stable: operator checklist and extension surface links should stay outside the large operator route while URL construction remains route-owned.
55. `P2` - keep the `Phase 346` interaction-audit workspace-controls split stable: signoff action buttons, JSON import controls, feedback, and draft preview should stay outside the large operator route while state and handlers remain route-owned.
56. `P2` - keep the `Phase 347` interaction-audit surface-grid split stable: surface-card mapping and fallback signoff-state behavior should stay outside the large operator route while refs, readiness state, and callbacks remain route-owned.
57. `P2` - keep the `Phase 339` theme-recovery current-state split stable: overall stage, popup snapshot, and action-badge display should stay outside the route while snapshot construction and live badge reads remain route-owned.
58. `P2` - keep the `Phase 340` theme-recovery theme-state split stable: theme mode, resolved mode, preset, custom seed, scope isolation, and badge-source detail should stay outside the route while snapshot and live badge inputs remain route-owned.
59. `P2` - keep the `Phase 341` theme-recovery request-scope split stable: bound/ad-hoc request identity display should stay outside the route while query parsing and request-context state remain route-owned.
60. `P2` - keep the `Phase 342` theme-recovery provider-list split stable: provider recovery cards and status badges should stay outside the route while snapshot construction and recovery classification remain route-owned.
61. `P2` - keep the `Phase 343` theme-recovery workflow-links split stable: workflow checklist and extension/vendor link groups should stay outside the route while link ids, hrefs, target behavior, and data hooks remain unchanged.
62. `P2` - keep the `Phase 344` theme-recovery outputs split stable: export buttons, draft previews, and feedback rendering should stay outside the route while draft generation and copy/download/open callbacks remain route-owned.
63. `P2` - Provider closure waits only on the accounts that are still unavailable:
   - JetBrains org-console reverification waits for a real org-visible `Users and licensing` session.
   - Claude individual Pro / Max usage-page behavior remains separate from the now-shipped Claude Team session-page path.
   - Gemini project-metrics graduation waits for a product decision that project-scoped metrics are acceptable.
64. `P2` - real operator evidence is now closed as of 2026-05-11: Direction 04 interaction-audit closure archived under [2026-05-11-2026-05-11-rdp-chrome-visual-audit](./testing/operator_reviews/2026-05-11-2026-05-11-rdp-chrome-visual-audit/README.md); Direction 05 theme-recovery closure archived under [2026-05-11-system-recovered-014312](./testing/theme_recovery_reviews/2026-05-11-system-recovered-014312/README.md). No further operator evidence phases are queued unless a new surface or theme regression opens them.
65. `P2` - continue file splitting only when a concrete maintenance issue justifies it; the old queued split targets for `material-theme.css`, `SettingsPage.tsx`, `App.tsx`, `standard-app-actions.ts`, and `localized-copy.ts` are now closed or reduced to focused compatibility/aggregator files.

Delivery rule for this stage:

- keep active implementation phases narrow and independently verifiable
- keep file-splitting separate from release packaging, provider verification, and store evidence closeout
- preserve the current provider truth boundaries while changing UI presentation
- treat `rc.13` as the current submitted store-review boundary, and `rc.15` as the current packaged follow-up candidate; `rc.14`, `rc.12`, and `rc.11` remain historical evidence

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
- `Phase 169` completed the next `Direction 10.3` slice by adding one request-bound manual finalize command plus handoff update, so popup import, archive-readiness validation, and request completion can now run in one repo-backed step once the real native-toolbar popup files exist
- `Phase 296` closed the refreshed store screenshot archive dependency under `Doc/Roadmap/10_3_Store_Asset_Pack_And_Submission_TODOs.md`
- `Phase 170` completed the first `Direction 09` slice by shipping one manifest locale bootstrap baseline plus one message-id contract and one string inventory
- `Phase 171` completed the next `Direction 09` slice by shipping one shared runtime i18n helper, persisted locale normalization, and the first localized popup/dashboard shell slice while keeping broader settings, provider-detail, popup body copy, and operator workspaces English for now
- `Phase 172` completed the next `Direction 09` slice by shipping locale-aware formatting for generated counts, percentages, and parseable timestamp primitives across popup, dashboard, and provider-detail surfaces while keeping most deeper body copy and durations pending
- `Phase 173` completed the next `Direction 09` slice by shipping the first settings-shell localization rollout, including the locale selector, top-level settings headings, settings summary labels, and localized preferences-saved feedback while keeping deeper settings helper copy, provider-detail copy, and popup explanatory copy outside the localized slice
- `Phase 174` completed the next `Direction 09` slice by localizing popup explanatory copy plus provider-detail shell/static copy under one shared structured-copy helper while keeping deeper settings helper copy, raw provider source-truth detail strings, localized durations, and operator workspaces outside the shipped pilot
- `Phase 175` completed the next `Direction 09` slice by localizing deeper settings helper copy across theme-customization status messaging, credential cards, source-card diagnostics/session-track helper copy, and permission prompts while keeping localized durations, operator workspaces, and raw provider source-truth detail strings outside the shipped pilot
- `Phase 176` completed the next `Direction 09` slice by localizing duration-bearing freshness and reset labels across popup snapshot status, popup featured-provider freshness chips, and dashboard provider cards while keeping raw provider source-truth detail strings and operator workspaces outside the shipped pilot
- `Phase 177` completed the next `Direction 09` slice by shipping runtime `lang` and `dir` sync, one preview `app-dir` override, one first logical-CSS hardening pass, and tighter compact-width action behavior for the current `en` plus `zh_CN` pilot
- `Phase 178` completed the next `Direction 09` slice by adding one maintained operator-workspace localization boundary plus one repeatable extraction review for interaction-audit and theme-recovery workspaces
- `Phase 179` completed the next `Direction 09` slice by localizing interaction-audit and theme-recovery workspace shell/navigation/helper copy for `en` plus `zh_CN` while keeping evidence payloads, export schemas, request identifiers, fixture ids, filenames, and source-truth labels English
- `Phase 180` completed the next `Direction 09` slice by localizing store-screenshot seed and native popup probe helper-route copy while preserving automation titles, preset ids, route hashes, and the manual native-toolbar popup capture truth boundary
- `Phase 181` completed the next `Direction 09` slice by localizing screenshot-adjacent submission-support captions inside the store seed helper route while keeping final popup, side-panel, and full-page screenshot surfaces unchanged
- `Phase 182` completed the next `Direction 09` slice by adding one maintained raw provider source-truth localization policy and identifying provider-source display wrappers as the next safe localized bucket
- `Phase 183` completed the next `Direction 09` slice by localizing provider-source display wrappers for source labels, availability/fidelity/connection labels, helper descriptions, and generated availability summaries while preserving raw adapter evidence strings
- `Phase 184` completed the next `Direction 09` slice by adding one maintained adapter diagnostic reason-code plan and one `09.3` child TODO before any diagnostic-body localization
- `Phase 185` completed the next `Direction 09` slice by adding the type-only additive diagnostic model, known diagnostic code categories, raw-message fallback helpers, and focused tests without changing rendered UI behavior
- `Phase 186` completed the next `Direction 09` slice by populating Cursor source-selection and fallback typed diagnostics through shared builders while preserving raw adapter strings and rendered UI behavior
- `Phase 187` completed the next `Direction 09` slice by populating Codex source-selection and fallback typed diagnostics through the same shared builders while preserving raw adapter strings and rendered UI behavior
- `Phase 188` completed the next `Direction 09` slice by populating Cursor and Codex credential plus host-access typed warning diagnostics while preserving raw adapter strings and rendered UI behavior
- `Phase 189` completed the next `Direction 09` slice by populating Cursor and Codex page-session typed warning diagnostics while preserving raw adapter strings and rendered UI behavior
- `Phase 190` completed the next `Direction 09` slice by populating usage-threshold and policy-only typed warning diagnostics while preserving raw adapter strings and rendered UI behavior
- `Phase 191` completed the next `Direction 09` slice by populating sync-engine stale cached-state and automatic-sync-overdue typed diagnostics while preserving raw stale warning strings and rendered UI behavior
- `Phase 192` completed the next `Direction 09` slice by making source-state classification prefer typed warning diagnostics while preserving raw English warning-pattern fallback for older snapshots and unknown codes
- `Phase 193` completed the next `Direction 09` slice by adding localized warning diagnostic presentation in Settings and Provider Detail while preserving raw warning/source strings
- `Phase 194` completed the next `Direction 09` slice by adding localized source diagnostic presentation in Settings and Provider Detail while preserving raw source-selection/fallback strings
- `Phase 195` completed the next `Direction 09` slice by adding adapter-error diagnostic builders, stable adapter-error population for Cursor/Codex/Claude Code failure paths, and localized adapter-error presentation while preserving raw adapter warning bodies
- `Phase 196` completed the next `Direction 09` slice by adding repeatable compact-width diagnostic-presentation QA for Settings and Provider Detail, proving localized warning/source/adapter summaries and raw evidence bodies remain visible together
- `Phase 197` completed the next `Direction 09` slice by adding diagnostic archive/export compatibility review and a maintained reference that keeps localized diagnostic presentation out of archive/export schemas
- `Phase 198` completed the next `Direction 09` slice by aligning maintained sample and store seed typed diagnostic metadata where stable existing codes match raw evidence strings, without changing raw diagnostic strings or provider coverage claims
- `Phase 199` completed the next `Direction 09` slice by adding diagnostic fixture and historical evidence alignment review, separating mutable maintained fixtures from generated request/handoff packages and frozen historical archives
- `Phase 200` completed a functionality-first Codex personal slice by preserving multiple visible usage windows and surfacing the most constrained visible percentage window in dashboard, detail, and popup paths
- `Phase 201` completed the next functionality-first Codex personal slice by preserving visible flex credit balance cards as supplemental usage context without treating them as the primary plan-wide quota
- `Phase 202` completed repeatable unpacked-extension verification for Codex multi-window plus flex-balance context, and fixed DOM capture so repeated percentages plus single-character balance values survive live-page summarization
- `Phase 203` completed Cursor personal billing-period usage-summary surfacing across dashboard, provider detail, and popup while preserving the exact-remaining unavailable boundary
- `Phase 204` completed adapter diagnostic raw fallback regression coverage, proving unknown or absent typed diagnostics still fall back to raw evidence without changing runtime behavior
- `Phase 205` compressed structured personal usage context in popup featured-provider cards so Codex-style windows and balances show the most useful compact signal while dashboard and provider detail keep the fuller context
- `Phase 206` hardened Codex personal usage parsing for merged DOM text such as inline remaining percentages and full-width percent text while preserving the visible-window truth boundary
- `Phase 207` hardened Codex personal usage parsing for merged usage-window label/value snippets while keeping normalized labels free of runtime percentages
- `Phase 208` rendered all visible structured usage windows as remaining progress bars in dashboard provider cards and provider detail, including weekly and model-specific Codex windows, while keeping popup compact
- `Phase 209` switched structured popup usage windows to compact circular remaining progress indicators while keeping dashboard/provider-detail bars unchanged and preserving summary-only popup fallbacks
- `Phase 210` added per-surface line/circle quota style preferences and made popup quota-first by hiding nonessential cards whenever provider quota cards are present
- `Phase 211` added Settings-controlled popup size, corner, and shadow preferences while preserving the default balanced quota-first popup and all provider coverage boundaries
- `Phase 212` added a Settings-side popup appearance preview so those size, corner, and shadow controls can be evaluated before reopening the Chrome action popup
- `Phase 213` verified the native Chrome toolbar popup from RDP Chrome after extension reload and tightened popup-only circular quota density so four Codex usage-window rings remain a compact quick-glance surface
- `Phase 214` produced `release/ai-usage-dashboard-0.1.0-rc.3.zip` so the installable package now includes the Phase 200-213 Codex/Cursor personal usage and popup-surface changes
- `Phase 215` added a Settings `Use current page` action for shipped session-page tracks, so a real Codex or Cursor usage page that is already active can be bound and refreshed directly
- `Phase 216` added background page-binding lifecycle handling, so a bound session-page tab is marked stale when it closes or navigates away from provider route hints
- `Phase 217` added a distinct `capture_unavailable` session-page state for open Codex or Cursor tabs that exist but cannot be read by the extension
- `Phase 218` added Chrome tab replacement handling, so a bound session-page tab keeps its binding when Chrome swaps the tab id for the same usage route
- `Phase 219` made that unreadable-page condition visible as a dedicated provider source state across dashboard cards, provider detail, popup guidance, and localized copy
- `Phase 220` suppressed empty percent progress bars for unavailable percent measurements, so Codex parse/source failures no longer render as `rolling percent` with an `Unknown` value
- `Phase 221` added direct dashboard-card and provider-detail source-page recovery actions for shipped session-page providers, reusing the existing tab open/focus and page-binding flow
- `Phase 222` extended that direct source-page recovery action into popup featured-provider cards for shipped session-page failure states
- `Phase 223` suppressed popup empty percent progress for unavailable measurements while preserving real structured usage-window rings
- `Phase 224` removed the extra manual refresh step when source-page recovery attaches an already-open matching provider tab, while preserving manual refresh for newly-opened pages
- `Phase 225` made capture-unavailable recovery reload the existing source tab before binding and refreshing, including popup dispatch ordering that completes sync before focusing the provider tab
- `Phase 226` added a popup shell visual corner mask so the document background no longer reads as a square 90-degree popup edge, while preserving the Chrome-owned native host boundary
- `Phase 227` added a popup host-edge blend plus stronger body/root/shell clipping markers so dark Chrome surfaces no longer expose an obvious light rectangular backing around the rounded popup
- `Phase 228` reset the Chrome action surface to a rectangular popup canvas and kept rounded styling on internal cards and controls after the host-edge blend proved visually worse than a standard popup
- `Phase 229` replaced the Settings sync interval and warning threshold native selects with an editable numeric combobox that keeps presets while accepting validated custom values
- `Phase 230` added Codex managed source-tab refresh so scheduled and manual session-page syncs can reopen the previously bound analytics page in an inactive tab after authorization, while preserving the no-cookie-storage boundary and stopping repeated auto-open attempts after logged-out detection
- `Phase 231` replaced the remaining user-facing Settings native selects, including Source Connections source preference, with a reusable Material-style select-only combobox
- `Phase 232` added automatic Codex managed-page sync so alarm/manual refresh can create the inactive analytics tab after authorization even before a saved page binding exists
- `Phase 233` added Codex hydration retry so a first refresh can wait through the matched analytics route's loading shell before reporting a parser failure
- `Phase 234` added action badge quota selection so Settings can keep the attention-count badge or choose a remaining-quota badge from dynamic provider/window candidates
- `Phase 235` added Settings sticky section navigation inside the existing top bar plus an extended back-to-top floating action button for long-page navigation
- `Phase 236` completed dashboard provider-card Material unification, so provider cards now use a clearer Material card, supporting-surface, progress, chip, and footer-action hierarchy without changing provider truth or sync semantics
- `Phase 237` completed the provider-card CSS module split after Phase 236 by moving provider-card CSS into `src/sidepanel/theme/provider-card.css` while preserving the same dashboard visual review
- `Phase 238` completed the usage-progress CSS module split by moving shared progress CSS into `src/sidepanel/theme/usage-progress.css`, loading it in both sidepanel and popup entries, and preserving provider-card override order
- `Phase 239` completed the interaction-audit CSS module split by moving sidepanel-only operator workspace CSS into `src/sidepanel/theme/interaction-audit.css` and keeping that module out of the popup entry
- `Phase 240` completed the theme-recovery CSS module split by moving sidepanel-only theme-recovery workspace CSS into `src/sidepanel/theme/theme-recovery.css` and keeping that module out of the popup entry
- `Phase 241` completed the Settings appearance CSS module split by moving theme-customization and popup-appearance preview CSS into `src/sidepanel/theme/settings-appearance.css`
- `Phase 242` completed the detail-surfaces CSS module split by moving shared sidepanel detail-field and detail-note CSS into `src/sidepanel/theme/detail-surfaces.css`
- `Phase 243` completed the Settings source-card CSS module split by moving Source Connections source-card, disclosure, and diagnostic-row CSS into `src/sidepanel/theme/settings-source-cards.css`
- `Phase 244` completed the form-controls CSS module split by moving sidepanel form-field, Material select, editable number combobox, and switch-row CSS into `src/sidepanel/theme/form-controls.css`
- `Phase 245` completed the popup-theme CSS module split by moving popup-only page, shell, provider-card, progress-ring, and responsive CSS into `src/popup/popup-theme.css`
- `Phase 246` completed the Settings navigation CSS module split by moving Settings grid, section-nav chip, section anchor, and back-to-top FAB CSS into `src/sidepanel/theme/settings-navigation.css`
- `Phase 247` completed the Access feedback CSS module split by moving permission prompt, credential, and toast feedback CSS into `src/sidepanel/theme/access-feedback.css`
- `Phase 248` completed the Top app bar CSS module split by moving sidepanel Top App Bar layout, sticky, title, and action-row CSS into `src/sidepanel/theme/top-app-bar.css`
- `Phase 249` completed the App shell CSS module split by moving shared sidepanel/popup app-shell layout and shell-entry keyframes into `src/sidepanel/theme/app-shell.css`
- `Phase 250` completed the Buttons CSS module split by moving shared icon-button and text-button CSS into `src/sidepanel/theme/buttons.css`
- `Phase 251` completed the Chips CSS module split by moving shared token-chip, status-chip, and meta-chip CSS into `src/sidepanel/theme/chips.css`
- `Phase 252` completed the Surfaces CSS module split by moving shared hero-card and status-card CSS into `src/sidepanel/theme/surfaces.css`
- `Phase 253` completed the Typography CSS module split by moving shared text hierarchy, copy primitive, list spacing, and compact headline CSS into `src/sidepanel/theme/typography.css`
- `Phase 254` completed the Layout Primitives CSS module split by moving shared summary-strip, summary-pill, token-panel, dashboard-section, and narrow layout primitive CSS into `src/sidepanel/theme/layout-primitives.css`
- `Phase 255` completed the Settings navigation component extraction by moving Settings section ids, sticky section nav rendering, and the back-to-top FAB into focused sidepanel modules
- `Phase 256` completed the Settings overview visibility component extraction by moving the overview summary and provider visibility switch section into focused Settings section components
- `Phase 257` completed the Settings permissions component extraction by moving the permissions section into the focused Settings section component module
- `Phase 258` completed the Settings credentials component extraction by moving credential card/form rendering into the focused Settings section component module while preserving draft state and dispatch ownership in `SettingsPage.tsx`
- `Phase 259` completed the Settings section navigation hook extraction by moving active-section observation and scroll helpers into `src/sidepanel/use-settings-section-navigation.ts`
- `Phase 260` completed the Settings source section component extraction by moving Source Connections card rendering into `src/sidepanel/components/SettingsSourceSection.tsx` while preserving source preference controls, diagnostics, and session-page actions
- `Phase 261` completed the Settings preferences section component extraction by moving global preference rendering and option assembly into `src/sidepanel/components/SettingsPreferencesSection.tsx`
- `Phase 262` completed the `App.tsx` special-route app split by moving debug/operator route parsing, rendering, and special-route-only theme/locale hydration into `src/sidepanel/special-route-app.tsx`
- `Phase 263` completed the `App.tsx` browser-controls split by moving Chrome capability checks, tab sorting, and full-page route opening into `src/sidepanel/app-browser-controls.ts`
- `Phase 264` completed the `App.tsx` standard-app runtime hook extraction by moving initialization, theme sync, shared message application, toast/loading/error state, and retry logic into `src/sidepanel/use-standard-app-runtime.ts`
- `Phase 265` completed the `App.tsx` standard-app actions split by moving provider, settings, session-page, and full-page action handlers into `src/sidepanel/standard-app-actions.ts`
- `Phase 266` completed the `localized-copy.ts` provider-source display copy split by moving `buildProviderSourceDisplayLocalizedCopy` into `src/shared/provider-source-display-localized-copy.ts` while preserving the legacy re-export path
- `Phase 267` completed the `localized-copy.ts` provider-detail copy split by moving provider-detail copy plus badge and permission label helpers into `src/shared/provider-detail-localized-copy.ts` while preserving the legacy re-export path
- `Phase 268` completed the `localized-copy.ts` store-workflow copy split by moving store screenshot seed and native popup probe copy into `src/shared/store-workflow-localized-copy.ts` while preserving the legacy re-export path
- `Phase 269` completed the `localized-copy.ts` operator-workspace copy split by moving interaction-audit and theme-recovery operator copy into `src/shared/operator-workspace-localized-copy.ts` while preserving the legacy re-export path
- `Phase 270` completed the `localized-copy.ts` popup copy split by moving `buildPopupLocalizedCopy` into `src/shared/popup-localized-copy.ts` while preserving the legacy re-export path
- `Phase 271` completed the `localized-copy.ts` settings copy split by moving `buildSettingsLocalizedCopy` plus source-label helpers into `src/shared/settings-localized-copy.ts` while preserving the legacy re-export path
- `Phase 272` completed the `localized-copy.ts` diagnostic presentation split by moving `getProviderDiagnosticPresentation` plus private diagnostic formatters into `src/shared/provider-diagnostic-presentation.ts`, reducing `localized-copy.ts` to a compatibility export aggregator
- `Phase 273` completed the standard-app session-page actions split by moving Chrome tab discovery, source-page recovery, page-binding, and active-page attach handlers into `src/sidepanel/standard-app-session-page-actions.ts`
- `Phase 274` completed the Settings credential draft hook split by moving provider API key and Codex workspace draft state plus save/clear/input handlers into `src/sidepanel/use-settings-credential-drafts.ts`
- `Phase 275` completed the Settings preference options split by moving select, numeric combobox, and action badge option assembly into `src/sidepanel/settings-preference-options.ts`
- `Phase 276` completed the Popup appearance preview component split by moving Settings popup preview rendering into `src/sidepanel/components/PopupAppearancePreview.tsx`
- `Phase 277` completed the Theme customization card component split by moving Settings custom seed form and preview rendering into `src/sidepanel/components/ThemeCustomizationCard.tsx`
- `Phase 278` completed the Settings page view model and seed hook split by moving route-derived Settings models into `src/sidepanel/settings-page-view-models.ts` and custom seed draft behavior into `src/sidepanel/use-settings-theme-custom-seed-draft.ts`
- `Phase 279` completed the Settings source card component split by moving Source Connections article rendering into `src/sidepanel/components/SettingsSourceCard.tsx`
- `Phase 280` completed the Settings credentials section split by moving credential card rendering into `src/sidepanel/components/SettingsCredentialsSection.tsx`
- `Phase 281` completed the standard-app settings actions split by moving Settings update, credential, Codex workspace, source-preference, page-binding-clear, and preferences-saved handlers into `src/sidepanel/standard-app-settings-actions.ts`
- `Phase 282` completed the standard route app split by moving dashboard, settings, and provider-detail route rendering into `src/sidepanel/standard-route-app.tsx`
- `Phase 283` completed the Codex page-session capture reload retry by reloading an unreadable existing Codex tab with `bypassCache: true` and retrying capture once before surfacing `capture_unavailable`
- `Phase 283` was then confirmed in RDP Chrome by the user with no issue reported
- `Phase 284` packaged `0.1.0-rc.4` so the release zip includes the Phase 215-283 session-page, UI, maintenance, and Codex reload-retry changes after the older `rc.3` boundary
- `Phase 285` completed post-rc4 smoke polish by restoring provider-card circular cell boundaries, keeping source chips horizontal, tightening Settings sticky chips, fixing full-page Settings back-to-top FAB positioning, and adding direct host access refresh prompts for Codex-style missing-host states
- `Phase 286` packaged `0.1.0-rc.5` so Chrome install/review passes include the Phase 285 post-rc4 smoke polish rather than the older `rc.4` package boundary
- `Phase 287` tightened dashboard provider-card linear progress rows to prevent cramped separators, reset-detail text, and right-aligned remaining labels from overlapping, then packaged `0.1.0-rc.6` for Chrome review
- `Phase 288` changed Settings source-card chips from a single-column grid to horizontal wrapping rows, then packaged `0.1.0-rc.7` for Chrome review
- `Phase 289` made the Settings top app bar adaptive: wide tabs use a title/chips/actions row, while sidebar widths center actions and section chips, then packaged `0.1.0-rc.8` for Chrome review
- `Phase 290` replaced provider-card linear progress row `gap + border-top` dividers with explicit row pseudo-dividers so internal lines stay visible, then packaged `0.1.0-rc.9` for Chrome review
- `Phase 291` aligned Cursor personal usage with the Codex managed session-page pattern: the default route opens `https://cursor.com/cn/dashboard/usage`, capture failure triggers a real reload, hydration retry handles freshly opened dashboards, automatic sync can open a non-active managed tab under the same trigger gates, and `0.1.0-rc.10` packages the result for Chrome review
- post-`Phase 291` source changes fixed Cursor usage-page logged-out detection, moved visible Cursor billing-period and spend values into structured usage facts, compacted line-style usage-window reset labels into the window title row, and reformatted the action-badge hover tooltip so enabled Cursor context appears in the visible-provider section
- `Phase 292` refreshed the maintained docs to make that package boundary explicit: `rc.10` was still the latest zip then, and the then-current source needed `Phase 293` / `rc.11` before the next install/review package could include all post-rc10 fixes
- `Phase 293` packaged `0.1.0-rc.11` so the next install/review artifact includes the post-rc10 Cursor logged-out detection, structured usage facts, inline reset-label density, and formatted action-badge tooltip fixes
- `Phase 294` recorded the user-run RDP Chrome smoke pass for `0.1.0-rc.11`; the user reported no obvious issue across the full-page dashboard, toolbar popup, action-badge tooltip, and sidebar settings surfaces
- `Phase 295` accepted the user-reviewed mixed store screenshot candidate pack: one native toolbar popup quick-glance image plus full-page dashboard, Codex provider detail, Cursor source boundary, and side-panel/provider-depth images
- `Phase 296` captured those mixed candidate images from RDP Chrome, saved them under a candidate-intake package, and completed [2026-05-04-rc11-mixed-store-candidate-archive](./testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md), fulfilling the refreshed store screenshot request with `5/5` reviewed screenshots and `3` explicit truth-boundary notes
- `Phase 297` fixed Codex stale-but-readable usage pages by forcing a cache-bypassing source-page reload before DOM capture, then waiting briefly for the analytics UI to hydrate
- `Phase 298` packaged `0.1.0-rc.12` with the Phase 297 Codex freshness fix plus the refreshed trimmed transparent 16/32/48/128 Chrome icon set
- `Phase 299` created the [RC12 Chrome Web Store upload-candidate milestone](./Milestones/2026-05-04_RC12_Chrome_Web_Store_Upload_Candidate.md), aligning code, release package, screenshot evidence, icon evidence, README, release guide, and roadmap/TODO docs without changing runtime code
- `Phase 300` completed the Claude Team usage-page implementation slice: `claude.ai/settings/usage` is now a shipped session-page partial source in current source while preserving the existing Admin API path and the no-cookie/no-private-token boundary
- `Phase 301` filtered Claude Team usage-page helper/navigation copy out of quota progress rows while preserving the four meaningful live rows (`Current session`, `All models`, `Claude Design`, and `Daily included routine runs`), kept duplicate ordered percent snippets for correct label pairing, and fixed relative reset wording
- `Phase 302` restored tracked workflow/runbook docs as the canonical repo source, ignored local-only `.agent/`, made project scripts auto-fall back to Node 22, made release packaging reject stale `dist/manifest.json` versions, and packaged `0.1.0-rc.13` so current source and upload candidate are aligned again
- `Phase 303` fixed Claude Team settings multi-window rendering by preserving ordered duplicate capture snippets plus the known visible usage-row labels before parser pairing
- `Phase 304` simplified Settings IA around personal-user setup: persisted user levels (`basic` / `advanced` / `developer` / `debug`), task-oriented Quick Setup, reduced basic-mode preferences, and one gated Advanced container for enterprise/API plus source controls
- `Phase 305` added cached-first full-page bootstrap with a sync writeback drift guard, fixed Settings select layering, kept the common `Appearance & Sync` controls always visible, moved the rest behind one `More` disclosure, and lowered the periodic sync floor to `3` minutes with bounded startup jitter
- `Phase 306` extended cached-first bootstrap to the side panel, routed popup setup/problem actions into focused Settings targets, added popup quick-hide/setup affordances plus a subtle zero-provider `More providers` attention cue, kept app language always visible, fixed English display-level labels, and packaged `0.1.0-rc.14` as the follow-up candidate while preserving the RC13 review milestone
- `Phase 307` made Chrome plus the official Playwright Extension bridge the default local browser automation path for normal web tabs, changed RDP helper defaults to Chrome-first with Brave fallback, and made profile audit auto-detect the current unpacked extension id from the Chrome profile
- `Phase 308` recorded a real Chrome helper smoke pass for `0.1.0-rc.14` dashboard, Settings, focused Settings, provider-detail, full-page, and popup routes; a later restarted Codex session confirmed direct Playwright MCP can drive normal web tabs but Chrome blocks using that bridge to drive another extension's `chrome-extension://` UI, so extension UI smoke remains on the Chrome RDP helper
- `Phase 309` made the zero-provider first-run path explicit for personal-account users: Settings Quick Setup now recommends one first provider while keeping `More providers` recoverable, and popup zero-provider actions deep-link to that same focused setup card
- `Phase 310` added a cached-first rendering regression guard for standard sidepanel/full-page dashboard routes and refreshed Chrome helper smoke evidence for the dashboard aliases, preventing a return to blocking background bootstrap before cached state renders
- `Phase 311` split popup view-model maintenance concerns into dedicated type, setup-coverage, and featured-provider-card modules while preserving existing popup behavior and public imports
- `Phase 332` split popup surface-route view-model logic into a dedicated tested module, keeping secondary action selection and surface-ownership copy outside the popup view-model aggregator
- `Phase 333` split popup localized view-model orchestration into a dedicated module while preserving the public `localizePopupViewModel` export from `src/popup/view-models.ts`
- `Phase 348` split popup featured-provider list rendering into a dedicated component while preserving route-owned action execution and settings-focus targeting
- `Phase 349` split popup header rendering into a dedicated component while preserving route-owned refresh, theme-toggle, and dashboard-tab handlers
- `Phase 350` split popup guidance-card rendering into a dedicated component while preserving route-owned action routing and settings-focus targeting
- `Phase 351` split popup setup-coverage rendering into a dedicated component while preserving route-owned action routing and settings-focus targeting
- `Phase 352` split popup snapshot-status rendering into a dedicated component while preserving route-owned display gating and snapshot-status semantics
- `Phase 353` split popup action-section rendering into a dedicated component while preserving route-owned action execution and action ordering
- `Phase 354` split popup surface-roles rendering into a dedicated component while preserving route-owned display gating and route-story semantics
- `Phase 355` split popup featured-section rendering into a dedicated component while preserving route-owned display gating and featured-section semantics
- `Phase 356` split popup loading and error-state rendering into dedicated components while preserving route-owned retry and open actions
- `Phase 357` split Settings source-card compact-field, session-track, and diagnostics view-model logic into a dedicated module while preserving the existing `settings-view-models.ts` import path
- `Phase 358` split Settings Quick Setup action ids, card construction, setup-state resolution, and helper text selection into a dedicated module while preserving the existing `settings-view-models.ts` import path
- `Phase 359` split page-session tab priority scoring and sorting into a dedicated helper with focused tests while preserving existing page-session capture and binding semantics
- `Phase 360` split page-session tab lifecycle helpers into a dedicated helper with focused tests while preserving existing open, reload, wait, and close cleanup semantics
- `Phase 361` split page-session script execution and page snapshot helpers into a dedicated helper with focused tests while preserving existing DOM, boot-data, and network observer semantics
- `Phase 362` split page-session network observer bridge logic into a dedicated helper with focused tests while preserving existing bridge install/read semantics
- `Phase 363` split page-session candidate-tab selection into a dedicated helper with focused tests while preserving bound-tab lookup, query-only fallback, duplicate filtering, binding-missing reporting, and auto priority sorting semantics
- `Phase 364` packaged the current post-`rc.14` maintenance source boundary as `0.1.0-rc.15`, aligned package and manifest versions, generated the release zip, and recorded the RC15 follow-up milestone while preserving RC13 as the submitted store-review boundary
- `Phase 365` added a source-only provider host-permission contract guard so source route hints, Settings host origins, and manifest optional host permissions stay aligned while preserving the deferred Gemini project-metrics no-host-access boundary
- `Phase 366` verified first-run RDP Chrome extension screenshots, added a dashboard empty-state Quick Setup action, and made hidden-provider Quick Setup deep links fall back to the Quick Setup section instead of the top of Settings
- `Phase 334` split interaction-audit per-surface card rendering into a dedicated component while preserving route-owned audit refs, preset actions, manual checks, and signoff callbacks
- `Phase 335` split interaction-audit review queue rendering into a dedicated component while preserving route-owned queue construction and jump behavior
- `Phase 336` split interaction-audit request-scope rendering into a dedicated component while preserving route-owned request-context state plus existing binding, revision, and next-command display
- `Phase 337` split interaction-audit signoff session rendering into a dedicated component while preserving route-owned metadata state and existing summary/session hooks
- `Phase 338` split interaction-audit handoff summary rendering into a dedicated component while preserving route-owned handoff draft generation plus copy/download handlers
- `Phase 345` split interaction-audit guidance rendering into a dedicated component while preserving route-owned URL construction and existing link hooks
- `Phase 346` split interaction-audit workspace-control rendering into a dedicated component while preserving route-owned state, import parsing, and copy/download/reset handlers
- `Phase 347` split interaction-audit surface-grid rendering into a dedicated component while preserving route-owned refs, readiness state, and callbacks
- `Phase 339` split theme-recovery current-state rendering into a dedicated component while preserving route-owned snapshot construction and live action-badge reads
- `Phase 340` split theme-recovery theme-state rendering into a dedicated component while preserving route-owned snapshot and live action-badge inputs
- `Phase 341` split theme-recovery request-scope rendering into a dedicated component while preserving route-owned request query parsing and request-context state
- `Phase 342` split theme-recovery provider-list rendering into a dedicated component while preserving route-owned snapshot construction and recovery classification
- `Phase 343` split theme-recovery workflow-link rendering into a dedicated component while preserving route/link ids, hrefs, target behavior, and data hooks
- `Phase 344` split theme-recovery output rendering into a dedicated component while preserving route-owned draft generation plus copy/download/open callbacks
- the old maintenance split queue is closed for the originally named local-safe targets: `material-theme.css`, `localized-copy.ts`, `SettingsPage.tsx`, `App.tsx`, and `standard-app-actions.ts` are now focused base, compatibility, route, or aggregator files rather than the next default work item
- the previous store-readiness blocker for screenshot file intake/import/archive is now closed under `Direction 10.3`; the current store step is the human Chrome Web Store listing upload and review flow using the Phase 299 milestone
- `2026-05-11 RDP session` completed Direction 04 real operator closure: first real interaction-audit visual audit across all 5 surfaces (dashboard-360, settings-420, cursor-detail-360, codex-detail-420, popup-360), all 11 manual checks resolved, pending request `2026-04-23-first-real-operator-review-request` fulfilled and archived under [2026-05-11-2026-05-11-rdp-chrome-visual-audit](./testing/operator_reviews/2026-05-11-2026-05-11-rdp-chrome-visual-audit/README.md)
- `2026-05-11 RDP session` completed Direction 05 real operator closure: first real theme-recovery export with System mode, custom preset, seed `#4F46E5`, resolved light, stage `Recovered`, Cursor + Codex both granted and healthy; pending request `2026-04-23-first-real-theme-recovery-review-request` fulfilled and archived under [2026-05-11-system-recovered-014312](./testing/theme_recovery_reviews/2026-05-11-system-recovered-014312/README.md)
- the remaining high-value work in Direction 05 and Direction 04 was real operator evidence closure; both are now closed as of 2026-05-11
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
- manual "use this open page" attach flow in Settings shipped in `Phase 215` for shipped session-page tracks
- first page-source lifecycle guard shipped in `Phase 216` for tab close and route navigation-away events
- Chrome tab replacement lifecycle guard shipped in `Phase 218`
- first disconnected-state guard shipped in `Phase 217` for open source tabs that cannot be read by extension scripting
- capture-unavailable display state shipped in `Phase 219` so unreadable open pages no longer collapse into generic sync errors
- empty percent progress suppression shipped in `Phase 220`, keeping source-state failures visually distinct from real quota progress
- direct source-page recovery actions shipped in `Phase 221`, so dashboard/detail recovery no longer requires first navigating to Settings
- popup source-page recovery shipped in `Phase 222`, so toolbar triage can drive the same provider-tab recovery flow directly
- popup empty percent progress suppression shipped in `Phase 223`, so source-state failures no longer display `Unknown` quota rings in the toolbar surface
- existing-tab source-page recovery auto-refresh shipped in `Phase 224`, so attaching an already-open matching provider page now triggers provider sync immediately
- capture-unavailable source-tab reload shipped in `Phase 225`, so unreadable existing provider pages can be reloaded and refreshed from the same recovery action
- popup shell visual corner mask shipped in `Phase 226`, so extension-owned popup pixels follow the appearance corner setting even though the Chrome action-popup host shape remains browser-owned
- popup host-edge blend shipped in `Phase 227`, so the remaining browser-owned backing is visually muted on dark Chrome surfaces without claiming true native transparency
- rectangular popup canvas reset shipped in `Phase 228`, so the toolbar surface follows community default_popup practice while internal cards and controls remain rounded
- editable numeric combobox controls shipped in `Phase 229`, so Settings no longer uses native dropdown UI for the sync interval and warning threshold numeric preferences
- Codex managed source-tab refresh shipped in `Phase 230`, so scheduled session-page sync can reopen a previously bound analytics page in an inactive tab without storing ChatGPT cookies or auth headers
- Material select unification shipped in `Phase 231`, so the user-facing Settings surface no longer opens native browser dropdowns for fixed option sets
- automatic Codex managed-page sync shipped in `Phase 232`, so granted Codex session-page sync can create the inactive analytics tab on alarm/manual refresh even before a page binding exists, while still avoiding a fully hidden offscreen scrape
- Codex hydration retry shipped in `Phase 233`, so the first capture of a newly opened analytics route can wait for usage-window DOM content before surfacing a parser failure
- action badge quota selection shipped in `Phase 234`, so the toolbar icon can show a selected remaining quota value while unavailable providers stay out of the dynamic menu
- Settings sticky section navigation shipped in `Phase 235`, so section jumps stay inside the merged sticky top bar while scrolling and long Settings pages have a dedicated return-to-top FAB
- add a clear UI/operator pass for real source-tab logout states

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

### 16.4 Claude Team / Personal TODO

- inspect `claude.ai/settings/usage`
- classify outcomes:
  - logged out
  - free / no paid usage page
  - Team usage page available
  - Pro / Max usage page available
  - redirected or gated account states
- determine whether the page offers exact remaining usage, rolling-window status, or only subscription copy
- keep unsupported personal states explicit if the page is too fragile or too incomplete

Current findings:

- in the current logged-in browser session, `https://claude.ai/settings/usage` redirected to `https://claude.ai/upgrade`
- the live page exposed only plan and upgrade content:
  - `Free`
  - `Pro`
  - `Max`
  - `Individual`
  - `Team and Enterprise`
- no usage meter, remaining allowance, rolling window, or reset time was visible
- on 2026-05-11, a real Claude Team account became available in RDP Chrome, making the Team settings usage route a valid implementation target
- the implementation path remains page-session only: no Claude cookies, bearer tokens, manual auth-header import, or private Claude API calls

Decision:

- graduate the Claude Team usage page as a shipped personal/team partial session-page source
- keep individual Pro / Max behavior separate until that exact account type is observed
- treat redirected or upgrade-only states as first-class account states
- do not claim an exact absolute remaining Claude balance unless the visible page exposes it

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
