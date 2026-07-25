import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  CustomSourceSettingsSection,
  testCustomSourceEndpoint,
} from "./CustomSourceSettingsSection";
import { CUSTOM_SOURCE_HOST_ACCESS_MISSING_MESSAGE } from "../../background/custom-source-sync";
import type { CustomSourceSetting } from "../../shared/custom-sources";

function createCustomSourceSetting(
  overrides: Partial<CustomSourceSetting> = {},
): CustomSourceSetting {
  return {
    id: "custom:build_quota",
    label: "Build Quota",
    description: null,
    endpointUrl: "https://example.com/quota.json",
    displayEnabled: true,
    refreshIntervalMinutes: 30,
    createdAt: "2026-06-26T00:00:00.000Z",
    updatedAt: "2026-06-26T00:00:00.000Z",
    ...overrides,
  };
}

describe("CustomSourceSettingsSection", () => {
  it("renders custom source CRUD fields and JSON protocol help", () => {
    const html = renderToStaticMarkup(
      <CustomSourceSettingsSection
        locale="en"
        customSources={[
          {
            id: "custom:build_quota",
            label: "Build Quota",
            description: "Internal build minutes",
            endpointUrl: "https://example.com/quota.json",
            displayEnabled: true,
            refreshIntervalMinutes: 30,
            createdAt: "2026-06-26T00:00:00.000Z",
            updatedAt: "2026-06-26T01:00:00.000Z",
          },
        ]}
        customSourceStates={[
          {
            sourceId: "custom:build_quota",
            status: "ok",
            snapshot: null,
            lastAttemptAt: "2026-06-26T02:00:00.000Z",
            lastSuccessAt: "2026-06-26T02:00:00.000Z",
            lastFailureAt: null,
            lastFailureReason: null,
            stale: false,
          },
        ]}
        onChange={() => {}}
      />,
    );

    expect(html).toContain('data-custom-source-settings=""');
    expect(html).toContain('data-custom-source-card="custom:build_quota"');
    expect(html).toContain("Build Quota");
    expect(html).toContain("Endpoint URL");
    expect(html).toContain("Test endpoint");
    expect(html).toContain("JSON protocol");
    expect(html).toContain("ai-usage-dashboard.custom-source.v1");
    expect(html).toContain("HTML is not rendered");
  });

  it("renders Simplified Chinese first-pass copy", () => {
    const html = renderToStaticMarkup(
      <CustomSourceSettingsSection
        locale="zh-CN"
        customSources={[]}
        customSourceStates={[]}
        onChange={() => {}}
      />,
    );

    expect(html).toContain("自定义 JSON 来源");
    expect(html).toContain("新增来源");
    expect(html).toContain("还没有自定义来源");
  });

  it("does not expose managed CodexBar rows in the generic JSON editor", () => {
    const html = renderToStaticMarkup(
      <CustomSourceSettingsSection
        locale="en"
        customSources={[
          createCustomSourceSetting({
            id: "custom:codexbar-codex-1a2b3c4d",
            label: "CodexBar · Codex",
            endpointUrl: "http://127.0.0.1:8080/dashboard/v1/snapshot",
            managedBy: "codexbar-dashboard",
          }),
        ]}
        customSourceStates={[]}
        onChange={() => {}}
      />,
    );

    expect(html).toContain("No custom sources yet.");
    expect(html).not.toContain('data-custom-source-card="custom:codexbar');
  });

  it("returns a host-access failure without fetching when permission is denied", async () => {
    const requestHostAccess = vi.fn(async () => false);
    const fetchSnapshot = vi.fn();

    await expect(
      testCustomSourceEndpoint(createCustomSourceSetting(), {
        fetchSnapshot,
        requestHostAccess,
      }),
    ).resolves.toEqual({
      ok: false,
      code: "host_access_missing",
      message: CUSTOM_SOURCE_HOST_ACCESS_MISSING_MESSAGE,
    });
    expect(requestHostAccess).toHaveBeenCalledWith(
      "https://example.com/quota.json",
    );
    expect(fetchSnapshot).not.toHaveBeenCalled();
  });
});
