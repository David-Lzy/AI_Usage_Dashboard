# Phase 137 - Generated Request And Archive Package Readme Labeling

Status: completed

Completion date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Completion summary:

- labeled generated request-package READMEs as `generated operational ledger`
- labeled generated archive-package READMEs as `closed evidence`
- added one `docs:refresh-generated-package-readmes` command plus one `phase137:review` pass so package-level generated docs are now refreshed and checked through repo workflows instead of hand edits

Verification:

- `npm run docs:refresh-generated-package-readmes`
- `npm run docs:check`
- `npm run phase137:review`
- `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- `git diff --check`

Follow-up:

- decide whether remaining living-strategy docs should stay folder-implied by convention or gain explicit class labels too
