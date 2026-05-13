# I18n Localization Copy Chunk Size Audit

Date: 2026-05-14

Process rule:

- follow [../Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- created by Phase 408 after the operator-workspace and store-helper 14-locale copy slices
- refresh this file when localization copy ownership, route loading, or build chunk output changes materially

## Summary

The current build warning is acceptable for the next maintenance package. The only chunk above Vite's default `500 kB` raw warning threshold is the side-panel entry. Its gzip size is still modest for an unpacked extension page, and reducing it safely would require route-level lazy loading rather than a small copy-only edit.

Recommended action:

1. No runtime change in Phase 408.
2. Keep Phase 409 and Phase 410 focused on presentation boundaries; do not treat them as bundle-size fixes.
3. If bundle size becomes a release blocker, create one later implementation phase that lazy-loads debug/helper route code from the side-panel entry.

## Build Output Snapshot

Captured with `npm run build` on 2026-05-14.

| Asset | Raw size | Gzip size | Notes |
| --- | ---: | ---: | --- |
| `dist/assets/sidepanel.js` | `586.44 kB` | `141.07 kB` | Vite warning after stable-file rewrite; printed as `dist/assets/index.html2.js` before rename |
| `dist/assets/usage-progress.js` | `319.73 kB` | `93.34 kB` | shared runtime/support chunk |
| `dist/assets/message-bus.js` | `281.41 kB` | `68.07 kB` | shared message/provider infrastructure |
| `dist/assets/popup.js` | `163.93 kB` | `39.85 kB` | below warning threshold |
| `dist/assets/action-badge.js` | `3.95 kB` | `1.53 kB` | below warning threshold |
| `dist/assets/service-worker.js` | `2.76 kB` | `1.03 kB` | below warning threshold |

Build warning recorded:

```text
(!) Some chunks are larger than 500 kB after minification.
```

## Source Copy Size Snapshot

The table below uses TypeScript source byte counts and gzip as a practical proxy. It does not claim exact minified Rollup contribution because the current build does not emit sourcemaps or a bundle visualizer report.

| File | Raw bytes | Gzip bytes | Lines | Main consumer |
| --- | ---: | ---: | ---: | --- |
| `src/shared/popup-localized-copy.ts` | `179,235` | `38,972` | `2,799` | popup entry plus popup view-model helpers |
| `src/shared/operator-workspace-localized-copy.ts` | `139,333` | `30,825` | `2,609` | side-panel debug/helper operator routes |
| `src/shared/settings-core-localized-copy.ts` | `74,263` | `18,427` | `1,599` | side-panel Settings |
| `src/shared/provider-source-display-extended-localized-copy.ts` | `73,099` | `15,631` | `1,636` | popup and side-panel provider source display |
| `src/shared/store-workflow-localized-copy.ts` | `71,551` | `16,432` | `1,099` | side-panel store screenshot helper routes |
| `src/shared/provider-detail-extended-localized-copy.ts` | `51,631` | `10,841` | `1,187` | side-panel Provider Detail |
| `src/shared/settings-source-permissions-localized-copy.ts` | `41,597` | `8,441` | `1,112` | side-panel Settings source/permissions |
| `src/shared/runtime-message-catalog-data/overrides-latin.ts` | `37,938` | `7,694` | `584` | shared runtime message catalog |
| `src/shared/settings-credentials-localized-copy.ts` | `34,124` | `6,429` | `520` | side-panel Settings credentials |
| `src/shared/runtime-message-catalog-data/overrides-other.ts` | `33,529` | `7,294` | `468` | shared runtime message catalog |
| `src/shared/runtime-message-catalog-data/overrides-cjk.ts` | `31,790` | `7,784` | `497` | shared runtime message catalog |
| `src/shared/settings-localized-copy.ts` | `24,556` | `7,067` | `542` | Settings copy aggregator |
| `src/shared/runtime-message-catalog-data/base.ts` | `13,679` | `3,157` | `264` | English runtime message catalog |
| `src/shared/provider-detail-localized-copy.ts` | `8,880` | `2,710` | `222` | Provider Detail copy aggregator |
| `src/shared/provider-source-display-localized-copy.ts` | `6,444` | `2,402` | `171` | provider-source copy aggregator |
| `src/shared/runtime-message-catalogs.ts` | `1,328` | `444` | `35` | runtime catalog public entry |
| `src/shared/localized-copy.ts` | `764` | `279` | `18` | compatibility re-export entry |

Total measured localization/catalog source:

- files: `17`
- raw bytes: `823,741`
- gzip bytes: `184,829`
- lines: `15,362`

## Phase 404/405 Source Delta

Compared against commit `0d2279d`, the last pre-implementation inventory commit before Phase 404 and Phase 405:

| File | Before raw | Current raw | Raw delta | Before gzip | Current gzip | Gzip delta |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `src/shared/operator-workspace-localized-copy.ts` | `17,923` | `139,333` | `+121,410` | `5,572` | `30,301` | `+24,729` |
| `src/shared/store-workflow-localized-copy.ts` | `9,779` | `71,551` | `+61,772` | `3,135` | `16,021` | `+12,886` |
| Combined | `27,702` | `210,884` | `+183,182` | `8,707` | `46,322` | `+37,615` |

This explains a meaningful part of the side-panel raw chunk warning, but it is not by itself a release blocker.

## Import Path Findings

- `src/shared/localized-copy.ts` is a compatibility re-export surface. It is intentionally small and should stay stable.
- The popup imports popup copy and provider-source display copy. It does not need operator-workspace or store-helper copy for normal popup rendering.
- The side-panel entry statically contains both standard routes and special debug/helper routes. That means operator-workspace copy and store-helper copy are currently part of the side-panel build even though they are used only by `#debug-interaction-audit`, `#debug-theme-recovery-review`, `#debug-store-screenshot-seed`, and `#debug-native-popup-probe`.
- Phase 409 and Phase 410 presentation splits may improve ownership and future edit safety, but they should not be expected to materially reduce the current side-panel chunk unless they introduce dynamic import boundaries.

## Ranked Recommendations

1. `No-op for the current release boundary`
   - The side-panel chunk is above Vite's raw warning threshold but still about `141 kB` gzip.
   - The extension page loads locally from the unpacked extension package, not over a slow remote page request.
   - Phase 406 release gate and Phase 407 RDP route captures already passed with the current chunk shape.

2. `Later route-level lazy loading if size becomes a blocker`
   - Highest-value split boundary: special debug/helper routes under `src/sidepanel/special-route-app.tsx`.
   - Candidate moved payload: operator-workspace helper copy plus store-helper copy, currently about `210,884` raw source bytes and `46,322` gzip source bytes before minification.
   - Narrow write scope would be:
     - `src/sidepanel/App.tsx` or route bootstrap ownership
     - `src/sidepanel/special-route-app.tsx`
     - special-route tests
     - RDP helper route smoke checks
   - The implementation must preserve route hashes, automation titles, seeded store state timing, runtime locale query overrides, and native popup probe behavior.

3. `Do not split by removing locales`
   - Locale removal would violate the current 14-locale product target.
   - It would reduce source size but undermine the i18n contract and user-requested scope.

## Decision

No Phase 408 runtime change is justified. Keep the current build warning recorded and proceed to Phase 409/410. If a future release gate decides the raw side-panel warning must be eliminated, create a new implementation TODO focused on lazy-loading special debug/helper routes rather than changing catalog content.

## Verification

- `npm run build`
- source byte/gzip audit for localized copy and runtime catalog modules
- `npm run docs:check`
- `git diff --check`
