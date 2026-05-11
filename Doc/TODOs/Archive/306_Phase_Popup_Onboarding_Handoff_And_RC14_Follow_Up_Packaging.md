# Phase 306 - Popup Onboarding Handoff And RC14 Follow-Up Packaging

## Goal

Finish the pending popup/settings/onboarding polish slice, align the tracked docs to that source state, and package it as `0.1.0-rc.14` without rewriting the existing RC13 review milestone.

## Scope

- Extend cached-first bootstrap from full-page routes to the side panel so opening the side panel no longer waits on the same blocking bootstrap refresh.
- Route popup setup, blocker, and policy-only actions into focused Settings targets instead of dropping users into generic Settings or dashboard entry points.
- Add popup quick-dismiss affordances for providers the user wants to stop seeing, plus a direct setup action for the zero-provider state.
- Add one subtle Quick Setup attention cue when all providers are hidden and the recovery path lives under `More providers`.
- Keep app language always visible in `Appearance & Sync` and fix English display-level option labels.
- Bump the package and manifest to `0.1.0-rc.14`, package the new release artifact, and align current README/TODO/roadmap/release docs to the new local follow-up candidate.

## Preserved Boundaries

- Do not change provider support claims or broaden provider truth boundaries.
- Do not mutate or rewrite the existing RC13 Chrome Web Store submission milestone.
- Do not add new hidden debug routes or new popup surfaces beyond the focused onboarding polish.
- Do not claim that RC14 has already been submitted to Chrome Web Store.

## Acceptance

- Opening the side panel renders cached state first instead of waiting on blocking bootstrap refresh work.
- Popup blocker/setup/policy actions land on the relevant Settings target rather than a generic dashboard/settings entry.
- Users can quickly hide a provider from popup attention without deleting provider support from the codebase.
- The zero-provider recovery path points directly at setup, and `More providers` gains a restrained attention cue only when it is the next recovery step.
- App language stays visible alongside the other common appearance/sync controls, and English no longer shows Chinese display-level labels.
- Source, docs, manifest, package metadata, and release artifact all align at `0.1.0-rc.14`.

## Planned Verification

- `npm run test -- --run src/popup/settings-route-targets.test.ts src/popup/view-models.test.ts src/sidepanel/route-state.test.ts src/sidepanel/settings-page-view-models.test.ts src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/use-standard-app-runtime.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx src/shared/settings-localized-copy.test.ts`
- `npm run release:check`
- `npm run release:package`
- `npm run docs:check`
- `git diff --check`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.14.zip`

## Completion

Status: completed on 2026-05-11.

Summary:

- Extended cached-first bootstrap to the side panel so both full-page and side-panel entry now render cached state before the heavier background refresh.
- Turned popup setup/problem/policy actions into focused Settings deep links, added popup quick-hide/setup affordances, and added a subtle zero-provider recovery cue for `More providers`.
- Kept app language always visible, fixed English display-level labels, and aligned the popup/settings onboarding copy with the new targeted recovery flow.
- Bumped the package to `0.1.0-rc.14`, bumped the manifest to `0.1.0.14`, packaged the new release artifact, and aligned the tracked docs while preserving the RC13 review milestone as historical submission truth.
- Release package SHA256: `5b3e31469f7b2fd94511aa8a3b702d3f656f2014b7334e6a7931ff1f7289185e`

Verification:

- `npm run test -- --run src/popup/settings-route-targets.test.ts src/popup/view-models.test.ts src/sidepanel/route-state.test.ts src/sidepanel/settings-page-view-models.test.ts src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/use-standard-app-runtime.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx src/shared/settings-localized-copy.test.ts`
- `npm run release:check`
- `npm run release:package`
- `npm run docs:check`
- `git diff --check`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.14.zip`
