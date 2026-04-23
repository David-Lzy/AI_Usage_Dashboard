# Manual Test Checklist

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this checklist is a maintained manual-QA reference, not a frozen historical report
- refresh it whenever shipped surfaces, debug routes, request flows, or repeated review commands change

Purpose:

- provide a repeatable manual QA pass for the first integrated dashboard build

Scope:

- side panel dashboard
- provider detail pages
- settings and host-access UX
- shared refresh and persistence behavior

## 1. Test Environment

- preview URL: `http://127.0.0.1:4173/src/sidepanel/index.html`
- LAN preview URL: `http://10.10.2.202:4173/src/sidepanel/index.html`
- manual audit hub route: `http://127.0.0.1:4173/src/sidepanel/index.html#debug-interaction-audit`
- extension mode: load the unpacked build from `dist/` after `vite build`
- when reusing an existing operator Chrome profile, reload or update the unpacked extension from `chrome://extensions` after each rebuild before trusting any real-Chrome verification result
- before the final release gate on a long-lived Chrome profile, run `npx -y node@22 ./scripts/phase41-profile-audit.mjs` and confirm the installed unpacked path still points at the current repo `dist/`
- expected providers in the narrowed RC: Cursor, Claude Code, Gemini Code Assist, Codex
- JetBrains AI is retained in the repo but hidden by default and excluded from the active RC checklist unless you are explicitly validating the retained JetBrains path

## 2. Dashboard Checks

