# Provider Authoring Guide

Date: 2026-07-25

Document class:

- maintained technical reference

Freshness model:

- update whenever Provider descriptors, source contracts, permissions, or
  graduation gates change

Status note:

- this is the contributor entry point for adding or changing a Provider source
  entry
- a descriptor, card, or upstream implementation is not evidence that a source
  is supported

## Purpose

Provider work crosses source truth, browser permissions, credential handling,
normalization, localization, and product display. This guide makes those
requirements explicit and machine-checkable. Read it with:

- [Provider Setup And Display Product Contract](./Provider_Setup_Display_Product_Contract.md)
- [Raw Provider Source Truth Policy](../I18n/I18n_Raw_Provider_Source_Truth_Policy.md)
- [Privacy Policy](../../PRIVACY.md)
- [Security Policy](../../SECURITY.md)
- [Provider test notes](../testing/README.md)

Run `npm run provider:quality` before sending Provider changes.

## Source Entry Workflow

1. Define one stable source-entry ID. Personal page, Team/Admin API, policy,
   and deferred sources remain separate entries even when they share a brand.
2. Record the source contract in `src/shared/constants.ts`: rollout stage,
   connection mode, route hints, field availability, truthful partial-data
   wording, and any graduation gate.
3. Add a descriptor in `src/providers/provider-definitions.ts`. Start all
   unimplemented capabilities as `false`. A capability means code exists; it
   does not mean the current account or snapshot has matching data.
4. Connect the descriptor to an existing typed adapter owner or add a bounded
   adapter. The registry dispatches; it must not parse protocols or invent a
   second fallback path.
5. Add the source entry to `config/provider-authoring-matrix.json`, including
   its adapter test, Provider note, i18n policy, host-access contract, and
   display eligibility.
6. Add normalized contract tests, malformed-response tests, previous-result
   preservation tests, and credential/diagnostic redaction tests. Reusable
   assertions live in `src/providers/testing/provider-contract-harness.ts`.
7. Update the matching file in `Doc/provider_notes/`, user-facing localized
   copy, optional host permission coverage, and display eligibility tests.
8. Graduate the source only after the gates below pass. Do not make Provider
   count a release metric.

The descriptor scaffold is
`templates/provider/provider-descriptor.template.ts.txt`. It is intentionally a
text template so a placeholder Provider cannot enter the build or registry.

## Fixture Contract

Use `templates/provider/sanitized-fixture.template.json` as a shape example.
A checked-in Provider fixture must:

- be no larger than 128 KiB unless a smaller protocol-specific limit applies
- contain only fields required to exercise the parser or normalizer
- replace timestamps and opaque IDs with deterministic synthetic values
- remove cookies, authorization headers, bearer tokens, API keys, refresh
  tokens, email addresses, workspace/account/user IDs, and request metadata
- omit raw page bodies, hydration documents, unrelated API fields, and
  screenshots of private account data
- preserve boundary cases without preserving a real user's payload
- state in the test or adjacent note how it was sanitized

Fixtures are not raw evidence archives. If a parser needs a large real response
to work, first reduce the parser contract to a bounded structured subset.

## Upstream Adoption Policy

Classify every upstream influence in
`config/provider-upstream-provenance.json`:

- `concept-only`: architecture or behavior was understood, then independently
  implemented without translating source expressions
- `copied`: source text or a bounded implementation was copied
- `translated/derived`: source was translated between languages or materially
  adapted while preserving implementation expression
- `protocol lead`: an endpoint or field candidate was discovered upstream and
  independently verified against the Provider
- `bridge`: an external local program remains separately installed and is
  consumed through a reviewed protocol
- `rejected`: the candidate was reviewed and deliberately not adopted

License compatibility does not authorize an undocumented Provider endpoint.
Every protocol still needs independent verification against an official API,
an authenticated session owned by the tester, or maintained Provider
documentation. Never bulk-import an upstream Provider directory or fixture
corpus.

For `copied` and `translated/derived` entries, the ledger must include:

- repository URL and upstream file path
- full pinned commit hash
- copyright holder and license
- local destination and modification summary
- maintenance owner
- stable third-party notice ID

The local source must carry a concise provenance header with that notice ID,
and [Third-Party Notices](../../THIRD_PARTY_NOTICES.md) must preserve the
copyright and license notice. `npm run provider:quality` blocks copied or
derived code without all three records.

Platform-specific Keychain, cookie-database, Full Disk Access, subprocess,
PTY, or local-file implementations cannot be copied into the extension. Such
capabilities require the separately reviewed Local Companion Bridge and an
explicit `bridge` record.

## Graduation Gates

### Deferred To Planned

- the source has a documented user problem and accountable maintainer
- its proposed protocol, connection mode, privacy boundary, and required host
  origin are identified
- no user-visible card claims live support

### Planned To Shipped

- the contract was independently verified and has a sanitized regression case
- descriptor, registry, source blueprint, matrix, i18n, Provider note, host
  access, adapter tests, and display eligibility agree
- malformed, partial, unauthorized, rate-limited, and unavailable responses
  degrade without fabricated zero values
- a failed refresh preserves the last valid bounded result where applicable
- credentials and diagnostics pass redaction checks
- required permissions remain optional and are requested only from a user
  action unless the existing public contract explicitly permits otherwise
- all advertised capabilities have normalized output and surface tests
- `npm run provider:quality`, documentation, i18n, typecheck, tests, and builds
  pass

Removing a graduation gate requires evidence; changing a descriptor alone is
not graduation.

## Review Checklist

- Definition: stable source ID, brand, audience, connection mode, fixed source
  family, safe defaults.
- Registry: one descriptor maps to one typed adapter owner.
- Capability: flags match implemented normalized behavior.
- Source truth: exact, partial, policy-only, and unavailable fields remain
  distinguishable.
- i18n: application copy is localized; raw Provider labels remain bounded and
  are never presented as trusted instructions.
- Documentation: Provider note and product contract match runtime behavior.
- Host access: route hints are covered by optional origins; no new required
  permission is introduced silently.
- Tests: success, partial data, failure preservation, diagnostics, and secret
  redaction are covered.
- Display: only shipped truthful states become display-eligible; deferred
  entries remain out of ordering and quota controls.
- Upstream: provenance classification, pinned source, license, notice, and
  maintenance ownership are complete when applicable.
