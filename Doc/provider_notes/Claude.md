# Claude Provider Note

Date: 2026-04-20

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

## 1. Decision

Selected MVP source path:

- `A1`: Claude Code Analytics Admin API

Selected MVP support scope:

- Claude organizations with Admin API access
- usage-based Enterprise or Console-style organization setups where an Admin API key can be provisioned

Deferred from MVP:

- Team plan dashboard-only accounts on `claude.ai`
- seat-based Enterprise accounts that only expose analytics through the web dashboard
- personal Pro or Max accounts
- CLI-local `/cost` output as an account-level source

Reason:

- Anthropic now has an official structured Claude Code Analytics API
- the API is a cleaner and more stable source than page parsing
- the web analytics dashboards document usage and adoption metrics, but the reviewed docs do not promise exact remaining included usage or a machine-readable quota endpoint for Team or seat-based Enterprise plans

## 2. Official Sources Reviewed

Reviewed on 2026-04-20 using official Anthropic / Claude documentation:

- Claude Code usage analytics help article:
  - https://support.claude.com/en/articles/12157520-claude-code-usage-analytics
- Claude Code analytics product docs:
  - https://code.claude.com/docs/en/analytics
- Claude Code Analytics API:
  - https://platform.claude.com/docs/en/build-with-claude/claude-code-analytics-api
- Admin API overview:
  - https://platform.claude.com/docs/en/api/administration-api
- Team / Enterprise usage and billing behavior:
  - https://support.claude.com/en/articles/11845131-use-claude-code-with-your-team-or-enterprise-plan
- Team / seat-based Enterprise extra usage:
  - https://support.claude.com/en/articles/12005970-extra-usage-for-claude-for-work-team-and-enterprise-plans
- Claude platform release notes:
  - https://platform.claude.com/docs/en/release-notes/overview

## 3. Why This Source Wins

Chosen source:

- `GET /v1/organizations/usage_report/claude_code`

Why this source:

- official API path
- structured JSON with documented request parameters and response fields
- organization-level access via Admin API key
- stable enough for adapter work without DOM parsing

Why the dashboard is not the MVP primary path:

- Team / Enterprise dashboards at `claude.ai/analytics/claude-code` and `platform.claude.com/claude-code` expose analytics, but the reviewed docs do not document a stable JSON contract behind those pages
- contribution metrics on `claude.ai` also depend on optional GitHub setup and are intentionally broader than the quota dashboard need

## 4. Account-Type Matrix

### 4.1 Selected for v1

- organizations with Admin API access
- practical first target:
  - usage-based Enterprise / Console organizations that can provision `sk-ant-admin...` keys

### 4.2 Explicitly Deferred

- Team plan owners using only the `claude.ai` analytics dashboard
- seat-based Enterprise plans that rely on included seat usage plus optional extra usage
- individual Pro / Max subscribers

Reason for the defer:

- these account types clearly have analytics or usage-limit pages, but the reviewed official docs do not expose an exact official API for "remaining included Claude Code usage" on those plans
- Team and seat-based Enterprise limits are described in approximate hours and 5-hour windows, which do not map cleanly to the current normalized provider model

## 5. What The Official Docs Say

Web dashboards:

- Team / Enterprise analytics live at `claude.ai/analytics/claude-code`
- API / Console analytics live at `platform.claude.com/claude-code`
- Team / Enterprise usage analytics show:
  - lines of code accepted
  - suggestion accept rate
  - active users and sessions
  - user-level monthly lines accepted
- Team / Enterprise contribution metrics are optional and require GitHub integration

Plan behavior:

- Team and seat-based Enterprise plans have included usage windows and can enable extra usage after limits are reached
- usage-based Enterprise plans do not have per-seat usage limits; usage is billed by consumption

Admin API behavior:

- the Admin API is unavailable for individual accounts
- the Claude Code Analytics API requires an Admin API key
- the endpoint returns one record per actor per UTC day

Release timing:

- the Claude platform release notes record the Claude Code Analytics API launch on 2025-09-10

## 6. Fields The API Exposes

Documented dimensions:

- `date`
- `actor`
- `organization_id`
- `customer_type`
- `terminal_type`

Documented core metrics:

- `num_sessions`
- `lines_of_code.added`
- `lines_of_code.removed`
- `commits_by_claude_code`
- `pull_requests_by_claude_code`

Documented tool metrics:

- `edit_tool.accepted`
- `edit_tool.rejected`
- `write_tool.accepted`
- `write_tool.rejected`
- `notebook_edit_tool.accepted`
- `notebook_edit_tool.rejected`

Documented model breakdown fields:

- `model`
- `tokens.input`
- `tokens.output`
- `tokens.cache_read`
- `tokens.cache_creation`
- `estimated_cost.amount`
- `estimated_cost.currency`

Important API constraints:

- request parameter `starting_at` is a single UTC day in `YYYY-MM-DD`
- data is daily aggregated, not real-time
- data freshness is up to about 1 hour

## 7. What The API Does Not Expose Clearly

Not clearly exposed in the reviewed official docs:

- exact remaining included Claude Code hours for Team premium seats
- exact remaining included Claude Code hours for seat-based Enterprise plans
- exact next reset timestamp for Team / seat-based Enterprise limits
- a documented "current weekly limit consumed" field

