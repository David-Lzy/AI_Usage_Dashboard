AI Usage Dashboard puts AI coding quota, setup blockers, and sync health in one Chrome toolbar popup and side panel.

It is built for Codex, Cursor, Claude Code, Gemini Code Assist, and related coding workflows where provider data can be exact, partial, window-scoped, or policy-only. The extension keeps those boundaries visible instead of pretending every provider exposes the same number.

What you can check:

• provider health and setup blockers
• usage windows and reset timing when a provider exposes them
• source type: API, signed-in page, partial page context, or documented policy
• snapshot freshness and sync status
• toolbar badge/icon behavior, themes, progress styles, provider order, and import/export settings

AI Usage Dashboard is intentionally conservative. It does not ask you to paste cookies or raw browser auth headers. It stores settings, optional API credentials, page bindings, cached snapshots, and import/export files in your Chrome profile. Optional host permissions are requested only for supported provider origins. The favicon permission is used for the optional provider-matched toolbar icon feature.

This is not an official product from OpenAI, Cursor, Anthropic, Google, JetBrains, or any other provider. Provider dashboards, APIs, quota wording, and policies can change. When a source is unavailable or partial, the dashboard labels that state instead of inventing a value.

The project is open source under AGPL-3.0-only.
