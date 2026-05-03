import type { RuntimeI18n } from "./i18n";

export function buildStoreWorkflowLocalizedCopy(i18n: RuntimeI18n) {
  if (i18n.resolvedLocale === "zh-CN") {
    const presetHeadlines: Record<string, string> = {
      "toolbar-first-quick-glance": "Toolbar-first 快速概览 seed 已应用",
      "setup-guidance": "Setup guidance seed 已应用",
      "honest-contract-or-policy-only": "Contract-only seed 已应用",
      "settings-and-setup-depth": "Settings depth seed 已应用",
      "provider-or-dashboard-depth": "Provider depth seed 已应用",
      unlock: "截图 seed lock 已清除",
    };
    const presetDetails: Record<string, string> = {
      "toolbar-first-quick-glance":
        "Cursor、Claude Code 和 Codex 会在一个健康、以 popup 为中心的运行时状态里可见，用于第一张 storyboard 截图。",
      "setup-guidance":
        "Cursor 缺少 host access，Codex 缺少 workspace credentials，因此 popup 可以真实展示 setup guidance。",
      "honest-contract-or-policy-only":
        "Gemini 是唯一可见 provider，因此 popup 会真实展示 policy-only 覆盖面，而不是伪造 live precision。",
      "settings-and-setup-depth":
        "同一组混合 setup blockers 会被保留，让 Settings 承担 setup story，而不是让 popup 承担。",
      "provider-or-dashboard-depth":
        "Codex 会以 warning 但真实的详情复查状态可见，让 side panel 证明更深的 contract context。",
      unlock:
        "临时 store-screenshot seed lock 已移除。下一次正常打开 side panel 会回到常规 init flow。",
    };
    const submissionCaptions: Record<string, string> = {
      "toolbar-first-quick-glance":
        "在一个快速 popup 概览中查看可见 AI 工具状态。",
      "setup-guidance":
        "当访问权限或凭据缺失时，明确下一步配置动作。",
      "honest-contract-or-policy-only":
        "真实展示 provider 覆盖范围，不伪造不支持的 live usage。",
      "settings-and-setup-depth":
        "用 side panel 承担配置所有权和更深控制。",
      "provider-or-dashboard-depth":
        "当 popup 需要更多上下文时，打开更深的 provider 复查。",
    };

    return {
      screenshotSeed: {
        sectionLabel: "Store Screenshot 调试路由",
        applyingTitle: "正在应用截图 preset",
        failedTitle: "截图 preset 失败",
        applyingDetail: (preset: string) =>
          `扩展正在把 request-bound 截图 preset \`${preset}\` 应用到真实运行时存储。`,
        routeContractLabel: "路由合同",
        seedRouteFailedTitle: "Seed route 失败",
        internalToolingOnlyTitle: "仅限内部工具",
        contractDetail:
          "这个页面只用于在捕获 popup 或 side-panel 截图之前，seed 真实 extension-mode 运行时状态。它本身不是 store-facing 截图 surface。",
        temporaryLockActiveDetail:
          "临时 side-panel seed lock 会保持启用，直到 unlock preset 运行。",
        unlockRestoredDetail:
          "截图 seed lock 已清除，之前的扩展运行时状态也已恢复。",
        unlockNoBackupDetail:
          "临时 store-screenshot seed lock 已移除，但没有可恢复的 pre-seed 运行时状态，因此只清除了临时 lock。",
        submissionCaptionLabel: "提交支撑 caption",
        submissionCaptionDetail:
          "这个 caption 只帮助操作员确认当前 preset 对应的 store-listing story；它不会被注入最终 popup、side panel 或 full-page 截图。",
        presetHeadline: (preset: string, fallback: string) =>
          presetHeadlines[preset] ?? fallback,
        presetDetail: (preset: string, fallback: string) =>
          presetDetails[preset] ?? fallback,
        submissionCaption: (preset: string) =>
          submissionCaptions[preset] ?? "",
        routeFailedFallback: "截图 seed route 意外失败。",
      },
      nativePopupProbe: {
        sectionLabel: "Store Screenshot 调试路由",
        openingTitle: "正在打开原生 toolbar popup",
        requestedTitle: "已请求原生 popup",
        failedTitle: "原生 popup probe 失败",
        openingDetail:
          "这个辅助页面会要求 background service worker 调用 chrome.action.openPopup，让 RDP Chrome 暴露真实 toolbar bubble，而不是 popup app-window smoke helper。",
        acceptedMessage:
          "Chrome 已接受原生 toolbar action-popup 请求。只需让这个 probe 窗口保持打开到 RDP helper 检测并捕获 popup 为止。",
        routeContractLabel: "路由合同",
        didNotOpenTitle: "原生 popup 未打开",
        internalToolingOnlyTitle: "仅限内部工具",
        contractDetail:
          "这个页面只用于真实 RDP Chrome popup probing。它本身不是 store-facing 截图 surface，并且应在原生 toolbar bubble 被捕获或判定失败后关闭。",
      },
    } as const;
  }

  const presetHeadlines: Record<string, string> = {
    "toolbar-first-quick-glance": "Toolbar-first quick glance seed applied",
    "setup-guidance": "Setup guidance seed applied",
    "honest-contract-or-policy-only": "Contract-only seed applied",
    "settings-and-setup-depth": "Settings depth seed applied",
    "provider-or-dashboard-depth": "Provider depth seed applied",
    unlock: "Screenshot seed lock cleared",
  };
  const presetDetails: Record<string, string> = {
    "toolbar-first-quick-glance":
      "Cursor, Claude Code, and Codex are visible in one healthy popup-focused runtime state for the first storyboard screenshot.",
    "setup-guidance":
      "Cursor is missing host access and Codex is missing workspace credentials so the popup can truthfully show setup guidance.",
    "honest-contract-or-policy-only":
      "Gemini is the only visible provider so the popup truthfully shows policy-only coverage without faking live precision.",
    "settings-and-setup-depth":
      "The same mixed setup blockers are preserved so Settings can own the setup story instead of the popup.",
    "provider-or-dashboard-depth":
      "Codex is visible in a warning but truthful detail-review state so the side panel can prove deeper contract context.",
    unlock:
      "The temporary store-screenshot seed lock was removed. The next normal side-panel open will re-enter the regular init flow.",
  };
  const submissionCaptions: Record<string, string> = {
    "toolbar-first-quick-glance":
      "Check visible AI tool status in one quick popup glance.",
    "setup-guidance":
      "Know the next setup step when access or credentials are missing.",
    "honest-contract-or-policy-only":
      "See honest provider coverage without faking unsupported live usage.",
    "settings-and-setup-depth":
      "Use the side panel for setup ownership and deeper controls.",
    "provider-or-dashboard-depth":
      "Open deeper provider review when the popup needs more context.",
  };

  return {
    screenshotSeed: {
      sectionLabel: "Store Screenshot Debug Route",
      applyingTitle: "Applying screenshot preset",
      failedTitle: "Screenshot preset failed",
      applyingDetail: (preset: string) =>
        `The extension is applying the request-bound screenshot preset \`${preset}\` to real runtime storage now.`,
      routeContractLabel: "Route Contract",
      seedRouteFailedTitle: "Seed route failed",
      internalToolingOnlyTitle: "Internal tooling only",
      contractDetail:
        "This page exists only to seed truthful extension-mode runtime states before capturing popup or side-panel screenshots. It is not itself a store-facing screenshot surface.",
      temporaryLockActiveDetail:
        "The temporary side-panel seed lock is active until the unlock preset runs.",
      unlockRestoredDetail:
        "The screenshot seed lock was cleared and the previous extension runtime state was restored.",
      unlockNoBackupDetail:
        "The temporary store-screenshot seed lock was removed. No stored pre-seed runtime state was available to restore, so only the temporary lock was cleared.",
      submissionCaptionLabel: "Submission-support caption",
      submissionCaptionDetail:
        "This caption only helps the operator match the current preset to the store-listing story. It is not injected into the final popup, side-panel, or full-page screenshot.",
      presetHeadline: (preset: string, fallback: string) =>
        presetHeadlines[preset] ?? fallback,
      presetDetail: (preset: string, fallback: string) =>
        presetDetails[preset] ?? fallback,
      submissionCaption: (preset: string) =>
        submissionCaptions[preset] ?? "",
      routeFailedFallback: "The screenshot seed route failed unexpectedly.",
    },
    nativePopupProbe: {
      sectionLabel: "Store Screenshot Debug Route",
      openingTitle: "Opening native toolbar popup",
      requestedTitle: "Native popup requested",
      failedTitle: "Native popup probe failed",
      openingDetail:
        "This helper page asks the background service worker to call chrome.action.openPopup so RDP Chrome can expose the real toolbar bubble instead of the popup app-window smoke helper.",
      acceptedMessage:
        "Chrome accepted the native toolbar action-popup request. Keep this probe window open only long enough for the RDP helper to detect and capture the popup.",
      routeContractLabel: "Route Contract",
      didNotOpenTitle: "Native popup did not open",
      internalToolingOnlyTitle: "Internal tooling only",
      contractDetail:
        "This page exists only for truthful RDP Chrome popup probing. It is not itself a store-facing screenshot surface and should be closed once the native toolbar bubble is captured or rejected.",
    },
  };
}
