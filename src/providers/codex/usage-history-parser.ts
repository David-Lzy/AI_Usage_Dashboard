import type {
  ProviderUsageHistory,
  ProviderUsageHistoryPoint,
  ProviderUsageHistoryValue,
} from "../types";
import { normalizeProviderUsageHistory } from "../../shared/provider-usage-history";
import type { CodexObservedUsageHistoryContract } from "./usage-history-contract";

const SURFACE_LABELS: Record<string, string> = {
  desktop_app: "Desktop App",
  vscode: "Extension",
  exec: "Exec",
  cli: "CLI",
  web: "Cloud",
  github: "GitHub Turn",
  github_code_review: "GitHub Code Review",
  unknown: "Uncategorized",
};

const CLIENT_SURFACES: Record<string, string> = {
  CODEX_DESKTOP_APP: "desktop_app",
  CODEX_IDE_VSCODE: "vscode",
  CODEX_SERVICE_EXEC: "exec",
  CODEX_CLI: "cli",
  CODEX_WEB: "web",
  CODEX_GITHUB: "github",
  CODEX_UNKNOWN_DEFAULT: "unknown",
};

function normalizeSeriesLabel(id: string): string {
  return SURFACE_LABELS[id] ?? id;
}

function buildPersonalUsagePoints(
  contract: CodexObservedUsageHistoryContract,
): ProviderUsageHistoryPoint[] {
  return (contract.dailyTokenUsageBreakdown?.data ?? []).map((entry) => {
    const rawValues = Object.entries(entry.product_surface_usage_values).flatMap(
      ([id, value]) =>
        typeof value === "number" && Number.isFinite(value) && value >= 0
          ? [{ id, label: normalizeSeriesLabel(id), value }]
          : [],
    );
    const total = rawValues.reduce((sum, item) => sum + item.value, 0);

    return {
      date: entry.date,
      values: rawValues.map((item) => ({
        ...item,
        value: total > 0 ? (item.value / total) * 100 : 0,
      })),
    };
  });
}

function mergeValues(
  values: Array<{ id: string; label: string; value: number }>,
): ProviderUsageHistoryValue[] {
  const merged = new Map<string, ProviderUsageHistoryValue>();

  for (const value of values) {
    const current = merged.get(value.id);
    merged.set(value.id, {
      ...value,
      value: (current?.value ?? 0) + value.value,
    });
  }

  return [...merged.values()];
}

function buildTurnsByModelPoints(
  contract: CodexObservedUsageHistoryContract,
): ProviderUsageHistoryPoint[] {
  return (contract.dailyWorkspaceUsageCounts?.data ?? []).map((entry) => ({
    date: entry.date,
    values: mergeValues(
      entry.models.flatMap((model) =>
        typeof model.turns === "number" && Number.isFinite(model.turns)
          ? [{ id: model.model, label: model.model, value: model.turns }]
          : [],
      ),
    ),
  }));
}

function buildTurnsBySurfacePoints(
  contract: CodexObservedUsageHistoryContract,
): ProviderUsageHistoryPoint[] {
  return (contract.dailyWorkspaceUsageCounts?.data ?? []).map((entry) => ({
    date: entry.date,
    values: mergeValues(
      entry.clients.flatMap((client) => {
        if (typeof client.turns !== "number" || !Number.isFinite(client.turns)) {
          return [];
        }
        const id = CLIENT_SURFACES[client.client_id] ?? client.client_id;
        return [{ id, label: normalizeSeriesLabel(id), value: client.turns }];
      }),
    ),
  }));
}

export function parseCodexUsageHistory(
  contract: CodexObservedUsageHistoryContract | null | undefined,
  capturedAt: string,
): ProviderUsageHistory | undefined {
  if (!contract) {
    return undefined;
  }

  const personalPoints = buildPersonalUsagePoints(contract);
  const byModel = buildTurnsByModelPoints(contract);
  const bySurface = buildTurnsBySurfacePoints(contract);
  const total = (contract.dailyWorkspaceUsageCounts?.data ?? []).reduce(
    (sum, entry) =>
      sum +
      (typeof entry.totals.turns === "number" &&
      Number.isFinite(entry.totals.turns)
        ? entry.totals.turns
        : 0),
    0,
  );

  return normalizeProviderUsageHistory({
    capturedAt,
    personalUsageBySurface: { points: personalPoints },
    turns: { total, byModel, bySurface },
  });
}
