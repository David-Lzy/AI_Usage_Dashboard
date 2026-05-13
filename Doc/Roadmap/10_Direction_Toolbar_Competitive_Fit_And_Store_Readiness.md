# Direction 10 - Toolbar Competitive Fit And Store Readiness

Date: 2026-04-26

Document class:

- living strategy

Status note:

- this file is a living roadmap direction and should be refreshed when direction state, priority, or completed slices change

Execution note:

- first executable slice landed on `2026-04-24` through `Phase 141`
- second executable slice landed on `2026-04-24` through `Phase 142`
- third executable slice landed on `2026-04-24` through `Phase 143`
- fourth executable slice landed on `2026-04-24` through `Phase 144`
- fifth executable slice landed on `2026-04-24` through `Phase 145`
- sixth executable slice landed on `2026-04-24` through `Phase 146`
- seventh executable slice landed on `2026-04-24` through `Phase 147`
- eighth executable slice landed on `2026-04-24` through `Phase 148`
- ninth executable slice landed on `2026-04-24` through `Phase 149`
- tenth executable slice landed on `2026-04-24` through `Phase 150`
- eleventh executable slice landed on `2026-04-24` through `Phase 151`
- twelfth executable slice landed on `2026-04-24` through `Phase 152`
- thirteenth executable slice landed on `2026-04-24` through `Phase 153`
- documentation-only planning expansion landed on `2026-04-24` through `Phase 154` by formalizing the next Direction 10 execution map into explicit child TODO docs for surface expansion plus ambient theme controls and store asset-pack follow-through
- fourteenth executable slice landed on `2026-04-24` through `Phase 155`
- fifteenth executable slice landed on `2026-04-24` through `Phase 156`
- sixteenth executable slice landed on `2026-04-24` through `Phase 157`
- seventeenth executable slice landed on `2026-04-24` through `Phase 158`
- eighteenth executable slice landed on `2026-04-24` through `Phase 159`
- nineteenth executable slice landed on `2026-04-24` through `Phase 160`
- twentieth executable slice landed on `2026-04-24` through `Phase 161`
- twenty-first executable slice landed on `2026-04-24` through `Phase 162`
- twenty-second executable slice landed on `2026-04-24` through `Phase 163`
- twenty-third executable slice landed on `2026-04-24` through `Phase 164`
- twenty-fourth executable slice landed on `2026-04-24` through `Phase 165`
- twenty-fifth executable slice landed on `2026-04-24` through `Phase 166`
- twenty-sixth executable slice landed on `2026-04-24` through `Phase 167`
- twenty-seventh executable slice landed on `2026-04-24` through `Phase 168`
- twenty-eighth executable slice landed on `2026-04-24` through `Phase 169`
- compact popup progress-density follow-up landed on `2026-04-26` through `Phase 209`
- per-surface progress-style preference follow-up landed on `2026-04-26` through `Phase 210`
- popup appearance preference follow-up landed on `2026-04-26` through `Phase 211`
- popup appearance preview follow-up landed on `2026-04-27` through `Phase 212`
- this direction sharpens [Direction 06 - Toolbar Product Benchmark And Discoverability](./06_Direction_Toolbar_Product_Benchmark_And_Discoverability.md) into a more explicit next-stage productization track

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Priority:

- `P1`

## Why This Direction Exists

The popup is no longer missing.
It is already shipped and materially better than before.

The next question is:

- is the current toolbar surface competitive enough against the best available extensions
- and is the product story ready for store-facing assets, screenshots, and one-click user expectations

This is now a distinct direction because the project already has:

- a real popup
- a real badge
- stateful onboarding
- stateful featured-provider routing
- a first benchmark matrix

So the remaining work is not popup shell design.
It is competitive fit, screenshot-ready polish, and store readiness.

## Current Truth

As of 2026-04-24:

- the popup already has a compact setup story, featured-provider story, and stateful CTA hierarchy
- one toolbar benchmark matrix already exists:
  - [Toolbar_Product_Benchmark_Matrix_2026-04-23.md](../Archive/benchmarks/Toolbar_Product_Benchmark_Matrix_2026-04-23.md)
