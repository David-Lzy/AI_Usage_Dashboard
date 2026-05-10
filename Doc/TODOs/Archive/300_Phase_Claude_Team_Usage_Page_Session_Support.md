# Phase 300 - Claude Team Usage Page Session Support

## Goal

Graduate the Claude `https://claude.ai/settings/usage` route from deferred research into a shipped session-page source now that a real Claude Team account is available in the operator Chrome profile.

## Scope

- Add a Claude session-page capture path that reuses the existing Chrome tab/session extraction framework.
- Parse visible Claude usage-page signals into the normalized provider snapshot model.
- Keep the existing Claude Code Analytics Admin API path available for organizations with Admin API keys.
- Update provider source blueprints, optional host permissions, settings copy, provider notes, and roadmap/TODO state.
- Add focused parser/client/adapter tests for the new source-selection behavior.

## Preserved Boundaries

- Do not read, print, persist, or import Claude cookies, bearer tokens, or local browser secrets.
- Do not call undocumented Claude private APIs from the extension.
- Do not claim an exact remaining included quota unless the visible Claude page exposes one.
- Do not remove the existing Admin API implementation.
- Do not modify unrelated Chrome Web Store listing documents or pending untracked assets.

## Acceptance

- `Auto` source preference falls back from missing Admin API credentials to the Claude session-page source when host access is granted.
- `Session page` source preference can sync from an open or auto-opened `claude.ai/settings/usage` tab.
- Logged-out, upgrade-only, unmatched, and capture-unavailable states remain explicit diagnostic states.
- Dashboard, provider detail, popup, tooltip, and action badge use the same normalized snapshot fields as other providers.
- Existing Codex, Cursor, Gemini, and JetBrains behavior is unchanged.

## Planned Verification

- Focused Claude provider unit tests.
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-11.

Summary:

- Added Claude Team session-page capture, parsing, and client modules for `https://claude.ai/settings/usage`.
- Updated Claude source selection so `auto` can fall back from a missing Admin API key to the session-page source.
- Preserved host-access, logged-out, upgrade-only, capture-unavailable, and parser drift states as explicit diagnostics.
- Added `https://claude.ai/*` to optional host permissions and Claude provider host access settings.
- Updated README, roadmap/TODO, provider note, release guide, and autonomous prompt boundaries to distinguish submitted `rc.12` from current post-rc12 source.

Verification:

- `npm run test -- --run src/shared/provider-sources.test.ts src/providers/claude-code/adapter.test.ts src/providers/claude-code/personal-page-parser.test.ts src/providers/claude-code/personal-page-capture.test.ts src/providers/claude-code/personal-page-client.test.ts`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

Follow-up:

- Reload the unpacked extension in RDP Chrome, grant the expanded Claude host access when prompted, and refresh Claude from the side panel to verify the live Team page against the parser.
- Package a later RC only after the live Claude Team pass is accepted; the submitted `rc.12` artifact does not include this post-submission provider expansion.
