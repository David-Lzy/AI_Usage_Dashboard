# Phase 238 - Usage Progress CSS Module Split

Date: 2026-05-03

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- dated snapshot

Status note:

- completed and archived on 2026-05-03
- this is the second narrow maintenance slice after Phase 236; it splits CSS ownership only and does not change runtime behavior

## Goal

Continue reducing the oversized `material-theme.css` file by moving shared usage progress styles into a focused theme module used by both sidepanel and popup surfaces.

## Scope

- add `src/sidepanel/theme/usage-progress.css`
- move shared `usage-progress` and `usage-window-progress-list` CSS plus the indeterminate progress keyframes out of `material-theme.css`
- import `usage-progress.css` from the side-panel entry after `material-theme.css` and before `provider-card.css`
- import `usage-progress.css` from the popup entry after the shared Material theme
- keep popup-specific progress-density overrides in `material-theme.css`
- keep provider-card-specific progress-surface overrides in `provider-card.css`

## Preserved Boundaries

- do not change `UsageProgress`, `UsageWindowProgressList`, `ProviderCard`, or popup TypeScript behavior
- do not change provider data, sync behavior, source-selection order, or truth labels
- do not redesign the Phase 236 provider-card visuals or Phase 209 popup ring visuals
- do not split Settings, App, popup, or localization files in this slice

## Completed Work

- Extracted shared progress CSS into `src/sidepanel/theme/usage-progress.css`.
- Loaded the new module in both sidepanel and popup entries.
- Preserved cascade order so shared progress rules load after base Material theme rules and before provider-card-specific overrides.
- Added `npm run phase238:review` to verify import ordering, moved CSS markers, and closeout documentation.

## Verification

- `npm run phase238:review`
- `npm run phase236:review`
- `npm run docs:check`
- `npm run typecheck`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Continue the oversized-file maintenance queue with additional narrow phases:

- split more theme areas out of `material-theme.css`
- split `SettingsPage.tsx`
- split `App.tsx`
- split `src/shared/localized-copy.ts`
