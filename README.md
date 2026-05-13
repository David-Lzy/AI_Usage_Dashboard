# AI Usage Dashboard

Chrome side-panel extension for tracking usage, credits, and sync health across AI coding tools.

Documentation entry point: [Doc/README.md](./Doc/README.md).

Current packaged release state:

- package version: `0.1.0-rc.15`
- Chrome manifest version: `0.1.0.15`
- packaged artifact: `release/ai-usage-dashboard-0.1.0-rc.15.zip`
- source status: extension runtime/package bytes are aligned through `Phase 364` and packaged as `rc.15`; it includes the earlier `rc.14` follow-up work plus post-package Chrome automation, smoke-evidence, first-provider setup, cached-first guard, popup view-model/featured-provider-list/header/guidance-card/setup-coverage/snapshot-status/action-section/surface-roles/featured-section/load-state maintenance, Settings source-card and quick-setup view-model maintenance, page-session tab-priority, tab-lifecycle, script-capture, network-observer, and candidate-tabs maintenance, RDP full-page route-contract, store screenshot route-config reuse, interaction-audit frame-action/surface-card/review-queue/request-scope/signoff-session/handoff-summary/guidance-card/workspace-controls/surface-grid maintenance, theme-recovery current-state/theme-state/request-scope/provider-list/workflow-links/outputs maintenance, operator helper follow-ups, Settings focused deep-link render coverage, and popup Settings/source-page/refresh/theme-toggle/hide-provider/guidance/progress/snapshot-status/featured-section/surface-route/localized-view-model/route-action coverage through `Phase 363`; post-`rc.15` source also includes the `Phase 365` source-only provider host-permission contract guard, the `Phase 366` first-run Quick Setup onboarding focus, the `Phase 367` source-only 14-locale localization architecture/manifest/listing draft expansion, the `Phase 368` Arabic/RTL fallback text-direction hardening, the `Phase 369` RDP locale capture guard, the `Phase 370` i18n registry drift guard, the `Phase 371` current-phase doc drift guard, the `Phase 372` store listing localization draft check, the `Phase 373` Traditional Chinese runtime shell pilot, the `Phase 374` Japanese runtime shell pilot, the `Phase 375` Korean runtime shell pilot, the `Phase 376` runtime message catalog module split, the `Phase 377` Latin American Spanish runtime shell pilot, the `Phase 378` Brazilian Portuguese runtime shell pilot, the `Phase 379` French runtime shell pilot, the `Phase 380` German runtime shell pilot, the `Phase 381` Italian runtime shell pilot, the `Phase 382` Russian runtime shell pilot, the `Phase 383` Arabic runtime shell pilot, the `Phase 384` Hindi runtime shell pilot, the `Phase 385` Indonesian runtime shell pilot, the `Phase 386` runtime shell pilot coverage guard, the `Phase 387` notranslate plus locale RDP QA fix, the `Phase 392.1` popup first-run guidance 14-locale runtime copy slice, the `Phase 392.3` popup featured provider 14-locale runtime copy slice, the `Phase 392.4` popup action/surface-role/aria 14-locale runtime copy slice, the `Phase 393` Settings/provider-detail localization split, the `Phase 393.1` Settings core 14-locale runtime copy slice, the `Phase 393.2` Settings source-control split, the `Phase 393.2.1` Settings credential 14-locale runtime copy slice, the `Phase 393.2.2` Settings source/permission 14-locale runtime copy slice, the `Phase 393.3` Provider Detail/source-display split, the `Phase 393.3.1` Provider Detail 14-locale runtime copy slice, the `Phase 393.3.2` provider-source display 14-locale runtime copy slice, the `Phase 394` code maintenance hotspot audit, the `Phase 395` runtime message catalog internal module split, the `Phase 396` full post-localization maintenance release-gate baseline, the `Phase 397` diagnostic presentation 14-locale inventory, the `Phase 398` warning diagnostic 14-locale presentation slice, the `Phase 399` source diagnostic 14-locale presentation slice, the `Phase 400` adapter-error diagnostic 14-locale presentation slice, the `Phase 401` post-diagnostic localization release-gate pass, the `Phase 402` operator-workspace 14-locale copy inventory, the `Phase 403` store-helper 14-locale copy inventory, the `Phase 404` operator-workspace helper-owned 14-locale runtime copy slice, and the `Phase 405` store-helper 14-locale runtime copy slice; the earlier `rc.13` milestone remains the submitted Chrome Web Store review boundary until a human resubmission replaces it
- packaged follow-up milestone: [2026-05-13 RC15 Maintenance Follow-Up Release Candidate](./Doc/Milestones/2026-05-13_RC15_Maintenance_Follow_Up_Release_Candidate.md)
- submitted review milestone: [2026-05-11 RC13 Chrome Web Store Upload Candidate](./Doc/Milestones/2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md)

## Current RC Matrix

| Provider | Shipped source path | Live support status | What stays unavailable |
| --- | --- | --- | --- |
| Cursor | Team Admin API or logged-in personal dashboard page | live | exact remaining included requests on the personal page |
| JetBrains AI | retained repo path for the logged-in Console page | deferred from the active RC promise | current RC does not promise JetBrains until a real org-visible `Users and licensing` session is reverified |
| Claude Code | Admin Analytics API or logged-in Claude Team usage page | live partial | one absolute remaining Claude balance across all plan windows; individual Pro / Max behavior remains unclaimed |
| Gemini Code Assist | documented quota policy | policy only | live per-user usage |
| Codex | Enterprise Analytics API or logged-in personal usage page | live | one full plan-wide absolute remaining-credit value; flex credit balance cards are supplemental context only |

## Hybrid Personal-User Status

Post-RC work now runs on shipped hybrid provider sources, not raw credential export.

Current personal-user paths:

| Provider | Current personal-user path | Current design note |
| --- | --- | --- |
| Codex | `chatgpt.com/codex/cloud/settings/analytics#usage` first, with `chatgpt.com/codex/settings/usage` still under observation | shipped as a logged-in session-page path; the proven live surface already exposes remaining percentage and reset timing in the current usage windows |
| Cursor | `cursor.com/cn/dashboard/usage` first, with locale-free `cursor.com/dashboard/usage` still matched | shipped as a logged-in session-page path for billing-period usage context; Phase 291 aligns it with the Codex managed non-active tab, reload-on-capture-failure, and hydration retry flow, and post-rc10 source now renders visible billing/spend values as structured usage facts without claiming exact remaining included requests |
| Claude Code | `claude.ai/settings/usage` | shipped as a logged-in Claude Team session-page path for visible usage-window or usage-page context; upgrade-only and logged-out redirects stay explicit warning states, and individual Pro / Max behavior remains separately unclaimed |
| Gemini Code Assist | Google Cloud Gemini metrics page | 2026-04-22 spike confirmed a project-scoped Google Cloud console route; defer from the personal-user track unless product support expands to explicit project metrics |

Security posture for this track:

- do not persist raw cookies in extension storage
- do not ask the user to manually copy cookies or auth headers
- prefer granted host access plus page-context extraction inside already logged-in tabs
- store normalized usage snapshots, not exported session credentials

Next execution queue:

1. keep `0.1.0-rc.13` as the current submitted Chrome Web Store review boundary, but use `0.1.0-rc.15` as the ready follow-up package for the post-`rc.13` polish and post-`rc.14` maintenance slices if review feedback or an explicit resubmission decision asks for a newer build
2. use the [RC13 upload-candidate milestone](./Doc/Milestones/2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md) as the truthful historical submission handoff, and use the [RC15 follow-up milestone](./Doc/Milestones/2026-05-13_RC15_Maintenance_Follow_Up_Release_Candidate.md) as the current packaged-source reference
3. continue the numbered queue after `Phase 405`: active `Phase 406` runs the post-helper localization release gate, then queued `Phase 407` covers localized operator/store RDP visual QA, `Phase 408` audits localization bundle growth, `Phase 409` scopes interaction-audit consumer-copy presentation, and `Phase 410` scopes store-helper error presentation
4. keep provider closure account-gated and de-prioritized: Claude Pro/Max, JetBrains org, and Gemini project-metrics decisions should wait until suitable accounts or product evidence are available
5. keep real operator evidence closed and archived; do not open another interaction-audit or theme-recovery operator evidence phase unless a new surface or theme regression creates a fresh review need
6. treat additional file splitting as maintenance-only unless a concrete oversized module blocks safe changes

Maintenance note:

