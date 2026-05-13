# Phase 153 - Popup Bootstrap Width And Preferred Node Runtime

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this file records the `Phase 153` closeout for the popup first-paint width and preferred Node runtime hardening slice under `Direction 10`

## Goal

Stop the real Chrome action popup from depending on post-boot class mutation or a narrow-screen CSS fallback at first paint, and make repo-backed tool commands consistently prefer the local supported Node runtime.

## Implemented

- moved the popup width contract into static bootstrap markup in [src/popup/index.html](../../../../../src/popup/index.html) by:
  - statically labeling `html`, `body`, and `#root` with popup-specific classes
  - replacing the viewport-reset media query with one bootstrap width formula:
    - `min(392px, max(360px, 100vw))`
- aligned the runtime stylesheet in [material-theme.css](../../../../../src/sidepanel/theme/material-theme.css) with the same width-floor formula and removed the popup-specific small-screen reset that could collapse the real action popup back to a scrollbar-width column
- kept [src/popup/main.tsx](../../../../../src/popup/main.tsx) focused on React boot only, instead of asking it to patch popup host classes after the page has already started rendering
- added one local runtime wrapper at [scripts/with-preferred-node.sh](../../../../../scripts/with-preferred-node.sh) that prefers `${HOME}/.local/node-current/bin/node` when present
- routed repo-backed scripts in [package.json](../../../../../package.json) through that wrapper so `vite`, `tsc`, `vitest`, and helper scripts no longer depend on the older Cursor-bundled `node`
- added repeatable review coverage in [phase153-popup-bootstrap-width-and-node-runtime-review.mjs](../../../../../scripts/phase153-popup-bootstrap-width-and-node-runtime-review.mjs)
- updated [Development_Guardrails.md](../../../../Development_Guardrails.md) so the preferred-node policy is now explicit project process, not an ad-hoc shell workaround

## Verification

- `npm run docs:check`
- `npm run phase153:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Result

The popup host-width contract now exists before React starts, so real Chrome action-popup sizing no longer depends on runtime class injection or on a narrow-screen CSS branch that can trigger too early. Repo-backed `npm run ...` commands now also prefer the locally installed supported Node runtime, which removes the old Vite Node warning from the project's build path.
