# GitHub Release Push And Notes Guide

Date: 2026-05-26

Document class:

- maintained release reference

Freshness model:

- update when package naming, release automation, or store handoff policy changes

Status note:

- this is the public guide for GitHub Actions package publishing and release notes
- private upload receipts, local package hashes, browser profile notes, and operator handoff details stay out of the public repository

## Release Flow

Pushes to `main` are for continuous validation. They run tests, build Chrome
and Firefox packages, and upload temporary workflow artifacts. These artifacts
are useful for review and manual testing, but they are not a public versioned
release by themselves.

Version tags are for public GitHub Releases. Push a tag only after the version
is ready to publish:

```sh
git push origin main
git tag v0.1.0-rc.26
git push origin v0.1.0-rc.26
```

The tag must match `package.json` exactly after removing the leading `v`. For
example, `package.json` version `0.1.0-rc.26` must use tag `v0.1.0-rc.26`.
If they do not match, the release workflow must fail rather than publishing a
misnamed package.

When a matching tag already exists, a later `main` push refreshes that release's
assets and notes from the current workflow template. This keeps browser-specific
asset names and generated release notes aligned with the latest publishing
rules for the current package version.

## Package Asset Names

GitHub Release assets must make the browser target explicit:

- Chrome: `ai-usage-dashboard-chrome-<package-version>.zip`
- Firefox local beta: `ai-usage-dashboard-firefox-<package-version>.zip`
- Checksums: `SHA256SUMS.txt`

The Chrome package is intended for Chrome Web Store upload, review, or manual
developer-mode testing after extracting the zip.

The Firefox package is an unsigned local beta generated from the Firefox
manifest transform. Ordinary Firefox installation needs a signed AMO or
self-distribution package in a future release flow.

Do not commit generated package outputs from `dist/` or `release/`.

## Release Notes Template

Use this structure for generated or manually edited GitHub Release notes:

```md
## AI Usage Dashboard <package-version>

Release candidate package for manual review, extension-store handoff, and browser-specific testing.

### Downloads

- Chrome: `ai-usage-dashboard-chrome-<package-version>.zip`
  - Use this zip for Chrome Web Store upload, review, or manual developer-mode testing after extracting it.
- Firefox local beta: `ai-usage-dashboard-firefox-<package-version>.zip`
  - Unsigned local beta package generated from the Firefox manifest transform. Normal Firefox installation still needs a signed AMO/self-distribution package.
- Checksums: `SHA256SUMS.txt`

### Notes

- Chrome Web Store remains the recommended install path for everyday Chrome users.
- This release includes <short user-facing highlights>.
```

Keep the notes short and user-facing. Good highlights include visible UI polish,
new settings, supported package automation, or important bug fixes. Avoid
listing internal phase numbers, private TODO names, local machine paths,
operator notes, screenshot evidence, upload receipts, or personal review
history.

## Claim Boundaries

Release notes must not strengthen provider claims beyond the public provider
source-truth docs. If a provider is partial, window-scoped, policy-only, or
unavailable, describe it with the same conservative language used in the public
README and provider notes.

Do not imply that the GitHub Firefox zip is signed for normal installation until
the AMO signing flow exists and is verified.
