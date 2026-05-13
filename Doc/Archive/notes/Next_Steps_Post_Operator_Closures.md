# Next Steps — Post RC13 And Operator Closures

Date: 2026-05-12

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- living strategy

Freshness model:

- dated snapshot

Status note:

- snapshot refreshed on 2026-05-13 after RC15 maintenance follow-up packaging, Chrome automation default alignment, the `rc.14` Chrome helper smoke pass, the RDP full-page route-contract guard, store screenshot route-config reuse, interaction-audit frame-action, surface-card, review-queue, request-scope, signoff-session, handoff-summary, guidance-card, workspace-controls, and surface-grid splits, theme-recovery current-state, theme-state, request-scope, provider-list, workflow-links, and outputs splits, shared operator helpers, Settings focused deep-link render coverage, Settings source-card and quick-setup view-model splits, page-session tab-priority, tab-lifecycle, script-capture, network-observer, and candidate-tabs helper splits, popup Settings/source-page helper coverage, popup route-action sidePanel coverage, popup source-page action helper coverage, popup refresh action helper coverage, popup theme-toggle helper coverage, popup hide-provider helper coverage, popup guidance action helper coverage, popup provider-progress component coverage, popup featured-provider-list, popup header, popup guidance-card rendering, popup setup-coverage rendering, popup snapshot-status rendering, popup action-section rendering, popup surface-roles rendering, popup featured-section rendering, popup load-state rendering, popup snapshot-status / guidance-card / featured-section / surface-route / localized-view-model coverage, provider host-permission guard coverage, and first-run Quick Setup onboarding focus
- refresh this file when the Chrome Web Store review result arrives, or when a new high-priority direction opens

## What Just Closed

As of 2026-05-11 the following previously-open items are now done:

### Direction 04 — Interaction Audit Real Operator Closure

- first real RDP Chrome visual audit completed via `2026-05-11-2026-05-11-rdp-chrome-visual-audit`
- all 5 surfaces reviewed (`dashboard-360`, `settings-420`, `cursor-detail-360`, `codex-detail-420`, `popup-360`), all 11 manual checks resolved
- pending request `2026-04-23-first-real-operator-review-request` fulfilled and archived
- archive: [Doc/testing/operator_reviews/2026-05-11-2026-05-11-rdp-chrome-visual-audit/](../../testing/operator_reviews/2026-05-11-2026-05-11-rdp-chrome-visual-audit/README.md)

### Direction 05 — Theme Recovery Real Operator Closure

- first real operator theme-recovery export completed on display `:10` RDP Chrome
- theme: System mode, custom preset, seed `#4F46E5`, resolved light — stage `Recovered`
- both target providers (Cursor + Codex) confirmed granted and healthy
- pending request `2026-04-23-first-real-theme-recovery-review-request` fulfilled and archived
- archive: [Doc/testing/theme_recovery_reviews/2026-05-11-system-recovered-014312/](../../testing/theme_recovery_reviews/2026-05-11-system-recovered-014312/README.md)

## Current Blocking Priorities

### P0 — Chrome Web Store Review Tracking (Human-Owned)

The submitted store-review boundary remains `release/ai-usage-dashboard-0.1.0-rc.13.zip`. Keep using the RC13 milestone as the truthful historical submission handoff while that review is still pending in the Chrome Web Store Developer Dashboard.

The repo is now also packaged forward through `Phase 364` as `release/ai-usage-dashboard-0.1.0-rc.15.zip`. That newer package is a prepared follow-up candidate, not an instruction to silently replace the submitted RC13 review boundary. It includes the previous RC14 follow-up polish plus `Phase 307` through `Phase 363` post-package tooling, Chrome automation, smoke-evidence, first-provider setup, cached-first guard, popup and Settings maintenance, page-session helper maintenance, route-contract, screenshot-helper reuse, interaction-audit maintenance, theme-recovery maintenance, operator-helper follow-ups, and focused-link / source-page / refresh / theme-toggle / hide-provider / guidance / progress / snapshot-status / featured-section / surface-route / localized-view-model / route-action guardrails. `Phase 365` and `Phase 366` are later source-only follow-ups for host-permission guard coverage and first-run Quick Setup onboarding focus; they do not change the RC15 package bytes or runtime permission set.

