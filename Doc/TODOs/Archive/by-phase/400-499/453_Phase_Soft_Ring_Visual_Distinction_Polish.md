# Phase 453 - Soft Ring Visual Distinction Polish

Status: completed on 2026-05-14

## Goal

Make `circle-soft` visually distinct from the classic `circle` style after the `Phase 451` conic-gradient correctness fix made the soft ring look too close to a plain circular progress ring.

## Scope

- Keep `circle-soft` percentage rendering on the conic-gradient path.
- Add a soft visual stack:
  - lightly tinted circular base
  - low-opacity outer halo
  - slim foreground progress arc
  - muted neutral track
- Keep `circle` as the solid classic donut and `circle-gauge` as the SVG instrument arc.
- Preserve existing progress math, accessibility labels, color-band selection, and thickness preference semantics.
- Record real RDP popup visual QA.

## Preserved Boundaries

- Do not change storage shape, provider data, source-page logic, quota math, warning thresholds, localization, package version, or manifest version.
- Do not package a new release zip; `0.1.0-rc.19` remains the current packaged follow-up candidate and current source is ahead by this UI polish phase.
- Do not mutate the submitted RC13 Chrome Web Store review milestone.

## Acceptance

- `circle-soft` no longer reads as the same visual style as classic `circle`.
- Non-100 values still show a correct neutral gap.
- The soft ring remains lighter than the gauge and classic styles.
- Focused progress tests, build, docs checks, and diff whitespace checks pass.

## Planned Verification

- `npm run test -- src/sidepanel/components/UsageProgressRing.test.tsx src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx src/popup/PopupProviderProgress.test.tsx --run`
- `npm run build`
- `npm run store:capture-rdp-extension-window -- --route popup --output tmp/phase453-popup-soft-ring-halo.png`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If the soft ring should become the shipped default in a packaged candidate, open a separate packaging phase that supersedes `0.1.0-rc.19`.

## Completion Notes

- Earlier soft-ring versions used SVG stroke arcs with round caps and a muted groove. That looked more like an arc, but the green success case had the reported full-ring visual bug.
- `Phase 451` fixed correctness by moving soft rings to conic gradients, but the first conic version was visually too close to the classic circle.
- This phase kept the conic percentage path and added `::before`/`::after` layers for halo plus slim foreground arc, making soft visually lighter while preserving exact percent gaps.
- RDP popup capture at `tmp/phase453-popup-soft-ring-halo.png` shows `64%`, `39%`, and `93%` soft rings with visible neutral gaps and a softer visual treatment than the classic circle.

## Verification

- `npm run test -- src/sidepanel/components/UsageProgressRing.test.tsx src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx src/popup/PopupProviderProgress.test.tsx --run`
- `npm run build`
- `npm run store:capture-rdp-extension-window -- --route popup --output tmp/phase453-popup-soft-ring-halo.png`
