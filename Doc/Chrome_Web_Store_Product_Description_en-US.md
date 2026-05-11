AI Usage Dashboard - a calm quota cockpit for AI coding tools ✨

AI coding assistants are useful, fast, and occasionally mysterious. One moment everything works; the next moment a quota window, missing permission, expired session, or provider policy gets in the way.

AI Usage Dashboard gives you one compact place to check what is going on. Open the Chrome toolbar popup for a quick glance, then jump into the side panel when you want the details. Less tab-hunting, more coding. (^-^)

What it helps you see

🟢 Usage windows and remaining percentages when a provider exposes them
🕒 Reset timing for supported usage windows
🧭 Setup blockers such as missing host access, missing credentials, or a signed-out page
🧩 Provider source type: official API, signed-in session page, or documented policy
🧾 Honest support boundaries, so partial data stays labeled as partial data
🔄 Sync health and snapshot freshness, including when a refresh needs your attention

How it works

AI Usage Dashboard combines a few provider-specific source paths:

• Codex can read visible usage-window percentages and reset timing from the signed-in Codex usage page, or use Enterprise analytics configuration when available.
• Cursor can use the Team Admin API or a signed-in personal dashboard page for billing-period usage context. The personal page does not expose an exact remaining included-request counter, so the extension does not pretend it does.
• Claude Code support uses the Admin Analytics API path or the logged-in Claude Team usage page. Exact remaining included subscription quota is not claimed.
• Gemini Code Assist currently stays policy-based because there is no stable live per-user usage source selected for this release.

The important part: each provider card tells you what kind of source it is using. If a number is exact, partial, window-scoped, policy-only, or unavailable, the UI is designed to say so clearly.

Why the toolbar popup exists

The popup is for fast recognition:

• Is anything healthy?
• Is anything blocked?
• Which provider needs attention?
• What quota badge am I currently seeing?

It is intentionally compact. For deeper review, the side panel opens the dashboard, settings, provider detail, source contracts, and sync state without squeezing everything into a tiny popup.

Why the side panel exists

The side panel is the main workspace:

• Review provider cards in one dashboard
• Open detailed usage-window rows
• Adjust sync interval, warning threshold, badge behavior, language, theme, and popup appearance
• Grant or review host access for supported provider pages
• Bind supported signed-in usage pages without exporting cookies or pasting auth headers

It is built for repeated checking, not a one-time splash screen.

Privacy and data boundaries

AI Usage Dashboard is intentionally conservative:

✅ It does not ask you to paste cookies.
✅ It does not ask you to paste raw browser auth headers.
✅ It stores extension settings, optional API credentials, page bindings, and cached snapshots locally in your Chrome profile.
✅ It uses optional host permissions only for supported provider origins.
✅ It runs packaged extension scripts for page capture; it does not load or execute remote code.

When signed-in provider pages are used, the extension reads visible usage information from your current browser session after you grant the relevant host access. If a page is signed out, unavailable, or no longer exposes a parseable usage window, the dashboard shows that state instead of inventing a value.

What this extension is not

This is not an official product from OpenAI, Cursor, Anthropic, Google, JetBrains, or any other provider.

It is not a billing authority, invoice system, or guarantee of provider limits. Providers can change their dashboards, APIs, policies, and quota wording. When that happens, AI Usage Dashboard aims to fail visibly and honestly rather than silently guessing.

It also does not claim full live coverage for every AI coding tool. Some providers expose exact values, some expose only usage-window context, and some are policy-only in this release. The dashboard keeps those differences visible.

Good fit if you...

☕ use more than one AI coding tool
📌 want a quick toolbar signal instead of checking several dashboards manually
🧠 prefer knowing whether a number is exact, partial, or policy-based
🛠 want setup guidance when permissions or credentials block sync
🔍 care about quota visibility, reset timing, and sync freshness

Small note

AI Usage Dashboard is designed to make AI usage tracking less fuzzy, not more magical. It gives you a tidy cockpit, honest labels, and quick routes to the right detail page. That is the whole vibe: useful, calm, and clear. ✨
