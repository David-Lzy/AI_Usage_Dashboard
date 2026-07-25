# Sub2API User Usage Contract

Date: 2026-07-25

Document class:

- maintained technical reference

Freshness model:

- reverify against the pinned upstream source before changing the runtime adapter

Status note:

- this document records discovery evidence and the shipped API-key contract
- account-dashboard enrichment was reviewed and is intentionally unsupported in
  the first release

## Identity And Trust Boundary

[Sub2API](https://github.com/Wei-Shaw/sub2api) is a self-hosted API gateway.
The screenshots that prompted this investigation show one third-party
deployment. That deployment is not treated as an official Sub2API service or a
hard-coded endpoint.

The protocol review is pinned to
[`Wei-Shaw/sub2api@2730c1c43b29be003925b033f3f9e645e726bb8c`](https://github.com/Wei-Shaw/sub2api/tree/2730c1c43b29be003925b033f3f9e645e726bb8c),
licensed under LGPL-3.0-or-later. The local probes and fixtures are independent
JavaScript and synthetic JSON. No upstream Go or TypeScript implementation was
copied or translated.

Users must configure their own deployment origin. Both HTTP and HTTPS origins
are representable because some deployments are local or private-network
services. HTTPS is recommended. An HTTP origin must remain visibly marked as
insecure and must never be silently rewritten.

## Preferred API-Key Contract

The bounded first release should use:

```text
GET <deployment-origin>/v1/usage
Authorization: Bearer <Sub2API API key>
```

Optional query inputs supported by the pinned implementation are:

- `days`, accepted upstream from 1 through 90;
- `start_date` and `end_date`, using `YYYY-MM-DD`;
- `timezone`, used when constructing daily buckets.

The extension should request and retain no more than 31 daily buckets for its
first release. The API key is a credential for that deployment and key scope.
It belongs only in extension-local secret storage and must not enter AppState,
Chrome Sync, configuration backup, logs, fixtures, diagnostics, or exports.

This route is preferred over dashboard-page capture because it does not depend
on a foreground tab, page hydration, DOM selectors, or browser lazy loading.

### Settings and deployment isolation

Settings asks for a local deployment label, the exact HTTP or HTTPS origin, and
an API key. The key input is never prefilled after save. Leaving it blank while
editing keeps the saved key; entering a replacement key overwrites only that
deployment's account-scoped secret.

Each deployment receives an opaque local account id and keeps its credential,
normalized snapshot, last-sync state, and per-surface module preferences
separate. Only the selected deployment follows the existing automatic refresh
schedule. Selecting another deployment performs one bounded manual refresh;
inactive deployments are not refreshed concurrently and values are never
aggregated across deployments.

**Save and test** requests optional host access for the configured scheme and
host before running the normal provider refresh. **Disconnect** clears the
credential and connection metadata, with an explicit choice to retain or remove
the last nonsecret summary. Removing a non-default deployment clears its
isolated snapshot, metadata, and secret. A non-loopback HTTP origin requires a
persistent acknowledgement that the API key will be sent without transport
encryption.

## Response Modes

The route returns a direct JSON object rather than the account API's
`code/message/data` envelope.

### Quota-limited key

`mode: "quota_limited"` can provide:

- `quota.limit`, `quota.used`, and `quota.remaining`, in USD;
- a current validity/status value;
- dynamic `rate_limits` entries, currently produced for 5-hour, 1-day, and
  7-day windows when configured;
- an optional expiry timestamp;
- key-scoped usage summary, daily history, and model statistics.

Window identifiers must be preserved as bounded source values. A future
identifier must not be relabeled as a known period without evidence.

### Unrestricted wallet key

`mode: "unrestricted"` can expose wallet balance through `balance` and
`remaining`. A wallet balance is not a reset window and must not be rendered as
a quota ring with a fabricated total.

### Unrestricted subscription key

An unrestricted key associated with a subscription can expose daily, weekly,
and monthly usage and limits plus subscription expiry. The limiting window is
deployment-configured. The UI must not assume that every subscription has all
three limits.

## Common Usage Fields

When available, `usage.today` and `usage.total` contain:

- requests;
- input and output tokens;
- cache-creation and cache-read tokens;
- total tokens;
- `cost`, the reference or standard cost;
- `actual_cost`, the amount actually deducted from the user/key scope.

The same distinction applies to `daily_usage` and `model_stats`. The extension
must label `actual_cost` as actual spend and `cost` as reference value. It must
not present their difference as a guaranteed discount unless both values are
present and the explanation remains explicit.

`average_duration_ms`, `rpm`, and `tpm` are optional performance facts. RPM and
TPM represent a recent moving observation in the pinned implementation, not a
contractual rate-limit allowance.

The first normalized model will retain at most 31 daily buckets and 16 model
series. Unknown model labels remain source labels. Raw request logs, endpoint
paths, group names, API-key names, prompts, and per-request timing are outside
the first-release contract.

## Normalized Local Model

The runtime model keeps API-gateway metering as an optional extension to one
provider snapshot. It does not copy spend into the provider's generic
`used`, `remaining`, or `quotaWindow` fields. The extension records an opaque
local account ID, exact deployment origin, transport, capture time, stale
state, and explicit `api_key` or `account` scope.

Every monetary value is stored as an amount paired with its bounded source
unit. Unknown units remain source values; they are not silently converted to
USD. Missing requests, token classes, latency, RPM, TPM, balance, quota, or
history remain `null` or absent rather than becoming zero. Reference savings
are derived only for presentation when reference and actual costs use the same
unit.

Module order and visibility are local to each opaque account and surface.
Metering snapshots, account-local preferences, and credentials are excluded
from configuration backup and Chrome Sync. The raw normalized model keeps at
most 31 daily buckets and 16 model series; compact views may merge additional
visible series into an explicitly labeled `Other` item without rewriting the
stored totals.

## Account-Wide Enrichment Gate Decision

The authenticated user application also defines account-wide endpoints:

```text
GET /api/v1/usage/dashboard/stats
GET /api/v1/usage/dashboard/trend
GET /api/v1/usage/dashboard/models
GET /api/v1/usage/dashboard/snapshot-v2
```

These routes use the user-session bearer credential and the standard
`code/message/data` envelope. They can aggregate multiple API keys and expose
platform, model, group, and endpoint dimensions. Therefore they are a separate
account scope, not an enrichment that can be silently merged into one API
key's totals.

The pinned frontend stores `auth_token`, `refresh_token`, `auth_user`, and
`token_expires_at` in page `localStorage`. Its API client attaches the access
token to dashboard requests, uses the refresh token after `401`, rotates both
tokens, and clears or revokes them during session failure or logout. The pinned
server defaults to a 24-hour access token fallback and a 30-day refresh token,
with deployment-configurable limits. This is a renewable login session rather
than a bounded API usage credential.

The extension will not copy that page storage, retain a refresh token, ask for
a password, or silently attach an account login session. Doing so would give a
usage dashboard a broader and longer-lived credential than the API-key
connector needs, complicate logout and account-switch revocation, and create a
second credential lifecycle for every independently operated deployment.

Consequently account-dashboard enrichment is unsupported in the first release.
The runtime exposes no account-session secret slot and calls none of these
account endpoints. Group and endpoint aggregation stay on the configured
Sub2API dashboard; compact and detail surfaces use only the explicit
`api_key`-scoped `/v1/usage` result.

A future review may evaluate an explicitly attached, already-open dashboard tab
that performs the account request inside the page's main world and returns only
a normalized aggregate. Such a design must never export either token to the
extension, must bind results to the exact configured origin and an opaque
account fingerprint, and must immediately detach on logout, account change,
origin change, tab removal, or permission revocation. This candidate is not a
shipped fallback and must not make the API-key connector depend on a live page.

Upstream evidence for this decision is pinned to the reviewed commit:

- [frontend bearer attachment and refresh rotation](https://github.com/Wei-Shaw/sub2api/blob/2730c1c43b29be003925b033f3f9e645e726bb8c/frontend/src/api/client.ts#L62-L67)
- [frontend token storage and logout](https://github.com/Wei-Shaw/sub2api/blob/2730c1c43b29be003925b033f3f9e645e726bb8c/frontend/src/api/auth.ts#L31-L83)
- [authenticated user usage routes](https://github.com/Wei-Shaw/sub2api/blob/2730c1c43b29be003925b033f3f9e645e726bb8c/backend/internal/server/routes/user.go#L86-L100)
- [default access and refresh lifetimes](https://github.com/Wei-Shaw/sub2api/blob/2730c1c43b29be003925b033f3f9e645e726bb8c/backend/internal/config/config.go#L2095-L2097)

## Transport, Permission, And Failure Policy

- Ask for optional access to the exact configured origin, never a global
  required origin.
- Validate response content type, maximum body size, numeric bounds, array
  limits, and supported envelopes before normalization.
- Coalesce simultaneous surface refreshes and use the existing synchronization
  interval rather than adding a timer.
- Preserve the last successful snapshot on timeout, permission denial, HTTP
  failure, or protocol drift.
- Treat `401` and `403` as credential/access failures, `429` according to
  `Retry-After`, and transient network or server errors with bounded backoff.
- Never convert a malformed response into zero balance, zero spend, or a
  healthy status.

## UI Information Budget

Compact surfaces should answer four questions without reproducing the source
dashboard:

1. Is this wallet, quota, or subscription source still usable?
2. What balance or real configured limit remains?
3. What was the selected-period actual spend and request/token volume?
4. Which models and recent days dominate usage?

The detail surface may add reference cost, token-class breakdown, average
latency, RPM/TPM, and a bounded model trend. API-key management, raw logs,
channel status, endpoint/group breakdown, and CSV operations remain on the
source dashboard.

## Synthetic Discovery Fixtures

Fixtures under `fixtures/sub2api/` cover wallet, quota, subscription, and
account-dashboard modes. They use reserved example domains, invented model
labels, and synthetic values. The parser probe rejects credential fields,
account identifiers, malformed numbers, duplicate dates, oversized arrays,
oversized bodies, and scope/endpoint mismatches.

These fixtures document the selected protocol; they are not captured account
responses and contain no data from the deployment shown in the original
screenshots.
