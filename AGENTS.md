# AI Usage Dashboard

Chrome MV3 extension for AI quota, usage, and sync-health visibility across Cursor, Codex, Claude Code, and Gemini Code Assist.

## Start Here

1. [`README.md`](./README.md)
2. [`CONTRIBUTING.md`](./CONTRIBUTING.md)
3. [`Doc/README.md`](./Doc/README.md)

## Canonical Split

- `Doc/`: public product truth, store copy, i18n design, provider truth boundaries, and public verification guidance.
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
- [Product contracts](./Doc/Product/)
- [Provider notes](./Doc/provider_notes/)
- [I18n contracts](./Doc/I18n/)
- [Store listing copy](./Doc/Store/)
