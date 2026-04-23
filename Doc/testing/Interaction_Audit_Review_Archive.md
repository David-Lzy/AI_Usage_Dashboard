# Interaction Audit Review Archive

Date: 2026-04-23

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

- no real operator review sessions are archived yet
