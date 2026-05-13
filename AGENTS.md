# AI Usage Dashboard

Chrome MV3 extension for AI quota, usage, and sync-health visibility across Cursor, Codex, Claude Code, and Gemini Code Assist.

## Start Here

1. [`START_PROMPT.md`](./START_PROMPT.md)
2. [`Doc/README.md`](./Doc/README.md)
3. [`Doc/TODOs/00_Phase_Index.md`](./Doc/TODOs/00_Phase_Index.md) and the active phase file
4. [`Doc/AI_Usage_Dashboard_TODOs.md`](./Doc/AI_Usage_Dashboard_TODOs.md)
5. [`Doc/Roadmap/00_Strategic_Directions_Index.md`](./Doc/Roadmap/00_Strategic_Directions_Index.md)

## Canonical Split

- `Doc/`: product truth, roadmap, phase files, provider notes, milestones, generated ledgers, and archived evidence
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

## Documentation Entry Points

- [Documentation Index](./Doc/README.md)
- [Phase Index](./Doc/TODOs/00_Phase_Index.md)
- [Current Project TODOs](./Doc/AI_Usage_Dashboard_TODOs.md)
- [Strategic Roadmap Index](./Doc/Roadmap/00_Strategic_Directions_Index.md)
- [Compatibility stubs](./Doc/README.md#compatibility-stubs) for old process-doc paths
