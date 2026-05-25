# Privacy

AI Usage Dashboard helps users review AI coding tool usage, setup blockers, and sync health from a Chrome toolbar popup, side panel, and full-page dashboard.

## Data The Extension Handles

Depending on which providers and features a user enables, the extension may store:

- extension settings and display preferences
- provider enablement and source preferences
- optional API credentials entered by the user
- page bindings for supported signed-in provider usage pages
- cached usage snapshots and sync diagnostics
- exported/imported configuration JSON files

These values are stored in the user's Chrome profile through Chrome extension storage. If the user enables Chrome Sync support for extension settings, Chrome may sync eligible settings through the user's signed-in Chrome account according to Chrome's own sync behavior.

## Local Image Gradient Import

If a user imports an image to generate a progress-color gradient, the image is decoded and sampled locally in the browser. The extension uses the image only to compute a small list of gradient stops. It does not upload the image, and it does not store the original image bytes, data URL, filename, EXIF metadata, or raw pixel data.

## Provider Page Access

The extension requests optional host access only for supported provider origins. When the user grants access to a supported signed-in usage page, packaged extension code reads visible usage information needed for quota and sync status. If the page is signed out, unavailable, or no longer exposes parseable usage information, the extension reports that state instead of inventing a value.

The extension does not ask users to paste cookies or raw browser authentication headers.

## Favicon Permission

The Chrome `favicon` permission is used for the toolbar icon matching feature. When enabled by the user, the extension can display an icon that matches the selected provider badge/source, such as the favicon associated with a supported provider page. The permission is not used for browsing-history collection.

## Remote Code

The extension does not load or execute remote code. Runtime scripts are packaged with the extension build.

## Third-Party Services

This project is not an official product from OpenAI, Cursor, Anthropic, Google, JetBrains, or any other provider. Provider dashboards, APIs, quota policies, and page layouts can change independently.

## Open Source

The source code is published under GNU AGPL-3.0-only. See `LICENSE` for the license text.
