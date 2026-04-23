# Phase 15 - Codex Research

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- determine whether Codex Business or Enterprise workspace pages are stable enough for MVP ingestion

Depends on:

- phase 07

File scope:

- `Doc/provider_notes/Codex.md`
- `fixtures/codex/`

Tasks:

- inspect ChatGPT workspace billing and analytics pages for Codex
- separate personal plan support from Business or Enterprise workspace support
- determine whether cloud-only analytics and billing data are enough for the MVP
- capture sanitized fixtures if a stable source exists
- document the unsupported cases explicitly

Done when:

- the supported Codex account type for v1 is decided
- stable source notes or blockers are documented
- fixtures exist if the source is usable

Out of scope:

- full adapter implementation

Prerequisite note:

- this phase needs access to a Codex-enabled ChatGPT workspace if workspace support is the target

Completion date: 2026-04-20

Completion summary:

- created a dedicated Codex provider research note with the selected MVP support scope
- selected Business / Enterprise workspace billing and usage-panel surfaces as the first Codex ingestion path
- separated workspace-based Codex support from consumer ChatGPT plans and from local-only usage
- documented the role of Codex seats, workspace credits, flexible pricing, and the split between token-based and legacy rate cards
- added docs-derived scaffolding fixtures for workspace usage surfaces and rate-card mode summary

Verification:

- validation checklist:
  - verified both new Codex fixture files parse as valid JSON
  - verified the provider note explicitly records the selected workspace-first source path
  - verified the provider note documents unsupported personal-plan and local-only cases
  - reviewed official OpenAI product, help, and developer docs on 2026-04-20 for Codex plan usage, rate cards, Business credits and spend controls, Business roles, Enterprise overview, and Codex admin setup
- live-workspace note:
  - no live Codex-enabled Business or Enterprise workspace was available in this phase, so the fixtures remain docs-derived scaffolding rather than real captures

Follow-up:

- move into `Phase 16` for the Codex adapter spike
