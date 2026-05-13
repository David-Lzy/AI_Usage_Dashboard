# Phase 221 - Source Page Recovery Action

Date: 2026-04-29

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-04-29

## Goal

Make source-page recovery available directly from dashboard and provider detail for shipped session-page providers.

## Completed Work

- Added an `openableSessionPageUrl` provider view-model field for shipped session-page tracks with concrete routes.
- Prevented wildcard-only route hints from being treated as automatically openable URLs.
- Added the dashboard provider-card `Source page` action for providers such as Codex and Cursor.
- Added a localized provider-detail source-page recovery action block.
- Routed both UI actions into the existing `handleOpenSessionPage` flow, which focuses matching tabs or opens the concrete provider page and saves the page binding.

## Preserved Boundaries

- No provider parser, adapter, credential, host-permission, or source-selection behavior changed.
- Deferred session-page tracks remain hidden from the direct recovery action.
- The action still uses Chrome tabs access and does not persist raw cookies or auth headers.

## Verification

- `npm run test -- --run src/shared/provider-sources.test.ts src/sidepanel/view-models.test.ts src/sidepanel/components/ProviderCard.test.tsx src/sidepanel/routes/ProviderDetailPage.test.tsx`
- `npm run typecheck`
- `npm run phase221:review`
- `npm run docs:check`
- `git diff --check`
- `npm run test -- --run`
- `npm run build`

## Follow-Up

Run a real Chrome source-page recovery click pass for Codex or Cursor, then refresh the provider to confirm an unavailable page state can be recovered without visiting Settings first.
