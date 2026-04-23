# Phase 139 - Doc Taxonomy Boundary And Convention-Only Policy

Status: completed

Completion date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Completion summary:

- defined the current convention-only boundary for remaining unlabeled evidence artifacts
- exposed that boundary through checker output and test coverage
- documented the promotion rule for future cases where convention-only docs become ambiguous

Verification:

- `npm run docs:check`
- `npm run phase139:review`
- `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- `git diff --check`

Follow-up:

- decide whether any remaining low-value generated or historical docs should stay convention-only or be promoted only when they create real reader ambiguity
