import { type FormEvent, useEffect, useState } from "react";

import type {
  ApiKeyProviderId,
  AppLocalePreference,
  AppSettings,
  ProviderId,
  ProviderSourcePreference,
  ProviderSetting,
  ProviderSnapshot,
  ThemeMode,
  ThemePreset,
} from "../../providers/types";
import {
  buildProviderSourceDisplay,
  getSourcePreferenceLabel,
} from "../../shared/provider-sources";
import {
  buildSettingsSummaryLabels,
  createRuntimeI18n,
} from "../../shared/i18n";
import {
  THEME_PRESET_OPTIONS,
  buildCustomThemePalette,
  normalizeThemeCustomSeedHex,
  resolveThemeMode,
} from "../../shared/theme";

import { PermissionPrompt } from "../components/PermissionPrompt";
import { SummaryStrip } from "../components/SummaryStrip";
import { getPreferredScrollBehavior } from "../motion";
import {
  buildSettingsSourceCardModel,
  buildSettingsSummaryItems,
} from "../settings-view-models";
import { Toast } from "../components/Toast";
import { TopBar } from "../components/TopBar";

type SettingsToast = {
  tone: "success" | "error";
  title: string;
  message: string;
};

type CredentialProviderSection = {
  provider: ProviderSetting & { id: ApiKeyProviderId };
  title: string;
  inputLabel: string;
  helpText: string;
  footerText: string;
  placeholderMissing: string;
  placeholderConfigured: string;
};

type SettingsPageProps = {
  onBack: () => void;
  themeActionLabel?: string;
  themeActionTitle?: string;
  onToggleThemeMode?: () => void;
  onOpenFullPage?: () => void;
  settings: AppSettings;
  providers: ProviderSetting[];
  snapshots: ProviderSnapshot[];
  toast: SettingsToast | null;
  onDismissToast: () => void;
  onSavePreferences: () => void;
  onSyncIntervalChange: (minutes: number) => void;
  onLocalePreferenceChange: (locale: AppLocalePreference) => void;
  onWarningThresholdChange: (percent: number) => void;
  onThemeModeChange: (themeMode: ThemeMode) => void;
  onThemePresetChange: (themePreset: ThemePreset) => void;
  onSaveThemeCustomSeed: (themeCustomSeedHex: string) => void;
  onResetThemeCustomSeed: () => void;
  onToggleProvider: (providerId: ProviderId) => void;
  onTogglePermission: (providerId: ProviderId) => void;
  onSetSourcePreference: (
    providerId: ProviderId,
    sourcePreference: ProviderSourcePreference,
  ) => void;
  onSaveProviderAdminApiKey: (
    providerId: ApiKeyProviderId,
    apiKey: string,
  ) => void;
  onClearProviderAdminApiKey: (providerId: ApiKeyProviderId) => void;
  onSaveCodexWorkspaceConfig: (
    analyticsApiKey: string,
    workspaceId: string,
  ) => void;
  onClearCodexWorkspaceConfig: () => void;
  onClearPageBinding: (providerId: ProviderId) => void;
  onOpenSessionPage: (providerId: ProviderId) => void;
  sessionPageNavigationAvailable: boolean;
};

