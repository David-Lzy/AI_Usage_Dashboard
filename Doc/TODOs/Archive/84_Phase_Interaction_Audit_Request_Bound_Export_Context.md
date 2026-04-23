# Phase 84 - Interaction Audit Request-Bound Export Context

Status: completed

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Goal:

- prevent one valid-looking exported interaction-audit workspace from fulfilling the wrong pending request when multiple pending requests share the same template shape

Depends on:

- phase 83
- [Direction 04 - Material, Motion, And Responsive Hardening](../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `src/sidepanel/`
- `scripts/`
- `scripts/lib/`
- `fixtures/interaction-audit/`
- `package.json`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- preserve a request-bound context inside repo-backed pending request templates so imported audit workspaces know which request they came from
- persist that request binding across audit-hub import, local storage, draft generation, and exported signoff JSON
- enforce that `interaction-audit:complete-review-request` rejects exported workspaces whose request binding does not match the target pending request even if the workspace shape still matches
- add a repeatable review that proves missing or mismatched request bindings are rejected while correctly bound exports still fulfill the request successfully
- refresh the repo-backed pending request and request index so the current request package also carries the new request-bound template context

Done when:

- repo-backed request templates carry explicit request binding metadata
- audit-hub import and export preserve that request binding without hand edits
- completion rejects request-binding mismatches with a concrete error
- docs, verification, and preview closeout are complete

Out of scope:

- changing the visible audit-surface checklist content
- claiming that a real human operator request has already been fulfilled
- adding remote identity or cryptographic attestation to exported audit artifacts

Completion date: 2026-04-23

Completion summary:

- bound repo-backed pending request templates to explicit `requestContext` metadata so one request package now preserves both its expected checklist shape and its own request identity
- preserved that request binding through audit-hub import, local workspace state, live draft generation, and exported signoff JSON instead of dropping it after the initial template import
- updated `interaction-audit:complete-review-request` to reject exported workspace state whose request binding does not match the target pending request even when the visible checklist shape still matches
- refreshed the repo-backed pending request and generated request index so the current request package now exposes the bound request context and stronger completion truth note
- added a repeatable request-binding review that proves blank or wrong request bindings are rejected while a correctly bound export still fulfills the request successfully

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- request-package regression review: `npx -y node@22 ./scripts/phase80-interaction-audit-review-request-review.mjs`
- request lifecycle regression review: `npx -y node@22 ./scripts/phase81-interaction-audit-review-request-lifecycle-review.mjs`
- request-to-archive traceability regression review: `npx -y node@22 ./scripts/phase82-interaction-audit-request-archive-traceability-review.mjs`
- request shape-integrity regression review: `npx -y node@22 ./scripts/phase83-interaction-audit-request-completion-integrity-review.mjs`
- request-bound export-context review: `npx -y node@22 ./scripts/phase84-interaction-audit-request-bound-export-context-review.mjs`
- repo-backed request index refresh: `npx -y node@22 ./scripts/build-interaction-audit-review-request-index.mjs`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel, popup, and audit-hub preview URLs still respond

Follow-up:

- continue `Direction 04` by keeping the first real non-seeded operator export on the same request-bound lifecycle, so even same-shape exported workspace state cannot be linked to the wrong durable request record by accident
