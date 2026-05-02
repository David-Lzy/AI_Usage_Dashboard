# Phase 233 - Codex Hydration Retry

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-05-03

## Goal

Handle the Codex first-refresh hydration race where the route is matched before usage-window DOM content is available.

## Completed Work

- Added a Codex personal live-client retry loop for parser `route_drift` results when a matched Codex route exists.
- Kept retries bounded by explicit attempt and delay constants.
- Kept fixture, login-missing, page-not-found, and capture-unavailable behavior unchanged.
- Added focused coverage proving a loading shell capture can be followed by a successful hydrated usage-window capture in the same refresh operation.
- Added a Phase 233 review script.

## Preserved Boundaries

- The parser still returns `route_drift` if the route remains unparseable after the bounded retry window.
- The extension still does not persist raw ChatGPT cookies or auth headers.
- The retry waits for the already matched page to hydrate; it does not add a hidden offscreen scraping path.

## Verification

- `npm run phase233:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Run a real RDP Chrome popup refresh against Codex after extension reload to confirm the first click no longer exposes the transient parser failure state.
