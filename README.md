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
- Lets users tune language, theme, popup appearance, progress style, provider
  order, toolbar badge behavior, and toolbar icon behavior.
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

## Install From Source

```sh
npm install
npm run build
```

Then open `chrome://extensions`, enable Developer mode, choose "Load unpacked",
and select the generated `dist/` directory.

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

Release packaging:

```sh
npm run release:package
```

The generated zip is written under `release/`.

## Current Release State

- Current package candidate: `0.1.0-rc.24`
- Current Chrome manifest version: `0.1.0.24`
- Current package artifact: `release/ai-usage-dashboard-0.1.0-rc.24.zip`
- Chrome Web Store currently lists an older public version; RC24 is the prepared
  resubmission candidate.
- no numbered phase is currently queued after `Phase 524`.

Detailed release and store handoff records live in [Doc/Milestones](./Doc/Milestones/)
and [Doc/Store](./Doc/Store/).

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
