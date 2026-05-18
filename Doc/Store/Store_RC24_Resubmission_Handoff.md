# Store RC24 Resubmission Handoff

Date: 2026-05-18

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the manual Chrome Web Store handoff for `0.1.0-rc.24`
- final Chrome Web Store upload is a human action

## Upload Package

- package version: `0.1.0-rc.24`
- Chrome manifest version: `0.1.0.24`
- zip: `release/ai-usage-dashboard-0.1.0-rc.24.zip`
- SHA256: `ea5d865c119b69bab46e93f9e29ea04c58ebd7a4b6893a036262b1ebf91a0a85`
- public source: https://github.com/David-Lzy/AI_Usage_Dashboard
- current store page: https://chromewebstore.google.com/detail/ai-usage-dashboard/mjfhaifoapcpbkffacidgjijcpiegjea

## Primary Listing Languages

- English: [Chrome_Web_Store_Product_Description_en-US.md](./Chrome_Web_Store_Product_Description_en-US.md)
- Simplified Chinese: [Chrome_Web_Store_Product_Description_zh-CN.md](./Chrome_Web_Store_Product_Description_zh-CN.md)
- Traditional Chinese: [Chrome_Web_Store_Product_Description_zh-TW.md](./Chrome_Web_Store_Product_Description_zh-TW.md)
- Japanese: [Chrome_Web_Store_Product_Description_ja.md](./Chrome_Web_Store_Product_Description_ja.md)

Optional draft locales retained for later upload work:

- [Chrome_Web_Store_Product_Description_es-419.md](./Chrome_Web_Store_Product_Description_es-419.md)
- [Chrome_Web_Store_Product_Description_pt-BR.md](./Chrome_Web_Store_Product_Description_pt-BR.md)

## Screenshot Assets

Use the current selected assets from [Store_Screenshot_Selection_Pack.md](./Store_Screenshot_Selection_Pack.md):

- `01-popup-quick-glance.png`
- `02-dashboard-overview.png`
- `03-provider-detail-contract.png`
- `04-settings-overview-and-theme.png`
- `05-settings-quick-setup-and-appearance.png`

Current archive:

- [2026-05-16-public-store-readiness-request-archive](../testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/README.md)

Boundary:

- screenshots are real extension runtime captures resized/cropped to `1280x800`
- dark-mode screenshot baseline remains acceptable for RC24
- light/dark split promotional image is a follow-up, not a blocker

## Permission Explanation

- `storage`: settings, cached snapshots, and optional local credentials.
- `alarms`: scheduled provider refresh and badge rotation.
- `tabs`, `scripting`, optional host permissions: supported signed-in provider page capture after user grant.
- `sidePanel`: dashboard and detail surface.
- `favicon`: optional provider-matched toolbar icon.

## Change Summary Since Store Version

- Public repository is now available under AGPL-3.0-only.
- Runtime UI supports 14 locales; store upload primary copy is prepared for 4 languages.
- Popup, side panel, full-page dashboard, Settings, toolbar badge, toolbar icon, provider display order, quota item controls, and configuration backup have received follow-up polish.
- Provider source labels and support boundaries remain conservative.

## Manual Upload Checklist

1. Upload `release/ai-usage-dashboard-0.1.0-rc.24.zip`.
2. Update listing copy for the four primary languages.
3. Upload the five selected screenshots.
4. Add the `favicon` permission reason from this handoff if Chrome Web Store asks.
5. Save the Chrome Web Store draft or submission receipt as a future milestone.

## Verification Snapshot

- `npm run release:check` passed.
- `npm run release:package` passed.
- zip manifest inspection confirmed `0.1.0.24` / `0.1.0-rc.24`, 14 locale catalogs, stable extension entries, and icon assets.
