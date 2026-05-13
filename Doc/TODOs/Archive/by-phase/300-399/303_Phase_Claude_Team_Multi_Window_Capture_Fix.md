# Phase 303 - Claude Team Multi Window Capture Fix

## Goal

Restore the Claude Team usage-page card path so the extension keeps all visible usage rows instead of collapsing the page into one summarized progress bar.

## Scope

- Preserve ordered duplicate Claude usage snippets during capture instead of globally deduping them away.
- Keep the known Claude Team row labels (`Current session`, `All models`, `Claude Design`, and `Daily included routine runs`) in the capture allowlist so the parser keeps enough structure to pair visible percentages with the right rows.
- Add focused capture and provider-card regressions for the multi-window rendering path.

## Preserved Boundaries

- Do not change Claude Admin API behavior.
- Do not change the broader Claude parser contract beyond the visible multi-row capture problem.
- Do not package a new RC or change store-upload docs.

## Acceptance

- A Claude Team settings usage page with multiple visible rows no longer collapses into one provider-card progress bar.
- Duplicate percent snippets remain pairable with their row labels during capture.
- Existing Claude capture/parser/adapter and provider-card tests remain green.

## Planned Verification

- `npm run test -- --run src/providers/claude-code/personal-page-capture.test.ts src/providers/claude-code/personal-page-parser.test.ts src/providers/claude-code/personal-page-client.test.ts src/providers/claude-code/adapter.test.ts src/sidepanel/components/ProviderCard.test.tsx`
- `npm run typecheck`
- `npm run build`
- `git diff --check`

## Completion

Status: completed on 2026-05-11.

Summary:

- Removed global Claude capture snippet deduplication so repeated visible usage labels and percent values survive long enough for row pairing.
- Added a Claude usage-row capture allowlist so the Team settings page preserves the four shipped visible usage rows.
- Added focused regressions for both capture-layer row preservation and provider-card multi-progress rendering.

Verification:

- `npm run test -- --run src/providers/claude-code/personal-page-capture.test.ts src/providers/claude-code/personal-page-parser.test.ts src/providers/claude-code/personal-page-client.test.ts src/providers/claude-code/adapter.test.ts src/sidepanel/components/ProviderCard.test.tsx`
- `npm run typecheck`
- `npm run build`
