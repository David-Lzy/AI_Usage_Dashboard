# Store Screenshot Capture Requests

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- generated operational ledger
- completion model: truthful when regenerated from current capture-request manifests, not when frozen as a one-time closeout file
- taxonomy: [Documentation_Taxonomy.md](../Documentation_Taxonomy.md)

Purpose:

- track repo-backed store screenshot capture requests before the first real operator screenshot set exists
- distinguish pending screenshot capture packages from any future fulfilled store-asset records

Managed note:

- this file is regenerated from `capture-request.json` manifests inside `Doc/testing/store_screenshot_capture_requests`
- rerun `npm run store:refresh-screenshot-capture-request-index` after manual request edits

## Request Commands

Create a new pending store screenshot capture request:

```bash
npm run store:create-screenshot-capture-request -- --request-id 2026-04-24-first-real-store-screenshot-capture-request
```

Refresh only the generated request index and machine-readable catalog:

```bash
npm run store:refresh-screenshot-capture-request-index
```

## Truth Rules

- a pending screenshot-capture request package is not a completed screenshot set
- the baseline storyboard pack copied into a request package is only a baseline reference, not a finished store pack
- future real screenshot archives should remain truthful extension-mode captures, not preview-only mocks

## Pending Requests

- [2026-04-24-first-real-store-screenshot-capture-request](./store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/README.md)
  - status: `pending_operator_capture`
  - created on 2026-04-23
  - runtime source: `RDP Chrome unpacked extension`
  - sizes: preferred `1280x800` · fallback `640x400`
  - required screenshots: `5`
  - baseline pack: `Doc/testing/store_screenshot_capture_packs/2026-04-24-toolbar-storyboard-baseline/README.md`

## Fulfilled Requests

- no fulfilled store screenshot capture requests are recorded yet
