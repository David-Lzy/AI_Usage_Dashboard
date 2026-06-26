# Privacy

AI Usage Dashboard helps users review AI coding tool usage, setup blockers, and sync health from a Chrome toolbar popup, side panel, and full-page dashboard.

## Data The Extension Handles

Depending on which providers and features a user enables, the extension may store:

- extension settings and display preferences
- provider enablement and source preferences
- optional API credentials entered by the user
- page bindings for supported signed-in provider usage pages
- cached usage snapshots and sync diagnostics
- custom JSON source settings, including endpoint URLs and refresh intervals
- normalized custom JSON source snapshots and sync diagnostics
- exported/imported configuration JSON files

These values are stored in the user's Chrome profile through Chrome extension storage. If the user enables Chrome Sync support for extension settings, Chrome may sync eligible settings through the user's signed-in Chrome account according to Chrome's own sync behavior.

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

## Favicon Permission

The Chrome `favicon` permission is used for the toolbar icon matching feature. When enabled by the user, the extension can display an icon that matches the selected provider badge/source, such as the favicon associated with a supported provider page. The permission is not used for browsing-history collection.

## Remote Code

The extension does not load or execute remote code. Runtime scripts are packaged with the extension build.

## Third-Party Services

This project is not an official product from OpenAI, Cursor, Anthropic, Google, JetBrains, or any other provider. Provider dashboards, APIs, quota policies, and page layouts can change independently.

## Open Source

The source code is published under GNU AGPL-3.0-only. See `LICENSE` for the license text.
