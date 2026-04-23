# Phase 12 - Claude Research

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- confirm the MVP source path for Claude Code Team or Enterprise usage analytics

Depends on:

- phase 07

File scope:

- `Doc/provider_notes/Claude.md`
- `fixtures/claude/`

Tasks:

- verify the owner or analytics page path for Claude Code usage
- inspect whether the page exposes structured JSON behind the UI
- separate Team or Enterprise analytics from Pro or Max personal usage
- capture sanitized fixtures from the chosen source
- write down the exact account type supported in v1

Done when:

- one Claude account type is clearly selected for MVP support
- sanitized fixtures are saved
- the normalized field mapping is documented

Out of scope:

- adapter code

Prerequisite note:

- this phase needs access to a supported Claude Team or Enterprise account

Completion date: 2026-04-20

Completion summary:

- created a dedicated Claude provider research note with the selected MVP source path
- selected the official Claude Code Analytics Admin API as the MVP source for org analytics
- documented the account-type split between Admin API organizations, Team / seat-based Enterprise dashboards, and personal Pro / Max plans
- recorded the official dashboard URLs, role requirements, usage-window caveats, and the new Admin API path
- added sanitized Claude analytics API fixtures for future adapter work
- updated the master TODO so Claude no longer incorrectly states that no official usage API exists

Verification:

- validation checklist:
  - verified the new Claude fixture parses as valid JSON
  - verified the provider note records both the selected API source and the deferred dashboard-only paths
  - verified the provider note captures the key mismatch between analytics data and exact quota-remaining data
  - reviewed official Claude / Anthropic docs and help pages on 2026-04-20 for analytics dashboards, the Claude Code Analytics API, Admin API access, Team / Enterprise usage behavior, and extra usage
- live-account note:
  - no live Admin API key or Team / Enterprise dashboard session was available in this phase, so the fixtures remain docs-derived scaffolding

Follow-up:

- move into `Phase 13` for the first Claude adapter implementation
