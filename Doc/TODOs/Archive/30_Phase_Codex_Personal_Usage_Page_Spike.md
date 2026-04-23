# Phase 30 - Codex Personal Usage Page Spike

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- determine whether logged-in Codex personal usage pages expose a stable and honest source for individual-user usage tracking

Depends on:

- phase 29
- phase 15
- phase 24

File scope:

- `src/providers/codex/`
- `Doc/provider_notes/Codex.md`
- `fixtures/codex/`

Tasks:

- inspect `https://chatgpt.com/codex/settings/usage`
- inspect `https://chatgpt.com/codex/cloud/settings/usage`
- inspect `https://chatgpt.com/codex/cloud/settings/analytics#usage`
- determine whether each page exposes:
  - exact remaining usage
  - usage-window status only
  - analytics without remaining quota
- capture redacted fixtures from the chosen extraction surface
- define how the personal page path coexists with the existing Enterprise analytics path

Done when:

- the personal Codex path is either proven viable with a specific extraction plan or ruled out honestly
- the Codex provider note explains what personal users can and cannot see
- the next implementation step has a single chosen page-source path

Out of scope:

- changing the shipped Enterprise analytics integration

Completion date: 2026-04-21

Completion summary:

- confirmed from the live Chrome profile that personal Codex support must use the already-open logged-in ChatGPT tab, not a copied browser session
- selected `https://chatgpt.com/codex/settings/usage` as the primary personal-user candidate route
- documented the discovered secondary routes `https://chatgpt.com/codex/cloud/settings/usage` and `https://chatgpt.com/codex/cloud/settings/analytics#usage`
- added a non-sensitive evidence fixture describing the observed routes, auth artifacts, and copied-session failures
- split the remaining live-tab capture work into phase `30.1`

Verification:

- checked Chrome history and session files for observed Codex routes
- checked the live Chrome cookie inventory without retaining values
- verified that copied-session probes either hit Cloudflare challenge pages or redirected to logged-out ChatGPT home
- updated the provider note, TODOs, and phase index to match the new decision

Follow-up:

- [30_1_Phase_Codex_Live_Tab_Fixture_Capture.md](./30_1_Phase_Codex_Live_Tab_Fixture_Capture.md)
