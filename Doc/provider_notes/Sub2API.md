# Sub2API Provider Note

Date: 2026-07-28

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
- account-dashboard enrichment was reviewed and is intentionally unsupported in
  the first release because it uses the deployment's renewable login session

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

Account-dashboard enrichment is a separate scope documented in
[Sub2API User Usage Contract](../Product/Sub2API_User_Usage_Contract.md). The
pinned frontend stores access and refresh tokens in page `localStorage` and
rotates them after authentication failures. The extension does not copy or
persist that renewable login session, so account-level group and endpoint
breakdowns are intentionally not part of the first release.

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

## 4. Settings And Multiple Deployments

Settings exposes a dedicated Sub2API deployment editor. A deployment consists
of a local display label, one exact HTTP or HTTPS origin, and one API key. The
API key field is never prefilled after save. Leaving it blank while editing an
existing deployment keeps the account-scoped saved key.

Multiple deployments use opaque local account IDs. Each deployment keeps its
own connection metadata, credential, normalized snapshot, last-success state,
and per-surface module preferences. The selected deployment is the only one
used by Sidebar, Dashboard, detail, and the automatic refresh schedule. Popup
can either select one deployment, cycle to the next deployment, or render one
card for each deployment's last successful normalized snapshot. Interacting
with an inactive Popup card selects that deployment before continuing. Inactive
deployments are not refreshed concurrently, provider visibility is preserved
when selection changes, and values are never aggregated across deployments.

The deployment editor exposes the Popup presentation preference only when more
than one deployment exists. The choices are dropdown selection, a compact next
button, and separate cards. The saved preference is provider-scoped and portable
with the rest of the nonsecret application settings.

The deployment editor distinguishes the following operations:

- **Save** stores validated local metadata and an optional replacement key.
- **Test** requests optional access for the exact scheme and host, then runs the
  shared provider refresh with a bounded 20-second countdown so permission,
  authentication, compatibility, scope, and transport failures remain
  separately diagnosable. The editor reports success, failure, or timeout
  without exposing the saved key.
- **Disconnect** removes the saved key and connection metadata. The user can
  explicitly retain the last nonsecret summary as stale data or clear it.
- **Remove deployment** deletes a non-default deployment, its isolated
  snapshot, local metadata, and account-scoped key.

Non-loopback HTTP requires an explicit persistent acknowledgement in the
editor. Loopback HTTP is accepted for local gateways without that warning.
Configuring an origin never implies that its operator is affiliated with
Sub2API or this extension.

Usage summary, trend, leading-model, and returned-limit modules can be hidden
and reordered independently for Popup, Sidebar, and Full-page surfaces. These
preferences remain local to the selected deployment.

## 5. Refresh And Failure Policy

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

## 6. Data And Privacy

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

There is no Sub2API account-session, refresh-token, password, cookie, or direct
account-identifier slot in extension storage. The adapter never calls the
account dashboard endpoints. A failed API-key refresh cannot trigger a page
reload or account-session recovery attempt.

## 7. Surface Presentation

Popup, Sidebar, and Dashboard cards use a compact account-local summary. The
Provider detail page adds only aggregate decision support returned by
`/v1/usage`: actual and reference cost, estimated savings when units match,
request and token totals, average latency, a bounded daily trend, leading
models, token classes, and explicit rate-limit windows.

Unavailable fields are omitted from the detail summary rather than rendered as
zero. The generic provider quota placeholders are also suppressed when this
metering model is present. Range, metric, collapse, visibility, and module-order
preferences are scoped to the opaque local account and surface.

The detail page links back to the configured deployment for raw logs, channel
status, key administration, CSV, and advanced filters. It does not render raw
request rows, endpoint paths, group names, key labels, prompts, response
content, or direct identities.

## 8. Upstream Basis

Contract discovery used the public `Wei-Shaw/sub2api` repository at pinned
commit `2730c1c`. The upstream project is licensed under LGPL-3.0.

The dashboard implementation does not copy the upstream server or UI. It
reimplements a narrow TypeScript client against the observed user endpoint and
uses synthetic fixtures. Internal endpoints may change between deployments or
upstream versions and are not described as a public vendor guarantee.

## 9. Verification Assets

- [API-key wallet fixture](../../fixtures/sub2api/api-key-wallet.fixture.json)
- [API-key quota fixture](../../fixtures/sub2api/api-key-quota.fixture.json)
- [API-key subscription fixture](../../fixtures/sub2api/api-key-subscription.fixture.json)
- [Contract parser probe](../../scripts/lib/sub2api-usage-contract.mjs)
- `src/providers/sub2api/client.test.ts`
- `src/providers/sub2api/adapter.test.ts`
