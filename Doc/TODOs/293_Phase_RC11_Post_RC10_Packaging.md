# Phase 293 - RC11 Post-RC10 Packaging

Date: 2026-05-04

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- active TODO

Freshness model:

- maintained current reference

Status:

- active

## Goal

Cut `0.1.0-rc.11` so the next install/review package includes the source work
landed after `0.1.0-rc.10`.

## Scope

- Bump package version from `0.1.0-rc.10` to `0.1.0-rc.11`.
- Bump Chrome manifest version from `0.1.0.10` to `0.1.0.11`.
- Rebuild `dist`.
- Generate `release/ai-usage-dashboard-0.1.0-rc.11.zip`.
- Update release-facing docs and package SHA.
- Archive this phase and update the phase index after verification.

The package should include the current post-rc10 source state:

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

## Acceptance

- `package.json`, `package-lock.json`, `src/manifest.json`, and built
  `dist/manifest.json` agree on `0.1.0-rc.11` / `0.1.0.11`.
- The release zip exists at `release/ai-usage-dashboard-0.1.0-rc.11.zip`.
- The release guide, README, top-level TODOs, roadmap index, phase index, and
  active phase closeout all describe `rc.11` as the current package.
- The older `rc.10` artifact remains historical evidence rather than being
  rewritten.

## Planned Verification

- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.11.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.11.zip`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

After packaging, reload the unpacked `dist/` extension in RDP Chrome and use the
new `rc.11` zip for the next install/review pass. Store asset closeout remains
the next non-provider release task after `rc.11` is cut.