- open the manual audit hub route in a normal browser tab and confirm the embedded dashboard, settings, detail, and popup frames all load
- confirm each audit-hub preset now shows a visible expectation line below the action button so the reviewer knows what state the shortcut is meant to prove
- confirm each audit-hub surface now also shows visible `Manual checks` so the remaining human-review work is explicit before using the generated signoff pack
- confirm the audit hub now also exposes a persistent signoff workspace with live reviewed/pass/follow-up counts, per-surface signoff controls, and a live draft preview
- confirm the signoff workspace now also exposes `Reviewer name`, `Session label`, and `Reviewed at` fields plus a `Stamp current time` action
- confirm the signoff workspace now also exposes a visible `Review Queue` with `Next target`, per-surface queue state, and direct jump actions
- confirm the queue orders surfaces as `Follow-up required`, then `Not reviewed`, then `Pending checks`, then `Ready`
- confirm the audit hub now also exposes a signoff-import area so exported workspace JSON can be pasted back into the current session
- in the audit hub signoff-import area, confirm empty input and invalid JSON show explicit feedback instead of mutating the saved review state
- in the audit hub signoff-import area, paste a previously exported signoff JSON payload and confirm reviewed counts, status selectors, manual checks, and notes restore to the imported values
- in that same signoff-import flow, confirm reviewer name, session label, and reviewed-at metadata also restore from the imported payload
- when the imported payload came from a repo-backed request template or export, confirm the audit-hub session summary also restores the same request binding instead of dropping it
- reload the audit hub after a successful import and confirm the imported signoff state persists even though the paste textarea resets
- after filling the review-session fields, confirm the live signoff draft and session summary both show the same reviewer, session label, and reviewed-at values
- switch `Theme mode` and `Accent preset` in the embedded Settings audit frame and confirm the parent audit hub updates its own labels and chips without requiring a manual reload
- confirm the audit-hub root keeps the same `themeMode`, `themePreset`, and resolved theme state shown by the embedded Settings surface instead of drifting to an older saved value
- confirm the audit hub now also exposes a handoff summary with explicit `Ready for signoff`, `Follow-up surfaces`, `Not reviewed`, and `Pending checks` counts
- after changing or importing workspace state, confirm the handoff summary lists update coherently for follow-up surfaces, not-reviewed surfaces, and pending manual checks
- open `Current handoff summary` and confirm the preview reads like a real unresolved-work summary instead of repeating the full workspace draft verbatim
- confirm `Copy handoff summary` is available so the current unresolved review state can be handed off without building a separate scratch note
- confirm `Download signoff draft`, `Download signoff JSON`, and `Download handoff summary` are available in the audit hub
- after filling session metadata, confirm downloaded filenames include the reviewed date plus a sanitized session label instead of a generic untitled file name
- change a few signoff states and confirm the queue updates live, including `Next target` and the first queue item
- open `Operator handoff workflow` and confirm the audit hub now shows the review-session metadata step, the `Copy signoff JSON` step, and the reusable `npm run interaction-audit:bundle` command
- run `npm run interaction-audit:create-review-request -- --request-id 2026-04-23-first-real-operator-review-request` and confirm it writes a pending request directory under `Doc/testing/operator_review_requests/`
- open that request package and confirm `README.md`, `review-request.json`, and `interaction-audit-signoff-template.json` are all present
- confirm that same request package also includes `interaction-audit-evidence-pack.json` so the repo-backed request is self-contained after creation
- confirm the request manifest and README now also expose `Request evidence snapshot integrity` instead of only the snapshot filename
- confirm the request package is explicit that it is `pending_operator_review` and does not claim a completed human review
- confirm the request README tells the reviewer to import the template JSON into the audit hub before starting the real pass
- confirm the request manifest now preserves the expected audit shape, including surface count and total manual-check count derived from the blank template
- confirm the pending request template now preserves a bound `requestContext` with the request id and created-at timestamp, and confirm the request README shows the same binding
- confirm the create command also refreshes `Doc/testing/Interaction_Audit_Review_Requests.md` and `Doc/testing/operator_review_requests/index.json`
- confirm the generated request index now shows whether the pending request is still aligned with the current source template or has drifted out of date
- if a pending request is drifted, run `npm run interaction-audit:regenerate-review-request -- --request-id ...` and confirm the stale request becomes superseded while one aligned replacement request is generated
- import a repo-backed request template into the audit hub and confirm the `Request Scope` block switches from ad-hoc archive guidance to repo-backed preflight plus completion guidance
- after importing that same repo-backed request template, confirm the `Request Scope` block also shows the current request revision instead of only the request id
- open the downloaded signoff draft, signoff JSON, and handoff summary files and confirm each one preserves the current reviewer, session label, and reviewed-at values
- when the current workspace is bound to a repo-backed request, confirm the downloaded signoff JSON filename also includes the bound request id plus a short `rev-...` request-revision segment
- when the current workspace is bound to a repo-backed request, confirm the downloaded signoff draft and handoff summary also preserve the same `Request revision: sha256:...` line shown in the audit hub
- after downloading or copying signoff JSON into a local file, run the documented bundle command and confirm it writes both markdown and JSON bundle artifacts with matching review-session metadata
- confirm those generated bundle artifacts also preserve evidence source plus integrity summary instead of only the raw evidence path
- when that exported signoff JSON is bound to a repo-backed request, confirm both bundle artifacts also preserve the same `Request binding` and `Request revision` shown in the audit hub before completion
- after exporting signoff JSON for a repo-backed request, run `npm run interaction-audit:preflight-review-request -- --request-id 2026-04-23-first-real-operator-review-request --input tmp/operator-signoff-export.json` and confirm it reports pass or fail truthfully without mutating request or archive state
- confirm that same preflight output also reports whether the request package's `Request evidence snapshot` was read successfully instead of only checking request binding and shape
- tamper one request package's `interaction-audit-evidence-pack.json` in a temp review setup and confirm preflight now fails the `source-evidence-snapshot-integrity` gate instead of silently treating the package as unchanged
- refresh one pending request package in a temp review setup, reuse an older exported signoff JSON from before that refresh, and confirm preflight now fails the `request-revision` gate instead of silently treating the stale export as current
- after exporting signoff JSON for a repo-backed request, run `npm run interaction-audit:complete-review-request -- --request-id 2026-04-23-first-real-operator-review-request --input tmp/operator-signoff-export.json` and confirm the request manifest moves to `fulfilled_review_archived`
- fulfill one repo-backed request without `--evidence` and confirm the linked archive preserves the request package's `Request evidence snapshot` path instead of a generic fallback report path
- fulfill one repo-backed request with an explicit `--evidence ...` override in a temp review setup and confirm the linked archive preserves that actual override path instead of the request package default
- tamper one request package's `interaction-audit-evidence-pack.json` in a temp review setup and confirm completion is rejected before any archive directory is written
- try fulfilling a repo-backed request with a deliberately mismatched exported workspace shape and confirm the completion command rejects it with a concrete mismatch error instead of writing a fulfilled request
- try fulfilling a repo-backed request with a deliberately wrong or blank request binding and confirm the completion command rejects it even when the visible workspace shape still matches
- try fulfilling a repo-backed request after deliberately drifting its current source template and confirm the completion command rejects the stale request until it is regenerated
- after regenerating a stale request, confirm the old request can no longer be completed and the replacement request can be completed normally
- confirm the completion command also refreshes `Doc/testing/Interaction_Audit_Review_Requests.md`, `Doc/testing/operator_review_requests/index.json`, `Doc/testing/Interaction_Audit_Review_Archive.md`, and `Doc/testing/operator_reviews/index.json`
- after fulfilling a repo-backed request, open the new archive manifest and confirm it preserves the linked `sourceRequest.requestId`, `requestReadmePath`, and `requestManifestPath`
- after fulfilling a repo-backed request, confirm that same archive manifest and archive `README.md` also preserve the actual evidence source plus integrity summary used during completion
- after fulfilling a repo-backed request, confirm that same archive manifest and archive `README.md` also preserve the fulfilled export's `Request binding` plus `Request revision`
- after fulfilling a repo-backed request, confirm the fulfilled request manifest and request `README.md` also preserve the completed reviewer/session/reviewed-at values, completion request revision, completion evidence source, and completed export digest
- confirm the generated archive index also shows the linked source request for that archive, plus `Request binding`, `Request revision`, and evidence source plus integrity state when present, instead of leaving the archive detached from its request history
- confirm the generated request index also shows a concise completion receipt for that fulfilled request instead of only the archive link and unresolved-work summary
- if you are archiving an exported signoff JSON without a repo-backed request package, run `npm run interaction-audit:archive -- --input tmp/operator-signoff-export.json` and confirm it writes a dated review directory under `Doc/testing/operator_reviews/`
- after a manual archive edit, run `npm run interaction-audit:refresh-archive-index` and confirm the generated archive index rebuilds without hand-editing markdown
- after a manual request-manifest edit, run `npm run interaction-audit:refresh-review-request-index` and confirm the generated request index rebuilds without hand-editing markdown
- confirm any seeded archive is clearly labeled as seeded and does not pretend to be a completed human signoff
- from the audit hub, use the preset actions and confirm they prepare the intended states:
  - dashboard: focus first provider action
  - settings: open first diagnostics and focus source preference
  - detail: jump to the first note block
  - popup: focus dashboard and featured-detail actions
