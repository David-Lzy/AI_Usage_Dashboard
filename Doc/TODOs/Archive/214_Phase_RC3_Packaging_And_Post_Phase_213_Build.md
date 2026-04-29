# Phase 214 - RC3 Packaging And Post-Phase 213 Build

Date: 2026-04-29

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-29

## Goal

Package a new release candidate after Phase 213 so the installable zip no longer lags behind the current source and `dist` state.

## Completed Work

- Bumped package version to `0.1.0-rc.3`.
- Bumped Chrome manifest version to `0.1.0.3` and `version_name` to `0.1.0-rc.3`.
- Rebuilt the extension output.
- Generated `release/ai-usage-dashboard-0.1.0-rc.3.zip`.
- Verified the zip contents and recorded its SHA256.
- Updated release-facing docs and the phase index.

## Artifact

- `release/ai-usage-dashboard-0.1.0-rc.3.zip`
- SHA256: `4811289e4f47deddce0efbe39ab5e249104d623eff437584df3837e4e2f99882`

## Preserved Boundaries

- No provider parser, adapter, source-selection, sync, credential, permission, UI behavior, or provider coverage claim changed in this phase.
- The `0.1.0-rc.2` zip remains historical evidence from Phase 42.
- The remaining store-submission screenshot request still requires manual native-toolbar popup captures before store asset closeout.

## Verification

- `npm run release:check`
- `npm run release:package`
- `unzip -l release/ai-usage-dashboard-0.1.0-rc.3.zip`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.3.zip`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

Install or reload `0.1.0-rc.3` for the next RDP Chrome review pass, then continue either authenticated Codex/Cursor operator verification or the Direction 10.3 store screenshot line.
