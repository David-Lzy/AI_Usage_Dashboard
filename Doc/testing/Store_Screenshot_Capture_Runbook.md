# Store Screenshot Capture Runbook

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the current maintained runbook for truthful Chrome Web Store screenshot capture from the real unpacked extension runtime
- refresh it when screenshot order, capture workflow, Chrome Web Store asset guidance, or RDP Chrome runtime rules change materially

Purpose:

- turn the screenshot storyboard into one repeatable operator workflow
- keep store screenshots sourced from truthful extension-mode runtime states
- reduce ad-hoc capture drift between popup story, side-panel depth, and store-facing promises

## Source Guidance

The current workflow aligns with public Chrome Web Store guidance:

- screenshots should demonstrate the actual user experience and current functionality
- screenshots should use square corners with no padding
- screenshots should be `1280x800` or `640x400`
- at least one screenshot is required and up to five are recommended

Primary references:

- Chrome Web Store best listing:
  https://developer.chrome.com/docs/webstore/best-listing
- Chrome Web Store listing dashboard guidance:
  https://developer.chrome.com/docs/webstore/cws-dashboard-listing
- Chrome Web Store image guidance:
  https://developer.chrome.com/webstore/images?csw=1

## Pre-Capture Requirements

1. Work from the current pushed source state.
2. Run a fresh build:
   - `npm run build`
3. In the RDP Chrome profile:
   - open `chrome://extensions`
   - reload the unpacked extension pointing at `dist/`
   - close any already-open popup or side-panel extension pages
4. Reopen the extension surfaces only after the reload.
5. Use the current storyboard:
   - [Store_Screenshot_Storyboard.md](../Store_Screenshot_Storyboard.md)

## Create A Capture Pack

Generate one named capture pack before taking screenshots:

```bash
npm run store:create-screenshot-capture-pack -- --pack-id 2026-04-24-toolbar-storyboard-capture
```

This writes a pack under:

- `Doc/testing/store_screenshot_capture_packs/<pack-id>/`

Each pack contains:

- `README.md`
- `capture-plan.json`
- `captures/README.md`

## Optional RDP Runtime Smoke Capture

When you need to prove that the real RDP Chrome profile can still open and render the unpacked extension pages before a full screenshot pass, use:

```bash
npm run store:capture-rdp-extension-window -- --route popup --output tmp/store-rdp-popup.png
npm run store:capture-rdp-extension-window -- --route settings --output tmp/store-rdp-settings.png
```

Supported route keys are currently:

- `popup`
- `dashboard`
- `settings`
- `provider-detail-codex`

Truth note:

- this helper captures real extension runtime windows from the existing RDP Chrome session
- it is a smoke-capture tool, not a substitute for the full storyboard review and archive flow

## Request-Bound Seed And Capture Helpers

When the request needs one stable seeded runtime pass before manual review or archival, use:

```bash
npm run store:apply-rdp-screenshot-seed -- --preset toolbar-first-quick-glance
```

Supported presets currently include:

- `toolbar-first-quick-glance`
- `setup-guidance`
- `honest-contract-or-policy-only`
- `settings-and-setup-depth`
- `provider-or-dashboard-depth`
- `unlock`

When you want the current pending request package filled in one pass from the real extension runtime, use:

```bash
npm run store:capture-screenshot-request-from-rdp -- --request-id 2026-04-24-first-real-store-screenshot-capture-request
```

Truth note:

- this runner captures from the real unpacked extension runtime, not preview-only pages
- it applies one request-bound screenshot seed plus a runtime lock before each capture, then restores the pre-seed baseline on `unlock`
- it also updates the request-bound `capture-notes.json` with the current reviewed truth statuses and operator notes
- it does not mark the request fulfilled by itself; completion still requires the normal archive command

## Capture Workflow

1. Open the generated pack README and follow the screenshot order.
2. For each screenshot:
   - create the required runtime state in RDP Chrome
   - confirm the screenshot still matches the claim in the storyboard
   - capture the screenshot at `1280x800` when practical
   - fall back to `640x400` only if the real extension surface cannot be shown honestly at `1280x800`
3. Save each file using the exact filenames from `capture-plan.json`.
4. Update the request-bound `capture-notes.json` file:
   - set one reviewed `captureTruth` for every screenshot
   - write one short `stateSummary` for every screenshot
   - add one `operatorNote` whenever the screenshot used:
     - `policy_only_fallback`
     - `provider_omitted`
     - `approximated_runtime_state`
     - `other_truth_boundary`
   - or let the request-bound RDP capture runner prefill those reviewed note entries when its seeded runtime plan matches the current storyboard
5. Do not crop out context in a way that changes the product story.

## Do Not Capture

- preview-only states that were not reproduced in extension mode
- unsupported provider combinations presented as healthy
- screenshots with fake data added only for marketing
- internal debug routes as store-facing screenshots

## Current Storyboard-to-Filename Contract

1. `01-toolbar-first-quick-glance.png`
2. `02-setup-guidance.png`
3. `03-honest-contract-or-policy-only.png`
4. `04-settings-and-setup-depth.png`
5. `05-provider-or-dashboard-depth.png`

## After Capture

1. Review the screenshot order against the storyboard.
2. Confirm the filenames still match the pack manifest.
3. Confirm `capture-notes.json` no longer contains any `not_reviewed` entries.
4. If the runtime story has changed enough that the pack no longer fits, update:
   - [Store_Screenshot_Storyboard.md](../Store_Screenshot_Storyboard.md)
   - the capture pack generator
   - this runbook
5. Once the real extension-mode screenshots are ready, complete the pending request and archive the set:

```bash
npm run store:complete-screenshot-capture-request -- --request-id 2026-04-24-first-real-store-screenshot-capture-request --captures-dir Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/captures
```

6. If the request package template changed and the existing pending request needs the newest generated README or notes scaffolding first, run:

```bash
npm run store:refresh-screenshot-capture-request-packages
```

## Related Docs

- [Store_Screenshot_Storyboard.md](../Store_Screenshot_Storyboard.md)
- [Store_Screenshot_Capture_Packs.md](./Store_Screenshot_Capture_Packs.md)
- [Store_Screenshot_Capture_Requests.md](./Store_Screenshot_Capture_Requests.md)
- [Store_Screenshot_Capture_Archive.md](./Store_Screenshot_Capture_Archive.md)
- [Direction 10 - Toolbar Competitive Fit And Store Readiness](../Roadmap/10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)
