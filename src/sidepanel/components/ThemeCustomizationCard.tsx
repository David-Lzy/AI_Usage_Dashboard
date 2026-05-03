import type { FormEvent } from "react";

import type { AppSettings } from "../../providers/types";
import type { RuntimeI18n } from "../../shared/i18n";
import type { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import {
  buildCustomThemePalette,
  normalizeThemeCustomSeedHex,
  type ResolvedThemeMode,
} from "../../shared/theme";

type ThemeCustomizationCardProps = {
  i18n: RuntimeI18n;
  resolvedThemeMode: ResolvedThemeMode;
  settings: Pick<AppSettings, "themeCustomSeedHex" | "themePreset">;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  themeCustomSeedDraft: string;
  onApplyThemeCustomSeed: (event: FormEvent<HTMLFormElement>) => void;
  onResetThemeCustomSeed: () => void;
  onThemeCustomSeedDraftChange: (themeCustomSeedDraft: string) => void;
};

export function ThemeCustomizationCard({
  i18n,
  resolvedThemeMode,
  settings,
  settingsCopy,
  themeCustomSeedDraft,
  onApplyThemeCustomSeed,
  onResetThemeCustomSeed,
  onThemeCustomSeedDraftChange,
}: ThemeCustomizationCardProps) {
  const normalizedThemeCustomSeedDraft =
    normalizeThemeCustomSeedHex(themeCustomSeedDraft);
  const customThemePreviewPalette = normalizedThemeCustomSeedDraft
    ? buildCustomThemePalette(normalizedThemeCustomSeedDraft, resolvedThemeMode)
    : null;

  return (
    <div
      className="theme-customization-card"
      data-theme-stability-surface="settings-theme-customization-card"
    >
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">
            {i18n.t("settings.theme_customization.eyebrow")}
          </p>
          <h2 className="section-title">
            {i18n.t("settings.theme_customization.title")}
          </h2>
        </div>
        <p className="supporting-copy">
          {i18n.t("settings.theme_customization.detail")}
        </p>
      </div>

      <form
        className="theme-customization-form"
        onSubmit={onApplyThemeCustomSeed}
      >
        <label className="form-field">
          <span className="form-field__label">
            {i18n.t("settings.theme_customization.seed_label")}
          </span>
          <input
            className="form-field__control"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            value={themeCustomSeedDraft}
            placeholder="#4F46E5"
            onChange={(event) =>
              onThemeCustomSeedDraftChange(event.target.value)
            }
          />
        </label>

        <div className="credential-actions">
          <button
            className="text-button"
            type="submit"
            disabled={!normalizedThemeCustomSeedDraft}
          >
            {i18n.t("settings.theme_customization.apply")}
          </button>
          <button
            className="text-button"
            type="button"
            disabled={settings.themeCustomSeedHex === null}
            onClick={onResetThemeCustomSeed}
          >
            {i18n.t("settings.theme_customization.reset")}
          </button>
        </div>
      </form>

      <p className="supporting-copy">
        {normalizedThemeCustomSeedDraft
          ? settingsCopy.themeCustomization.previewingSeed(
              normalizedThemeCustomSeedDraft,
              resolvedThemeMode,
            )
          : settings.themePreset === "custom"
            ? settingsCopy.themeCustomization.customSeedMissing
            : settingsCopy.themeCustomization.enterValidSeed}
      </p>

      {customThemePreviewPalette ? (
        <div
          className="theme-preview-grid"
          aria-label={i18n.t("settings.theme_customization.preview.aria")}
        >
          <div className="theme-preview-swatch">
            <span
              className="theme-preview-swatch__color"
              style={{
                backgroundColor: customThemePreviewPalette.primary,
                color: customThemePreviewPalette.onPrimary,
              }}
            >
              Aa
            </span>
            <div>
              <p className="theme-preview-swatch__label">
                {i18n.t("settings.theme_customization.preview.primary")}
              </p>
              <p className="supporting-copy">
                {customThemePreviewPalette.primary}
              </p>
            </div>
          </div>

          <div className="theme-preview-swatch">
            <span
              className="theme-preview-swatch__color"
              style={{
                backgroundColor: customThemePreviewPalette.secondaryContainer,
                color: customThemePreviewPalette.onSecondaryContainer,
              }}
            >
              Aa
            </span>
            <div>
              <p className="theme-preview-swatch__label">
                {i18n.t(
                  "settings.theme_customization.preview.secondary_container",
                )}
              </p>
              <p className="supporting-copy">
                {customThemePreviewPalette.secondaryContainer}
              </p>
            </div>
          </div>

          <div className="theme-preview-swatch">
            <span
              className="theme-preview-swatch__color"
              style={{
                backgroundColor: customThemePreviewPalette.tertiary,
                color: customThemePreviewPalette.onTertiary,
              }}
            >
              Aa
            </span>
            <div>
              <p className="theme-preview-swatch__label">
                {i18n.t("settings.theme_customization.preview.tertiary")}
              </p>
              <p className="supporting-copy">
                {customThemePreviewPalette.tertiary}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
