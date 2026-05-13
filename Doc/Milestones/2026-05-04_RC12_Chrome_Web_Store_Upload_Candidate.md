# Milestone - RC12 Chrome Web Store Upload Candidate

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- dated milestone snapshot

Status note:

- records the current code, package, screenshot, icon, and support-boundary state for the first Chrome Web Store upload-candidate handoff
- this is an upload-candidate milestone, not a claim that Chrome Web Store review has accepted the extension

## Milestone Summary

`0.1.0-rc.12` is the current Chrome Web Store upload candidate.

The candidate package is:

- `release/ai-usage-dashboard-0.1.0-rc.12.zip`
- SHA256: `d12c294adda25125731a106efcb99e17904ab50209926e719912f95279c16233`

The candidate source boundary is:

- package version: `0.1.0-rc.12`
- Chrome manifest version: `0.1.0.12`
- Chrome manifest display version: `0.1.0-rc.12`
- current latest archived phase: [299_Phase_RC12_Store_Upload_Candidate_Milestone.md](../TODOs/Archive/by-phase/200-299/299_Phase_RC12_Store_Upload_Candidate_Milestone.md)

## Included Changes Since RC11

- Phase 297: Codex stale-but-readable usage pages now perform a cache-bypassing source-page reload before DOM capture, with a short post-load hydration delay.
- Phase 298: the package now uses the supplied trimmed transparent Chrome icon set at `16/32/48/128`.
- Phase 299: code, release package, screenshot evidence, icon evidence, and roadmap/TODO docs are aligned as a store upload-candidate milestone.

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

The packaged zip contains the same four manifest icon sizes and no stale `icon-master.svg`.

## Support Boundary

The store-facing claim should remain:

- Cursor: Team Admin API or logged-in personal dashboard page; personal exact remaining included requests are unavailable.
- Codex: Enterprise Analytics API or logged-in personal usage page; personal values are usage-window percentages, not one full plan-wide absolute remaining-credit value.
- Claude Code: Admin Analytics API; exact remaining included subscription quota is unavailable.
- Gemini Code Assist: documented policy only.
- JetBrains AI: retained in the repo but deferred from the active support promise until a real org-visible session is reverified.

The product should not claim:

- hidden background web scraping
- cookie export or manual auth-header paste
- exact personal remaining quota for Cursor
- one absolute Codex personal remaining balance
- live Gemini per-user usage
- active JetBrains support in the current RC

## Submission Handoff

Use this candidate when filling the Chrome Web Store listing:

- upload zip: `release/ai-usage-dashboard-0.1.0-rc.12.zip`
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

Most recent package closeout recorded:

- `npm run release:check`
- `npm run release:package`
- `npm run docs:check`
- `git diff --check`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.12.zip`

This milestone does not require another runtime code change or package version bump.
