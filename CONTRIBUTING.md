# Contributing

AI Usage Dashboard is a Chrome extension for tracking AI coding tool usage, setup blockers, and sync health.

## Development Setup

1. Install Node.js `>=22.12.0`.
2. Install dependencies with `npm install`.
3. Run `npm run build` to produce `dist/chrome/`.
4. Load `dist/chrome/` as an unpacked extension from `chrome://extensions`.

For QA while that build is loaded, use a fresh absolute output root outside the
checkout: `export AI_USAGE_BUILD_ROOT="$(mktemp -d /tmp/ai-usage-qa-XXXXXX)"`.
Builds then use its `chrome/`, `firefox/` and `release/` children without updating
the checkout's legacy build aliases. Keep the same environment for packaging and
Firefox lint. Never use a directory containing important existing outputs; builds
replace their target contents. Do not override Vite `--outDir` independently.
Unset the variable before deliberately rebuilding your normal development copy.

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

Pull requests targeting `main` run read-only validation: documentation and
design checks, Provider contracts, localization, types, tests and both browser
packages. PRs cannot run publishing jobs or access store credentials. Local
checks are not evidence that a remote Actions run has passed; record the actual
PR check result before merge. Fork contributions may require maintainer approval
to start Actions. See the [release workflow guide](Doc/Store/GitHub_Release_Push_And_Notes.md)
for the separate tag and explicit store-submission paths.

## Workflow Commands

Use `npm run workflow:list` for maintained command groups and
`npm run workflow:audit -- --json` for a read-only inventory of script targets,
npm callers, static path references and write expressions. The audit never runs
commands or deletes files. Missing references may be outputs or historical
inputs; review them before changing anything.

Current surface QA uses `qa:surface:browser` and `qa:surface:extension`; the old
556/565 aliases remain compatible. Historical phase commands are not the normal
quality gate and may require old documentation or fixtures. Seven release review
aliases pinned to 0.1.0 RC4-RC10 were retired; their scripts and evidence remain.
Use Git history when reproducing historical releases, not current QA commands.
Do not delete browser-loaded builds, profiles, credentials or release evidence
as part of command cleanup.

## UI Control Rhythm

Gateway view calculations live in
[`api-gateway-metering-presentation.ts`](src/shared/api-gateway-metering-presentation.ts),
separate from the
[`deployment selector`](src/shared/components/ApiGatewayDeploymentSelector.tsx)
and metering-module composition. Keep pure calculations free of React and DOM
imports. Existing component entrypoints retain compatibility exports; consumers
can use the focused module when they need only a selector or formatter.

Progress appearance drafts and geometry live in
[`progress-appearance-editor-helpers.ts`](src/sidepanel/components/progress-appearance-editor-helpers.ts).
The parent preference control coordinates color-band and gradient-stop editors;
keep draft/selection lifetime compatible when switching modes. Appearance CSS
is an ordered import entrypoint for Settings, progress controls and previews.
Preserve cascade order when moving rules between these files.

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
