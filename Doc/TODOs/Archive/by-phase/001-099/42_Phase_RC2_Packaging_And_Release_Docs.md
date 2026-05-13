# Phase 42 - RC2 Packaging And Release Docs

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- cut the next release candidate after the personal-user and mixed-source verification work is complete

Depends on:

- phase 41

File scope:

- `package.json`
- `src/manifest.json`
- `README.md`
- `Doc/Release_Packaging_Guide.md`
- `release/`

Tasks:

- bump package and manifest versions for the next RC
- update README and release docs for personal session-page setup and mixed-source behavior
- regenerate the release zip and confirm the packaged output matches the verified build
- document clearly which provider modes are:
  - shipped
  - deferred
  - policy only
- rerun the release checklist against the final RC artifact

Done when:

- the repo has a new RC version, aligned packaging docs, and a generated release artifact
- release documentation matches the mixed-source product that actually passed verification

Out of scope:

- new feature work
- store-listing assets or marketplace submission

Completion date: 2026-04-23

Completion summary:

- bumped the project to `0.1.0-rc.2` in `package.json` and `0.1.0.2` / `0.1.0-rc.2` in `src/manifest.json`
- kept the narrowed RC support contract aligned with the selected `Branch B` decision, so JetBrains remains in the repo but outside the active RC promise
- reran the release-closeout verification stack against the updated RC build
- generated the packaged artifact at `release/ai-usage-dashboard-0.1.0-rc.2.zip`

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
  - `npx -y node@22 ./scripts/phase27-real-profile-check.mjs`
  - `npx -y node@22 ./scripts/package-release.mjs`
- artifact checks:
  - `unzip -l release/ai-usage-dashboard-0.1.0-rc.2.zip`
  - `sha256sum release/ai-usage-dashboard-0.1.0-rc.2.zip`
- artifact SHA256:
  - `3f0f4602a5b20dc0a538ae018d83cfff53b58e2dc572fe9c1c3c85cd66252339`

Known note:

- the scripted `Phase 27` run still cannot complete the native host-permission prompt in headless Chromium
- that limitation remained documented rather than release-blocking because the narrowed RC already has newer operator GUI evidence from `Phase 41.2`

Follow-up:

- `Direction 02` started next through `Phase 43`
