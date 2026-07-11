# I18n Documentation

Date: 2026-05-18

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this directory holds public localization contracts and provider evidence translation boundaries
- internal phase inventories and implementation closeouts live in ignored `.local/` history

## Current References

- [Message ID Contract](./I18n_Message_ID_Contract.md)
- [Raw Provider Source Truth Policy](./I18n_Raw_Provider_Source_Truth_Policy.md)

## Current Coverage

The stable manifest and runtime message-id catalog ships across 14 runtime
locales:

- `en`
- `zh-CN`
- `zh-TW`
- `ja`
- `ko`
- `es-419`
- `pt-BR`
- `fr`
- `de`
- `it`
- `ru`
- `ar`
- `hi`
- `id`

Runtime message coverage, structured-copy coverage, and protected raw evidence
boundaries can be audited with:

```sh
npm run i18n:audit
```

Cross-language layout checks can be run against the built Chrome extension with:

```sh
npm run build
npm run i18n:visual-check -- --smoke
```

Use the full matrix before release-oriented localization/layout changes:

```sh
npm run i18n:visual-check -- --fail-on-issues
```

Visual matrix screenshots and JSON reports are local QA evidence under ignored
`.local/visual-checks/i18n/` paths and should not be committed.

## Boundary

Runtime UI, manifest strings, and store listing copy may be localized. Raw
provider evidence, diagnostic raw bodies, archive/export payloads, provider
names, and product names should not be translated or rewritten as evidence.
