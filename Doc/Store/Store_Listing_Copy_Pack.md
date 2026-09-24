# Store Listing Copy Pack

Date: 2026-09-24

Process rule:

- follow [CONTRIBUTING.md](../../CONTRIBUTING.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this is the maintained English source copy pack for the 0.2.1 Store update;
  source text is not proof that the live listing has been changed
- primary upload locale copy is maintained in the product-description files in this directory
- keep provider/product names unchanged and do not strengthen partial provider support claims

## Store Fields

Title:

`AI Usage Dashboard`

Short description:

`See AI coding quotas, reset times, spend, and sync health in one place.`

Collapsed-view abstract:

`See AI coding quotas before they interrupt your work. AI Usage Dashboard brings source-visible limits, reset times, spending, and sync health into one Chrome extension. Use the toolbar popup for a quick check, or open the side panel and full-page dashboard for details.`

Details:

`It supports Codex, Cursor, Claude Personal, Claude Code organization analytics, Gemini Code Assist, configured Sub2API-compatible gateways, and related coding workflows while clearly labeling whether each source is exact, partial, window-scoped, policy-only, or unavailable. It does not ask you to paste cookies or raw browser auth headers. Settings, optional API credentials, page bindings, cached snapshots, import/export files, and Chrome Sync data stay in your Chrome profile.`

`Open the toolbar popup to check provider health, setup blockers, usage windows, reset timing, source type, snapshot freshness, and sync status. Use the side panel or full-page dashboard for normalized trends, saved Sub2API deployment comparison, selected period summaries, and aggregate CSV export. Settings starts with Quick Setup, then separates Usage & Notifications from Appearance.`

`AI coding assistants are fast and useful, but quota pages and account states can be easy to lose track of. AI Usage Dashboard makes those states easier to scan while keeping unknown or stale data visibly distinct from fresh source values.`

`Provider coverage is intentionally honest. Some paths can show live or near-live usage windows, some expose partial page context, some are policy-only in this release, and some providers may require a signed-in page, optional host access, or API credentials. First-run provider cards show a focused Grant access action when host permission is the blocker. When a source is unavailable or partial, the extension labels that state instead of inventing a number.`

`Privacy and permissions stay conservative: no cookie pasting, no raw browser auth header pasting, optional host permissions only for supported provider origins, custom JSON sources fetch user-approved HTTP or HTTPS endpoints with browser credentials omitted, favicon permission only for the optional provider-matched toolbar icon feature, local image-based gradients are processed in the browser without uploading or saving original image bytes, packaged scripts only, and no remote code loading.`

`This is not an official product from OpenAI, Cursor, Anthropic, Google, JetBrains, or any other provider. Provider dashboards, APIs, quota wording, and policies can change. When a source is unavailable or partial, the dashboard labels that state instead of inventing a value.`

`The project is open source under AGPL-3.0-only: https://github.com/David-Lzy/AI_Usage_Dashboard`

Feature bullets:

- `Toolbar popup for quick provider and quota checks`
- `Side panel and full-page dashboard for deeper review`
- `Source labels for exact, partial, window-scoped, policy-only, or unavailable data`
- `Custom HTTP/HTTPS JSON sources and configured Sub2API-compatible gateway aggregates`
- `Optional quota/reset notifications and sanitized diagnostic export`
- `Selected period summaries and safe aggregate CSV export`
- `Saved Sub2API deployment comparison when source data is comparable`
- `Optional same-machine Codex CLI Companion; conditional API-equivalent estimates are not bills or balances`
- `Traditional progress bands or editable remaining-color gradients`
- `Configurable themes, progress styles, provider order, toolbar badge, and toolbar icon`
- `Import/export and Chrome Sync support for extension settings`
- `Open-source code under AGPL-3.0-only`

Screenshot captions:

- `Scan source-visible quotas and reset times in the toolbar popup.`
- `Review enabled providers and sync health in the dashboard.`
- `Inspect bounded Codex history with its own capture timestamp.`
- `Compare saved Sub2API deployments and preview selected aggregate CSV.`
- `Configure sync, warning thresholds, optional notifications, and appearance.`

The five 1280x800 screenshots are localized to English, Simplified Chinese,
Japanese, Brazilian Portuguese, and Latin American Spanish. Each set uses the
same current UI story order and labels illustrative QA values as sample data.

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
