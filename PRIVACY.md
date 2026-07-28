# Privacy

AI Usage Dashboard helps users review AI coding tool usage, setup blockers, and sync health from a Chrome toolbar popup, side panel, and full-page dashboard.

## Data The Extension Handles

Depending on which providers and features a user enables, the extension may store:

- extension settings and display preferences
- provider enablement and source preferences
- opaque local provider-account aliases and isolated cached snapshots when a
  future provider explicitly enables multi-account support
- optional API credentials entered by the user
- page bindings for supported signed-in provider usage pages
- cached usage snapshots and sync diagnostics
- bounded normalized daily provider history aggregates when a supported signed-in
  page exposes a verified structured history response
- locally cached provider favicon images for toolbar icon matching
- custom JSON source settings, including endpoint URLs and refresh intervals
- normalized custom JSON source snapshots and sync diagnostics
- exported/imported configuration JSON files

These values are stored in the user's Chrome profile through Chrome extension storage. If the user enables Chrome Sync support for extension settings, Chrome may sync eligible settings through the user's signed-in Chrome account according to Chrome's own sync behavior.

Provider account ids are generated locally and do not use provider account
ids, email addresses, or workspace identifiers. Account-specific credentials,
runtime snapshots, and local aliases are excluded from configuration backup
and Chrome Sync. Sub2API uses this model to isolate user-named deployments;
other built-in source entries continue to use one `default` account unless
their descriptor has a separately verified multi-account contract.

Codex personal sync may temporarily cache a short-lived ChatGPT access token in
`chrome.storage.session`. This session credential is separate from AppState and
is not included in Chrome Sync, configuration backups, import/export files,
logs, fixtures, or cached provider snapshots. If `storage.session` is
unavailable, including on a browser implementation that does not expose it,
the credential remains only in service-worker memory. It is cleared with the
browser session or extension lifecycle.

## Local Image Gradient Import

If a user imports an image to generate a progress-color gradient, the image is decoded and sampled locally in the browser. The extension uses the image only to compute a small list of gradient stops. It does not upload the image, and it does not store the original image bytes, data URL, filename, EXIF metadata, or raw pixel data.

## Custom JSON Sources

If a user configures a custom JSON source, the extension fetches the configured
HTTP or HTTPS endpoint with browser credentials omitted. The current custom
source feature does not store or send custom request headers, API tokens,
cookies, or raw browser authentication material.

Chrome may ask the user to grant optional host access for the configured custom
source endpoint origin. That access is used only so the extension can fetch the
user-configured JSON endpoint; requests still use `credentials: omit`.

The extension validates the JSON response, stores only the normalized custom
source snapshot and sync diagnostics, and discards the raw response body. HTML
from a custom endpoint is not rendered, and scripts are not executed.

Configuration export can include custom source settings such as endpoint URL,
display name, description, enabled state, and refresh interval. Export does not
include raw response bodies.

## User-Configured Sub2API Deployments

Sub2API is an optional built-in API-gateway connector. A user explicitly
configures an HTTP or HTTPS deployment origin, a local display label, and an API
key. A compatible URL is not proof that the deployment is operated by Sub2API,
this project, or any endorsed service. Users are responsible for verifying the
deployment operator and its privacy policy.

The API key is stored only in account-isolated, extension-managed local secret
storage. It is excluded from AppState, Chrome Sync, configuration backups,
imports, exports, logs, fixtures, diagnostics, normalized snapshots, and
user-facing errors. The saved key is never displayed or prefilled after save.
The extension sends it only as a bearer credential to the exact configured
origin when requesting `GET /v1/usage`; cross-origin redirects are rejected.

Chrome requests optional host access for the configured scheme and host. The
request client additionally enforces the exact origin, including its port.
HTTPS is recommended. A non-loopback HTTP deployment requires an explicit
persistent acknowledgement because the API key is transmitted without
transport encryption. Loopback HTTP remains available for a local gateway.

