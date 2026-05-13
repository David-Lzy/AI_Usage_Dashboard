# Store Screenshot Capture Packs

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file tracks the current baseline store screenshot capture packs used for truthful extension-mode capture work
- refresh it when a new capture-pack baseline is added or the current baseline is superseded

## Purpose

- keep the current store screenshot capture workflow discoverable in-repo
- separate maintained capture-pack baselines from one-off local screenshots
- point operators to the current RDP Chrome capture contract

## Current Baseline Pack

- [2026-04-24-toolbar-storyboard-baseline/README.md](./store_screenshot_capture_packs/2026-04-24-toolbar-storyboard-baseline/README.md)

## Create A New Pack

```bash
npm run store:create-screenshot-capture-pack -- --pack-id 2026-04-24-toolbar-storyboard-capture
```

## Related Docs

- [Store_Screenshot_Capture_Runbook.md](./Store_Screenshot_Capture_Runbook.md)
- [Store_Screenshot_Storyboard.md](../Store/Store_Screenshot_Storyboard.md)
