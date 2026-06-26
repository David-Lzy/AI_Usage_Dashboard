import { useEffect, useMemo, useState } from "react";

import {
  CUSTOM_SOURCE_DEFAULT_REFRESH_INTERVAL_MINUTES,
  CUSTOM_SOURCE_SCHEMA_V1,
  normalizeCustomSourceRefreshIntervalMinutes,
  normalizeCustomSourceSettings,
  toCustomSourceId,
  type CustomSourceId,
  type CustomSourceSetting,
  type CustomSourceSnapshot,
  type CustomSourceSyncState,
} from "../../shared/custom-sources";
import { fetchCustomSourceSnapshot } from "../../background/custom-source-sync";
import { requestCustomSourceHostAccess } from "../../shared/custom-source-host-access";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";

type CustomSourceSettingsSectionProps = {
  customSources: readonly CustomSourceSetting[];
  customSourceStates: readonly CustomSourceSyncState[];
  locale: string;
  onChange: (customSources: CustomSourceSetting[]) => void;
};

type CustomSourceDraft = {
  originalId: CustomSourceId | null;
  id: CustomSourceId;
  label: string;
  description: string;
  endpointUrl: string;
  displayEnabled: boolean;
  refreshIntervalMinutes: string;
  createdAt: string;
  updatedAt: string;
};

type TestResult =
  | {
      tone: "success";
      title: string;
      message: string;
      snapshot: CustomSourceSnapshot;
    }
  | {
      tone: "error";
      title: string;
      message: string;
      snapshot: null;
    };

type CustomSourceCopy = {
  eyebrow: string;
  title: string;
  detail: string;
  add: string;
  empty: string;
  enabled: string;
  disabled: string;
  name: string;
  description: string;
  endpoint: string;
  interval: string;
  intervalUnit: string;
  save: string;
  test: string;
  testing: string;
  delete: string;
  protocolTitle: string;
  protocolHelp: string;
  successTitle: string;
  failureTitle: string;
  validationError: string;
  responsePreview: string;
};

const EN_COPY: CustomSourceCopy = {
  eyebrow: "Custom JSON Sources",
  title: "Client-provided quota sources",
  detail:
    "Add local HTTP or HTTPS JSON endpoints when you want this extension to show data that is not a verified built-in provider.",
  add: "Add source",
  empty: "No custom sources yet.",
  enabled: "Enabled",
  disabled: "Disabled",
  name: "Display name",
  description: "Description",
  endpoint: "Endpoint URL",
  interval: "Refresh interval",
  intervalUnit: "minutes",
  save: "Save source",
  test: "Test endpoint",
  testing: "Testing...",
  delete: "Delete",
  protocolTitle: "JSON protocol",
  protocolHelp:
    "The extension fetches JSON only. HTML is not rendered, scripts are never executed, and raw response bodies are not stored.",
  successTitle: "Endpoint validated",
  failureTitle: "Endpoint failed",
  validationError: "Fix the source name, endpoint URL, or refresh interval.",
  responsePreview: "Normalized preview",
};

const ZH_CN_COPY: CustomSourceCopy = {
  eyebrow: "自定义 JSON 来源",
  title: "客户端自定义额度来源",
  detail:
    "添加本地 HTTP 或 HTTPS JSON 端点，用于显示内置 Provider 之外的数据。它不会被标记为官方内置来源。",
  add: "新增来源",
  empty: "还没有自定义来源。",
  enabled: "启用",
  disabled: "停用",
  name: "显示名称",
  description: "说明",
  endpoint: "Endpoint URL",
  interval: "刷新间隔",
  intervalUnit: "分钟",
  save: "保存来源",
  test: "测试端点",
  testing: "测试中...",
  delete: "删除",
  protocolTitle: "JSON 协议",
  protocolHelp:
    "扩展只拉取 JSON；不会渲染 HTML，不会执行脚本，也不会保存原始响应正文。",
  successTitle: "端点验证通过",
  failureTitle: "端点验证失败",
  validationError: "请检查来源名称、Endpoint URL 或刷新间隔。",
  responsePreview: "标准化预览",
};

