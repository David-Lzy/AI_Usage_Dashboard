import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CodexBarDashboardBridgeSettings } from "./CodexBarDashboardBridgeSettings";

describe("CodexBarDashboardBridgeSettings", () => {
  it("renders explicit experimental setup and sanitized managed rows", () => {
    const html = renderToStaticMarkup(
      <CodexBarDashboardBridgeSettings
        locale="en"
        customSources={[
          {
            id: "custom:codexbar-codex-1a2b3c4d",
            label: "CodexBar · Codex",
            description: "Authenticated local CodexBar dashboard snapshot",
            endpointUrl: "http://127.0.0.1:8080/dashboard/v1/snapshot",
            displayEnabled: true,
            refreshIntervalMinutes: 15,
            createdAt: "2026-07-25T12:00:00.000Z",
            updatedAt: "2026-07-25T12:00:00.000Z",
            managedBy: "codexbar-dashboard",
          },
        ]}
        customSourceStates={[
          {
            sourceId: "custom:codexbar-codex-1a2b3c4d",
            status: "ok",
            snapshot: null,
            lastAttemptAt: "2026-07-25T12:00:00.000Z",
            lastSuccessAt: "2026-07-25T12:00:00.000Z",
            lastFailureAt: null,
            lastFailureReason: null,
            stale: false,
          },
        ]}
      />,
    );

    expect(html).toContain('data-codexbar-bridge-settings=""');
    expect(html).toContain("Experimental local integration");
    expect(html).toContain("Connect / test");
    expect(html).toContain("Clear token");
    expect(html).toContain("Disconnect");
    expect(html).toContain("CodexBar · Codex");
    expect(html).toContain('type="password"');
    expect(html).not.toContain("accountEmail");
  });

  it("renders Simplified Chinese setup copy", () => {
    const html = renderToStaticMarkup(
      <CodexBarDashboardBridgeSettings
        locale="zh-CN"
        customSources={[]}
        customSourceStates={[]}
      />,
    );
    expect(html).toContain("实验性本地集成");
    expect(html).toContain("连接并测试");
    expect(html).toContain("脱敏来源列表");
  });
});
