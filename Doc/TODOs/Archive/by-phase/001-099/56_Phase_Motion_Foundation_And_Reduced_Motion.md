# Phase 56 - Motion Foundation And Reduced Motion

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- add a small motion foundation for the side panel that improves feedback and navigation while shipping `prefers-reduced-motion` support first

Depends on:

- phase 55
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `src/sidepanel/`
- `README.md`
- `Doc/`

Tasks:

- add motion tokens plus reduced-motion-safe transitions for existing interactive surfaces
- make Settings section jumps respect reduced-motion preference instead of forcing abrupt scrolling everywhere
- add lightweight motion to existing feedback and disclosure patterns such as toast entrance and source-card details

Done when:

- the side panel has a documented motion baseline instead of zero motion
- users with reduced-motion preference avoid non-essential animation
- at least one focused automated verification step covers the new motion helper logic
- docs, build checks, and preview closeout are complete

Out of scope:

- a full route-transition framework
- decorative animation that does not communicate feedback or hierarchy
- redesigning the Settings information architecture again in this phase

Completion date: 2026-04-23

Completion summary:

- added motion tokens plus a reduced-motion-safe helper so the side panel now has a small motion baseline instead of abrupt transitions everywhere
- made Settings section jumps scroll smoothly by default while switching back to instant jumps for reduced-motion users
- added light entrance motion for top-level surfaces, toast feedback, and source-card disclosure without breaking the existing multi-width responsive baseline

Verification:

- targeted tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run src/sidepanel/motion.test.ts src/sidepanel/settings-view-models.test.ts`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- responsive regression review: `npx -y node@22 ./scripts/phase55-multi-width-visual-review.mjs`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel plus popup preview URLs still respond

Follow-up:

- continue `Direction 04` by trimming remaining visual repetition in dense Settings source cards and then manually reviewing the reduced-motion path in a real browser profile