- the repo now also ships one explicit competitive-fit decision matrix:
  - [Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md](../Archive/benchmarks/Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md)
- the repo now also ships one maintained screenshot storyboard pack for truthful store captures:
  - [Store_Screenshot_Storyboard.md](../Store/Store_Screenshot_Storyboard.md)
- the repo now also ships one maintained screenshot-capture runbook plus one generator-backed baseline capture pack:
  - [Store_Screenshot_Capture_Runbook.md](../testing/Store_Screenshot_Capture_Runbook.md)
  - [Store_Screenshot_Capture_Packs.md](../testing/Store_Screenshot_Capture_Packs.md)
- the repo now also ships one pending screenshot-capture request workflow:
  - [Store_Screenshot_Capture_Requests.md](../testing/Store_Screenshot_Capture_Requests.md)
- the repo now also ships one completion and archive workflow for future real screenshot sets:
  - [Store_Screenshot_Capture_Archive.md](../testing/Store_Screenshot_Capture_Archive.md)
- the repo now also ships request-bound capture notes plus archive-preserved truth-note metadata for future real screenshot sets
- the repo now also ships one verified RDP Chrome runtime-capture helper for popup and sidepanel smoke captures
- the repo now also ships one request-bound screenshot-seed route plus one RDP capture runner that can apply stable storyboard states to the real unpacked extension runtime before each requested capture
- the repo now also ships one fast-fail timeout plus stale-probe cleanup path for RDP capture commands, so failed X11 probes do not leave the workflow hanging indefinitely
- the repo now also ships the first real archived screenshot set produced from the current request/archive workflow
- the repo now also ships one maintained store-listing copy pack anchored to that archived screenshot set
- the repo now also ships one maintained store-listing localization source pack anchored to the current manifest, maintained listing-copy pack, and first archived screenshot set
- the popup runtime now also ships one explicit host-width contract for real Chrome action-popup rendering instead of depending on browser-guessed document width
- the popup runtime now also ships one static bootstrap width contract in `src/popup/index.html`, so the real action popup can claim its intended width before React boot and before runtime class mutation
- repo-backed tool commands now also prefer one local current Node runtime through `scripts/with-preferred-node.sh`, so `npm run build`, `npm run typecheck`, and `npm run test` no longer depend on the older Cursor-bundled `node`
- the popup has now recovered from the earlier narrow-width action-popup failure in real Chrome, but current RDP review still shows it as visually sparse and vertically card-heavy
- the popup now also renders structured usage-window percentages as compact circular remaining progress indicators, reducing long quota text in the small toolbar surface
- the popup now also enters a quota-first layout when provider quota cards exist, and quota progress can be independently configured as line or circle on popup, sidebar, and full-page tab
- the popup now also supports our own Settings-controlled appearance presets for size, corners, and shadow without adopting another extension's visual style or changing sidebar/full-page behavior
- Settings now also previews the selected popup size, corner, and shadow treatment before native toolbar-popup reopen
- the user has now explicitly fixed the next product contract:
  - popup stays compact and task-focused
  - side panel stays richer and operational
  - full-page shell becomes a separate extension surface
  - popup and side panel both get one near-surface light-dark toggle
- the repo now also ships one maintained implementation contract for that next surface work:
  - [Surface_Expansion_And_Ambient_Theme_Controls.md](../Product/Surface_Expansion_And_Ambient_Theme_Controls.md)
- the repo now also ships two execution-ready child TODO docs for the next Direction 10 work:
  - [10_2_Surface_Expansion_And_Ambient_Theme_Controls_TODOs.md](./10_2_Surface_Expansion_And_Ambient_Theme_Controls_TODOs.md)
  - [10_3_Store_Asset_Pack_And_Submission_TODOs.md](./10_3_Store_Asset_Pack_And_Submission_TODOs.md)
