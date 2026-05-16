# Phase 489 - Digital Fingerprint Embedding

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed

## Goal

Embed multi-layer digital fingerprints into the built extension to protect attribution: build-time constants injected into the JS bundle via Vite, a visible About card in Settings UI, and a copyright log in the service worker console.

## Scope

- `vite.config.ts` — add `define` block injecting `__APP_VERSION__`, `__BUILD_TIMESTAMP__`, `__GIT_COMMIT__`, `__SOURCE_ORIGIN__`
- `src/vite-env.d.ts` (new) — global TypeScript declarations for the four injected constants
- `src/shared/build-info.ts` (new) — export `BUILD_INFO` object consuming the injected constants
- `src/background/service-worker.ts` — add copyright `console.info` log near top of `bootstrapBackground`
- `src/sidepanel/routes/SettingsPage.tsx` — add About card section at bottom of `<main>`, before `<SettingsBackToTopButton>`

## Preserved Boundaries

- Do not change provider logic, data fetching, or any existing settings behavior
- About card must not break existing Settings tab layout or scroll behavior
- Build injection must not break `npm run preview:dist`, `npm run test`, or `npm run typecheck`
- Do not add new npm dependencies

## Acceptance

- `npm run build` succeeds with no new errors
- `grep` on `dist/assets/*.js` finds `David-Lzy` or `AI_Usage_Dashboard` strings embedded in bundle
- `npm run typecheck` passes
- Settings page renders About card with version, copyright, AGPL-3.0 link, GitHub link
- Service worker DevTools console shows copyright log on startup

## Planned Verification

- `npm run typecheck`
- `npm run build`
- `grep -r "David-Lzy" dist/assets/*.js | head -3`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-16.

Summary:

- Modified `vite.config.ts` to inject `__APP_VERSION__`, `__BUILD_TIMESTAMP__`, `__GIT_COMMIT__`, `__SOURCE_ORIGIN__` via `define`
- Created `src/vite-env.d.ts` with global declarations for injected constants
- Created `src/shared/build-info.ts` exporting `BUILD_INFO`
- Added copyright `console.info` to `src/background/service-worker.ts`
- Added About card to bottom of `src/sidepanel/routes/SettingsPage.tsx`

## Verification

- `npm run typecheck`
- `npm run build`
- `grep -r "David-Lzy" dist/assets/*.js | head -3`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- On first GitHub push, confirm `LICENSE` renders correctly in the repository root
- If JetBrains or Gemini support ships in a future phase, update the About card source origin link if the repo URL changes
