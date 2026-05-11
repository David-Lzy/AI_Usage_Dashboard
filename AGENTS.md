# AI Usage Dashboard

Chrome MV3 extension for AI quota, usage, and sync-health visibility across Cursor, Codex, Claude Code, and Gemini Code Assist.

## Start Here

1. [`START_PROMPT.md`](./START_PROMPT.md)
2. [`Doc/Project_Quickstart.md`](./Doc/Project_Quickstart.md)
3. [`Doc/Development_Guardrails.md`](./Doc/Development_Guardrails.md)
4. [`Doc/Documentation_Taxonomy.md`](./Doc/Documentation_Taxonomy.md)
5. [`Doc/TODOs/00_Phase_Index.md`](./Doc/TODOs/00_Phase_Index.md) and the active phase file
6. [`Doc/AI_Usage_Dashboard_TODOs.md`](./Doc/AI_Usage_Dashboard_TODOs.md)
7. [`Doc/Roadmap/00_Strategic_Directions_Index.md`](./Doc/Roadmap/00_Strategic_Directions_Index.md)

## Canonical Split

- `Doc/`: product truth, roadmap, phase files, provider notes, milestones, tracked workflow docs, generated ledgers, archived evidence
- `.agent/`: local-only agent scratch/workspace docs when present; do not treat it as canonical or version-controlled

Keep project truth in tracked root and `Doc/` files. Local helper material under `.agent/` may exist, but the repo must stay understandable without it.

## Key Commands

```bash
npm run dev
npm run build
npm run preview:dist
npm run typecheck
npm run test
npm run release:check
npm run release:package
npm run docs:check
```

## Core Project Rules

- Keep provider claims honest. Do not invent exact remaining values that vendor surfaces do not expose.
- Prefer existing React, TypeScript, i18n, storage, and CSS-module patterns.
- Update generators instead of hand-editing generated ledgers when possible.
- For extension-mode validation, build first, reload the unpacked extension from `dist/`, then inspect.

## Relevant Agent Docs

- [Project Quickstart](./Doc/Project_Quickstart.md)
- [Development Guardrails](./Doc/Development_Guardrails.md)
- [Documentation Taxonomy](./Doc/Documentation_Taxonomy.md)
- [Release Packaging Guide](./Doc/Release_Packaging_Guide.md)
- [Manual Test Checklist](./Doc/testing/Manual_Test_Checklist.md)
- [Store Screenshot Capture Runbook](./Doc/testing/Store_Screenshot_Capture_Runbook.md)
- [Interaction Audit Operator Handoff Runbook](./Doc/testing/Interaction_Audit_Operator_Handoff_Runbook.md)
- [Theme Recovery Operator Runbook](./Doc/testing/Theme_Recovery_Operator_Runbook.md)
- [Page Session Fixture Conventions](./Doc/testing/Page_Session_Fixture_Conventions.md)
