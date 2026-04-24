# Store Screenshot Capture Requests

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- generated operational ledger
- completion model: truthful when regenerated from current capture-request manifests, not when frozen as a one-time closeout file
- taxonomy: [Documentation_Taxonomy.md](../Documentation_Taxonomy.md)

Purpose:

- track repo-backed store screenshot capture requests across the current pending-to-fulfilled lifecycle
- distinguish pending screenshot capture packages from fulfilled request records and archived screenshot evidence

Managed note:

- this file is regenerated from `capture-request.json` manifests inside `Doc/testing/store_screenshot_capture_requests`
- rerun `npm run store:refresh-screenshot-capture-request-index` after manual request edits

## Request Commands

Create a new pending store screenshot capture request:

```bash
npm run store:create-screenshot-capture-request -- --request-id <request-id>
```

Refresh only the generated request index and machine-readable catalog:

```bash
npm run store:refresh-screenshot-capture-request-index
```

Complete a pending request and archive one real screenshot set:

```bash
npm run store:complete-screenshot-capture-request -- --request-id <pending-request-id> --captures-dir Doc/testing/store_screenshot_capture_requests/<pending-request-id>/captures
```

Refresh generated request packages after generator changes:

```bash
npm run store:refresh-screenshot-capture-request-packages
```

## Truth Rules

- a pending screenshot-capture request package is not a completed screenshot set
- the baseline storyboard pack copied into a request package is only a baseline reference, not a finished store pack
- manual-only requests must stay manual-only; do not run them through the request-bound RDP runner just to fill files faster
- future real screenshot archives should remain truthful extension-mode captures, not preview-only mocks

## Pending Requests

- [2026-04-24-surface-expansion-store-screenshot-refresh-request](./store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/README.md)
  - status: `pending_operator_capture`
  - created on 2026-04-24
  - runtime source: `RDP Chrome unpacked extension`
  - sizes: preferred `1280x800` · fallback `640x400`
  - required screenshots: `5`
  - selection pack: `Doc/Store_Screenshot_Selection_Pack.md`
  - baseline pack: `Doc/testing/store_screenshot_capture_packs/2026-04-24-toolbar-storyboard-baseline/README.md`
  - automation mode: `manual_capture_required`
  - capture notes: `2/5` reviewed · truth boundaries `2`

## Fulfilled Requests

- [2026-04-24-first-real-store-screenshot-capture-request](./store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/README.md)
  - status: `fulfilled_operator_capture`
  - created on 2026-04-23
  - runtime source: `RDP Chrome unpacked extension`
  - sizes: preferred `1280x800` · fallback `640x400`
  - required screenshots: `5`
  - selection pack: `not set`
  - baseline pack: `Doc/testing/store_screenshot_capture_packs/2026-04-24-toolbar-storyboard-baseline/README.md`
  - automation mode: `request_bound_rdp_runner`
  - capture notes: `5/5` reviewed · truth boundaries `5`
  - archive: `2026-04-24-first-real-store-screenshot-capture-request-archive` · `Doc/testing/store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/README.md`
