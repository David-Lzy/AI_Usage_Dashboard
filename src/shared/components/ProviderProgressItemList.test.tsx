import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createDefaultProgressItemsBySurface } from "../display-preferences";
import { createRuntimeI18n } from "../i18n";
import type { ProviderViewModel } from "../provider-view-models";
import { ProviderProgressItemList } from "./ProviderProgressItemList";

describe("ProviderProgressItemList", () => {
  it("localizes value-only tracked values without changing the provider label", () => {
    const i18n = createRuntimeI18n("zh-CN");
    const provider = {
      providerId: "codex-personal-page",
      providerLabel: "Codex",
      quotaWindow: "Monthly",
      quotaUnit: "requests",
      used: 12,
      remaining: null,
      total: null,
      resetAt: null,
      resetLabel: null,
      usageSummary: null,
      usageWindows: [],
      usageBalances: [],
      tone: "neutral",
      syncStatus: "ok",
      permissionStatus: "granted",
      currentSourceStateKind: "ready",
      displayTone: "neutral",
    } as unknown as ProviderViewModel;

    const html = renderToStaticMarkup(
      <ProviderProgressItemList
        displayStyle="line"
        i18n={i18n}
        progressColorBands={[]}
        progressItemsBySurface={createDefaultProgressItemsBySurface()}
        progressThicknessPx={10}
        provider={provider}
        surface="popup"
      />,
    );

    expect(html).toContain(">Monthly requests<");
    expect(html).toContain(">已跟踪12 请求<");
  });
});
