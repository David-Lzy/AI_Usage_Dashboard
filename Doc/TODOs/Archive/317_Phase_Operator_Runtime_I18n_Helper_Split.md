# Phase 317 - Operator Runtime I18n Helper Split

## Goal

Share the default operator-workspace runtime i18n bootstrap across special operator pages.

## Scope

- Add one sidepanel helper for default operator runtime i18n creation.
- Replace duplicate route-local i18n bootstrap code in interaction-audit and theme-recovery operator pages.
- Add focused helper coverage for system-locale fallback and runtime reader behavior.

## Preserved Boundaries

- Do not change operator workspace copy, layout, links, exports, request binding, or archive behavior.
- Do not change runtime locale resolution rules in `src/shared/i18n.ts`.
- Do not change standard dashboard, Settings, provider detail, popup, or provider sync behavior.

## Acceptance

- Both operator routes use the same default operator runtime i18n helper.
- The helper keeps the previous default `system` locale preference behavior.
- Runtime readers still flow through the existing runtime i18n implementation.

## Planned Verification

- `npm run test -- --run src/sidepanel/operator-runtime-i18n.test.ts src/sidepanel/write-clipboard-text.test.ts src/sidepanel/special-route-app.test.tsx`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`

## Completion

Status: completed on 2026-05-13.

Summary:

- Added `src/sidepanel/operator-runtime-i18n.ts` as the shared default operator i18n bootstrap.
- Added `src/sidepanel/operator-runtime-i18n.test.ts` for default `system` preference and reader pass-through behavior.
- Removed duplicate default i18n factory code from interaction-audit and theme-recovery operator pages.

Verification:

- `npm run test -- --run src/sidepanel/operator-runtime-i18n.test.ts src/sidepanel/write-clipboard-text.test.ts src/sidepanel/special-route-app.test.tsx`
- `npm run typecheck`
- `npm run docs:check`
- `git diff --check`
