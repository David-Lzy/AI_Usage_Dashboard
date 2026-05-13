# Phase 150 - Store Listing Copy Pack From First Archive

Date: 2026-04-24

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this file records the completed `Phase 150` closeout and should not be silently edited after archival except to correct factual mistakes

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

## Goal

Turn the first real archived store screenshot set into one maintained Chrome Web Store copy pack, so future listing work does not drift away from the now-archived extension-mode evidence.

## What Changed

- added one maintained listing-copy source pack:
  - [Store_Listing_Copy_Pack.md](../../../../Store/Store_Listing_Copy_Pack.md)
- anchored that pack to:
  - the first real archived screenshot set
  - the current screenshot storyboard
  - the current toolbar competitive-fit decision matrix
  - the current manifest metadata
- updated the extension manifest description to align with the preferred short description:
  - [src/manifest.json](../../../../../src/manifest.json)
- added one repeatable review:
  - [phase150-store-listing-copy-pack-review.mjs](../../../../../scripts/phase150-store-listing-copy-pack-review.mjs)

## Why This Matters

After `Phase 149`, the repo had one real archived screenshot set but still lacked one maintained store-copy source document.

This slice closes that gap by defining:

- one preferred store title
- one preferred short description
- one overview paragraph
- one feature-bullet set
- one screenshot-to-caption pack
- one explicit claim-guardrail set

all anchored to the first archived screenshot evidence instead of free-floating marketing prose.

## Verification

- `npm run docs:check`
- `npm run phase150:review`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `git diff --check`

## Result

`Direction 10` now has both one real archived screenshot set and one maintained listing-copy pack built from that evidence. The pack still stays honest about scope: it does not promise multilingual support, unsupported provider coverage, or fully live precision where the product still ships policy-only, partial, or window-only contracts.