- browser-control helpers now live in `src/sidepanel/app-browser-controls.ts`, keeping Chrome capability checks, tab priority sorting, and full-page route opening out of the standard app component
- standard app runtime hook now lives in `src/sidepanel/use-standard-app-runtime.ts`, keeping initialization, theme sync, shared message application, and retry state out of the route/action component
- standard app actions now live in `src/sidepanel/standard-app-actions.ts`, keeping provider, settings, session-page, and full-page action handlers out of the route-rendering component
- standard app Settings actions now live in `src/sidepanel/standard-app-settings-actions.ts`, keeping Settings update, source preference, page-binding clear, credential, Codex workspace, and preferences-saved handlers out of the standard action aggregator
- standard route app now lives in `src/sidepanel/standard-route-app.tsx`, keeping dashboard, settings, and provider-detail rendering out of the top-level `App.tsx` entry
- provider-source display copy now lives in `src/shared/provider-source-display-localized-copy.ts`, with 14-locale extended copy in `src/shared/provider-source-display-extended-localized-copy.ts`; `src/shared/localized-copy.ts` keeps a compatibility re-export
- provider-detail copy now lives in `src/shared/provider-detail-localized-copy.ts`, while `src/shared/localized-copy.ts` keeps compatibility re-exports for provider detail routes
- store-workflow copy now lives in `src/shared/store-workflow-localized-copy.ts`, while `src/shared/localized-copy.ts` keeps compatibility re-exports for screenshot seed and native popup probe routes
- operator-workspace copy now lives in `src/shared/operator-workspace-localized-copy.ts`, while `src/shared/localized-copy.ts` keeps compatibility re-exports for interaction audit and theme recovery routes
- popup copy now lives in `src/shared/popup-localized-copy.ts`, while `src/shared/localized-copy.ts` keeps a compatibility re-export for popup runtime and view-model consumers
- settings copy now lives in `src/shared/settings-localized-copy.ts`, while `src/shared/localized-copy.ts` keeps compatibility re-exports for Settings routes, section components, and view-model consumers
- diagnostic presentation dispatch now lives in `src/shared/provider-diagnostic-presentation.ts`; warning, source, and adapter-error diagnostic 14-locale copy live in focused helpers, while `src/shared/localized-copy.ts` keeps compatibility re-exports for diagnostic view-model consumers
- standard session-page actions now live in `src/sidepanel/standard-app-session-page-actions.ts`, keeping Chrome tab discovery, source-page recovery, page-binding, and active-page attach flow out of the standard app action aggregator
- Settings credential draft state now lives in `src/sidepanel/use-settings-credential-drafts.ts`, keeping provider API key and Codex workspace draft save/clear/input handlers out of `SettingsPage.tsx`
- Settings preference option assembly now lives in `src/sidepanel/settings-preference-options.ts`, keeping select, numeric combobox, and action badge option construction out of `SettingsPreferencesSection.tsx`
- Popup appearance preview rendering now lives in `src/sidepanel/components/PopupAppearancePreview.tsx`, keeping the Settings preview card out of `SettingsPreferencesSection.tsx` while preserving the same popup appearance attributes
- Popup featured-provider list rendering now lives in `src/popup/PopupFeaturedProviderList.tsx`, keeping quota-first provider-card rendering out of `PopupApp.tsx` while preserving route-owned action execution and settings-focus targeting
- Popup header rendering now lives in `src/popup/PopupHeaderSection.tsx`, keeping refresh, theme-toggle, and dashboard-tab header controls out of `PopupApp.tsx` while preserving route-owned handlers and pending states
- Popup guidance-card rendering now lives in `src/popup/PopupGuidanceCardSection.tsx`, keeping no-featured-provider guidance-card markup out of `PopupApp.tsx` while preserving route-owned action routing and settings-focus targeting
- Popup setup-coverage rendering now lives in `src/popup/PopupSetupCoverageSection.tsx`, keeping no-featured-provider setup coverage markup out of `PopupApp.tsx` while preserving route-owned action routing and settings-focus targeting
- Popup snapshot-status rendering now lives in `src/popup/PopupSnapshotStatusSection.tsx`, keeping no-featured-provider snapshot-status markup out of `PopupApp.tsx` while preserving route-owned display gating
- Popup action-section rendering now lives in `src/popup/PopupActionSection.tsx`, keeping no-featured-provider action-card markup out of `PopupApp.tsx` while preserving route-owned action execution
- Popup surface-roles rendering now lives in `src/popup/PopupSurfaceRolesSection.tsx`, keeping no-featured-provider route-story markup out of `PopupApp.tsx` while preserving route-owned display gating
- Popup featured-section rendering now lives in `src/popup/PopupFeaturedSection.tsx`, keeping no-featured-provider featured-section and empty-state markup out of `PopupApp.tsx` while preserving route-owned display gating
- Popup loading and error cards now live in `src/popup/PopupLoadStateCards.tsx`, keeping bootstrap-state markup out of `PopupApp.tsx` while preserving route-owned retry and open actions
- Theme customization card rendering now lives in `src/sidepanel/components/ThemeCustomizationCard.tsx`, keeping custom seed validation and generated preview rendering out of `SettingsPreferencesSection.tsx`
- Settings page derived view models now live in `src/sidepanel/settings-page-view-models.ts`, and custom seed draft behavior now lives in `src/sidepanel/use-settings-theme-custom-seed-draft.ts`, keeping route-local model assembly and seed handlers out of `SettingsPage.tsx`
- Settings source card rendering now lives in `src/sidepanel/components/SettingsSourceCard.tsx`, keeping source display construction, source preference controls, session-page actions, and detailed diagnostics out of the section wrapper
- Settings source-card view-model logic now lives in `src/sidepanel/settings-source-card-view-models.ts`, while `src/sidepanel/settings-view-models.ts` keeps compatibility re-exports for existing Settings imports
- Settings Quick Setup view-model logic now lives in `src/sidepanel/settings-quick-setup-view-models.ts`, while `src/sidepanel/settings-view-models.ts` keeps compatibility re-exports for existing Settings imports
- Page-session tab priority sorting now lives in `src/providers/page-session-tab-priority.ts`, keeping exact URL, hash-stripped URL, prefix URL, matched-title, active-tab boost, and recency weighting covered outside the large page-session client
- Page-session tab lifecycle helpers now live in `src/providers/page-session-tab-lifecycle.ts`, keeping open/reload/wait/close cleanup semantics covered outside the large page-session client
- Page-session script capture helpers now live in `src/providers/page-session-script-capture.ts`, keeping script-result execution, isolated DOM snapshots, main-world window-value reads, and selector/key normalization covered outside the large page-session client
- Page-session network observer helpers now live in `src/providers/page-session-network-observer.ts`, keeping bridge install/read behavior, fetch/XHR capture defaults, and malformed snapshot fallback covered outside the large page-session client
- Page-session candidate tab selection now lives in `src/providers/page-session-candidate-tabs.ts`, keeping bound-tab lookup, duplicate filtering, binding-missing reporting, and auto priority sorting covered outside the large page-session client
- Settings credential card rendering now lives in `src/sidepanel/components/SettingsCredentialsSection.tsx`, keeping API-key and Codex analytics credential forms out of the remaining Settings section aggregator while preserving the existing Settings page import path
- RDP extension-window smoke routes now live in `scripts/lib/rdp-extension-window-routes.mjs`, keeping ordinary Chrome tab/app-window captures on the full-page surface contract for sidepanel-derived routes while preserving `src/popup/index.html` for popup-window captures
- store screenshot runtime capture plans now reuse that same RDP route config for popup and full-page entries, so request-bound screenshot generation cannot drift away from the extension-window smoke helper
- interaction-audit iframe readiness and preset-action helpers now live in `src/sidepanel/interaction-audit-frame-actions.ts`, keeping low-level iframe DOM selectors out of the large interaction-audit route while preserving signoff and export behavior there
- interaction-audit surface card rendering now lives in `src/sidepanel/components/InteractionAuditSurfaceCard.tsx`, keeping per-surface iframe, preset-action, manual-check, and signoff controls out of the large interaction-audit route while preserving route-owned state
- interaction-audit review queue rendering now lives in `src/sidepanel/components/InteractionAuditReviewQueueSection.tsx`, keeping queue summaries and jump-list presentation out of the large interaction-audit route while preserving route-owned queue construction and jump behavior
- interaction-audit request-scope rendering now lives in `src/sidepanel/components/InteractionAuditRequestScopeSection.tsx`, keeping request binding summaries and next-command display out of the large interaction-audit route while preserving route-owned request-context state
- interaction-audit signoff session rendering now lives in `src/sidepanel/components/InteractionAuditSignoffSessionSection.tsx`, keeping signoff workspace header, summary metrics, metadata fields, timestamp action, and session-summary note out of the large interaction-audit route while preserving route-owned metadata state
- interaction-audit handoff summary rendering now lives in `src/sidepanel/components/InteractionAuditHandoffSummarySection.tsx`, keeping handoff counts, grouped surface lists, preview text, and operator workflow display out of the large interaction-audit route while preserving route-owned draft generation and copy/download handlers
- interaction-audit guidance rendering now lives in `src/sidepanel/components/InteractionAuditGuidanceCard.tsx`, keeping the operator checklist and extension surface links out of the large interaction-audit route while preserving route-owned URL construction
- interaction-audit workspace controls now live in `src/sidepanel/components/InteractionAuditWorkspaceControlsSection.tsx`, keeping signoff action buttons, JSON import controls, workspace feedback, and draft preview rendering out of the large interaction-audit route while preserving route-owned state and handlers
- interaction-audit surface-grid rendering now lives in `src/sidepanel/components/InteractionAuditSurfaceGridSection.tsx`, keeping grid mapping and surface-card fallback state outside the large interaction-audit route while preserving route-owned refs, readiness state, and callbacks
- theme-recovery current-state rendering now lives in `src/sidepanel/components/ThemeRecoveryCurrentStateCard.tsx`, keeping overall stage, popup snapshot, and action-badge display out of the theme-recovery route while preserving route-owned snapshot construction and live badge reads
- theme-recovery theme-state rendering now lives in `src/sidepanel/components/ThemeRecoveryThemeStateCard.tsx`, keeping theme mode, resolved mode, preset, custom seed, scope isolation, and badge-source detail out of the theme-recovery route while preserving route-owned snapshot and live badge inputs
- theme-recovery request-scope rendering now lives in `src/sidepanel/components/ThemeRecoveryRequestScopeSection.tsx`, keeping bound/ad-hoc request identity display out of the theme-recovery route while preserving route-owned query parsing and request-context state
- theme-recovery target-provider rendering now lives in `src/sidepanel/components/ThemeRecoveryProviderList.tsx`, keeping provider recovery cards and `StatusBadge` presentation out of the theme-recovery route while preserving route-owned snapshot construction and recovery classification
- theme-recovery workflow-link rendering now lives in `src/sidepanel/components/ThemeRecoveryWorkflowLinksCard.tsx`, keeping workflow steps plus extension/vendor link groups out of the theme-recovery route while preserving the same link ids, hrefs, target behavior, and `data-theme-recovery-link*` hooks
- theme-recovery output rendering now lives in `src/sidepanel/components/ThemeRecoveryOutputsSection.tsx`, keeping export action buttons, draft previews, and feedback notes out of the theme-recovery route while preserving route-owned draft generation and copy/download/open callbacks
- operator text-file download behavior now lives in `src/sidepanel/download-text-file.ts`, so interaction-audit and theme-recovery export buttons share one tested browser-download path
- operator clipboard write behavior now lives in `src/sidepanel/write-clipboard-text.ts`, preserving interaction-audit's unavailable-vs-failed feedback while sharing the underlying browser clipboard path with theme recovery
- default operator runtime i18n bootstrap now lives in `src/sidepanel/operator-runtime-i18n.ts`, so interaction-audit and theme-recovery use the same tested `system` locale initialization path
- runtime locale support now uses the 14-locale registry in `src/shared/i18n.ts`, Settings language options are generated from that registry, Arabic resolves `rtl`, and `npm run i18n:check` now guards registry metadata, Chrome manifest `_locales` catalogs, the RDP locale capture helper, and the store listing localization draft together
- runtime message catalog public helpers still live in `src/shared/runtime-message-catalogs.ts`, while internal catalog data now lives in `src/shared/runtime-message-catalog-data/`, keeping large English and locale override data out of the registry/resolution/formatting helper in `src/shared/i18n.ts`
- Traditional Chinese, Japanese, Korean, Latin American Spanish, Brazilian Portuguese, French, German, Italian, Russian, Arabic, Hindi, and Indonesian now have first runtime shell pilots for dashboard, popup, Settings, common actions, and theme-toggle labels; `Phase 392.1` moved popup first-run guidance, setup coverage, snapshot status, and header copy into explicit 14-locale structured copy, `Phase 392.3` did the same for featured-section and featured-card copy, `Phase 392.4` completed popup action-section, surface-role, and aria copy, `Phase 393.1` completed Settings core copy, `Phase 393.2.1` completed Settings credential copy, `Phase 393.2.2` completed Settings source/permission copy, `Phase 393.3.1` completed Provider Detail copy, `Phase 393.3.2` completed provider-source display helper copy, and `Phase 398` through `Phase 400` completed typed warning/source/adapter diagnostic presentation copy while operator and store-helper buckets still fall back to English until reviewed translation phases replace them
- the maintained deeper runtime copy backlog now records typed diagnostic presentation as complete through `Phase 400` and maps the next reviewed translation phases to operator and store-helper follow-up, while keeping raw provider evidence and archive/export payloads outside localization
- focused i18n tests now require every non-English locale to keep explicit first-shell runtime message overrides, preventing shell pilot coverage from silently falling back to English
- popup and sidepanel HTML shells now declare notranslate, preventing Chrome/Google Translate overlay UI from polluting localized extension-window screenshots
- Arabic/RTL preview surfaces now isolate English fallback text direction through shared typography rules, so untranslated fallback sentences keep natural punctuation order until reviewed Arabic runtime translations replace them
- RDP extension-window locale smoke captures now use `scripts/lib/rdp-extension-locale-route.mjs`, so `--locale` accepts only the 14 runtime locale tags and preserves existing route query/hash structure when adding `app-locale`
- docs taxonomy checking now also validates current-phase references in README, top-level TODOs, and the strategic directions index, so phase closeout docs fail fast when the latest archived phase number drifts
- docs checking now also validates maintained repo-local Markdown links outside convention-only closed-evidence archives, so document moves fail fast when they break current references
- Settings focused deep-link render behavior is guarded in `src/sidepanel/routes/SettingsPage.test.tsx`, including source-provider Advanced targets and quick-setup provider targets used by popup setup/problem actions
- Dashboard first-run empty-state guidance is guarded in `src/sidepanel/routes/DashboardPage.test.tsx`, and Settings Quick Setup deep links now fall back to the Quick Setup section when a provider-specific card is hidden
- popup settings-action focus selection now lives in `src/popup/settings-route-targets.ts`, keeping guidance-card and setup-card Settings links aligned with the focused Settings deep-link contract
- popup source-page recovery tab selection now lives in `src/popup/source-page-tab-selection.ts`, keeping exact-route, active-tab, recency, and numeric-tab-id selection rules testable outside `PopupApp.tsx`
- popup route-opening actions now live in `src/popup/popup-route-actions.ts`, keeping side-panel, full-page, Settings, dashboard, and provider-detail handoffs testable outside `PopupApp.tsx`
- Chrome sidePanel route-action behavior is guarded in `src/popup/popup-route-actions.test.ts`, including active-tab and current-window fallback branches
- popup source-page recovery actions now live in `src/popup/popup-source-page-actions.ts`, keeping unsupported-provider fallback, direct window open, existing-tab binding plus refresh, and created-tab binding testable outside `PopupApp.tsx`
- popup refresh behavior now lives in `src/popup/popup-refresh-action.ts`, keeping direct refresh, one-provider host-access prompting, denied-access messaging, and browser rejection handling testable outside `PopupApp.tsx`
- popup quick theme-toggle behavior now lives in `src/popup/popup-theme-toggle-action.ts`, keeping update-settings payloads and failure handling testable outside `PopupApp.tsx`
- popup hide-provider behavior now lives in `src/popup/popup-hide-provider-action.ts`, keeping provider-disable payloads and message-bus failures testable outside `PopupApp.tsx`
- popup guidance routing now lives in `src/popup/popup-guidance-action.ts`, keeping Settings focus, dashboard, provider-detail, source-page, and hide-provider no-op behavior testable outside `PopupApp.tsx`
- popup provider progress rendering now lives in `src/popup/PopupProviderProgress.tsx`, keeping usage-window, single-value, and empty percent-only rendering covered outside `PopupApp.tsx`
- popup snapshot-status view-model logic now lives in `src/popup/snapshot-status-view-models.ts`, keeping raw and localized snapshot state decisions covered outside the popup view-model aggregator
- popup guidance-card view-model logic now lives in `src/popup/guidance-card-view-models.ts`, keeping first setup, missing access, missing credential, blocked provider, policy-only, and ready-provider decisions covered outside the popup view-model aggregator
- popup featured-section view-model logic now lives in `src/popup/featured-section-view-models.ts`, keeping zero-provider, needs-attention, policy-only, and all-clear section stories covered outside the popup view-model aggregator
- popup surface-route view-model logic now lives in `src/popup/surface-route-view-models.ts`, keeping secondary action selection and surface-ownership copy covered outside the popup view-model aggregator
- popup localized view-model orchestration now lives in `src/popup/localized-view-models.ts`, while `src/popup/view-models.ts` keeps the public `localizePopupViewModel` re-export

