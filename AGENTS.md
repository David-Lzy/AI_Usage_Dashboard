# AI Usage Dashboard

Chrome MV3 extension for AI quota, usage, and sync-health visibility across Cursor, Codex, Claude Code, and Gemini Code Assist.

## Start Here

1. [`README.md`](./README.md)
2. [`CONTRIBUTING.md`](./CONTRIBUTING.md)
3. [`Doc/README.md`](./Doc/README.md)
4. [`Doc/AI_Usage_Dashboard_TODOs.md`](./Doc/AI_Usage_Dashboard_TODOs.md)

## Canonical Split

- `Doc/`: public product truth, store copy, i18n design, provider truth boundaries, milestones, QA indexes, and archived evidence.
- `.local/`: ignored private workflow memory for this machine. It may contain local agent notes, RDP/screenshot operations, release workflow notes, and historical snapshots.
- `.agent/`: ignored compatibility scratch space when present; do not treat it as canonical or version-controlled.

Keep public project truth in tracked root and `Doc/` files. Do not create a second maintained copy of `Doc/` content under `.local/` or `.agent/`; private notes may link to public docs and add local-only operational context.

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