export function SettingsPage({
  onBack,
  themeActionLabel,
  themeActionTitle,
  onToggleThemeMode,
  onOpenFullPage,
  settings,
  providers,
  snapshots,
  toast,
  onDismissToast,
  onSavePreferences,
  onSyncIntervalChange,
  onLocalePreferenceChange,
  onWarningThresholdChange,
  onThemeModeChange,
  onThemePresetChange,
  onSaveThemeCustomSeed,
  onResetThemeCustomSeed,
  onToggleProvider,
  onTogglePermission,
  onSetSourcePreference,
  onSaveProviderAdminApiKey,
  onClearProviderAdminApiKey,
  onSaveCodexWorkspaceConfig,
  onClearCodexWorkspaceConfig,
  onClearPageBinding,
  onOpenSessionPage,
  sessionPageNavigationAvailable,
}: SettingsPageProps) {
  const SETTINGS_SECTION_IDS = {
    preferences: "settings-preferences",
    visibility: "settings-visibility",
    credentials: "settings-credentials",
    sources: "settings-sources",
    permissions: "settings-permissions",
  } as const;

  function findCredentialProvider(
    providerId: ApiKeyProviderId,
  ): (ProviderSetting & { id: ApiKeyProviderId }) | null {
    return (
      providers.find(
        (provider): provider is ProviderSetting & { id: ApiKeyProviderId } =>
          provider.id === providerId,
      ) ?? null
    );
  }

  function findSnapshot(providerId: ProviderId): ProviderSnapshot | null {
    return (
      snapshots.find((provider) => provider.providerId === providerId) ?? null
    );
  }

  const [credentialInputs, setCredentialInputs] = useState<
    Record<ApiKeyProviderId, string>
  >({
    cursor: "",
    "claude-code": "",
  });
  const credentialProviders: CredentialProviderSection[] = [];
  const cursorProvider = findCredentialProvider("cursor");
  const claudeProvider = findCredentialProvider("claude-code");
  const codexProvider =
    providers.find(
      (provider): provider is ProviderSetting & { id: "codex" } =>
        provider.id === "codex",
    ) ?? null;
  const [codexAnalyticsApiKeyInput, setCodexAnalyticsApiKeyInput] = useState("");
  const [codexWorkspaceIdInput, setCodexWorkspaceIdInput] = useState("");
  const [themeCustomSeedDraft, setThemeCustomSeedDraft] = useState(
    settings.themeCustomSeedHex ?? "",
  );
  const normalizedThemeCustomSeedDraft =
    normalizeThemeCustomSeedHex(themeCustomSeedDraft);
  const resolvedThemeMode = resolveThemeMode(
    settings.themeMode,
    typeof window !== "undefined" ? window : undefined,
  );
  const i18n = createRuntimeI18n(
    settings.locale,
    typeof window !== "undefined" ? window : undefined,
  );
  const customThemePreviewPalette = normalizedThemeCustomSeedDraft
    ? buildCustomThemePalette(normalizedThemeCustomSeedDraft, resolvedThemeMode)
    : null;

  useEffect(() => {
    setThemeCustomSeedDraft(settings.themeCustomSeedHex ?? "");
  }, [settings.themeCustomSeedHex]);

  if (cursorProvider) {
    credentialProviders.push({
      provider: cursorProvider,
      title: "Cursor Team Admin API key",
      inputLabel: "Admin API key",
      helpText:
        "Stored only in extension-managed local storage on this browser profile. Optional: use it for the team-admin API path, or leave it empty and use the logged-in personal usage page instead.",
      footerText:
        "Team-admin scope only. When configured, requests are sent from the background worker to `https://api.cursor.com` with Basic auth. Personal usage-page sync does not require this key.",
      placeholderMissing: "Paste a Cursor Admin API key",
      placeholderConfigured: "Configured locally. Enter a new key to replace it.",
    });
  }

  if (claudeProvider) {
    credentialProviders.push({
      provider: claudeProvider,
      title: "Claude Code Analytics Admin API key",
      inputLabel: "Admin API key",
      helpText:
        "Stored only in extension-managed local storage on this browser profile. Required for the supported v1 Claude organization analytics path.",
      footerText:
        "Admin API scope only. Requests are sent from the background worker to `https://api.anthropic.com/v1/organizations/usage_report/claude_code` with `x-api-key` and `anthropic-version` headers.",
      placeholderMissing: "Paste an Anthropic Admin API key",
      placeholderConfigured: "Configured locally. Enter a new key to replace it.",
    });
  }

  const settingsSummaryItems = buildSettingsSummaryItems(
    providers,
    snapshots,
    buildSettingsSummaryLabels(i18n),
    i18n.formatNumber,
  );
  const themePresetOptionLabels: Record<ThemePreset, string> = {
    default: i18n.t("settings.preferences.theme_preset.default"),
    meadow: i18n.t("settings.preferences.theme_preset.meadow"),
    sunset: i18n.t("settings.preferences.theme_preset.sunset"),
    custom: i18n.t("settings.preferences.theme_preset.custom"),
  };
  const localeOptions: Array<{ value: AppLocalePreference; label: string }> = [
    { value: "system", label: i18n.t("settings.preferences.locale.system") },
    { value: "en", label: i18n.t("settings.preferences.locale.en") },
    { value: "zh-CN", label: i18n.t("settings.preferences.locale.zh_cn") },
  ];

  function scrollToSection(sectionId: string) {
    if (typeof document === "undefined") {
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      block: "start",
      behavior: getPreferredScrollBehavior(window),
    });
  }

  function handleSaveProviderApiKey(
    providerId: ApiKeyProviderId,
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    const apiKey = credentialInputs[providerId].trim();

    if (!apiKey) {
      return;
    }

    onSaveProviderAdminApiKey(providerId, apiKey);
    setCredentialInputs((current) => ({
      ...current,
      [providerId]: "",
    }));
  }

  function handleClearProviderApiKey(providerId: ApiKeyProviderId) {
    setCredentialInputs((current) => ({
      ...current,
      [providerId]: "",
    }));
    onClearProviderAdminApiKey(providerId);
  }

  function handleSaveCodexConfig(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const analyticsApiKey = codexAnalyticsApiKeyInput.trim();
    const workspaceId = codexWorkspaceIdInput.trim();

    if (!analyticsApiKey || !workspaceId) {
      return;
    }

    onSaveCodexWorkspaceConfig(analyticsApiKey, workspaceId);
    setCodexAnalyticsApiKeyInput("");
    setCodexWorkspaceIdInput("");
  }

  function handleClearCodexConfig() {
    setCodexAnalyticsApiKeyInput("");
    setCodexWorkspaceIdInput("");
    onClearCodexWorkspaceConfig();
  }

  function handleApplyThemeCustomSeed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!normalizedThemeCustomSeedDraft) {
      return;
    }

    onSaveThemeCustomSeed(normalizedThemeCustomSeedDraft);
    setThemeCustomSeedDraft(normalizedThemeCustomSeedDraft);
  }

  function handleResetThemeCustomSeed() {
    setThemeCustomSeedDraft("");
    onResetThemeCustomSeed();
  }

  return (
    <main className="app-shell settings-shell">
      <TopBar
        title={i18n.t("settings.topbar.title")}
        subtitle={i18n.t("settings.topbar.subtitle")}
        themeActionLabel={themeActionLabel}
        themeActionTitle={themeActionTitle}
        expandActionLabel={i18n.t("common.actions.tab")}
        expandActionTitle={i18n.t("common.actions.open_settings_tab")}
        secondaryActionLabel={i18n.t("common.actions.back")}
        primaryActionLabel={i18n.t("common.actions.save")}
        sticky
        onThemeAction={onToggleThemeMode}
        onExpandAction={onOpenFullPage}
        onSecondaryAction={onBack}
        onPrimaryAction={onSavePreferences}
      />

      <section className="status-card settings-overview">
        <div className="dashboard-section__header">
          <div>
            <p className="section-label">{i18n.t("settings.overview.eyebrow")}</p>
            <h2 className="section-title">{i18n.t("settings.overview.title")}</h2>
          </div>
          <p className="supporting-copy">{i18n.t("settings.overview.detail")}</p>
        </div>

        <SummaryStrip
          ariaLabel={i18n.t("settings.overview.aria")}
          items={settingsSummaryItems}
        />

        <div className="settings-section-nav" aria-label={i18n.t("settings.sections.aria")}>
          <button
            className="settings-nav-chip"
            type="button"
            onClick={() => scrollToSection(SETTINGS_SECTION_IDS.preferences)}
          >
            {i18n.t("settings.sections.preferences")}
          </button>
          <button
            className="settings-nav-chip"
            type="button"
            onClick={() => scrollToSection(SETTINGS_SECTION_IDS.visibility)}
          >
            {i18n.t("settings.sections.visibility")}
          </button>
          <button
            className="settings-nav-chip"
            type="button"
            onClick={() => scrollToSection(SETTINGS_SECTION_IDS.credentials)}
          >
            {i18n.t("settings.sections.credentials")}
          </button>
          <button
            className="settings-nav-chip"
            type="button"
            onClick={() => scrollToSection(SETTINGS_SECTION_IDS.sources)}
          >
            {i18n.t("settings.sections.sources")}
          </button>
          <button
            className="settings-nav-chip"
            type="button"
            onClick={() => scrollToSection(SETTINGS_SECTION_IDS.permissions)}
          >
            {i18n.t("settings.sections.permissions")}
          </button>
        </div>
      </section>

      <section
        className="status-card settings-section-anchor"
        id={SETTINGS_SECTION_IDS.preferences}
      >
        <p className="section-label">{i18n.t("settings.preferences.eyebrow")}</p>
        <div className="settings-grid">
          <label className="form-field">
            <span className="form-field__label">{i18n.t("settings.preferences.sync_interval_label")}</span>
            <select
              className="form-field__control"
              value={String(settings.syncIntervalMinutes)}
              onChange={(event) =>
                onSyncIntervalChange(Number(event.target.value))
              }
            >
              <option value="15">{`${i18n.formatNumber(15)} ${i18n.t("settings.preferences.minutes")}`}</option>
              <option value="30">{`${i18n.formatNumber(30)} ${i18n.t("settings.preferences.minutes")}`}</option>
              <option value="60">{`${i18n.formatNumber(60)} ${i18n.t("settings.preferences.minutes")}`}</option>
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">{i18n.t("settings.preferences.warning_threshold_label")}</span>
            <select
              className="form-field__control"
              value={String(settings.warningThresholdPercent)}
              onChange={(event) =>
                onWarningThresholdChange(Number(event.target.value))
              }
            >
              <option value="70">70%</option>
              <option value="80">80%</option>
              <option value="90">90%</option>
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">{i18n.t("settings.preferences.locale_label")}</span>
            <select
              className="form-field__control"
              value={settings.locale}
              onChange={(event) =>
                onLocalePreferenceChange(event.target.value as AppLocalePreference)
              }
            >
              {localeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">{i18n.t("settings.preferences.theme_mode_label")}</span>
            <select
              className="form-field__control"
              value={settings.themeMode}
              onChange={(event) =>
                onThemeModeChange(event.target.value as ThemeMode)
              }
            >
              <option value="system">{i18n.t("settings.preferences.theme_mode.system")}</option>
              <option value="light">{i18n.t("settings.preferences.theme_mode.light")}</option>
              <option value="dark">{i18n.t("settings.preferences.theme_mode.dark")}</option>
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">{i18n.t("settings.preferences.accent_preset_label")}</span>
            <select
              className="form-field__control"
              value={settings.themePreset}
              onChange={(event) =>
                onThemePresetChange(event.target.value as ThemePreset)
              }
            >
              {THEME_PRESET_OPTIONS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {themePresetOptionLabels[preset.value]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          className="theme-customization-card"
          data-theme-stability-surface="settings-theme-customization-card"
        >
          <div className="dashboard-section__header">
            <div>
              <p className="section-label">{i18n.t("settings.theme_customization.eyebrow")}</p>
              <h2 className="section-title">{i18n.t("settings.theme_customization.title")}</h2>
            </div>
            <p className="supporting-copy">{i18n.t("settings.theme_customization.detail")}</p>
          </div>

          <form
            className="theme-customization-form"
            onSubmit={handleApplyThemeCustomSeed}
          >
            <label className="form-field">
              <span className="form-field__label">{i18n.t("settings.theme_customization.seed_label")}</span>
              <input
                className="form-field__control"
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                value={themeCustomSeedDraft}
                placeholder="#4F46E5"
                onChange={(event) => setThemeCustomSeedDraft(event.target.value)}
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
                onClick={handleResetThemeCustomSeed}
              >
                {i18n.t("settings.theme_customization.reset")}
              </button>
            </div>
          </form>

          <p className="supporting-copy">
            {normalizedThemeCustomSeedDraft
              ? `Previewing ${normalizedThemeCustomSeedDraft} for the current ${resolvedThemeMode} palette. Apply it to switch the accent preset to Custom Seed.`
              : settings.themePreset === "custom"
                ? "Custom Seed is selected, but no valid saved seed is available yet. The default accent roles stay active until you apply a valid #RRGGBB value."
                : "Enter a valid #RRGGBB value to generate a custom accent palette without opening raw token editing."}
          </p>

          {customThemePreviewPalette ? (
            <div className="theme-preview-grid" aria-label={i18n.t("settings.theme_customization.preview.aria")}>
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
                  <p className="theme-preview-swatch__label">{i18n.t("settings.theme_customization.preview.primary")}</p>
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
                    {i18n.t("settings.theme_customization.preview.secondary_container")}
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
                  <p className="theme-preview-swatch__label">{i18n.t("settings.theme_customization.preview.tertiary")}</p>
                  <p className="supporting-copy">
                    {customThemePreviewPalette.tertiary}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section
        className="status-card settings-section-anchor"
        id={SETTINGS_SECTION_IDS.visibility}
      >
        <p className="section-label">{i18n.t("settings.visibility.eyebrow")}</p>
        <div className="settings-list">
          {providers.map((provider) => (
            <label
              key={provider.id}
              className="switch-row"
              data-visibility-provider-id={provider.id}
              data-visibility-enabled={provider.enabled ? "true" : "false"}
            >
              <div>
                <p className="switch-row__title">{provider.label}</p>
                <p className="supporting-copy">
                  {provider.enabled
                    ? i18n.t("settings.visibility.enabled_detail")
                    : i18n.t("settings.visibility.disabled_detail")}
                </p>
              </div>
              <input
                className="switch-row__control"
                type="checkbox"
                checked={provider.enabled}
                data-visibility-toggle={provider.id}
                onChange={() => onToggleProvider(provider.id)}
              />
            </label>
          ))}
        </div>
      </section>

      {credentialProviders.length > 0 || codexProvider ? (
        <section
          className="dashboard-section settings-section-anchor"
          id={SETTINGS_SECTION_IDS.credentials}
        >
          <div className="dashboard-section__header">
            <div>
              <p className="section-label">{i18n.t("settings.credentials.eyebrow")}</p>
              <h2 className="section-title">{i18n.t("settings.credentials.title")}</h2>
            </div>
            <p className="supporting-copy">{i18n.t("settings.credentials.detail")}</p>
          </div>

          <div className="provider-shell-list">
            {credentialProviders.map((item, index) => {
              const isConfigured = item.provider.credentialStatus === "configured";
              const currentInput = credentialInputs[item.provider.id];
              const trimmedInput = currentInput.trim();

              return (
                <article key={item.provider.id} className="status-card">
                  <div className="dashboard-section__header">
                    <div>
                      <p className="section-label">
                        {index === 0
                          ? "Provider Credentials"
                          : "Provider Credential"}
                      </p>
                      <h2 className="section-title">{item.title}</h2>
                    </div>
                    <p
                      className={`credential-state ${isConfigured ? "credential-state--configured" : "credential-state--missing"}`}
                    >
                      {isConfigured ? "Configured" : "Missing"}
                    </p>
                  </div>

                  <div className="credential-card">
                    <p className="supporting-copy">{item.helpText}</p>

                    <form
                      className="credential-form"
                      onSubmit={(event) =>
                        handleSaveProviderApiKey(item.provider.id, event)
                      }
                    >
                      <label className="form-field">
                        <span className="form-field__label">{item.inputLabel}</span>
                        <input
                          className="form-field__control"
                          type="password"
                          autoComplete="off"
                          spellCheck={false}
                          value={currentInput}
                          placeholder={
                            isConfigured
                              ? item.placeholderConfigured
                              : item.placeholderMissing
                          }
                          onChange={(event) =>
                            setCredentialInputs((current) => ({
                              ...current,
                              [item.provider.id]: event.target.value,
                            }))
                          }
                        />
                      </label>

                      <div className="credential-actions">
                        <button
                          className="text-button"
                          type="submit"
                          disabled={!trimmedInput}
                        >
                          Save key
                        </button>
                        <button
                          className="text-button"
                          type="button"
                          disabled={!isConfigured}
                          onClick={() => handleClearProviderApiKey(item.provider.id)}
                        >
                          Clear stored key
                        </button>
                      </div>
                    </form>

                    <p className="supporting-copy">{item.footerText}</p>
                  </div>
                </article>
              );
            })}

            {codexProvider ? (
              <article className="status-card">
                <div className="dashboard-section__header">
                  <div>
                    <p className="section-label">Provider Credential</p>
                    <h2 className="section-title">
                      Codex Enterprise analytics config
                    </h2>
                  </div>
                  <p
                    className={`credential-state ${codexProvider.credentialStatus === "configured" ? "credential-state--configured" : "credential-state--missing"}`}
                  >
                    {codexProvider.credentialStatus === "configured"
                      ? "Configured"
                      : "Missing"}
                  </p>
                </div>

                <div className="credential-card">
                  <p className="supporting-copy">
                    Stored only in extension-managed local storage on this browser
                    profile. This is optional and only needed for the Enterprise
                    analytics path. Personal Codex usage-page sync does not require
                    an analytics key or workspace ID.
                  </p>

                  <form className="credential-form" onSubmit={handleSaveCodexConfig}>
                    <label className="form-field">
                      <span className="form-field__label">Analytics API key</span>
                      <input
                        className="form-field__control"
                        type="password"
                        autoComplete="off"
                        spellCheck={false}
                        value={codexAnalyticsApiKeyInput}
                        placeholder={
                          codexProvider.credentialStatus === "configured"
                            ? "Configured locally. Enter a new analytics key to replace it."
                            : "Paste a Codex analytics API key"
                        }
                        onChange={(event) =>
                          setCodexAnalyticsApiKeyInput(event.target.value)
                        }
                      />
                    </label>

                    <label className="form-field">
                      <span className="form-field__label">Workspace ID</span>
                      <input
                        className="form-field__control"
                        type="text"
                        autoComplete="off"
                        spellCheck={false}
                        value={codexWorkspaceIdInput}
                        placeholder={
                          codexProvider.credentialStatus === "configured"
                            ? "Configured locally. Enter a new workspace ID to replace it."
                            : "Paste the Codex workspace ID"
                        }
                        onChange={(event) =>
                          setCodexWorkspaceIdInput(event.target.value)
                        }
                      />
                    </label>

                    <div className="credential-actions">
                      <button
                        className="text-button"
                        type="submit"
                        disabled={
                          !codexAnalyticsApiKeyInput.trim() ||
                          !codexWorkspaceIdInput.trim()
                        }
                      >
                        Save config
                      </button>
                      <button
                        className="text-button"
                        type="button"
                        disabled={codexProvider.credentialStatus !== "configured"}
                        onClick={handleClearCodexConfig}
                      >
                        Clear stored config
                      </button>
                    </div>
                  </form>

                  <p className="supporting-copy">
                    Use a Platform API key scoped for Codex analytics and the
                    workspace ID from the ChatGPT admin console only if you want the
                    Enterprise workspace path. Requests go to
                    `https://api.chatgpt.com/v1/analytics/codex`.
                  </p>
                </div>
              </article>
            ) : null}
          </div>
        </section>
      ) : null}

      <section
        className="dashboard-section settings-section-anchor"
        id={SETTINGS_SECTION_IDS.sources}
      >
        <div className="dashboard-section__header">
          <div>
            <p className="section-label">{i18n.t("settings.sources.eyebrow")}</p>
            <h2 className="section-title">{i18n.t("settings.sources.title")}</h2>
          </div>
          <p className="supporting-copy">{i18n.t("settings.sources.detail")}</p>
        </div>

        <div className="provider-shell-list">
          {providers.map((provider) => {
            const snapshot = findSnapshot(provider.id);

            if (!snapshot) {
              return null;
            }

            const sourceDisplay = buildProviderSourceDisplay(snapshot, provider);
            const sourceCardModel = buildSettingsSourceCardModel(sourceDisplay);
            const sessionPagePlan = sourceDisplay.sessionPagePlan;
            const canUseSessionPageAction =
              sessionPagePlan?.rolloutStage === "shipped";

            return (
              <article
                key={provider.id}
                className="source-card"
                data-provider-id={provider.id}
              >
                <div className="source-card__header">
                  <div>
                    <p className="source-card__provider">{provider.label}</p>
                    <p className="supporting-copy">
                      {sourceDisplay.currentContractDetail}
                    </p>
                  </div>
                  <div className="source-card__chips">
                    <span className="meta-chip">
                      {sourceDisplay.currentLabel}
                    </span>
                    <span className="meta-chip">
                      {sourceDisplay.currentContractLabel}
                    </span>
                    <span
                      className={`meta-chip ${sourceDisplay.fidelityTone === "error" ? "meta-chip--error" : sourceDisplay.fidelityTone === "warning" ? "meta-chip--warning" : ""}`.trim()}
                    >
                      {sourceDisplay.fidelityLabel}
                    </span>
                    <span
                      className={`meta-chip ${sourceDisplay.stateTone === "error" ? "meta-chip--error" : sourceDisplay.stateTone === "warning" ? "meta-chip--warning" : ""}`.trim()}
                    >
                      {sourceDisplay.stateLabel}
                    </span>
                  </div>
                </div>

                <div className="source-card__body">
                  <div className="source-card__summary-grid">
                    <div className="source-card__field">
                      <p className="source-card__label">Preference</p>
                      {sourceDisplay.sourcePreferenceOptions.length > 1 ? (
                        <label className="form-field">
                          <select
                            className="form-field__control"
                            value={sourceDisplay.sourcePreference}
                            onChange={(event) =>
                              onSetSourcePreference(
                                provider.id,
                                event.target.value as ProviderSourcePreference,
                              )
                            }
                          >
                            {sourceDisplay.sourcePreferenceOptions.map(
                              (preference) => (
                                <option key={preference} value={preference}>
                                  {getSourcePreferenceLabel(preference)}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                      ) : (
                        <p className="source-card__value">
                          {sourceDisplay.sourcePreferenceLabel}
                        </p>
                      )}
                    </div>
                    {sourceCardModel.primaryFields.map((field) => (
                      <div key={field.label} className="source-card__field">
                        <p className="source-card__label">{field.label}</p>
                        <p className="source-card__value">{field.value}</p>
                      </div>
                    ))}
                  </div>

                  {sourceCardModel.summaryNoteLines.length > 0 ? (
                    <div
                      className={`detail-note ${sourceCardModel.summaryNoteTone === "error" ? "detail-note--error" : sourceCardModel.summaryNoteTone === "warning" ? "detail-note--warning" : "detail-note--neutral"}`.trim()}
                      data-theme-stability-surface={
                        provider.id === "cursor"
                          ? "settings-cursor-operational-note"
                          : undefined
                      }
                    >
                      <p className="detail-note__label">Operational note</p>
                      {sourceCardModel.summaryNoteLines.map((line) => (
                        <p key={line} className="supporting-copy">
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : null}

                  {sessionPagePlan ? (
                    <div className="source-card__session">
                      <div className="source-card__session-header">
                        <div>
                          <p className="source-card__label">
                            Session-page track
                          </p>
                          <p className="source-card__value">
                            {sourceCardModel.sessionTrack?.title ?? sessionPagePlan.label}
                          </p>
                        </div>
                        <div className="source-card__session-chips">
                          {sourceCardModel.sessionTrack?.chips.map((chip) => (
                            <span
                              key={chip.label}
                              className={`meta-chip ${chip.tone === "error" ? "meta-chip--error" : chip.tone === "warning" ? "meta-chip--warning" : ""}`.trim()}
                            >
                              {chip.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {sourceCardModel.sessionTrack?.fields.length ? (
                        <div className="source-card__session-grid">
                          {sourceCardModel.sessionTrack.fields.map((field) => (
                            <div
                              key={field.label}
                              className="source-card__field"
                            >
                              <p className="source-card__label">{field.label}</p>
                              <p className="source-card__value">{field.value}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {sourceCardModel.sessionTrack?.noteLines.length ? (
                        <div
                          className={`detail-note ${sourceCardModel.sessionTrack.noteTone === "warning" ? "detail-note--warning" : sourceCardModel.sessionTrack.noteTone === "error" ? "detail-note--error" : "detail-note--neutral"}`.trim()}
                          data-theme-stability-surface={
                            provider.id === "cursor"
                              ? "settings-cursor-session-note"
                              : undefined
                          }
                        >
                          <p className="detail-note__label">Session-page note</p>
                          {sourceCardModel.sessionTrack.noteLines.map((line) => (
                            <p key={line} className="supporting-copy">
                              {line}
                            </p>
                          ))}
                        </div>
                      ) : null}

                      {canUseSessionPageAction ? (
                        <div className="credential-actions source-card__session-actions">
                          <button
                            className="text-button"
                            type="button"
                            disabled={!sessionPageNavigationAvailable}
                            onClick={() => onOpenSessionPage(provider.id)}
                          >
                            {sessionPageNavigationAvailable
                              ? "Find or open page"
                              : "Extension mode only"}
                          </button>
                          <button
                            className="text-button"
                            type="button"
                            disabled={
                              sourceDisplay.pageBindingLabel === null ||
                              provider.pageBinding.status === "unbound"
                            }
                            onClick={() => onClearPageBinding(provider.id)}
                          >
                            Disconnect binding
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <details className="source-card__details">
                    <summary className="source-card__details-toggle">
                      <span>Detailed diagnostics</span>
                      <span className="meta-chip">
                        {sourceCardModel.diagnosticsCount} items
                      </span>
                    </summary>

                    <div className="source-card__details-body">
                      {sourceCardModel.diagnosticGroups.map((group) => (
                        <section
                          key={group.title}
                          className="source-card__diagnostic-group"
                        >
                          <div className="source-card__diagnostic-group-header">
                            <p className="source-card__diagnostic-group-title">
                              {group.title}
                            </p>
                            <span className="meta-chip">
                              {group.fields.length + group.noteLines.length} items
                            </span>
                          </div>

                          {group.fields.length > 0 ? (
                            <div className="source-card__diagnostic-list">
                              {group.fields.map((field) => (
                                <div
                                  key={`${group.title}-${field.label}`}
                                  className="source-card__diagnostic-row"
                                >
                                  <p className="source-card__diagnostic-label">
                                    {field.label}
                                  </p>
                                  <p className="source-card__diagnostic-value">
                                    {field.value}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {group.noteLines.length > 0 ? (
                            <div className="detail-note detail-note--neutral">
                              <p className="detail-note__label">{group.title}</p>
                              {group.noteLines.map((line) => (
                                <p key={line} className="supporting-copy">
                                  {line}
                                </p>
                              ))}
                            </div>
                          ) : null}
                        </section>
                      ))}
                    </div>
                  </details>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="dashboard-section settings-section-anchor"
        id={SETTINGS_SECTION_IDS.permissions}
      >
        <div className="dashboard-section__header">
          <div>
            <p className="section-label">{i18n.t("settings.permissions.eyebrow")}</p>
            <h2 className="section-title">{i18n.t("settings.permissions.title")}</h2>
          </div>
          <p className="supporting-copy">{i18n.t("settings.permissions.detail")}</p>
        </div>

        <div className="provider-shell-list">
          {providers.map((provider) => (
            <PermissionPrompt
              key={provider.id}
              providerId={provider.id}
              providerLabel={provider.label}
              description={provider.description}
              hostsLabel={provider.hostsLabel}
              requiresHostAccess={(provider.hostOrigins?.length ?? 0) > 0}
              status={provider.status}
              onToggle={() => onTogglePermission(provider.id)}
            />
          ))}
        </div>
      </section>

      {toast ? (
        <Toast
          tone={toast.tone}
          title={toast.title}
          message={toast.message}
          onDismiss={onDismissToast}
        />
      ) : null}
    </main>
  );
}
