# Phase 57 - Settings Source Card Summary Compression

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- reduce repeated information in `Settings -> Source Connections` so source cards stay honest but become shorter and easier to scan

Depends on:

- phase 56
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `src/sidepanel/`
- `README.md`
- `Doc/`

Tasks:

- remove repeated current-path and contract fields from the source-card summary when the same facts are already visible in header chips
- keep only the highest-signal summary fields visible by default, with compact operational notes for exceptional states
- preserve the existing diagnostics disclosure for deeper trust-boundary and fallback detail

Done when:

- source cards are visibly shorter at common widths without hiding important contract state
- header chips remain the primary home for current path, contract, fidelity, and state labels
- focused tests, build checks, and responsive regression review pass
- docs and preview closeout are complete

Out of scope:

- changing provider source semantics
- redesigning the Settings page structure outside source-card summaries
- new animation work beyond the already-shipped motion baseline

Completion date: 2026-04-23

Completion summary:

- removed repeated current-path, contract, fidelity, and state tiles from visible source-card summaries because those facts are already carried by header chips
- kept the visible summary focused on preference, access model, fallback, and availability so source cards scan faster at narrow widths
- added compact operational notes that only appear when fallback or warning-state context needs explanation, while keeping deep diagnostics inside disclosure

Verification:

- targeted tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run src/sidepanel/settings-view-models.test.ts src/sidepanel/motion.test.ts`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- responsive regression review: `npx -y node@22 ./scripts/phase55-multi-width-visual-review.mjs`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel plus popup preview URLs still respond

Follow-up:

- continue `Direction 04` by reducing the remaining deep-diagnostics density inside disclosure and then manually reviewing compact-width readability in a real browser session
