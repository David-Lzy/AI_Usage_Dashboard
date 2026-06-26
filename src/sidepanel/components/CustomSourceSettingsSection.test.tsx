import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CustomSourceSettingsSection } from "./CustomSourceSettingsSection";

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
});
