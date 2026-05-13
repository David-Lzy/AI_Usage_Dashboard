# Phase 285 - Post RC4 Smoke Polish And Host Access Refresh

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status:

- completed and archived on 2026-05-03

## Goal

Close the small post-rc4 smoke polish issues found by visual review before continuing the store screenshot line.

## Completed Work

- Restored visible internal boundaries for circular usage-window cells inside dashboard provider cards.
- Kept provider source chips explicitly horizontal so policy-only/status chips do not collapse into a wasteful vertical column on wide cards.
- Nudged the Settings sticky section chips slightly upward and right inside the top app bar to reduce wasted vertical space.
- Rendered the Settings back-to-top FAB through a document-body portal in browser runtime, so full-page tab surfaces keep it fixed to the viewport instead of the transformed app shell.
- Added direct host-access prompting before a single-provider refresh when the target provider, including Codex, is missing optional host permission.
- Added the same one-missing-provider host-access prompt path to toolbar popup refresh.

## Preserved Boundaries

- No provider parser, quota semantics, source-selection order, sync scheduling, credential storage, cookie policy, or provider support claim changed.
- Refresh-all only opens a host permission prompt when exactly one enabled visible provider is missing host access; it does not chain multiple browser permission prompts.
- The host access prompt remains a Chrome permission prompt; the extension still does not store cookies or auth headers.
- This phase does not create a new release package. The next packaged artifact should be cut separately if these post-rc4 polish changes need distribution.

## Verification

- `npm run test -- src/shared/host-access-request.test.ts src/sidepanel/standard-app-actions.test.ts src/sidepanel/components/SettingsNavigation.test.tsx src/sidepanel/components/ProviderCard.test.tsx --run`
- `npm run phase285:review`
- `npm run docs:check`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `npm run phase160:review`
- `git diff --check`

## Follow-Up

If the smoke pass is acceptable, package a follow-up release candidate before sharing an installable zip, then continue `Direction 10.3` native toolbar popup screenshot capture/import/archive completion.
