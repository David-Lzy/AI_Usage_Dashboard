# Store Screenshot Capture Archive

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- generated operational ledger
- completion model: truthful when regenerated from current archive manifests, not when frozen as a one-time closeout file
- taxonomy: [Documentation_Taxonomy.md](../Documentation_Taxonomy.md)

Purpose:

- index durable store screenshot capture archives stored under the repo archive root
- distinguish pending screenshot requests from completed archived screenshot sets

Managed note:

- this file is regenerated from `capture-archive.json` manifests inside `Doc/testing/store_screenshot_archives`
- rerun `npm run store:refresh-screenshot-capture-archive-index` after manual archive edits

## Archive Commands

Refresh only the generated archive index and machine-readable catalog:

```bash
npm run store:refresh-screenshot-capture-archive-index
```

## Truth Rules

- archived screenshot sets should remain truthful extension-mode captures
- the archive should preserve the exact filenames and request linkage used to produce the set
- do not treat an empty archive ledger as a failure; it can truthfully mean the first operator pass has not happened yet

## Archived Screenshot Sets

- [2026-05-16-public-store-readiness-request-archive](./store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/README.md)
  - archived on 2026-05-16
  - runtime source: `RDP Chrome unpacked extension, post-Phase 490 source build`
  - sizes: preferred `1280x800` · fallback `640x400`
  - screenshot count: `5`
  - capture notes: `5/5` reviewed · truth boundaries `5`
  - source request: `2026-05-16-public-store-readiness-request` · `Doc/testing/store_screenshot_capture_requests/2026-05-16-public-store-readiness-request/README.md`
- [2026-05-04-rc11-mixed-store-candidate-archive](./store_screenshot_archives/2026-05-04-rc11-mixed-store-candidate-archive/README.md)
  - archived on 2026-05-04
  - runtime source: `RDP Chrome unpacked extension`
  - sizes: preferred `1280x800` · fallback `640x400`
  - screenshot count: `5`
  - capture notes: `5/5` reviewed · truth boundaries `3`
  - source request: `2026-04-24-surface-expansion-store-screenshot-refresh-request` · `Doc/testing/store_screenshot_capture_requests/2026-04-24-surface-expansion-store-screenshot-refresh-request/README.md`
- [2026-04-24-first-real-store-screenshot-capture-request-archive](./store_screenshot_archives/2026-04-24-first-real-store-screenshot-capture-request-archive/README.md)
  - archived on 2026-04-23
  - runtime source: `RDP Chrome unpacked extension`
  - sizes: preferred `1280x800` · fallback `640x400`
  - screenshot count: `5`
  - capture notes: `5/5` reviewed · truth boundaries `5`
  - source request: `2026-04-24-first-real-store-screenshot-capture-request` · `Doc/testing/store_screenshot_capture_requests/2026-04-24-first-real-store-screenshot-capture-request/README.md`