- the repo now also ships one shared route-entry contract for the future full-page shell:
  - sidepanel and future full-page tab routes now share one helper-backed path model
  - route-preserving full-page state is now carried through `src/sidepanel/index.html?surface=full-page#...`
  - the current preview review now covers dashboard, settings, and provider-detail full-page states without duplicating the main app entry
- the popup now also ships one compact header expand control that opens the dashboard full-page tab through that shared full-page contract
- the sidepanel now also ships one compact top-bar expand control across dashboard, settings, and provider-detail routes:
  - it opens the shared full-page shell while preserving the current route
  - it stays hidden once the runtime is already inside `?surface=full-page`
- the popup header and standard sidepanel routes now also ship one near-surface light-dark toggle:
  - popup owns one compact header toggle
  - sidepanel and standard full-page routes inherit the shared top-bar toggle
  - the toggle moves `system` mode into the opposite explicit mode of the currently resolved runtime theme
  - preset accents and custom-seed state remain unchanged
- the standard full-page shell now also carries one restrained source-aware entry-motion hint:
  - popup expand drives one top-centered scale-plus-rise treatment on dashboard-tab open
  - sidepanel expand drives one left-origin slide-plus-scale treatment on route-preserving full-page entry
  - reduced-motion mode disables those entry animations entirely
- the repo now also ships one runtime-window cleanup helper plus one refreshed real RDP runtime surface review:
  - popup, sidepanel settings, and full-page dashboard/settings/provider-detail now have one current extension-mode QA capture set after the shipped expand, theme, and motion slices
  - the RDP helpers now close the extension windows they opened, reducing repeated-capture OOM risk
  - popup smoke capture remains QA-only evidence because the helper opens the popup route in its own extension app window rather than the native toolbar bubble
- the current boundary is now explicit:
  - popup header expand owns the full-page dashboard jump
  - sidepanel top-bar expand owns route-preserving full-page shell entry for standard operational routes
  - quick theme toggle owns explicit light-dark flips only
  - full theme configuration still belongs to Settings
  - the next execution line now moves to `Direction 10.3` store asset-pack refresh after the updated runtime evidence
- the repo still does not yet ship localized listing variants or a submitted store asset pack beyond the first archived evidence plus English source documents
- the first screenshot archive plus current listing-copy docs now serve as a pre-refresh baseline rather than the final store-submission pack after `Phase 161`
- the repo now also ships one refreshed pending screenshot-capture request package for the post-surface-expansion store asset set:
  - [2026-04-24-surface-expansion-store-screenshot-refresh-request/README.md](../testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/README.md)
  - slots `1` through `3` require native toolbar-bubble popup capture
  - slots `4` and `5` require full-page-shell depth capture
- the repo now also ships one native-toolbar popup probe result:
  - current `RDP Chrome` does not expose the real popup bubble as one separate capturable X11 top-level window
  - helper-window evidence is valid for diagnosis, not as the final store popup screenshot replacement
- the repo now also ships one hybrid refreshed-request staging path:
  - the current pending request now includes one generated `capture-plan.json`
  - popup slots `1` through `3` remain manual native-toolbar capture
  - full-page slots `4` and `5` are already staged as request-bound full-page-shell captures inside the pending request package
- the repo now also ships one manual screenshot handoff path for that refreshed request:
  - the current pending request now includes `manual-capture-handoff.md` plus `manual-capture-handoff.json`
  - those generated handoff files now summarize `3` remaining manual popup slots, `2` staged full-page slots, and one explicit archive-readiness state
- the project now has an RDP Chrome environment available for truthful extension-mode capture and review
- the current screenshot state is now `1 pending request / 1 archived set`, with the pending request already carrying `2` staged full-page captures and `3` remaining manual popup slots

External signals:

- Chrome's `action` popup model rewards quick, compact, click-first surfaces
- Chrome Web Store discovery guidance emphasizes pleasant design, clear purpose, and ease of use
- current competitors already market toolbar-first value, remembered state, multi-language support, and faster setup recognition

## Direction Goal

Turn the current popup from "already shipped and increasingly polished" into one clearly competitive, store-ready toolbar product surface.

