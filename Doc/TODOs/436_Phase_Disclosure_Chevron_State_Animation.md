# Phase 436 - Disclosure Chevron State Animation

Status: queued

## Goal

Make disclosure and dropdown chevrons consistently communicate expanded state, including the "More Provider" section whose arrow currently still appears down while open.

## Scope

- Audit Settings `details` summaries, source-card disclosure toggles, More/Less provider disclosures, advanced sections, selects, and combobox-style dropdown controls.
- Introduce or reuse one shared chevron treatment that rotates between collapsed and expanded states.
- Ensure all clickable disclosure controls keep focus-visible styling, accessible names, and keyboard behavior.
- Add restrained rotation animation for users who allow motion, and a no-animation state for reduced motion.
- Verify the "More Provider" section arrow rotates correctly after expansion and collapse.

## Preserved Boundaries

- Do not change which provider sections are hidden or shown.
- Do not change select, combobox, or disclosure data models.
- Do not add an icon dependency unless the existing icon system already provides the needed symbol.
- Do not alter provider source, credential, or permission workflows.

## Acceptance

- Every Settings disclosure/dropdown chevron has an obvious collapsed and expanded visual state.
- The "More Provider" toggle rotates correctly when opened and closed.
- Pointer, keyboard, and screen-reader interactions remain unchanged except for improved state affordance.
- Reduced-motion mode keeps state changes clear without animated rotation.

## Planned Verification

- Focused tests for More Provider disclosure state and custom dropdown expanded state where test coverage exists.
- Settings page render tests for advanced/source-card disclosure controls.
- Manual or Playwright visual check of collapsed and expanded Settings sections.
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If some dropdowns need component-level API changes, split those controls into a follow-up phase after the shared CSS/state audit is complete.