## Source Labels

The dashboard now labels every provider with one of these source types:

- `Official API`
  - live data comes from a vendor API or admin analytics endpoint
- `Session page`
  - live data comes from a logged-in browser tab that stays open
- `Policy only`
  - the extension shows documented quota policy, not live usage

## Source Fidelity

The side panel now also labels how complete the current provider values are:

- `Exact vendor value`
  - the active path exposes vendor-reported usage and remaining values directly
- `Window-only vendor value`
  - the active path exposes the current usage window or partial context, not one absolute remaining balance
- `Analytics snapshot`
  - the active path exposes aggregated analytics, not a live remaining counter
- `Documented policy`
  - the extension is showing vendor policy, not live synced usage
- `Local estimate`
  - reserved for future explicit opt-in work; not shipped in the current RC

## Trust Boundary

The side panel now also shows how each provider accesses data:

- `Stored credential`
  - live sync runs from the extension with a credential saved in extension-managed local storage
- `Logged-in page session`
  - live sync attaches to an already logged-in browser tab in the current browser session
- `No live connection`
  - the extension is showing documented policy only

Current trust rules:

- raw cookies are not persisted in extension storage
- manual cookie or auth-header paste is forbidden
- host access is requested only for the explicit provider origins needed by the shipped contract
- credential-backed providers keep credentials in extension-managed local storage only on the current browser profile

## Product Contract

The side panel now also labels what the product is actually promising for each provider path:

- `Shipped admin analytics`
  - a live admin analytics path is supported, but it is not a personal quota page
- `Shipped enterprise analytics`
  - a live enterprise workspace analytics path is supported, but it is not one absolute remaining personal balance
- `Shipped personal partial`
  - a live logged-in personal page is supported, but only for the fields the vendor currently exposes
- `Shipped policy only`
  - the product intentionally shows documented vendor policy instead of claiming live sync
- `Deferred personal page`
  - a personal route was investigated, but the current product does not promise it yet
- `Deferred project metrics`
  - an observed route is project-scoped and is not presented as a simple personal quota page
- `Deferred org console path`
  - an org-console path remains in the repo, but it is outside the current RC promise until reverified

## Deferred Graduation Gates

Deferred paths now also carry explicit graduation gates in the UI:

- `Gemini`
  - graduate only if the product explicitly accepts bound-tab project metrics as a supported contract
- `JetBrains`
  - graduate only after a real `Users and licensing` org session is reverified in the active Chrome profile

Current honesty boundaries:

