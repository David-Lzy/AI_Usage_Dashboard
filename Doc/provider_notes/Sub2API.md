# Sub2API Provider Note

Date: 2026-07-25

Process rule:

- follow [CONTRIBUTING.md](../../CONTRIBUTING.md)

Document class:

- maintained reference

Freshness model:

- refresh this note whenever the supported Sub2API user endpoint, its scope,
  or its authentication contract changes

Status note:

- the API-key connector is shipped behind explicit deployment setup and remains
  hidden by default until the user configures a deployment
- account-dashboard enrichment remains gated on a separately verified contract

## 1. Decision

Selected source entry:

- `sub2api-api-key`

Selected first connection path:

- a user-configured Sub2API deployment origin
- a Sub2API API key stored in extension-local, account-isolated secret storage
- `GET <deployment-origin>/v1/usage`

This connector is disabled by default. It does not inspect or activate the
deployment dashboard.

## 2. Scope Boundary

The selected endpoint reports the configured API key's usage scope. It must not
be described as deployment-wide or account-wide totals.

Depending on deployment configuration, the response may describe:

- wallet balance
- quota usage and remaining value
- subscription usage and limits
- rate-limit windows
- request and token summaries
- daily usage and model breakdowns

Fields not present in the response remain unavailable. The adapter does not
invent a reset window, currency, balance, or cost conversion.

Account-dashboard enrichment is a separate, optional future path documented in
[Sub2API User Usage Contract](../Product/Sub2API_User_Usage_Contract.md). It is
not part of the API-key connector.

## 3. Authentication And Host Access

The request uses:

```text
Authorization: Bearer <sub2api-api-key>
```

The key is sent only to the configured deployment origin. The extension rejects
embedded URL credentials, paths, queries, fragments, unsupported schemes,
cross-origin redirects, non-JSON responses, and oversized response bodies.

HTTPS is recommended. HTTP remains available for local or explicitly accepted
deployments, but the UI must warn that transport encryption is absent.

Chrome host permissions are requested for the configured scheme and host. Match
patterns cannot isolate a TCP port, so the request client additionally enforces
the exact configured origin at runtime.

## 4. Refresh And Failure Policy

The connector uses the shared Provider source-strategy orchestrator:

- automatic duplicate results are reused for at least 60 seconds
- concurrent surfaces share one in-flight request
- recent history can be retained for 15 minutes when a partial response omits
  history fields
- `401` and `403` require credential repair
- `429` honors `Retry-After`
- network and server failures use bounded retry policy
- failures retain the last successful normalized snapshot and mark it stale

No independent timer is added. The connector follows the dashboard's existing
refresh schedule.

## 5. Data And Privacy

Stored data is limited to normalized aggregate metering. The extension does not
store:

- raw response bodies
- request headers
- cookies
- dashboard page text
- direct account identifiers
- the API key in AppState, configuration backup, Chrome Sync, logs, fixtures,
  or public exports

The API key is excluded from configuration backup and remains in the active
browser profile's extension-local secret storage.

## 6. Upstream Basis

Contract discovery used the public `Wei-Shaw/sub2api` repository at pinned
commit `2730c1c`. The upstream project is licensed under LGPL-3.0.

The dashboard implementation does not copy the upstream server or UI. It
reimplements a narrow TypeScript client against the observed user endpoint and
uses synthetic fixtures. Internal endpoints may change between deployments or
upstream versions and are not described as a public vendor guarantee.

## 7. Verification Assets

- [API-key wallet fixture](../../fixtures/sub2api/api-key-wallet.fixture.json)
- [API-key quota fixture](../../fixtures/sub2api/api-key-quota.fixture.json)
- [API-key subscription fixture](../../fixtures/sub2api/api-key-subscription.fixture.json)
- [Contract parser probe](../../scripts/lib/sub2api-usage-contract.mjs)
- `src/providers/sub2api/client.test.ts`
- `src/providers/sub2api/adapter.test.ts`
