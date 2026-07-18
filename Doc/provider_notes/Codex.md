# Codex Provider Note

Date: 2026-07-14

Process rule:

- follow [CONTRIBUTING.md](../../CONTRIBUTING.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this provider note should track the current selected source path, support boundary, and official-source basis for Codex
- refresh it whenever the chosen source path, active release promise, or relevant official docs change

## 1. Decision

Selected MVP source path:

- `A2`: official Codex Analytics API for Enterprise workspaces

Selected MVP support scope:

- ChatGPT Enterprise workspaces with Codex enabled
- Codex Cloud enabled in the workspace
- analytics-capable API access for the workspace

Deferred from MVP:

- ChatGPT Plus / Pro / Go / Free personal plans
- ChatGPT Business workspace billing page parsing
- workspace credit-balance scraping from the ChatGPT billing UI
- local-only Codex usage as a primary source

Reason:

- the OpenAI governance docs now make the Enterprise analytics path explicit enough to support a defensible live integration
- the analytics path exposes real daily usage metrics programmatically
- the analytics path still does not expose exact remaining workspace credits, so the adapter must stay analytics-only and keep `remaining` as `null`

## 2. Official Sources Reviewed

Reviewed on 2026-04-21 using official OpenAI documentation:

- Governance:
  - https://developers.openai.com/codex/enterprise/governance
- Using Codex with your ChatGPT plan:
  - https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan/
- Flexible pricing for the Enterprise, Edu, and Business plans:
  - https://help.openai.com/en/articles/11487671-flexible-pricing-for-the-enterprise-edu-and-team-plans
- ChatGPT Enterprise overview:
  - https://help.openai.com/en/articles/8265053-what-is-chatgpt-enterprise

## 3. Selected Source Path

Chosen source surface:

- `GET https://api.chatgpt.com/v1/analytics/codex/workspaces/{workspace_id}/usage`

Headers and access assumptions:

- `Authorization: Bearer <analytics_api_key>`
- workspace-scoped analytics key
- `api.chatgpt.com` extension host access

Why this is the MVP path:

- governance docs describe an Analytics API specifically for Codex
- the documented analytics scope includes daily totals for `threads`, `turns`, and `credits`
- the help article explicitly says Codex Enterprise Analytics is available for Enterprise workspaces with Codex enabled

Why Business parsing is deferred:

- flexible pricing and billing surfaces are documented, but the current docs do not provide a stable public JSON contract for the billing UI
- the analytics API is narrower, but materially more stable and easier to defend long term

## 4. What The Official Docs Say

Analytics coverage:

- Codex offers three governance surfaces:
  - analytics dashboard
  - analytics API
  - compliance API
- the Analytics API provides daily time-series metrics for a workspace
- the documented metrics include:
  - daily totals for `threads`
  - daily totals for `turns`
  - daily totals for `credits`
- results are daily, time-windowed, and paginated

Plan and access scope:

- Codex Enterprise Analytics is available to Enterprise workspaces with Codex enabled
- workspace administrators may also use the analytics dashboard for self-serve monitoring
- flexible pricing articles still point workspace owners to Settings > Billing for remaining credits and usage reports

What remains unavailable in this adapter:

- exact remaining workspace credits from the analytics endpoint
- a documented public contract for personal-plan remaining usage
- local-only usage as part of Enterprise analytics totals

## 5. What This Means For MVP

Best-supported first Codex account type:

- Enterprise workspace with Codex enabled and analytics access

What the shipped adapter returns:

- `used`: latest available daily `credits` total, if present
- `warningReason`: latest available daily `credits`, `threads`, and `turns`
- `remaining`: `null`
- `total`: `null`
- `quotaWindow`: `daily`

Important honesty constraint:

- the adapter must not invent remaining workspace credits
- users still need the ChatGPT billing UI for live credit balance checks

Inference from sources:

- the Analytics API is suitable for programmatic adoption and cost-monitoring snapshots
- the Billing UI remains the better source for live remaining-credit questions

## 6. Fixtures

Docs-derived fixtures now used in this provider:

- [analytics-api.fixture.json](../../fixtures/codex/analytics-api.fixture.json)
- [workspace-usage-surfaces.fixture.json](../../fixtures/codex/workspace-usage-surfaces.fixture.json)
- [rate-card-summary.fixture.json](../../fixtures/codex/rate-card-summary.fixture.json)

Fixture note:

- the analytics fixture is sanitized scaffolding derived from the documented daily metrics model
- it is not a capture from a production Enterprise workspace

## 7. Open Validation Items

Still needs real customer validation:

- confirm the exact production response shape from a live Enterprise workspace analytics key
- confirm whether pagination uses `cursor`, `page`, or another server-side token name in the live API
- confirm whether additional query parameters are needed to scope the export window in production
- confirm which admin role can retrieve workspace analytics keys and IDs in the customer environment

## 8. Research Result

This phase selects:

- Enterprise Analytics API live wiring as the shipped Codex MVP path

This phase does not select:

- personal plan support
- Business billing-page parsing
- fake remaining-credit estimates

## 9. Phase 30 Personal-User Spike

Observed in the current local Chrome profile on 2026-04-21:

- `https://chatgpt.com/codex/settings/usage`
- `https://chatgpt.com/codex/cloud/settings/usage`
- `https://chatgpt.com/codex/cloud/settings/analytics#usage`

Observed in the live session set, not just browser history:

- `https://chatgpt.com/codex/settings/usage`
- `https://chatgpt.com/codex/cloud/settings/analytics#usage`

Observed route titles:

- all three routes were stored by Chrome as `Codex`

## 10. Personal-User Decision

Chosen personal-user candidate path:

- primary: `https://chatgpt.com/codex/settings/usage`
- secondary: `https://chatgpt.com/codex/cloud/settings/usage`
- analytics-only fallback for comparison: `https://chatgpt.com/codex/cloud/settings/analytics#usage`

Why `codex/settings/usage` is the primary candidate:

- it is the least workspace-specific route
- it matches the personal-user expansion goal better than the `cloud` namespace
- the `analytics` route is more likely to mirror workspace or reporting surfaces than a direct personal remaining-usage panel

What is still unknown after the spike:

- whether the primary page exposes exact remaining usage
- whether it exposes only window status or warning copy
- whether the actual data is easiest to read from DOM, boot data, or same-origin network responses

## 11. Authentication And Security Findings

Observed ChatGPT session artifacts in the live Chrome profile:

- split `__Secure-next-auth.session-token.*` cookies
- `cf_clearance`
- `oai-client-auth-info`
- `oai-sc`
- `_puid`

Important implementation result:

- copied profile automation is not a reliable path for Codex personal support

What failed during the spike:

- a partial copied profile hit a Cloudflare managed challenge on both candidate routes
- a fuller profile clone with a backed-up cookie database still redirected to logged-out `https://chatgpt.com/`

Inference from these local probes:

- the extension should not attempt to support Codex personal pages by cloning the browser profile
- the extension should not store or import raw ChatGPT cookies
- the extractor must attach to the already-running logged-in ChatGPT tab in the user's browser context

## 12. Chosen Extraction Plan

Selected next implementation step:

- use the shared page-session framework against the user's already-open ChatGPT tab

Required extension change before a live fixture capture:

- add optional host access for `https://chatgpt.com/*`

Preferred extraction order:

1. inspect boot data or preloaded route state
2. inspect same-origin network responses from the page context
3. fall back to stable DOM fields only if the first two surfaces are unavailable

Enterprise coexistence rule:

- keep the shipped Enterprise analytics adapter unchanged
- treat the personal-page path as a separate `session_page` source
- do not merge personal-page numbers into the Enterprise analytics semantics

## 13. Personal Fixtures

Phase 30 added one non-sensitive evidence fixture:

- [personal-page-route-evidence.fixture.json](../../fixtures/codex/personal-page-route-evidence.fixture.json)

Why this fixture exists:

- it records the observed route inventory and auth constraints without storing cookie values
- it documents why copied-session automation was rejected

## 14. Phase 30 Research Result

This phase selects:

- a live-tab `session_page` path as the only defensible personal Codex direction
- `https://chatgpt.com/codex/settings/usage` as the primary candidate route

This phase does not yet prove:

- exact remaining usage for personal users
- whether `codex/cloud/settings/usage` is a better extraction surface than the non-cloud route

## 15. Phase 30.1 Live Tab Capture

Observed in the live Chrome extension session on 2026-04-21:

- the extension successfully requested optional host access for `https://chatgpt.com/*`
- the debug capture page attached to the already-open logged-in ChatGPT tab set
- the first successful live fixture matched `https://chatgpt.com/codex/cloud/settings/analytics#usage`
- the matched page title was `Codex`
- the matched page heading was `Codex 分析`
- the matched page exposed visible DOM snippets including:
  - `5 小时使用限额`
  - `92%`
  - `剩余`
  - `重置时间：2026年4月22日 1:11`
  - `每周使用限额`
  - `97%`
  - `GPT-5.3-Codex-Spark 5 小时使用限额`
  - `100%`
- the capture summary reported:
  - `recommendedSurface = dom`
  - `hasNextDataScript = false`
  - `hasNextFlightStream = false`
  - `hasCloudflareChallenge = false`

What did not match in this live capture:

- `https://chatgpt.com/codex/settings/usage`
- `https://chatgpt.com/codex/cloud/settings/usage`

Inference from the captured page:

- the live `cloud/settings/analytics#usage` route exposes exact remaining percentages directly in rendered DOM
- the same page also exposes explicit reset timestamps for at least the captured usage windows
- the personal-user expansion can now rely on one proven `session_page` surface without exporting cookies or cloning the browser profile

## 16. Personal-User Capture Decision

Selected first proven personal-user extraction surface:

- route: `https://chatgpt.com/codex/cloud/settings/analytics#usage`
- surface: `dom`
- extraction mode observed in the live fixture: `dom`

Current honesty boundary:

- the extension can now defend exact remaining percentages and reset timestamps when this live analytics page is present
- the extension still cannot claim that `https://chatgpt.com/codex/settings/usage` is the better source until a real fixture exists for that route
- the extension should treat the non-cloud route as an observed but unproven candidate, not as the primary proven surface

Important parser constraint:

- the captured page was in Chinese, so the personal-page parser should not assume English-only copy
- route identity and stable card structure should be preferred over hard-coded locale strings wherever possible

## 17. Personal Fixtures

Phase 30.1 added one live redacted fixture:

- [personal-page-live.fixture.json](../../fixtures/codex/personal-page-live.fixture.json)

Why this fixture matters:

- it is the first proof that a real logged-in personal-adjacent Codex page exposes exact remaining values in the browser DOM
- it records the chosen route and extraction surface without retaining cookies or raw full-page dumps

## 18. Phase 35 Personal Snapshot Parser

Phase 35 turns the redacted live fixture into a parser contract, without wiring it into the shipped sync engine yet.

Parser target:

- consume the captured `CodexPersonalLiveFixture`
- pick the matched route chosen by the live capture decision
- parse visible usage-window snippets into structured window snapshots

Current parser contract:

- measurement kind:
  - `window_percent`
- supported window fields:
  - window label
  - normalized window label
  - remaining percent
  - used percent
  - reset timestamp when the page exposes one
- supported window classes:
  - general `5-hour` usage window
  - `weekly` usage window
  - model-specific `5-hour` usage window

Current honesty boundary:

- the parser can defend exact remaining percentages and reset timestamps for the visible usage windows on the proven `cloud/settings/analytics#usage` page
- the parser does not claim absolute remaining credits, remaining dollars, or a unified single numeric quota across all windows
- if the matched page no longer exposes parseable usage windows, the parser must fail as `route_drift` instead of inventing data

Failure classes selected in this phase:

- `open_page_required`
- `logged_out`
- `route_drift`

Why this matters for the next phase:

- `Phase 36` can now wire Codex personal live refresh around a tested parser instead of reparsing raw fixture snippets inside the adapter

## 19. Phase 36 Personal Live Wiring

Phase 36 ships the personal Codex page as a real adapter path.

Current temporary source-selection rule:

- if a Codex analytics API key and workspace ID are configured, the provider keeps using the Enterprise analytics API path
- otherwise, the provider uses the logged-in ChatGPT Codex usage page path

What this shipped:

- the Codex adapter now supports a `session_page` live path built on the personal-page parser
- preview mode falls back to the redacted live fixture instead of crashing when `chrome.tabs` and `chrome.scripting` are unavailable
- the settings page now treats Codex Enterprise analytics config as optional rather than mandatory for every Codex user
- the `Source Connections` section now exposes a shipped `Find or open page` helper for Codex

Current personal-user semantics:

- primary proven live route:
  - `https://chatgpt.com/codex/cloud/settings/analytics#usage`
- normalized primary metric:
  - visible usage-window percentages
- reset behavior:
  - explicit reset timestamps when the page exposes them
- not supported:
  - a single absolute remaining-credit balance across all visible windows

Current honesty boundary:

- the personal path reports percentages and visible reset times
- the Enterprise path still reports daily analytics rows without exact remaining credits
- these two paths are intentionally not merged into one fake universal Codex quota number

Next remaining gap:

- source preference and fallback rules are still heuristic in this phase and will be formalized later in the dedicated hybrid-source selection phase

## 20. 2026-07-13 Live Surface Refresh

The current signed-in Codex usage page was rechecked in the local Chrome
profile after the Codex settings redesign.

Current route result:

- opening `https://chatgpt.com/codex/settings/usage` resolves to the existing
  `https://chatgpt.com/codex/cloud/settings/analytics#usage` surface
- the proven analytics route therefore remains the primary personal-page source
- the older personal and cloud usage route patterns remain as compatibility
  candidates, but no longer take precedence over the proven route

Current visible card structure:

- a general weekly usage-limit card exposes an exact remaining percentage and
  reset timestamp
- a model-specific card can expose only a standalone model name and remaining
  percentage, without naming a five-hour or weekly interval
- the remaining-credit card can appear more than once in the page text because
  the page also contains credit history

Parser consequences:

- standalone model cards are accepted only when a nearby percentage follows
  the model label
- if the preferred page is captured before its quota cards hydrate, the parser
  tries other already-captured compatible Codex routes before reporting drift
- a missing model interval stays `unknown`; the extension does not infer a
  weekly or five-hour window
- duplicate credit-balance cards are collapsed
- the normalized Flex credit balance remains available as a per-surface quota
  item, but defaults to hidden and uses one compact label/value row when enabled
- percentages outside `0..100` and usage-history chart ticks do not become
  quota windows

The checked-in fixture keeps the observed structure but uses sanitized values,
a synthetic tab ID, and no raw page body, cookie, header, or account data.

Official product guidance reviewed on 2026-07-13:

- https://help.openai.com/en/articles/11369540-using-codex-with-chatgpt
- https://help.openai.com/en/articles/20001106-codex-rate-card-2

The official guidance confirms that Codex usage counts toward the applicable
agentic usage limit and directs users to the Codex Settings usage panel for
visible limits and credit options. It does not define a stable public DOM
schema, so the extension continues to treat the live page parser as a
best-effort session-page integration with explicit route-drift failure.

## 21. 2026-07-13 Structured Usage History

The signed-in Codex Analytics page also loads bounded structured daily-history
responses for personal usage by product surface and workspace turn counts by
model and client surface. The extension observes those responses only during
the existing Codex refresh and does not add a separate history timer.

Shipped history behavior:

- at most 31 daily buckets and 16 source series per view are normalized into the
  cached Codex snapshot
- model names remain source labels; known client surfaces can be localized in
  the UI, while unknown labels remain visible instead of being discarded
- compact summaries appear in popup and provider cards; detailed stacked charts
  appear in Provider detail
- personal usage and turn trends can be hidden independently on popup, sidebar,
  and full-page surfaces and restored in Provider display settings
- raw responses, page body text, cookies, headers, account identifiers, and
  unrelated response fields are not persisted
- a failed or changed history response preserves the last valid history and
  does not block current quota, balance, reset-time, or authorization behavior

The history endpoints are an observed signed-in page contract, not a documented
public API. A future Codex page change may therefore temporarily disable the
history modules until the structured contract is reverified.

## 22. 2026-07-14 Hydration And History Display Follow-Up

The current Codex Analytics route can report browser load completion before its
quota cards finish hydrating. Reloading the route again for every parser retry
can interrupt that hydration and produce a transient page-capture or route-drift
failure even when the signed-in page is valid.

Current refresh behavior:

- the first capture performs one controlled reload so the bounded history
  observer can see the structured responses
- after browser load completion, that observer remains active until both known
  history responses arrive or a bounded timeout expires; the refresh no longer
  treats one fixed post-load delay as proof that lazy hydration is complete
- subsequent hydration retries inspect the same page without reloading it again
- retries are time-bounded and retain any valid structured history response
  observed during the first capture
- if only one history response arrives before the timeout, that module is
  updated while the other module keeps its last valid normalized data
- a current quota-capture failure can coexist with last-known-good history in
  storage; cached history does not by itself mean the latest refresh succeeded
- the observed `work_desktop` history series keeps its source id in stored data
  but receives a localized human-readable label in the chart legend

This retry behavior does not add a timer or background polling path. It runs
only inside the existing user/background Codex refresh operation.

## 23. 2026-07-15 Slow Page Hydration Recovery

The Codex Analytics page can remain in a browser-complete but data-incomplete
state for more than ten seconds, especially in a background tab. The refresh
flow now treats browser load completion and usable Codex content as separate
readiness signals.

Current recovery behavior:

- one refresh operation performs at most one controlled page reload
- a script-execution failure after that reload is retried against the same page
  instead of immediately causing a second reload that restarts hydration
- the bounded structured-history wait is now 15 seconds
- the DOM snapshot is taken after that history wait, so quota parsing sees the
  newest rendered page rather than the loading shell captured before responses
  arrived
- if the route is valid but its quota cards are still incomplete, the client
  continues bounded same-page inspection for up to about 18 additional seconds
- every retry keeps the first capture's valid history responses and does not
  persist raw page text, cookies, headers, or unfiltered network responses

If the page remains unreadable after the bounded recovery window, the provider
still reports an explicit capture failure and preserves the last valid history.
It does not convert a slow or failed page into zero usage.

## 24. 2026-07-17 Direct Session Usage And Request Budget

Codex personal refresh now tries the current ChatGPT browser session's
structured usage responses before relying on page hydration. The observed
paths are:

- `/backend-api/wham/usage`
- `/backend-api/wham/usage/daily-token-usage-breakdown`
- `/backend-api/wham/analytics/daily-workspace-usage-counts`

These paths are internal signed-in page contracts, not documented public OpenAI
APIs. The extension must continue to label this integration as best effort and
retain the page parser plus last-successful snapshot as fallback paths.

Credential handling:

- one short-lived access token is discovered from the local ChatGPT session and
  cached in `chrome.storage.session`
- the service worker first requests `https://chatgpt.com/api/auth/session` with
  the browser's existing signed-in session; it does not open, focus, activate,
  or wait for a ChatGPT tab renderer
- the background response is bounded to 64 KiB and an eight-second timeout; only
  the token and an explicit optional account identifier are retained, while the
  raw session response and browser cookies are never stored
- if that internal session contract is unavailable or rejected, discovery falls
  back to the existing open-tab capture path without creating or activating a
  tab
- Firefox or another browser without compatible session storage degrades to
  service-worker memory
- concurrent callers share one credential-acquisition promise and one Codex
  refresh promise
- a usable token is reused until it nears JWT expiry; `401` clears it and permits
  one renewal attempt
- Advanced Settings can accept one bare temporary access token when automatic
  discovery is unavailable; cookie text, authentication JSON, refresh tokens,
  and complete Authorization headers are rejected
- token values never enter AppState, Chrome Sync, configuration backup, logs,
  fixtures, diagnostics, raw evidence, or provider snapshots
- session tokens are sent only to `https://chatgpt.com`

Request budget:

- automatic current-quota refreshes reuse results for 60 seconds
- daily history reuses results for 15 minutes; repeated manual history refreshes
  inside 60 seconds also reuse the cached result
- `401` renews once, `403` waits for account or credential recovery, `429`
  respects `Retry-After` or waits 15 minutes, and network or `5xx` failures use
  bounded 1/5/15-minute backoff
- the complete automatic path settles within 12 seconds and the manual recovery
  path within 20 seconds
- a direct failure can fall back to the existing page-session parser without
  opening a page during automatic refresh
- a failed direct request or page fallback preserves previous quota and history
  with a stale warning instead of replacing valid values with zeroes

This section supersedes the older page-first timing assumptions above. Page
hydration remains a compatibility fallback, but it is no longer the primary
current-quota transport when local session authentication succeeds.

## 25. 2026-07-17 Background Session Discovery

The credential-discovery step no longer requires a live ChatGPT renderer in the
normal Chrome path. The extension service worker performs the bounded local
session request first, so a frozen, discarded, lazily hydrated, or backgrounded
Codex tab does not by itself block current quota refresh.

This is still an internal signed-in page contract rather than a public OpenAI
API. A missing login session, blocked eligible cookies, revoked host access, an
endpoint rejection, or protocol drift can still prevent automatic discovery.
Those cases enter the existing local cooldown and compatibility fallback rather
than opening pages repeatedly or producing a request storm. The last successful
normalized snapshot remains visible with a stale warning.

## 26. 2026-07-18 Usage Window Labels

Quota labels follow the normalized window returned by the active Codex source:

- a `604800`-second normalized window is shown as a localized weekly limit
- if that window is absent, no weekly item or placeholder is rendered
- an unrecognized period is shown as a generic usage limit rather than being
  relabeled as weekly
- a model-specific window uses the model name as its primary label

The quota name and reset timestamp are rendered as separate text spans. They
remain on one line when space permits and wrap only between the name and the
complete timestamp at narrower widths. Users can choose localized date,
weekday, or combined reset-time formatting under More UI settings. Formatting
uses `Intl.DateTimeFormat`; provider adapters continue to supply normalized
window kinds and do not generate display-language strings.