References:
- [Doc/Milestones/2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md](../../Milestones/2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md)
- [Doc/Milestones/2026-05-13_RC15_Maintenance_Follow_Up_Release_Candidate.md](../../Milestones/2026-05-13_RC15_Maintenance_Follow_Up_Release_Candidate.md)

Remaining human steps:
- monitor the RC13 Chrome Web Store review result
- keep the reviewed screenshots from [2026-05-04-rc11-mixed-store-candidate-archive](../../testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md), listing copy, and disclosure answers ready
- if review feedback or a deliberate product decision calls for a newer package, promote RC15 from the follow-up milestone instead of mutating RC13 history

No additional release-package work is required before review feedback arrives; the newer RC15 package already exists if it becomes necessary. The previously queued local-safe follow-ups through Phase 366 are now complete; create a new small TODO before starting additional behavior changes.

### P1 — Decide Whether To Promote RC15

If Chrome Web Store review requests code, icon, manifest, or listing changes that are already covered by RC15, resubmit from the RC15 follow-up candidate and record a fresh submission milestone for that handoff.

If review feedback asks for more changes beyond RC15, build on RC15 rather than reopening RC13.

If RC13 passes with no changes, RC15 remains optional follow-up polish rather than a forced resubmission.

## Next Engineering Work (After Store Upload Clears)

Priority is taken from `00_Strategic_Directions_Index.md` active continuation order:

### Immediate Queued Phases

None currently queued.

Completed local-safe follow-up:

