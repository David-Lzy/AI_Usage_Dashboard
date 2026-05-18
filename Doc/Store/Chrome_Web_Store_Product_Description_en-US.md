AI Usage Dashboard puts AI coding quota, setup blockers, and sync health in one Chrome toolbar popup and side panel.

It supports Codex, Cursor, Claude Code, Gemini Code Assist, and related coding workflows where provider data may be exact, partial, window-scoped, policy-only, or unavailable. The extension keeps those boundaries visible instead of pretending every provider exposes the same number.

It does not ask you to paste cookies or raw browser auth headers. Settings, optional API credentials, page bindings, cached snapshots, and import/export files stay in your Chrome profile.

What you can check:

• provider health and setup blockers
• usage windows and reset timing when a provider exposes them
• source type: API, signed-in page, partial page context, or documented policy
• snapshot freshness and sync status
• toolbar badge and icon behavior
• language, theme, popup appearance, progress style, provider order, and import/export settings

How it works:

Open the toolbar popup for a quick read. Use the side panel or full-page dashboard when you need provider details, source boundaries, diagnostics, permissions, credentials, and display settings.

AI Usage Dashboard is intentionally conservative. Optional host permissions are requested only for supported provider origins. The favicon permission is used for the optional provider-matched toolbar icon feature. The extension runs packaged scripts and does not load remote code.

This is not an official product from OpenAI, Cursor, Anthropic, Google, JetBrains, or any other provider. Provider dashboards, APIs, quota wording, and policies can change. When a source is unavailable or partial, the dashboard labels that state instead of inventing a value.

The project is open source under AGPL-3.0-only:
https://github.com/David-Lzy/AI_Usage_Dashboard
