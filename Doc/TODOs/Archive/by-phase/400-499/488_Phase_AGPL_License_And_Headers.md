# Phase 488 - AGPL License And Headers

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed

## Goal

Establish the legal open-source foundation for public GitHub release. Add the AGPL-3.0 license file, update project metadata fields, and add SPDX copyright headers to entry-point source files.

## Scope

- `LICENSE` — AGPL-3.0 full text at repo root
- `package.json` — add `author`, `license`, `repository`, `homepage` fields; remove `private: true` to allow GitHub indexing
- `src/manifest.json` — add `homepage_url`
- `README.md` — add license badge and "License" section near the top, above the RC Matrix
- SPDX copyright headers on entry-point source files:
  - `src/background/service-worker.ts`
  - `src/sidepanel/main.tsx`
  - `src/popup/main.tsx`
  - `src/shared/constants.ts`

## Preserved Boundaries

- Do not touch provider logic, settings UI, or any runtime behavior
- Do not change the build pipeline (Phase 489)
- README additions must not overwrite or reorder existing release-state content
- `package.json` script block and dependency versions must remain unchanged

## Acceptance

- `LICENSE` file exists at repo root with AGPL-3.0 text
- `package.json` contains `author`, `license`, `repository`, `homepage`
- `src/manifest.json` contains `homepage_url`
- README shows license badge and "License" section
- Four entry-point source files open with SPDX header comments
- `npm run typecheck` passes
- `npm run docs:check` passes

## Planned Verification

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-16.

Summary:

- Added AGPL-3.0 `LICENSE` file at repo root
- Updated `package.json` with `author`, `license`, `repository`, `homepage`
- Updated `src/manifest.json` with `homepage_url`
- Added license badge and License section to `README.md`
- Added SPDX headers to `src/background/service-worker.ts`, `src/sidepanel/main.tsx`, `src/popup/main.tsx`, `src/shared/constants.ts`

## Verification

- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Continue with Phase 489 for build-time fingerprint injection and About UI
