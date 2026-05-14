# Phase 427 - Progress Item Rendering Across Surfaces

Status: completed

## Goal

Render popup, sidebar, full-page dashboard, and provider detail progress from the shared progress-item view model and per-surface user preferences.

## Scope

- Replace duplicated primary/window progress rendering branches with shared item rendering.
- Use `popup` item settings in popup featured provider cards.
- Use `sidebar` item settings in the side panel.
- Use `fullPage` item settings in the full-page tab.
- Keep usage facts as supplemental context.

## Preserved Boundaries

- Do not change provider snapshots or adapter output.
- Do not translate raw evidence or export payloads.
- Do not change the popup max featured-provider count.

## Acceptance

- Hidden progress items do not render on the selected surface.
- Reordered progress items render in saved order.
- All-hidden providers still show useful non-progress provider context instead of a blank card.
- Existing source truth labels and diagnostics remain unchanged.

## Planned Verification

- `npm run test -- src/popup/PopupProviderProgress.test.tsx src/sidepanel/components/ProviderCard.test.tsx src/sidepanel/routes/ProviderDetailPage.test.tsx`
- `npm run typecheck`
- `git diff --check`

## Completion Summary

- Added shared progress item selection and rendering so popup, sidebar dashboard cards, full-page dashboard cards, and provider detail consume per-surface progress item preferences.
- Replaced duplicated primary/window rendering branches with `ProviderProgressItemList`, including value-only item presentation for items that do not have a determinate total.
- Wired popup to use `popup` item settings and sidepanel/full-page routes to use `sidebar` or `fullPage` settings.
- Kept usage facts as supplemental context and left provider snapshots, adapter output, raw evidence, export payloads, source truth labels, and popup featured-provider count unchanged.

## Verification

- `npm run test -- src/shared/provider-progress-item-selection.test.ts src/popup/PopupProviderProgress.test.tsx src/sidepanel/components/ProviderCard.test.tsx src/sidepanel/routes/ProviderDetailPage.test.tsx src/sidepanel/routes/DashboardPage.test.tsx`
- `npm run typecheck`

## Follow-Up

- Phase 428 improves the visual design of circular progress displays.
