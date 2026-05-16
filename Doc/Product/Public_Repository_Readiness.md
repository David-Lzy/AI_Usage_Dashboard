# Public Repository Readiness

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file records the current public-repository readiness review for the next Chrome Web Store handoff
- refresh it before making the GitHub repository public or before materially changing store permissions, privacy text, or license metadata

## Summary

The repository is feasible to make publicly readable with the current AGPL-3.0-only license, as long as the public source remains available and the store listing points users to the source, privacy policy, and support/security paths.

This is an engineering readiness review, not legal advice. For a commercial or organizational release, have the license and privacy text reviewed by someone qualified to give legal advice.

## Current License State

- package metadata:
  - `license: AGPL-3.0-only`
- repository license file:
  - [LICENSE](../../LICENSE)
- manifest homepage:
  - `https://github.com/David-Lzy/AI_Usage_Dashboard`
- source URL:
  - `https://github.com/David-Lzy/AI_Usage_Dashboard`

AGPL-3.0-only is workable for a public Chrome extension project. It is a strong copyleft license; modified redistributed versions and network-service use cases have source-availability obligations. That is consistent with a public repository and a store listing that tells users where the source lives.

## Public-Readiness Additions

Added tracked root documents:

- [CONTRIBUTING.md](../../CONTRIBUTING.md)
- [SECURITY.md](../../SECURITY.md)
- [PRIVACY.md](../../PRIVACY.md)

These give public visitors a basic contribution path, vulnerability-reporting path, and plain-language privacy boundary.

## Secret Scan

Command run on 2026-05-16:

```sh
rg -n "(AIza[0-9A-Za-z_-]{20,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|BEGIN (RSA|OPENSSH|PRIVATE) KEY)" --glob '!node_modules/**' --glob '!dist/**' --glob '!release/**' .
```

Result:

- no matches

This does not prove the repository is free of all sensitive information. It confirms that the common high-risk token/key patterns above were not found outside ignored build/package directories.

## Chrome Store Permission Notes

- `favicon`:
  - used for the provider-matched toolbar icon feature
  - store privacy text should say it is used to display provider icons, not to collect browsing history
- `storage`:
  - used for settings, optional credentials, page bindings, cached snapshots, and import/export state
- `tabs`, `scripting`, optional host permissions:
  - used for supported provider page capture and source binding after the user grants access
- no remote executable code:
  - runtime scripts are packaged with the extension build

## Public Store Handoff

- six-language store listing handoff:
  - [Store_Public_Release_6_Locale_Handoff.md](../Store/Store_Public_Release_6_Locale_Handoff.md)
- refreshed screenshot evidence:
  - [2026-05-16-public-store-readiness-request-archive](../testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/README.md)
- current screenshot selection:
  - [Store_Screenshot_Selection_Pack.md](../Store/Store_Screenshot_Selection_Pack.md)

## Remaining Manual Work

- Confirm the GitHub repository visibility change in GitHub UI.
- Enable GitHub private vulnerability reporting if available.
- Add the store privacy-policy URL once the public repository URL is live.
- Do a human pass on the six localized listing texts before submitting to Chrome Web Store.
- Capture a separate true light-mode or split light/dark promo image if the store listing should emphasize theme switching beyond the dark-mode screenshot set.
