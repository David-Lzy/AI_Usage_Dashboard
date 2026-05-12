# Phase 308 - RC14 Chrome Playwright MCP Smoke

## Goal

Record a real Chrome smoke pass for the current `0.1.0-rc.14` follow-up candidate surfaces after the Chrome Playwright MCP default was selected.

## Scope

- Verify the Chrome profile has the current unpacked `AI Usage Dashboard` extension loaded from this repo `dist`.
- Run Chrome-first RDP extension-window smoke captures for dashboard, Settings, focused Settings targets, provider detail, full-page dashboard, and popup. App-window captures use the `?surface=full-page#...` route contract for sidepanel-derived routes; the bare `src/sidepanel/index.html#...` contract remains for real side panel handoff, not ordinary tab/app-window smoke.
- Check that these surfaces render cached app state instead of staying on `Preparing dashboard state`.
- Record the current Codex-session MCP availability boundary honestly.

## Preserved Boundaries

- Do not claim `rc.14` has replaced the submitted `rc.13` Chrome Web Store review boundary.
- Do not package a new release.
- Do not treat helper-window popup capture as a pixel-identical native toolbar bubble capture.
- Do not fabricate direct Playwright MCP browser-driving evidence if the current Codex session has not loaded Playwright MCP tools.

## Acceptance

- Chrome profile audit resolves the current extension id and manifest version.
- Dashboard, Settings, focused Settings targets, provider detail, full-page dashboard, and popup can be opened through the Chrome-first helper, with sidepanel-derived helper aliases landing on the full-page surface.
- Captured surfaces show rendered app content rather than the loading card.
- Direct Playwright MCP availability is recorded separately from the RDP helper smoke path.

## Planned Verification

- `npm run store:cleanup-rdp-runtime-windows`
- `npm run store:capture-rdp-extension-window -- --route dashboard --output tmp/phase308-dashboard.png`
- `npm run store:capture-rdp-extension-window -- --route settings --output tmp/phase308-settings.png`
- `npm run store:capture-rdp-extension-window -- --route settings-quick-setup-cursor --output tmp/phase308-settings-quick-setup-cursor.png`
- `npm run store:capture-rdp-extension-window -- --route settings-credentials-codex --output tmp/phase308-settings-credentials-codex.png`
- `npm run store:capture-rdp-extension-window -- --route provider-detail-codex --output tmp/phase308-provider-detail-codex.png`
- `npm run store:capture-rdp-extension-window -- --route full-page-dashboard --output tmp/phase308-full-page-dashboard.png`
- `npm run store:capture-rdp-extension-window -- --route popup --output tmp/phase308-popup.png`
- `identify tmp/phase308-*.png`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`

## Completion

Status: completed on 2026-05-12.

Summary:

- Confirmed the Chrome profile loads the current unpacked extension from `/mnt/disk1/Project/personal_project/AI_Usage_Dashboard/dist` with extension id `hjmgplddcbogpoijpoekgadlmaopmdij` and manifest `0.1.0-rc.14`.
- Captured dashboard, Settings, focused Settings quick-setup, focused Settings credentials, Codex provider detail, full-page dashboard, and popup through the Chrome-first RDP helper. The sidepanel-derived helper aliases now explicitly use `src/sidepanel/index.html?surface=full-page#...`, matching the URL that opens correctly in a normal Chrome tab/app window.
- Visual review of the captured surfaces showed rendered app content rather than the `Preparing dashboard state` loading card.
- Confirmed in the original closing session that direct Playwright MCP tools were not loaded yet; a later restarted Codex session loaded the official Playwright Extension bridge, proved it can drive normal web tabs, and exposed Chrome's cross-extension limitation for another extension's `chrome-extension://` UI.

Verification:

- `npm run store:cleanup-rdp-runtime-windows`
- `npm run store:capture-rdp-extension-window -- --route dashboard --output tmp/phase308-dashboard.png`
- `npm run store:capture-rdp-extension-window -- --route settings --output tmp/phase308-settings.png`
- `npm run store:capture-rdp-extension-window -- --route settings-quick-setup-cursor --output tmp/phase308-settings-quick-setup-cursor.png`
- `npm run store:capture-rdp-extension-window -- --route settings-credentials-codex --output tmp/phase308-settings-credentials-codex.png`
- `npm run store:capture-rdp-extension-window -- --route provider-detail-codex --output tmp/phase308-provider-detail-codex.png`
- `npm run store:capture-rdp-extension-window -- --route full-page-dashboard --output tmp/phase308-full-page-dashboard.png`
- `npm run store:capture-rdp-extension-window -- --route popup --output tmp/phase308-popup.png`
- `identify tmp/phase308-*.png`
- `npm run store:capture-rdp-extension-window -- --route dashboard --output tmp/phase308-dashboard-full-page-corrected.png`

Follow-up:

- Use Playwright MCP for normal web-tab automation in the configured Chrome profile.
- Keep `AI_Usage_Dashboard` extension UI smoke on the Chrome RDP helper, because the official Playwright Extension bridge cannot drive another extension's `chrome-extension://` pages.
