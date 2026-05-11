# Store Screenshot Capture Runbook

Date: 2026-05-11

Process rule:

- follow [../Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the canonical maintained runbook for truthful Chrome Web Store screenshot capture
- refresh it when screenshot order, capture workflow, Chrome Web Store asset guidance, or RDP runtime rules change materially

## Purpose

- keep store screenshots sourced from the real unpacked extension runtime
- reduce drift between popup story, side-panel depth, and store-facing promises

## Pre-Capture Requirements

1. Work from the current pushed source state.
2. Run a fresh build with `npm run build`.
3. Reload the unpacked extension from `dist/` in `chrome://extensions`.
4. Close stale popup, side-panel, or full-page extension windows before recapturing.
5. Use the current storyboard in [../Store_Screenshot_Storyboard.md](../Store_Screenshot_Storyboard.md).

## Core Commands

Create a capture pack:

```bash
npm run store:create-screenshot-capture-pack -- --pack-id <pack-id>
```

Capture request-bound staged screenshots from the real RDP runtime:

```bash
npm run store:capture-screenshot-request-from-rdp -- --request-id <request-id>
```

For mixed manual-popup plus staged full-page requests:

```bash
npm run store:capture-hybrid-screenshot-request-from-rdp -- --request-id <request-id>
```

When native toolbar popup captures must be imported manually:

```bash
npm run store:finalize-manual-screenshot-request -- --request-id <request-id> --source-dir <capture-dir>
```

## Honesty Rules

- do not replace the native toolbar popup with a fake helper window
- do not mark a request fulfilled until required manual captures exist
- keep popup/manual limits explicit in request notes and milestone docs
- store screenshots must match the currently packaged support boundary