## Strategic Decisions

1. Benchmark against surface behavior, not hidden data tactics.
   Competitor use of internal APIs or more aggressive collection does not automatically change this product's trust model.

2. Keep popup scope compact.
   The side panel remains the deep workspace.
   The popup should win on clarity, not on feature count.

3. Use RDP Chrome as the primary truthful capture environment.
   Store screenshots and last-mile popup QA should prefer the real unpacked extension runtime.

4. Align screenshots, listing copy, and popup behavior.
   The store should promise exactly what the popup and side panel now actually do.

5. Treat setup story as the main competitive differentiator.
   The popup should make first-run, blocked, policy-only, and healthy states legible faster than competing surfaces.

## Success Criteria

- one toolbar click communicates value and next step within seconds
- popup copy, badge meaning, and screenshot story all match
- the repo has a reusable store-readiness pack for screenshots and listing structure
- extension-mode screenshots are captured from a truthful runtime, not only from browser preview
- benchmark refreshes make explicit which competitor behaviors are adopted, adapted, or rejected

## Main Risks

- adding too many store-facing promises before the product contract is stable
- letting screenshot polish drift away from actual shipped states
- comparing against competitor claims without preserving the current trust boundary
- continuing popup micro-polish without deciding what the store story actually is

## Recommendation

This direction has reached the current upload-candidate handoff for `0.1.0-rc.13`.

Completed rollout:

1. shipped popup plus sidepanel plus full-page surface expansion from the route-preserving full-page shell
2. refreshed RDP Chrome runtime QA and user visual smoke evidence across the relevant surfaces
3. refreshed screenshot selection and screenshot ordering against the new surfaces
4. completed the mixed screenshot archive and trimmed transparent icon refresh
5. recorded the [RC13 Chrome Web Store upload-candidate milestone](../Milestones/2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md)

Next work should be review-feedback or listing-change follow-up after the human Chrome Web Store upload starts, not more local store-readiness mechanism unless the listing flow exposes a real gap.

`Phase 141` completed the first executable part of steps `1` and `3` by shipping one current competitive-fit decision matrix with explicit `adopt / adapt / reject` outcomes and one maintained screenshot storyboard pack for truthful extension-mode capture.

`Phase 142` completed the next executable part of step `3` by shipping one maintained screenshot-capture runbook, one generator-backed baseline capture pack, and one repeatable review pass for the store screenshot workflow.

`Phase 143` completed the next executable part of step `3` by shipping one pending screenshot-capture request workflow, so the first real RDP Chrome store-capture pass now has one durable request package instead of only a runbook.

`Phase 144` completed the next executable part of step `3` by shipping one completion plus archive workflow for store screenshot capture, so the first future real screenshot set now has a truthful repo-backed way to move from `pending request` to `archived evidence`.

`Phase 145` completed the next executable part of step `3` by verifying that the real RDP Chrome session can open and capture popup plus sidepanel runtime windows directly, so the remaining blocker to the first real screenshot archive is now truthful state selection rather than unknown GUI plumbing.

`Phase 146` completed the next executable part of step `3` by adding request-bound capture notes plus archive-preserved truth-note metadata, so the first future real screenshot archive can now record omissions, approximations, and fallback contract states without losing them between request and archive.

`Phase 147` completed the next executable part of step `3` by shipping one request-bound screenshot seed plus runtime-lock workflow and one RDP capture runner, so the first future real screenshot archive can now reproduce the storyboard states in the real unpacked extension runtime without those states being silently overwritten by normal background sync.

`Phase 148` completed the next executable part of step `3` by adding fast-fail X11 command timeouts plus one stale-probe cleanup command for the RDP capture workflow, so failed capture attempts now terminate clearly instead of hanging the shell indefinitely.

`Phase 149` completed the next executable part of step `3` by capturing and archiving the first real RDP Chrome screenshot set, turning the screenshot workflow from a prepared lifecycle into one proven archived evidence path.

`Phase 150` completed the next executable part of step `4` by turning that first archived screenshot set into one maintained listing-copy pack, so the store-readiness line now has a truthful title/summary/caption source instead of only screenshots plus storyboard notes.

