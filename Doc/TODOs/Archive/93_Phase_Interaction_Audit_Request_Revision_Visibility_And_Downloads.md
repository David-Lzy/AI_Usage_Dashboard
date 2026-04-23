# Phase 93 - Interaction Audit Request Revision Visibility And Downloads

Status: completed

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Goal:

- make repo-backed request revisions visible inside the audit hub and preserve them in bound download artifacts so one operator can tell which request package revision one local export belongs to before completion

Depends on:

- phase 92
- [Direction 04 - Material, Motion, And Responsive Hardening](../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `src/sidepanel/`
- `scripts/`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- surface the current request revision in the audit-hub review-session summary and `Request Scope` block
- preserve the current request revision in bound signoff-draft, signoff-JSON, and handoff-summary download filenames
- preserve the full request revision line inside signoff-draft and handoff-summary markdown exports
- update request-scope review coverage so the shipped pending request proves both request-scope visibility and revision-aware downloads
- add one new repeatable review pass that validates the visible request revision plus all revision-aware download artifacts end to end

Done when:

- the audit hub shows the bound request revision whenever the workspace is imported from one repo-backed request template
- bound download filenames preserve a short revision segment in addition to the request id
- signoff draft and handoff summary exports preserve the full request revision line
- repeatable review proves the shipped pending request carries its revision through UI plus download artifacts
- docs, verification, and preview closeout are complete

Out of scope:

- claiming that the first non-seeded operator review has already been completed
- changing request-completion truth gates or archive semantics beyond visibility plus download identity
- adding signed or remote-attested export provenance

Completion date: 2026-04-23

Completion summary:

- the audit hub now surfaces the current bound request revision in both the review-session summary and the `Request Scope` block, so request-bound work is no longer identified only by request id plus created-at metadata
- bound signoff-draft, signoff-JSON, and handoff-summary downloads now preserve a short `rev-...` segment in filenames, which makes refreshed request packages easier to distinguish in local operator handoff
- signoff draft plus handoff summary markdown now preserve the full `Request revision: sha256:...` line, so the exported handoff text matches the request truth already visible in the audit hub
- the earlier request-scope visibility review was updated to the new bound filename shape, and one new repeatable review now proves the shipped pending request exposes its revision in the audit hub and preserves that revision through all bound download artifacts

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- request-scope review: `npx -y node@22 ./scripts/phase88-interaction-audit-request-scope-visibility-review.mjs`
- request-revision visibility review: `npx -y node@22 ./scripts/phase93-interaction-audit-request-revision-visibility-review.mjs`
- preview closeout: confirm the side-panel, popup, and audit-hub preview URLs still respond after the latest build

Follow-up:

- continue `Direction 04` by keeping the eventual first real non-seeded operator export on a lifecycle that is now request-bound, revision-bound, visible in the audit hub, and distinguishable in local download artifacts before fulfillment