const MINIMUM_EXAMPLE = {
  schema: CUSTOM_SOURCE_SCHEMA_V1,
  label: "Build Quota",
  status: "ok",
  quota: {
    unit: "minutes",
    remaining: 90,
    total: 100,
  },
};

const FULL_EXAMPLE = {
  schema: CUSTOM_SOURCE_SCHEMA_V1,
  id: "build-quota",
  label: "Build Quota",
  description: "Internal CI usage",
  status: "warning",
  tone: "warning",
  summary: "90 of 100 minutes remaining",
  quota: {
    label: "Monthly build minutes",
    unit: "minutes",
    used: 10,
    remaining: 90,
    total: 100,
    resetLabel: "Resets July 1",
  },
  windows: [
    {
      label: "Daily window",
      unit: "percent",
      remaining: 70,
    },
  ],
  balances: [
    {
      label: "Credit balance",
      unit: "credits",
      remaining: 12,
    },
  ],
  facts: [
    {
      label: "Plan",
      value: "Team",
      detail: "Synced from an internal service",
    },
  ],
  warningReason: "Below preferred reserve",
};

function getCopy(locale: string): CustomSourceCopy {
  return locale === "zh-CN" ? ZH_CN_COPY : EN_COPY;
}

function createDraftFromSource(source: CustomSourceSetting): CustomSourceDraft {
  return {
    originalId: source.id,
    id: source.id,
    label: source.label,
    description: source.description ?? "",
    endpointUrl: source.endpointUrl,
    displayEnabled: source.displayEnabled,
    refreshIntervalMinutes: String(source.refreshIntervalMinutes),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

function createNewDraft(existingSources: readonly CustomSourceSetting[]) {
  const now = new Date().toISOString();
  let index = existingSources.length + 1;
  let id = toCustomSourceId(`source-${index}`);
  const existingIds = new Set(existingSources.map((source) => source.id));

  while (!id || existingIds.has(id)) {
    index += 1;
    id = toCustomSourceId(`source-${index}`);
  }

  return {
    originalId: null,
    id,
    label: `Custom Source ${index}`,
    description: "",
    endpointUrl: "https://example.com/quota.json",
    displayEnabled: true,
    refreshIntervalMinutes: String(
      CUSTOM_SOURCE_DEFAULT_REFRESH_INTERVAL_MINUTES,
    ),
    createdAt: now,
    updatedAt: now,
  };
}

function toCandidateSetting(draft: CustomSourceDraft): CustomSourceSetting {
  const now = new Date().toISOString();

  return {
    id: draft.id,
    label: draft.label,
    description: draft.description.trim() || null,
    endpointUrl: draft.endpointUrl,
    displayEnabled: draft.displayEnabled,
    refreshIntervalMinutes: normalizeCustomSourceRefreshIntervalMinutes(
      draft.refreshIntervalMinutes,
    ),
    createdAt: draft.createdAt,
    updatedAt: now,
  };
}

function validateDraft(draft: CustomSourceDraft): CustomSourceSetting | null {
  return normalizeCustomSourceSettings([toCandidateSetting(draft)])[0] ?? null;
}

function formatExample(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function getStateForSource(
  states: readonly CustomSourceSyncState[],
  sourceId: CustomSourceId,
): CustomSourceSyncState | null {
  return states.find((state) => state.sourceId === sourceId) ?? null;
}

export function CustomSourceSettingsSection({
  customSources,
  customSourceStates,
  locale,
  onChange,
}: CustomSourceSettingsSectionProps) {
  const copy = getCopy(locale);
  const [drafts, setDrafts] = useState<CustomSourceDraft[]>(() =>
    customSources.map(createDraftFromSource),
  );
  const [testingSourceId, setTestingSourceId] = useState<CustomSourceId | null>(
    null,
  );
  const [testResults, setTestResults] = useState<
    Partial<Record<CustomSourceId, TestResult>>
  >({});
  const sourceSignature = useMemo(
    () => JSON.stringify(customSources),
    [customSources],
  );

  useEffect(() => {
    setDrafts(customSources.map(createDraftFromSource));
  }, [sourceSignature]);

  function updateDraft(sourceId: CustomSourceId, update: Partial<CustomSourceDraft>) {
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === sourceId ? { ...draft, ...update } : draft,
      ),
    );
  }

  function handleAddSource() {
    setDrafts((current) => [...current, createNewDraft(customSources)]);
  }

  function handleDeleteSource(draft: CustomSourceDraft) {
    setDrafts((current) => current.filter((entry) => entry.id !== draft.id));

    if (draft.originalId) {
      onChange(customSources.filter((source) => source.id !== draft.originalId));
    }
  }

  function handleToggleSource(draft: CustomSourceDraft) {
    const nextEnabled = !draft.displayEnabled;

    updateDraft(draft.id, { displayEnabled: nextEnabled });

    if (!draft.originalId) {
      return;
    }

    onChange(
      customSources.map((source) =>
        source.id === draft.originalId
          ? { ...source, displayEnabled: nextEnabled }
          : source,
      ),
    );
  }

  function handleSaveSource(draft: CustomSourceDraft) {
    const setting = validateDraft(draft);

    if (!setting) {
      setTestResults((current) => ({
        ...current,
        [draft.id]: {
          tone: "error",
          title: copy.failureTitle,
          message: copy.validationError,
          snapshot: null,
        },
      }));
      return;
    }

    const nextSources = draft.originalId
      ? customSources.map((source) =>
          source.id === draft.originalId ? setting : source,
        )
      : [...customSources, setting];

    onChange(nextSources);
    setTestResults((current) => ({
      ...current,
      [setting.id]: {
        tone: "success",
        title: "Source saved",
        message: `${setting.label} was saved locally.`,
        snapshot: null,
      },
    }));
  }

  async function handleTestSource(draft: CustomSourceDraft) {
    const setting = validateDraft(draft);

    if (!setting) {
      setTestResults((current) => ({
        ...current,
        [draft.id]: {
          tone: "error",
          title: copy.failureTitle,
          message: copy.validationError,
          snapshot: null,
        },
      }));
      return;
    }

    setTestingSourceId(draft.id);

    try {
      await requestCustomSourceHostAccess(setting.endpointUrl).catch(() => false);
      const result = await fetchCustomSourceSnapshot(setting);

      setTestResults((current) => ({
        ...current,
        [draft.id]: result.ok
          ? {
              tone: "success",
              title: copy.successTitle,
              message: `${result.snapshot.label} · ${result.snapshot.syncStatus}`,
              snapshot: result.snapshot,
            }
          : {
              tone: "error",
              title: copy.failureTitle,
              message: result.message,
              snapshot: null,
            },
      }));
    } finally {
      setTestingSourceId(null);
    }
  }

  return (
    <section
      className="status-card settings-section-anchor custom-source-settings"
      data-custom-source-settings=""
    >
      <div className="dashboard-section__header custom-source-settings__header">
        <div>
          <p className="section-label">{copy.eyebrow}</p>
          <div className="section-title-with-info">
            <h2 className="section-title">{copy.title}</h2>
            <MaterialInfoTooltip>{copy.detail}</MaterialInfoTooltip>
          </div>
        </div>
        <button className="text-button" type="button" onClick={handleAddSource}>
          {copy.add}
        </button>
      </div>

      <p className="body-copy custom-source-settings__detail">{copy.detail}</p>

      {drafts.length === 0 ? (
        <p className="body-copy custom-source-settings__empty">{copy.empty}</p>
      ) : (
        <div className="custom-source-settings__list">
          {drafts.map((draft) => {
            const syncState = getStateForSource(customSourceStates, draft.id);
            const testResult = testResults[draft.id];
            const isTesting = testingSourceId === draft.id;

            return (
              <article
                className="custom-source-card"
                data-custom-source-card={draft.id}
                key={draft.id}
              >
                <div className="custom-source-card__top">
                  <div>
                    <h3 className="custom-source-card__title">{draft.label}</h3>
                    <p className="custom-source-card__meta">
                      {draft.id}
                      {syncState?.lastSuccessAt
                        ? ` · last success ${syncState.lastSuccessAt}`
                        : ""}
                    </p>
                  </div>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => handleToggleSource(draft)}
                  >
                    {draft.displayEnabled ? copy.enabled : copy.disabled}
                  </button>
                </div>

                <div className="custom-source-card__form">
                  <label className="form-field">
                    <span className="form-field__label">{copy.name}</span>
                    <input
                      className="form-field__control"
                      value={draft.label}
                      onChange={(event) =>
                        updateDraft(draft.id, { label: event.currentTarget.value })
                      }
                    />
                  </label>
                  <label className="form-field">
                    <span className="form-field__label">{copy.description}</span>
                    <input
                      className="form-field__control"
                      value={draft.description}
                      onChange={(event) =>
                        updateDraft(draft.id, {
                          description: event.currentTarget.value,
                        })
                      }
                    />
                  </label>
                  <label className="form-field custom-source-card__endpoint">
                    <span className="form-field__label">{copy.endpoint}</span>
                    <input
                      className="form-field__control"
                      value={draft.endpointUrl}
                      onChange={(event) =>
                        updateDraft(draft.id, {
                          endpointUrl: event.currentTarget.value,
                        })
                      }
                    />
                  </label>
                  <label className="form-field">
                    <span className="form-field__label">{copy.interval}</span>
                    <span className="custom-source-card__interval">
                      <input
                        className="form-field__control"
                        inputMode="numeric"
                        value={draft.refreshIntervalMinutes}
                        onChange={(event) =>
                          updateDraft(draft.id, {
                            refreshIntervalMinutes: event.currentTarget.value,
                          })
                        }
                      />
                      <span>{copy.intervalUnit}</span>
                    </span>
                  </label>
                </div>

                <div className="custom-source-card__actions">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => handleSaveSource(draft)}
                  >
                    {copy.save}
                  </button>
                  <button
                    className="text-button"
                    type="button"
                    disabled={isTesting}
                    onClick={() => {
                      void handleTestSource(draft);
                    }}
                  >
                    {isTesting ? copy.testing : copy.test}
                  </button>
                  <button
                    className="text-button custom-source-card__delete"
                    type="button"
                    onClick={() => handleDeleteSource(draft)}
                  >
                    {copy.delete}
                  </button>
                </div>

                {testResult ? (
                  <div
                    className="custom-source-card__result"
                    data-tone={testResult.tone}
                  >
                    <strong>{testResult.title}</strong>
                    <span>{testResult.message}</span>
                    {testResult.snapshot ? (
                      <dl className="custom-source-card__preview">
                        <div>
                          <dt>{copy.responsePreview}</dt>
                          <dd>
                            {testResult.snapshot.label} ·{" "}
                            {testResult.snapshot.remaining ?? "-"} /{" "}
                            {testResult.snapshot.total ?? "-"}
                          </dd>
                        </div>
                      </dl>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <details className="custom-source-protocol">
        <summary>{copy.protocolTitle}</summary>
        <p className="body-copy">{copy.protocolHelp}</p>
        <div className="custom-source-protocol__examples">
          <pre>{formatExample(MINIMUM_EXAMPLE)}</pre>
          <pre>{formatExample(FULL_EXAMPLE)}</pre>
        </div>
      </details>
    </section>
  );
}
