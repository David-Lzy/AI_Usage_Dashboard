# Phase 491 - Public Repository Readiness Review

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- closed evidence

Status:

- completed

## Goal

Check whether the current AGPL-3.0-only repository state is suitable for making the GitHub project public, and add the minimal public-facing repository docs needed before store handoff.

## Scope

- Review current license metadata, manifest homepage, and source URL.
- Add public repository root docs:
  - `CONTRIBUTING.md`
  - `SECURITY.md`
  - `PRIVACY.md`
- Add [Public_Repository_Readiness.md](../../../../Product/Public_Repository_Readiness.md) as the maintained readiness note.
- Run a narrow token/key pattern scan outside build/package directories.

## Preserved Boundaries

- Do not change the license choice.
- Do not change runtime permissions, provider support, storage schema, or release package bytes.
- Do not give legal advice; record engineering readiness and handoff notes only.

## Acceptance

- AGPL-3.0-only feasibility is documented with a clear non-legal-advice caveat.
- Privacy, security, and contribution entry points are present in tracked repository files.
- The `favicon` permission rationale is documented for store privacy review.
- A narrow sensitive-token scan result is recorded.

## Verification

- `rg -n "(AIza[0-9A-Za-z_-]{20,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|BEGIN (RSA|OPENSSH|PRIVATE) KEY)" --glob '!node_modules/**' --glob '!dist/**' --glob '!release/**' .`
- `npm run docs:check`
- `git diff --check`

## Follow-Up

- Enable GitHub private vulnerability reporting after the repository is public if the account settings support it.
- Add the final public privacy-policy URL in Chrome Web Store dashboard after confirming the repository URL.
