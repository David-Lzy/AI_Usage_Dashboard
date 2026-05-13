# Phase 30.1 - Codex Live Tab Fixture Capture

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- capture redacted live fixtures from the already-open logged-in Codex page and choose the exact extraction surface for personal-user support

Depends on:

- phase 30
- phase 29

File scope:

- `src/manifest.json`
- `src/providers/codex/`
- `src/sidepanel/routes/`
- `src/sidepanel/theme/`
- `Doc/provider_notes/Codex.md`
- `Doc/TODOs/00_Phase_Index.md`
- `Doc/AI_Usage_Dashboard_TODOs.md`
- `fixtures/codex/`

Tasks:

- add optional host access for `https://chatgpt.com/*`
- add a narrow fixture-capture path that can inspect the already-open Codex tab through the shared page-session framework
- capture redacted evidence from:
  - `https://chatgpt.com/codex/settings/usage`
  - `https://chatgpt.com/codex/cloud/settings/usage` if available
  - `https://chatgpt.com/codex/cloud/settings/analytics#usage` for comparison
- decide which surface is the honest source for:
  - exact remaining usage
  - usage-window status only
  - analytics-only fields
- update the Codex provider note with the final extraction choice

Done when:

- at least one live redacted fixture from the logged-in ChatGPT tab exists
- the Codex personal path has one chosen extraction surface
- the note clearly states whether personal Codex supports exact remaining values, window-only values, or analytics-only values

Out of scope:

- shipping the full personal Codex adapter
- changing the shipped Enterprise analytics path

Completion date: 2026-04-21

Completion summary:

- added a narrow live-tab capture path for Codex plus a hidden debug route that requests `https://chatgpt.com/*` access and inspects the already-open logged-in ChatGPT tabs
- captured the first live redacted Codex fixture from `https://chatgpt.com/codex/cloud/settings/analytics#usage`
- proved that the matched page exposes exact remaining percentages and reset timestamps directly in rendered DOM, in a Chinese-locale session
- recorded the captured evidence in fixtures and updated the Codex provider note and roadmap to treat `cloud/settings/analytics#usage` DOM as the first proven personal-user surface

Verification:

- `npm run typecheck`
- `npm run test`
- `bash -ic 'cd /nfs/server1/disk1/Project/personal_project/AI_Usage_Dashboard && node -v && npm run build'`
- manual Chrome GUI check: granted `chatgpt.com` host access, ran the debug capture page, and confirmed that the rendered JSON and clipboard fixture matched the live Codex analytics tab

Follow-up:

- [31_Phase_Cursor_Personal_Usage_Page_Spike.md](../../../31_Phase_Cursor_Personal_Usage_Page_Spike.md)