- confirm the dashboard loads without a blank screen or console crash
- confirm the top bar shows `AI Usage Dashboard` and the `Usage, credits, and sync health` subtitle
- confirm the browser tab or extension page resolves the shipped icon asset instead of a blank default favicon
- confirm summary pills show `Visible`, `Healthy`, `Needs Access`, and `Needs Attention`
- confirm provider cards are ordered by severity first and do not stay in fixture insertion order
- confirm a provider with missing host access shows a warning-level card treatment
- confirm cards with unknown used or remaining values still render readable quota text
- confirm `Refresh All` updates timestamps and shows a success toast

## 3. Provider Detail Checks

- open each provider card and confirm the detail page renders without layout overflow
- at compact widths, confirm long detail-field values wrap instead of forcing horizontal overflow
- confirm the detail page shows the correct sync source, quota model, reset time, and last sync time
- confirm providers with missing host access show the warning note in detail view
- confirm neutral detail notes read as a stronger supporting surface than the lighter detail-field tiles instead of blending into the parent card
- confirm providers that only expose tracked usage, but not remaining quota, show the fallback text instead of a broken numeric field
- confirm the Back action returns to the dashboard without losing state

## 4. Settings Checks

- open Settings and confirm the page uses the same Material 3 visual language as the dashboard
- confirm `Theme mode` exposes exactly `System`, `Light`, and `Dark`
- confirm `Accent preset` exposes `Default Blue`, `Meadow`, `Sunset`, and `Custom Seed`
- confirm `Custom seed color` accepts one validated `#RRGGBB` value instead of pretending to support arbitrary per-token editing
- switch `Theme mode` to `Light` and confirm the side panel stays in the light palette after a reload
- switch `Theme mode` to `Dark` and confirm the side panel plus popup both use the dark palette instead of only changing one surface
- switch `Theme mode` back to `System` and confirm the current browser or OS `prefers-color-scheme` value drives the rendered mode
- switch `Accent preset` to `Meadow` and confirm the Settings overview section label, dashboard hero chip, and popup header label all change away from the default blue accent roles
- switch `Accent preset` to `Sunset` and confirm those same accent surfaces move to the sunset palette instead of staying on the meadow or default palette
- enter a valid custom seed such as `#4F46E5`, apply it, and confirm the side panel, popup, and audit hub all switch to the same `Custom Seed` accent roles instead of keeping the last shipped preset colors
- after applying that same custom seed, confirm the Settings preview swatches match the currently active primary, secondary-container, and tertiary roles instead of showing a disconnected preview palette
- switch the custom seed theme from `Light` to `Dark` and confirm the same saved seed stays bound while the generated accent roles adapt to the dark palette instead of staying on the light values
- after applying a custom seed, confirm the popup header label, popup quick-actions label, and popup featured-section label all follow the current tertiary role instead of staying on the old preset color
- after applying a custom seed, confirm the popup `Open dashboard` and `Open detail` buttons plus the audit-hub `Open settings` link follow the current primary role instead of falling back to the default blue link treatment
- after applying a custom seed, confirm the audit-hub hero chip still follows the current secondary-container role instead of drifting away from the rest of the saved theme
- after applying a custom seed within the same explicit theme mode, confirm the popup `Snapshot Status`, `Quick Actions`, and `Popup Contract` cards keep the same neutral or warning surface treatment they had under the default preset
- after applying a custom seed within the same explicit theme mode, confirm the first popup warning provider card keeps the same warning surface treatment it had under the default preset
- after applying a custom seed within the same explicit theme mode, confirm the audit-hub `Request Scope`, `Review Queue`, `Workspace state`, first queue item, signoff-preview surface, and warning `Outstanding review work` note keep the same neutral, supporting, or warning surface treatment they had under the default preset
- after applying a custom seed within the same explicit theme mode, confirm the dashboard error summary pill plus the Claude warning or error card and Gemini warning card keep the same warning or error surface treatment they had under the default preset
- after applying a custom seed within the same explicit theme mode, confirm the Claude error status chip, error meta chip, and error progress surfaces plus the Gemini warning status chip, warning meta chip, and warning progress surfaces keep the same state-colored treatments they had under the default preset
- after applying a custom seed within the same explicit theme mode, confirm the Settings theme-customization card plus the Cursor source card keep the same neutral surface treatment they had under the default preset
- after applying a custom seed within the same explicit theme mode, confirm the Settings Cursor operational note and session note keep the same warning or supporting surface treatment they had under the default preset
- after applying a custom seed within the same explicit theme mode, confirm the provider-detail sync-status and usage cards keep the same neutral surface treatment they had under the default preset
- after applying a custom seed within the same explicit theme mode, confirm the provider-detail fidelity, contract, and trust notes keep the same warning or supporting surface treatment they had under the default preset
- after applying a custom seed within the same explicit theme mode, confirm the Codex healthy status chip and Codex neutral usage-progress fill move with the active accent roles, while the Codex neutral progress track plus fidelity and warning notes keep the same neutral or warning treatments they had under the default preset
- under the seeded recovered-state review, confirm Cursor and Codex session-page cards move from `Needs access` warning treatments back to neutral `Healthy` treatments after host access is restored, while keeping the same custom-seed palette roles in both states
- under that same seeded recovered-state review, confirm popup `Snapshot Status` moves from warning `Mixed state` to neutral `Aligned`, and the first featured provider card moves from warning to neutral without theme drift
- under the preview-interaction recovered-state review, use Settings host-access controls in browser preview mode and confirm Cursor plus Codex permission prompts move from `Host access missing` with `Request access` to `Host access granted` with `Remove access`
- under that same preview-interaction recovered-state review, confirm dashboard cards, provider detail, and popup surfaces recover from `Needs access` plus `Mixed state` back to neutral `Healthy` plus `Aligned` without changing the saved custom-seed palette roles
- run `npm run phase111:review` and confirm the extension-mode recovered-state review uses the real unpacked MV3 runtime instead of preview localStorage only
- under that same extension-mode recovered-state review, confirm degraded badge text is `2`, recovered badge text is cleared, degraded popup snapshot is `Mixed state`, and recovered popup snapshot is `Aligned`
- under that same extension-mode recovered-state review, confirm recovered `Cursor` detail shows `Apr 1 - Apr 30` while recovered `Codex` detail shows `3% used · 97% remaining` and `2026-04-23 19:45`, proving the synthetic session-page DOM was actually parsed by the extension runtime
- disable every visible provider in Settings, open the popup, and confirm the new popup guidance card says `Enable a provider in settings` with an `Open settings` action instead of only showing lower-level status cards
- leave one visible provider enabled but remove its host access, open the popup, and confirm the guidance card points back to Settings instead of forcing the user to infer the next step from featured-provider detail alone
- keep one credential-backed provider visible, force it into a real `credential missing` state, and confirm the popup guidance card says `Add credentials ...` with an `Open settings` action instead of sending the user to provider detail
- keep providers visible, then reproduce one blocked-provider state that is not a host-access prompt and confirm the popup guidance card routes to the matching provider detail instead of only showing generic quick actions
- with mixed visible providers, confirm the popup `Setup coverage` card splits the current state into `Live ready`, `Host access`, `Credentials`, and `Policy-only` counts instead of forcing the user to infer setup breadth from the featured-provider list alone
- with no visible, mixed-setup, policy-only, and healthy popup states, confirm the `Setup coverage` card now also carries the matching setup-stage label instead of leaving the user to infer stage only from the count grid:
  - `Start setup`
  - `Needs setup`
  - `Contract-only`
  - `Ready`
