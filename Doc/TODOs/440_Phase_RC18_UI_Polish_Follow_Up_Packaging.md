# Phase 440 - RC18 UI Polish Follow-Up Packaging

Status: queued

## Goal

Package the completed post-RC17 UI polish queue as a new follow-up release candidate only after `Phase 434` through `Phase 439` are completed and verified.

## Scope

- Bump package and Chrome manifest versions from `0.1.0-rc.17` / `0.1.0.17` to the next RC boundary.
- Run the release gate from the completed UI polish source.
- Generate the release zip and record SHA256.
- Add a milestone describing the source boundary, included UI fixes, verification commands, and promotion rule.
- Update maintained current docs so the new RC becomes the packaged follow-up candidate while RC13 remains the submitted Chrome Web Store review boundary until a human resubmission replaces it.

## Preserved Boundaries

- Do not mutate the submitted RC13 Chrome Web Store review milestone.
- Do not claim the new RC has been submitted.
- Do not change provider support claims, host permissions, locale set, store listing copy, or screenshot archives.
- Do not package if `Phase 439` leaves unresolved product-visible regressions.

## Acceptance

- Package and manifest versions are aligned with the new RC version.
- A release zip exists locally and its SHA256 is recorded in a new milestone.
- The release gate passes from the updated source.
- README, top-level TODOs, Roadmap, and phase index describe the new package boundary truthfully.

## Planned Verification

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/<new-rc-zip>.zip`
- `npm run docs:check`
- `git diff --check`
- post-push `npm run build`

## Follow-Up

- If a human decides to replace the pending RC13 Chrome Web Store submission, create a separate submitted-store milestone from the new package boundary.
