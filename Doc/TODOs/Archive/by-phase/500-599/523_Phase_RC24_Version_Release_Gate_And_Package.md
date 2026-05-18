# Phase 523 - RC24 Version Release Gate And Package

Date: 2026-05-18

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- completed phase note

Freshness model:

- historical evidence; current summary is maintained in [00_Phase_Index.md](../../../00_Phase_Index.md)

## Goal

Cut the `0.1.0-rc.24` release candidate package.

## Scope

- Bump package metadata to `0.1.0-rc.24`.
- Bump manifest version to `0.1.0.24`.
- Run the full release gate and package zip.

## Preserved Boundaries

- No new manifest permissions.
- No provider support expansion.
- No Chrome Web Store upload from the repo workflow.

## Result

- `release/ai-usage-dashboard-0.1.0-rc.24.zip` is the prepared upload artifact.
- SHA256: `ea5d865c119b69bab46e93f9e29ea04c58ebd7a4b6893a036262b1ebf91a0a85`

## Verification

- `npm run release:check`
- `npm run release:package`
- zip manifest inspection
- `git diff --check`

## Follow-Up

- Upload manually through Chrome Web Store Developer Dashboard.
