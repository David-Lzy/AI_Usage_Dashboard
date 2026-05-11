# Release Packaging Guide

Date: 2026-05-11

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the canonical tracked release packaging and verification workflow
- refresh it whenever package versions, build outputs, packaging commands, or active support boundaries change

## Purpose

- define the release-candidate versioning scheme
- document the exact path from source tree to unpacked build and packaged zip
- make the Node 22 execution path explicit for any shell

## Runtime Requirement

- `.nvmrc` pins the project to Node `22`
- `package.json` requires Node `>=22.12.0`
- every `npm run ...` script now auto-falls back to `npx -y node@22` when the current shell is older

## Current Release Candidate

- package version: `0.1.0-rc.14`
- Chrome manifest version: `0.1.0.14`
- packaged artifact: `release/ai-usage-dashboard-0.1.0-rc.14.zip`
- follow-up candidate milestone: [2026-05-11_RC14_Follow_Up_Release_Candidate.md](./Milestones/2026-05-11_RC14_Follow_Up_Release_Candidate.md)
- submitted store-review boundary: [2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md](./Milestones/2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md)

## Build And Verification Flow

From the repository root:

```bash
npm install
npm run typecheck
npm run test
npm run build
```

Release-candidate verification shortcut:

```bash
npm run release:check
npm run phase27:check
```

What this verifies:

- TypeScript passes
- unit tests pass
- the extension bundle is rebuilt into `dist/`
- the unpacked extension survives the persistent-profile phase-27 browser checks

## Preview And Extension Review

- use `npm run preview:dist` for a stable preview over built `dist/`
- load the unpacked extension from `dist/` in `chrome://extensions`
- rebuild before any extension-mode review
- reload the unpacked extension after every rebuild before trusting runtime results

## Release Packaging

Create the release zip from the built extension:

```bash
npm run release:package
```

Or run the full flow:

```bash
npm run release
```

Packaging checks:

- `package.json` version matches `manifest.version_name`
- `manifest.version` matches the numeric Chrome version derived from the package version
- `dist/manifest.json` matches the same package and manifest versions before zipping
- `dist/manifest.json` exists
- `dist/src/sidepanel/index.html` exists
- `dist/icons/icon128.png` exists

## Support Boundary Checklist

Before calling the build a release candidate, confirm:

- the zip artifact exists in `release/`
- the unpacked `dist/` directory still loads in Chrome
- the extension icon appears in `chrome://extensions`
- the settings page still renders provider credentials and host-access controls
- the current provider claims in README, milestone docs, and store copy match the packaged source
