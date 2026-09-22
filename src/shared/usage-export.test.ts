import Papa from "papaparse";
import { describe, expect, it } from "vitest";
import type { AppState, ProviderId } from "../providers/types";
import { createDefaultAppState } from "./production-state";
import { addInactiveProviderAccount, getProviderAccountRuntime } from "./provider-accounts";
import { parseSub2ApiUsageResponse } from "../providers/sub2api/client";
import { buildUsageExport, getUsageExportRange, listUsageExportFamilies, protectUsageCsvText, serializeUsageCsv, USAGE_CSV_COLUMNS, type UsageExportFamily } from "./usage-export";

const ID = "sub2api-api-key", OTHER = "account_export-second";
const capture = "2026-09-22T11:50:00.000Z", now = new Date("2026-09-22T12:00:00Z");
const range = { start: "2026-09-20", end: "2026-09-22" };
const connection = { schemaVersion: 1 as const, displayLabel: "Synthetic", baseUrl: "https://private-host.example.test", insecureTransportAcknowledged: false };
function fixture() {
  let state = createDefaultAppState();
  const snapshot = state.providers.find((entry) => entry.providerId === ID)!;
  const setting = state.providerSettings.find((entry) => entry.id === ID)!;
  Object.assign(snapshot, { syncStatus: "ok", apiGatewayMetering: parseSub2ApiUsageResponse({ mode: "unrestricted", isValid: true, status: "active", unit: "USD", balance: 100,
    daily_usage: [{ date: range.start, requests: 0, total_tokens: 0, actual_cost: 1.25, cost: 2.5 }, { date: "2026-09-21", requests: 10, total_tokens: 1000, actual_cost: 3, cost: 4 }] }, { accountId: "default", connection, capturedAt: capture, requestedTimezone: "Asia/Tokyo" }) });
  Object.assign(setting, { status: "granted", credentialStatus: "configured" });
  state = addInactiveProviderAccount(state, { providerId: ID, accountId: OTHER, label: ' =SUM(1,2) "部署"\nثان', snapshot: { ...snapshot, apiGatewayMetering: { ...snapshot.apiGatewayMetering!, accountId: OTHER } }, setting });
  return state;
}
function build(state: AppState, accountId = "default", providerId: ProviderId = ID, family: UsageExportFamily = "gateway_daily") {
  return buildUsageExport(state, { providerId, accountId, family, range }, now);
}
function history(state: AppState) {
  const id = "codex-personal-page";
  const snapshot = state.providers.find((entry) => entry.providerId === id)!;
  snapshot.syncStatus = "ok";
  state.providerSettings.find((entry) => entry.id === id)!.status = "granted";
  snapshot.usageHistory = { capturedAt: capture, rangeStart: range.start, rangeEnd: "2026-09-21", granularity: "day",
    turns: { capturedAt: "2026-09-22T09:00:00Z", total: 12345,
      byModel: [{ date: range.start, values: [{ id: "INTERNAL_ID_SENTINEL", label: '+Model,"A"', value: 12 }] }],
      bySurface: [{ date: range.start, values: [{ id: "INTERNAL_SURFACE", label: "Desktop", value: 12 }] }] },
    personalUsageBySurface: { capturedAt: null, unit: "percent", points: [{ date: range.start, values: [{ id: "PRIVATE_SURFACE", label: "Extension", value: 25 }] }] } };
  return snapshot.usageHistory;
}

