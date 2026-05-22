# Contributing

AI Usage Dashboard is a Chrome extension for tracking AI coding tool usage, setup blockers, and sync health.

## Development Setup

1. Install Node.js `>=22.12.0`.
2. Install dependencies with `npm install`.
3. Run `npm run build` to produce `dist/chrome/`.
4. Load `dist/chrome/` as an unpacked extension from `chrome://extensions`.

Firefox compatibility work is kept on the same mainline but remains
experimental. Use `npm run firefox:build` and `npm run firefox:lint` to verify
the generated `dist/firefox/` package without changing the Chrome build output.

## Before Sending Changes

Run the checks that match your change:

- Documentation only: `npm run docs:check` and `git diff --check`
- Runtime or script changes: `npm run i18n:check`, `npm run typecheck`, focused tests, `npm run build`, and `git diff --check`
- Firefox-target changes: add `npm run firefox:build` and `npm run firefox:lint`
- Release candidate changes: `npm run release:check`

## Boundaries

- Do not paste cookies, raw auth headers, personal tokens, or private provider data into fixtures, docs, screenshots, or issues.
- Keep provider source-truth boundaries explicit. If a provider exposes only partial, window-scoped, or policy-only data, do not describe it as exact live quota support.
- Keep generated evidence under `Doc/testing/` traceable through the existing request/archive workflow.
- Keep user-facing runtime strings in the localization catalogs.

## License

Contributions are accepted under the repository license: GNU AGPL-3.0-only.
