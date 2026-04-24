# AI Usage Dashboard

Chrome side-panel extension for tracking usage, credits, and sync health across AI coding tools.

Current release candidate:

- package version: `0.1.0-rc.2`
- Chrome manifest version: `0.1.0.2`
- packaged artifact: `release/ai-usage-dashboard-0.1.0-rc.2.zip`

## Current RC Matrix

| Provider | Shipped source path | Live support status | What stays unavailable |
| --- | --- | --- | --- |
| Cursor | Team Admin API or logged-in personal dashboard page | live | exact remaining included requests on the personal page |
| JetBrains AI | retained repo path for the logged-in Console page | deferred from the active RC promise | current RC does not promise JetBrains until a real org-visible `Users and licensing` session is reverified |
| Claude Code | Admin Analytics API | live | exact remaining included quota |
| Gemini Code Assist | documented quota policy | policy only | live per-user usage |
| Codex | Enterprise Analytics API or logged-in personal usage page | live | a single absolute remaining-credit balance across all visible usage windows |

## Hybrid Personal-User Status

Post-RC work now runs on shipped hybrid provider sources, not raw credential export.

Current personal-user paths:

| Provider | Current personal-user path | Current design note |
| --- | --- | --- |
| Codex | `chatgpt.com/codex/cloud/settings/analytics#usage` first, with `chatgpt.com/codex/settings/usage` still under observation | shipped as a logged-in session-page path; the proven live surface already exposes remaining percentage and reset timing in the current usage windows |
| Cursor | `cursor.com/dashboard/usage` | shipped as a logged-in session-page path for billing-period usage context, not exact remaining included requests |
| Claude Code | `claude.ai/settings/usage` | 2026-04-22 live spike redirected the current free account to `claude.ai/upgrade`; defer until a real Pro or Max usage page is captured |
| Gemini Code Assist | Google Cloud Gemini metrics page | 2026-04-22 spike confirmed a project-scoped Google Cloud console route; defer from the personal-user track unless product support expands to explicit project metrics |

Security posture for this track:

- do not persist raw cookies in extension storage
- do not ask the user to manually copy cookies or auth headers
- prefer granted host access plus page-context extraction inside already logged-in tabs
- store normalized usage snapshots, not exported session credentials

Next execution queue:

1. continue [Direction 10 - Toolbar Competitive Fit And Store Readiness](./Doc/Roadmap/10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)
2. continue [Direction 09 - Internationalization Bootstrap And Pilot Locales](./Doc/Roadmap/09_Direction_Internationalization_Bootstrap_And_Pilot_Locales.md)
3. continue [Direction 08 - Documentation Completion And Truth Audit](./Doc/Roadmap/08_Direction_Documentation_Completion_And_Truth_Audit.md) in maintenance mode only when new doc families drift

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

- `Claude`
  - graduate only after a real Pro or Max usage page is captured instead of an upgrade redirect
- `Gemini`
  - graduate only if the product explicitly accepts bound-tab project metrics as a supported contract
- `JetBrains`
  - graduate only after a real `Users and licensing` org session is reverified in the active Chrome profile

Current honesty boundaries:

- JetBrains AI remains implemented in the repo, but it is hidden by default and deferred from the active RC support promise until a real org-visible `Users and licensing` session is reverified
- Codex now ships a real `Session page` path for personal users and an `Official API` path for Enterprise workspace analytics
- Cursor now ships a real `Session page` path for personal users and an `Official API` path for team admins, but the personal path still only exposes billing-period usage context
- Codex personal usage-page sync is now explicitly labeled as `Window-only vendor value` even though the page exposes exact percentages for visible windows, because it still does not represent one absolute remaining balance across all usage windows
- Cursor personal usage-page sync is now explicitly labeled as `Window-only vendor value`
- Gemini remains `Policy only`; the observed Google Cloud metrics route is project-scoped and not treated as personal quota
- the UI now makes the trust boundary explicit in Settings and provider detail, including host-access requirements, credential persistence, and the fact that cookies stay forbidden
- the UI now makes the provider contract explicit in Settings and provider detail, including when the current live path and the retained session-page track represent different promises
- dashboard cards now also expose the current provider contract and, when relevant, the retained session-page contract so the main overview stays honest without extra drilling
- deferred tracks now also expose explicit graduation gates in Settings and provider detail so the product states what concrete evidence is still missing
- shipped session-page providers now persist safe page-binding metadata, reconnect to matching tabs across refresh or relaunch, and surface `Attached`, `Stale binding`, and `Not bound` states in the UI

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
- the repo now also ships one request-bound store-screenshot seed plus RDP capture-runner workflow, so truthful store assets can be collected from the real unpacked extension runtime without pretending the first real screenshot archive already exists
- the repo now also ships the first real archived store screenshot set, captured from `RDP Chrome` and archived with request-bound truth notes instead of preview-only mocks
- the repo now also ships one maintained store-listing copy pack anchored to that first real screenshot archive, including the preferred short description, overview paragraph, feature bullets, screenshot captions, and claim guardrails
- the repo now also ships one maintained store-listing localization source pack anchored to the current manifest, maintained listing-copy pack, and first archived screenshot set, so future translated store listings can stay aligned with the same truth boundary
- the popup runtime now also ships one explicit host-width contract for real Chrome action-popup rendering, so the browser no longer has to guess popup width from the document body
- the popup runtime now also ships one static bootstrap width contract in [src/popup/index.html](./src/popup/index.html), and repo-backed tool commands now prefer the local Node runtime through [scripts/with-preferred-node.sh](./scripts/with-preferred-node.sh) instead of relying on the older Cursor-bundled `node`
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
- the badge shows the number of visible providers currently needing attention
- the side panel remains the canonical surface for settings, source diagnostics, and provider detail

## Settings Experience

The Settings screen now starts with a compact overview and section-jump area:

- the top of Settings now summarizes visible providers, stored secrets, bound pages, and access gaps
- the Settings top bar now stays sticky so `Back` and `Save` remain reachable while scrolling
- long Settings content now exposes direct jump controls for preferences, visibility, credentials, sources, and permissions
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

The create command writes a pending request package under `Doc/testing/theme_recovery_review_requests/`. That package preserves the workspace route, the expected target providers, the expected custom-seed theme state, and one copied seeded reference export from the durable baseline archive. The preflight command is the no-mutation gate for a future real operator export: it validates request binding, bound workspace route, target providers, preset, and seed without touching request or archive records. The complete command is the truthful fulfillment path for that same package: it writes one non-seeded durable archive, links that archive back into the request receipt, and refreshes both generated indexes automatically. The current generated request index lives in [Theme_Recovery_Review_Requests.md](./Doc/testing/Theme_Recovery_Review_Requests.md), and its current truthful state is still `1` pending request plus `0` fulfilled requests because no real operator theme-recovery export has been archived yet.
When the workspace is opened through that request package's bound route, the exported summary and JSON now also preserve `requestId + requestCreatedAt`, and the downloaded filenames carry the bound request id as a suffix. Preflight and completion both reject one export whose bound request identity does not match the target pending request.

Pending operator review request:

```bash
npm run interaction-audit:create-review-request -- --request-id 2026-04-23-first-real-operator-review-request
npm run interaction-audit:preflight-review-request -- --request-id 2026-04-23-first-real-operator-review-request --input tmp/operator-signoff-export.json
npm run interaction-audit:complete-review-request -- --request-id 2026-04-23-first-real-operator-review-request --input tmp/operator-signoff-export.json
npm run interaction-audit:regenerate-review-request -- --request-id 2026-04-23-first-real-operator-review-request
npm run interaction-audit:refresh-review-request-index
```

