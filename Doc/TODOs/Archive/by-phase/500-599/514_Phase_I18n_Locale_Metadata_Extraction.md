# Phase 514 - i18n Locale Metadata Extraction

Date: 2026-05-17

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-05-17

## Goal

Extract the static locale metadata block from `src/shared/i18n.ts` into a dedicated module, reducing the file from 956 lines and separating static configuration from runtime logic.

## Scope

- `src/shared/i18n-locale-metadata.ts` (new, ~160 lines) — `SUPPORTED_APP_LOCALES`, `ResolvedAppLocale`, `ResolvedTextDirection`, `DEFAULT_APP_LOCALE_PREFERENCE`, `AppLocaleMetadata`, `APP_LOCALE_METADATA`
- `src/shared/i18n.ts` — replaced the extracted declarations with import + re-export from the new module; all existing import paths unchanged

## Preserved Boundaries

- No behavior change; all exported symbols remain accessible from `./i18n`
- No change to runtime i18n functions, message catalogs, or test files
- No circular dependencies introduced; new file imports only from `../providers/types`

## Verification

- `npm run typecheck` — passed (no errors)
- `npm run test -- --run` — 699 tests passed
- `npm run build` — built in 5.06s
- `npm run docs:check` — verified

## Follow-Up

- Continue with Phase 515 (interaction-audit-signoff.ts split)
