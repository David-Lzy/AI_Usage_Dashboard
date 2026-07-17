# Privacy

AI Usage Dashboard helps users review AI coding tool usage, setup blockers, and sync health from a Chrome toolbar popup, side panel, and full-page dashboard.

## Data The Extension Handles

Depending on which providers and features a user enables, the extension may store:

- extension settings and display preferences
- provider enablement and source preferences
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

## Favicon Permission

The Chrome `favicon` permission is used for the toolbar icon matching feature. When enabled by the user, the extension can display an icon that matches the selected provider badge/source, such as the favicon associated with a supported provider page. Successfully resolved provider favicon images may be cached locally for up to 7 days so the extension does not repeatedly ask Chrome for the same icon. The permission is not used for browsing-history collection.

## Remote Code

The extension does not load or execute remote code. Runtime scripts are packaged with the extension build.

## Third-Party Services

This project is not an official product from OpenAI, Cursor, Anthropic, Google, JetBrains, or any other provider. Provider dashboards, APIs, quota policies, and page layouts can change independently.

## Open Source

The source code is published under GNU AGPL-3.0-only. See `LICENSE` for the license text.