- reproduce one post-setup provider issue and confirm the same `Setup coverage` card can switch to `Needs review` instead of collapsing all non-ready states back into `Needs setup`
- with no visible providers, confirm the popup no longer keeps a redundant empty `Snapshot Status` card below `Setup coverage`
- with mixed-setup, policy-only, and healthy popup states, confirm `Snapshot Status` now talks about freshness only and does not repeat setup or review guidance that is already explained by the guidance card or setup-stage card
- when a popup guidance card is visible, confirm the lower actions card no longer repeats that same primary action label unchanged
- confirm the lower actions card now switches to one clearly secondary label in guided states instead of continuing to present itself as the same-level primary CTA area
- in no-visible and mixed-setup states, confirm `Open settings` appears only in the guidance card and `Open dashboard` remains the only lower secondary route
- in policy-only states, confirm `Open dashboard` stays in the guidance card while the lower secondary route becomes only `Open settings`
- in healthy states with no guidance card, confirm the lower actions card returns to the original two-button `Quick Actions` role
- confirm the popup header supporting line now changes by state instead of staying one generic sentence for all toolbar states
- confirm the popup top summary now reads `Visible / Live ready / Setup blockers / Policy-only` instead of the broader dashboard-style `Healthy / Needs Access / Needs Attention`
- in no-visible, mixed-setup, policy-only, and healthy states, confirm that top summary values match the current popup story before you read deeper cards
- in mixed-setup, needs-review, policy-only, and healthy popup states, confirm the first featured-provider card now uses popup-specific badge labels such as `Needs setup`, `Needs review`, `Contract-only`, and `Healthy` instead of falling back to generic sync-only language
- in those same states, confirm the first featured-provider card now leads with one state-first sentence and only then falls back to detailed contract or warning context, instead of opening directly with long side-panel contract prose
- in mixed-setup states, confirm the first featured-provider card CTA now routes to `Open settings` instead of repeating `Open detail`
- in needs-review states, confirm the first featured-provider card CTA now routes to `Review detail`
- in policy-only states, confirm the first featured-provider card CTA now routes to `Open dashboard`
- in healthy states, confirm the first featured-provider card keeps the lighter `Open detail` CTA
- in mixed-setup, needs-review, policy-only, and healthy popup states, confirm the first featured-provider card now keeps exactly 2 chips instead of 3
- in healthy and policy-only popup states, confirm the first featured-provider card second line no longer starts with the longer `Current shipped contract ...` prose and instead uses a shorter availability-summary sentence
- in no-visible and mixed-setup popup states, confirm the lower popup footer now says `Surface roles` with `Settings owns setup` instead of replaying one static `Popup Contract` explainer
- in needs-review, policy-only, and healthy popup states, confirm the same `Surface roles` footer switches honestly between `Provider detail owns review`, `Dashboard owns contract review`, and `Popup stays quick glance`
- at `360px` and `420px` popup widths, confirm the guidance card, setup-coverage card, snapshot-status card, and featured-provider area still read cleanly without horizontal overflow in no-visible, mixed-setup, and healthy states
- at `360px` and `420px` popup widths, confirm the same setup-stage header still reads cleanly in no-visible, mixed-setup, policy-only, and healthy popup states
- when no visible providers are enabled, confirm the featured-provider area no longer says `Needs attention`; it should instead show `Nothing to triage yet` plus an explicit empty-state card
- when visible providers are healthy, confirm the featured-provider area switches to `All clear / Healthy providers` instead of reusing the warning-oriented hierarchy
- when all visible providers are policy-only, confirm the featured-provider area switches to `Current contract / Policy-only providers` instead of implying immediate action is required
- open `http://127.0.0.1:4173/src/sidepanel/index.html#debug-theme-recovery-review` and confirm the workspace exposes theme mode, resolved mode, accent preset, custom seed, popup snapshot, scope-isolation label, and action-badge summary in one route
- on that same workspace, confirm the quick links stay bound to the shipped extension routes plus the real Cursor and Codex session-page URLs instead of stale placeholders
- run `npm run phase112:review` and confirm the workspace truthfully distinguishes all three seeded cases:
  - `Needs access`
  - `Recovered`
  - `Needs scope cleanup`
