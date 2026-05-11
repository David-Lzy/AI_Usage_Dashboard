# Next Steps — Post RC13 And Operator Closures

Date: 2026-05-11

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- living strategy

Status note:

- snapshot taken on 2026-05-11 after Direction 04 and Direction 05 real operator closures completed
- refresh this file when the Chrome Web Store review result arrives, or when a new high-priority direction opens

## What Just Closed

As of 2026-05-11 the following previously-open items are now done:

### Direction 04 — Interaction Audit Real Operator Closure

- first real RDP Chrome visual audit completed via `2026-05-11-2026-05-11-rdp-chrome-visual-audit`
- all 5 surfaces reviewed (`dashboard-360`, `settings-420`, `cursor-detail-360`, `codex-detail-420`, `popup-360`), all 11 manual checks resolved
- pending request `2026-04-23-first-real-operator-review-request` fulfilled and archived
- archive: [Doc/testing/operator_reviews/2026-05-11-2026-05-11-rdp-chrome-visual-audit/](./testing/operator_reviews/2026-05-11-2026-05-11-rdp-chrome-visual-audit/README.md)

### Direction 05 — Theme Recovery Real Operator Closure

- first real operator theme-recovery export completed on display `:10` RDP Chrome
- theme: System mode, custom preset, seed `#4F46E5`, resolved light — stage `Recovered`
- both target providers (Cursor + Codex) confirmed granted and healthy
- pending request `2026-04-23-first-real-theme-recovery-review-request` fulfilled and archived
- archive: [Doc/testing/theme_recovery_reviews/2026-05-11-system-recovered-014312/](./testing/theme_recovery_reviews/2026-05-11-system-recovered-014312/README.md)

## Current Blocking Priorities

### P0 — Chrome Web Store Upload (Human-Owned)

The package `release/ai-usage-dashboard-0.1.0-rc.13.zip` is the current upload candidate. This is a human task in the Chrome Web Store Developer Dashboard.

Current source is now ahead through `Phase 305`, but those post-`rc.13` runtime and Settings polish changes are intentionally not part of the current upload candidate until review feedback or an explicit release decision says otherwise.

Reference: [Doc/Milestones/2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md](./Milestones/2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md)

Remaining human steps:
- upload the package zip
- attach the 5 reviewed screenshots from [2026-05-04-rc11-mixed-store-candidate-archive](./testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
- fill the listing form using [Store_Listing_Copy_Pack.md](./Store_Listing_Copy_Pack.md)
- answer privacy and permission disclosures truthfully against the RC13 support boundary

No additional code changes are needed before this upload unless review feedback requires them.

### P1 — Respond To Chrome Web Store Review Feedback

If Chrome Web Store review returns with a request for code, icon, manifest, or listing changes, cut a new RC at that point. Do not preemptively bump the RC version.

If the review passes with no changes, the upload task is done and the priority shifts to the items below.

## Next Engineering Work (After Store Upload Clears)

Priority is taken from `00_Strategic_Directions_Index.md` active continuation order:

### 1. Direction 10 — Toolbar Competitive Fit And Store Readiness

Status: maintenance mode after RC13. Reopen only if:
- Chrome Web Store review requests changes
- a new provider or popup surface change creates a new screenshot or listing update need
- a post-launch user feedback round requires a listed-feature correction

Relevant files:
- [Doc/Roadmap/10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md](./Roadmap/10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)
- [Doc/Roadmap/10_3_Store_Asset_Pack_And_Submission_TODOs.md](./Roadmap/10_3_Store_Asset_Pack_And_Submission_TODOs.md)

### 2. Direction 09 — Internationalization Bootstrap And Pilot Locales

Status: `en + zh_CN` pilot is live and covers popup, dashboard, settings, provider detail, operator workspaces, duration/freshness labels, and typed diagnostic presentation. Raw adapter evidence strings and deeper operator evidence payloads remain English by policy.

Reopen if:
- a concrete diagnostic-body localization need arises
- a new locale is added beyond `en + zh_CN`
- a provider-facing string is identified as safe to localize

Relevant files:
- [Doc/Roadmap/09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md](./Roadmap/09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)
- [Doc/Roadmap/09_3_Adapter_Diagnostic_Reason_Code_TODOs.md](./Roadmap/09_3_Adapter_Diagnostic_Reason_Code_TODOs.md)

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

- [Doc/AI_Usage_Dashboard_TODOs.md](./AI_Usage_Dashboard_TODOs.md) — add phase history entries and update execution queue whenever a phase completes
- [Doc/Roadmap/00_Strategic_Directions_Index.md](./Roadmap/00_Strategic_Directions_Index.md) — update priority order when direction status changes
- [Doc/TODOs/00_Phase_Index.md](./TODOs/00_Phase_Index.md) — point to the active phase file; archive completed phase docs
- [Project Quickstart](./Project_Quickstart.md) — update when source layout or orientation entry points change

Generated ledgers regenerate themselves via `npm run docs:refresh-generated-package-readmes` and the `interaction-audit:*` / `theme-recovery:*` scripts. Do not hand-edit them.

## What Is Explicitly Out Of Scope Now

- opening a new audit tooling phase before a concrete use case requires it
- new file-split targets without a concrete maintenance risk driving them
- claiming expanded provider support before the relevant external account is available
- adding more popup shell design work without a concrete competitive gap justifying it
