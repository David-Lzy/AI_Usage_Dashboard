# Theme Recovery Review Archive

Date: 2026-05-11

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- generated operational ledger
- completion model: truthful when regenerated from current archive manifests, not when frozen as a one-time closeout file
- taxonomy: [Documentation_Taxonomy.md](../Documentation_Taxonomy.md)

Purpose:

- index durable theme-recovery review records stored under the repo archive root
- distinguish seeded internal baselines from future real operator recovery sessions

Managed note:

- this file is regenerated from `review-archive.json` manifests inside `Doc/testing/theme_recovery_reviews`
- rerun `npm run theme-recovery:refresh-archive-index` after manual archive edits

## Archive Commands

Archive a new exported theme-recovery review:

```bash
npm run theme-recovery:archive -- --input tmp/theme-recovery-export.json
```

Refresh only the generated index and machine-readable catalog:

```bash
npm run theme-recovery:refresh-archive-index
```

## Truth Rules

- archived review records mirror the exported theme-recovery workspace state only
- seeded baselines are useful workflow fixtures, but they are not real human operator passes
- real operator recovery sessions should preserve the exported recovery stage instead of rewriting warning states into a pass claim

## Seeded Baselines

- [2026-04-23-theme-recovery-seeded-archive-baseline](./theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/README.md)
  - stage: `Needs access` · scope: `Cursor + Codex isolated` · popup: `Mixed state`
  - theme: `light` / `custom` · seed `#4F46E5`
  - providers: recovered `0` / total `2`
  - source export: `tmp/phase113-theme-recovery-archive-workflow-review/downloads/theme-recovery-export-2026-04-23-light-needs-access-custom.json`

## Operator Review Sessions

- [2026-05-11-system-recovered-014312](./theme_recovery_reviews/2026-05-11-system-recovered-014312/README.md)
  - stage: `Recovered` · scope: `Cursor + Codex isolated` · popup: `Aligned`
  - theme: `system` / `custom` · seed `#4F46E5`
  - providers: recovered `2` / total `2`
  - source export: `tmp/theme-recovery-review-export.json`
  - source request: `2026-04-23-first-real-theme-recovery-review-request` · `Doc/testing/theme_recovery_review_requests/2026-04-23-first-real-theme-recovery-review-request/README.md`
