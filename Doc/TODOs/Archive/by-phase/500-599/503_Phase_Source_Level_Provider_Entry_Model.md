# Phase 503 - Source-Level Provider Entry Model

Date: 2026-05-16

Status: completed

## Goal

Implement the product decision that personal-page, Team/API, policy-only, and deferred sources are separate provider entries instead of one brand-level provider with a mutable source preference.

## Scope

- Added source-level provider ids for Cursor, Claude Code, Codex, Gemini, and JetBrains entries.
- Added a provider brand/source definition registry so source entries still share brand metadata where useful.
- Migrated legacy brand-level provider settings, provider order, quota item preferences, toolbar badge/icon preferences, and provider secrets to source-level ids.
- Updated provider adapters to run through source-level registry wrappers with fixed source families per entry.
- Updated Quick Setup so personal/page/policy entries show by default and Team/API entries require an explicit reveal control.
- Updated Provider Display eligibility so only display-enabled, eligible source entries enter ordering and quota-item controls.

## Preserved Boundaries

- No new provider support claims were added.
- Raw provider evidence, diagnostic raw bodies, archive/export payloads, and store claims remain unchanged.
- Chrome permissions and manifest host claims remain unchanged.
- Deferred JetBrains state remains outside default display ordering.
- Gemini remains policy-only and must not imply live remaining quota.

## Acceptance

- `ProviderSetting.displayEnabled` is the runtime display switch; legacy `enabled` is migration input only.
- `codex-personal-page` and `codex-enterprise-api` can coexist without overriding each other.
- `cursor-personal-page` and `cursor-team-api` can coexist without overriding each other.
- `claude-code-team-page` and `claude-code-admin-api` can coexist without overriding each other.
- Quick Setup does not require Advanced/Developer/Debug display level to reach common personal setup.
- Popup/sidebar/full-page ordering consumes the same display-enabled source-entry list exposed by Provider Display.

## Planned Verification

- `npm run test -- src/shared/storage.test.ts src/shared/display-preferences.test.ts src/shared/provider-display-eligibility.test.ts src/background/provider-credentials.test.ts`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `git diff --check`

## Closeout Notes

- Full Vitest coverage passed after storage, adapter, popup, Settings, display-order, and source-control expectations were aligned to source-level provider entries.
- Typecheck, i18n check, build, docs check, and diff whitespace checks passed.
- Runtime source entries intentionally keep personal/page and Team/API paths independent; tests no longer encode the old brand-level source-mode fallback assumptions.

## Follow-Up

- Add a direct Quick Setup CTA from missing API credentials to the matching API credential card.
- Consider a later visual QA pass before packaging a post-RC23 candidate.
