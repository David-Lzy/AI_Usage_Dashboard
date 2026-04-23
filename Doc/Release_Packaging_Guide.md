# Release Packaging Guide

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

## Purpose

- define the release-candidate versioning scheme
- document the exact path from source tree to unpacked build and packaged zip
- make install and permission expectations explicit for another operator

## Release Candidate Version Strategy

Package version:

- `package.json` uses the human-facing semver tag
- current value: `0.1.0-rc.2`

Chrome extension version:

- `src/manifest.json` uses Chrome's required numeric-only version format
- current value: `0.1.0.2`

Display version:

- `src/manifest.json` also uses `version_name`
- current value: `0.1.0-rc.2`

Why the two values differ:

- Chrome requires `version` to be one to four dot-separated integers
- the release candidate label is preserved in `version_name`

Reference:

- Chrome manifest version rules: https://developer.chrome.com/docs/extensions/mv3/manifest/version

## Build And Verification Flow

From the repository root:

```bash
nvm use
npm install
npm run typecheck
npm run test
npm run build
```

Portable fallback if `nvm` is not installed in the current shell:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
```

Release-candidate verification shortcut:

```bash
nvm use
npm run release:check
npm run phase27:check
```

Portable fallback:

```bash
npx -y node@22 ./scripts/phase27-real-profile-check.mjs
```

What this verifies:

- TypeScript passes
- unit tests pass
- the extension bundle is rebuilt into `dist/`
- the unpacked extension survives the persistent-profile phase-27 browser checks

## Static Preview Flow

Use the built `dist/` output, not the CRXJS dev server, when you need a stable release preview:

```bash
nvm use
npm run preview:dist
```

Reason:

- CRXJS serve workflows are useful for development, but they do not behave like a stable packaged build
- the release preview for this project should reflect the actual `dist/` artifact

Preview URLs:

- local: `http://127.0.0.1:4173/src/sidepanel/index.html`
- LAN: `http://10.10.2.202:4173/src/sidepanel/index.html`

## Unpacked Install Steps

1. Run `npm run build`.
2. Open `chrome://extensions`.
3. Turn on `Developer mode`.
4. Click `Load unpacked`.
5. Select the repository `dist/` directory.
6. Verify the extension name, icon, and side panel load correctly.

## Release Packaging

Create the release zip from the built extension:

```bash
nvm use
npm run release:package
```

Or run the full flow:

```bash
nvm use
npm run release
```

Portable packaging fallback:

```bash
npx -y node@22 ./scripts/package-release.mjs
```

Packaging output:

- `release/ai-usage-dashboard-0.1.0-rc.2.zip`
- SHA256: `3f0f4602a5b20dc0a538ae018d83cfff53b58e2dc572fe9c1c3c85cd66252339`

The packaging script checks:

- `package.json` version matches `manifest.version_name`
- `manifest.version` matches the Chrome numeric version derived from the package version
- `dist/manifest.json` exists
- `dist/src/sidepanel/index.html` exists
- `dist/icons/icon128.png` exists

Environment note:

- the project expects Node `22`
- if your default shell still points at an older runtime, run `nvm use` before any `npm run ...` command
- if `nvm` is unavailable, use `npx -y node@22 ...` for the verification and packaging commands above

## Permission And Credential Expectations

| Provider | Credential requirement | Host access requirement |
| --- | --- | --- |
| Cursor | Admin API key | `api.cursor.com` |
| JetBrains AI | none | JetBrains account and usage pages |
| Claude Code | Admin API key | `api.anthropic.com`, `platform.claude.com` |
| Gemini Code Assist | none | none |
| Codex | Analytics API key and workspace ID | `api.chatgpt.com` |

## User-Facing Support Boundaries

- Cursor: supported through the Team Admin API
- JetBrains AI: retained in the repository, but deferred from the active narrowed RC until a real org-visible `Users and licensing` session is reverified
- Claude Code: supported through the Admin Analytics API
- Gemini Code Assist: shipped as documented policy only
- Codex: supported through the Enterprise Analytics API

Important constraints:

- Gemini does not expose a stable live per-user usage source in this release
- JetBrains is not part of the active narrowed RC support promise even though its retained repo path and debug tooling remain present
- Codex analytics do not expose exact remaining workspace credits
- Claude analytics do not expose exact remaining included subscription quota

## Output Checklist

Before calling the build a release candidate, confirm:

- the zip artifact exists in `release/`
- the unpacked `dist/` directory still loads in Chrome
- the extension icon appears in `chrome://extensions`
- the settings page still renders provider credentials and host-access controls
- the local real-profile check has been run via `npm run phase27:check`
- the remaining GUI-only permission prompt pass is closed by an operator if release sign-off requires native prompt acceptance
