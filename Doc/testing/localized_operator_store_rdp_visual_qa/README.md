# Localized Operator Store RDP Visual QA

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Document class:

- maintained evidence index

Freshness model:

- maintained index over frozen snapshots

Status note:

- this directory records localized extension-mode visual QA evidence for operator-workspace and store-helper routes
- each dated child directory is a frozen snapshot package

## Snapshot Packages

- [2026-05-14-phase407](./2026-05-14-phase407/README.md) - representative `en`, `zh-CN`, `ja`, `de`, and `ar` RDP Chrome captures for interaction audit, theme recovery, store screenshot seed, and native popup probe helper routes.

## Scope

- screenshots come from the real RDP Chrome unpacked extension runtime
- locale forcing uses the route-local `app-locale` query parameter
- evidence packages may include cleanup captures when helper routes mutate runtime seed state

## Boundary

- this is layout and obvious-copy QA evidence, not professional translation review
- helper-route screenshots are not final Chrome Web Store screenshot assets
- raw provider evidence, request ids, archive schemas, preset ids, route hashes, and automation titles stay outside translation scope