- Claude Team is now a shipped session-page partial source in current source; individual Pro / Max behavior remains separately unclaimed until observed directly
- JetBrains AI remains implemented in the repo, but it is hidden by default and deferred from the active RC support promise until a real org-visible `Users and licensing` session is reverified
- Codex now ships a real `Session page` path for personal users and an `Official API` path for Enterprise workspace analytics
- Cursor now ships a real `Session page` path for personal users and an `Official API` path for team admins, but the personal path still only exposes billing-period usage context
- Codex personal usage-page sync is now explicitly labeled as `Window-only vendor value` even though the page exposes exact percentages for visible windows and may expose a flex credit balance card, because it still does not represent one full plan-wide absolute remaining balance
- Codex personal parsing now tolerates merged remaining-percentage snippets such as `32% remaining` and `100% 剩余`, but that only hardens the visible-window path rather than changing the product claim
- Codex personal parsing now also tolerates merged usage-window label/value snippets such as `每周使用限额 32% 剩余` without storing the runtime percent inside the normalized label
- dashboard and provider detail now render every visible structured usage window as a remaining progress bar, including weekly and model-specific Codex windows; popup remains compact and keeps the compressed summary
- dashboard provider cards now use the same Material card, supporting-surface, progress, chip, and action hierarchy as the newer Settings and popup controls while preserving the existing provider data and truth labels
- provider-card CSS now lives in `src/sidepanel/theme/provider-card.css`, loaded after the shared Material theme so the dashboard card contract can be maintained without growing the main theme file further
- usage-progress CSS now lives in `src/sidepanel/theme/usage-progress.css`, loaded by both sidepanel and popup entries while provider-card-specific progress overrides stay in `provider-card.css`
- interaction-audit CSS now lives in `src/sidepanel/theme/interaction-audit.css`, keeping sidepanel-only operator workspace styling out of the shared Material theme and popup entry
- theme-recovery CSS now lives in `src/sidepanel/theme/theme-recovery.css`, keeping sidepanel-only recovery workspace styling out of the shared Material theme and popup entry
- Settings appearance CSS now lives in `src/sidepanel/theme/settings-appearance.css`, keeping theme customization and popup appearance preview styling out of the shared Material theme and popup entry
- detail-surfaces CSS now lives in `src/sidepanel/theme/detail-surfaces.css`, keeping shared detail-field and detail-note supporting-surface styling out of the shared Material theme and popup entry
- Settings source-card CSS now lives in `src/sidepanel/theme/settings-source-cards.css`, keeping Source Connections card, disclosure, and diagnostic-row styling out of the shared Material theme and popup entry
- form-controls CSS now lives in `src/sidepanel/theme/form-controls.css`, keeping sidepanel form-field, Material select, editable number combobox, and switch-row styling out of the shared Material theme and popup entry
- popup-theme CSS now lives in `src/popup/popup-theme.css`, keeping popup page, shell, provider-card, progress-ring, and responsive styling out of the shared Material theme and sidepanel entry
- Settings navigation CSS now lives in `src/sidepanel/theme/settings-navigation.css`, keeping Settings grid, sticky section chips, section anchors, and back-to-top FAB styling out of the shared Material theme and popup entry
- Access feedback CSS now lives in `src/sidepanel/theme/access-feedback.css`, keeping permission prompt, credential, and toast feedback styling out of the shared Material theme and popup entry
- Top app bar CSS now lives in `src/sidepanel/theme/top-app-bar.css`, keeping sidepanel Top App Bar layout, sticky, title, and action-row styling out of the shared Material theme and popup entry
- App shell CSS now lives in `src/sidepanel/theme/app-shell.css`, keeping shared sidepanel/popup shell layout and shell-entry keyframes out of the shared Material theme base file
- Button CSS now lives in `src/sidepanel/theme/buttons.css`, keeping shared icon-button and text-button styling out of the shared Material theme base file while loading it in both sidepanel and popup entries
- Chip CSS now lives in `src/sidepanel/theme/chips.css`, keeping shared token-chip, status-chip, and meta-chip styling out of the shared Material theme base file while loading it in both sidepanel and popup entries
- Typography CSS now lives in `src/sidepanel/theme/typography.css`, keeping shared text hierarchy, copy primitive, and list spacing styling out of the shared Material theme base file while loading it in both sidepanel and popup entries before toned surface overrides
- Surface CSS now lives in `src/sidepanel/theme/surfaces.css`, keeping shared hero-card and status-card styling out of the shared Material theme base file while loading it in both sidepanel and popup entries
- Layout primitives CSS now lives in `src/sidepanel/theme/layout-primitives.css`, keeping shared summary-strip, summary-pill, token-panel, dashboard-section, and narrow layout primitive styling out of the shared Material theme base file while loading it in both sidepanel and popup entries before surface-specific overrides
- Settings navigation components now live in `src/sidepanel/components/SettingsNavigation.tsx`, with section ids in `src/sidepanel/settings-section-ids.ts`, keeping sticky section chips and the back-to-top FAB out of the oversized Settings page while preserving the same TopBar placement
- Settings overview and visibility sections now live in `src/sidepanel/components/SettingsSections.tsx`, keeping low-risk display sections out of the oversized Settings page while preserving localized strings and provider toggle dispatch
- Settings permissions section now lives in `src/sidepanel/components/SettingsSections.tsx`, keeping permission prompt rendering out of the oversized Settings page while preserving localized strings and permission toggle dispatch
- Settings credentials section now lives in `src/sidepanel/components/SettingsSections.tsx`, keeping credential card/form rendering out of the oversized Settings page while preserving local draft state, credential dispatch, and Codex workspace config dispatch in `SettingsPage.tsx`
- Settings section navigation state now lives in `src/sidepanel/use-settings-section-navigation.ts`, keeping active-section observation and scroll helpers out of the oversized Settings page while preserving sticky top-bar placement and the back-to-top FAB
- Settings source section now lives in `src/sidepanel/components/SettingsSourceSection.tsx`, keeping Source Connections card rendering out of the oversized Settings page while preserving source preference controls, diagnostic presentation, and session-page actions
- Settings preferences section now lives in `src/sidepanel/components/SettingsPreferencesSection.tsx`, keeping global preference controls, popup appearance preview, and theme customization rendering out of the oversized Settings page while preserving parent dispatch wiring
- The special-route app now lives in `src/sidepanel/special-route-app.tsx`, keeping debug/operator route parsing, rendering, and special-route-only theme/locale hydration out of the standard app runtime file
- Cursor personal usage-page sync is now explicitly labeled as `Window-only vendor value`
- Gemini remains `Policy only`; the observed Google Cloud metrics route is project-scoped and not treated as personal quota
- the UI now makes the trust boundary explicit in Settings and provider detail, including host-access requirements, credential persistence, and the fact that cookies stay forbidden
- the UI now makes the provider contract explicit in Settings and provider detail, including when the current live path and the retained session-page track represent different promises
- dashboard cards now also expose the current provider contract and, when relevant, the retained session-page contract so the main overview stays honest without extra drilling
- deferred tracks now also expose explicit graduation gates in Settings and provider detail so the product states what concrete evidence is still missing
- shipped session-page providers now persist safe page-binding metadata, reconnect to matching tabs across refresh or relaunch, and surface `Attached`, `Stale binding`, and `Not bound` states in the UI
- Codex scheduled session-page sync can now reopen a previously bound analytics page in an inactive managed tab after authorization, while still avoiding any persisted ChatGPT cookies or auth headers
- automatic Codex managed-page sync can now create that inactive analytics tab on alarm/manual refresh even before a saved page binding exists; this is not a fully hidden offscreen scrape because the personal source still depends on a real authenticated ChatGPT page document
- Codex hydration retry now keeps the first refresh inside the same operation while a matched route hydrates usage windows, avoiding a transient parser failure when the page shell renders before quota content
- Codex personal page-session capture now reloads an unreadable existing Codex tab with `bypassCache: true` and retries capture once, so memory-saver or suspended background tabs can recover from the same popup or side-panel refresh action before showing `capture_unavailable`
- the action badge now has an explicit Settings selector for attention count versus dynamic quota candidates, including individual Codex usage windows when those values exist in current provider data
- the user-facing Settings surface now uses Material-style controls for both editable numeric values and fixed option sets, including Source Connections source preference

## Toolbar Entry

The Chrome action now opens a compact popup first:

- the popup shows cached shared dashboard state for a quick glance
- the popup now also surfaces cached snapshot freshness so users can see whether the visible provider state is aligned or mixed
- the popup can trigger an on-demand refresh
- the popup includes an `Open dashboard` action that opens the side panel
- featured popup providers can now deep-link into the matching side-panel detail route
- the popup now also exposes direct quick actions for dashboard and settings
- the popup now also exposes one compact `Start here / Next step` guidance card so `no providers`, `missing access`, `blocked provider`, and `policy-only` states point at the right follow-up surface immediately
- the popup featured-provider area now switches honestly between `Needs attention`, `All clear`, `Current contract`, and `Nothing to triage yet` instead of labeling every state as attention
- the popup now also routes `credential missing` setup states back to Settings directly instead of treating them as generic provider-detail triage
- the popup now also exposes one compact `Setup coverage` summary so visible providers are split into `Live ready`, `Host access`, `Credentials`, and `Policy-only` counts before the user drills into one next step
- the popup setup-coverage summary now also carries one explicit stage label:
  - `Start setup`
  - `Needs setup`
  - `Needs review`
  - `Contract-only`
  - `Ready`
- the popup now hides the empty snapshot-status card when no provider is visible, and when snapshot status is shown it stays focused on freshness instead of repeating setup or action guidance
- the popup actions card now also becomes secondary whenever a guidance card is present, so the primary next step is not duplicated in the lower action row
- the popup header and top summary are now also popup-specific:
  - the header supporting line changes by state instead of staying generic
  - the top summary now reads `Visible / Live ready / Setup blockers / Policy-only` instead of reusing the dashboard-flavored summary labels
- the popup featured-provider cards now also use popup-specific status labels plus a state-first lead line, so setup, review, contract-only, and healthy cards stay aligned with the toolbar story before falling back to detailed contract context
- the popup featured-provider cards now also use stateful CTAs:
  - setup blockers route to `Settings`
  - contract-only cards route to `Dashboard`
  - review states route to `Provider detail`
  - healthy cards keep the lighter `Open detail` path
- the popup featured-provider cards now also run on a lower-density contract:
  - chips are reduced to `current contract + freshness`
  - healthy and contract-only cards now use a shorter availability-summary second line instead of repeating the longer `Current shipped contract ...` prose
- the popup footer note now also uses one stateful `Surface roles` treatment:
  - `Settings owns setup`
  - `Dashboard owns contract review`
  - `Provider detail owns review`
  - `Popup stays quick glance`
