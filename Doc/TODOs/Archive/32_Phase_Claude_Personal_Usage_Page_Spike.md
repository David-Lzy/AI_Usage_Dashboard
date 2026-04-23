# Phase 32 - Claude Personal Usage Page Spike

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- determine whether Claude personal usage pages are usable enough to support non-organization accounts honestly

Depends on:

- phase 29
- phase 12
- phase 22

File scope:

- `src/shared/constants.ts`
- `Doc/provider_notes/Claude.md`
- `Doc/TODOs/00_Phase_Index.md`
- `Doc/AI_Usage_Dashboard_TODOs.md`
- `fixtures/claude/`

Tasks:

- inspect `https://claude.ai/settings/usage`
- classify real states:
  - logged out
  - free or upgrade-only
  - Pro / Max usage available
  - redirected or gated route
- determine whether the page exposes exact remaining usage, rolling-window status, or only subscription copy
- capture redacted fixtures for any viable personal-user state
- define whether Claude personal support should ship, remain partial, or stay unsupported

Done when:

- Claude personal-user support has an explicit shipped decision
- redirected and logged-out states are treated as first-class product states
- the provider note documents what personal Claude accounts can realistically expect

Out of scope:

- changing the existing Admin API organization path

Completion date: 2026-04-22

Completion summary:

- verified in the live logged-in browser session that `https://claude.ai/settings/usage` redirected to `https://claude.ai/upgrade`
- confirmed the resulting page exposed only plan and upgrade content for `Free`, `Pro`, and `Max`, not a usage surface
- updated the product decision to keep personal Claude unsupported for now and to treat redirected or upgrade-only states as explicit account states
- recorded a redacted live evidence fixture for the upgrade-gated outcome

Verification:

- manual Chrome GUI check: navigated directly to `https://claude.ai/settings/usage`
- confirmed final route `https://claude.ai/upgrade` in the browser address bar
- confirmed visible plan cards and absence of usage or reset information

Follow-up:

- [33_Phase_Gemini_Project_Metrics_Page_Spike.md](./33_Phase_Gemini_Project_Metrics_Page_Spike.md)
