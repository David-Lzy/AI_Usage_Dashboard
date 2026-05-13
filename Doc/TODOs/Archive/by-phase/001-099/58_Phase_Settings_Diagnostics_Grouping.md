# Phase 58 - Settings Diagnostics Grouping

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- reduce the density inside `Detailed diagnostics` so expanded source-card details read like grouped sections instead of one long undifferentiated field grid

Depends on:

- phase 57
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `src/sidepanel/`
- `README.md`
- `Doc/`

Tasks:

- group detailed source diagnostics into a few stable sections such as source decision, value semantics, and trust boundary
- replace the current flat two-column diagnostic tile grid with a more readable grouped disclosure layout
- keep existing information available while reducing the effort needed to scan an expanded source card

Done when:

- expanded diagnostics feel structured instead of one dense wall of fields
- the grouped layout preserves current information without widening the source cards
- focused tests, build checks, and visual verification pass
- docs and preview closeout are complete

Out of scope:

- new provider semantics
- changes to the default collapsed summary beyond what already shipped in phase 57
- new motion behavior beyond the current baseline

Completion date: 2026-04-23

Completion summary:

- grouped expanded source-card diagnostics into `Source decision`, `Value semantics`, and `Trust boundary` sections instead of keeping one flat two-column diagnostics grid
- switched expanded diagnostics from tile-style repetition to row-based grouped sections so disclosure stays easier to scan at narrow widths
- kept all previously shipped source-card facts available while making the expanded state materially less dense

Verification:

- targeted tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run src/sidepanel/settings-view-models.test.ts src/sidepanel/motion.test.ts`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- responsive regression review: `npx -y node@22 ./scripts/phase55-multi-width-visual-review.mjs`
- expanded-disclosure review: capture `tmp/phase58-settings-details-open.png` from the preview build after opening `Detailed diagnostics` on the Settings screen
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel plus popup preview URLs still respond

Follow-up:

- continue `Direction 04` by reducing the remaining copy density inside session-page track blocks and by checking expanded diagnostics in a real browser profile at compact widths