`Phase 151` completed the first executable part of step `5` by turning that maintained English listing copy into one stable localization source pack with string ids, truth anchors, and translation guardrails, so future listing-localization work now has a truthful source document that stays separate from in-product i18n claims.

`Phase 152` completed the next executable part of step `2` by locking the popup host-width contract to the real action-popup surface, so last-mile runtime review no longer depends on Chrome guessing the popup body's preferred width.

`Phase 153` completed the next executable part of step `2` by moving that popup width contract into the static popup HTML bootstrap and by routing repo-backed commands through one preferred local Node wrapper, so the real action popup no longer depends on post-boot class mutation and the build no longer depends on the older bundled runtime.

`Phase 154` then formalized the next execution map by turning the agreed popup plus sidepanel plus full-page contract and the next store-asset follow-through into explicit TODO docs instead of leaving those next slices implicit.

`Phase 155` completed the first runtime slice under that new plan by shipping a shared route-entry contract for full-page shell state through the existing sidepanel entry, plus one repeatable review for dashboard, settings, and provider-detail full-page preview states. The next product slice is now the actual popup expand CTA to the dashboard full-page tab.

`Phase 156` completed that popup expansion slice by shipping one compact popup-header expand control that opens the dashboard full-page tab through the shared full-page route contract, while intentionally leaving the existing popup quick-action sidepanel handoff semantics unchanged.

`Phase 157` completed the next product slice by shipping one compact sidepanel top-bar expand control that preserves the current dashboard, settings, or provider-detail route when opening the shared full-page shell, while hiding that control when the runtime is already in full-page mode.

`Phase 158` completed the next product slice by shipping one popup plus sidebar ambient light-dark toggle that also carries into the standard full-page shell, while keeping `system`, preset accents, and custom-seed configuration inside Settings as the only advanced theme surface.

`Phase 159` completed the next product slice by turning popup-expand and sidepanel-expand into source-aware full-page entry motion hints, so the standard full-page shell now gets one restrained continuity treatment without pretending to ship a brittle true shared-element transition. Reduced-motion mode keeps those full-page entry animations disabled.

`Phase 160` completed the next product slice by refreshing real RDP runtime captures for popup, sidepanel settings, and standard full-page dashboard/settings/provider-detail surfaces while adding runtime-window cleanup into the helper workflow. That keeps the current QA evidence aligned with the shipped expand, quick-theme, and motion work and reduces repeat-capture OOM risk.

`Phase 161` completed the first `Direction 10.3` slice by turning the first screenshot archive into an explicit selection and stale-review pack, updating the storyboard to prefer native toolbar-bubble popup capture plus full-page-shell depth capture, and marking the current listing-copy documents as pre-refresh baselines rather than the final submission pack.

`Phase 162` completed the next `Direction 10.3` slice by turning that stale-review decision into one refreshed pending screenshot-capture request, tightening the request generator around `manual_capture_required` popup slots, and preserving fulfilled historical request semantics during package refresh. The next product slice was then to probe popup automation boundaries and stage only the remaining request-bound depth captures before final archive completion.

`Phase 163` completed the next `Direction 10.3` slice by turning native-toolbar popup uncertainty into one truthful probe result: the current `RDP Chrome` runtime does not expose the real toolbar bubble as a separate capturable X11 top-level window, so the repo now keeps one helper-window evidence path instead of pretending popup automation is already solved. That keeps slots `1` through `3` manual in the refreshed request while leaving the deeper full-page slots ready for the next archive slice.

`Phase 164` completed the next `Direction 10.3` slice by adding one generated `capture-plan.json` plus one hybrid request-bound capture runner that stages only the full-page-shell depth slots inside the refreshed pending request. The repo now keeps slots `1` through `3` manual native-toolbar popup capture, stages slots `4` and `5` as truthful request-bound full-page-shell evidence, and leaves the request pending until the remaining manual popup captures are assembled into the next archive.

