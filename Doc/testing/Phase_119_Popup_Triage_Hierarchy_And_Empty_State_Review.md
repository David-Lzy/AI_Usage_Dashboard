# Phase 119 - Popup Triage Hierarchy And Empty-State Review

Date: 2026-04-23

Process rule:

- follow [Development_Guardrails.md](./Development_Guardrails.md)

## Goal

Tighten the popup information architecture after `Phase 118` by making the featured-provider area truthful in every state:

- `Needs attention` when providers really need action
- `All clear` when visible providers are healthy
- `Current contract` when all visible providers are policy-only
- `Nothing to triage yet` when no visible providers exist

## What Shipped

- one popup featured-section model that drives:
  - section label
  - section headline
  - section supporting copy
  - explicit empty-state copy when no provider cards should render
- one popup UI update so the featured-provider section no longer hardcodes `Needs Attention / Featured providers`
- one explicit empty-state card when no visible providers are enabled, instead of an empty provider list
- additional popup view-model tests for:
  - empty state hierarchy
  - healthy-state hierarchy
  - policy-only hierarchy
  - attention-state hierarchy

## Files

- `src/popup/view-models.ts`
- `src/popup/view-models.test.ts`
- `src/popup/PopupApp.tsx`

## Verification

Executed:

```bash
npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit
npx -y node@22 ./node_modules/vitest/vitest.mjs run
npx -y node@22 ./node_modules/vite/bin/vite.js build
```

Key truthful results:

- popup tests now cover no-provider, healthy, policy-only, and attention hierarchy states
- the popup no longer labels healthy or empty states as `Needs attention`
- this phase did not change badge semantics, provider truth contracts, or popup routing targets

## Not Claimed

- that popup onboarding is fully finished
- that the popup now replaces the side panel
- that store screenshots or listing assets are already updated