- on that same `phase112` review, confirm the summary draft reflects the same review stage and vendor links shown by the visible workspace
- on that same workspace, confirm `Download summary` and `Download JSON` are available next to the existing copy actions
- run `npm run phase113:review` and confirm the seeded archive workflow produces:
  - one stable summary filename: `theme-recovery-summary-2026-04-23-light-needs-access-custom.md`
  - one stable export filename: `theme-recovery-export-2026-04-23-light-needs-access-custom.json`
  - one durable seeded archive directory under `Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/`
- open [Theme_Recovery_Review_Archive.md](./Theme_Recovery_Review_Archive.md) and confirm the current truthful state is:
  - one seeded baseline listed
  - no real operator theme-recovery sessions archived yet
- open the seeded archive README and confirm it keeps the degraded review stage `Needs access` instead of rewriting the baseline into a claimed pass
- run `npm run theme-recovery:create-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request` and confirm it writes one pending request package under `Doc/testing/theme_recovery_review_requests/`
- open [Theme_Recovery_Review_Requests.md](./Theme_Recovery_Review_Requests.md) and confirm the current truthful state is:
  - one pending theme-recovery review request listed
  - no fulfilled theme-recovery review requests recorded yet
- open that request package README and confirm it preserves:
  - the fixed `#debug-theme-recovery-review` workspace route
  - one request-bound workspace route containing `themeRecoveryRequestId` and `themeRecoveryRequestCreatedAt`
  - the current seeded reference stage `Needs access`
  - the current seeded reference popup snapshot `Mixed state`
  - the completion command `npm run theme-recovery:complete-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request --input tmp/theme-recovery-review-export.json`
- run `npm run phase114:review` and confirm the generated request package plus generated request index remain truthful about pending status instead of claiming a completed operator pass
- run `npm run phase115:review` and confirm the repo-backed completion flow can move one temporary request from pending to fulfilled while preserving the exported `Needs access` stage instead of rewriting it into a pass
- under that same `phase115` review, confirm the temporary request index moves to `pending=0 fulfilled=1`, the temporary archive index moves to `seeded=0 operator=1`, and the temporary archive manifest preserves the `sourceRequest` link back to the fulfilled request
- open the bound workspace route from the pending request package and confirm the page shows `Request scope` with the same request id and created-at timestamp
- under that same bound workspace route, confirm the JSON export includes `requestContext` and the downloaded JSON filename gains one `request-...` suffix
- run `npm run phase116:review` and confirm a mismatched `requestId` inside a bound export is rejected while the pending request remains `pending_operator_review`
- run `npm run theme-recovery:preflight-review-request -- --request-id 2026-04-23-first-real-theme-recovery-review-request --input tmp/theme-recovery-review-export.json` against one bound export and confirm it reports `eligible=yes` without mutating request or archive state
- run `npm run phase117:review` and confirm theme-recovery preflight now proves both paths:
  - a matching bound export reports `eligible=yes`
  - a mismatched bound export reports `eligible=no`
  - the temporary request still remains `pending_operator_review`
