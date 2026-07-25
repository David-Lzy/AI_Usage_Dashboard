# Sub2API User Usage Contract

Date: 2026-07-25

Document class:

- maintained technical reference

Freshness model:

- reverify against the pinned upstream source before changing the runtime adapter

Status note:

- this document records discovery evidence and a bounded first-release contract
- no Sub2API runtime connector is shipped by this phase

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

## Account-Wide Conditional Capability

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

Account-session support is a conditional future gate. The core connector must
remain useful with only `/v1/usage`. If account enrichment is later enabled,
its credential, freshness, labels, failures, and UI modules must stay visibly
separate from the API-key snapshot.

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
