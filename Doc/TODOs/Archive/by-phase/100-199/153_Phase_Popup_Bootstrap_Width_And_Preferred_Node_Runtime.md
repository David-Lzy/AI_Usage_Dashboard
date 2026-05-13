# Phase 153 - Popup Bootstrap Width And Preferred Node Runtime

Completion date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this archived phase marks the popup first-paint width and preferred Node runtime hardening slice as completed

Completion summary:

- moved popup width control into the static popup bootstrap so real Chrome action-popup sizing no longer depends on post-boot class mutation
- replaced the popup small-screen reset with one width-floor formula that preserves `360px` to `392px` width intent without collapsing to a scrollbar-width column
- routed repo-backed commands through `scripts/with-preferred-node.sh` so build, typecheck, and test prefer the local supported Node runtime over the older bundled runtime

Verification:

- `npm run docs:check`
- `npm run phase153:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

Related closeout:

- [Phase_153_Popup_Bootstrap_Width_And_Preferred_Node_Runtime.md](../../../../testing/Archive/phase-reports/100-199/Phase_153_Popup_Bootstrap_Width_And_Preferred_Node_Runtime.md)
