# Phase 328 - Popup Provider Progress Component

## Goal

Move popup provider progress rendering out of `PopupApp.tsx` into a focused component with render-level coverage.

## Scope

- Extract the popup provider progress JSX into a dedicated component.
- Preserve the existing usage-window-first rendering behavior.
- Preserve single-value progress rendering and hidden empty-percent behavior.
- Add focused server-render tests for usage-window, single-value, and hidden branches.

## Preserved Boundaries

- Do not change popup card layout, CSS class names, progress semantics, or provider ordering.
- Do not change `UsageProgress`, `UsageWindowProgressList`, or progress visibility rules.
- Do not change view-model construction.

## Acceptance

- `PopupApp.tsx` uses the new component instead of carrying provider progress JSX inline.
- Usage-window providers still render `UsageWindowProgressList`.
- Single-value providers still render `UsageProgress`.
- Empty percent-only providers still render nothing.

## Planned Verification

- `npm run test -- --run src/popup/PopupProviderProgress.test.tsx src/popup/progress-visibility.test.ts src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/UsageWindowProgressList.test.tsx`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Completed on 2026-05-13.

Summary:

- Added `src/popup/PopupProviderProgress.tsx` to own popup provider progress rendering.
- Updated `PopupApp.tsx` to use the component while preserving the existing `shouldShowPopupProviderProgress` card layout decision.
- Added server-render coverage for structured usage-window progress, single-value progress, and empty percent-only hidden output.

Verification:

- `npm run test -- --run src/popup/PopupProviderProgress.test.tsx src/popup/progress-visibility.test.ts src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/UsageWindowProgressList.test.tsx`
- `npm run typecheck`
