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

## Layout Resilience

Localized layout should respond to the width of the component that owns the
content, not only to the browser viewport. Use inline-size container queries for
reusable surfaces such as the Settings top app bar and Popup footer when their
available width can differ from the viewport.

- keep short command labels intact and reflow the surrounding group first
- split metadata into semantic groups so public links and related values do not
  become orphaned lines
- use balanced wrapping for short headings, while preserving normal word
  boundaries for translated copy
- use logical properties and inherit the document direction for RTL locales
- replace familiar move actions with accessible icon controls when translated
  text would consume layout space; retain localized `aria-label` and `title`
- reserve emergency word breaking for untrusted or user-defined values, not
  ordinary localized interface labels

Key compact components expose `data-i18n-layout-contract` markers. The visual
matrix checks those contracts for overlapping controls, unexpectedly tall
compact rows, and oversized Settings navigation or action controls. This makes
the screenshots supporting evidence rather than the primary way regressions are
found.

## Boundary

Runtime UI, manifest strings, and store listing copy may be localized. Raw
provider evidence, diagnostic raw bodies, archive/export payloads, provider
names, and product names should not be translated or rewritten as evidence.
