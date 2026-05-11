# Interaction Audit Review Archive

Date: 2026-05-11

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- generated operational ledger
- completion model: truthful when regenerated from current archive manifests, not when frozen as a one-time closeout file
- taxonomy: [Documentation_Taxonomy.md](../Documentation_Taxonomy.md)

Purpose:

- index durable interaction-audit review records stored under the repo archive root
- distinguish seeded internal baselines from real operator review sessions

Managed note:

- this file is regenerated from `review-archive.json` manifests inside `Doc/testing/operator_reviews`
- rerun `npm run interaction-audit:refresh-archive-index` after adding, removing, or editing a durable archive record outside the main archive command

## Archive Commands

Archive a new exported review session into the repo:

```bash
npm run interaction-audit:archive -- --input tmp/operator-signoff-export.json
```

Refresh only the generated index and machine-readable catalog:

```bash
npm run interaction-audit:refresh-archive-index
```

## Truth Rules

- archived review records mirror the exported audit workspace state only
- `Ready for signoff: no` is a valid archived outcome and must not be rewritten into a pass claim
- seeded internal baselines are useful workflow fixtures, but they are not real human operator signoff records
- real operator review sessions should preserve their own reviewer, session label, and reviewed-at values exactly as exported
- when an archive comes from a repo-backed request, the archive should preserve that source request link instead of relying on outside notes
- when an archive comes from a request-bound export, the archive should also preserve that export's request binding and request revision instead of dropping them after handoff
- when an archive comes from request-backed completion, the archive should also preserve the actual evidence source plus integrity summary used at completion time instead of reducing provenance to one path string alone

## Seeded Baselines

- [2026-04-23-codex-seeded-review-archive-baseline](./operator_reviews/2026-04-23-codex-seeded-review-archive-baseline/README.md)
  - archived on 2026-04-23
  - reviewer: `Codex seeded review`
  - session: `codex seeded review archive baseline`
  - current truth: `Ready for signoff: no`, `Follow-up required: 1`, `Not reviewed: 2`

## Operator Review Sessions

- [2026-05-11-2026-05-11-rdp-chrome-visual-audit](./operator_reviews/2026-05-11-2026-05-11-rdp-chrome-visual-audit/README.md)
  - archived on 2026-05-11
  - reviewer: `David Li (via Claude Code RDP session)`
  - session: `2026-05-11 RDP Chrome visual audit`
  - source request: [2026-04-23-first-real-operator-review-request](./operator_review_requests/2026-04-23-first-real-operator-review-request/README.md)
  - request binding: `2026-04-23-first-real-operator-review-request @ 2026-04-22T23:40:08.207Z`
  - request revision: `sha256:c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1`
  - evidence source: `Request evidence snapshot`
  - evidence integrity: `verified`
  - current truth: `Ready for signoff: yes`, `Follow-up required: 0`, `Not reviewed: 0`
