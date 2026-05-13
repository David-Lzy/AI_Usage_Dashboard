# Phase 407 Localized Operator Store RDP Visual QA

Date: 2026-05-14

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this package records the Phase 407 representative RDP Chrome visual QA pass for newly localized operator-workspace and store-helper copy
- it is a layout and obvious-copy snapshot, not a professional translation signoff

## Capture Scope

- runtime source:
  - `RDP Chrome unpacked extension`
- detected extension id:
  - `gkjioiklbdjcknhdglaehbeofkjmmdpc`
- detected browser:
  - `Chrome 147.0.7727.101`
- detected profile:
  - `/home/davidli/.config/google-chrome/Default`
- detected display:
  - `:10.0`
- representative locales:
  - `en`
  - `zh-CN`
  - `ja`
  - `de`
  - `ar`
- manifest:
  - [capture-manifest.json](./capture-manifest.json)

## Captured Routes

- `interaction-audit`
  - route: `src/sidepanel/index.html?surface=full-page#debug-interaction-audit`
  - expected title: `AI Usage Dashboard`
- `theme-recovery`
  - route: `src/sidepanel/index.html?surface=full-page#debug-theme-recovery-review`
  - expected title: `AI Usage Dashboard`
- `native-popup-probe`
  - route: `src/sidepanel/index.html?surface=full-page#debug-native-popup-probe`
  - expected title: `AI Usage Dashboard Native Popup Probe`
- `store-seed`
  - route: `src/sidepanel/index.html?surface=full-page&preset=toolbar-first-quick-glance#debug-store-screenshot-seed`
  - expected title: `AI Usage Dashboard Screenshot Seed Applied`
- cleanup after each locale:
  - route: `src/sidepanel/index.html?surface=full-page&preset=unlock#debug-store-screenshot-seed`
  - expected title: `AI Usage Dashboard Screenshot Seed Cleared`

## Screenshot Matrix

| Locale | Interaction audit | Theme recovery | Native popup probe | Store seed | Cleanup |
| --- | --- | --- | --- | --- | --- |
| `en` | [en-interaction-audit.png](./en-interaction-audit.png) | [en-theme-recovery.png](./en-theme-recovery.png) | [en-native-popup-probe.png](./en-native-popup-probe.png) | [en-store-seed.png](./en-store-seed.png) | [en-cleanup-unlock.png](./en-cleanup-unlock.png) |
| `zh-CN` | [zh_cn-interaction-audit.png](./zh_cn-interaction-audit.png) | [zh_cn-theme-recovery.png](./zh_cn-theme-recovery.png) | [zh_cn-native-popup-probe.png](./zh_cn-native-popup-probe.png) | [zh_cn-store-seed.png](./zh_cn-store-seed.png) | [zh_cn-cleanup-unlock.png](./zh_cn-cleanup-unlock.png) |
| `ja` | [ja-interaction-audit.png](./ja-interaction-audit.png) | [ja-theme-recovery.png](./ja-theme-recovery.png) | [ja-native-popup-probe.png](./ja-native-popup-probe.png) | [ja-store-seed.png](./ja-store-seed.png) | [ja-cleanup-unlock.png](./ja-cleanup-unlock.png) |
| `de` | [de-interaction-audit.png](./de-interaction-audit.png) | [de-theme-recovery.png](./de-theme-recovery.png) | [de-native-popup-probe.png](./de-native-popup-probe.png) | [de-store-seed.png](./de-store-seed.png) | [de-cleanup-unlock.png](./de-cleanup-unlock.png) |
| `ar` | [ar-interaction-audit.png](./ar-interaction-audit.png) | [ar-theme-recovery.png](./ar-theme-recovery.png) | [ar-native-popup-probe.png](./ar-native-popup-probe.png) | [ar-store-seed.png](./ar-store-seed.png) | [ar-cleanup-unlock.png](./ar-cleanup-unlock.png) |

## Visual Review Notes

- `npm run build` passed before captures; Vite kept the existing large-chunk warning for `dist/assets/index.html2.js`, already queued for Phase 408 review.
- The loaded unpacked extension path was detected from the Chrome profile preferences. The session opened fresh extension app windows after the build, but did not automate a `chrome://extensions` reload click.
- `app-locale=ar` routes use the runtime locale direction contract that maps Arabic to `rtl`; the sampled Arabic interaction-audit, theme-recovery, store-seed, and native-popup-probe screenshots show right-to-left page flow and no obvious above-the-fold text/control overlap.
- German interaction-audit long labels were sampled and wrapped without obvious above-the-fold overlap.
- Native popup probe helper pages localize correctly, but the app-window capture reports `Browser window has no toolbar.` This matches the existing native-toolbar boundary for RDP app-window probes and does not replace manual native toolbar popup capture.
- Store seed routes were unlocked after each locale capture so the screenshot runtime lock was not left enabled.

## Verification

- `npm run build`
- RDP Chrome capture matrix:
  - `5` locales
  - `4` target routes per locale
  - `20` target screenshots
  - `5` cleanup screenshots
- `identify` sanity check for screenshot dimensions and non-blank target captures
- sampled visual inspection:
  - [ar-interaction-audit.png](./ar-interaction-audit.png)
  - [ar-theme-recovery.png](./ar-theme-recovery.png)
  - [ar-store-seed.png](./ar-store-seed.png)
  - [ar-native-popup-probe.png](./ar-native-popup-probe.png)
  - [de-interaction-audit.png](./de-interaction-audit.png)
  - [en-interaction-audit.png](./en-interaction-audit.png)

## Follow-Up

- continue with Phase 408 localization copy chunk-size audit
- keep the native popup probe boundary documented separately from final store screenshot assets
