# Phase 293 - RC11 Post-RC10 Packaging

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status:

- completed and archived on 2026-05-04

## Goal

Cut `0.1.0-rc.11` so the next install/review package includes the source work
landed after `0.1.0-rc.10`.

## Completed Work

- Bumped `package.json` and `package-lock.json` from `0.1.0-rc.10` to `0.1.0-rc.11`.
- Bumped `src/manifest.json` from `0.1.0.10` / `0.1.0-rc.10` to `0.1.0.11` / `0.1.0-rc.11`.
- Rebuilt `dist` so the unpacked extension matches the package version.
- Generated `release/ai-usage-dashboard-0.1.0-rc.11.zip`.
- Updated release-facing docs, top-level TODOs, roadmap index, phase index, and this archive.
- Added the Phase 293 testing evidence report.

The package includes the post-rc10 source state:

- Cursor usage-page logged-out detection fix.
- Cursor visible billing/spend context rendered as structured usage facts.
- Line-style usage-window reset copy compacted into the title row.
- Action badge hover tooltip formatted into selected-badge and visible-provider
  sections, including Cursor visible usage facts when Cursor is enabled.

## Preserved Boundaries

- Do not change provider data semantics while packaging.
- Do not claim exact Cursor personal remaining included requests.
- Do not claim a plan-wide absolute Codex personal remaining balance.
- Do not change session-page security posture: no raw cookies, auth headers, or
  access tokens in extension storage or docs.
- Do not mix store screenshot capture/import/archive work into this packaging
  slice.

## Artifact

- `release/ai-usage-dashboard-0.1.0-rc.11.zip`
- SHA256: `f7d19b7bb84975b25c0d9291460f6ca418006c0e93edd36fe063ac5870f2907e`

The older `rc.10` artifact remains historical Phase 291 evidence rather than
being rewritten.

## Verification

- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.11.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.11.zip`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

Reload the unpacked `dist/` extension in RDP Chrome and use the new `rc.11` zip
for the next install/review pass. Store asset closeout remains the next
non-provider release task; its native toolbar popup screenshots still require
real Chrome capture/import/archive completion. Provider closure remains gated on
available real accounts for Claude, JetBrains, and Gemini.
