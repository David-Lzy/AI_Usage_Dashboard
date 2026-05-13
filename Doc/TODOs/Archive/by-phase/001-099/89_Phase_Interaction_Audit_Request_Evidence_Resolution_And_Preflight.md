# Phase 89 - Interaction Audit Request Evidence Resolution And Preflight

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- make repo-backed request fulfillment use the request package's evidence pack truthfully by default and surface that evidence dependency explicitly during preflight

Depends on:

- phase 88
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `scripts/`
- `package.json`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- factor request-evidence resolution into a shared helper so preflight plus completion stop relying on an unrelated hard-coded default when the request manifest already declares its evidence pack
- add an explicit preflight truth check for the request package's source evidence pack so the repo-entry flow can fail before completion if the required evidence report is unreadable or structurally invalid
- make completion default to the request package evidence when `--evidence` is omitted while still preserving truthful archive metadata when an explicit override is provided
- add repeatable review coverage that proves request-bound completion uses the request evidence by default and that archive truth switches when a deliberate override is passed

Done when:

- request-bound completion no longer falls back to a generic phase69 evidence path when the request manifest already declares its own evidence pack
- preflight reports whether the bound request evidence pack is readable and structurally valid
- archived review metadata preserves the actual evidence path that was used for fulfillment
- docs, verification, and preview closeout are complete

Out of scope:

- auto-discovering evidence packs from the browser runtime
- claiming that a real non-seeded operator review has already been completed
- redesigning the ad-hoc archive command outside the repo-backed request flow

Completion date: 2026-04-23

Completion summary:

- added a shared request-evidence resolver so repo-backed completion no longer falls back to an unrelated hard-coded evidence path when the pending request already records its own source evidence pack
- extended request-completion preflight so it now reports whether the bound request evidence pack is still readable and structurally valid before any archive write is attempted
- updated completion so omitting `--evidence` now uses the request package's recorded evidence by default, while explicit CLI overrides still preserve the actual evidence path that was used inside the linked archive
- added repeatable review coverage that proves both default request-bound evidence resolution and explicit override evidence resolution remain truthful end to end
- refreshed operator-facing docs so the request workflow now explains the new evidence default, the preflight evidence check, and the archive truth rules around deliberate overrides

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- request-package review: `npx -y node@22 ./scripts/phase80-interaction-audit-review-request-review.mjs`
- request lifecycle review: `npx -y node@22 ./scripts/phase81-interaction-audit-review-request-lifecycle-review.mjs`
- request preflight review: `npx -y node@22 ./scripts/phase87-interaction-audit-request-completion-preflight-review.mjs`
- request evidence review: `npx -y node@22 ./scripts/phase89-interaction-audit-request-evidence-resolution-review.mjs`
- generated request index refresh: `npm run interaction-audit:refresh-review-request-index`
- preview closeout: confirm the side-panel, popup, and audit-hub preview URLs still respond after the latest build

Follow-up:

- continue `Direction 04` by keeping the first real non-seeded operator export on a request lifecycle that is now request-bound in the UI, preflightable at the CLI layer, and truthful about which evidence pack completion actually archives
