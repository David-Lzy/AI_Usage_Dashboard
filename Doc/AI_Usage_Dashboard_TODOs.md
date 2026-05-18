# AI Usage Dashboard TODOs

Date: 2026-05-18

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the concise current project backlog reference
- completed phase evidence lives under [TODOs/Archive/by-phase](./TODOs/Archive/by-phase/)
- internal operator workflow notes live outside public docs

Related docs:

- [Phase index](./TODOs/00_Phase_Index.md)
- [Strategic roadmap](./Roadmap/00_Strategic_Directions_Index.md)
- [Store handoff](./Store/Store_Public_Release_6_Locale_Handoff.md)
- [RC24 milestone](./Milestones/2026-05-18_RC24_Store_Resubmission_Candidate.md)

## Current post-`Phase 524` execution priority:

1. `P0` - Treat `0.1.0-rc.24` as the current Chrome Web Store resubmission candidate.
2. `P0` - Upload `release/ai-usage-dashboard-0.1.0-rc.24.zip` manually through Chrome Web Store Developer Dashboard when ready.
3. `P0` - Use the refreshed four-locale store copy and current screenshot handoff in [Doc/Store](./Store/README.md).
4. `P1` - Keep support claims conservative: Codex/Cursor/Claude Code may expose live or partial data depending on source; Gemini remains policy-only; JetBrains remains deferred from the active store promise.
5. `P1` - Keep public README, privacy, security, and contributing docs understandable without local `.agent` or `.local` files.
6. `P2` - Future work should be queued as new numbered phases only after RC24 upload feedback or a concrete product bug appears.

no numbered phase is currently queued after `Phase 524`.

## Stable Product Priorities

- Keep the toolbar popup compact and honest.
- Keep the side panel and full-page dashboard as the deeper review surfaces.
- Preserve source labels for exact, partial, window-scoped, policy-only, or unavailable provider data.
- Avoid raw cookie or auth-header paste workflows.
- Keep optional host permissions scoped to supported provider origins.
- Keep runtime localization, manifest localization, and store listing draft checks passing.

## Release Boundary

- The Chrome Web Store public page still shows an older listed version.
- RC24 is the current prepared resubmission candidate.
- Final Chrome Web Store upload remains a manual action.
