# Milestone - RC13 Chrome Web Store Upload Candidate

Date: 2026-05-11

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- dated milestone snapshot

Status note:

- records the current code, package, screenshot, icon, and support-boundary state for the current Chrome Web Store upload-candidate handoff
- this is an upload-candidate milestone, not a claim that Chrome Web Store review has accepted the extension

## Milestone Summary

`0.1.0-rc.13` is the current Chrome Web Store upload candidate.

The candidate package is:

- `release/ai-usage-dashboard-0.1.0-rc.13.zip`
- SHA256: `5bd659c7c84a5d69c385a413cd8879d8f4cb6cf0b31fe98db09ed6ab6a400664`

The candidate source boundary is:

- package version: `0.1.0-rc.13`
- Chrome manifest version: `0.1.0.13`
- Chrome manifest display version: `0.1.0-rc.13`
- current latest archived phase: [302_Phase_Node22_Default_And_RC13_Source_Alignment.md](../TODOs/Archive/by-phase/300-399/302_Phase_Node22_Default_And_RC13_Source_Alignment.md)

## Included Changes Since RC12

- Phase 300: Claude Team `https://claude.ai/settings/usage` is now a shipped session-page partial source.
- Phase 301: Claude usage-page parsing now filters generic helper/navigation copy while preserving meaningful quota rows.
- Phase 302: tracked workflow/runbook docs are canonical again, `.agent/` is local-only and ignored, project scripts auto-fall back to Node 22, release packaging now rejects stale `dist/manifest.json` versions, and the new `rc.13` package was cut.

## Store Assets

Current screenshot evidence:

- [2026-05-04-rc11-mixed-store-candidate-archive](../testing/store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
- status: `5/5` reviewed images
- truth-boundary notes: `3`

Current icon evidence:

- `public/icons/icon16.png`
- `public/icons/icon32.png`
- `public/icons/icon48.png`
- `public/icons/icon128.png`

## Support Boundary

The store-facing claim should remain:

- Cursor: Team Admin API or logged-in personal dashboard page; personal exact remaining included requests are unavailable.
- Codex: Enterprise Analytics API or logged-in personal usage page; personal values are usage-window percentages, not one full plan-wide absolute remaining-credit value.
- Claude Code: Admin Analytics API or logged-in Claude Team usage page; exact remaining included subscription quota is unavailable.
- Gemini Code Assist: documented policy only.
- JetBrains AI: retained in the repo but deferred from the active support promise until a real org-visible session is reverified.

The product should not claim:

- hidden background web scraping
- cookie export or manual auth-header paste
- exact personal remaining quota for Cursor
- one absolute Codex personal remaining balance
- one absolute Claude remaining balance across all windows
- live Gemini per-user usage
- active JetBrains support in the current RC

## Submission Handoff

Use this candidate when filling the Chrome Web Store listing:

- upload zip: `release/ai-usage-dashboard-0.1.0-rc.13.zip`
- screenshots: use the mixed store candidate archive linked above
- title and description source: [Store_Listing_Copy_Pack.md](../Store/Store_Listing_Copy_Pack.md)
- localization source: [Store_Listing_Localization_Source_Pack.md](../Store/Store_Listing_Localization_Source_Pack.md)
- release process reference: [Release_Packaging_Guide.md](../Release_Packaging_Guide.md)

Remaining human-owned work:

- upload the package in Chrome Web Store Developer Dashboard
- fill or review the listing form
- attach the chosen screenshots
- answer Chrome Web Store privacy and permission disclosures truthfully against the support boundary above

## Verification Snapshot

Automated verification run for this milestone:

- `npm run release:check`
- `npm run release:package`
- `npm run docs:check`
- `git diff --check`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.13.zip`

Manual runtime note:

- the latest recorded human visual smoke remains the 2026-05-04 `rc.11` RDP Chrome pass
- this milestone does not record a new `rc.13` RDP Chrome smoke session
