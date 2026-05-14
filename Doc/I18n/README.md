# I18n Documentation

Date: 2026-05-14

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this directory holds localization architecture, message contracts, and source-truth policy docs
- update this index when i18n reference docs are added, moved, or archived

## Current References

- [Message ID Contract](./I18n_Message_ID_Contract.md)
- [String Inventory Baseline](./I18n_String_Inventory_Baseline.md)
- [Deeper Runtime Copy Backlog](./I18n_Deeper_Runtime_Copy_Backlog.md)
- [Raw Provider Source Truth Policy](./I18n_Raw_Provider_Source_Truth_Policy.md)
- [Store Runtime Helper Copy](./I18n_Store_Runtime_Helper_Copy.md)
- [Store Helper Error Presentation Split](./I18n_Store_Helper_Error_Presentation_Split.md)
- [Adapter Diagnostic Reason Code Plan](./I18n_Adapter_Diagnostic_Reason_Code_Plan.md)
- [Operator Workspace Boundary And Extraction](./I18n_Operator_Workspace_Boundary_And_Extraction.md)
- [Interaction Audit Presentation And Export Split](./I18n_Interaction_Audit_Presentation_Export_Split.md)
- [Diagnostic Archive Export Compatibility](./I18n_Diagnostic_Archive_Export_Compatibility.md)
- [Diagnostic Fixture And Historical Evidence Alignment](./I18n_Diagnostic_Fixture_And_Historical_Evidence_Alignment.md)
- [Localization Copy Chunk Size Audit](./I18n_Localization_Copy_Chunk_Size_Audit.md)

## Current Runtime Boundary

- `Phase 429` added 14-locale labels for the expanded progress display style options and made the Settings popup appearance preview render the selected localized progress style.
- `Phase 432` verified Arabic Settings carousel rendering through Playwright preview and fixed mixed-direction carousel status text while preserving provider names and raw evidence outside translation scope.
- `Phase 438` added 14-locale Settings quota/progress item control copy while preserving provider/progress ids, raw evidence, diagnostics, and storage behavior.
- `Phase 439` rechecked German and Arabic Settings quota controls through Playwright preview, confirming localized quota copy renders without English heading fallback in those representative locales.
