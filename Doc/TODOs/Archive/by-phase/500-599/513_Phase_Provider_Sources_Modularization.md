# Phase 513 - Provider Sources Modularization

Date: 2026-05-17

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed and archived on 2026-05-17

## Goal

Split `src/shared/provider-sources.ts` (1149 lines) by extracting two cohesive concerns into dedicated modules, reducing the file's responsibility and making each module independently readable.

## Scope

- `src/shared/provider-source-copy.ts` (new, ~260 lines) — `ProviderSourceFidelityKind` type, `ProviderSourceDisplayCopy` type, private label constants, `DEFAULT_PROVIDER_SOURCE_DISPLAY_COPY`
- `src/shared/provider-source-url-matchers.ts` (new, ~75 lines) — `getOpenableRouteHint`, `doesUrlMatchRouteHint`, `doesUrlMatchRouteHints`, and private URL helpers
- `src/shared/provider-sources.ts` — imports from both new modules, re-exports all extracted symbols to preserve existing import paths unchanged

## Preserved Boundaries

- No behavior change; all exported symbols remain accessible from `./provider-sources`
- No change to provider logic, adapter code, test files, or UI components
- No circular dependencies introduced; both new files import only from `../providers/types` or have no project imports

## Verification

- `npm run typecheck` — passed (no errors)
- `npm run test -- --run` — 699 tests passed
- `npm run build` — built in 4.94s
- `npm run docs:check` — 95 docs verified, 1007 links verified

## Follow-Up

- Continue with Phase 514 (i18n.ts locale metadata extraction)
