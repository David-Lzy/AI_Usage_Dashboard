# GitHub Release Push And Notes Guide

Date: 2026-05-26

Document class:

- maintained release reference

Freshness model:

- update when package naming, release automation, or store handoff policy changes

Status note:

- this is the public guide for GitHub Actions package publishing, Chrome Web
  Store API submission, and release notes
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

Release assets are tag-scoped: Chrome and Firefox package zips attached to a
GitHub Release should come from the version tag workflow, not a later `main`
commit with the same package version.

When a matching tag and GitHub Release already exist, a later `main` push may
refresh the release notes from the current workflow template, but it must not
re-upload public package assets built from `main`.

## Chrome Web Store API Submission

The tag workflow uploads the Chrome package to the Chrome Web Store and submits
it for review automatically after the package build succeeds. Creating a
version tag is therefore also the explicit store-submission action. This uses
the Chrome Web Store API v2 with a Google Cloud service account linked to the
publisher account.

Required GitHub Actions repository variable values:

- `CWS_PUBLISHER_ID`: the Chrome Web Store publisher ID.
- `CWS_EXTENSION_ID`: the public extension ID.

Required GitHub Actions repository secret:

- `CWS_SERVICE_ACCOUNT_JSON`: the full JSON key for the linked service account.

If any required repository variable or secret is missing, the workflow skips
the Chrome Web Store handoff with an Actions notice. The GitHub Release and its
browser packages still complete successfully; the missing store configuration
must be fixed before a later automated submission can run.

Optional GitHub Actions repository variable values:

- `CWS_PUBLISH_TYPE`: `DEFAULT_PUBLISH` by default. Use `STAGED_PUBLISH` when
  the reviewed submission should wait for a later manual publish action.
- `CWS_DEPLOY_PERCENTAGE`: optional integer from `0` to `100` for the initial
  rollout percentage.
- `CWS_BLOCK_ON_WARNINGS`: defaults to `true`, causing API warnings to fail the
  submission instead of being ignored.

Manual workflow runs expose a `submit_chrome_web_store` checkbox. Use it only
when the current package version is ready for Chrome Web Store review.

Chrome Web Store API submission does not bypass review. The `publish` call
submits the uploaded package for review; public availability still follows the
store review result and the listing's existing visibility settings.

Do not commit service-account JSON, upload receipts, package hashes, or Chrome
Web Store account screenshots.

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