- [309_Phase_Quick_Setup_First_Provider_Guided_Setup.md](../../TODOs/Archive/by-phase/300-399/309_Phase_Quick_Setup_First_Provider_Guided_Setup.md) - made zero-provider Settings recommend one personal-user provider and made popup zero-provider actions deep-link to that same Quick Setup card.
- [310_Phase_Cached_First_Bootstrap_Performance_Guard.md](../../TODOs/Archive/by-phase/300-399/310_Phase_Cached_First_Bootstrap_Performance_Guard.md) - added a render-level cached-first regression guard and refreshed Chrome helper dashboard/full-page smoke evidence.
- [311_Phase_Popup_View_Model_Maintenance_Split.md](../../TODOs/Archive/by-phase/300-399/311_Phase_Popup_View_Model_Maintenance_Split.md) - split popup view-model internals into type, setup-coverage, and featured-provider-card modules without changing popup behavior.
- [312_Phase_RDP_Full_Page_Route_Contract_Guard.md](../../TODOs/Archive/by-phase/300-399/312_Phase_RDP_Full_Page_Route_Contract_Guard.md) - made extension-window capture routes testable and locked ordinary Chrome app-window smoke routes to `?surface=full-page#...`.
- [313_Phase_Store_Screenshot_Route_Config_Reuse.md](../../TODOs/Archive/by-phase/300-399/313_Phase_Store_Screenshot_Route_Config_Reuse.md) - made request-bound store screenshot runtime plans reuse the same RDP extension-window route config.
- [314_Phase_Interaction_Audit_Frame_Actions_Split.md](../../TODOs/Archive/by-phase/300-399/314_Phase_Interaction_Audit_Frame_Actions_Split.md) - split interaction-audit iframe readiness and preset-action helpers out of the route component without changing signoff behavior.
- [315_Phase_Operator_Download_Helper_Split.md](../../TODOs/Archive/by-phase/300-399/315_Phase_Operator_Download_Helper_Split.md) - shared the browser text-file download helper across interaction-audit and theme-recovery operator pages.
- [316_Phase_Operator_Clipboard_Helper_Split.md](../../TODOs/Archive/by-phase/300-399/316_Phase_Operator_Clipboard_Helper_Split.md) - shared clipboard-write behavior across interaction-audit and theme-recovery operator pages while preserving feedback semantics.
- [317_Phase_Operator_Runtime_I18n_Helper_Split.md](../../TODOs/Archive/by-phase/300-399/317_Phase_Operator_Runtime_I18n_Helper_Split.md) - shared default operator runtime i18n bootstrap across interaction-audit and theme-recovery operator pages.
- [318_Phase_Settings_Focused_Deep_Link_Render_Guard.md](../../TODOs/Archive/by-phase/300-399/318_Phase_Settings_Focused_Deep_Link_Render_Guard.md) - added render coverage for Settings source and Quick Setup focused deep links used by popup setup/problem actions.
- [319_Phase_Popup_Settings_Action_Focus_Helper.md](../../TODOs/Archive/by-phase/300-399/319_Phase_Popup_Settings_Action_Focus_Helper.md) - centralized popup Settings-action focus mapping and covered explicit-provider plus visible-provider-derived targets.
- [320_Phase_Popup_Source_Page_Tab_Selection_Helper.md](../../TODOs/Archive/by-phase/300-399/320_Phase_Popup_Source_Page_Tab_Selection_Helper.md) - extracted and tested popup source-page recovery tab selection while preserving binding and activation behavior.
- [321_Phase_Popup_Route_Action_Helper.md](../../TODOs/Archive/by-phase/300-399/321_Phase_Popup_Route_Action_Helper.md) - extracted popup route-opening actions and covered preview plus Chrome full-page handoffs.
- [322_Phase_Popup_SidePanel_Route_Action_Guard.md](../../TODOs/Archive/by-phase/300-399/322_Phase_Popup_SidePanel_Route_Action_Guard.md) - added active-tab and current-window Chrome sidePanel route-action coverage.
- [323_Phase_Popup_Source_Page_Action_Helper.md](../../TODOs/Archive/by-phase/300-399/323_Phase_Popup_Source_Page_Action_Helper.md) - extracted popup source-page recovery actions and covered fallback, direct-open, existing-tab, and created-tab branches.
- [324_Phase_Popup_Refresh_Action_Helper.md](../../TODOs/Archive/by-phase/300-399/324_Phase_Popup_Refresh_Action_Helper.md) - extracted popup refresh actions and covered direct refresh, denied host-access, browser rejection, and granted-access continuation branches.
- [325_Phase_Popup_Theme_Toggle_Action_Helper.md](../../TODOs/Archive/by-phase/300-399/325_Phase_Popup_Theme_Toggle_Action_Helper.md) - extracted popup theme-toggle update actions and covered light, dark, system-resolved, and update-failure branches.
- [326_Phase_Popup_Hide_Provider_Action_Helper.md](../../TODOs/Archive/by-phase/300-399/326_Phase_Popup_Hide_Provider_Action_Helper.md) - extracted popup hide-provider actions and covered provider-disable success plus message-bus failure branches.
- [327_Phase_Popup_Guidance_Action_Helper.md](../../TODOs/Archive/by-phase/300-399/327_Phase_Popup_Guidance_Action_Helper.md) - extracted popup guidance routing and covered Settings focus, dashboard, provider-detail, source-page, and hide-provider no-op branches.
- [328_Phase_Popup_Provider_Progress_Component.md](../../TODOs/Archive/by-phase/300-399/328_Phase_Popup_Provider_Progress_Component.md) - extracted popup provider progress rendering and covered usage-window, single-value, and hidden empty-percent branches.
- [329_Phase_Popup_Snapshot_Status_View_Model_Split.md](../../TODOs/Archive/by-phase/300-399/329_Phase_Popup_Snapshot_Status_View_Model_Split.md) - extracted popup snapshot-status view-model logic and covered no-provider, aligned, mixed, warning, and error decisions.
- [330_Phase_Popup_Guidance_Card_View_Model_Split.md](../../TODOs/Archive/by-phase/300-399/330_Phase_Popup_Guidance_Card_View_Model_Split.md) - extracted popup guidance-card view-model logic and covered first setup, missing access, missing credential, blocked provider, policy-only, and ready-provider decisions.
- [331_Phase_Popup_Featured_Section_View_Model_Split.md](../../TODOs/Archive/by-phase/300-399/331_Phase_Popup_Featured_Section_View_Model_Split.md) - extracted popup featured-section view-model logic and covered zero-provider, needs-attention, policy-only, and all-clear section stories.
- [332_Phase_Popup_Surface_Route_View_Model_Split.md](../../TODOs/Archive/by-phase/300-399/332_Phase_Popup_Surface_Route_View_Model_Split.md) - extracted popup secondary-action and surface-roles view-model logic and covered the route-story branches outside the popup view-model aggregator.
- [333_Phase_Popup_Localized_View_Model_Split.md](../../TODOs/Archive/by-phase/300-399/333_Phase_Popup_Localized_View_Model_Split.md) - extracted popup localized view-model orchestration while preserving the public `localizePopupViewModel` export path.
- [348_Phase_Popup_Featured_Provider_List_Component.md](../../TODOs/Archive/by-phase/300-399/348_Phase_Popup_Featured_Provider_List_Component.md) - extracted popup featured-provider list rendering while preserving route-owned action execution and settings-focus targeting.
- [349_Phase_Popup_Header_Component.md](../../TODOs/Archive/by-phase/300-399/349_Phase_Popup_Header_Component.md) - extracted popup header rendering while preserving route-owned refresh, theme-toggle, and dashboard-tab handlers.
- [350_Phase_Popup_Guidance_Card_Component.md](../../TODOs/Archive/by-phase/300-399/350_Phase_Popup_Guidance_Card_Component.md) - extracted popup guidance-card rendering while preserving route-owned action routing and settings-focus targeting.
- [351_Phase_Popup_Setup_Coverage_Component.md](../../TODOs/Archive/by-phase/300-399/351_Phase_Popup_Setup_Coverage_Component.md) - extracted popup setup-coverage rendering while preserving route-owned action routing and settings-focus targeting.
- [352_Phase_Popup_Snapshot_Status_Component.md](../../TODOs/Archive/by-phase/300-399/352_Phase_Popup_Snapshot_Status_Component.md) - extracted popup snapshot-status rendering while preserving route-owned display gating and snapshot-status semantics.
- [353_Phase_Popup_Action_Section_Component.md](../../TODOs/Archive/by-phase/300-399/353_Phase_Popup_Action_Section_Component.md) - extracted popup action-section rendering while preserving route-owned action execution and action ordering.
- [354_Phase_Popup_Surface_Roles_Component.md](../../TODOs/Archive/by-phase/300-399/354_Phase_Popup_Surface_Roles_Component.md) - extracted popup surface-roles rendering while preserving route-owned display gating and route-story semantics.
- [355_Phase_Popup_Featured_Section_Component.md](../../TODOs/Archive/by-phase/300-399/355_Phase_Popup_Featured_Section_Component.md) - extracted popup featured-section rendering while preserving route-owned display gating and featured-section semantics.
- [356_Phase_Popup_Load_State_Cards.md](../../TODOs/Archive/by-phase/300-399/356_Phase_Popup_Load_State_Cards.md) - extracted popup loading and error-state rendering while preserving route-owned retry and open actions.
- [357_Phase_Settings_Source_Card_View_Model_Split.md](../../TODOs/Archive/by-phase/300-399/357_Phase_Settings_Source_Card_View_Model_Split.md) - extracted Settings source-card compact-field, session-track, and diagnostics view-model logic while preserving the existing `settings-view-models.ts` import path.
- [358_Phase_Settings_Quick_Setup_View_Model_Split.md](../../TODOs/Archive/by-phase/300-399/358_Phase_Settings_Quick_Setup_View_Model_Split.md) - extracted Settings Quick Setup action ids, card construction, setup-state resolution, and helper text selection while preserving the existing `settings-view-models.ts` import path.
- [359_Phase_Page_Session_Tab_Priority_Helper.md](../../TODOs/Archive/by-phase/300-399/359_Phase_Page_Session_Tab_Priority_Helper.md) - extracted page-session tab priority scoring and sorting while preserving existing page-session capture and binding semantics.
- [360_Phase_Page_Session_Tab_Lifecycle_Helper.md](../../TODOs/Archive/by-phase/300-399/360_Phase_Page_Session_Tab_Lifecycle_Helper.md) - extracted page-session tab lifecycle helpers while preserving existing open, reload, wait, and close cleanup semantics.
- [361_Phase_Page_Session_Script_Capture_Helper.md](../../TODOs/Archive/by-phase/300-399/361_Phase_Page_Session_Script_Capture_Helper.md) - extracted page-session script execution and page snapshot helpers while preserving existing DOM, boot-data, and network observer semantics.
- [362_Phase_Page_Session_Network_Observer_Helper.md](../../TODOs/Archive/by-phase/300-399/362_Phase_Page_Session_Network_Observer_Helper.md) - extracted page-session network observer bridge helpers while preserving existing bridge install/read semantics.
- [363_Phase_Page_Session_Candidate_Tabs_Helper.md](../../TODOs/Archive/by-phase/300-399/363_Phase_Page_Session_Candidate_Tabs_Helper.md) - extracted page-session candidate-tab selection while preserving bound-tab lookup, query-only fallback, duplicate filtering, and auto priority sorting semantics.
- [364_Phase_RC15_Maintenance_Follow_Up_Packaging.md](../../TODOs/Archive/by-phase/300-399/364_Phase_RC15_Maintenance_Follow_Up_Packaging.md) - packaged the post-RC14 maintenance boundary as RC15 while preserving RC13 as the submitted review boundary.
- [365_Phase_Provider_Source_Host_Permission_Contract_Guard.md](../../TODOs/Archive/by-phase/300-399/365_Phase_Provider_Source_Host_Permission_Contract_Guard.md) - added source-only coverage for provider route hint, Settings host-origin, and manifest optional-permission alignment while keeping deferred Gemini project metrics outside host access.
- [366_Phase_First_Run_Quick_Setup_Onboarding_Focus.md](../../TODOs/Archive/by-phase/300-399/366_Phase_First_Run_Quick_Setup_Onboarding_Focus.md) - verified first-run RDP Chrome extension screenshots, added a dashboard empty-state Quick Setup action, and made hidden-provider Quick Setup deep links fall back to the Quick Setup section.
- [334_Phase_Interaction_Audit_Surface_Card_Component.md](../../TODOs/Archive/by-phase/300-399/334_Phase_Interaction_Audit_Surface_Card_Component.md) - extracted interaction-audit per-surface card rendering while preserving route-owned audit refs, preset actions, manual checks, and signoff callbacks.
- [335_Phase_Interaction_Audit_Review_Queue_Component.md](../../TODOs/Archive/by-phase/300-399/335_Phase_Interaction_Audit_Review_Queue_Component.md) - extracted interaction-audit review queue rendering while preserving route-owned queue construction and jump behavior.
- [336_Phase_Interaction_Audit_Request_Scope_Component.md](../../TODOs/Archive/by-phase/300-399/336_Phase_Interaction_Audit_Request_Scope_Component.md) - extracted interaction-audit request-scope rendering while preserving route-owned request-context state and next-command display.
- [337_Phase_Interaction_Audit_Signoff_Session_Component.md](../../TODOs/Archive/by-phase/300-399/337_Phase_Interaction_Audit_Signoff_Session_Component.md) - extracted interaction-audit signoff session rendering while preserving route-owned metadata state and summary/session hooks.
- [338_Phase_Interaction_Audit_Handoff_Summary_Component.md](../../TODOs/Archive/by-phase/300-399/338_Phase_Interaction_Audit_Handoff_Summary_Component.md) - extracted interaction-audit handoff summary rendering while preserving route-owned draft generation and copy/download handlers.
- [345_Phase_Interaction_Audit_Guidance_Card_Component.md](../../TODOs/Archive/by-phase/300-399/345_Phase_Interaction_Audit_Guidance_Card_Component.md) - extracted interaction-audit guidance rendering while preserving route-owned URL construction and link hooks.
- [346_Phase_Interaction_Audit_Workspace_Controls_Component.md](../../TODOs/Archive/by-phase/300-399/346_Phase_Interaction_Audit_Workspace_Controls_Component.md) - extracted interaction-audit workspace controls while preserving route-owned state, import parsing, and copy/download/reset handlers.
- [347_Phase_Interaction_Audit_Surface_Grid_Component.md](../../TODOs/Archive/by-phase/300-399/347_Phase_Interaction_Audit_Surface_Grid_Component.md) - extracted interaction-audit surface-grid rendering while preserving route-owned refs, readiness state, and callbacks.
- [339_Phase_Theme_Recovery_Current_State_Component.md](../../TODOs/Archive/by-phase/300-399/339_Phase_Theme_Recovery_Current_State_Component.md) - extracted theme-recovery current-state rendering while preserving route-owned snapshot construction and live action-badge reads.
- [340_Phase_Theme_Recovery_Theme_State_Component.md](../../TODOs/Archive/by-phase/300-399/340_Phase_Theme_Recovery_Theme_State_Component.md) - extracted theme-recovery theme-state rendering while preserving route-owned snapshot and live action-badge inputs.
- [341_Phase_Theme_Recovery_Request_Scope_Component.md](../../TODOs/Archive/by-phase/300-399/341_Phase_Theme_Recovery_Request_Scope_Component.md) - extracted theme-recovery request-scope rendering while preserving route-owned query parsing and request-context state.
- [342_Phase_Theme_Recovery_Provider_List_Component.md](../../TODOs/Archive/by-phase/300-399/342_Phase_Theme_Recovery_Provider_List_Component.md) - extracted theme-recovery provider-list rendering while preserving route-owned snapshot construction and recovery classification.
- [343_Phase_Theme_Recovery_Workflow_Links_Component.md](../../TODOs/Archive/by-phase/300-399/343_Phase_Theme_Recovery_Workflow_Links_Component.md) - extracted theme-recovery workflow-link rendering while preserving link ids, hrefs, target behavior, and data hooks.
- [344_Phase_Theme_Recovery_Outputs_Component.md](../../TODOs/Archive/by-phase/300-399/344_Phase_Theme_Recovery_Outputs_Component.md) - extracted theme-recovery output rendering while preserving route-owned draft generation and copy/download/open callbacks.

