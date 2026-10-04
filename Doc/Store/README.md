# Store Documentation

Date: 2026-10-04

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this directory holds public Chrome Web Store listing copy and localization source material
- personal upload handoffs, screenshot capture notes, package hashes, and submission receipts live in ignored `.local/` history

## Current Submission Copy

The product-description files are the maintained 0.2.2 Store submission copy.
GitHub 0.2.2 is released. After the initial review rejected a long brand list
as keyword stuffing, all 14 description fields were corrected and the existing
tag package was resubmitted on 2026-10-04 UTC without another ZIP upload.
The authenticated API reports `PENDING_REVIEW`
for manifest `0.2.2.0`; it is not yet a public Store release. Version 0.2.1
was confirmed published through the authenticated API and public listing on
2026-10-04 UTC. The descriptions use a short abstract first
because the store UI folds the description after the opening lines. The five
saved locale screenshot sets and the global English fallback use explicit
illustrative QA data captured from the current extension; they do not present
simulated balances as live account values. The saved copy for other Store
locales uses the updated English overview and global screenshots, except
Traditional Chinese, which has its own updated overview. All 14 descriptions,
the five localized screenshot sets, global screenshots and aligned Store icon
were verified before the initial review request. The description-only correction
retains the functionality and data-boundary explanations; images, package and
permissions are unchanged. Existing matching promotional
tiles were preserved. Saved submission metadata is not yet live listing metadata.

- [English product description](./Chrome_Web_Store_Product_Description_en-US.md)
- [Simplified Chinese product description](./Chrome_Web_Store_Product_Description_zh-CN.md)
- [Traditional Chinese product description](./Chrome_Web_Store_Product_Description_zh-TW.md)
- [Japanese product description](./Chrome_Web_Store_Product_Description_ja.md)
- [Latin American Spanish product description](./Chrome_Web_Store_Product_Description_es-419.md)
- [Brazilian Portuguese product description](./Chrome_Web_Store_Product_Description_pt-BR.md)
- [0.2.2 update notes](./Chrome_Web_Store_Update_Notes_0.2.2.md)
- [Historical 0.2.1 update notes](./Chrome_Web_Store_Update_Notes_0.2.1.md)

## Source References

- [Store listing copy pack](./Store_Listing_Copy_Pack.md)
- [Store listing localization source pack](./Store_Listing_Localization_Source_Pack.md)
- [Store listing localization 14-locale draft](./Store_Listing_Localization_14_Locale_Draft.md) - auxiliary broader-locale draft, not the primary upload copy.
- [Chrome Web Store publication milestone](./Chrome_Web_Store_Publication_Milestone.md)
- [GitHub release push and notes guide](./GitHub_Release_Push_And_Notes.md)

## Listing Copy Guardrails

Describe functionality and source limitations in context, not long lists of
supported brands or search keywords. Keep the detailed coverage table in the
[project documentation](../../README.md#supported-sources). Review every locale,
including English fallback fields, when updating copy. The
[official spam FAQ](https://developer.chrome.com/docs/webstore/program-policies/spam-faq)
and [keyword-stuffing guidance](https://developer.chrome.com/docs/webstore/troubleshooting#keyword-stuffing)
apply to listing metadata even when the named sources are genuinely supported.

Keep product and provider names unchanged. Do not strengthen partial,
window-scoped, policy-only, or unavailable provider claims during translation.
