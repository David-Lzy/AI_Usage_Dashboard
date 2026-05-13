# Phase 59 - Settings Session Track Compression

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- reduce the copy density inside `Session-page track` so source cards keep the same facts but present them as a compact structured block instead of stacked paragraphs

Depends on:

- phase 58
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `src/sidepanel/`
- `README.md`
- `Doc/`

Tasks:

- build a compact session-track view model for rollout, contract, fidelity, route, and availability
- replace the current paragraph-heavy session-track block with chips, fields, and conditional notes
- keep session-page actions and deferred-path honesty visible without the current wall of text

Done when:

- session-page track blocks are visibly shorter and easier to scan at common widths
- shipped and deferred session-page tracks still expose their rollout, route, fidelity, and graduation-gate facts
- focused tests, build checks, and responsive review pass
- docs and preview closeout are complete

Out of scope:

- changing provider source contracts
- new diagnostics semantics outside the session-track block
- new motion work beyond the existing baseline

Completion date: 2026-04-23

Completion summary:

- replaced the old paragraph-heavy session-page track block with a compact structure built from a dedicated view model
- moved rollout, contract, and fidelity into chips while keeping route, availability, and graduation-gate facts in a smaller field grid
- kept explanatory note text only where the session-page track still needs extra context, so shipped and deferred paths remain honest without the previous copy density

Verification:

- targeted tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run src/sidepanel/settings-view-models.test.ts src/sidepanel/motion.test.ts`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- responsive regression review: `npx -y node@22 ./scripts/phase55-multi-width-visual-review.mjs`
- visual review: capture `tmp/phase59-settings-session-track.png` from the preview build
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel plus popup preview URLs still respond

Follow-up:

- continue `Direction 04` by checking the compact-width readability of the full Settings stack in a real browser profile and then deciding whether more copy compression is still needed in permission or credential sections
