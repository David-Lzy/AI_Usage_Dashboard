# Phase 08 - Cursor Research

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- confirm the exact official Cursor data source for the MVP

Depends on:

- phase 07

File scope:

- `Doc/provider_notes/Cursor.md`
- `fixtures/cursor/`

Tasks:

- verify the Cursor team admin API authentication flow
- identify the exact endpoints needed for usage and spend data
- capture sample API responses or sanitized fixtures
- document team vs individual account differences
- document required permissions or secrets

Done when:

- one documented Cursor source path is selected for the MVP
- sanitized fixtures exist for the chosen source
- the normalized field mapping is written down

Out of scope:

- production adapter code

Prerequisite note:

- this phase needs access to a real or test Cursor account with the required role

Completion date: 2026-04-20

Completion summary:

- created a dedicated Cursor provider research note with the selected MVP source path
- selected Cursor Team Admin API as the official MVP integration path
- documented the auth flow, required endpoints, account-type matrix, and normalized field mapping
- added doc-derived sanitized fixtures for members, spend, and daily usage responses
- updated the master TODO so Cursor now records a selected MVP source instead of a generic preference

Verification:

- validation checklist:
  - verified the new fixture files parse as valid JSON
  - verified the provider note explicitly records the selected official source path and endpoint list
  - verified the provider note includes normalized field mapping and account-type decisions
  - reviewed official Cursor docs search results on 2026-04-20 for Admin API, roles, and pricing
- source note:
  - the live docs redirected in this browsing environment, so this phase uses official search-cached snippets from the Cursor docs domain
- live-account note:
  - no real team-admin credential was available in this phase, so live API calls were not executed

Follow-up:

- move into `Phase 09` to implement the Cursor adapter against the selected Admin API path
