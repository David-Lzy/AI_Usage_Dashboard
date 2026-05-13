# Phase 366 - First-Run Quick Setup Onboarding Focus

Date: 2026-05-13

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- completed and archived on 2026-05-13

## Goal

Use the current RDP Chrome extension runtime to inspect first-run surfaces, then close one narrow onboarding gap found in the screenshots.

## Scope

- Verify local RDP Chrome can launch the unpacked extension from the current `dist/` build.
- Capture dashboard, Settings, focused Settings, provider-detail, popup-helper, and credential/source surfaces from RDP Chrome.
- Make zero-provider dashboard users one click closer to the guided Quick Setup path.
- Make Quick Setup provider deep links fall back to the Quick Setup section when the provider-specific card is hidden by the current first-run state.

## Preserved Boundaries

- No provider support-claim changes.
- No release package or Chrome Web Store submission milestone changes.
- No manifest version or runtime permission expansion.
- No change to popup native-toolbar capture truth boundaries.
- Keep RC13 as the submitted store-review boundary and RC15 as the current packaged follow-up candidate.

## Acceptance

- RDP Chrome extension-window capture works against the current unpacked extension id and rebuilt `dist/`.
- The dashboard empty-provider state renders a direct `Open Quick Setup` action.
- `#settings/quick-setup/<provider>` routes still target the provider card when it is visible.
- `#settings/quick-setup/<provider>` routes fall back to the Quick Setup section when that provider card is not rendered.
- RDP Chrome screenshots confirm the focused Quick Setup route lands on the onboarding section instead of the top of Settings.

## Planned Verification

- `npm run test -- src/sidepanel/routes/DashboardPage.test.tsx src/sidepanel/routes/SettingsPage.test.tsx`
- `npm run test`
- `npm run typecheck`
- `npm run build`
- `npm run store:capture-rdp-extension-window -- --route dashboard --output tmp/phase366-rdp-ui-review/07-dashboard-after.png`
- `npm run store:capture-rdp-extension-window -- --route settings-quick-setup-cursor --output tmp/phase366-rdp-ui-review/08-settings-quick-setup-after.png`
- `npm run docs:check`
- `git diff --check`
- `npm run docs:check`
- `git diff --check`

## Completion Summary

- Confirmed local RDP Chrome is available on display `:10`, Chrome reports `147.0.7727.101`, and the loaded unpacked extension id is `gkjioiklbdjcknhdglaehbeofkjmmdpc`.
- Rebuilt `dist/` from current source; the runtime package version remains `0.1.0-rc.15` because this is a post-RC15 source/UI slice, not a package cut.
- Captured the current RDP Chrome extension surfaces under `tmp/phase366-rdp-ui-review/` and identified the first-run Settings deep-link miss.
- Added a dashboard empty-state Quick Setup action and updated localized empty-state copy to point users at the setup path.
- Added a Settings route-focus fallback so hidden-provider Quick Setup deep links scroll to the Quick Setup section instead of doing nothing.
- Added focused render/route-target coverage for the dashboard empty action and hidden-provider Quick Setup fallback.

## Verification

- `npm run test -- src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/routes/DashboardPage.test.tsx`
- `npm run test`
- `npm run typecheck`
- `npm run build`
- `npm run store:capture-rdp-extension-window -- --route dashboard --output tmp/phase366-rdp-ui-review/07-dashboard-after.png`
- `npm run store:capture-rdp-extension-window -- --route settings-quick-setup-cursor --output tmp/phase366-rdp-ui-review/08-settings-quick-setup-after.png`

## Follow-Up

- No follow-up is required for this slice. Future onboarding work should start from fresh RDP Chrome screenshots and stay separate from release packaging unless a resubmission is explicitly requested.
