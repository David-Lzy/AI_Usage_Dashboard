# Phase 137 - Generated Package Readme Labeling And Refresh

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Purpose:

- remove the remaining ambiguity in repo-backed request and archive package READMEs
- make package-level generated docs follow the same taxonomy rules already applied to top-level indexes and maintained references

## Scope

This slice stays inside `Direction 08`.

It does not change runtime product behavior.

It updates:

- generated interaction-audit and theme-recovery package README renderers
- the documentation taxonomy and guardrails so package-level generated docs have explicit class semantics
- the lightweight taxonomy checker so it now covers generated package READMEs too
- one dedicated refresh command for package README regeneration:
  - `npm run docs:refresh-generated-package-readmes`

## What Changed

1. Request-package READMEs now declare themselves as generated operational ledgers.

Applied outcomes:

- [Doc/testing/operator_review_requests/2026-04-23-first-real-operator-review-request/README.md](../testing/operator_review_requests/2026-04-23-first-real-operator-review-request/README.md)
- [Doc/testing/theme_recovery_review_requests/2026-04-23-first-real-theme-recovery-review-request/README.md](../testing/theme_recovery_review_requests/2026-04-23-first-real-theme-recovery-review-request/README.md)

These package READMEs now state:

- `Document class: generated operational ledger`
- a `Status note:` that they should be refreshed through generators or refresh flows rather than hand-edited

2. Archive-package READMEs now declare themselves as closed evidence.

Applied outcomes:

- [Doc/testing/operator_reviews/2026-04-23-codex-seeded-review-archive-baseline/README.md](../testing/operator_reviews/2026-04-23-codex-seeded-review-archive-baseline/README.md)
- [Doc/testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/README.md](../testing/theme_recovery_reviews/2026-04-23-theme-recovery-seeded-archive-baseline/README.md)

These package READMEs now state:

- `Document class: closed evidence`
- a `Status note:` that they are generated renderings of archived records and should not be hand-edited to change archived outcomes

3. The repo now has one package-README refresh command.

New script:

- [refresh-generated-review-package-readmes.mjs](../../scripts/refresh-generated-review-package-readmes.mjs)

New command:

- `npm run docs:refresh-generated-package-readmes`

This command refreshes the current repo-backed request and archive package READMEs through the generators instead of through manual edits.

4. The taxonomy check now covers package-level generated docs too.

Updated scripts:

- [doc-taxonomy-check.mjs](../../scripts/lib/doc-taxonomy-check.mjs)
- [phase137-generated-package-readme-review.mjs](../../scripts/phase137-generated-package-readme-review.mjs)

New command:

- `npm run phase137:review`

It now checks:

- generated interaction-audit request package READMEs
- generated interaction-audit archive package READMEs
- generated theme-recovery request package READMEs
- generated theme-recovery archive package READMEs

## Truth Boundary

This slice clarifies and refreshes package-level generated docs.

It does not claim:

- that every generated markdown artifact inside package directories now carries explicit taxonomy labels
- that package READMEs are now manually authored reference docs
- that request packages and archive packages should share one identical class

The narrower truthful outcome is:

- request-package READMEs now read as generated operational ledgers
- archive-package READMEs now read as closed evidence
- the repo can refresh and check those package-level docs explicitly

## Verification

- `npm run docs:refresh-generated-package-readmes`
- `npm run docs:check`
- `npm run phase137:review`
- `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- `git diff --check`

## Follow-Up

Recommended next slice:

- decide whether any remaining living-strategy docs need explicit class labels, or whether the taxonomy should now explicitly stop at folder-implied roadmap semantics
