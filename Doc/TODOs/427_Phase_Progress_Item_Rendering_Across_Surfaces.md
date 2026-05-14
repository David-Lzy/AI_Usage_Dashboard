# Phase 427 - Progress Item Rendering Across Surfaces

Status: queued

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

## Follow-Up

- Phase 428 improves the visual design of circular progress displays.
