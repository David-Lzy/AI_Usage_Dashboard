# Phase 10 - JetBrains Research

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- confirm how JetBrains Central Console exposes current AI Credits usage

Depends on:

- phase 07

File scope:

- `Doc/provider_notes/JetBrains.md`
- `fixtures/jetbrains/`

Tasks:

- log into JetBrains Central Console
- inspect the Users and licensing page
- determine whether usage data is server-rendered or fetched as JSON
- capture sanitized HTML or JSON fixtures
- document plan, usage, remaining balance, and reset-window fields

Done when:

- one stable JetBrains source path is documented
- selector notes or JSON field notes are captured
- sanitized fixtures exist for adapter work

Out of scope:

- parser implementation

Prerequisite note:

- this phase needs access to a JetBrains account with visibility into AI usage

Completion date: 2026-04-20

Completion summary:

- created a dedicated JetBrains provider research note with the selected MVP source path
- selected JetBrains Central Console `Users and licensing` as the official MVP page source
- documented the visible cards, table columns, role scope, quota model, and transport uncertainty
- added sanitized parser-target fixtures for the `Users and licensing` page
- updated the master TODO so JetBrains now records a selected MVP source instead of a generic preference

Verification:

- validation checklist:
  - verified the new JetBrains extracted fixture parses as valid JSON
  - verified the provider note explicitly records the selected page source and the key field anchors
  - verified the provider note captures the unresolved `HTML vs JSON fetch` transport question
  - reviewed official JetBrains docs on 2026-04-20 for `Users and licensing`, current AI Credits usage, AI management, top-up credits, and AI plans
- live-account note:
  - no Central Console session was available in this phase, so the selected source path is documented from official docs rather than a live capture

Follow-up:

- move into `Phase 11` to inspect a live JetBrains Console session and implement the first parser or JSON client path
