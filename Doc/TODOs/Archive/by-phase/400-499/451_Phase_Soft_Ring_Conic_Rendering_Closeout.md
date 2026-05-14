# Phase 451 - Soft Ring Conic Rendering Closeout

Status: completed on 2026-05-14

## Goal

Fix the reported `circle-soft` popup ring regression where green remaining values such as `68%` or `69%` still looked visually full even after the SVG dash hardening in `Phase 450`.

## Scope

- Change `circle-soft` from SVG stroke rendering to a CSS `conic-gradient` ring driven by the rendered percentage.
- Use `circle closest-side` geometry for the soft-ring inner cutout so the configured stroke width maps to the actual ring radius instead of the radial-gradient default corner radius.
- Keep `circle-gauge` on the existing SVG arc path so gauge remains a shorter instrument-style ring.
- Add explicit percent and pixel-thickness CSS custom properties for the soft ring.
- Update focused progress tests so soft-ring coverage verifies the conic percent path and gauge coverage continues verifying SVG dash values.
- Verify the real RDP Chrome unpacked extension popup after rebuilding `dist/`.

## Preserved Boundaries

- Do not change quota math, remaining/used semantics, progress color-band selection, progress thickness storage, provider data, warnings, diagnostics, raw evidence, package version, or manifest version.
- Do not package a new release zip; `0.1.0-rc.19` remains the current packaged follow-up candidate and current source is ahead by this UI micro-polish phase.
- Do not mutate the submitted RC13 Chrome Web Store review milestone.

## Acceptance

- `circle-soft` values below `100%` show a visible neutral track gap for any fill color, including green success bands.
- `circle-gauge` still renders through the SVG arc path and keeps its distinct instrument-style geometry.
- Real popup visual QA shows partial rings for non-100 values.
- Current Chrome profile extension record points at this repo `dist/` and has no manifest/runtime errors.
- Focused progress tests and build pass.

## Planned Verification

- `npm run test -- src/sidepanel/components/UsageProgressRing.test.tsx src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx src/popup/PopupProviderProgress.test.tsx --run`
- `npm run build`
- `npm run store:capture-rdp-extension-window -- --route popup --output tmp/phase451-popup-conic-soft-ring.png`
- Chrome Preferences check for extension id `gkjioiklbdjcknhdglaehbeofkjmmdpc`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If this source boundary should ship to users, open a separate packaging phase that supersedes the current `0.1.0-rc.19` follow-up package.

## Completion Notes

- `circle-soft` now renders as a CSS conic ring using `--usage-progress-ring-percent`, so the neutral track segment is geometrically tied to the displayed percentage instead of depending on SVG stroke rendering.
- `circle-gauge` remains SVG-based and keeps the shorter gauge arc plus existing dasharray assertions.
- The built RDP popup capture at `tmp/phase451-popup-conic-soft-ring-closest-side.png` showed slim partial rings for `66%` and `39%` values with visible neutral gaps.
- The root cause of the too-thick interim ring was CSS radial-gradient percentage geometry: `circle` percentages were based on the default gradient radius, not the visible ring side radius. Switching to `circle closest-side` plus `100% - stroke` made the inner cutout match the intended soft-ring thickness.
- The current Chrome profile record for `gkjioiklbdjcknhdglaehbeofkjmmdpc` points at `/nfs/server1/disk1/Project/personal_project/AI_Usage_Dashboard/dist` with `manifestErrorCount=0` and `runtimeErrorCount=0`; the stale Chrome Extensions `Errors` button was not the blocker for this UI symptom.

## Verification

- `npm run test -- src/sidepanel/components/UsageProgressRing.test.tsx src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx src/popup/PopupProviderProgress.test.tsx --run`
- `npm run build`
- `npm run store:capture-rdp-extension-window -- --route popup --output tmp/phase451-popup-conic-soft-ring-closest-side.png`
- Chrome Preferences extension record check
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