describe("allowlisted aggregate CSV", () => {
  it("round trips stable ordered schema, Unicode, quotes and formulas with BOM/CRLF", () => {
    const state = fixture(), before = structuredClone(state);
    const result = build(state, OTHER);
    expect(result.status).toBe("ready");
    expect(result.rows).toHaveLength(16);
    expect(result.csv.charCodeAt(0)).toBe(0xfeff);
    expect(result.csv).toContain("\r\n");
    const parsed = Papa.parse<Record<string, string>>(result.csv, { header: true, skipEmptyLines: true });
    expect(parsed.errors).toEqual([]);
    expect(parsed.meta.fields).toEqual([...USAGE_CSV_COLUMNS]);
    expect(parsed.data).toHaveLength(16);
    expect(parsed.data[0].account).toBe("account-2");
    expect(parsed.data[0].account_label).toBe(`'${getProviderAccountRuntime(state, ID, OTHER)!.metadata.label}`);
    expect(parsed.data[0]).toMatchObject({ source_timezone: "unknown", requested_timezone: "Asia/Tokyo", captured_at: capture, freshness: "fresh", observed_days: "2", selected_days: "3" });
    expect(state).toEqual(before);
    expect(result.csv).toBe(build(state, OTHER).csv);
    expect(result.filename).toBe("usage-sub2api-api-key-gateway_daily-2026-09-20-2026-09-22.csv");
  });
  it("retains null versus zero and separate actual/reference values, without filling missing dates", () => {
    const result = build(fixture());
    const rows = Papa.parse<Record<string, string>>(result.csv, { header: true, skipEmptyLines: true }).data;
    expect(rows.find((row) => row.date === range.start && row.metric === "requests")?.value).toBe("0");
    expect(rows.find((row) => row.date === range.start && row.metric === "input_tokens")?.value).toBe("");
    expect(rows.find((row) => row.date === range.start && row.metric === "actual_cost")).toMatchObject({ value: "1.25", unit: "currency", currency: "USD" });
    expect(rows.find((row) => row.date === range.start && row.metric === "reference_cost")?.value).toBe("2.5");
    expect(rows.some((row) => row.date === range.end)).toBe(false);
  });
  it("protects every textual cell but preserves validated negative numeric values", () => {
    for (const text of ["=1", "+1", "-1", "@SUM(1)", " \u00a0\u200b=1", "\t+1", "\rdata", "\ntext", "\u0000@A", "\u202e=1"]) {
      expect(protectUsageCsvText(text)).toBe(`'${text}`);
    }
    expect(protectUsageCsvText("normal العربية 中文")).toBe("normal العربية 中文");
    const row = build(fixture()).rows[0];
    const parsed = Papa.parse<Record<string, string>>(serializeUsageCsv([{ ...row, account_label: 'label,"quoted"\nnext', currency: "\u200b=1", series: "-SUM(1)", value: -1.25 }]), { header: true, skipEmptyLines: true });
    expect(parsed.errors).toEqual([]);
    expect(parsed.data[0]).toMatchObject({ account_label: 'label,"quoted"\nnext', currency: "'\u200b=1", series: "'-SUM(1)", value: "-1.25" });
  });
  it("never exports forbidden data, internal account/series IDs or an undated total", () => {
    const state = fixture();
    Object.assign(state, { credentials: "SECRET_SENTINEL", cookies: "COOKIE_SENTINEL" });
    const snapshot = getProviderAccountRuntime(state, ID, OTHER)!.snapshot;
    Object.assign(snapshot, { rawResponse: "RAW_SENTINEL", warningReason: "ERROR_SENTINEL", identity: "IDENTITY_SENTINEL" });
    const csv = build(state, OTHER).csv;
    for (const secret of ["SECRET_SENTINEL", "COOKIE_SENTINEL", "RAW_SENTINEL", "ERROR_SENTINEL", "IDENTITY_SENTINEL", "private-host.example.test", OTHER, "balance", "lastAttemptAt"]) expect(csv).not.toContain(secret);
    history(state);
    const turns = build(state, "default", "codex-personal-page", "turns_by_model");
    expect(turns.rows).toHaveLength(1);
    expect(turns.rows[0]).toMatchObject({ metric: "turns", value: 12, unit: "turns" });
    expect(turns.csv).not.toContain("INTERNAL_ID_SENTINEL");
    expect(turns.csv).not.toContain("12345");
    expect(turns.csv).not.toContain("Desktop");
  });
  it("uses module capture time, preserving legacy unknowns and failures instead of newest refresh", () => {
    const state = fixture();
    const data = history(state);
    expect(build(state, "default", "codex-personal-page", "turns_by_model")).toMatchObject({ freshness: "stale", capturedAt: "2026-09-22T09:00:00.000Z" });
    expect(build(state, "default", "codex-personal-page", "personal_usage_by_surface")).toMatchObject({ freshness: "unknown", capturedAt: null });
    data.turns!.capturedAt = "2026-09-22";
    expect(build(state, "default", "codex-personal-page", "turns_by_model").capturedAt).toBeNull();
    delete data.turns!.capturedAt;
    expect(build(state, "default", "codex-personal-page", "turns_by_model").capturedAt).toBe(capture);
    const metering = getProviderAccountRuntime(state, ID, "default")!.snapshot.apiGatewayMetering!;
    metering.dailyUsageContext!.capturedAt = "2026-09-22T09:00:00.000Z";
    metering.capturedAt = capture;
    expect(build(state)).toMatchObject({ freshness: "stale", capturedAt: "2026-09-22T09:00:00.000Z" });
    delete metering.dailyUsageContext;
    expect(build(state)).toMatchObject({ freshness: "unknown", capturedAt: null });
  });
  it("exports percentage observations separately and exposes only supported retained families", () => {
    const state = fixture(); history(state);
    expect(listUsageExportFamilies(state, "codex-personal-page", "default")).toEqual(["turns_by_model", "turns_by_surface", "personal_usage_by_surface"]);
    const result = build(state, "default", "codex-personal-page", "personal_usage_by_surface");
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({ metric: "usage_percent", value: 25, unit: "percent" });
    expect(getUsageExportRange(state, ID, "default", "gateway_daily")).toEqual({ start: range.start, end: "2026-09-21" });
  });
  it("rejects invalid range, removed account, mismatched cache and unavailable family", () => {
    const state = fixture();
    expect(buildUsageExport(state, { providerId: ID, accountId: "default", family: "gateway_daily", range: { start: "2026-02-30", end: range.end } }, now).status).toBe("invalid_range");
    expect(buildUsageExport(state, { providerId: ID, accountId: "default", family: "gateway_daily", range: { start: "2025-01-01", end: "2025-01-02" } }, now).status).toBe("empty");
    expect(build(state, "default", ID, "turns_by_model").status).toBe("unsupported");
    getProviderAccountRuntime(state, ID, OTHER)!.snapshot.apiGatewayMetering!.accountId = "default";
    expect(build(state, OTHER).status).toBe("unsupported");
    state.providerAccounts![ID]!.accounts = state.providerAccounts![ID]!.accounts.filter((account) => account.id !== OTHER);
    expect(build(state, OTHER)).toMatchObject({ status: "missing_account", rows: [], csv: "" });
  });
  it("retains separate source currencies and identifies failed/permission-blocked data as stale", () => {
    const state = fixture();
    const runtime = getProviderAccountRuntime(state, ID, "default")!;
    runtime.snapshot.apiGatewayMetering!.dailyUsage[1].totals.actualCost!.unit = "EUR";
    const result = build(state);
    expect(result.rows.filter((row) => row.metric === "actual_cost").map((row) => row.currency)).toEqual(["USD", "EUR"]);
    runtime.snapshot.lastAttemptAt = now.toISOString();
    runtime.snapshot.syncStatus = "error";
    expect(build(state)).toMatchObject({ freshness: "stale", capturedAt: capture });
    runtime.snapshot.syncStatus = "ok"; runtime.setting.status = "missing";
    expect(build(state).freshness).toBe("stale");
    runtime.setting.status = "granted";
    runtime.snapshot.apiGatewayMetering!.dailyUsageContext!.capturedAt = "2026-09-23T00:00:00Z";
    expect(build(state).freshness).toBe("unknown");
  });
});