`Phase 165` completed the next `Direction 10.3` slice by turning that pending request into one explicit manual-capture handoff plus archive-readiness preflight. The refreshed request package now generates one dedicated `manual-capture-handoff.md` and `manual-capture-handoff.json`, one operator-facing command can refresh that handoff in place, and the repo now keeps the remaining popup work honest as `3` unresolved manual native-toolbar slots instead of burying it inside the larger pending package.

`Phase 166` completed the next `Direction 10.3` slice by turning that manual handoff into one repo-backed import workflow. The refreshed pending request now exposes `manualImportCommand` plus `manualImportWithNotesCommand`, one operator can copy real native-toolbar popup files and an optional popup-note overlay back into the request package without hand-editing the generated files, and the handoff can now refresh its own `manualCaptureMissingCount`, `manualNoteIncompleteCount`, `manualReadyCount`, and `archiveReady` state after a real popup-capture pass.

`Phase 167` completed the next `Direction 10.3` slice by turning that import path into one fuller manual-popup intake bundle. The refreshed pending request now also generates a request-bound `manual-popup-notes-overlay.template.json` plus `manual-popup-capture-checklist.md`, and the notes-import command now points at that generated template path instead of only a generic placeholder.

`Phase 168` completed the next `Direction 10.3` slice by turning screenshot-request completion into one request-bound default path. Once real popup captures have been imported back into the pending request package, completion no longer needs a separate `--captures-dir` argument; the repo now proves through a temp review fixture that `store:complete-screenshot-capture-request -- --request-id ...` can archive directly from the request package itself.

`Phase 169` completed the next `Direction 10.3` slice by turning that import-plus-complete chain into one request-bound finalize command. The refreshed pending request now exposes `manualFinalizeCommand` plus `manualFinalizeWithNotesCommand`, so once the real native-toolbar popup files exist the operator can import them, validate archive readiness, and complete the request in one repo-backed step. The real repo still remains `1 pending request / 1 archived set`, so the next product slice is still the actual popup capture itself rather than another workflow invention.

## References

- Chrome `action` API:
  https://developer.chrome.com/docs/extensions/reference/api/action
- Chrome Web Store discovery:
  https://developer.chrome.com/docs/webstore/discovery/
- Chrome Web Store best listing:
  https://developer.chrome.com/docs/webstore/best-listing
- `Ai Usage 100%` listing:
  https://chromewebstore.google.com/detail/ai-usage-100%25/jjlkgogdgdflbifbmojbmleifblpekid
- `Ai Usage 100%` listing mirror:
  https://chrome-stats.com/d/jjlkgogdgdflbifbmojbmleifblpekid
- `QuotaMeter` listing:
  https://chromewebstore.google.com/detail/quotameter/mbbkamghkbadgggdnjpflfobkfaepbbo
- [Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md](../Archive/benchmarks/Toolbar_Competitive_Fit_Decision_Matrix_2026-04-24.md)
- [Store_Screenshot_Storyboard.md](../Store/Store_Screenshot_Storyboard.md)
- [Store_Screenshot_Capture_Runbook.md](../testing/Store_Screenshot_Capture_Runbook.md)
- [Store_Screenshot_Capture_Packs.md](../testing/Store_Screenshot_Capture_Packs.md)
- [Store_Screenshot_Capture_Requests.md](../testing/Store_Screenshot_Capture_Requests.md)
- [Store_Screenshot_Capture_Archive.md](../testing/Store_Screenshot_Capture_Archive.md)

## Child TODO

- [10_1_Direction_Toolbar_Competitive_Fit_And_Store_Readiness_TODOs.md](./10_1_Direction_Toolbar_Competitive_Fit_And_Store_Readiness_TODOs.md)
- [10_2_Surface_Expansion_And_Ambient_Theme_Controls_TODOs.md](./10_2_Surface_Expansion_And_Ambient_Theme_Controls_TODOs.md)
- [10_3_Store_Asset_Pack_And_Submission_TODOs.md](./10_3_Store_Asset_Pack_And_Submission_TODOs.md)
