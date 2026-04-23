# Phase 88 - Interaction Audit Request Scope Visibility And Exports

Status: completed

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Goal:

- make request-bound interaction-audit work visibly different from ad-hoc workspace state inside the audit hub and inside downloaded artifact filenames

Depends on:

- phase 87
- [Direction 04 - Material, Motion, And Responsive Hardening](../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `src/sidepanel/`
- `scripts/`
- `package.json`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- surface explicit request-scope guidance in the audit hub so operators can tell whether the current workspace is repo-backed or ad hoc
- show the next truthful repo command path for the current workspace scope, including preflight plus completion for bound requests and archive for ad-hoc work
- include bound request identity in downloadable audit artifact filenames so exports are easier to keep aligned with one pending request
- add repeatable review coverage that proves request-scope UI and downloaded filenames switch correctly after importing a bound request template

Done when:

- the audit hub clearly distinguishes repo-backed request scope from ad-hoc archive scope
- downloaded signoff plus handoff artifacts include request-bound filename identity when a workspace is bound to a pending request
- repeatable review proves request-scope messaging and filenames update after request-bound import
- docs, verification, and preview closeout are complete

Out of scope:

- fetching live request manifests from the repo directly inside the shipped extension runtime
- auto-running preflight or completion commands from the browser UI
- claiming that a real human operator request has already been fulfilled

Completion date: 2026-04-23

Completion summary:

- added an explicit `Request Scope` block to the audit hub so operators can see whether the current workspace is repo-backed or ad-hoc
- surfaced the next truthful repo command path inside that scope block, including preflight plus completion for bound request workspaces and archive for ad-hoc workspaces
- updated downloadable audit artifact filenames so bound request work now carries the request id in the filename instead of relying only on session metadata
- added repeatable review coverage that proves bound request import updates both the visible scope guidance and the downloaded signoff JSON filename
- refreshed reviewer-facing docs so the request-scope UI and request-aware download naming are now part of the documented operator flow

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- direct-download regression review: `npx -y node@22 ./scripts/phase76-interaction-audit-download-export-review.mjs`
- request-package regression review: `npx -y node@22 ./scripts/phase80-interaction-audit-review-request-review.mjs`
- request-completion preflight regression review: `npx -y node@22 ./scripts/phase87-interaction-audit-request-completion-preflight-review.mjs`
- request-scope visibility review: `npx -y node@22 ./scripts/phase88-interaction-audit-request-scope-visibility-review.mjs`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel, popup, and audit-hub preview URLs still respond

Follow-up:

- continue `Direction 04` by keeping the first real non-seeded operator export on a request lifecycle that is now preflightable at the CLI layer and visibly request-scoped inside the audit hub and exported artifacts
