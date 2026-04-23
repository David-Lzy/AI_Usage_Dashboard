# Phase 63 - Toned Surface Content Hierarchy

Status: completed

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Goal:

- make text and supporting content inside warning, error, and success surfaces follow the same tonal hierarchy as the new status backgrounds

Depends on:

- phase 62
- [Direction 04 - Material, Motion, And Responsive Hardening](../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `src/sidepanel/theme/`
- `scripts/`
- `package.json`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- add shared on-surface selectors for titles, labels, and supporting text inside toned warning, error, and success surfaces
- apply the toned content hierarchy to summary pills, provider cards, popup cards, permission prompts, detail notes, and toast feedback
- add a repeatable review pass that checks toned-surface text colors across dashboard, settings, popup, and detail-note states
- update docs and close out preview after verification

Done when:

- toned surfaces no longer keep neutral text hierarchy where a status-specific on-color should be used
- supporting copy on warning and error surfaces is visibly subordinate but still aligned to the same status tone
- the repo has a repeatable toned-content review command with saved artifacts
- docs, verification, and preview closeout are complete

Out of scope:

- changing provider semantics or card layout structure
- adding dark mode
- reworking chip taxonomy beyond the text hierarchy needed for toned surfaces

Completion date: 2026-04-23

Completion summary:

- added toned-surface content hierarchy so warning, error, and success surfaces now separate primary text from subordinate supporting text instead of reusing neutral content colors
- aligned summary pills, provider cards, popup cards, warning permission prompts, warning detail notes, and success/error toast feedback to the same on-color hierarchy
- added `scripts/phase63-toned-content-review.mjs` and `npm run phase63:review` so toned-surface text hierarchy now has a repeatable screenshot and machine-readable verification pass
- updated README, roadmap docs, testing docs, and the manual checklist to reflect the new toned-content baseline

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- responsive regression review: `npx -y node@22 ./scripts/phase55-multi-width-visual-review.mjs`
- compact Settings plus reduced-motion review: `npx -y node@22 ./scripts/phase60-compact-settings-review.mjs`
- keyboard interaction review: `npx -y node@22 ./scripts/phase61-interaction-state-review.mjs`
- status-surface review: `npx -y node@22 ./scripts/phase62-status-surface-review.mjs`
- toned-content review: `npx -y node@22 ./scripts/phase63-toned-content-review.mjs`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel plus popup preview URLs still respond

Follow-up:

- continue `Direction 04` by deciding whether the next slice should be a real-browser manual interaction audit or a broader Material component audit on chips, progress indicators, and remaining neutral surfaces
