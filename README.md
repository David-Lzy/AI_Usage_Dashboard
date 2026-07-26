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
  Provider cards can collapse individually, use edge or top switching, or
  auto-glide vertically with active-pointer/focus pause; collapsible cards are
  the default.
- Opens a side panel or full-page dashboard for provider detail, source labels,
  setup guidance, and sync diagnostics.
- Shows focused first-run access actions when a provider needs optional host
  permission before live sync can run.
- Shows normalized Codex daily usage history and turn trends when the signed-in
  ChatGPT session exposes the verified structured usage responses. Current
  quota first discovers the local session from the extension background worker
  without opening or activating a ChatGPT tab, then falls back to the signed-in
  page when browser policy or protocol changes block that path. Each history
  module can be hidden independently per popup, side-panel, or full-page
  surface, with an independent 7-day or 1-month view selected from its
  date-range button.
- Shows normalized Cursor billing-cycle value, included model/API pools,
  On-Demand charges, and bounded 7/30-day aggregate trends when the signed-in
  Cursor session exposes the verified structured responses. Billing summary
  refresh runs from the extension background worker without activating the
  Cursor tab; signed-in page capture remains the bounded history and fallback
  path. Billing and history modules can be hidden and reordered independently
  on each surface.
- Keeps provider data boundaries visible: exact values, partial values,
  window-scoped values, policy-only data, or unavailable data are labeled
  differently.
- Can display user-configured custom HTTP or HTTPS JSON quota sources as
  separate, clearly labeled custom sources.
- Can connect explicitly configured Sub2API-compatible gateways through the
  bounded `GET /v1/usage` API-key contract. Multiple deployments remain
  isolated, only the selected deployment refreshes automatically, and raw
  request records stay on the source dashboard.
- Lets users tune language, theme, popup appearance, progress style,
  remaining-color appearance, provider order, toolbar badge behavior, and
  toolbar icon behavior. Quota reset labels can use localized date-and-time,
  weekday-and-time, or combined formatting across all display surfaces.
- Theme choices include light, dark, system, and a local-time schedule. The
  schedule uses only the device clock (light from 07:00 to 19:00) and does not
  request or read location.
- Supports configuration import/export and Chrome Sync for extension settings.

## Supported Providers

| Provider | Current source path | Current boundary |
| --- | --- | --- |
| Codex | Enterprise analytics or signed-in Codex usage page | Live usage windows where visible; no plan-wide absolute remaining balance is invented. |
| Cursor | Team Admin API or signed-in Usage/Spending pages | Team/API data or normalized personal billing pools and aggregate history; plan value is kept separate from actual On-Demand charges, and exact remaining personal requests are not invented. |
| Claude | Signed-in Claude Personal usage page or Claude Code Analytics Admin API | Personal Pro usage windows and usage-credit state where source-visible, or separate organization analytics; exact plan-wide remaining quota is not invented. |
| Sub2API | User-configured deployment and API key | Key-scoped aggregate balance, spend, requests, tokens, trends, models, and returned limits; account-dashboard sessions and raw request records are not imported. |
| Gemini Code Assist | Documented quota policy | Policy-only in this release. |
| JetBrains AI | Retained implementation path | Deferred from the active release promise until org-visible usage evidence is reverified. |

This extension is not an official product from OpenAI, Cursor, Anthropic,
Google, JetBrains, or any other provider.

## Privacy And Permissions

AI Usage Dashboard is intentionally conservative:

- It does not ask you to paste cookies.
- It does not ask you to paste raw browser auth headers.
- It stores extension settings, optional API credentials, page bindings, cached
  snapshots, custom source settings, normalized custom source snapshots,
  locally cached provider favicon images for toolbar icon matching, and
  import/export files in your Chrome profile.
- Optional host permissions are requested for supported provider origins and
  for user-approved custom source HTTP/HTTPS endpoint origins.
- Custom JSON sources fetch user-configured HTTP or HTTPS endpoints with
  browser credentials omitted; raw response bodies are not stored or rendered.
- Sub2API API keys stay in account-isolated extension-local secret storage and
  are sent only to the exact configured deployment origin. Non-loopback HTTP
  requires an explicit warning acknowledgement; HTTPS is recommended.
- Codex personal sync reuses a short-lived ChatGPT access token in
  `chrome.storage.session` and sends it only to `chatgpt.com`. It is not added
  to AppState, Chrome Sync, configuration backups, logs, or fixtures. Advanced
  recovery can accept a bare temporary access token, but rejects cookies,
  authentication JSON, refresh tokens, and complete Authorization headers. The
  background worker asks the signed-in ChatGPT session for this temporary token;
  browser cookies and the raw session response are neither read nor stored by
  the extension.
