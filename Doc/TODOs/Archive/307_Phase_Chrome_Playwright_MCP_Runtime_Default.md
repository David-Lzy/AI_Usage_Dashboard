# Phase 307 - Chrome Playwright MCP Runtime Default

## Goal

Make Chrome plus the Playwright Extension bridge the default local browser automation path for normal web tabs, while keeping Brave available only as an explicit fallback or availability fallback.

## Scope

- Make the shared RDP extension runtime helper prefer Chrome before Brave.
- Preserve `RDP_BROWSER_*` overrides and legacy `RDP_CHROME_*` compatibility aliases.
- Make the profile audit command discover the current unpacked extension id from the selected profile instead of relying on the old hardcoded extension id.
- Align README and local `.agent` browser-tooling notes with the Chrome-first default.

## Preserved Boundaries

- Do not copy cookies, session tokens, browser databases, or auth headers.
- Do not switch back to Chrome remote debugging on the default user-data directory.
- Do not bump package or manifest versions.
- Do not change provider support claims or runtime provider behavior.

## Acceptance

- RDP helper browser selection is Chrome-first and Brave fallback.
- `phase41-profile-audit.mjs` defaults to the Chrome profile and detects the current unpacked extension id from `Preferences`.
- Local browser automation docs no longer describe Brave-first defaults.
- The current source remains a tooling/docs follow-up after `rc.14`, not a new packaged extension candidate.

## Planned Verification

- `/home/davidli/.local/bin/playwright-mcp-chrome-extension-rdp --version`
- `./scripts/with-preferred-node.sh node --check scripts/lib/rdp-extension-runtime-capture.mjs`
- `./scripts/with-preferred-node.sh node --check scripts/phase41-profile-audit.mjs`
- `./scripts/with-preferred-node.sh node ./scripts/phase41-profile-audit.mjs`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-12.

Summary:

- Changed RDP browser candidate ordering to prefer Chrome and only fall back to Brave.
- Changed configured-browser defaults to Chrome paths while preserving explicit override semantics.
- Updated profile audit input resolution so the current unpacked extension id is discovered from the selected browser profile.
- Updated README plus local browser-tooling docs to match the Chrome Playwright MCP default.

Verification:

- `/home/davidli/.local/bin/playwright-mcp-chrome-extension-rdp --version` returned `Version 0.0.75`.
- `./scripts/with-preferred-node.sh node --check scripts/lib/rdp-extension-runtime-capture.mjs`
- `./scripts/with-preferred-node.sh node --check scripts/phase41-profile-audit.mjs`
- `./scripts/with-preferred-node.sh node --check scripts/capture-rdp-extension-window.mjs`
- `./scripts/with-preferred-node.sh node --check scripts/probe-rdp-native-toolbar-popup.mjs`
- `./scripts/with-preferred-node.sh node --check scripts/phase148-rdp-capture-timeout-and-cleanup-review.mjs`
- `./scripts/with-preferred-node.sh node --check scripts/phase163-native-toolbar-popup-probe-review.mjs`
- `./scripts/with-preferred-node.sh node ./scripts/phase41-profile-audit.mjs` detected extension `hjmgplddcbogpoijpoekgadlmaopmdij` from `/home/davidli/.config/google-chrome/Default`, installed from the repo `dist`, with manifest `0.1.0-rc.14`.
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`

Follow-up:

- Direct Playwright MCP browser-driving tools are available only after Codex starts a session with the configured MCP server loaded. This phase only verifies the wrapper and project helper defaults.
