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
Use `npm run firefox:lint:baseline` before Firefox-targeted changes are sent so
the known local beta lint warnings do not drift.

The current Firefox local-beta baseline is zero errors and two generated-bundle
`UNSAFE_VAR_ASSIGNMENT` warnings for React runtime `innerHTML` handling. These
are third-party runtime warnings in the built bundle, not extension code that
injects provider or user content. Treat any additional warning or any error as
a regression until it is investigated.

## Before Sending Changes

Run the checks that match your change:

- Documentation only: `npm run docs:check` and `git diff --check`
- Runtime or script changes: `npm run i18n:check`, `npm run typecheck`, focused tests, `npm run build`, and `git diff --check`
- Firefox-target changes: add `npm run firefox:build`, `npm run firefox:lint`, and `npm run firefox:lint:baseline`
- Release candidate changes: `npm run release:check`

UI changes must follow the public [Design Contract](DESIGN.md). Shared visual,
responsive, localization, chart, or interaction changes should also run the
visual locale matrix described in [Testing Documentation](Doc/testing/README.md).

Provider source changes must also run `npm run provider:quality`. Start with
the [Provider Authoring Guide](Doc/Product/Provider_Authoring_Guide.md); it
defines descriptor, source-truth, fixture, host-access, upstream attribution,
and graduation requirements.

## UI Control Rhythm

Settings controls share three height tokens: compact controls use 36px, medium
controls use 44px, and large select/input/dropdown controls use 56px. Prefer the
shared tokens in `src/sidepanel/theme/tokens.css` and keep button/select content
centered with flex or grid alignment instead of one-off vertical padding.

## Boundaries

- Do not paste cookies, raw auth headers, personal tokens, or private provider data into fixtures, docs, screenshots, or issues.
- Keep provider source-truth boundaries explicit. If a provider exposes only partial, window-scoped, or policy-only data, do not describe it as exact live quota support.
- Keep generated evidence under `Doc/testing/` traceable through the existing request/archive workflow.
- Keep user-facing runtime strings in the localization catalogs.
- Classify upstream Provider influence in
  `config/provider-upstream-provenance.json`. Copied or translated/derived code
  also requires a source header and a matching `THIRD_PARTY_NOTICES.md` entry.

## License

Contributions are accepted under the repository license: GNU AGPL-3.0-only.
