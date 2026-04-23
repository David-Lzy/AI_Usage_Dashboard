# Phase 25 - Release Assets And Branding

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- prepare the extension branding assets needed for a release candidate

Depends on:

- phase 24

File scope:

- extension icons and related assets
- `src/manifest.json`
- release-oriented docs if needed

Tasks:

- create or select the final extension icon set
- wire the icon assets into the manifest
- verify that the title, description, and visible product naming are release-ready
- remove any remaining placeholder asset or branding language

Done when:

- the extension has a coherent icon set and release-ready branding strings
- the manifest references the final asset paths
- no obvious placeholder brand elements remain

Out of scope:

- web store listing copy beyond what the extension itself needs

Completion date: 2026-04-21

Completion summary:

- created a release icon family from a single SVG brand master and exported the shipped `16/32/48/128` PNG assets
- wired the new icon assets into the extension manifest for both the package icon set and the action icon
- tightened the release-facing manifest description so it now describes usage, credits, and sync health instead of the earlier generic quota wording
- added a favicon and theme color to the side panel entry so browser preview and extension pages show the same shipped brand asset
- polished the dashboard hero copy and subtitle to read like a release candidate instead of an internal prototype
- updated the manual QA checklist so it checks the new subtitle, favicon resolution, and the current Codex analytics behavior
- switched the active local preview flow for this phase to a static HTTP server over `dist/`, because CRXJS serve/preview modes clear `dist/` and interfere with unpacked-extension validation

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- asset checks:
  - `identify public/icons/icon16.png public/icons/icon32.png public/icons/icon48.png public/icons/icon128.png`
  - `curl -I http://127.0.0.1:4173/src/sidepanel/index.html`
  - `curl -I http://127.0.0.1:4173/icons/icon32.png`
- smoke checks:
  - `npx -y node@22 ./scripts/phase19-smoke.mjs`

Preview:

- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`
- local URL: `http://127.0.0.1:4173/src/sidepanel/index.html`
- command: `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist`

Residual manual item:

- a human visual pass is still useful to judge small-size icon clarity in the Chrome toolbar and extensions page

Follow-up:

- move to `Phase 26` for versioning, packaging, and install docs
