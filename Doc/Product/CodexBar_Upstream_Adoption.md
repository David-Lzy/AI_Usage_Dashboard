# CodexBar Upstream Adoption

Date: 2026-07-25

Document class:

- maintained reference

Freshness model:

- review when the pinned upstream commit changes or a CodexBar-derived source
  file is introduced

Status note:

- this document records bounded upstream influence and attribution policy; it
  does not claim that a CodexBar runtime integration is currently shipped

## Purpose

CodexBar is a useful upstream reference for Provider architecture, bounded
normalization, status discovery, and local companion output. AI Usage Dashboard
uses it selectively rather than importing its Provider tree.

The current review is pinned to
[`steipete/CodexBar@cc8da27cec92029a6435bfee4a703a719290234e`](https://github.com/steipete/CodexBar/tree/cc8da27cec92029a6435bfee4a703a719290234e),
licensed under MIT by Peter Steinberger and CodexBar contributors.

## Adoption Rules

- Architecture concepts may be independently reimplemented when they fit this
  extension's existing Provider contracts.
- Endpoint or field discoveries remain protocol leads until independently
  verified against an official Provider source owned by the tester.
- Copied or translated source must use a pinned upstream path, a provenance
  header, and a complete entry in [Third-Party Notices](../../THIRD_PARTY_NOTICES.md).
- Synthetic tests may reproduce boundary cases, but raw upstream account
  fixtures, cookies, headers, page bodies, local paths, and identities are not
  imported.
- Provider support is based on locally verified source truth, not on CodexBar's
  provider count or support claims.

## Browser Boundary

The extension does not adopt CodexBar implementations that depend on Keychain,
decrypted browser-cookie databases, Full Disk Access, WKWebView, PTY,
subprocesses, Provider CLI discovery, or scanning local logs and configuration.
Those capabilities are unavailable or inappropriate inside a browser extension.

When separately installed local software is useful, it must remain behind the
[Experimental Local Companion Bridge](./Local_Companion_Bridge.md). The
extension must not install, launch, discover, or control that software.

## Current Disposition

- Provider descriptor and ordered strategy architecture: concept reference;
  the local TypeScript contracts are independently implemented.
- Official service-status endpoints: protocol discovery lead, independently
  reverified against official vendor domains.
- Pace, reset-window, Claude, Cursor, and Codex parsing helpers: reviewed but
  not adopted because equivalent local code already enforces this project's
  source semantics and privacy boundaries.
- `codexbar serve` dashboard snapshot: eligible only as an explicit,
  authenticated loopback Bridge integration after browser access and schema
  validation pass.
- Platform-specific credential, CLI, WebView, cookie-database, and filesystem
  code: rejected for in-extension adoption.

No Provider parser, normalizer, fixture, or Bridge implementation currently
contains copied or translated CodexBar source code.

## Notice Plan

`config/provider-upstream-provenance.json` is the machine-checked adoption
ledger. `npm run provider:quality` enforces the required pinned commit,
classification, local destination, and independent-verification fields. If a
future change copies or translates CodexBar code, that change must also:

1. preserve the upstream MIT copyright and license text;
2. add a stable notice ID to `THIRD_PARTY_NOTICES.md`;
3. add the same `Upstream-Notice` ID to each derived local source file; and
4. name a maintainer responsible for checking future upstream changes.
