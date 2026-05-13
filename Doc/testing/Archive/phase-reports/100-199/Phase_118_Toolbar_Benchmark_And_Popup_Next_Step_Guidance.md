# Phase 118 - Toolbar Benchmark And Popup Next-Step Guidance

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

## Goal

Start `Direction 06` with one honest benchmark slice and one small popup IA improvement:

- document the current toolbar-first product expectations using current web sources
- ship one compact `Start here / Next step` guidance card in the popup so first-click onboarding is clearer without turning the popup into a second full app shell

## What Shipped

- one benchmark matrix:
  - [Toolbar_Product_Benchmark_Matrix_2026-04-23.md](../../../../Archive/benchmarks/Toolbar_Product_Benchmark_Matrix_2026-04-23.md)
- one popup view-model extension for dynamic next-step guidance:
  - `no visible providers -> open settings`
  - `missing host access -> open settings`
  - `specific blocked provider -> open provider detail`
  - `all visible providers policy-only -> open dashboard`
- one popup UI card that renders that guidance ahead of the lower-level snapshot and featured-provider sections
- unit tests for:
  - no-provider onboarding
  - missing-access guidance
  - healthy-state no-guidance fallback

## Files

- `src/popup/view-models.ts`
- `src/popup/view-models.test.ts`
- `src/popup/PopupApp.tsx`
- `Doc/Archive/benchmarks/Toolbar_Product_Benchmark_Matrix_2026-04-23.md`

## Verification

Executed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run src/popup/view-models.test.ts
npx -y node@22 ./node_modules/vite/bin/vite.js build
```

Key truthful results:

- popup view-model tests now cover first-run and missing-access guidance states
- the popup still stays compact; this phase did not add a second full workflow shell
- this phase did not change badge semantics or provider truth contracts

## Not Claimed

- that the popup is now fully benchmark-competitive
- that store-listing assets are already updated
- that this phase changed data-collection tactics or provider coverage
- that first-run onboarding is complete across both popup and side panel