- Codex history capture keeps only bounded normalized daily aggregates in the
  cached provider snapshot. Raw network responses, page body text, cookies,
  request headers, and account identifiers are not stored. The personal
  session endpoints are internal page contracts rather than a public API and
  can temporarily degrade to the page fallback when ChatGPT changes them.
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

## Motion Preferences

The Animation effects preference under Appearance & Sync controls motion across
popup, side panel, full-page, Settings, and preview surfaces. `On` is the
default and keeps app motion enabled even when the operating system requests
reduced motion; `Reduced` consistently minimizes animation, transitions, and
smooth scrolling; `Follow system` tracks the browser's current reduced-motion
preference.

## Quota Pace Estimate

Advanced appearance settings include a default-off quota pace estimate for
Provider detail. It compares elapsed time with percentage used only for fresh,
fixed-duration usage windows. Unknown, stale, expired, or newly started windows
show no estimate. Pace is derived locally for presentation and is never stored
as provider source data or used to change alerts, badges, or refresh behavior.

## Custom JSON Sources

Settings can add client-provided HTTP or HTTPS JSON endpoints for quota data
outside the verified built-in providers. Responses are validated against the
public `ai-usage-dashboard.custom-source.v1` schema, displayed with a `Custom`
label, and never treated as official provider data. See
[Doc/Product/Custom_JSON_Sources.md](./Doc/Product/Custom_JSON_Sources.md) for
the JSON contract and examples.

The repository also includes an experimental, manually started Node
[Local Companion Bridge](./Doc/Product/Local_Companion_Bridge.md) for serving
explicitly selected local `custom-source.v1` files over authenticated loopback.
Settings additionally offers an opt-in adapter for the authenticated,
schema-versioned `codexbar serve` dashboard snapshot. Neither local process is
installed, started, discovered, or updated by the extension, and accepted
CodexBar rows remain separate Custom Sources rather than built-in Providers.

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
npm run firefox:lint:baseline
npm run firefox:package
```

The default `npm run build` output is the Chrome extension in `dist/chrome/`.
Firefox output is generated under `dist/firefox/` for local MVP testing.
`npm run firefox:lint:baseline` keeps the local beta lint surface pinned to the
current known React runtime warnings and fails if new web-ext warnings appear.
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
`v0.1.0-rc.28` create a GitHub Release with Chrome and Firefox package zips plus
SHA-256 checksums. When the Chrome Web Store API variables and service-account
secret are configured, version tags can also upload the Chrome zip to the
Chrome Web Store and submit it for review automatically.

For everyday Chrome users, the Chrome Web Store listing remains the recommended
install path. GitHub Chrome zips are intended for developer-mode loading,
review, and manual testing. The Firefox package is currently a local beta build;
ordinary Firefox installation needs a signed AMO/self-distribution package in a
future release flow.

Release push rules, browser-specific asset names, and the GitHub Release notes
template, including the optional Chrome Web Store API handoff, are documented in
[Doc/Store/GitHub_Release_Push_And_Notes.md](./Doc/Store/GitHub_Release_Push_And_Notes.md).

## Current Release State

- Chrome Web Store listing: published and reachable.
- Chrome Web Store API status observed on 2026-07-26: manifest version
  `0.2.0.8` published at 100%.
- Current local package version: `0.2.0-rc.10`.
- Current local Chrome manifest version: `0.2.0.10`.
- GitHub Release `v0.2.0-rc.10` provides separate Chrome and Firefox packages
  plus SHA-256 checksums.
- Chrome Web Store API status observed on 2026-07-26: manifest version
  `0.2.0.9` is submitted and `PENDING_REVIEW` at 100% deployment.
- The `0.2.0.9` revision must not be described as published until the Chrome
  Web Store API reports it as published.
- The `0.2.0.10` package has not been submitted to the Chrome Web Store and
  must not be described as submitted or published there.
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

## Contributors

- [donaldpeng17](https://github.com/donaldpeng17) - fixed a Claude Code
  personal-user dashboard issue in
  [#1](https://github.com/David-Lzy/AI_Usage_Dashboard/pull/1).

## License

This project is licensed under the [GNU Affero General Public License v3.0 only](./LICENSE).

Copyright (c) 2026 [David-Lzy](https://github.com/David-Lzy).
