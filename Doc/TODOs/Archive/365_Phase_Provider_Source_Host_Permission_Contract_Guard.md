# Phase 365 - Provider Source Host Permission Contract Guard

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Add a local guard that keeps provider source route hints, Settings host-origin copy, and the Chrome manifest optional host permissions aligned.

## Scope

- Add focused test coverage for provider source host-permission drift.
- Verify every Settings `hostOrigins` entry remains requestable by `manifest.optional_host_permissions`.
- Verify shipped or otherwise requestable provider route hints are covered by both Settings host origins and manifest optional host permissions.
- Preserve the current Gemini project-metrics boundary by keeping its deferred route outside host permission requests.

## Preserved Boundaries

- No runtime behavior changes.
- No provider support-claim changes.
- No manifest permission expansion.
- No release package or store-submission milestone changes.
- Do not graduate Gemini project metrics, JetBrains org-console, or Claude individual Pro / Max behavior.

## Acceptance

- A focused Vitest guard fails if a requestable provider route hint is added without matching Settings and manifest host permission coverage.
- The guard fails if Settings advertises a host origin that the manifest cannot request.
- The guard explicitly proves Gemini's deferred project-metrics route remains outside current host permissions.
- Maintained docs record that `Phase 365` is a post-`rc.15` source-only guard.

## Planned Verification

- `npm run test -- src/shared/provider-source-host-permissions.test.ts`
- `npm run test`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`

## Completion Summary

- Added [provider-source-host-permissions.test.ts](../../../src/shared/provider-source-host-permissions.test.ts) with focused coverage for Settings host origins, provider route hints, and manifest optional host permissions.
- Locked the deferred Gemini project-metrics path to no host-access request in the current product contract.
- Updated README, TODO, roadmap, and phase-index docs so the project now records `Phase 365` as the latest completed source-only guard while keeping `rc.15` as the current packaged follow-up candidate.

## Verification

- `npm run test -- src/shared/provider-source-host-permissions.test.ts`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`

## Follow-Up

- None. If a future provider route becomes requestable, update the source blueprint, Settings host origins, and manifest host permissions together.