### 1. Direction 10 — Toolbar Competitive Fit And Store Readiness

Status: maintenance mode after RC13. Reopen only if:
- Chrome Web Store review requests changes
- a new provider or popup surface change creates a new screenshot or listing update need
- a post-launch user feedback round requires a listed-feature correction

Relevant files:
- [Doc/Roadmap/10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md](../../Roadmap/10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)
- [Doc/Roadmap/10_3_Store_Asset_Pack_And_Submission_TODOs.md](../../Roadmap/10_3_Store_Asset_Pack_And_Submission_TODOs.md)

### 2. Direction 09 — Internationalization Bootstrap And Pilot Locales

Status: `en + zh_CN` pilot is live and covers popup, dashboard, settings, provider detail, operator workspaces, duration/freshness labels, and typed diagnostic presentation. Raw adapter evidence strings and deeper operator evidence payloads remain English by policy.

Reopen if:
- a concrete diagnostic-body localization need arises
- a new locale is added beyond `en + zh_CN`
- a provider-facing string is identified as safe to localize

Relevant files:
- [Doc/Roadmap/09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md](../../Roadmap/09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)
- [Doc/Roadmap/09_3_Adapter_Diagnostic_Reason_Code_TODOs.md](../../Roadmap/09_3_Adapter_Diagnostic_Reason_Code_TODOs.md)

