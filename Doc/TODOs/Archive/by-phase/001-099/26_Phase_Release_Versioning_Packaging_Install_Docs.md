# Phase 26 - Release Versioning Packaging Install Docs

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- make the project shippable as a release candidate from a packaging and documentation standpoint

Depends on:

- phase 25

File scope:

- `package.json`
- `src/manifest.json`
- `README` or install docs
- release notes or packaging docs

Tasks:

- set the release candidate version numbers consistently
- define the exact build and packaging steps
- write unpacked install instructions and update any stale setup docs
- document provider support boundaries and required permissions for users
- verify the output artifact flow from source to packaged extension

Done when:

- version numbers are intentional and synchronized
- build and install instructions are complete enough for another user to follow
- packaging steps are documented without relying on tribal knowledge

Out of scope:

- actual store submission

Completion date: 2026-04-21

Completion summary:

- defined the release-candidate version scheme across `package.json`, `manifest.version`, and `manifest.version_name`
- moved the project to `0.1.0-rc.1` at the package level and `0.1.0.1` at the Chrome manifest level to satisfy Chrome's numeric-only version rule
- added release-facing npm scripts for `preview:dist`, `release:check`, `release:package`, and `release`
- implemented a packaging script that validates version alignment, checks required build outputs, and creates a zip artifact in `release/`
- created a root `README.md` with quickstart, unpacked install steps, provider support boundaries, credential requirements, and release commands
- added a dedicated [Release_Packaging_Guide.md](../../../Release_Packaging_Guide.md) document covering versioning strategy, packaging flow, preview mode, and permission expectations
- documented the Node runtime requirement explicitly because the current workstation default is still Node `20`, below the project's Node `22` engine floor
- verified the zip artifact contents and confirmed the release package includes the manifest, side-panel entry, service worker loader, bundled assets, and icon set

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
  - `npx -y node@22 ./scripts/package-release.mjs`
- artifact checks:
  - `unzip -l release/ai-usage-dashboard-0.1.0-rc.1.zip`
  - `curl -I http://127.0.0.1:4173/src/sidepanel/index.html`
  - `curl -I http://127.0.0.1:4173/icons/icon32.png`
- smoke checks:
  - `npx -y node@22 ./scripts/phase19-smoke.mjs`
- external docs reviewed:
  - `https://developer.chrome.com/docs/extensions/mv3/manifest/version`

Preview:

- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`
- local URL: `http://127.0.0.1:4173/src/sidepanel/index.html`
- command: `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist`

Artifact:

- `release/ai-usage-dashboard-0.1.0-rc.1.zip`

Residual manual item:

- another operator should follow the new README from a fresh shell after `nvm use` to validate the docs without relying on prior workspace context

Follow-up:

- move to `Phase 27` for real-device Chrome verification
