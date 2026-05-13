# Phase 302 - Node22 Default And RC13 Source Alignment

## Goal

Eliminate the remaining project/tooling drift by making Node 22 the effective default for repo commands, restoring tracked workflow docs as canonical, and packaging a new release candidate so current source and upload candidate match again.

## Scope

- Make project scripts auto-fall back to Node 22 when the current shell is older.
- Ignore local-only `.agent/` workspace content in git.
- Restore tracked workflow/runbook docs under `Doc/` and root entry files as the canonical repo source.
- Update generators, checks, and review scripts to stop depending on `.agent/`.
- Package `0.1.0-rc.13` and align current README, TODO, roadmap, milestone, and store-description docs to that candidate.
- Make release packaging reject stale built manifests so a version bump cannot silently zip an old `dist/`.

## Preserved Boundaries

- Do not change provider truth beyond the already-implemented Phase 300 and Phase 301 Claude work.
- Do not claim new screenshot evidence or a new human visual smoke session.
- Do not change store screenshot assets, icon files, or provider account-gated closures.

## Acceptance

- `npm run ...` commands work on this machine without manually switching the shell to Node 22 first.
- The repo no longer requires `.agent/` to understand canonical workflow/runbook guidance.
- Source, manifest, release zip, README, and milestone docs all point at the same current RC.
- Packaging fails if `dist/manifest.json` is stale relative to source versions.

## Planned Verification

- `npm run release:check`
- `npm run release:package`
- `npm run docs:check`
- `git diff --check`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.13.zip`

## Completion

Status: completed on 2026-05-11.

Summary:

- Updated the project launcher so repo commands auto-fall back to Node 22 and no longer depend on a preinstalled `~/.local/node-current` shim.
- Marked `.agent/` as local-only via `.gitignore` and moved canonical startup/workflow/runbook references back to tracked root and `Doc/` files.
- Updated review scripts, generated-doc helpers, and taxonomy checks to stop depending on `.agent/`.
- Strengthened `scripts/package-release.mjs` so it now rejects stale `dist/manifest.json` versions before zipping.
- Bumped the package to `0.1.0-rc.13`, bumped the manifest to `0.1.0.13`, rebuilt, repackaged, and aligned current README/TODO/roadmap/milestone/store-description docs to that candidate.

Verification:

- `npm run release:check`
- `npm run release:package`
- `npm run docs:check`
- `git diff --check`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.13.zip`