Only bounded normalized aggregate values are retained: balance or returned
limits, spend and reference cost, request and token totals, up to 31 daily
buckets, bounded model summaries, latency, and returned rate-limit windows.
Raw responses, request rows, prompts, responses, endpoint paths, group names,
API-key lists, user identities, cookies, and account-dashboard login sessions
are not stored or imported. The account-level dashboard routes are not called.

Each configured deployment has an opaque local account id, isolated credential,
snapshot, last-sync state, and display preferences. Only the selected deployment
uses the existing automatic refresh schedule; inactive deployments are not
polled concurrently. Popup may show an inactive deployment's last successful
normalized summary as a separate card, but summaries are never combined and
interacting with that card selects its deployment first. Disconnecting always
removes the credential and connection
metadata. The user can explicitly choose whether to retain the last nonsecret
summary as stale data or remove it as well. Removing a deployment clears its
isolated local metadata, snapshot, and secret.

## Experimental Local Companion Bridge

The repository includes an optional experimental Node reference process for
serving explicitly selected `custom-source.v1` JSON files over loopback. The
extension does not install, start, discover, or update this process. The
reference process binds only to `127.0.0.1` or `::1`; it does not upload input
files and does not scan directories, browser profiles, credentials, or local
tools.

Pairing uses a one-time code and issues a revocable bearer token. The extension
stores that token only in extension-managed local secret storage. It is not
written to AppState, Chrome Sync, configuration backup, logs, fixtures,
normalized source snapshots, or user-facing errors. The token is sent only to
the explicitly configured loopback bridge. Restarting the reference process
invalidates its in-memory token.

Settings exposes an experimental, opt-in adapter for the versioned CodexBar
dashboard snapshot. CodexBar is separately installed third-party local
software; the extension does not install, start, discover, update, or control
it. A user must explicitly start `codexbar serve` with a strong dashboard
token, grant optional access to the configured `127.0.0.1` origin, and connect
the exact authenticated dashboard endpoint.

The CodexBar token is sent only in the `Authorization` header to that exact
loopback origin and remains in extension-managed local secret storage. It is
excluded from AppState, Chrome Sync, configuration backups, logs, fixtures,
exports, diagnostics, and user-facing errors. The saved connection contains
only the loopback endpoint. Accepted rows are schema-validated, stripped of
identity fields and raw error objects, and stored as bounded normalized Custom
Source snapshots. They never replace or merge with built-in Provider source
truth. Disconnecting removes the token and all CodexBar-managed rows.

## Provider Page Access

For built-in provider page sources, the extension requests optional host access
only for supported provider origins. When the user grants access to a supported
signed-in usage page, packaged extension code reads visible usage information
needed for quota and sync status. If the page is signed out, unavailable, or no
longer exposes parseable usage information, the extension reports that state
instead of inventing a value.

The extension does not ask users to paste cookies or raw browser authentication headers.

Codex personal sync first asks the signed-in ChatGPT session endpoint for a
short-lived access token from the extension background worker. This request
uses the already granted `chatgpt.com` host access and does not open, activate,
or wait for a ChatGPT tab. The browser attaches only cookies eligible for
`https://chatgpt.com`; extension code does not read, copy, log, persist, export,
or synchronize those cookies. The raw session response is discarded after the
temporary token and an optional explicit account identifier are extracted.

The extension then requests the signed-in ChatGPT session's internal usage
endpoints. Every usage request requires the same still-valid access token, but
the extension does not reacquire it for every request: it reuses the session
cache, merges concurrent refreshes, and reacquires only when the token is
missing, near expiry, or rejected as unauthorized. The token is sent only to
`https://chatgpt.com`. If background session discovery is rejected by browser
policy or a changed internal contract, the extension can use an already open
ChatGPT tab as a bounded compatibility fallback.

