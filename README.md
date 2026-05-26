# AI Usage Dashboard

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](./LICENSE)

AI Usage Dashboard is a Chrome extension for checking AI coding tool quota,
setup blockers, and sync health from one toolbar popup, side panel, or full-page
dashboard.

- Chrome Web Store: https://chromewebstore.google.com/detail/ai-usage-dashboard/mjfhaifoapcpbkffacidgjijcpiegjea
- Source: https://github.com/David-Lzy/AI_Usage_Dashboard
- Documentation entry point: [Doc/README.md](./Doc/README.md)

## What It Does

- Shows a compact toolbar popup for quick provider health and quota checks.
- Opens a side panel or full-page dashboard for provider detail, source labels,
  setup guidance, and sync diagnostics.
- Keeps provider data boundaries visible: exact values, partial values,
  window-scoped values, policy-only data, or unavailable data are labeled
  differently.
- Lets users tune language, theme, popup appearance, progress style,
  remaining-color appearance, provider order, toolbar badge behavior, and
  toolbar icon behavior.
- Supports configuration import/export and Chrome Sync for extension settings.

## Supported Providers

| Provider | Current source path | Current boundary |
| --- | --- | --- |
| Codex | Enterprise analytics or signed-in Codex usage page | Live usage windows where visible; no plan-wide absolute remaining balance is invented. |
| Cursor | Team Admin API or signed-in personal dashboard page | Team/API data or personal billing-period context; exact remaining included personal requests are not claimed. |
| Claude Code | Admin analytics or signed-in Claude Team usage page | Partial/window-scoped usage where available; exact all-plan remaining subscription quota is not claimed. |
| Gemini Code Assist | Documented quota policy | Policy-only in this release. |
| JetBrains AI | Retained implementation path | Deferred from the active release promise until org-visible usage evidence is reverified. |

This extension is not an official product from OpenAI, Cursor, Anthropic,
Google, JetBrains, or any other provider.

## Privacy And Permissions

AI Usage Dashboard is intentionally conservative:

- It does not ask you to paste cookies.
- It does not ask you to paste raw browser auth headers.
- It stores extension settings, optional API credentials, page bindings, cached
  snapshots, and import/export files in your Chrome profile.
- Optional host permissions are requested only for supported provider origins.
- The `favicon` permission is used only for the optional provider-matched
  toolbar icon feature.
- It does not load or execute remote code.

See [PRIVACY.md](./PRIVACY.md) and [SECURITY.md](./SECURITY.md).

## Progress Appearance

The Settings page can keep progress colors in the traditional remaining-percent
bands, or switch them to a one-dimensional gradient used by popup, side panel,
full-page dashboard, provider detail, and preview progress surfaces. Gradient
mode includes local presets and editable stops.

Users can also generate a gradient from a local PNG, JPEG, or WebP image. The
image is processed in the browser by averaging pixels vertically across the
image width; the original image, filename, metadata, and image bytes are not
uploaded or saved. Only the generated gradient stops are stored as settings.

## Install From Source

```sh
npm install
npm run build
```

Then open `chrome://extensions`, enable Developer mode, choose "Load unpacked",
and select the generated `dist/chrome/` directory.

## Development

Requirements:

- Node.js `>=22.12.0`
- npm

Useful commands:

```sh
npm run dev
npm run test
npm run typecheck
npm run build
npm run release:check
```

Experimental Firefox local build checks:

```sh
npm run firefox:build
npm run firefox:lint
npm run firefox:package
```

The default `npm run build` output is the Chrome extension in `dist/chrome/`.
Firefox output is generated under `dist/firefox/` for local MVP testing.
Set `FIREFOX_BIN=/path/to/firefox` when you need to choose a specific Firefox
binary for `npm run firefox:run`.

Release packaging:

```sh
npm run release:package
```

The generated zip is written under `release/`.

## Automated Packages

Pushes to `main` run GitHub Actions checks and upload temporary Chrome and
Firefox package artifacts from the workflow run. Version tags such as
`v0.1.0-rc.26` create a GitHub Release with Chrome and Firefox package zips plus
SHA-256 checksums.

For everyday Chrome users, the Chrome Web Store listing remains the recommended
install path. GitHub Chrome zips are intended for developer-mode loading,
review, and manual testing. The Firefox package is currently a local beta build;
ordinary Firefox installation needs a signed AMO/self-distribution package in a
future release flow.

## Current Release State

- Chrome Web Store listing: published and reachable.
- Current public-store metadata observed on 2026-05-20: `0.1.0-rc.24`.
- Current local package version: `0.1.0-rc.26`.
- Current local Chrome manifest version: `0.1.0.26`.
- Store publication status is tracked in
  [Doc/Store/Chrome_Web_Store_Publication_Milestone.md](./Doc/Store/Chrome_Web_Store_Publication_Milestone.md).
- Public listing copy lives in [Doc/Store](./Doc/Store/).

Release zip files, package hashes, upload receipts, and personal submission
handoff notes are intentionally kept out of the public repository.

## Contributing

Contributions are welcome. Start with:

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [Doc/README.md](./Doc/README.md)
- [Doc/Product/Provider_Setup_Display_Product_Contract.md](./Doc/Product/Provider_Setup_Display_Product_Contract.md)

Please keep provider source claims conservative. If a provider exposes only
partial, window-scoped, or policy-only data, UI and docs should say that
plainly.

## License

This project is licensed under the [GNU Affero General Public License v3.0 only](./LICENSE).

Copyright (c) 2026 [David-Lzy](https://github.com/David-Lzy).
