# Phase 79 - Interaction Audit Review Archive Index

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- make the interaction-audit review archive self-indexing so new durable review records do not require manual doc edits after each archived session

Depends on:

- phase 78
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `scripts/`
- `scripts/lib/`
- `package.json`
- `README.md`
- `Doc/testing/`
- `Doc/`

Tasks:

- add a reusable archive-index builder that scans durable archive manifests and regenerates the human-readable archive index
- add a machine-readable archive catalog under `Doc/testing/operator_reviews/`
- make the main archive command refresh the default repo index automatically after writing a new archive
- add a repeatable review pass that verifies seeded and non-seeded archive grouping plus generated index output

Done when:

- the repo can rebuild the review archive index from manifest files without manual markdown edits
- the default archive command refreshes the repo archive index automatically
- docs, verification, and preview closeout are complete

Out of scope:

- claiming that generated index entries mean a human review has been completed
- inventing remote review sync or approval workflows
- replacing the existing archive directory layout added in phase 78

Completion date: 2026-04-23

Completion summary:

- added a reusable archive-index builder so the durable interaction-audit archive now regenerates both `Doc/testing/Interaction_Audit_Review_Archive.md` and `Doc/testing/operator_reviews/index.json` from stored archive manifests
- updated the default `interaction-audit:archive` command so repo-backed archive writes now refresh the generated archive index automatically instead of leaving follow-up markdown edits to a later manual step
- strengthened the archive index truth model so seeded baselines and real operator sessions now render as separate sections instead of one undifferentiated list
- added `scripts/phase79-interaction-audit-review-archive-index-review.mjs`, saved artifacts under `tmp/phase79-interaction-audit-review-archive-index-review/`, and wrote a dedicated testing report for seeded plus operator grouping, generated markdown index output, and machine-readable archive catalog output
- updated README, testing docs, roadmap docs, the phase index, and the project TODO index to reflect the new self-indexing archive flow

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- full unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- interaction-audit review-archive review: `npx -y node@22 ./scripts/phase78-interaction-audit-review-archive-review.mjs`
- interaction-audit review-archive-index review: `npx -y node@22 ./scripts/phase79-interaction-audit-review-archive-index-review.mjs`
- durable archive write with automatic index refresh: `npx -y node@22 ./scripts/archive-interaction-audit-review.mjs --input fixtures/interaction-audit/codex-seeded-review-archive-baseline.fixture.json --archive-id 2026-04-23-codex-seeded-review-archive-baseline`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the side-panel plus popup preview URLs still respond

Follow-up:

- continue `Direction 04` with the first real non-seeded operator review session so the now-self-indexing archive flow records a genuine exported human review without any manual archive-doc maintenance