The create command writes a pending request package under `Doc/testing/operator_review_requests/`. That request manifest now preserves both the expected audit shape derived from the blank template and a request-bound context copied into the pending template itself. Each request package now also snapshots its evidence pack into `interaction-audit-evidence-pack.json`, so the package remains self-contained after creation while still preserving the original source evidence seed path for provenance. Each package now also records the packaged snapshot digest in the request manifest and README, so preflight plus completion can reject a request whose local evidence snapshot was modified after packaging. The audit hub now preserves that bound `requestId + requestCreatedAt` context across import, local workspace state, draft generation, exported signoff JSON, request-scope guidance, and downloaded artifact filenames. The same request package now also records a `requestRevisionSha256`, so preflight plus completion can reject one export that is still bound to an older revision of the same pending request after that request package has been refreshed in place. That revision is now visible in the audit hub `Request Scope`, carried into signoff draft plus handoff summary text, preserved in bound download filenames as a short `rev-...` segment, and now also preserved through generated handoff bundles plus request-linked durable archives. Completion archives now also preserve evidence source plus integrity summary in addition to the selected evidence path, so later repo review can still tell whether the archive used a verified request snapshot or another explicit evidence source. Fulfilled request records now also preserve a compact completion receipt, including completion review-session metadata, completion request revision, completion evidence provenance, and completed export digest, so request-side audit checks can stay useful without always jumping straight to the archive. The generated request index now also surfaces whether a pending request is still aligned with the current source template or has drifted out of date. The preflight command evaluates seeded-state rejection, request binding, workspace shape, current-template drift, and the request package evidence snapshot without mutating request or archive records. The complete command reuses those same gate checks, so it will reject exported workspace state whose request binding or workspace shape does not match the target pending request, and it will also reject a stale request package whose current source template has drifted and needs regeneration first. When `--evidence` is omitted, completion now uses the pending request package's evidence snapshot by default; if you intentionally pass `--evidence`, the archive preserves that actual override path instead. The regenerate command supersedes that stale request and writes one aligned replacement request from the current source template instead of leaving request recovery as a manual repo edit, and the replacement request also snapshots its evidence pack into the new request directory. When completion succeeds, it archives the export and refreshes both the request index and archive index automatically. Archives created through that completion path also preserve the source request id and request paths inside the archive manifest and generated archive index. The current generated request index lives in [Interaction_Audit_Review_Requests.md](./Doc/testing/Interaction_Audit_Review_Requests.md), and the machine-readable request catalog lives at `Doc/testing/operator_review_requests/index.json`.

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
7. If you rebuild and keep using the same Chrome profile, go back to `chrome://extensions` and reload or update the unpacked extension before rerunning operator verification.

## Provider Credentials And Permissions

| Provider | Required credential | Required host access |
| --- | --- | --- |
| Cursor | optional Admin API key for the team path; none for the personal dashboard page | `https://api.cursor.com/*`, `https://cursor.com/*` |
| JetBrains AI | none | `https://account.jetbrains.com/*`, `https://*.jetbrains.com/*` |
| Claude Code | Admin API key | `https://api.anthropic.com/*`, `https://platform.claude.com/*` |
| Gemini Code Assist | none | none |
| Codex | none for personal usage pages; analytics API key + workspace ID for Enterprise analytics | `https://api.chatgpt.com/*`, `https://chatgpt.com/*` |

For shipped session-page providers, use `Settings -> Source Connections` to find or open the required logged-in browser page before refreshing. The same section now shows whether the provider page is attached, stale, or unbound, and lets you disconnect a saved binding explicitly.

If you are using a long-lived Chrome profile for release verification, run `./scripts/with-preferred-node.sh node ./scripts/phase41-profile-audit.mjs` after reloading the unpacked extension so the runtime host grants and stored extension state are visible before the final pass. In the narrowed RC selected on `2026-04-23`, JetBrains is retained in the repo but not part of the active release promise.

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

- `release/ai-usage-dashboard-0.1.0-rc.2.zip`

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

- [Strategic Directions Index](./Doc/Roadmap/00_Strategic_Directions_Index.md)
- [Release Packaging Guide](./Doc/Release_Packaging_Guide.md)
- [Manual Test Checklist](./Doc/testing/Manual_Test_Checklist.md)
- [Phase 27 Verification Report](./Doc/testing/Phase_27_Real_Device_Verification_Report.md)
- [Phase 41.1 Runtime Parity Report](./Doc/testing/Phase_41_1_Real_Chrome_Runtime_Parity_Report.md)
- [Phase 41.2 Final Mixed-Source Report](./Doc/testing/Phase_41_2_Final_Mixed_Source_Real_Chrome_Report.md)
- [Phase 69 Interaction Audit Evidence Pack](./Doc/testing/Phase_69_Interaction_Audit_Evidence_Pack.md)
- [Phase 70 Interaction Audit Manual Signoff Pack](./Doc/testing/Phase_70_Interaction_Audit_Manual_Signoff_Pack.md)
- [Phase 71 Interaction Audit Signoff Workspace](./Doc/testing/Phase_71_Interaction_Audit_Signoff_Workspace.md)
- [Cursor Note](./Doc/provider_notes/Cursor.md)
- [JetBrains Note](./Doc/provider_notes/JetBrains.md)
- [Claude Note](./Doc/provider_notes/Claude.md)
- [Gemini Note](./Doc/provider_notes/Gemini.md)
- [Codex Note](./Doc/provider_notes/Codex.md)