- the repo now also ships one repeatable `360px` plus `420px` popup width review for no-visible, mixed-setup, policy-only, and healthy setup stages
- the popup now also has Settings-controlled size, corner, and shadow presets, with the default preserving the balanced quota-first Phase 210 appearance
- Settings now also previews those popup appearance presets before the user reopens the Chrome action popup
- the native toolbar popup has now been checked in RDP Chrome after extension reload, and popup-only circular quota density was tightened so four Codex quota rings remain a quick-glance surface rather than a reset-detail surface
- the repo now also ships one request-bound store-screenshot seed plus RDP capture-runner workflow, so truthful store assets can be collected from the real unpacked extension runtime without pretending the first real screenshot archive already exists
- the repo now also ships the first real archived store screenshot set, captured from `RDP Chrome` and archived with request-bound truth notes instead of preview-only mocks
- the repo now also ships one maintained store-listing copy pack anchored to the refreshed RC11 screenshot archive, including the preferred short description, overview paragraph, feature bullets, screenshot captions, and claim guardrails
- the repo now also ships one maintained store-listing localization source pack anchored to the current manifest, maintained listing-copy pack, and refreshed screenshot archive, so future translated store listings can stay aligned with the same truth boundary
- the repo now also ships one maintained screenshot selection pack that marks the first screenshot archive as a historical baseline after the popup/full-page surface-expansion line, so refreshed store-ready capture is now driven by an explicit stale-review instead of guesswork
- the repo also preserved the refreshed screenshot-capture request workflow for the post-surface-expansion asset set; after Phase 296, that request is fulfilled and no longer the current blocker
- the repo now also ships one native toolbar-popup probe plus helper-window evidence review:
  - current `RDP Chrome` does not expose the native popup as a separate capturable X11 top-level window
  - the probe can capture one truthful helper-window screenshot that documents the environment boundary
  - the older refreshed request therefore kept popup slots `1` through `3` manual rather than silently falling back to the wrong surface
- the repo now also ships one hybrid request-bound full-page staging pass for that refreshed screenshot request:
  - generated `capture-plan.json` now marks popup slots `1` through `3` as manual native-toolbar capture and depth slots `4` and `5` as request-bound full-page-shell capture
  - the pending request package now already includes staged full-page captures for slots `4` and `5`
  - screenshot truth stayed `1 pending request / 1 archived set` until the user accepted a mixed screenshot candidate pack in Phase 295 and Phase 296 archived it
- the repo now also ships one manual screenshot handoff plus archive-readiness preflight for that same refreshed request:
  - the request package now generates `manual-capture-handoff.md` and `manual-capture-handoff.json`
  - those files made the former three native-toolbar popup slots explicit and confirmed that the two full-page depth slots were already staged
  - after Phase 296, that mixed candidate image-file intake/import/archive step is complete
- the repo now also ships one manual screenshot import workflow for that same refreshed request:
  - generated handoff files now expose `manualImportCommand` and `manualImportWithNotesCommand`
  - one repo-backed command can copy real native-toolbar popup captures and an optional popup-note overlay back into the pending request package without hand-editing `capture-notes.json`
  - this import workflow remains available for future requests, but the current refreshed request is already fulfilled by the RC11 mixed archive
- the repo now also ships one generated popup-notes template plus popup-capture checklist for that same refreshed request:
  - the pending request package now includes `manual-popup-notes-overlay.template.json` and `manual-popup-capture-checklist.md`
  - the notes-import command now points at the request-bound template path instead of a generic placeholder
  - the real manual popup capture pass now has one clearer `capture -> edit template -> import -> refresh handoff -> archive` path
- the repo now also ships one request-bound screenshot completion default path:
  - `store:complete-screenshot-capture-request` now defaults to the request package `captures/` directory when `--captures-dir` is omitted
  - once real popup files are imported into the pending request, completion can run with only `--request-id` instead of another manual path argument
  - Phase 296 used the completion path on the real refreshed request, so the repo now records `0` pending screenshot requests and `2` archived sets
- the repo now also ships one request-bound manual finalize path for that refreshed screenshot request:
  - generated handoff files now expose `manualFinalizeCommand` and `manualFinalizeWithNotesCommand`
  - `store:finalize-manual-screenshot-request` now compresses popup import, archive-readiness check, and request completion into one repo-backed operator step
  - Phase 296 completed the remaining real-world step by saving the accepted mixed candidate screenshots as files and archiving them
- the repo now also records one user-approved mixed store screenshot candidate pack:
  - first image: native toolbar popup quick glance
  - remaining images: full-page dashboard overview, Codex usage detail, Cursor source-boundary detail, and side-panel provider depth