- at `360px` width with a saved custom seed, confirm dashboard, Settings, provider detail, and popup all remain free of horizontal overflow
- at `420px` width with a saved custom seed, confirm dashboard, Settings, provider detail, and popup all remain free of horizontal overflow
- at those same compact widths, confirm Settings still keeps the sticky top bar anchored after scrolling instead of losing the action row off-screen
- at those same compact widths, confirm the saved custom seed and resolved theme mode remain identical across dashboard, Settings, provider detail, and popup instead of one route reverting to an older preset
- use `Reset to default` and confirm both the saved custom seed and the active preset return to the default accent path
- in `Dark` mode, confirm warning and error provider cards remain visually distinct from neutral cards instead of collapsing into the same dark surface
- in `Dark` mode, confirm warning and error detail notes remain readable and still differ from neutral supporting notes
- in `Dark` mode, confirm expanded diagnostic groups remain visually distinct from the outer source card and warning progress tracks remain distinct from neutral progress tracks
- change the sync interval and warning threshold, then confirm a save toast appears
- toggle provider visibility off and confirm the provider disappears from the dashboard
- toggle provider visibility back on and confirm the provider returns in severity order
- confirm the `Source Connections` section renders for all providers
- confirm each source card keeps the current path, contract, fidelity, and state in the header chips without repeating all four values again inside the visible summary grid
- confirm the visible summary grid now stays focused on preference, access model, fallback, and availability
- open `Detailed diagnostics` for at least one shipped source card and confirm the expanded content is grouped into `Source decision`, `Value semantics`, and `Trust boundary` instead of one flat field wall
- confirm each expanded diagnostic group reads as a stronger supporting surface than the outer source card instead of collapsing into the same container fill
- confirm `Session-page track` now renders as a compact block with chips, route and availability fields, and optional note text instead of a long paragraph stack
- confirm section-jump controls land the selected section below the sticky top bar instead of hiding the heading underneath it
- confirm section-jump controls scroll smoothly in the default motion-safe path
- confirm source labels are honest:
  - Cursor: `Session page` when using the logged-in personal dashboard, `Official API` when a team Admin API key is configured
  - JetBrains AI: retained repo path only; not part of the active narrowed RC promise
  - Codex: `Session page` when using the logged-in ChatGPT usage page, `Official API` when Enterprise analytics config is present
  - Gemini Code Assist: `Policy only`
- confirm planned or deferred session-page tracks do not pretend they are already active in the current build
- for Cursor and Codex, change the source preference between `Auto`, `Official API`, and `Session page`, then confirm the source card updates the active path, selection reason, and fallback reason coherently
- in unpacked extension mode, use `Find or open page` for Cursor and confirm Chrome focuses an existing dashboard usage tab or opens the expected `cursor.com/.../dashboard/usage` route
- in unpacked extension mode, use `Find or open page` for Codex and confirm Chrome focuses an existing Codex analytics tab or opens the expected ChatGPT Codex route
- after attaching a session-page provider, confirm the source card shows `Attached` plus a binding mode and binding detail instead of staying `Not bound`
- close or navigate away from an attached session-page tab, refresh again, and confirm the source card changes to `Stale binding` instead of looking like a generic parser failure
- use `Disconnect binding` for a session-page provider and confirm the source card returns to `Not bound`
- confirm toast feedback and `Detailed diagnostics` disclosure animate lightly in normal mode without causing layout shift
- confirm operational notes appear only when fallback or warning-state context needs explanation instead of showing a long note on every source card
- confirm grouped disclosure rows remain readable at compact widths and do not overflow when a section is expanded
- confirm compact session-track blocks remain readable at compact widths and do not overflow when route or graduation-gate values are long
- with reduced motion enabled in the browser or OS, confirm section jumps fall back to instant scroll and that toast plus disclosure animations no longer play
- confirm keyboard focus is visually clear on the Settings top-bar actions, section-jump chips, global-preference selects, visibility toggles, source-preference selects, disclosure toggles, and popup quick-action buttons
- confirm warning and error cards no longer mix border-only and fill-only treatments across dashboard, settings, and popup
- confirm success toast feedback now uses the same toned-surface language instead of a neutral white card treatment
- confirm toned warning, error, and success surfaces now separate primary text from subordinate supporting text instead of keeping one neutral text color inside the whole surface
- confirm pointer hover and pressed feedback are visible on the Settings top-bar actions, section-jump chips, selects, switch rows, disclosure toggles, and popup quick-action buttons
- confirm visibility switch rows now show a pointer cursor and a pressed container treatment instead of looking inert under pointer input
- confirm Settings selects now show a pressed state instead of relying on hover alone
- confirm compact chips still read as distinct roles:
  - accent hero chip
  - status badge
  - neutral meta chip
  - warning or error meta chip
  - credential-state badge
- confirm provider progress with unknown values no longer shows a fake numeric-looking fill percentage and instead renders as an explicit indeterminate pattern
- confirm determinate provider progress still exposes a measured fill and readable percentage when both used and total are known
- in unpacked extension mode, toggle host access for JetBrains and confirm Chrome shows a real permission prompt
- after granting host access, confirm the permission card badge and dashboard state update coherently
- after removing host access, confirm the permission card returns to a missing state without breaking the dashboard
- in unpacked extension mode on a real Chrome profile, open:
  - `chrome-extension://<extension-id>/src/sidepanel/index.html#debug-capture-cursor`
  - `chrome-extension://<extension-id>/src/sidepanel/index.html#debug-capture-codex`
  - `chrome-extension://<extension-id>/src/sidepanel/index.html#debug-capture-jetbrains`