Inference:

- the Claude Code Analytics API is excellent for usage, activity, and cost analytics
- it is not a documented quota-remaining API for subscription seats

## 8. Normalized Mapping Proposal

Selected normalized strategy for the first Claude adapter:

- `providerId`: `claude-code`
- `providerLabel`: `Claude Code`
- `syncSource`: `official`
- support scope label:
  - `Claude Code Analytics Admin API`

Mapping note:

- the current shared provider model is quota-centric
- Claude's official API is analytics-centric

Proposed first adapter behavior:

- use the API as the source of truth for sync health and current usage activity
- aggregate daily sessions or daily estimated cost for detail surfaces
- keep `used`, `remaining`, and `total` as `null` unless a future live source exposes quota values precisely
- surface a user-readable `warningReason` when the workspace is analytics-only and not quota-exact
- treat `resetAt` as a reporting-window label rather than a hard quota reset timestamp until a better official field is confirmed

Implication for implementation:

- `Phase 13` may need either:
  - a narrow analytics-only Claude adapter under the existing model, or
  - a subphase split if the shared model needs to grow

## 9. Fixtures

Docs-derived fixtures created in this phase:

- [analytics-api.fixture.json](/home/davidli/Project/personal_project/AI_Usage_Dashboard/fixtures/claude/analytics-api.fixture.json:1)
- [analytics-api-extracted.fixture.json](/home/davidli/Project/personal_project/AI_Usage_Dashboard/fixtures/claude/analytics-api-extracted.fixture.json:1)

Fixture note:

- these fixtures are sanitized and derived from the official response schema
- they are scaffolding fixtures, not captures from a live organization

## 10. Open Validation Items

Still needs a real organization before adapter implementation is finalized:

- confirm the exact live response shape and field names from a real Admin API call
- confirm whether the endpoint returns `customer_type: subscription` records for Team / seat-based Enterprise org activity in practice
- confirm how far back daily data is retained in a real org
- confirm whether a second official endpoint exists for exact subscription-seat quota consumption

## 11. Research Result

This phase selects:

- Claude Code Analytics Admin API as the MVP source path

This phase does not select:

- Team / Enterprise dashboard parsing as the primary path
- Pro / Max individual usage support in v1

## 12. Implementation Status

Phase 22 implementation landed on 2026-04-20.

Current implementation details:

- the runtime adapter now calls the live Claude Code Analytics Admin API at `https://api.anthropic.com/v1/organizations/usage_report/claude_code`
- the extension stores the Anthropic Admin API key in extension-managed local storage under the shared provider-secrets store, separate from app state
- the Settings page now exposes a Claude-specific Admin API credential card alongside the existing Cursor credential card
- the live client sends `x-api-key` and `anthropic-version: 2023-06-01` headers and follows `next_page` cursors until the daily report is exhausted
- the normalized dashboard remains analytics-first:
  - `used` is the number of sessions in the daily report
  - `remaining` and `total` stay `null`
  - `resetAt` remains a reporting-window label, not a hard subscription reset timestamp

Still not validated against a real organization in this repository:

- current production response shape from an Admin API key
- real authorization failures and role-mismatch errors
- whether some subscription organizations return materially different `customer_type` mixes than the fixture-backed test cases

## 13. Phase 32 Personal-User Spike

Observed in the current live Chrome session on 2026-04-22:

- requested route: `https://claude.ai/settings/usage`
- final route after navigation: `https://claude.ai/upgrade`
- visible page heading: `Plans that grow with you`
- visible plan tabs:
  - `Individual`
  - `Team and Enterprise`
- visible individual plan cards:
  - `Free`
  - `Pro`
  - `Max`
- visible prices in this browser locale:
  - `A$0`
  - `A$29 AUD / month billed annually (includes GST)`
  - `From A$169.99 AUD / month billed monthly (includes GST)`

What the live page did not expose:

- a usage meter
- a rolling-window status
- remaining Claude or Claude Code allowance
- a reset time
- a user-facing usage history view

Real-state classification from this browser session:

- account state: `free_or_upgrade_only`
- route state: `redirected_or_gated`

## 14. Personal-User Decision

Current shipped decision for personal Claude support:

- unsupported for now

Why this is the current decision:

- the current logged-in free account does not reach a usable usage page
- the route resolves to an upgrade page rather than a quota surface
- no exact or approximate remaining-usage signals were exposed in the live page
- supporting this route today would mean showing only upgrade-state copy, not real usage data

What remains possible later:

- a real Pro or Max account may still expose a distinct usage page
- if that page exists, it should be treated as a separate follow-up capture rather than inferred from the free-account redirect

Important product boundary:

- the extension should treat redirected or upgrade-only Claude states as first-class account states
- it should not pretend that a personal usage source exists when the browser session only exposes plan marketing and upgrade controls

## 15. Personal Fixtures

Phase 32 added one live redacted evidence fixture:

- [personal-upgrade-gate.fixture.json](/nfs/server1/disk1/Project/personal_project/AI_Usage_Dashboard/fixtures/claude/personal-upgrade-gate.fixture.json:1)

Why this fixture matters:

- it records the exact live redirect outcome from `claude.ai/settings/usage`
- it preserves the honest shipped decision: personal Claude remains unsupported until a real Pro or Max usage page is captured
