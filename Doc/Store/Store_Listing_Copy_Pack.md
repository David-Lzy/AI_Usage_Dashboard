# Store Listing Copy Pack

Date: 2026-05-18

Process rule:

- follow [CONTRIBUTING.md](../../CONTRIBUTING.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this is the current English source copy pack for the RC24 Chrome Web Store resubmission candidate
- primary upload locale copy is maintained in the product-description files in this directory
- keep provider/product names unchanged and do not strengthen partial provider support claims

## Store Fields

Title:

`AI Usage Dashboard`

Short description:

`Track usage, setup blockers, and sync health across AI coding tools.`

Collapsed-view abstract:

`AI Usage Dashboard puts AI coding quota, setup blockers, and sync health in one Chrome toolbar popup and side panel. It supports Codex, Cursor, Claude Code, Gemini Code Assist, and related coding workflows where provider data may be exact, partial, window-scoped, policy-only, or unavailable. It does not ask you to paste cookies or raw browser auth headers; settings and cached snapshots stay in your Chrome profile.`

Details:

`Open the toolbar popup for a quick read on provider health, remaining usage windows, reset timing, and setup blockers. Open the side panel or full-page dashboard when you need source type, snapshot freshness, diagnostics, permissions, credentials, display preferences, and provider-specific status.`

`AI Usage Dashboard is intentionally conservative. Optional host permissions are requested only for supported provider origins. The favicon permission is used for the optional provider-matched toolbar icon feature. The extension runs packaged scripts and does not load remote code.`

`This is not an official product from OpenAI, Cursor, Anthropic, Google, JetBrains, or any other provider. Provider dashboards, APIs, quota wording, and policies can change. When a source is unavailable or partial, the dashboard labels that state instead of inventing a value.`

`The project is open source under AGPL-3.0-only: https://github.com/David-Lzy/AI_Usage_Dashboard`

Feature bullets:

- `Toolbar popup for quick provider and quota checks`
- `Side panel and full-page dashboard for deeper review`
- `Source labels for exact, partial, window-scoped, policy-only, or unavailable data`
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
- Do not claim JetBrains live support in RC24.
- Do not market the popup as a second full dashboard.
- Mention `favicon` only for the provider-matched toolbar icon feature.