- confirm the debug capture pages render and that the `Cursor` capture path does not fail with `Only permissions specified in the manifest may be requested.`
- confirm the `JetBrains` debug capture path surfaces a readable state:
  - successful capture when a real logged-in `Users and licensing` tab is open
  - `Open the JetBrains Console Users and licensing page...` when no usable org page is available
  - an account-scope failure such as `Error 400: Bad Request` should be treated as `JetBrains org access unavailable`, not as a generic "page not open" hint
- confirm settings changes persist after a preview page reload
- after a preview page reload, confirm the last saved `Theme mode` also persists instead of snapping back to `System`
- after a preview page reload, confirm the last saved `Accent preset` also persists instead of snapping back to `Default Blue`

## 5. Provider-Specific Matrix

- Cursor: confirm the personal dashboard path renders billing-period labels and on-demand usage state without inventing remaining included requests, and confirm the team Admin API path still switches the source label back to `Official API` when a key is configured
- Cursor: when `Official API` is preferred without a stored Admin API key, confirm the provider falls back to `Session page` and surfaces the fallback reason instead of hiding it
- JetBrains AI retained-path check: if you are explicitly validating the deferred JetBrains slice, confirm the dashboard and debug route show a readable distinction between `page not open`, `logged out`, and `org access unavailable`
- Claude Code: confirm analytics-derived usage renders with tracked sessions but no exact remaining quota
- Gemini Code Assist: confirm documented quota policy renders as static total quota with unknown used values and never pretends the Google Cloud metrics route is a personal remaining-quota source
- Codex: confirm the personal usage-page path renders usage-window percentages and reset times without inventing absolute credits, and confirm the Enterprise analytics path still renders daily tracked metrics when credentials are configured
- Codex: when `Session page` is preferred but the usage page is not open, confirm the provider can fall back to `Official API` if Enterprise analytics config exists, and that the fallback reason is visible in Settings and detail view
- Codex and Cursor: after a successful personal session-page sync, reload the extension page and confirm the provider reconnects from the saved binding or displays a clear `Stale binding` state when the page is gone

## 6. Empty And Failure States

- disable every provider and confirm the dashboard shows the empty-state card
- re-enable at least one provider and confirm the dashboard repopulates
- simulate initialization failure if possible and confirm the retry state renders a clear recovery path

## 7. Regression Checks

