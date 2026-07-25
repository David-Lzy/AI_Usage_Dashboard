# Store Listing Copy Pack

Date: 2026-07-26

Process rule:

- follow [CONTRIBUTING.md](../../CONTRIBUTING.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this is the maintained English source copy pack for the current Chrome Web Store listing
- primary upload locale copy is maintained in the product-description files in this directory
- keep provider/product names unchanged and do not strengthen partial provider support claims

## Store Fields

Title:

`AI Usage Dashboard`

Short description:

`Track usage, setup blockers, and sync health across AI coding tools.`

Collapsed-view abstract:

`AI Usage Dashboard is a small cockpit for AI coding quota, setup blockers, and sync health. Open the Chrome toolbar popup for a quick peek; open the side panel or full-page dashboard when you need details. Less tab-hunting, more coding. (^_^)`

Details:

`It supports Codex, Cursor, Claude Personal, Claude Code organization analytics, Gemini Code Assist, configured Sub2API-compatible gateways, and related coding workflows while clearly labeling whether each source is exact, partial, window-scoped, policy-only, or unavailable. It does not ask you to paste cookies or raw browser auth headers. Settings, optional API credentials, page bindings, cached snapshots, import/export files, and Chrome Sync data stay in your Chrome profile.`

`Open the toolbar popup to check provider health, setup blockers, usage windows, reset timing, source type, snapshot freshness, sync status, toolbar badge behavior, toolbar icon behavior, custom HTTP/HTTPS JSON sources, configured Sub2API gateway aggregates, language, theme, popup appearance, progress style, remaining-color gradients, provider order, and import/export settings. Open the side panel or full-page dashboard when source details matter.`

`AI coding assistants are fast and useful, but quota pages and account states can be easy to lose track of. AI Usage Dashboard gives you one calm place to glance at the current state, then lets you open the detail view only when you need it. A tiny dashboard, not another project to manage. ✨`

`Provider coverage is intentionally honest. Some paths can show live or near-live usage windows, some expose partial page context, some are policy-only in this release, and some providers may require a signed-in page, optional host access, or API credentials. First-run provider cards show a focused Grant access action when host permission is the blocker. When a source is unavailable or partial, the extension labels that state instead of inventing a number.`

`Privacy and permissions stay conservative: no cookie pasting, no raw browser auth header pasting, optional host permissions only for supported provider origins, custom JSON sources fetch user-approved HTTP or HTTPS endpoints with browser credentials omitted, favicon permission only for the optional provider-matched toolbar icon feature, local image-based gradients are processed in the browser without uploading or saving original image bytes, packaged scripts only, and no remote code loading.`

`This is not an official product from OpenAI, Cursor, Anthropic, Google, JetBrains, or any other provider. Provider dashboards, APIs, quota wording, and policies can change. When a source is unavailable or partial, the dashboard labels that state instead of inventing a value.`

`The project is open source under AGPL-3.0-only: https://github.com/David-Lzy/AI_Usage_Dashboard`

Feature bullets:

- `Toolbar popup for quick provider and quota checks`
- `Side panel and full-page dashboard for deeper review`
- `Source labels for exact, partial, window-scoped, policy-only, or unavailable data`
- `Custom HTTP/HTTPS JSON sources and configured Sub2API-compatible gateway aggregates`
- `Traditional progress bands or editable remaining-color gradients`
- `Configurable themes, progress styles, provider order, toolbar badge, and toolbar icon`
- `Import/export and Chrome Sync support for extension settings`
- `Open-source code under AGPL-3.0-only`

Screenshot captions:

- `Check provider status and quota rings from the toolbar popup.`
- `Review enabled providers in one dashboard.`
- `Inspect source boundaries before trusting a number.`
- `Tune language, theme, sync, badge, icon, and progress display.`
- `Use quick setup and provider display controls without leaving the extension.`

## Claim Guardrails

- Do not claim live usage for policy-only providers.
- Do not claim exact remaining quota where the shipped path is partial or window-scoped.
- Do not claim JetBrains live support while its shipped source remains policy-only.
- Do not market the popup as a second full dashboard.
- Mention `favicon` only for the provider-matched toolbar icon feature.
- Mention custom JSON sources as user-approved HTTP/HTTPS endpoints with browser credentials omitted.
- Mention Sub2API only as a user-configured, API-key-scoped compatible gateway;
  do not imply account-dashboard or raw request-record import.
- Mention local image gradients only as in-browser processing; do not imply uploaded image analysis.