### 3. Direction 05 — Adaptive Theming And Color Modes

Status: real operator closure is now complete. The remaining open questions are:
- dual light-dark seed support (design decision not yet made)
- any post-launch user theme feedback that warrants a new custom-seed interaction

Reopen only when one of those decisions becomes concrete.

### 4. Direction 04 — Material, Motion, And Responsive Hardening

Status: real operator closure is now complete. The interaction-audit lifecycle is mature.

Reopen only if:
- a new surface is added that needs interaction-audit coverage
- a post-launch visual regression is found that the audit would catch

### 5. Provider Expansion

The following provider gaps remain open but are blocked by external account access or product decisions:

| Provider | Gap | Blocker |
|---|---|---|
| JetBrains AI | Org-console session reverification | Needs real org-visible `Users and licensing` session |
| Claude personal (Pro/Max) | Individual plan usage page | Account model fragmentation; separate from Team path |
| Gemini Code Assist | Live per-user metrics | Product decision: project-scoped vs personal metrics |
| Codex personal | Absolute remaining balance | Page does not expose one plan-wide absolute value |
| Cursor personal | Exact remaining included requests | Page does not expose this counter |

None of these require code changes today. They should be tracked against the relevant direction TODO files and opened when the blocker clears.

## Documentation Maintenance

The following files remain living or maintained by design. Refresh them when their tracked state changes:

- [Doc/AI_Usage_Dashboard_TODOs.md](../../AI_Usage_Dashboard_TODOs.md) — add phase history entries and update execution queue whenever a phase completes
- [Doc/Roadmap/00_Strategic_Directions_Index.md](../../Roadmap/00_Strategic_Directions_Index.md) — update priority order when direction status changes
- [Doc/TODOs/00_Phase_Index.md](../../TODOs/00_Phase_Index.md) — point to the active phase file; archive completed phase docs
- [Project Quickstart](../../Project_Quickstart.md) — update when source layout or orientation entry points change

Generated ledgers regenerate themselves via `npm run docs:refresh-generated-package-readmes` and the `interaction-audit:*` / `theme-recovery:*` scripts. Do not hand-edit them.

## What Is Explicitly Out Of Scope Now

- opening a new audit tooling phase before a concrete use case requires it
- new file-split targets without a concrete maintenance risk driving them
- claiming expanded provider support before the relevant external account is available
- adding more popup shell design work without a concrete competitive gap justifying it
