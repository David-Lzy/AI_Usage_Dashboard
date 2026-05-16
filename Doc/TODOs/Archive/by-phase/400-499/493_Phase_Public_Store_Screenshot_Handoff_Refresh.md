# Phase 493 - Public Store Screenshot Handoff Refresh

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed

## Goal

Create a refreshed screenshot evidence archive for the public-source Chrome Web Store handoff without faking light mode, unsupported providers, or provider values.

## Scope

- Add a public-readiness screenshot request template.
- Create and fulfill `2026-05-16-public-store-readiness-request`.
- Archive five `1280x800` screenshots:
  - popup quick glance
  - dashboard overview
  - provider detail contract
  - settings overview and theme controls
  - settings quick setup and appearance controls
- Update screenshot storyboard and selection docs.

## Preserved Boundaries

- Do not edit provider values or runtime text in screenshots.
- Do not claim native-toolbar-bubble exactness when using an extension popup app-window capture.
- Do not create a fake light/dark split promotional image from dark-mode-only screenshots.
- Do not change the packaged RC22 release zip.

## Acceptance

- Screenshot request is fulfilled and archived with `5/5` reviewed notes.
- Capture notes record the resizing/cropping and dark-mode boundaries.
- Store screenshot docs point to the 2026-05-16 archive as the current public-readiness handoff.
- The light/dark promotional image remains an explicit follow-up requiring a real light-mode capture pass.

## Verification

- `npm run store:create-screenshot-capture-request -- --template fixtures/store-screenshot/public-store-readiness-request-template.fixture.json --request-id 2026-05-16-public-store-readiness-request`
- `npm run store:complete-screenshot-capture-request -- --request-id 2026-05-16-public-store-readiness-request`
- `identify Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/captures/*.png`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- If the store listing should emphasize theme switching, capture a true light-mode image and compose a split promotional asset in a separate request/archive.
