# Phase 305 - Full Page Cached Bootstrap And Settings Preferences Polish

## Goal

Reduce first-open full-page latency and simplify the most common Settings controls without changing the current `rc.13` upload-candidate boundary.

## Scope

- Make the full-page shell render cached state first, then trigger the existing bootstrap refresh in the background.
- Guard sync-engine writeback so a background bootstrap refresh cannot overwrite fresher provider settings changed by the user during that refresh window.
- Fix Settings select/combo-box layering so the top `display level` control can overlay the next section correctly.
- Keep the most common `Appearance & Sync` controls always visible and move the rest behind one `More` disclosure that is independent of Settings user level.
- Lower the minimum sync interval to `3` minutes and add bounded periodic-alarm startup jitter so extension surfaces are less likely to refresh on the same schedule edge.

## Preserved Boundaries

- Do not cut a new release candidate or mutate the current Chrome Web Store upload-candidate package.
- Do not change provider truth labels, provider-support claims, or session-page capture semantics.
- Do not remove advanced/developer appearance controls; only change how they are disclosed.
- Do not change popup or side-panel bootstrap semantics beyond the targeted full-page cached-first path.

## Acceptance

- Opening the full-page dashboard/settings/detail route no longer waits for bootstrap provider refresh before cached shared state is visible.
- Background bootstrap refresh no longer writes stale provider settings over fresher local settings changes.
- The `display level` selector can expand above the following Settings section instead of being clipped or covered by it.
- `Default sync interval`, `Warning threshold`, `Theme mode`, `Accent preset`, and `Action badge` stay visible regardless of Settings user level, while the rest of the appearance controls move behind one `More` disclosure.
- Periodic sync clamps to a `3` minute minimum and starts with bounded jitter instead of the same fixed initial delay on every schedule creation.

## Planned Verification

- `npm run test -- --run src/sidepanel/use-standard-app-runtime.test.tsx src/background/sync-engine.test.ts`
- `npm run test -- --run src/shared/settings-preferences.test.ts src/sidepanel/settings-preference-options.test.ts src/background/alarms.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-11.

Summary:

- Switched the standard full-page shell to a cached-first bootstrap path and moved the heavier `app:init` refresh behind the first rendered state.
- Added a sync writeback drift guard so background refresh work no longer overwrites fresher provider settings changed during bootstrap.
- Fixed the Settings top-section select layering by removing lingering transform-created stacking contexts and lifting the active section while a select/combobox is open.
- Simplified `Appearance & Sync` so the most common user-facing controls stay visible while the longer tail moves behind one `More` disclosure that is no longer gated by display level.
- Reduced the sync-interval floor to `3` minutes and added bounded periodic-alarm startup jitter to spread refresh timing.

Verification:

- `npm run test -- --run src/sidepanel/use-standard-app-runtime.test.tsx src/background/sync-engine.test.ts`
- `npm run test -- --run src/shared/settings-preferences.test.ts src/sidepanel/settings-preference-options.test.ts src/background/alarms.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`
