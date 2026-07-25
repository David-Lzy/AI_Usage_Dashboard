import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ProviderServiceStatus as ProviderServiceStatusModel } from "../../providers/types";
import { ProviderServiceStatus } from "./ProviderServiceStatus";

const STATUS: ProviderServiceStatusModel = {
  vendorId: "openai",
  brandId: "codex",
  level: "degraded",
  description: "Minor Service Outage",
  statusPageUrl: "https://status.openai.com",
  checkedAt: "2026-07-25T06:00:00.000Z",
  sourceUpdatedAt: "2026-07-25T05:58:00.000Z",
  retryAt: null,
  stale: false,
  failureReason: null,
  components: [],
  incidents: [
    {
      id: "incident-1",
      name: "Elevated errors",
      level: "degraded",
      status: "monitoring",
      updatedAt: "2026-07-25T05:59:00.000Z",
      url: "https://status.openai.com/incidents/incident-1",
    },
  ],
};

describe("ProviderServiceStatus", () => {
  it("renders service health separately from provider sync health", () => {
    const markup = renderToStaticMarkup(
      <ProviderServiceStatus locale="en" status={STATUS} />,
    );

    expect(markup).toContain('data-provider-service-status="openai"');
    expect(markup).toContain('data-provider-service-status-level="degraded"');
    expect(markup).toContain("Service status");
    expect(markup).toContain("Degraded");
    expect(markup).toContain(
      'href="https://status.openai.com/incidents/incident-1"',
    );
    expect(markup).not.toContain("syncStatus");
  });

  it("renders an accessible localized unknown state without a dead link", () => {
    const markup = renderToStaticMarkup(
      <ProviderServiceStatus density="detail" locale="zh-CN" status={null} />,
    );

    expect(markup).toContain("服务状态");
    expect(markup).toContain("状态未知");
    expect(markup).toContain("尚未检查");
    expect(markup).not.toContain("href=");
  });

  it("uses only verified official incident and status links", () => {
    const markup = renderToStaticMarkup(
      <ProviderServiceStatus density="detail" locale="en" status={STATUS} />,
    );

    expect(markup).toContain('href="https://status.openai.com"');
    expect(markup).not.toContain("stspg.io");
  });
});