If automatic local session discovery is unavailable, Advanced Settings offers
an optional temporary recovery field for the bare access-token value. The
field rejects cookies, authentication JSON, refresh tokens, whitespace-bearing
payloads, and complete `Authorization` headers. The input is cleared after use
and the stored token is never displayed.

For Codex usage history, the extension observes only the verified structured
history responses while a user-triggered or scheduled provider refresh is in
progress. It validates and normalizes at most 31 daily buckets into the cached
provider snapshot, then removes the temporary observer. It does not store the
raw response, page body text, cookies, request headers, account identifiers, or
unrelated response fields. History is not included in configuration backups or
raw evidence exports. If the page response contract changes, history display
can become temporarily unavailable without replacing prior history with fake
zero values or blocking current quota refresh.

Current quota results are reused for 60 seconds during automatic refreshes;
daily history is reused for 15 minutes. Concurrent popup, side-panel,
full-page, and background refreshes share one in-flight request. Rate limits and
temporary failures enter bounded local cooldowns. If direct session access
fails, the extension can fall back to the signed-in page without creating or
activating a tab and otherwise retains the last successful normalized snapshot
with a stale warning.

For Cursor personal usage and billing, the extension first requests the known
billing-summary endpoints from its background worker with the browser's
existing `cursor.com` session. The browser attaches eligible site cookies only
to `https://cursor.com`; the extension does not read, copy, log, or persist
those cookies. This path uses the optional Cursor host access already granted
by the user and does not activate or focus a Cursor tab.

The extension also observes verified structured responses from the signed-in
Cursor Usage and Spending pages during bounded fallback and history refreshes.
It stores the normalized billing-cycle summary and at most 31 daily aggregate
buckets. It does not store individual request rows, raw responses, page body
text, cookies, request headers, account identifiers, or unrelated response
fields. Concurrent surfaces share one in-flight summary request, recent
automatic results are reused briefly, and failures enter bounded cooldowns.
Billing and history retain their last successful values independently, so a
delayed or changed page contract can produce a partial or saved-data state
without replacing valid data with fake zeroes. Cursor aggregates are not
included in configuration backups or raw evidence exports.

For Claude Personal, the extension uses optional `claude.ai` host access to
attach to the signed-in Settings > Usage surface. During a bounded refresh it
may temporarily observe only the allowlisted same-origin usage, prepaid-credit,
and extra-usage-limit responses needed to normalize plan identity, usage
windows, reset timing, and usage-credit state. The observer is removed when the
refresh completes or times out. Browser cookies remain attached by Chrome to
`claude.ai`; extension code does not read, copy, log, persist, export, or
synchronize them.

Claude Personal snapshots store only bounded normalized values such as the plan
label, active window percentages, reset timestamps, and available usage-credit
facts. Raw network responses, page body text, request headers, organization or
account identifiers, cookies, and unrelated response fields are discarded and
are not included in AppState, configuration backups, Chrome Sync, fixtures, or
raw evidence exports. A changed page contract can make the personal source
temporarily unavailable without replacing the last successful snapshot with
fake zero values. The separate Claude Code Analytics Admin API credential is an
organization-scoped optional secret and is not used by Claude Personal sync.

## Favicon Permission

The Chrome `favicon` permission is used for the toolbar icon matching feature. When enabled by the user, the extension can display an icon that matches the selected provider badge/source, such as the favicon associated with a supported provider page. Successfully resolved provider favicon images may be cached locally for up to 7 days so the extension does not repeatedly ask Chrome for the same icon. The permission is not used for browsing-history collection.

## Remote Code

The extension does not load or execute remote code. Runtime scripts are packaged with the extension build.

## Third-Party Services

This project is not an official product from OpenAI, Cursor, Anthropic, Google, JetBrains, or any other provider. Provider dashboards, APIs, quota policies, and page layouts can change independently.

## Open Source

The source code is published under GNU AGPL-3.0-only. See `LICENSE` for the license text.
