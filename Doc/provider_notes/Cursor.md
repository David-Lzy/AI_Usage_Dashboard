# Cursor Provider Note

Date: 2026-07-17

Process rule:

- follow [CONTRIBUTING.md](../../CONTRIBUTING.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this provider note should track the current selected source path, support boundary, and official-source basis for Cursor
- refresh it whenever the chosen source path, active release promise, or relevant official docs change

Post-0.2.0-rc.1 background session update:

- Cursor personal billing summary refresh now starts in the extension service
  worker and requests the verified summary, plan, and hard-limit endpoints with
  the browser's existing `cursor.com` session.
- The background summary path does not activate, focus, reload, or depend on a
  Cursor dashboard renderer. It therefore remains available when Chrome
  throttles or freezes an open background Cursor tab.
- The browser attaches eligible cookies to `cursor.com`; extension code does
  not read or persist cookies, headers, account identifiers, or raw response
  bodies.
- Concurrent surfaces share one in-flight request. Automatic refreshes reuse a
  short sanitized cache and apply bounded timeout, rate-limit, and transient
  failure cooldowns.
- The direct path requires a valid usage summary before it can replace billing
  state. Page observation remains the aggregate-history enrichment and fallback
  path, and a summary-only refresh preserves the last valid history.

Post-rc36 structured capture update:

- Cursor personal refresh now observes the verified Usage/Spending JSON
  responses during a bounded managed-page reload instead of depending only on
  rendered DOM text.
- When Cursor's lazy dashboard does not replay the billing-summary request, the
  extension performs one bounded, same-origin read of the known summary, plan,
  and hard-limit JSON endpoints from the already logged-in page. Responses pass
  through the same allowlist and sanitizers as observed traffic; raw bodies and
  credentials are not persisted.
- Usage-event pagination is finite and allowlisted. The extension normalizes at
  most 31 daily buckets and does not persist request rows, raw responses,
  request bodies, cookies, headers, or account identifiers.
- Billing and aggregate-history sections retain their own last successful
  values. A delayed or changed endpoint can degrade one section without
  replacing the other with zeroes or breaking the existing provider card.
- The normalized personal model keeps plan-included API value, Free/Bonus value,
  and actual On-Demand charges as distinct amounts. Plan value is not presented
  as money already charged.
- Popup, side panel, dashboard, and Provider detail can show a compact billing
  summary and bounded 7/30-day aggregates. Billing and history modules can be
  hidden and reordered independently per surface; Provider detail also links
  back to Cursor Usage and Spending.
- These modules store summaries only. Individual Usage request rows remain on
  the Cursor source page and are not persisted or rendered by the extension.
- A disabled On-Demand setting is displayed as account information, not as a
  synchronization warning. Access, authentication, protocol, and parsing
  failures continue to produce a warning while retaining the last valid data.

Phase 291 runtime update:

- Cursor personal usage now follows the same managed session-page boundary as Codex.
- The preferred page-open route is `https://cursor.com/cn/dashboard/usage`, while locale-free and other locale-prefixed dashboard usage routes remain matched.
- When the source is allowed to auto-open, the extension opens a managed non-active tab, reads the logged-in page DOM with granted `cursor.com` host access, reloads unreadable captures with `bypassCache: true`, and retries while a freshly opened dashboard hydrates.
- This does not change the personal-data claim: the current Cursor personal page provides billing-period usage context and visible plan/state labels, not an exact remaining included-request counter.

Post-rc10 source update:

- Cursor logged-out detection now requires actual logged-out state evidence instead
  of treating auth-related DOM copy on the live dashboard shell as a blocker.
- The personal dashboard parser preserves visible billing period, total spend,
  included spend, on-demand spend, and on-demand state as structured usage facts.
- Dashboard, provider-detail, and popup surfaces can now show those visible facts
  without upgrading the source-fidelity claim to exact remaining requests.

## 1. Decision

Selected source paths:

- `A1`: Cursor Team Admin API
- `A2`: logged-in Cursor personal dashboard usage page

Selected support scope:

- Cursor team admins only
- Cursor individual accounts when the user is already logged into `cursor.com` in Chrome and grants host access

Deferred from MVP:

- non-admin team members
- event-level analytics ingestion from `POST /teams/filtered-usage-events`

Reason:

- Cursor documents an official Admin API for team administrators
- the docs expose the exact authentication method and the endpoints needed for team roster, spend, and daily usage
- the individual dashboard is documented at a high level, but the reviewed official docs do not expose a comparable public API for individual accounts

## 2. Official Sources Reviewed

Reviewed on 2026-04-20 using official Cursor docs search results and cached snippets from the official docs domain:

- Admin API:
  - https://docs.cursor.com/en/account/teams/admin-api
  - search snippet reference: `turn6search0`
- Members + Roles:
  - https://docs.cursor.com/account/teams/members/
  - search snippet reference: `turn5search0`
- Models & Pricing:
  - https://docs.cursor.com/en/account/usage
  - search snippet reference: `turn5search1`
- Team Pricing:
  - https://docs.cursor.com/en/account/teams/pricing
  - search snippet reference: `turn5search2`

Research note:

- live page opens redirected to `cursor.com/docs` in this browsing environment, so this note relies on the official search-cached snippets above rather than a rendered live page fetch

## 3. Authentication Flow

The official Admin API docs describe this flow:

1. Navigate to `cursor.com/dashboard`
2. Open the `Settings` tab
3. Create a `Cursor Admin API Key`
4. Copy the generated key immediately

Authentication method:

- basic auth
- username: API key
- password: blank

Equivalent header:

- `Authorization: Basic {base64_encode('API_KEY:')}`

Base URL:

- `https://api.cursor.com`

Required account role:

- team admin

Important access note:

- the docs say API keys are organization-scoped and visible to all admins
- this means the extension must treat the key as a team credential, not a personal token

## 4. Endpoints Selected For MVP

### 4.1 Required

`GET /teams/members`

- purpose:
  - enumerate team users
  - distinguish paid users from unpaid admins via `role`
- response fields called out by the docs:
  - `name`
  - `email`
  - `role`

`POST /teams/spend`

- purpose:
  - get current-cycle spend and request counts
  - get `subscriptionCycleStart`
  - get `hardLimitOverrideDollars`
- useful response fields from the docs:
  - `teamMemberSpend[].spendCents`
  - `teamMemberSpend[].fastPremiumRequests`
  - `teamMemberSpend[].name`
  - `teamMemberSpend[].email`
  - `teamMemberSpend[].role`
  - `teamMemberSpend[].hardLimitOverrideDollars`
  - `subscriptionCycleStart`
  - `totalMembers`
  - `totalPages`

`POST /teams/daily-usage-data`

- purpose:
  - get per-day request usage across the billing cycle
  - derive included-usage consumption for the normalized dashboard card
- required request body:
  - `startDate`
  - `endDate`
- date-range limit:
  - max `90` days per request according to the docs
- useful response fields from the docs:
  - `date`
  - `isActive`
  - `agentRequests`
  - `subscriptionIncludedReqs`
  - `apiKeyReqs`
  - `usageBasedReqs`
  - `mostUsedModel`
  - `email`

### 4.2 Deferred

`POST /teams/filtered-usage-events`

- useful later for:
  - token-level analytics
  - model-level cost details
  - detailed event drilldowns
- deferred because:
  - pagination and event-level granularity are heavier than the MVP card needs
  - the first adapter only needs a stable cycle summary

## 5. Account-Type Matrix

| Account type | Official path found | Current support |
| --- | --- | --- |
| Team admin | Admin API | Yes |
| Team member, non-admin | Can see own usage in dashboard per role docs, but no public member API found in reviewed docs | Session-page only if the same dashboard usage route is available in the logged-in Chrome profile |
| Individual personal plan | Dashboard usage is documented, but no public API found in reviewed docs | Session-page billing-period and visible spend context through `https://cursor.com/cn/dashboard/usage`; exact remaining included requests unavailable |

Inference note:

- "No public API found" means I did not find one in the official docs reviewed on 2026-04-20

## 6. Normalized Mapping

Selected normalized strategy for the Cursor adapter:

- `providerId`: `cursor`
- `providerLabel`: `Cursor`
- `planName`: `Cursor Team`
- `syncSource`: `official` for Admin API, `page_parse` for the logged-in dashboard usage page
- `quotaUnit`: `requests`
- `quotaWindow`: `monthly`

Proposed field mapping:

- `used`
  - sum `subscriptionIncludedReqs` across the current billing cycle from `POST /teams/daily-usage-data`
- `total`
  - use an explicit allowance returned by the current contract when available
  - only use the historical `billableUserCount * 500` rule for a live response
    that explicitly identifies the older request-based cohort
  - otherwise keep the total and remaining request count unknown
- `remaining`
  - `max(total - used, 0)`
  - unavailable on the personal dashboard usage page until a proven exact remaining counter is exposed
- `usageFacts`
  - for the personal dashboard path, preserve visible billing-period and spend
    cards as structured facts
  - do not derive an exact remaining request count from those facts
- `resetAt`
  - derive from `subscriptionCycleStart` from `POST /teams/spend`
  - expected cycle is monthly
- `warningReason`
  - if summed `usageBasedReqs > 0`, show that pay-per-use overage has started
  - if `hardLimitOverrideDollars` is low or zero for some users, show a spend-limit warning in detail view later

Supplemental detail fields for later detail pages:

- `spendCents`
- `fastPremiumRequests`
- `mostUsedModel`
- `apiKeyReqs`
- `usageBasedReqs`

Historical inference note:

- the earlier `500 requests per paid user per month` mapping described an older
  request-based plan model; it is no longer an unconditional current default
- current adapters must prefer explicit live contract fields and retain an
  unknown or partial state when the account cohort cannot be proven

## 7. Required Secrets And Extension Permissions

Required secret:

- Cursor team Admin API key

Extension implications:

- the key must never be bundled into the extension source
- the key should be stored only after explicit user configuration
- the adapter will likely need host access to `https://api.cursor.com/*`

Current recommendation:

- keep Cursor credentials in extension-managed local storage only after a user opt-in flow
- do not request broad `cursor.com/*` page access for the MVP admin-API path

## 8. Fixture Inventory

Doc-derived sanitized fixtures created in this phase:

- [admin-api-members.fixture.json](../../fixtures/cursor/admin-api-members.fixture.json)
- [admin-api-spend.fixture.json](../../fixtures/cursor/admin-api-spend.fixture.json)
- [admin-api-daily-usage.fixture.json](../../fixtures/cursor/admin-api-daily-usage.fixture.json)

Fixture source note:

- these fixtures are sanitized from the official docs examples, not from a live team account

## 9. Open Validation Items

Still needs a live team-admin credential before the production adapter phase:

- confirm the exact request and response shapes returned today by the live API
- confirm the active team cohort and any explicit included allowance instead of
  assuming a fixed request count
- confirm whether `subscriptionCycleStart` is sufficient to compute the reset date without extra billing metadata
- confirm rate limits and pagination behavior for the chosen endpoints under real usage

## 10. Research Result

This phase selects:

- Cursor Team Admin API as the MVP integration path

This phase does not select:

- individual-account dashboard parsing for v1

## 11. Implementation Status

Phase 20 implementation landed on 2026-04-20.

Current implementation details:

- the runtime adapter now uses the live Cursor Team Admin API path instead of the fixture path
- the extension stores the Cursor team admin API key in extension-managed local storage under a dedicated secret key, separate from the shared app-state payload
- the Settings page now exposes a Cursor-specific Admin API key card with save and clear actions
- sync still fails explicitly when host access to `https://api.cursor.com/*` is missing, when the admin key is missing, or when the live API returns an error

Still not validated against a real team-admin account in this repository:

- current live response shape from a production team
- current included-request mapping for the active team plan
- real-world behavior for auth failures, admin-role mismatches, and rate limits

## 12. Phase 31 Personal-User Spike

Observed in the current live Chrome session on 2026-04-21:

- route: `https://cursor.com/cn/dashboard/usage`
- visible left-nav label: `Usage`
- visible cards and controls included:
  - `Pro+`
  - `Ultra`
  - `On-Demand Usage is Off`
  - `Your Usage`
  - `By Model`
  - `Spend`
  - `Export CSV`
  - date range selector: `Mar 23 - Apr 21`
- the rendered page copy was mostly English even though the URL path used `/cn/`

What the live page did not visibly expose:

- an exact remaining included-request counter
- a `requests left` style card
- a remaining monthly quota number comparable to the team Admin API mapping

Immediate product implication:

- the personal Cursor page is useful for current billing-period usage tracking
- it is not yet an honest source for exact remaining included requests

## 13. View-Source Architecture Findings

Observed from `view-source:https://cursor.com/cn/dashboard/usage` in the same logged-in browser session:

- the root element declared `lang="zh-CN"`
- `__NEXT_DATA__` was not present in the source
- `_buildManifest` was not present in the source
- `self.__next_f.push(...)` was present repeatedly in the source
- the browser find UI reported `41` matches for `__next_f.push`
- visible usage-page strings were present inside the source stream, including:
  - `Upgrade to Pro+`
  - `On-Demand Usage is Off`
  - `Export CSV`

Inference from these observations:

- this route is a Next / React flight page rather than a classic `__NEXT_DATA__` page
- the page is not just an empty client shell; the source already contains route text and state fragments
- the first stable extraction target should be the embedded flight stream or related boot data, with DOM as a fallback

## 14. Personal-User Decision

Selected personal-user candidate path:

- route: `https://cursor.com/cn/dashboard/usage`
- preferred extraction surface: `boot_data`
- practical fallback: `dom`

Why `boot_data` is preferred:

- the live source explicitly includes `self.__next_f.push(...)` flight payloads
- the rendered DOM is useful, but it is more locale-sensitive than the flight stream
- the path may render in different languages while keeping the same route identity

What personal Cursor support can honestly expose from current evidence:

- current billing-period usage or spend views
- plan metadata such as `Pro`, `Pro+`, `Ultra`, and on-demand usage state
- billing-window labels and export affordances

What it should not claim yet:

- exact remaining included requests
- an exact monthly request cap remainder comparable to team-admin API data

## 15. Personal Fixtures

Phase 31 added one live redacted evidence fixture:

- [personal-page-live-evidence.fixture.json](../../fixtures/cursor/personal-page-live-evidence.fixture.json)

Why this fixture matters:

- it records the live page route, visible strings, and source-architecture signals without storing cookies or the full HTML source
- it captures the key honesty constraint for Cursor personal support: current usage view yes, exact remaining quota no

## 16. Phase 37 Personal Snapshot Parser

Phase 37 turns the captured personal-route evidence into a parser contract.

Parser target:

- consume the existing redacted Cursor evidence fixture today
- keep the parser shape compatible with future `CursorPersonalPageSummary` and `CursorPersonalLiveFixture` inputs
- normalize the page into billing-period usage metadata rather than fake request-balance totals

Current parser contract:

- measurement kind:
  - `billing_period_usage`
- supported fields:
  - route URL
  - locale prefix if present
  - recommended extraction surface
  - billing-period date range label
  - usage-series label
  - visible plan labels
  - on-demand usage state
  - visible section labels such as `Usage`, `By Model`, and `Spend`
  - CSV export visibility

Current honesty boundary:

- the parser supports `window_only` usage semantics
- it keeps `remainingAvailability = unavailable`
- it does not claim exact remaining included requests because the captured page does not expose them

Failure classes selected in this phase:

- `open_page_required`
- `logged_out`
- `route_drift`

Why this matters for the next phase:

- `Phase 38` can now wire Cursor personal live refresh around a tested billing-period parser instead of treating the page as a generic DOM scrape

## 17. Phase 38 Personal Live Wiring

Phase 38 implementation landed on 2026-04-22.

Current temporary source-selection rule:

- if a Cursor Admin API key is configured, keep using the team Admin API path
- if no Admin API key is configured, use the logged-in personal dashboard page path

What phase 38 shipped:

- the runtime adapter now supports both shipped Cursor source tracks:
  - team Admin API
  - personal dashboard session page
- the personal path uses a dedicated live page client in extension mode and a fixture-backed fallback in browser preview mode
- missing host access on the personal path now degrades into a readable session-page warning state instead of the old key-required sync failure
- the Settings page now treats the Admin API key as optional and exposes Cursor host access for both `api.cursor.com` and `cursor.com`

Current honesty boundary:

- the team Admin API path can still expose included-request totals and reset timing
- the personal dashboard path currently exposes billing-period labels, section labels, visible plan labels, on-demand usage state, export visibility, and sync freshness
- the personal dashboard path still does not expose exact remaining included requests, so the shipped UI keeps `used`, `remaining`, and `total` unset there

Follow-up already queued:

- phase 39 will replace the temporary `Admin API key first, session page otherwise` rule with explicit source-selection and fallback behavior
- mixed-source real-Chrome verification still needs to cover live switching between the personal and admin Cursor paths
