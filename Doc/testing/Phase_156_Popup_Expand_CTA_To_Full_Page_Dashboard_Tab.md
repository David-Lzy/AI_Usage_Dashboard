# Phase 156 - Popup Expand CTA To Full-Page Dashboard Tab

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this file records the `Phase 156` closeout for the popup expand slice under `Direction 10.2`

## Goal

Ship one compact popup-header expand control that opens the dashboard full-page tab through the shared `?surface=full-page` route contract, while keeping the rest of the popup handoff model stable.

## Implemented

- added one popup full-page opener that uses the shared route-entry helper instead of inventing a second path contract:
  - [PopupApp.tsx](../../src/popup/PopupApp.tsx)
- the popup header now includes one compact `Tab` expand control:
  - it opens the dashboard full-page tab
  - it stays secondary to the main refresh control
  - it keeps explicit `aria-label` and review markers for runtime QA
- existing popup quick actions still keep their current sidepanel handoff semantics in this slice, so this phase adds full-page expansion without collapsing the broader surface hierarchy
- added one repeatable popup-expand review:
  - [phase156-popup-expand-fullpage-review.mjs](../../scripts/phase156-popup-expand-fullpage-review.mjs)
  - verifies the popup expand control opens the full-page dashboard target and that the target resolves to the shared `?surface=full-page#dashboard` route

## Verification

- `npm run docs:check`
- `npm run phase156:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Result

The popup now has its first true expansion action into a full-page extension tab. This slice did not yet add the sidebar expand CTA or the ambient light/dark toggle; those stay as the next `Direction 10.2` runtime work.