- the repo now also ships the fulfilled RC11 mixed store screenshot archive:
  - [2026-05-04-rc11-mixed-store-candidate-archive](./Doc/testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
  - the refreshed request is no longer pending; generated screenshot request and archive indexes now report `0` pending requests and `2` fulfilled archives
  - the archive preserves `5/5` reviewed screenshots and `3` explicit truth-boundary notes for Codex window-scoped usage and Cursor personal partial context
- the repo now also ships one manifest-level i18n bootstrap baseline:
  - `src/manifest.json` now uses `default_locale = en` plus `__MSG_...__` keys for extension name, description, and action title
  - `public/_locales/en/messages.json` and `public/_locales/zh_CN/messages.json` now ship the first manifest catalogs
- the repo now also ships one broader runtime i18n pilot plus one locale-aware formatting slice:
  - `src/shared/i18n.ts` now resolves `system | en | zh-CN` locale preference for runtime surfaces
  - popup and dashboard shell strings plus quick theme-toggle labels now localize to `en` and `zh_CN`
  - generated counts, percentages, and parseable reset/sync timestamp primitives now also format per locale across popup, dashboard, and provider-detail surfaces
  - the first settings-shell pilot slice now also localizes the settings top bar, overview card, section navigation, summary-strip labels, global-preferences labels, locale selector, theme preset labels, top-level section headings, and preferences-saved toast
  - popup explanatory copy plus provider-detail shell/static copy now also localize through one shared structured-copy helper
  - deeper settings helper copy now also localizes theme-customization status messaging, credential cards, source-card diagnostics/session-track helper copy, and permission prompts
  - duration-bearing runtime freshness and reset labels now also localize across popup snapshot status, popup featured-provider freshness chips, and dashboard provider cards
  - popup, sidepanel, and full-page roots now sync runtime `lang` plus `dir`, and preview or QA can force `?app-dir=rtl` or `?app-dir=ltr` without claiming one shipped RTL locale
  - one first compact-width plus RTL hardening pass now ships for the current `en + zh_CN` runtime pilot
  - operator workspaces now have one maintained i18n boundary and extraction review in [I18n_Operator_Workspace_Boundary_And_Extraction.md](./Doc/I18n/I18n_Operator_Workspace_Boundary_And_Extraction.md)
  - interaction-audit and theme-recovery workspace shell/navigation/helper copy now localizes through the same runtime pilot
  - store-screenshot seed and native popup probe helper-route copy now localizes through the same runtime pilot while preserving automation titles and screenshot truth boundaries
  - store-screenshot seed now also shows localized submission-support captions that help operators match presets to the store story without injecting captions into final popup, side-panel, or full-page screenshots
  - raw provider source-truth localization now has a maintained policy boundary in [I18n_Raw_Provider_Source_Truth_Policy.md](./Doc/I18n/I18n_Raw_Provider_Source_Truth_Policy.md)
  - provider-source display wrappers now localize source labels, availability/fidelity/connection labels, helper descriptions, and generated availability summaries while preserving raw adapter evidence strings unchanged
  - adapter diagnostic reason-code planning now exists in [I18n_Adapter_Diagnostic_Reason_Code_Plan.md](./Doc/I18n/I18n_Adapter_Diagnostic_Reason_Code_Plan.md), the type-only additive diagnostic model now exists in provider types/helpers, Cursor plus Codex source-selection/fallback, credential/host-access, page-session, and usage-threshold diagnostics now populate typed metadata where covered, and Gemini policy-only diagnostics now populate typed metadata without changing rendered UI behavior or raw adapter strings
  - raw provider source-truth detail strings plus deeper operator evidence/export payload copy still remain outside the shipped pilot
- the popup runtime now also ships one explicit host-width contract for real Chrome action-popup rendering, so the browser no longer has to guess popup width from the document body
- the popup runtime now also ships one static bootstrap width contract in [src/popup/index.html](./src/popup/index.html), and repo-backed tool commands now prefer the local Node runtime through [scripts/with-preferred-node.sh](./scripts/with-preferred-node.sh) instead of relying on the older Cursor-bundled `node`
- the popup runtime now also ships one popup shell visual corner mask that makes the extension document root transparent and clips the app shell itself, while keeping the Chrome action-popup host shape as a browser-owned boundary
- the popup runtime now also ships one popup host-edge blend that avoids leaving rounded-corner pixels to Chrome's light native backing on dark browser surfaces; this is still not a true transparent native popup window
- the popup runtime now uses one rectangular popup canvas for the Chrome action surface, with rounded styling reserved for internal cards and controls rather than the browser-owned host window
- the repo now also ships one shared route-entry contract for the future full-page shell through `src/sidepanel/index.html?surface=full-page#...`, so popup and sidebar expand controls can target one route-preserving tab surface without duplicating the main app entry
- the popup header now also ships one compact `Tab` expand control that opens the full-page dashboard tab through that shared route-entry contract, while the existing popup quick actions still keep their current sidepanel handoff semantics
- the side-panel top bars now also ship one compact `Tab` expand control that preserves the current `dashboard`, `settings`, or `provider-detail` route when opening the shared full-page shell, and that expand control now stays hidden once the runtime is already inside `?surface=full-page`
- the popup header and standard side-panel top bars now also ship one near-surface `Light / Dark` quick toggle:
  - it flips between explicit `light` and `dark` only
  - when the saved mode is `system`, the first click moves into the opposite explicit mode of the currently resolved runtime theme
  - full-page shell inherits the same top-bar control
  - preset accents and custom-seed state remain unchanged
- the standard full-page shell now also uses one restrained source-aware entry-motion hint:
  - popup expand drives one top-centered scale-plus-rise treatment on dashboard-tab open
  - side-panel expand drives one left-origin slide-plus-scale treatment on route-preserving full-page entry
  - reduced-motion mode disables those entry animations entirely
- the repo now also ships one real RDP runtime surface refresh review plus one runtime-window cleanup helper:
  - popup, side-panel settings, and standard full-page dashboard/settings/provider-detail now have one current extension-mode QA capture set after the shipped expand, quick-theme, and motion slices
  - the capture helpers now close the extension windows they open, reducing repeated-capture OOM risk
  - popup smoke capture remains QA-only evidence because it opens the popup route in its own extension app window rather than the native toolbar bubble
- the toolbar badge can now be configured to show either the number of visible providers needing attention or a selected remaining-quota value from dynamic quota candidates such as a Codex usage window
- the side panel remains the canonical surface for settings, source diagnostics, and provider detail

## Settings Experience

The Settings screen now starts with a compact overview and section-jump area:

- the top of Settings now summarizes visible providers, stored secrets, bound pages, and access gaps
- the Settings top bar now stays sticky so `Back` and `Save` remain reachable while scrolling
- long Settings content now exposes direct jump controls for preferences, visibility, credentials, sources, and permissions
- the sync interval and warning threshold settings now use an editable numeric combobox, keeping preset menu choices while accepting validated custom values
- Settings now includes a toolbar badge selector whose quota entries are generated only from providers with current remaining data, so unavailable or unauthorized providers do not appear as selectable badge sources
- Settings section chips now live inside the sticky top bar as one merged surface, highlight the active section while scrolling, and pair with a lower-right extended back-to-top floating action button for long-page navigation
- fixed Settings option sets now use a Material-style select-only combobox instead of native browser dropdowns, including locale, theme, progress style, popup appearance, and provider source preference controls
- the side-panel CSS now collapses key grids earlier at `720px` instead of waiting for the old `480px` breakpoint alone
- `Source Connections` cards now keep their contract summary visible by default and move dense diagnostics behind an explicit expandable section
- the repo now includes a repeatable `360 / 420 / 720` screenshot review pass for dashboard and settings, and that pass drove a real `360px` overflow fix in Settings
- the side panel now ships a small motion baseline for surface entry, toast feedback, and source-card disclosure, while `prefers-reduced-motion` disables non-essential animation
- Settings section jumps now scroll smoothly by default and fall back to instant jumps when reduced motion is requested
- source-card header chips now carry the current path, contract, fidelity, and state labels so the visible summary tiles can stay focused on preference, access model, fallback, and availability instead of repeating the same facts twice
- source-card body notes now stay hidden unless fallback or operational state needs explanation
- expanded source-card diagnostics now read as grouped sections for source decision, value semantics, and trust boundary instead of one flat field wall
- session-page track blocks now use a compact `title + chips + fields + conditional note` layout so shipped and deferred page routes stay honest without the earlier paragraph stack
- the repo now also includes a compact Settings QA pass at `360x740` and `420x900`, in both motion-safe and reduced-motion scenarios
- top-bar buttons, text buttons, Settings nav chips, selects, switch rows, and source-card disclosure toggles now share one keyboard-focus and state-layer language instead of mixed per-component treatments
- the repo now also includes a repeatable keyboard interaction review for Settings and popup surfaces
- warning and error cards now use one harmonized tonal-surface system across dashboard, settings, and popup, and success toast feedback now uses the same shared status language
- toned warning, error, and success surfaces now also use a clearer text hierarchy, so titles, metrics, and supporting copy no longer all inherit the same neutral content color
- Settings selects and visibility rows now also expose explicit pressed states, and the repo now includes a repeatable pointer hover plus press review for the main Settings and popup controls
- compact chip roles now use a clearer shared token baseline, and unknown progress now renders as an explicit indeterminate state instead of a fake fixed percentage fill
- provider-detail fields, neutral detail notes, and expanded Settings diagnostic groups now use a clearer supporting-surface hierarchy, and compact detail values wrap explicitly instead of risking narrow-width overflow
- the repo now also exposes a dedicated `#debug-interaction-audit` route with fixed-width embedded dashboard, settings, provider-detail, and popup surfaces so real-browser manual QA no longer depends on repeated tab resizing
- that audit route now also exposes per-surface preset actions and inline audit-state feedback, so reviewers can jump directly to source diagnostics, source-preference focus, detail-note positions, and popup actions from the parent QA page
- that audit route now also shows a visible expectation line for every preset, and the repo now has an evidence-pack review pass that saves ordered preset screenshots plus matching audit-state output
- that audit route now also shows explicit per-surface manual checks, and the repo can generate a reusable markdown signoff pack that combines those checks with the latest preset evidence
- that audit route now also includes a persistent signoff workspace with per-check completion, reviewer notes, pass versus follow-up state, and live draft plus JSON copy actions
- that audit route now also lets a reviewer paste exported signoff JSON back into the workspace so a saved local review state can be restored during handoff without inventing server sync
- that audit route now also preserves a repo-backed request binding across import, local workspace edits, drafts, and exported signoff JSON so one valid review export cannot accidentally fulfill a different pending request
- the repo-backed request flow now also surfaces source-template drift for pending requests, so stale request packages can be regenerated before anyone tries to complete them as if they still matched current review scope
- the repo-backed request flow now also ships an explicit regenerate command that supersedes one drifted request and writes one aligned replacement request instead of relying on manual repo edits
- that audit route now also shows a handoff summary with ready, follow-up, not-reviewed, and pending-check counts, and the repo can generate a current-state handoff bundle that links the workspace to the latest preset evidence
- that audit route now also shows the operator handoff workflow directly, and the repo now ships a reusable `interaction-audit:bundle` command for exported signoff JSON
- that audit route now also stores explicit review-session metadata for reviewer, session label, and reviewed-at time, and exported signoff JSON plus generated bundles now preserve that metadata during reset, import, and handoff
- that audit route now also offers direct downloads for signoff draft, signoff JSON, and handoff summary artifacts, with metadata-aware local filenames so operator handoff no longer depends only on clipboard copy
- that audit route now also exposes a live `Review Queue` with one next target plus per-surface jump actions, so human review can move through unresolved work without scanning the whole page manually
- the repo now also ships a reusable `interaction-audit:archive` command that turns exported signoff JSON into a durable review record under `Doc/testing/operator_reviews/`, and the first archived record is a clearly labeled seeded baseline instead of a claimed human signoff
- the durable archive index is now generated from archive manifests, and the default archive command refreshes that index automatically when it writes a repo-backed review record
- the repo now also ships an `interaction-audit:create-review-request` command that creates a pending non-seeded operator review package with a blank importable signoff template, so the first real human pass can start from a repo-backed request instead of an ad-hoc scratch file
- that request flow is now also self-indexing, and the repo now ships an `interaction-audit:complete-review-request` command that fulfills a pending request by linking it to one archived exported signoff session instead of relying on hand-edited request docs
- archives created through that completion flow now also preserve a source-request link, so request and archive records can trace each other in both directions without outside notes
- pending request manifests now also preserve an expected audit shape, and the completion command rejects exported workspace shapes that do not match the request template
- the repo-backed request flow now also resolves source evidence truthfully, so preflight checks the request package evidence path explicitly and completion defaults to that request-bound evidence unless an explicit CLI override is supplied
- repo-backed request packages are now also self-contained: each request snapshots its evidence pack into the request directory, so default request completion no longer depends on a `tmp/` evidence file staying available after the package is created
- repo-backed request packages now also record a digest for that local evidence snapshot, and preflight plus completion reject a request whose packaged evidence was modified after the request was created
- request-bound handoff bundles and durable archives now also preserve request binding plus request revision, so repo-backed review history keeps the same request identity through bundle output, archive manifests, archive README files, and the generated archive index
- generated handoff bundles and durable archives now also preserve evidence source plus integrity summary, so repo-backed review history no longer reduces completion provenance to one path string alone
- fulfilled request records now also preserve a concrete completion receipt, including completion review-session metadata, request revision, evidence provenance, and export digest, so request-side audit checks do not always require archive drill-down

## Theme Modes

The side panel, popup, and audit hub now share one persisted theme preference:

- shipped theme modes are `System`, `Light`, and `Dark`
- shipped accent presets are `Default Blue`, `Meadow`, and `Sunset`
- shipped custom accent mode is one validated `Custom Seed`
- Settings now exposes both `Theme mode` and `Accent preset`
- Settings now also exposes one validated `#RRGGBB` custom-seed input with preview plus reset-to-default actions
- `System` follows `prefers-color-scheme` and resolves at runtime across the side panel, popup, and audit hub
- the repo now also ships a repeatable theme review baseline that verifies `Light`, `Dark`, and `System` behavior across settings, dashboard, and popup, including explicit-mode override of the browser theme
- the repo now also ships a repeatable dark-surface review baseline for warning, error, progress, and supporting surfaces across dashboard, settings, and provider detail
- the repo now also ships a repeatable preset-theme review baseline that verifies the shipped accent presets propagate coherently across settings, dashboard, and popup in both light and dark modes
- the repo now also ships a repeatable audit-hub theme-alignment review baseline that verifies initial theme hydration plus live theme updates from the embedded Settings frame
- the repo now also ships a repeatable custom-seed review baseline that verifies one saved `#RRGGBB` seed propagates coherently across settings, dashboard, popup, and audit hub in both light and dark modes
- the repo now also ships a repeatable custom-seed local-surface review baseline that verifies popup-local labels plus action buttons and audit-hub-local labels plus hero-chip surfaces keep following the same saved seed in both light and dark modes
- the repo now also ships a repeatable custom-seed surface-stability review baseline that proves popup and audit-hub neutral, supporting, and warning surfaces stay stable while only the accent roles change
- the repo now also ships a repeatable custom-seed main-surface stability review baseline that proves dashboard, Settings, and provider-detail neutral, supporting, and warning surfaces stay stable while only the accent roles change
- the repo now also ships a repeatable compact-width custom-seed review baseline that verifies dashboard, Settings, provider detail, and popup stay overflow-free at `360px` and `420px` while preserving the same saved seed state
- the repo now also ships a repeatable provider-state-specific custom-seed review baseline that proves Claude and Gemini warning or error surfaces stay state-colored while Codex neutral status-chip and progress-fill surfaces keep following the active accent roles
- the repo now also ships a repeatable seeded recovered-state review baseline that proves Cursor and Codex session-page surfaces move from host-access-missing warning treatments back to neutral healthy treatments under the same saved custom seed
- the repo now also ships a repeatable preview-interaction recovered-state review baseline that uses Settings host-access controls in browser preview mode to move Cursor and Codex from `Needs access` back to `Healthy` while keeping the same saved custom-seed palette across settings, dashboard, popup, and provider detail
- the repo now also ships a repeatable extension-mode recovered-state review baseline that uses the real unpacked MV3 runtime plus pre-granted optional host access and synthetic vendor tabs to move Cursor and Codex from `Needs access` back to `Healthy` while keeping the same saved custom-seed palette across settings, dashboard, popup, provider detail, and action badge
- the repo now also ships one dedicated `#debug-theme-recovery-review` operator workspace plus runbook so native-prompt or real-session follow-up can use one fixed route, one fixed summary, and one fixed set of quick links without pretending a human pass already happened
- the repo now also ships direct summary and JSON downloads from that theme-recovery workspace, plus one repo-backed `theme-recovery:archive` flow with a clearly labeled seeded baseline under `Doc/testing/theme_recovery_reviews/` and a generated archive index at [Theme_Recovery_Review_Archive.md](./Doc/testing/Theme_Recovery_Review_Archive.md)
- the repo now also ships one repo-backed `theme-recovery:create-review-request` plus `theme-recovery:complete-review-request` lifecycle and a generated request index at [Theme_Recovery_Review_Requests.md](./Doc/testing/Theme_Recovery_Review_Requests.md), and those request packages now preserve one request-bound workspace route so exported summary and JSON artifacts carry the same request identity instead of remaining fungible ad-hoc files
- arbitrary per-token color editing, dual light-dark seed personalization, and real fulfilled operator or native-prompt recovery archives remain future work

Hybrid-source preference behavior:

- `Codex` and `Cursor` now expose an explicit source preference in Settings:
  - `Auto`
  - `Official API`
  - `Session page`
- the active provider snapshot now records:
  - which source was actually used
  - why that source was selected
  - whether a fallback happened because the preferred source was unavailable
- Settings now includes a `Use current page` action for shipped session-page tracks, so an already-active Codex or Cursor usage page can be validated, bound, and refreshed without opening another provider tab
- dashboard provider cards and provider detail now expose a direct source-page recovery action for shipped Codex/Cursor-style session-page tracks, reusing the same tab focus/open plus page-binding flow without requiring a Settings detour
- popup featured-provider cards now also use that source-page recovery action for shipped session-page failure states, so toolbar triage can reopen or focus Codex/Cursor source pages directly
- when source-page recovery finds an already-open matching provider tab, it now saves the binding and refreshes the provider immediately; newly-opened pages still wait for the operator to finish login or navigation before refreshing
- when the existing source tab is in a `capture_unavailable` state, recovery reloads that tab before saving the binding and refreshing the provider
- the background worker now marks a saved session-page binding stale when the bound tab closes or navigates away from that provider's usage-page routes
- if Chrome replaces the tab id for a matching usage page, the background worker now moves the saved binding to the replacement tab instead of leaving the old id behind
- after a Codex page binding exists, scheduled and manual Codex session-page refresh can open the `chatgpt.com/codex/cloud/settings/analytics` page in an inactive managed tab when no matching tab is open; if that attempt detects a logged-out page, the auto-opened tab is closed and the UI keeps the login prompt
- open Codex or Cursor usage tabs that cannot be read by extension scripting now surface as `capture_unavailable` instead of being mislabeled as a missing page
- dashboard, provider detail, and popup source-state displays now keep that unreadable-page condition separate from generic sync errors
- dashboard and provider detail hide generic percent progress when no measured percent value exists, keeping parse/source failures distinct from real quota progress
- popup provider cards also hide generic percent progress when no measured percent value exists, while keeping structured usage-window rings visible
- current fallback rules are deterministic:
  - missing credential: may fall back to the other shipped source
  - open page required or logged-out page: may fall back to the other shipped source
  - sync error on the preferred source: may fall back to the other shipped source
  - missing host access: no fallback; the provider stays blocked until permissions are granted

## Prerequisites

- Node `22` or newer
- `npm`
- `zip` for release packaging
- Chrome or Chromium for unpacked-extension testing

The repo includes `.nvmrc` with `22`.

## Development

```bash
nvm use
npm install
npm run typecheck
npm run test
npm run build
```

Repo-backed scripts already prefer `${HOME}/.local/node-current/bin/node` through [scripts/with-preferred-node.sh](./scripts/with-preferred-node.sh) when that runtime exists.

Portable Node 22 fallback if `nvm` is unavailable:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
```

Responsive and interaction review:

```bash
npm run phase55:review
npm run phase60:review
npm run phase61:review
npm run phase62:review
npm run phase63:review
npm run phase64:review
npm run phase65:review
npm run phase66:review
npm run phase67:review
npm run phase68:review
npm run phase69:review
npm run phase70:review
npm run phase71:review
npm run phase72:review
npm run phase73:review
npm run phase74:review
npm run phase75:review
npm run phase76:review
npm run phase77:review
npm run phase78:review
npm run phase79:review
npm run phase80:review
npm run phase81:review
npm run phase82:review
npm run phase83:review
npm run phase84:review
npm run phase85:review
npm run phase86:review
npm run phase87:review
npm run phase88:review
npm run phase89:review
npm run phase90:review
npm run phase91:review
npm run phase92:review
npm run phase93:review
npm run phase94:review
npm run phase95:review
npm run phase96:review
```

Operator handoff bundle:

```bash
npm run interaction-audit:bundle -- --input tmp/operator-signoff-export.json --output-dir tmp/operator-handoff-bundle
```

The exported signoff JSON now preserves the audit workspace `Reviewer`, `Session`, and `Reviewed at` fields, and the generated bundle carries that same review-session metadata into both markdown and JSON outputs. The generated bundle now also preserves evidence source plus integrity summary, and when the current workspace is bound to one repo-backed request it also preserves `Request binding` plus `Request revision` instead of dropping request identity after export.

The audit hub now also exposes direct file downloads for the current signoff draft, signoff JSON, and handoff summary, and those downloaded filenames include the current review date plus a sanitized session label. When the current workspace is bound to a repo-backed request, those downloaded filenames now also include the bound request id.

Repo-backed review archive:

```bash
npm run interaction-audit:archive -- --input tmp/operator-signoff-export.json
npm run interaction-audit:refresh-archive-index
```

The archive command writes a durable review record under `Doc/testing/operator_reviews/` and refreshes the generated archive index automatically. `interaction-audit:refresh-archive-index` is available when you need to rebuild the index and machine-readable catalog after manual archive changes. Request-linked archives now preserve both the higher-level `sourceRequest` link and the request-bound export context that was actually fulfilled, including `Request binding` plus `Request revision`, inside archive manifests, archive README output, and the generated archive index. Archives now also preserve evidence source plus integrity summary, so completion provenance stays truthful even when the archive is reviewed later without reopening the original request package. The current archive index lives in [Interaction_Audit_Review_Archive.md](./Doc/testing/Interaction_Audit_Review_Archive.md).

Theme recovery review archive:

```bash
npm run phase112:review
npm run phase113:review
npm run theme-recovery:archive -- --input tmp/theme-recovery-review-export.json
npm run theme-recovery:refresh-archive-index
```

The theme-recovery workspace at `#debug-theme-recovery-review` now supports direct summary and JSON downloads with stable filenames derived from the current review stage. The archive command writes a durable theme-recovery record under `Doc/testing/theme_recovery_reviews/` and refreshes the generated archive index automatically. The current repo-backed baseline is a seeded internal archive at `Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/`, and it is intentionally truthful about unresolved access state instead of pretending a completed human recovery pass. The current archive index lives in [Theme_Recovery_Review_Archive.md](./Doc/testing/Theme_Recovery_Review_Archive.md).

Theme recovery review request:

```bash
npm run theme-recovery:create-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request
npm run theme-recovery:preflight-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request --input tmp/theme-recovery-review-export.json
npm run theme-recovery:complete-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request --input tmp/theme-recovery-review-export.json
npm run theme-recovery:refresh-review-request-index
```

The create command writes a pending request package under `Doc/testing/theme_recovery_review_requests/`. That package preserves the workspace route, the expected target providers, the expected custom-seed theme state, and one copied seeded reference export from the durable baseline archive. The preflight command is the no-mutation gate for a future real operator export: it validates request binding, bound workspace route, target providers, preset, and seed without touching request or archive records. The complete command is the truthful fulfillment path for that same package: it writes one non-seeded durable archive, links that archive back into the request receipt, and refreshes both generated indexes automatically. The current generated request index lives in [Theme_Recovery_Review_Requests.md](./Doc/testing/Theme_Recovery_Review_Requests.md), and its current truthful state is `0` pending requests plus `1` fulfilled request archived under [2026-05-11-system-recovered-014312](./Doc/testing/theme_recovery_reviews/2026-05-11-system-recovered-014312/README.md).
When the workspace is opened through that request package's bound route, the exported summary and JSON now also preserve `requestId + requestCreatedAt`, and the downloaded filenames carry the bound request id as a suffix. Preflight and completion both reject one export whose bound request identity does not match the target pending request.

Pending operator review request:

```bash
npm run interaction-audit:create-review-request -- --request-id 2026-04-23-first-real-operator-review-request
npm run interaction-audit:preflight-review-request -- --request-id 2026-04-23-first-real-operator-review-request --input tmp/operator-signoff-export.json
npm run interaction-audit:complete-review-request -- --request-id 2026-04-23-first-real-operator-review-request --input tmp/operator-signoff-export.json
npm run interaction-audit:regenerate-review-request -- --request-id 2026-04-23-first-real-operator-review-request
npm run interaction-audit:refresh-review-request-index
```

The create command writes a pending request package under `Doc/testing/operator_review_requests/`. That request manifest now preserves both the expected audit shape derived from the blank template and a request-bound context copied into the pending template itself. Each request package now also snapshots its evidence pack into `interaction-audit-evidence-pack.json`, so the package remains self-contained after creation while still preserving the original source evidence seed path for provenance. Each package now also records the packaged snapshot digest in the request manifest and README, so preflight plus completion can reject a request whose local evidence snapshot was modified after packaging. The audit hub now preserves that bound `requestId + requestCreatedAt` context across import, local workspace state, draft generation, exported signoff JSON, request-scope guidance, and downloaded artifact filenames. The same request package now also records a `requestRevisionSha256`, so preflight plus completion can reject one export that is still bound to an older revision of the same pending request after that request package has been refreshed in place. That revision is now visible in the audit hub `Request Scope`, carried into signoff draft plus handoff summary text, preserved in bound download filenames as a short `rev-...` segment, and now also preserved through generated handoff bundles plus request-linked durable archives. Completion archives now also preserve evidence source plus integrity summary in addition to the selected evidence path, so later repo review can still tell whether the archive used a verified request snapshot or another explicit evidence source. Fulfilled request records now also preserve a compact completion receipt, including completion review-session metadata, completion request revision, completion evidence provenance, and completed export digest, so request-side audit checks can stay useful without always jumping straight to the archive. The generated request index now also surfaces whether a pending request is still aligned with the current source template or has drifted out of date. The preflight command evaluates seeded-state rejection, request binding, workspace shape, current-template drift, and the request package evidence snapshot without mutating request or archive records. The complete command reuses those same gate checks, so it will reject exported workspace state whose request binding or workspace shape does not match the target pending request, and it will also reject a stale request package whose current source template has drifted and needs regeneration first. When `--evidence` is omitted, completion now uses the pending request package's evidence snapshot by default; if you intentionally pass `--evidence`, the archive preserves that actual override path instead. The regenerate command supersedes that stale request and writes one aligned replacement request from the current source template instead of leaving request recovery as a manual repo edit, and the replacement request also snapshots its evidence pack into the new request directory. When completion succeeds, it archives the export and refreshes both the request index and archive index automatically. Archives created through that completion path also preserve the source request id and request paths inside the archive manifest and generated archive index. The current generated request index lives in [Interaction_Audit_Review_Requests.md](./Doc/testing/Interaction_Audit_Review_Requests.md), its current truthful state is `0` pending requests plus `1` fulfilled request archived under [2026-05-11-2026-05-11-rdp-chrome-visual-audit](./Doc/testing/operator_reviews/2026-05-11-2026-05-11-rdp-chrome-visual-audit/README.md), and the machine-readable request catalog lives at `Doc/testing/operator_review_requests/index.json`.

Static preview from the built extension:

```bash
npm run preview:dist
```

Preview URL:

- local: `http://127.0.0.1:4173/src/sidepanel/index.html`
- LAN: `http://10.10.2.202:4173/src/sidepanel/index.html`
- audit local: `http://127.0.0.1:4173/src/sidepanel/index.html#debug-interaction-audit`
- popup local: `http://127.0.0.1:4173/src/popup/index.html`
- popup LAN: `http://10.10.2.202:4173/src/popup/index.html`

## Install As Unpacked Extension

1. Build the extension with `npm run build`.
2. Open `chrome://extensions`.
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select the repo `dist/` directory.
6. Click the toolbar action to open the popup, review the snapshot-status card if needed, then use `Open dashboard` or `Open settings` to jump into the side panel.
7. If you rebuild and keep using the same Chrome profile, go back to `chrome://extensions` and reload or update the unpacked extension before rerunning operator verification. Brave remains an explicit fallback profile for RDP troubleshooting, not the default verification target.

## Provider Credentials And Permissions

| Provider | Required credential | Required host access |
| --- | --- | --- |
| Cursor | optional Admin API key for the team path; none for the personal dashboard page | `https://api.cursor.com/*`, `https://cursor.com/*` |
| JetBrains AI | none | `https://account.jetbrains.com/*`, `https://*.jetbrains.com/*` |
| Claude Code | optional Admin API key for organization analytics; none for the Claude Team usage page | `https://api.anthropic.com/*`, `https://platform.claude.com/*`, `https://claude.ai/*` |
| Gemini Code Assist | none | none |
| Codex | none for personal usage pages; analytics API key + workspace ID for Enterprise analytics | `https://api.chatgpt.com/*`, `https://chatgpt.com/*` |

This matrix is guarded by [provider-source-host-permissions.test.ts](./src/shared/provider-source-host-permissions.test.ts), which keeps provider source route hints, Settings host origins, and manifest optional host permissions aligned while preserving Gemini project metrics as a deferred no-host-access path.

For shipped session-page providers, use `Settings -> Source Connections` to find or open the required logged-in browser page before refreshing. The same section now shows whether the provider page is attached, stale, or unbound, and lets you disconnect a saved binding explicitly. Direct source-page recovery actions refresh immediately when they attach an already-open matching tab, and they reload the tab first when the current state is `capture_unavailable`. Newly-opened recovery pages still need a manual refresh after login or navigation, but Codex scheduled sync can reopen a previously bound analytics page in an inactive managed tab after authorization. If an open usage tab exists but the browser cannot read it, Codex and Cursor show a capture-unavailable session-page diagnostic with reload guidance.

If you are using the long-lived Chrome profile for release verification, run `./scripts/with-preferred-node.sh node ./scripts/phase41-profile-audit.mjs` after reloading the unpacked extension so the runtime host grants and stored extension state are visible before the final pass. The local RDP helper defaults now prefer Chrome and can fall back to Brave when Chrome is unavailable; use `RDP_BROWSER_*` or `--profile-dir` for explicit profile inspection. In the narrowed RC selected on `2026-04-23`, JetBrains is retained in the repo but not part of the active release promise.

When opening sidepanel-derived routes in an ordinary Chrome tab or app window, use the full-page contract such as `chrome-extension://<id>/src/sidepanel/index.html?surface=full-page#dashboard`. The bare `src/sidepanel/index.html#...` route is reserved for real side panel handoff and is not the RDP app-window smoke target.

## Release Flow

Verify the release candidate:

```bash
nvm use
npm run release:check
npm run phase27:check
```

Package the already-built extension:

```bash
nvm use
npm run release:package
```

Run the full release flow in one command:

```bash
nvm use
npm run release
```

Output artifact:

- `release/ai-usage-dashboard-0.1.0-rc.15.zip`

Packaging note:

- `rc.15` packages the previous `rc.14` follow-up work plus the post-`rc.14` local-safe maintenance, Chrome helper evidence, focused route/action guards, component/view-model splits, and page-session helper extractions through `Phase 363`.
- `Phase 364` cut `rc.15` as the current packaged follow-up candidate.
- `Phase 365` is source-only test coverage after `rc.15`; it does not change package bytes or runtime host permissions.
- `Phase 366` is source-only onboarding polish after `rc.15`; it does not change package bytes or runtime permissions.
- the `RC13` milestone remains the submitted Chrome Web Store review boundary until a deliberate resubmission replaces it.

The packaging script checks that:

- `package.json` and `manifest.json` are version-aligned
- `dist/` exists
- the built manifest, side-panel entry, and icon set are present

If your interactive shell still resolves `node` to an older runtime, use `nvm use` first. Repo-backed `npm run ...` commands now prefer `${HOME}/.local/node-current/bin/node` through [scripts/with-preferred-node.sh](./scripts/with-preferred-node.sh) so Vite, TypeScript, and Vitest do not fall back to the older Cursor-bundled runtime.

Portable fallback on the same workstation:

```bash
npx -y node@22 ./scripts/phase27-real-profile-check.mjs
npx -y node@22 ./scripts/package-release.mjs
```

## Docs

- [Project Quickstart](./Doc/Project_Quickstart.md)
- [Strategic Directions Index](./Doc/Roadmap/00_Strategic_Directions_Index.md)
- [Release Packaging Guide](./Doc/Release_Packaging_Guide.md)
- [Manual Test Checklist](./Doc/testing/Manual_Test_Checklist.md)
- [Phase 27 Verification Report](./Doc/testing/Archive/phase-reports/001-099/Phase_27_Real_Device_Verification_Report.md)
- [Phase 41.1 Runtime Parity Report](./Doc/testing/Archive/phase-reports/001-099/Phase_41_1_Real_Chrome_Runtime_Parity_Report.md)
- [Phase 41.2 Final Mixed-Source Report](./Doc/testing/Archive/phase-reports/001-099/Phase_41_2_Final_Mixed_Source_Real_Chrome_Report.md)
- [Phase 69 Interaction Audit Evidence Pack](./Doc/testing/Archive/phase-reports/001-099/Phase_69_Interaction_Audit_Evidence_Pack.md)
- [Phase 70 Interaction Audit Manual Signoff Pack](./Doc/testing/Archive/phase-reports/001-099/Phase_70_Interaction_Audit_Manual_Signoff_Pack.md)
- [Phase 71 Interaction Audit Signoff Workspace](./Doc/testing/Archive/phase-reports/001-099/Phase_71_Interaction_Audit_Signoff_Workspace.md)
- [Store Screenshot Capture Runbook](./Doc/testing/Store_Screenshot_Capture_Runbook.md)
- [Interaction Audit Operator Handoff Runbook](./Doc/testing/Interaction_Audit_Operator_Handoff_Runbook.md)
- [Theme Recovery Operator Runbook](./Doc/testing/Theme_Recovery_Operator_Runbook.md)
- [Page Session Fixture Conventions](./Doc/testing/Page_Session_Fixture_Conventions.md)
- [Cursor Note](./Doc/provider_notes/Cursor.md)
- [JetBrains Note](./Doc/provider_notes/JetBrains.md)
- [Claude Note](./Doc/provider_notes/Claude.md)
- [Gemini Note](./Doc/provider_notes/Gemini.md)
- [Codex Note](./Doc/provider_notes/Codex.md)
