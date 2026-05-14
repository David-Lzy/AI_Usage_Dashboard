# Phase 444 - Soft And Gauge Ring Visual Differentiation QA

Date: 2026-05-14

## Summary

Phase 444 made `circle-soft` and `circle-gauge` visually distinct while preserving the shared `UsageProgressRing` renderer. Soft remains a full circular ring; gauge now renders as a shorter instrument-style arc with a different gap rotation, lower track opacity, larger sizing, and stronger fill emphasis.

## Checks

- `circle-soft` emits a full ring arc and keeps the standard top-start rotation.
- `circle-gauge` emits a shorter arc, uses a different gap placement, and lowers track opacity.
- Both variants keep the same progress value, aria value, color-band, and thickness semantics introduced before this phase.
- Settings preview smoke checks captured both variants from the built `dist/` preview and confirmed their variant classes and CSS variables differ.

## Preserved Boundaries

- No stored `ProgressDisplayStyle` value changed.
- No quota math, provider warning diagnostics, provider `displayTone`, action-badge attention counts, adapter output, source-truth labels, raw evidence, or export schemas changed.
- No release package was created.

## Verification

- `npm run test -- src/sidepanel/components/UsageProgress.test.tsx src/sidepanel/components/UsageProgressRing.test.tsx src/sidepanel/components/PopupAppearancePreview.test.tsx src/popup/PopupProviderProgress.test.tsx --run`
- `npm run typecheck`
- `npm run build`
- Playwright preview smoke against `http://127.0.0.1:4173/src/sidepanel/index.html#settings`
- `npm run docs:check`
- `git diff --check`

## Notes

The production build still emits the known sidepanel chunk-size warning. The preview smoke screenshots are local ignored artifacts under `tmp/phase444-ring-visual-smoke/`.
