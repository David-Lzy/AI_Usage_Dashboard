See AI coding quotas before they interrupt your work. AI Usage Dashboard brings source-visible limits, reset times, spending, and sync health into one Chrome extension.

Use the toolbar popup for a quick check, or open the side panel and full-page dashboard for details. Settings starts with Accounts & Connections, so you can connect only the sources you use.

The compact Material-style interface organizes settings into Accounts & Connections, Usage & Notifications, Appearance & Display, General, and Data & Backup. Navigation adapts to the available width and keeps your drafts. Save feedback reflects the actual result. Choose Default, Follow system, More, or Reduced motion; the in-app warning and system-notification thresholds remain independent.

Connected sources are clearly labeled as exact readings, partial information, quota windows, policy-only guidance, or unavailable data. The project documentation explains supported sources and their limitations.

It does not ask you to paste cookies or raw browser auth headers. Settings, optional API credentials, page bindings, cached snapshots, import/export files, and Chrome Sync data stay in your Chrome profile.

New in 0.2.3

Newer usage pages expose more context: source-scoped reset credits and balances, independent model pools, and usage breakdowns where supported. Missing information stays unknown; usage shares are not remaining quota.

Optional community reset reports are off by default. Choose in-app summaries or desktop alerts after granting the selected sites access. Reports keep their sources and freshness; forecasts appear only in details and never trigger alerts or change your quota. Separate account-card alerts require a fresh, verified same-account source; pairing alone is not enough. Community reports never mean that your account received a reset or card. Alerts may be delayed while the browser is closed, the device sleeps, or the system suppresses notifications. Public-feed requests omit account credentials and personal usage.

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
• optional host access for chosen provider origins, public community sites, and approved custom endpoints
• custom JSON sources fetch user-approved HTTP or HTTPS endpoints with browser credentials omitted
• Sub2API API keys are sent only to the exact configured gateway origin; raw request records are not imported
• favicon permission only for the optional provider-matched toolbar icon feature
• local image-based gradients are processed in your browser; original image bytes are not uploaded or saved
• packaged extension scripts only; no remote code loading
• settings and cached data stay in your Chrome profile unless you export them
• the optional Codex Companion runs only when you start and pair it on the same computer; the extension does not install or launch it

This is an independently developed extension, not an official product of any connected service.

Open source

The project is open source under AGPL-3.0-only:
https://github.com/David-Lzy/AI_Usage_Dashboard
