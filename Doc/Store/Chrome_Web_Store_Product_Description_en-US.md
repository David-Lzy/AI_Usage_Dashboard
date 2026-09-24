See AI coding quotas before they interrupt your work. AI Usage Dashboard brings source-visible limits, reset times, spending, and sync health into one Chrome extension.

Use the toolbar popup for a quick check, or open the side panel and full-page dashboard for details. Quick Setup is first in Settings, so you can connect only the sources you use.

It supports Codex, Cursor, Claude Personal, Claude Code organization analytics, Gemini Code Assist, configured Sub2API-compatible gateways, and related coding workflows while clearly labeling whether each source is exact, partial, window-scoped, policy-only, or unavailable.

It does not ask you to paste cookies or raw browser auth headers. Settings, optional API credentials, page bindings, cached snapshots, import/export files, and Chrome Sync data stay in your Chrome profile.

What it helps you see

• provider health and setup blockers
• remaining usage windows and reset timing when a provider exposes them
• source type: API, signed-in page, partial page context, documented policy, or unavailable source
• snapshot freshness and sync status
• optional quota/reset notifications with separate in-app and system thresholds
• selected period summaries, safe aggregate CSV export, and a sanitized diagnostics report
• comparison of saved Sub2API deployments when coverage, units, and currency permit
• optional same-machine Codex CLI Companion quota reads after manual pairing; conditional API-equivalent estimates are not bills or balances
• toolbar badge and toolbar icon behavior
• custom HTTP/HTTPS JSON sources for your own quota endpoints
• key-scoped aggregate balance, spend, requests, tokens, models, trends, and returned limits from configured Sub2API-compatible gateways
• traditional progress bands or editable gradient remaining-color display
• language, theme, popup appearance, progress style, provider order, and import/export settings

How it feels in daily use

AI coding assistants are fast and useful, but quota pages and account states can be easy to lose track of. One moment everything works; the next moment a quota window, missing permission, expired session, or provider policy gets in the way.

AI Usage Dashboard makes those states easier to scan, while keeping unknown or stale data visibly distinct from fresh source values.

Provider coverage is intentionally honest

Different providers expose different kinds of information:

• some paths can show live or near-live usage windows
• some paths only expose partial page context
• some paths are policy-only in this release
• some providers may require a signed-in page, optional host access, or API credentials
• first-run provider cards show a focused Grant access action when host permission is the blocker
• provider dashboards, APIs, quota wording, and policies can change

When a source is unavailable or partial, the extension labels that state instead of inventing a number.

Privacy and permissions

AI Usage Dashboard is conservative by design:

• no cookie pasting
• no raw browser auth header pasting
• optional host permissions only for supported provider origins
• custom JSON sources fetch user-approved HTTP or HTTPS endpoints with browser credentials omitted
• Sub2API API keys are sent only to the exact configured gateway origin; raw request records are not imported
• favicon permission only for the optional provider-matched toolbar icon feature
• local image-based gradients are processed in your browser; original image bytes are not uploaded or saved
• packaged extension scripts only; no remote code loading
• settings and cached data stay in your Chrome profile unless you export them
• the optional Codex Companion runs only when you start and pair it on the same computer; the extension does not install or launch it

This is not an official product from OpenAI, Cursor, Anthropic, Google, JetBrains, or any other provider.

Open source

The project is open source under AGPL-3.0-only:
https://github.com/David-Lzy/AI_Usage_Dashboard
