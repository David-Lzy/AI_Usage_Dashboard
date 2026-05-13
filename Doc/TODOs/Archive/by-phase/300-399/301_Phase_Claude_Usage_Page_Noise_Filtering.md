# Phase 301 - Claude Usage Page Noise Filtering

## Goal

Tighten the Claude Team usage-page parser so dashboard progress rows only represent meaningful visible quota or usage-window signals, not generic page helper copy.

## Scope

- Filter generic Claude settings page labels such as `Your limits`, `Learn more about limits`, and `Starts when a message is sent` from usage windows.
- Keep meaningful named windows such as weekly, monthly, 5-hour, message, quota, and model-specific limit rows when a visible percent is present.
- Reduce noisy Claude usage facts produced from navigation or marketing labels.
- Add focused parser coverage for the live-page noise pattern seen in RDP Chrome.
- Update Claude provider notes and TODO/index state.

## Preserved Boundaries

- Do not change Chrome tab/session capture behavior.
- Do not change Admin API behavior.
- Do not call private Claude APIs or read browser secrets.
- Do not change Codex, Cursor, Gemini, or JetBrains semantics.
- Do not modify pending Chrome Web Store listing docs.

## Acceptance

- The Claude provider card no longer shows blank or helper-copy progress rows.
- The parser still accepts meaningful Claude usage windows with visible percentages and reset context.
- A real page with only generic Team settings helper copy can still produce a partial session-page snapshot without pretending those helper strings are quota windows.
- Existing Claude, source-selection, and shared provider tests remain green.

## Planned Verification

- `npm run test -- --run src/providers/claude-code/personal-page-parser.test.ts src/providers/claude-code/adapter.test.ts`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
- `npm run docs:check`
- `git diff --check`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-11.

Summary:

- Filtered generic Claude settings helper and navigation labels out of usage-window parsing.
- Preserved the meaningful live rows visible on the Claude Team page: `Current session`, `All models`, `Claude Design`, and `Daily included routine runs`.
- Preserved ordered duplicate snippets for Claude usage-window parsing so repeated `0% used` values can still pair with their own labels.
- Converted visible count rows such as `0 / 25` into percent progress while keeping the raw count as row detail.
- Reduced noisy Claude usage facts from generic labels.
- Fixed relative Claude reset wording so `in 21 hr` does not render as `resets at in 21 hr`.

Verification:

- `npm run test -- --run src/providers/claude-code/personal-page-parser.test.ts src/providers/claude-code/adapter.test.ts`
- `npm run typecheck`
- `npm run test -- --run`
- `npm run build`
