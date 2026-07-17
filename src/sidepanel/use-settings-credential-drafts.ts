import { type FormEvent, useState } from "react";

import type { ApiKeyProviderId } from "../providers/types";

type UseSettingsCredentialDraftsOptions = {
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
  onSaveCodexSessionToken: (accessToken: string) => void;
  onClearCodexSessionToken: () => void;
};

export function useSettingsCredentialDrafts({
  onSaveProviderAdminApiKey,
  onClearProviderAdminApiKey,
  onSaveCodexWorkspaceConfig,
  onClearCodexWorkspaceConfig,
  onSaveCodexSessionToken,
  onClearCodexSessionToken,
}: UseSettingsCredentialDraftsOptions) {
  const [credentialInputs, setCredentialInputs] = useState<
    Record<ApiKeyProviderId, string>
  >({
    "cursor-team-api": "",
    "claude-code-admin-api": "",
    "codex-enterprise-api": "",
  });
  const [codexAnalyticsApiKeyInput, setCodexAnalyticsApiKeyInput] = useState("");
  const [codexWorkspaceIdInput, setCodexWorkspaceIdInput] = useState("");
  const [codexSessionTokenInput, setCodexSessionTokenInput] = useState("");

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

  function handleSaveCodexSessionToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accessToken = codexSessionTokenInput.trim();

    if (!accessToken) {
      return;
    }

    onSaveCodexSessionToken(accessToken);
    setCodexSessionTokenInput("");
  }

  function handleClearCodexSessionToken() {
    setCodexSessionTokenInput("");
    onClearCodexSessionToken();
  }

  function handleProviderApiKeyInputChange(
    providerId: ApiKeyProviderId,
    value: string,
  ) {
    setCredentialInputs((current) => ({
      ...current,
      [providerId]: value,
    }));
  }

  return {
    codexAnalyticsApiKeyInput,
    codexWorkspaceIdInput,
    codexSessionTokenInput,
    credentialInputs,
    handleClearCodexConfig,
    handleClearCodexSessionToken,
    handleClearProviderApiKey,
    handleProviderApiKeyInputChange,
    handleSaveCodexConfig,
    handleSaveCodexSessionToken,
    handleSaveProviderApiKey,
    setCodexAnalyticsApiKeyInput,
    setCodexSessionTokenInput,
    setCodexWorkspaceIdInput,
  };
}