- run `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- run `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- run `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- run `npx -y node@22 ./scripts/phase19-smoke.mjs`
- run `npx -y node@22 ./scripts/phase55-multi-width-visual-review.mjs`
- run `npx -y node@22 ./scripts/phase60-compact-settings-review.mjs`
- run `npx -y node@22 ./scripts/phase61-interaction-state-review.mjs`
- run `npx -y node@22 ./scripts/phase62-status-surface-review.mjs`
- run `npx -y node@22 ./scripts/phase63-toned-content-review.mjs`
- run `npx -y node@22 ./scripts/phase64-pointer-state-review.mjs`
- run `npx -y node@22 ./scripts/phase65-chip-progress-review.mjs`
- run `npx -y node@22 ./scripts/phase66-detail-supporting-surface-review.mjs`
- run `npx -y node@22 ./scripts/phase67-interaction-audit-hub-review.mjs`
- run `npx -y node@22 ./scripts/phase68-interaction-audit-preset-review.mjs`
- run `npx -y node@22 ./scripts/phase69-interaction-audit-evidence-pack.mjs`
- run `npx -y node@22 ./scripts/phase70-interaction-audit-manual-signoff-pack.mjs`
- run `npx -y node@22 ./scripts/phase71-interaction-audit-signoff-workspace-review.mjs`
- run `npx -y node@22 ./scripts/phase72-interaction-audit-signoff-import-review.mjs`
- run `npx -y node@22 ./scripts/phase73-interaction-audit-handoff-bundle-review.mjs`
- run `npx -y node@22 ./scripts/phase74-interaction-audit-operator-bundle-review.mjs`
- run `npx -y node@22 ./scripts/phase75-interaction-audit-review-session-metadata-review.mjs`
- run `npx -y node@22 ./scripts/phase76-interaction-audit-download-export-review.mjs`
- run `npx -y node@22 ./scripts/phase77-interaction-audit-review-queue-review.mjs`
- run `npx -y node@22 ./scripts/phase78-interaction-audit-review-archive-review.mjs`
- run `npx -y node@22 ./scripts/phase79-interaction-audit-review-archive-index-review.mjs`
- run `npx -y node@22 ./scripts/phase80-interaction-audit-review-request-review.mjs`
- run `npx -y node@22 ./scripts/phase99-theme-mode-review.mjs`
- run `npx -y node@22 ./scripts/phase100-dark-theme-surface-review.mjs`
- run `npx -y node@22 ./scripts/phase101-theme-preset-review.mjs`
- run `npx -y node@22 ./scripts/phase102-interaction-audit-theme-alignment-review.mjs`
- run `npx -y node@22 ./scripts/phase103-custom-seed-theme-review.mjs`
- run `npx -y node@22 ./scripts/phase104-custom-seed-local-surface-review.mjs`
- run `npx -y node@22 ./scripts/phase105-custom-seed-surface-stability-review.mjs`
- run `npx -y node@22 ./scripts/phase106-custom-seed-main-surface-stability-review.mjs`
- run `npx -y node@22 ./scripts/phase107-custom-seed-compact-width-review.mjs`
- run `npx -y node@22 ./scripts/phase108-custom-seed-provider-state-review.mjs`
- run `npx -y node@22 ./scripts/phase109-custom-seed-recovered-state-review.mjs`
- review the generated screenshots and `phase55-results.json` under `tmp/phase55-visual-review/`
- review the generated screenshots and `phase60-results.json` under `tmp/phase60-compact-settings-review/`
- review the generated screenshots and `phase61-results.json` under `tmp/phase61-interaction-state-review/`
- review the generated screenshots and `phase62-results.json` under `tmp/phase62-status-surface-review/`
- review the generated screenshots and `phase63-results.json` under `tmp/phase63-toned-content-review/`
- review the generated screenshots and `phase64-results.json` under `tmp/phase64-pointer-state-review/`
- review the generated screenshots and `phase65-results.json` under `tmp/phase65-chip-progress-review/`
- review the generated screenshots and `phase66-results.json` under `tmp/phase66-detail-supporting-surface-review/`
- review the generated screenshot and `phase67-results.json` under `tmp/phase67-interaction-audit-hub-review/`
- review the generated screenshot and `phase68-results.json` under `tmp/phase68-interaction-audit-preset-review/`
- review the ordered screenshots, overview screenshot, and `phase69-results.json` under `tmp/phase69-interaction-audit-evidence-pack/`
- review `interaction-audit-manual-signoff.md`, the screenshot, and `phase70-results.json` under `tmp/phase70-interaction-audit-manual-signoff-pack/`
- review the workspace screenshot and `phase71-results.json` under `tmp/phase71-interaction-audit-signoff-workspace-review/`
- review the signoff-import screenshot and `phase72-results.json` under `tmp/phase72-interaction-audit-signoff-import-review/`
- review the handoff-summary screenshot, `interaction-audit-handoff-bundle.md`, and `phase73-results.json` under `tmp/phase73-interaction-audit-handoff-bundle-review/`
- review the operator-workflow screenshot, sample exported signoff JSON, generated bundle files, and `phase74-results.json` under `tmp/phase74-interaction-audit-operator-bundle-review/`
- review the metadata-aware audit screenshot, exported signoff JSON, generated bundle files, and `phase75-results.json` under `tmp/phase75-interaction-audit-review-session-metadata-review/`
- review the download-export screenshot, downloaded audit files, and `phase76-results.json` under `tmp/phase76-interaction-audit-download-export-review/`
- review the review-queue screenshot and `phase77-results.json` under `tmp/phase77-interaction-audit-review-queue-review/`
- review `phase78-results.json` and the generated archive directory under `tmp/phase78-interaction-audit-review-archive-review/`
- review the durable archive index in `Doc/testing/Interaction_Audit_Review_Archive.md` and confirm the seeded baseline entry is explicit about not being a human signoff
- review `Doc/testing/operator_reviews/index.json` and confirm the durable archive catalog matches the markdown index
- when a fulfilled request exists, confirm the matching archive entry also exposes the linked source request in both markdown and json indexes
- review `phase79-results.json` and the generated temporary archive index under `tmp/phase79-interaction-audit-review-archive-index-review/`
- review `Doc/testing/Interaction_Audit_Review_Requests.md` and confirm the pending non-seeded operator request is listed there
- review `Doc/testing/operator_review_requests/index.json` and confirm the machine-readable request catalog matches the markdown request index
- review `phase80-results.json` and the generated temporary request package under `tmp/phase80-interaction-audit-review-request-review/`
- review the screenshots and `phase99-results.json` under `tmp/phase99-theme-mode-review/`
- review the screenshots and `phase100-results.json` under `tmp/phase100-dark-theme-surface-review/`
- review the screenshots and `phase101-results.json` under `tmp/phase101-theme-preset-review/`
- review the screenshots and `phase102-results.json` under `tmp/phase102-interaction-audit-theme-alignment-review/`
- review the screenshots and `phase103-results.json` under `tmp/phase103-custom-seed-theme-review/`
- review the popup and audit screenshots plus `phase104-results.json` under `tmp/phase104-custom-seed-local-surface-review/`
- review the popup and audit screenshots plus `phase105-results.json` under `tmp/phase105-custom-seed-surface-stability-review/`
- review the dashboard, settings, and provider-detail screenshots plus `phase106-results.json` under `tmp/phase106-custom-seed-main-surface-stability-review/`
- review the compact-width dashboard, settings, provider-detail, and popup screenshots plus `phase107-results.json` under `tmp/phase107-custom-seed-compact-width-review/`
- review the dashboard, popup, and provider-detail provider-state screenshots plus `phase108-results.json` under `tmp/phase108-custom-seed-provider-state-review/`
- review the dashboard, popup, and provider-detail recovered-state screenshots plus `phase109-results.json` under `tmp/phase109-custom-seed-recovered-state-review/`
- confirm the preview URL still answers with HTTP 200 after the latest build

Exit criteria:

- dashboard, detail, and settings views all pass the checks above
- provider-specific warning states remain readable
- preview and unpacked extension builds both remain usable
