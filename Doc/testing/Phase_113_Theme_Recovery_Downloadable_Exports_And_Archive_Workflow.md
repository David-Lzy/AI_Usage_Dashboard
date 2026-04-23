# Phase 113 - Theme Recovery Downloadable Exports And Archive Workflow

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

## Goal

Turn the `#debug-theme-recovery-review` workspace into one durable repo-backed evidence path instead of leaving theme-recovery output only in clipboard copy or `tmp/` scratch files.

This phase existed to:

- add direct downloadable summary plus JSON exports with stable filenames
- add one repo-backed `theme-recovery:archive` command
- add one generated archive index for durable theme-recovery records
- write the first clearly labeled seeded baseline without pretending a real operator pass already happened

## What Shipped

- new theme-recovery download filename helper:
  - `src/sidepanel/theme-recovery-export-files.ts`
- new helper unit coverage:
  - `src/sidepanel/theme-recovery-export-files.test.ts`
- updated operator workspace:
  - `src/sidepanel/routes/ThemeRecoveryReviewPage.tsx`
- new durable archive library:
  - `scripts/lib/theme-recovery-review-archive.mjs`
  - `scripts/lib/theme-recovery-review-archive-index.mjs`
- new archive commands:
  - `scripts/archive-theme-recovery-review.mjs`
  - `scripts/build-theme-recovery-review-archive-index.mjs`
- new repeatable review:
  - `scripts/phase113-theme-recovery-archive-workflow-review.mjs`
- new npm commands:
  - `npm run phase113:review`
  - `npm run theme-recovery:archive`
  - `npm run theme-recovery:refresh-archive-index`
- new durable archive index:
  - [Theme_Recovery_Review_Archive.md](./Theme_Recovery_Review_Archive.md)
- first durable seeded baseline:
  - `Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/README.md`

## Assertions Covered

This phase now proves:

- the workspace can download one summary artifact and one JSON artifact directly from the shipped UI
- download filenames are stable and derived from:
  - generated date
  - theme mode
  - review stage
  - preset
- the downloaded files preserve the exact visible review state shown by the workspace
- one exported theme-recovery JSON payload can become one durable archive record under `Doc/testing/theme_recovery_reviews/`
- the generated archive README preserves:
  - theme mode
  - preset
  - custom seed
  - review stage
  - popup snapshot
  - action badge
  - target-provider recovery lines
- the generated archive index distinguishes:
  - seeded baselines
  - future real operator sessions

This phase still does **not** claim:

- a native host-permission prompt was completed
- a real vendor session was recovered by a human operator
- a non-seeded operator theme-recovery archive already exists

## Verification

The following commands passed after `Phase 113` landed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
npm run phase112:review
npm run phase113:review
npm run theme-recovery:refresh-archive-index
```

Verification summary:

- typecheck passed
- all unit tests passed
- production build passed
- the existing theme-recovery workspace review stayed green
- `phase113:review` proved both direct downloads and the durable archive workflow
- the generated theme-recovery archive index refreshed successfully

Observed `phase113` result:

- seeded archive id:
  - `2026-04-23-theme-recovery-seeded-archive-baseline`
- current truthful archived stage:
  - `Needs access`
- current truthful popup snapshot:
  - `Mixed state`
- current truthful action badge:
  - `2`
- current archive index state:
  - seeded records: `1`
  - operator records: `0`

Downloaded filenames proved by the review:

- `theme-recovery-summary-2026-04-23-light-needs-access-custom.md`
- `theme-recovery-export-2026-04-23-light-needs-access-custom.json`

Generated durable artifacts:

- `Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/README.md`
- `Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/review-archive.json`
- `Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/theme-recovery-review-export.json`
- `Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/theme-recovery-summary.md`
- `Doc/testing/Theme_Recovery_Review_Archive.md`

Machine-readable review output:

- `tmp/phase113-theme-recovery-archive-workflow-review/phase113-results.json`

## Notes

- this phase intentionally archives a seeded degraded-state baseline instead of pretending that the first durable theme-recovery record is already a real recovered operator pass
- the first durable archive therefore preserves `Needs access`, `Mixed state`, and badge text `2` as the truthful current state
- the next honest theming slice should use the same workspace plus archive flow on one real operator recovery session instead of inventing a second archive format
