# Phase 43 - Personal Fidelity Semantics And UI

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- make the shipped personal and policy-backed provider paths expose explicit honesty semantics in the UI instead of relying on scattered notes

Depends on:

- phase 42
- [Direction 02 - Personal User Product Semantics](../../../../Roadmap/02_Direction_Personal_User_Product_Semantics.md)

File scope:

- `src/shared/`
- `src/sidepanel/`
- `Doc/`

Tasks:

- define a user-facing fidelity vocabulary for current source plans with room for future `local_estimate` work
- surface that fidelity in provider cards, provider detail, and Settings source cards
- make field-level usage availability legible so `Codex` and `Cursor` personal paths are clearly partial where necessary
- update roadmap and TODO docs if the new semantics change the visible product contract

Done when:

- the side panel shows explicit fidelity semantics instead of only source-kind labels
- `Codex` and `Cursor` personal paths are clearly framed as shipped but partial
- tests and build checks pass
- preview is restarted on the latest build

Out of scope:

- new provider integrations
- popup entry work
- local request-count inference or cookie-backed experiments

Completion date: 2026-04-23

Completion summary:

- turned the existing field-availability model into explicit source-fidelity semantics in the shared source-display layer
- surfaced fidelity labels and availability summaries in provider cards, provider detail, and Settings source cards
- made the shipped `Codex` and `Cursor` personal paths visibly partial by labeling them as `Window-only vendor value`
- separated current admin and enterprise analytics paths as `Analytics snapshot` so they do not read like live remaining counters

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run src/shared/provider-sources.test.ts src/sidepanel/view-models.test.ts`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- preview:
  - command: `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist`
  - URL: `http://127.0.0.1:4173/src/sidepanel/index.html`

Follow-up:

- continue `Direction 02` with provider-specific semantics hardening or the explicit rejection/acceptance of future `local_estimate` work
