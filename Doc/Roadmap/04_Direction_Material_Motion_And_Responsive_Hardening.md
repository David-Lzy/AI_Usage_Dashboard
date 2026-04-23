# Direction 04 - Material, Motion, And Responsive Hardening

Date: 2026-04-22

Document class:

- living strategy

Status note:

- this file is a living roadmap direction and should be refreshed when direction state, priority, or completed slices change

Execution note:

- the latest executable slice landed on `2026-04-23` through `Phase 96`

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Priority:

- `P3`

## Why This Direction Exists

The current UI is coherent and readable, but it is still closer to a well-structured release candidate than a fully polished product interface.

The most visible gaps are not brand or illustration work.
They are system-level UX gaps:

- Material fidelity is partial rather than complete
- motion is absent
- responsive behavior is narrow
- the Settings page becomes long and dense on compact widths

## Current Truth

As of 2026-04-23:

- the UI uses Material-like color, type, shape, and card roles through custom CSS tokens
- the side panel now has a small motion baseline for surface entry, toast feedback, source-card disclosure, and Settings section jumps
- `prefers-reduced-motion` is now honored for section-jump scrolling and non-essential UI animation
- the side-panel CSS now has an intermediate responsive collapse point at `max-width: 720px`, plus the older compact breakpoint at `max-width: 480px`
- the Settings page now starts with a compact overview, sticky top actions, and section-jump controls
- the Settings source cards now use progressive disclosure so dense diagnostics are no longer always expanded
- the repo now has a repeatable screenshot-based review pass for dashboard and settings at `360`, `420`, and `720`
- the repo now also has a repeatable compact Settings review pass for `360x740` and `420x900`, including reduced-motion scenarios and expanded disclosure
- the repo now also has a repeatable keyboard interaction review pass for Settings and popup surfaces
- the repo now also has a repeatable status-surface review pass for dashboard, settings, popup, and toast feedback
- the repo now also has a repeatable toned-content review pass for text hierarchy inside warning, error, and success surfaces
- the repo now also has a repeatable pointer hover plus pressed-state review pass for the main Settings and popup controls
- the repo now also has a repeatable chip-and-progress review pass across dashboard, settings, popup, and provider detail
- the repo now also has a repeatable supporting-surface review pass for provider detail plus expanded Settings diagnostics at compact widths
- the repo now also has a dedicated interaction-audit hub route with fixed-width embedded dashboard, settings, detail, and popup surfaces for real-browser QA, plus a repeatable audit-hub review pass
- the repo now also has preset-driven audit shortcuts and a repeatable audit-preset review pass, so the manual operator pass no longer has to hand-prepare the same key states inside each embedded frame
- the repo now also has an interaction-audit evidence-pack pass that records ordered preset screenshots, visible preset expectations, audit-state messages, and machine-readable state output for later operator signoff
- the repo now also has an interaction-audit signoff-pack pass that generates a reusable markdown checklist from visible per-surface manual checks plus the latest preset evidence
- the repo now also has a persistent interaction-audit signoff workspace so the in-progress operator review can be edited, reloaded, reset, and copied directly from the audit route
- the repo now also has a repeatable signoff-import review pass so exported workspace JSON can be pasted back into the audit route and restore the saved local review state during handoff
- the repo now also has a visible handoff summary plus a repeatable current-state handoff-bundle review pass, so the current workspace conclusions can be packaged with linked preset evidence instead of staying as raw local state only
- the repo now also has a reusable operator bundle-builder command plus an explicit audit-hub workflow note, so a real reviewer can turn copied signoff JSON into a current-state bundle without relying on seeded phase scripts
- the repo now also preserves explicit review-session metadata inside the audit hub, so reviewer name, session label, and reviewed-at time now survive export, reload, reset, import, and generated handoff bundles
- the repo now also lets the audit hub download signoff draft, signoff JSON, and handoff summary files directly, with metadata-aware filenames that make local operator handoff less clipboard-dependent
- the repo now also exposes a review queue with one next target and per-surface jump actions, so unresolved audit work can be navigated as a real queue instead of one long page scan
- the repo now also ships a reusable review-archive command that turns exported signoff JSON into a durable review record under `Doc/testing/operator_reviews/`, and the first archived record is a clearly labeled seeded baseline rather than a human signoff claim
- the durable review archive is now self-indexing, so the default archive command refreshes `Interaction_Audit_Review_Archive.md` plus `operator_reviews/index.json` automatically after each repo-backed archive write
- the repo now also ships a pending operator review-request flow, so the first non-seeded human interaction-audit pass can start from a durable request package with a blank importable signoff template instead of ad-hoc scratch files
- that review-request flow is now also self-indexing, and the repo now also ships a reusable completion command that fulfills one pending request by linking it to one archived exported review state instead of hand-editing request docs
- archives created through that request-completion path now also preserve their source request link, so repo-backed audit history is traceable in both directions instead of only from request to archive
- pending requests now also preserve both the expected audit shape from their blank template and a request-bound export context copied into the pending template, and completion rejects exported workspace state whose request binding or workspace shape does not match that request package
- pending requests now also surface source-template drift in the generated request index, and completion rejects stale request packages whose current template no longer matches the request they were created from
- stale pending requests can now be superseded through one regenerate command that writes an aligned replacement request and preserves the stale request as historical context instead of relying on manual repo edits
- the repo now also ships a no-side-effect request-completion preflight command, so one exported workspace can be checked for seeded-state rejection, request binding, workspace shape, and current-template drift before any request or archive record is written
- the audit hub now also makes repo-backed request scope visible and carries bound request identity into downloaded artifact filenames, so request-bound work is easier to distinguish from ad-hoc archive work before the first real human export is fulfilled
- the repo-backed request flow now also resolves source evidence truthfully, so preflight checks the request package evidence path explicitly and completion defaults to that request-bound evidence unless an explicit CLI override is supplied
- repo-backed request packages are now also self-contained because each request snapshots its evidence pack into the request directory, and preflight plus completion now prefer that package-local snapshot instead of depending on one external `tmp/` file staying available
- repo-backed request packages now also preserve a digest for that local evidence snapshot, and preflight plus completion reject a request whose packaged evidence no longer matches the digest recorded in the request manifest
- repo-backed request packages now also preserve one request-package revision digest, and preflight plus completion reject one exported workspace that is still bound to an older revision of the same pending request after that request package is refreshed in place
- that same request revision is now visible inside the audit hub request scope, preserved in signoff draft plus handoff summary text, and carried into bound download filenames as a short revision segment
- request-bound handoff bundles and durable archives now also preserve request binding plus request revision, so the same request identity survives bundle output, archive manifests, archive README files, and the generated archive index
- generated handoff bundles and durable archives now also preserve evidence source plus integrity summary, so repo-backed review history can later distinguish request snapshots from other evidence sources without reopening the original completion context
- fulfilled request records now also preserve a compact completion receipt, so request manifests, request README output, and the generated request index can all show completion review-session metadata, request revision, evidence provenance, and export digest without archive-only drill-down
- the first run of that review caught a real `360px` Settings overflow, which is now fixed in the current build
- the current Settings page is more scannable than before, source-card summaries no longer repeat the same current-state facts already shown in header chips, expanded diagnostics are grouped into clearer sections, session-page track blocks now use a compact structured layout instead of stacked paragraphs, compact reduced-motion review now has an executable baseline, the main interactive controls now share a clearer focus-visible plus state-layer treatment, the main warning, error, and success surfaces now use a more consistent tonal system, toned surfaces now also use a clearer content hierarchy, Settings selects and visibility rows now expose explicit pressed states instead of hover-only pointer feedback, compact chips now read as one more coherent system, unknown progress now renders as an explicit indeterminate state instead of a fake fixed percentage, provider-detail fields plus neutral notes now sit on a clearer supporting-surface hierarchy, compact detail values wrap explicitly, expanded Settings diagnostics now share that stronger supporting-surface tier, the repo now provides one fixed-width interaction-audit hub for the main shipped surfaces, that hub now includes preset actions plus inline audit-state feedback plus visible expectation copy plus visible manual checks plus a persistent signoff workspace plus explicit signoff-import controls plus a visible handoff summary plus an explicit operator workflow note, and supporting-surface review plus audit-hub review plus audit-preset review plus evidence-pack review plus signoff-pack review plus signoff-workspace review plus signoff-import review plus handoff-bundle review plus operator-bundle review now all have executable baselines, but the motion system is still intentionally narrow rather than comprehensive

## Direction Goal

Turn the existing UI from "Material-like and functional" into "Material-led, compact, and intentionally polished" without breaking the extension's side-panel constraints.

## Strategic Decisions

1. Keep Material 3 as the design system.
   The project should become more faithful to its chosen system, not switch to a different visual language.

2. Add motion deliberately.
   Motion should communicate state change, hierarchy, and success feedback.
   It should not become decorative noise.

3. Treat responsiveness as width and height work.
   Side panels are narrow, but they are also vertically constrained and often used in resized browser windows.

4. Optimize Settings first.
   It is the most demanding screen and the easiest place for density problems to accumulate.

## Success Criteria

- the UI still looks like one coherent product at `360px`, `420px`, and wider panel widths
- state changes feel responsive without becoming noisy
- reduced-motion users get a first-class experience
- Settings becomes materially easier to scan and operate

## Main Risks

- polishing visuals before product semantics settle
- adding motion without reduced-motion support
- overfitting to one preview width

## Child TODO

- [04_1_Direction_Material_Motion_And_Responsive_Hardening_TODOs.md](./04_1_Direction_Material_Motion_And_Responsive_Hardening_TODOs.md)
