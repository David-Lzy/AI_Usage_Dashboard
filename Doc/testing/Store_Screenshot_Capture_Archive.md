# Store Screenshot Capture Archive

Date: 2026-04-23

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

- no archived store screenshot capture sets are recorded yet
