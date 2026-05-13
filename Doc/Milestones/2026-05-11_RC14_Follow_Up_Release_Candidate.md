# Milestone - RC14 Follow-Up Release Candidate

Date: 2026-05-11

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- dated milestone snapshot

Status note:

- records the packaged follow-up candidate prepared after the submitted RC13 review boundary
- this is not a claim that RC14 has already been submitted to Chrome Web Store

## Milestone Summary

`0.1.0-rc.14` is the current packaged follow-up candidate.

The follow-up package is:

- `release/ai-usage-dashboard-0.1.0-rc.14.zip`
- SHA256: `5b3e31469f7b2fd94511aa8a3b702d3f656f2014b7334e6a7931ff1f7289185e`

The follow-up source boundary is:

- package version: `0.1.0-rc.14`
- Chrome manifest version: `0.1.0.14`
- Chrome manifest display version: `0.1.0-rc.14`
- current latest archived phase: [306_Phase_Popup_Onboarding_Handoff_And_RC14_Follow_Up_Packaging.md](../TODOs/Archive/by-phase/300-399/306_Phase_Popup_Onboarding_Handoff_And_RC14_Follow_Up_Packaging.md)

The still-submitted store-review boundary remains:

- [2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md](./2026-05-11_RC13_Chrome_Web_Store_Upload_Candidate.md)

## Included Changes Since RC13

- Phase 303: Claude Team multi-window settings capture now preserves duplicate ordered snippets plus known visible usage-row labels before parser pairing.
- Phase 304: Settings IA now focuses the personal-user path with persisted user levels, Quick Setup, and one gated Advanced container.
- Phase 305: full-page bootstrap now renders cached state first, sync writeback no longer overwrites fresher settings during bootstrap drift, Settings select layering is fixed, and common `Appearance & Sync` controls stay visible with a `More` disclosure.
- Phase 306: side-panel bootstrap now also renders cached state first, popup setup/problem actions now deep-link to focused Settings targets, popup can hide providers quickly, zero-provider recovery points at setup, app language stays visible, English display-level labels are corrected, and the source/docs boundary is packaged as RC14.

## Promotion Rule

Use RC14 only if:

- Chrome Web Store review feedback requires a newer package
- a deliberate human resubmission decision replaces the pending RC13 boundary
- a listing/copy/support-boundary change needs a fresh code-aligned package

Do not treat this file as proof that RC14 has already replaced RC13 in review.

## Verification Snapshot

Automated verification run for this follow-up candidate:

- `npm run test -- --run src/popup/settings-route-targets.test.ts src/popup/view-models.test.ts src/sidepanel/route-state.test.ts src/sidepanel/settings-page-view-models.test.ts src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/use-standard-app-runtime.test.tsx src/sidepanel/components/SettingsPreferencesSection.test.tsx src/shared/settings-localized-copy.test.ts`
- `npm run release:check`
- `npm run release:package`
- `npm run docs:check`
- `git diff --check`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.14.zip`

Manual runtime note:

- no new human RDP Chrome smoke session is recorded for RC14 in this milestone
- the latest archived human visual smoke remains the 2026-05-04 `rc.11` note until a later real-Chrome pass is intentionally recorded
