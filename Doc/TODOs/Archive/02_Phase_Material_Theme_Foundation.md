# Phase 02 - Material Theme Foundation

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- establish the Material Design 3 theme contract for the side panel

Depends on:

- phase 01

File scope:

- `src/sidepanel/theme/material-theme.css`
- `src/sidepanel/theme/tokens.css`
- `src/sidepanel/main.tsx`
- `src/sidepanel/App.tsx`

Tasks:

- define base Material-style color tokens
- define typography scale tokens
- define shape tokens for cards, buttons, and dialogs
- set a light theme as the default
- wire theme CSS into the side panel entry

Done when:

- the side panel uses one consistent Material-style token set
- colors, typography, and radii are no longer hardcoded ad hoc
- the app shell can consume the tokens

Out of scope:

- provider cards
- dark mode
- live data

Completion date: 2026-04-20

Completion summary:

- added a dedicated side panel theme layer with `tokens.css` and `material-theme.css`
- replaced hardcoded baseline styling with Material Design 3 style color, type, shape, spacing, and elevation tokens
- updated the side panel shell to consume the new theme contract through Material-style layout and card classes
- removed the temporary `styles.css` file from Phase 01

Verification:

- unit tests: none added in this phase because the work was theme and layout foundation only
- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- manual checks:
  - verified the side panel source now uses only `theme/tokens.css` and `theme/material-theme.css`
  - verified the production build emits updated CSS assets without manifest regressions

Follow-up:

- move into `Phase 03` for the side panel app shell built on top of the new theme foundation
