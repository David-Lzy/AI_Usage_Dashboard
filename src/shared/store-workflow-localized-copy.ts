import type { ResolvedAppLocale, RuntimeI18n } from "./i18n";

type StoreScreenshotPresetKey =
  | "toolbar-first-quick-glance"
  | "setup-guidance"
  | "honest-contract-or-policy-only"
  | "settings-and-setup-depth"
  | "provider-or-dashboard-depth"
  | "unlock";

type CaptionPresetKey = Exclude<StoreScreenshotPresetKey, "unlock">;

type StoreWorkflowCopyData = {
  screenshotSeed: {
    sectionLabel: string;
    applyingTitle: string;
    failedTitle: string;
    applyingDetail: (preset: string) => string;
    routeContractLabel: string;
    seedRouteFailedTitle: string;
    internalToolingOnlyTitle: string;
    contractDetail: string;
    temporaryLockActiveDetail: string;
    unlockRestoredDetail: string;
    unlockNoBackupDetail: string;
    submissionCaptionLabel: string;
    submissionCaptionDetail: string;
    presetHeadlines: Record<StoreScreenshotPresetKey, string>;
    presetDetails: Record<StoreScreenshotPresetKey, string>;
    submissionCaptions: Record<CaptionPresetKey, string>;
    routeFailedFallback: string;
  };
  nativePopupProbe: {
    sectionLabel: string;
    openingTitle: string;
    requestedTitle: string;
    failedTitle: string;
    openingDetail: string;
    acceptedMessage: string;
    routeContractLabel: string;
    didNotOpenTitle: string;
    internalToolingOnlyTitle: string;
    contractDetail: string;
  };
};

type StoreWorkflowErrorPresentationData = {
  screenshotSeedErrorDetail: (rawMessage: string) => string;
  nativePopupProbeErrorDetail: (rawMessage: string) => string;
};

const STORE_WORKFLOW_ERROR_PRESENTATION: Record<
  ResolvedAppLocale,
  StoreWorkflowErrorPresentationData
> = {
  en: {
    screenshotSeedErrorDetail: (rawMessage) =>
      `Runtime seed error: ${rawMessage}`,
    nativePopupProbeErrorDetail: (rawMessage) =>
      `Native popup probe error: ${rawMessage}`,
  },
  "zh-CN": {
    screenshotSeedErrorDetail: (rawMessage) =>
      `运行时 seed 错误：${rawMessage}`,
    nativePopupProbeErrorDetail: (rawMessage) =>
      `原生 popup probe 错误：${rawMessage}`,
  },
  "zh-TW": {
    screenshotSeedErrorDetail: (rawMessage) =>
      `Runtime seed 錯誤：${rawMessage}`,
    nativePopupProbeErrorDetail: (rawMessage) =>
      `原生 popup probe 錯誤：${rawMessage}`,
  },
  ja: {
    screenshotSeedErrorDetail: (rawMessage) =>
      `Runtime seed エラー: ${rawMessage}`,
    nativePopupProbeErrorDetail: (rawMessage) =>
      `Native popup probe エラー: ${rawMessage}`,
  },
  ko: {
    screenshotSeedErrorDetail: (rawMessage) =>
      `Runtime seed 오류: ${rawMessage}`,
    nativePopupProbeErrorDetail: (rawMessage) =>
      `Native popup probe 오류: ${rawMessage}`,
  },
  "es-419": {
    screenshotSeedErrorDetail: (rawMessage) =>
      `Error runtime del seed: ${rawMessage}`,
    nativePopupProbeErrorDetail: (rawMessage) =>
      `Error del native popup probe: ${rawMessage}`,
  },
  "pt-BR": {
    screenshotSeedErrorDetail: (rawMessage) =>
      `Erro runtime do seed: ${rawMessage}`,
    nativePopupProbeErrorDetail: (rawMessage) =>
      `Erro do native popup probe: ${rawMessage}`,
  },
  fr: {
    screenshotSeedErrorDetail: (rawMessage) =>
      `Erreur runtime du seed: ${rawMessage}`,
    nativePopupProbeErrorDetail: (rawMessage) =>
      `Erreur du native popup probe: ${rawMessage}`,
  },
  de: {
    screenshotSeedErrorDetail: (rawMessage) =>
      `Runtime-Seed-Fehler: ${rawMessage}`,
    nativePopupProbeErrorDetail: (rawMessage) =>
      `Native-Popup-Probe-Fehler: ${rawMessage}`,
  },
  it: {
    screenshotSeedErrorDetail: (rawMessage) =>
      `Errore runtime del seed: ${rawMessage}`,
    nativePopupProbeErrorDetail: (rawMessage) =>
      `Errore del native popup probe: ${rawMessage}`,
  },
  ru: {
    screenshotSeedErrorDetail: (rawMessage) =>
      `Ошибка runtime seed: ${rawMessage}`,
    nativePopupProbeErrorDetail: (rawMessage) =>
      `Ошибка native popup probe: ${rawMessage}`,
  },
  ar: {
    screenshotSeedErrorDetail: (rawMessage) =>
      `خطأ runtime seed: ${rawMessage}`,
    nativePopupProbeErrorDetail: (rawMessage) =>
      `خطأ native popup probe: ${rawMessage}`,
  },
  hi: {
    screenshotSeedErrorDetail: (rawMessage) =>
      `Runtime seed त्रुटि: ${rawMessage}`,
    nativePopupProbeErrorDetail: (rawMessage) =>
      `Native popup probe त्रुटि: ${rawMessage}`,
  },
  id: {
    screenshotSeedErrorDetail: (rawMessage) =>
      `Error runtime seed: ${rawMessage}`,
    nativePopupProbeErrorDetail: (rawMessage) =>
      `Error native popup probe: ${rawMessage}`,
  },
};

const STORE_WORKFLOW_COPY: Record<ResolvedAppLocale, StoreWorkflowCopyData> = {
  en: {
    screenshotSeed: {
      sectionLabel: "Store Screenshot Debug Route",
      applyingTitle: "Applying screenshot preset",
      failedTitle: "Screenshot preset failed",
      applyingDetail: (preset) =>
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
      presetHeadlines: {
        "toolbar-first-quick-glance": "Toolbar-first quick glance seed applied",
        "setup-guidance": "Setup guidance seed applied",
        "honest-contract-or-policy-only": "Contract-only seed applied",
        "settings-and-setup-depth": "Settings depth seed applied",
        "provider-or-dashboard-depth": "Provider depth seed applied",
        unlock: "Screenshot seed lock cleared",
      },
      presetDetails: {
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
      },
      submissionCaptions: {
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
      },
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
  },
  "zh-CN": {
    screenshotSeed: {
      sectionLabel: "Store Screenshot 调试路由",
      applyingTitle: "正在应用截图 preset",
      failedTitle: "截图 preset 失败",
      applyingDetail: (preset) =>
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
      presetHeadlines: {
        "toolbar-first-quick-glance": "Toolbar-first 快速概览 seed 已应用",
        "setup-guidance": "Setup guidance seed 已应用",
        "honest-contract-or-policy-only": "Contract-only seed 已应用",
        "settings-and-setup-depth": "Settings depth seed 已应用",
        "provider-or-dashboard-depth": "Provider depth seed 已应用",
        unlock: "截图 seed lock 已清除",
      },
      presetDetails: {
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
      },
      submissionCaptions: {
        "toolbar-first-quick-glance":
          "在一个快速 popup 概览中查看可见 AI 工具状态。",
        "setup-guidance": "当访问权限或凭据缺失时，明确下一步配置动作。",
        "honest-contract-or-policy-only":
          "真实展示 provider 覆盖范围，不伪造不支持的 live usage。",
        "settings-and-setup-depth": "用 side panel 承担配置所有权和更深控制。",
        "provider-or-dashboard-depth":
          "当 popup 需要更多上下文时，打开更深的 provider 复查。",
      },
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
  },
  "zh-TW": {
    screenshotSeed: {
      sectionLabel: "Store Screenshot 除錯路由",
      applyingTitle: "正在套用截圖 preset",
      failedTitle: "截圖 preset 失敗",
      applyingDetail: (preset) =>
        `擴充功能正在把 request-bound 截圖 preset \`${preset}\` 套用到真實 runtime storage。`,
      routeContractLabel: "路由合約",
      seedRouteFailedTitle: "Seed route 失敗",
      internalToolingOnlyTitle: "僅限內部工具",
      contractDetail:
        "這個頁面只用於在捕捉 popup 或 side-panel 截圖之前，seed 真實 extension-mode runtime state。它本身不是面向商店的截圖 surface。",
      temporaryLockActiveDetail:
        "臨時 side-panel seed lock 會保持啟用，直到 unlock preset 執行。",
      unlockRestoredDetail:
        "截圖 seed lock 已清除，先前的擴充功能 runtime state 也已復原。",
      unlockNoBackupDetail:
        "臨時 store-screenshot seed lock 已移除，但沒有可復原的 pre-seed runtime state，因此只清除了臨時 lock。",
      submissionCaptionLabel: "提交支援 caption",
      submissionCaptionDetail:
        "這個 caption 只協助 operator 對應目前 preset 與 store-listing story；它不會被注入最終 popup、side panel 或 full-page 截圖。",
      presetHeadlines: {
        "toolbar-first-quick-glance": "Toolbar-first 快速概覽 seed 已套用",
        "setup-guidance": "Setup guidance seed 已套用",
        "honest-contract-or-policy-only": "Contract-only seed 已套用",
        "settings-and-setup-depth": "Settings depth seed 已套用",
        "provider-or-dashboard-depth": "Provider depth seed 已套用",
        unlock: "截圖 seed lock 已清除",
      },
      presetDetails: {
        "toolbar-first-quick-glance":
          "Cursor、Claude Code 和 Codex 會在一個健康、以 popup 為中心的 runtime state 中可見，用於第一張 storyboard 截圖。",
        "setup-guidance":
          "Cursor 缺少 host access，Codex 缺少 workspace credentials，因此 popup 可以真實顯示 setup guidance。",
        "honest-contract-or-policy-only":
          "Gemini 是唯一可見 provider，因此 popup 會真實顯示 policy-only 覆蓋，而不是偽造 live precision。",
        "settings-and-setup-depth":
          "同一組混合 setup blockers 會被保留，讓 Settings 承擔 setup story，而不是讓 popup 承擔。",
        "provider-or-dashboard-depth":
          "Codex 會以 warning 但真實的 detail-review 狀態可見，讓 side panel 證明更深的 contract context。",
        unlock:
          "臨時 store-screenshot seed lock 已移除。下一次正常開啟 side panel 會回到一般 init flow。",
      },
      submissionCaptions: {
        "toolbar-first-quick-glance":
          "在快速 popup 概覽中查看可見 AI 工具狀態。",
        "setup-guidance": "當存取權或 credentials 缺失時，明確下一步設定動作。",
        "honest-contract-or-policy-only":
          "真實顯示 provider 覆蓋範圍，不偽造不支援的 live usage。",
        "settings-and-setup-depth": "用 side panel 承擔設定所有權和更深控制。",
        "provider-or-dashboard-depth":
          "當 popup 需要更多上下文時，開啟更深的 provider 複查。",
      },
      routeFailedFallback: "截圖 seed route 意外失敗。",
    },
    nativePopupProbe: {
      sectionLabel: "Store Screenshot 除錯路由",
      openingTitle: "正在開啟原生 toolbar popup",
      requestedTitle: "已請求原生 popup",
      failedTitle: "原生 popup probe 失敗",
      openingDetail:
        "這個輔助頁面會要求 background service worker 呼叫 chrome.action.openPopup，讓 RDP Chrome 暴露真實 toolbar bubble，而不是 popup app-window smoke helper。",
      acceptedMessage:
        "Chrome 已接受原生 toolbar action-popup 請求。只需讓這個 probe 視窗保持開啟到 RDP helper 偵測並捕捉 popup 為止。",
      routeContractLabel: "路由合約",
      didNotOpenTitle: "原生 popup 未開啟",
      internalToolingOnlyTitle: "僅限內部工具",
      contractDetail:
        "這個頁面只用於真實 RDP Chrome popup probing。它本身不是面向商店的截圖 surface，並且應在原生 toolbar bubble 被捕捉或判定失敗後關閉。",
    },
  },
  ja: {
    screenshotSeed: {
      sectionLabel: "Store Screenshot デバッグ route",
      applyingTitle: "スクリーンショット preset を適用中",
      failedTitle: "スクリーンショット preset に失敗しました",
      applyingDetail: (preset) =>
        `拡張機能は request-bound screenshot preset \`${preset}\` を実 runtime storage に適用しています。`,
      routeContractLabel: "Route contract",
      seedRouteFailedTitle: "Seed route に失敗しました",
      internalToolingOnlyTitle: "内部ツール専用",
      contractDetail:
        "このページは popup または side-panel のスクリーンショットを撮る前に、正確な extension-mode runtime state を seed するためだけに存在します。これは store-facing screenshot surface ではありません。",
      temporaryLockActiveDetail:
        "一時 side-panel seed lock は unlock preset が実行されるまで有効です。",
      unlockRestoredDetail:
        "スクリーンショット seed lock が解除され、以前の extension runtime state が復元されました。",
      unlockNoBackupDetail:
        "一時 store-screenshot seed lock は削除されました。復元できる pre-seed runtime state がなかったため、一時 lock だけを解除しました。",
      submissionCaptionLabel: "提出サポート caption",
      submissionCaptionDetail:
        "この caption は operator が現在の preset と store-listing story を照合するためだけに使われます。最終的な popup、side panel、full-page screenshot には注入されません。",
      presetHeadlines: {
        "toolbar-first-quick-glance": "Toolbar-first quick glance seed を適用しました",
        "setup-guidance": "Setup guidance seed を適用しました",
        "honest-contract-or-policy-only": "Contract-only seed を適用しました",
        "settings-and-setup-depth": "Settings depth seed を適用しました",
        "provider-or-dashboard-depth": "Provider depth seed を適用しました",
        unlock: "スクリーンショット seed lock を解除しました",
      },
      presetDetails: {
        "toolbar-first-quick-glance":
          "最初の storyboard screenshot 向けに、Cursor、Claude Code、Codex が健康な popup 中心の runtime state で表示されます。",
        "setup-guidance":
          "Cursor は host access を欠き、Codex は workspace credentials を欠くため、popup は setup guidance を正確に表示できます。",
        "honest-contract-or-policy-only":
          "Gemini だけが表示されるため、popup は live precision を偽らず policy-only coverage を正確に示します。",
        "settings-and-setup-depth":
          "同じ mixed setup blockers を維持し、popup ではなく Settings が setup story を担います。",
        "provider-or-dashboard-depth":
          "Codex は warning だが正確な detail-review state で表示され、side panel が深い contract context を示せます。",
        unlock:
          "一時 store-screenshot seed lock は削除されました。次に通常どおり side panel を開くと regular init flow に戻ります。",
      },
      submissionCaptions: {
        "toolbar-first-quick-glance":
          "短い popup glance で表示中の AI tool status を確認します。",
        "setup-guidance":
          "access や credentials が欠けているときに次の setup step を明確にします。",
        "honest-contract-or-policy-only":
          "未対応の live usage を偽らず、正直な provider coverage を表示します。",
        "settings-and-setup-depth":
          "setup ownership と深い controls には side panel を使います。",
        "provider-or-dashboard-depth":
          "popup に追加 context が必要なとき、深い provider review を開きます。",
      },
      routeFailedFallback: "スクリーンショット seed route が予期せず失敗しました。",
    },
    nativePopupProbe: {
      sectionLabel: "Store Screenshot デバッグ route",
      openingTitle: "native toolbar popup を開いています",
      requestedTitle: "native popup を要求しました",
      failedTitle: "native popup probe に失敗しました",
      openingDetail:
        "この helper page は background service worker に chrome.action.openPopup を呼ばせ、RDP Chrome が popup app-window smoke helper ではなく実 toolbar bubble を露出できるようにします。",
      acceptedMessage:
        "Chrome は native toolbar action-popup request を受け付けました。RDP helper が popup を検出して capture するまで、この probe window を開いたままにしてください。",
      routeContractLabel: "Route contract",
      didNotOpenTitle: "native popup は開きませんでした",
      internalToolingOnlyTitle: "内部ツール専用",
      contractDetail:
        "このページは正確な RDP Chrome popup probing のためだけに存在します。これは store-facing screenshot surface ではなく、native toolbar bubble が capture または reject されたら閉じる必要があります。",
    },
  },
  ko: {
    screenshotSeed: {
      sectionLabel: "Store Screenshot 디버그 route",
      applyingTitle: "스크린샷 preset 적용 중",
      failedTitle: "스크린샷 preset 실패",
      applyingDetail: (preset) =>
        `확장 프로그램이 request-bound screenshot preset \`${preset}\` 을 실제 runtime storage 에 적용하고 있습니다.`,
      routeContractLabel: "Route contract",
      seedRouteFailedTitle: "Seed route 실패",
      internalToolingOnlyTitle: "내부 도구 전용",
      contractDetail:
        "이 페이지는 popup 또는 side-panel screenshots 를 캡처하기 전에 truthful extension-mode runtime states 를 seed 하기 위한 용도입니다. 이 페이지 자체는 store-facing screenshot surface 가 아닙니다.",
      temporaryLockActiveDetail:
        "임시 side-panel seed lock 은 unlock preset 이 실행될 때까지 활성 상태입니다.",
      unlockRestoredDetail:
        "스크린샷 seed lock 이 해제되었고 이전 extension runtime state 가 복원되었습니다.",
      unlockNoBackupDetail:
        "임시 store-screenshot seed lock 이 제거되었습니다. 복원할 pre-seed runtime state 가 없어 임시 lock 만 해제했습니다.",
      submissionCaptionLabel: "제출 지원 caption",
      submissionCaptionDetail:
        "이 caption 은 operator 가 현재 preset 을 store-listing story 와 맞춰보도록 돕는 용도입니다. 최종 popup, side panel, full-page screenshot 에 주입되지 않습니다.",
      presetHeadlines: {
        "toolbar-first-quick-glance": "Toolbar-first quick glance seed 적용됨",
        "setup-guidance": "Setup guidance seed 적용됨",
        "honest-contract-or-policy-only": "Contract-only seed 적용됨",
        "settings-and-setup-depth": "Settings depth seed 적용됨",
        "provider-or-dashboard-depth": "Provider depth seed 적용됨",
        unlock: "스크린샷 seed lock 해제됨",
      },
      presetDetails: {
        "toolbar-first-quick-glance":
          "첫 storyboard screenshot 을 위해 Cursor, Claude Code, Codex 가 건강한 popup 중심 runtime state 에서 표시됩니다.",
        "setup-guidance":
          "Cursor 는 host access 가 없고 Codex 는 workspace credentials 가 없어서 popup 이 setup guidance 를 사실대로 표시할 수 있습니다.",
        "honest-contract-or-policy-only":
          "Gemini 만 visible provider 이므로 popup 은 live precision 을 꾸미지 않고 policy-only coverage 를 사실대로 표시합니다.",
        "settings-and-setup-depth":
          "동일한 mixed setup blockers 를 보존해 popup 대신 Settings 가 setup story 를 담당합니다.",
        "provider-or-dashboard-depth":
          "Codex 는 warning 이지만 truthful detail-review state 로 표시되어 side panel 이 더 깊은 contract context 를 증명합니다.",
        unlock:
          "임시 store-screenshot seed lock 이 제거되었습니다. 다음 정상 side-panel 열기는 regular init flow 로 돌아갑니다.",
      },
      submissionCaptions: {
        "toolbar-first-quick-glance":
          "빠른 popup glance 에서 visible AI tool status 를 확인합니다.",
        "setup-guidance":
          "access 또는 credentials 가 없을 때 다음 setup step 을 명확히 합니다.",
        "honest-contract-or-policy-only":
          "지원되지 않는 live usage 를 꾸미지 않고 honest provider coverage 를 표시합니다.",
        "settings-and-setup-depth":
          "setup ownership 과 더 깊은 controls 에 side panel 을 사용합니다.",
        "provider-or-dashboard-depth":
          "popup 에 더 많은 context 가 필요할 때 deeper provider review 를 엽니다.",
      },
      routeFailedFallback: "스크린샷 seed route 가 예기치 않게 실패했습니다.",
    },
    nativePopupProbe: {
      sectionLabel: "Store Screenshot 디버그 route",
      openingTitle: "native toolbar popup 여는 중",
      requestedTitle: "native popup 요청됨",
      failedTitle: "native popup probe 실패",
      openingDetail:
        "이 helper page 는 background service worker 에 chrome.action.openPopup 호출을 요청해 RDP Chrome 이 popup app-window smoke helper 대신 실제 toolbar bubble 을 노출하도록 합니다.",
      acceptedMessage:
        "Chrome 이 native toolbar action-popup request 를 수락했습니다. RDP helper 가 popup 을 감지하고 캡처할 때까지만 이 probe window 를 열어 두세요.",
      routeContractLabel: "Route contract",
      didNotOpenTitle: "native popup 이 열리지 않음",
      internalToolingOnlyTitle: "내부 도구 전용",
      contractDetail:
        "이 페이지는 truthful RDP Chrome popup probing 전용입니다. store-facing screenshot surface 가 아니며 native toolbar bubble 이 캡처되거나 거부되면 닫아야 합니다.",
    },
  },
  "es-419": {
    screenshotSeed: {
      sectionLabel: "Ruta de depuración de Store Screenshot",
      applyingTitle: "Aplicando preset de screenshot",
      failedTitle: "Falló el preset de screenshot",
      applyingDetail: (preset) =>
        `La extensión está aplicando el preset de screenshot request-bound \`${preset}\` al runtime storage real.`,
      routeContractLabel: "Contrato de ruta",
      seedRouteFailedTitle: "Falló la ruta seed",
      internalToolingOnlyTitle: "Solo tooling interno",
      contractDetail:
        "Esta página solo existe para seed estados runtime veraces en extension-mode antes de capturar screenshots de popup o side-panel. No es una screenshot surface orientada a la tienda.",
      temporaryLockActiveDetail:
        "El side-panel seed lock temporal sigue activo hasta que se ejecute el preset unlock.",
      unlockRestoredDetail:
        "El screenshot seed lock se limpió y el estado runtime anterior de la extensión fue restaurado.",
      unlockNoBackupDetail:
        "El store-screenshot seed lock temporal se removió. No había estado runtime pre-seed para restaurar, así que solo se limpió el lock temporal.",
      submissionCaptionLabel: "Caption de apoyo para envío",
      submissionCaptionDetail:
        "Este caption solo ayuda al operator a vincular el preset actual con la story del store listing. No se inyecta en el popup, side panel o full-page screenshot final.",
      presetHeadlines: {
        "toolbar-first-quick-glance": "Seed de vistazo toolbar-first aplicado",
        "setup-guidance": "Seed de setup guidance aplicado",
        "honest-contract-or-policy-only": "Seed contract-only aplicado",
        "settings-and-setup-depth": "Seed de profundidad Settings aplicado",
        "provider-or-dashboard-depth": "Seed de profundidad provider aplicado",
        unlock: "Screenshot seed lock limpiado",
      },
      presetDetails: {
        "toolbar-first-quick-glance":
          "Cursor, Claude Code y Codex quedan visibles en un runtime state saludable centrado en popup para el primer storyboard screenshot.",
        "setup-guidance":
          "Cursor no tiene host access y Codex no tiene workspace credentials, por lo que el popup puede mostrar setup guidance con honestidad.",
        "honest-contract-or-policy-only":
          "Gemini es el único provider visible, así que el popup muestra coverage policy-only sin fingir precisión live.",
        "settings-and-setup-depth":
          "Se preservan los mismos mixed setup blockers para que Settings cuente la setup story en vez del popup.",
        "provider-or-dashboard-depth":
          "Codex aparece en un estado warning pero veraz de detail-review para que el side panel muestre contract context más profundo.",
        unlock:
          "Se quitó el store-screenshot seed lock temporal. La próxima apertura normal del side-panel volverá al regular init flow.",
      },
      submissionCaptions: {
        "toolbar-first-quick-glance":
          "Revisa el estado visible de las herramientas de IA en un vistazo rápido del popup.",
        "setup-guidance":
          "Conoce el siguiente paso de configuración cuando faltan access o credentials.",
        "honest-contract-or-policy-only":
          "Muestra coverage honesta de provider sin fingir live usage no soportado.",
        "settings-and-setup-depth":
          "Usa el side panel para ownership de setup y controles más profundos.",
        "provider-or-dashboard-depth":
          "Abre una revisión de provider más profunda cuando el popup necesita más contexto.",
      },
      routeFailedFallback: "La ruta screenshot seed falló inesperadamente.",
    },
    nativePopupProbe: {
      sectionLabel: "Ruta de depuración de Store Screenshot",
      openingTitle: "Abriendo popup nativo de toolbar",
      requestedTitle: "Popup nativo solicitado",
      failedTitle: "Falló el probe de popup nativo",
      openingDetail:
        "Esta página helper pide al background service worker llamar chrome.action.openPopup para que RDP Chrome exponga la burbuja toolbar real en vez del popup app-window smoke helper.",
      acceptedMessage:
        "Chrome aceptó el request nativo toolbar action-popup. Mantén esta ventana probe abierta solo hasta que el helper RDP detecte y capture el popup.",
      routeContractLabel: "Contrato de ruta",
      didNotOpenTitle: "El popup nativo no se abrió",
      internalToolingOnlyTitle: "Solo tooling interno",
      contractDetail:
        "Esta página existe solo para probing veraz del popup en RDP Chrome. No es una screenshot surface orientada a la tienda y debe cerrarse cuando la burbuja toolbar nativa se capture o se rechace.",
    },
  },
  "pt-BR": {
    screenshotSeed: {
      sectionLabel: "Rota de depuração de Store Screenshot",
      applyingTitle: "Aplicando preset de screenshot",
      failedTitle: "Preset de screenshot falhou",
      applyingDetail: (preset) =>
        `A extensão está aplicando o preset de screenshot request-bound \`${preset}\` ao runtime storage real.`,
      routeContractLabel: "Contrato da rota",
      seedRouteFailedTitle: "Seed route falhou",
      internalToolingOnlyTitle: "Somente tooling interno",
      contractDetail:
        "Esta página existe apenas para aplicar seed de estados runtime verdadeiros em extension-mode antes de capturar screenshots de popup ou side-panel. Ela não é uma screenshot surface voltada à loja.",
      temporaryLockActiveDetail:
        "O side-panel seed lock temporário permanece ativo até o preset unlock rodar.",
      unlockRestoredDetail:
        "O screenshot seed lock foi limpo e o estado runtime anterior da extensão foi restaurado.",
      unlockNoBackupDetail:
        "O store-screenshot seed lock temporário foi removido. Não havia estado runtime pre-seed para restaurar, então apenas o lock temporário foi limpo.",
      submissionCaptionLabel: "Caption de suporte à submissão",
      submissionCaptionDetail:
        "Este caption só ajuda o operator a ligar o preset atual à store-listing story. Ele não é injetado no popup, side panel ou full-page screenshot final.",
      presetHeadlines: {
        "toolbar-first-quick-glance": "Seed toolbar-first quick glance aplicado",
        "setup-guidance": "Seed de setup guidance aplicado",
        "honest-contract-or-policy-only": "Seed contract-only aplicado",
        "settings-and-setup-depth": "Seed de profundidade Settings aplicado",
        "provider-or-dashboard-depth": "Seed de profundidade provider aplicado",
        unlock: "Screenshot seed lock limpo",
      },
      presetDetails: {
        "toolbar-first-quick-glance":
          "Cursor, Claude Code e Codex ficam visíveis em um runtime state saudável focado no popup para o primeiro storyboard screenshot.",
        "setup-guidance":
          "Cursor não tem host access e Codex não tem workspace credentials, então o popup pode mostrar setup guidance com verdade.",
        "honest-contract-or-policy-only":
          "Gemini é o único provider visível, então o popup mostra coverage policy-only sem fingir live precision.",
        "settings-and-setup-depth":
          "Os mesmos mixed setup blockers são preservados para que Settings assuma a setup story em vez do popup.",
        "provider-or-dashboard-depth":
          "Codex aparece em warning mas com detail-review state verdadeiro para que o side panel prove contract context mais profundo.",
        unlock:
          "O store-screenshot seed lock temporário foi removido. A próxima abertura normal do side-panel voltará ao regular init flow.",
      },
      submissionCaptions: {
        "toolbar-first-quick-glance":
          "Confira o status visível das ferramentas de IA em uma olhada rápida no popup.",
        "setup-guidance":
          "Saiba o próximo passo de setup quando access ou credentials estiverem ausentes.",
        "honest-contract-or-policy-only":
          "Mostre coverage honesta de provider sem fingir live usage sem suporte.",
        "settings-and-setup-depth":
          "Use o side panel para ownership de setup e controles mais profundos.",
        "provider-or-dashboard-depth":
          "Abra uma revisão de provider mais profunda quando o popup precisar de mais contexto.",
      },
      routeFailedFallback: "A screenshot seed route falhou inesperadamente.",
    },
    nativePopupProbe: {
      sectionLabel: "Rota de depuração de Store Screenshot",
      openingTitle: "Abrindo popup nativo da toolbar",
      requestedTitle: "Popup nativo solicitado",
      failedTitle: "Probe de popup nativo falhou",
      openingDetail:
        "Esta página helper pede ao background service worker para chamar chrome.action.openPopup, para que o RDP Chrome exponha a bolha real da toolbar em vez do popup app-window smoke helper.",
      acceptedMessage:
        "Chrome aceitou o request nativo toolbar action-popup. Mantenha esta janela probe aberta só até o helper RDP detectar e capturar o popup.",
      routeContractLabel: "Contrato da rota",
      didNotOpenTitle: "O popup nativo não abriu",
      internalToolingOnlyTitle: "Somente tooling interno",
      contractDetail:
        "Esta página existe apenas para probing verdadeiro de popup no RDP Chrome. Ela não é uma screenshot surface voltada à loja e deve ser fechada quando a bolha nativa da toolbar for capturada ou rejeitada.",
    },
  },
  fr: {
    screenshotSeed: {
      sectionLabel: "Route de débogage Store Screenshot",
      applyingTitle: "Application du preset de screenshot",
      failedTitle: "Preset de screenshot échoué",
      applyingDetail: (preset) =>
        `L'extension applique maintenant le preset de screenshot request-bound \`${preset}\` au runtime storage réel.`,
      routeContractLabel: "Contrat de route",
      seedRouteFailedTitle: "Seed route échouée",
      internalToolingOnlyTitle: "Tooling interne uniquement",
      contractDetail:
        "Cette page sert uniquement à seed des états runtime véridiques en extension-mode avant de capturer des screenshots popup ou side-panel. Elle n'est pas elle-même une screenshot surface destinée au store.",
      temporaryLockActiveDetail:
        "Le side-panel seed lock temporaire reste actif jusqu'à l'exécution du preset unlock.",
      unlockRestoredDetail:
        "Le screenshot seed lock a été effacé et l'état runtime précédent de l'extension a été restauré.",
      unlockNoBackupDetail:
        "Le store-screenshot seed lock temporaire a été retiré. Aucun état runtime pre-seed n'était disponible à restaurer, donc seul le lock temporaire a été effacé.",
      submissionCaptionLabel: "Caption d'appui à la soumission",
      submissionCaptionDetail:
        "Ce caption aide seulement l'operator à associer le preset actuel à la store-listing story. Il n'est pas injecté dans le popup, side panel ou full-page screenshot final.",
      presetHeadlines: {
        "toolbar-first-quick-glance": "Seed toolbar-first quick glance appliqué",
        "setup-guidance": "Seed setup guidance appliqué",
        "honest-contract-or-policy-only": "Seed contract-only appliqué",
        "settings-and-setup-depth": "Seed de profondeur Settings appliqué",
        "provider-or-dashboard-depth": "Seed de profondeur provider appliqué",
        unlock: "Screenshot seed lock effacé",
      },
      presetDetails: {
        "toolbar-first-quick-glance":
          "Cursor, Claude Code et Codex sont visibles dans un runtime state sain centré sur le popup pour le premier storyboard screenshot.",
        "setup-guidance":
          "Cursor manque de host access et Codex manque de workspace credentials, ce qui permet au popup d'afficher honnêtement le setup guidance.",
        "honest-contract-or-policy-only":
          "Gemini est le seul provider visible, donc le popup affiche une coverage policy-only sans simuler de live precision.",
        "settings-and-setup-depth":
          "Les mêmes mixed setup blockers sont conservés afin que Settings porte la setup story plutôt que le popup.",
        "provider-or-dashboard-depth":
          "Codex est visible dans un état warning mais fidèle de detail-review, ce qui permet au side panel de prouver un contract context plus profond.",
        unlock:
          "Le store-screenshot seed lock temporaire a été retiré. La prochaine ouverture normale du side-panel reviendra au regular init flow.",
      },
      submissionCaptions: {
        "toolbar-first-quick-glance":
          "Vérifiez le statut visible des outils IA dans un aperçu popup rapide.",
        "setup-guidance":
          "Identifiez l'étape de setup suivante lorsque access ou credentials manquent.",
        "honest-contract-or-policy-only":
          "Montrez une coverage provider honnête sans simuler un live usage non supporté.",
        "settings-and-setup-depth":
          "Utilisez le side panel pour l'ownership du setup et des contrôles plus profonds.",
        "provider-or-dashboard-depth":
          "Ouvrez une revue provider plus profonde lorsque le popup a besoin de plus de contexte.",
      },
      routeFailedFallback: "La screenshot seed route a échoué de manière inattendue.",
    },
    nativePopupProbe: {
      sectionLabel: "Route de débogage Store Screenshot",
      openingTitle: "Ouverture du popup toolbar natif",
      requestedTitle: "Popup natif demandé",
      failedTitle: "Probe du popup natif échoué",
      openingDetail:
        "Cette page helper demande au background service worker d'appeler chrome.action.openPopup afin que RDP Chrome expose la vraie bulle toolbar plutôt que le popup app-window smoke helper.",
      acceptedMessage:
        "Chrome a accepté le request natif toolbar action-popup. Gardez cette fenêtre probe ouverte seulement le temps que le helper RDP détecte et capture le popup.",
      routeContractLabel: "Contrat de route",
      didNotOpenTitle: "Le popup natif ne s'est pas ouvert",
      internalToolingOnlyTitle: "Tooling interne uniquement",
      contractDetail:
        "Cette page existe uniquement pour un probing fidèle du popup RDP Chrome. Elle n'est pas une screenshot surface destinée au store et doit être fermée lorsque la bulle toolbar native est capturée ou rejetée.",
    },
  },
  de: {
    screenshotSeed: {
      sectionLabel: "Store-Screenshot-Debug-Route",
      applyingTitle: "Screenshot-preset wird angewendet",
      failedTitle: "Screenshot-preset fehlgeschlagen",
      applyingDetail: (preset) =>
        `Die Erweiterung wendet das request-bound screenshot preset \`${preset}\` jetzt auf den echten runtime storage an.`,
      routeContractLabel: "Route contract",
      seedRouteFailedTitle: "Seed route fehlgeschlagen",
      internalToolingOnlyTitle: "Nur internes tooling",
      contractDetail:
        "Diese Seite dient nur dazu, wahrheitsgemäße extension-mode runtime states zu seeden, bevor popup- oder side-panel-screenshots aufgenommen werden. Sie ist selbst keine store-facing screenshot surface.",
      temporaryLockActiveDetail:
        "Der temporäre side-panel seed lock bleibt aktiv, bis das unlock preset läuft.",
      unlockRestoredDetail:
        "Der screenshot seed lock wurde gelöscht und der vorherige extension runtime state wurde wiederhergestellt.",
      unlockNoBackupDetail:
        "Der temporäre store-screenshot seed lock wurde entfernt. Es war kein pre-seed runtime state zur Wiederherstellung verfügbar, daher wurde nur der temporäre lock gelöscht.",
      submissionCaptionLabel: "Submission-support caption",
      submissionCaptionDetail:
        "Diese caption hilft dem operator nur, das aktuelle preset der store-listing story zuzuordnen. Sie wird nicht in den finalen popup-, side-panel- oder full-page-screenshot injiziert.",
      presetHeadlines: {
        "toolbar-first-quick-glance": "Toolbar-first quick glance seed angewendet",
        "setup-guidance": "Setup guidance seed angewendet",
        "honest-contract-or-policy-only": "Contract-only seed angewendet",
        "settings-and-setup-depth": "Settings depth seed angewendet",
        "provider-or-dashboard-depth": "Provider depth seed angewendet",
        unlock: "Screenshot seed lock gelöscht",
      },
      presetDetails: {
        "toolbar-first-quick-glance":
          "Cursor, Claude Code und Codex sind in einem gesunden popup-fokussierten runtime state für den ersten storyboard screenshot sichtbar.",
        "setup-guidance":
          "Cursor fehlt host access und Codex fehlen workspace credentials, damit das popup setup guidance wahrheitsgemäß zeigen kann.",
        "honest-contract-or-policy-only":
          "Gemini ist der einzige sichtbare provider, daher zeigt das popup policy-only coverage ohne vorgetäuschte live precision.",
        "settings-and-setup-depth":
          "Dieselben mixed setup blockers bleiben erhalten, damit Settings die setup story statt des popups trägt.",
        "provider-or-dashboard-depth":
          "Codex ist in einem warning-, aber wahrheitsgemäßen detail-review state sichtbar, damit das side panel tieferen contract context zeigen kann.",
        unlock:
          "Der temporäre store-screenshot seed lock wurde entfernt. Das nächste normale Öffnen des side-panel kehrt zum regular init flow zurück.",
      },
      submissionCaptions: {
        "toolbar-first-quick-glance":
          "Sichtbaren AI-tool-status mit einem schnellen popup-Blick prüfen.",
        "setup-guidance":
          "Den nächsten setup step erkennen, wenn access oder credentials fehlen.",
        "honest-contract-or-policy-only":
          "Ehrliche provider coverage zeigen, ohne nicht unterstützte live usage vorzutäuschen.",
        "settings-and-setup-depth":
          "Das side panel für setup ownership und tiefere controls verwenden.",
        "provider-or-dashboard-depth":
          "Tiefere provider review öffnen, wenn das popup mehr context braucht.",
      },
      routeFailedFallback: "Die screenshot seed route ist unerwartet fehlgeschlagen.",
    },
    nativePopupProbe: {
      sectionLabel: "Store-Screenshot-Debug-Route",
      openingTitle: "Native toolbar popup wird geöffnet",
      requestedTitle: "Native popup angefordert",
      failedTitle: "Native popup probe fehlgeschlagen",
      openingDetail:
        "Diese helper page fordert den background service worker auf, chrome.action.openPopup aufzurufen, damit RDP Chrome die echte toolbar bubble statt des popup app-window smoke helper anzeigen kann.",
      acceptedMessage:
        "Chrome hat den nativen toolbar action-popup request akzeptiert. Dieses probe window nur so lange offen halten, bis der RDP helper das popup erkennt und aufnimmt.",
      routeContractLabel: "Route contract",
      didNotOpenTitle: "Native popup wurde nicht geöffnet",
      internalToolingOnlyTitle: "Nur internes tooling",
      contractDetail:
        "Diese Seite existiert nur für wahrheitsgemäßes RDP Chrome popup probing. Sie ist selbst keine store-facing screenshot surface und sollte geschlossen werden, sobald die native toolbar bubble aufgenommen oder abgelehnt wurde.",
    },
  },
  it: {
    screenshotSeed: {
      sectionLabel: "Route debug Store Screenshot",
      applyingTitle: "Applicazione preset screenshot",
      failedTitle: "Preset screenshot non riuscito",
      applyingDetail: (preset) =>
        `L'estensione sta applicando il preset screenshot request-bound \`${preset}\` al runtime storage reale.`,
      routeContractLabel: "Contratto route",
      seedRouteFailedTitle: "Seed route non riuscita",
      internalToolingOnlyTitle: "Solo tooling interno",
      contractDetail:
        "Questa pagina esiste solo per fare seed di runtime state veritieri in extension-mode prima di catturare screenshot popup o side-panel. Non è una screenshot surface rivolta allo store.",
      temporaryLockActiveDetail:
        "Il side-panel seed lock temporaneo resta attivo finché viene eseguito il preset unlock.",
      unlockRestoredDetail:
        "Lo screenshot seed lock è stato cancellato e il runtime state precedente dell'estensione è stato ripristinato.",
      unlockNoBackupDetail:
        "Lo store-screenshot seed lock temporaneo è stato rimosso. Non era disponibile uno stato runtime pre-seed da ripristinare, quindi è stato cancellato solo il lock temporaneo.",
      submissionCaptionLabel: "Caption di supporto submission",
      submissionCaptionDetail:
        "Questo caption aiuta solo l'operator ad associare il preset corrente alla store-listing story. Non viene iniettato nel popup, side panel o full-page screenshot finale.",
      presetHeadlines: {
        "toolbar-first-quick-glance": "Seed toolbar-first quick glance applicato",
        "setup-guidance": "Seed setup guidance applicato",
        "honest-contract-or-policy-only": "Seed contract-only applicato",
        "settings-and-setup-depth": "Seed profondità Settings applicato",
        "provider-or-dashboard-depth": "Seed profondità provider applicato",
        unlock: "Screenshot seed lock cancellato",
      },
      presetDetails: {
        "toolbar-first-quick-glance":
          "Cursor, Claude Code e Codex sono visibili in un runtime state sano centrato sul popup per il primo storyboard screenshot.",
        "setup-guidance":
          "Cursor manca di host access e Codex manca di workspace credentials, quindi il popup può mostrare setup guidance in modo veritiero.",
        "honest-contract-or-policy-only":
          "Gemini è l'unico provider visibile, quindi il popup mostra coverage policy-only senza fingere live precision.",
        "settings-and-setup-depth":
          "Gli stessi mixed setup blockers sono preservati affinché Settings gestisca la setup story invece del popup.",
        "provider-or-dashboard-depth":
          "Codex è visibile in uno stato warning ma veritiero di detail-review, così il side panel può dimostrare contract context più profondo.",
        unlock:
          "Lo store-screenshot seed lock temporaneo è stato rimosso. La prossima apertura normale del side-panel rientrerà nel regular init flow.",
      },
      submissionCaptions: {
        "toolbar-first-quick-glance":
          "Controlla lo stato visibile degli strumenti IA in una rapida occhiata al popup.",
        "setup-guidance":
          "Individua il prossimo setup step quando mancano access o credentials.",
        "honest-contract-or-policy-only":
          "Mostra coverage provider onesta senza fingere live usage non supportato.",
        "settings-and-setup-depth":
          "Usa il side panel per ownership del setup e controlli più profondi.",
        "provider-or-dashboard-depth":
          "Apri una review provider più profonda quando il popup richiede più contesto.",
      },
      routeFailedFallback: "La screenshot seed route è fallita in modo inatteso.",
    },
    nativePopupProbe: {
      sectionLabel: "Route debug Store Screenshot",
      openingTitle: "Apertura popup toolbar nativo",
      requestedTitle: "Popup nativo richiesto",
      failedTitle: "Probe popup nativo non riuscito",
      openingDetail:
        "Questa helper page chiede al background service worker di chiamare chrome.action.openPopup, così RDP Chrome può esporre la vera toolbar bubble invece del popup app-window smoke helper.",
      acceptedMessage:
        "Chrome ha accettato il request nativo toolbar action-popup. Tieni aperta questa probe window solo finché l'helper RDP rileva e cattura il popup.",
      routeContractLabel: "Contratto route",
      didNotOpenTitle: "Il popup nativo non si è aperto",
      internalToolingOnlyTitle: "Solo tooling interno",
      contractDetail:
        "Questa pagina esiste solo per probing veritiero del popup RDP Chrome. Non è una screenshot surface rivolta allo store e deve essere chiusa quando la toolbar bubble nativa viene catturata o rifiutata.",
    },
  },
  ru: {
    screenshotSeed: {
      sectionLabel: "Отладочный route Store Screenshot",
      applyingTitle: "Применение screenshot preset",
      failedTitle: "Screenshot preset не выполнен",
      applyingDetail: (preset) =>
        `Расширение применяет request-bound screenshot preset \`${preset}\` к реальному runtime storage.`,
      routeContractLabel: "Route contract",
      seedRouteFailedTitle: "Seed route не выполнен",
      internalToolingOnlyTitle: "Только внутренний tooling",
      contractDetail:
        "Эта страница нужна только для seed правдивых extension-mode runtime states перед захватом popup или side-panel screenshots. Она сама не является store-facing screenshot surface.",
      temporaryLockActiveDetail:
        "Временный side-panel seed lock остается активным до запуска unlock preset.",
      unlockRestoredDetail:
        "Screenshot seed lock очищен, и предыдущий extension runtime state восстановлен.",
      unlockNoBackupDetail:
        "Временный store-screenshot seed lock удален. Pre-seed runtime state для восстановления не был доступен, поэтому очищен только временный lock.",
      submissionCaptionLabel: "Caption для поддержки submission",
      submissionCaptionDetail:
        "Этот caption только помогает operator сопоставить текущий preset со store-listing story. Он не внедряется в финальный popup, side panel или full-page screenshot.",
      presetHeadlines: {
        "toolbar-first-quick-glance": "Toolbar-first quick glance seed применен",
        "setup-guidance": "Setup guidance seed применен",
        "honest-contract-or-policy-only": "Contract-only seed применен",
        "settings-and-setup-depth": "Settings depth seed применен",
        "provider-or-dashboard-depth": "Provider depth seed применен",
        unlock: "Screenshot seed lock очищен",
      },
      presetDetails: {
        "toolbar-first-quick-glance":
          "Cursor, Claude Code и Codex видимы в здоровом popup-focused runtime state для первого storyboard screenshot.",
        "setup-guidance":
          "Cursor не хватает host access, а Codex не хватает workspace credentials, поэтому popup может честно показать setup guidance.",
        "honest-contract-or-policy-only":
          "Gemini является единственным видимым provider, поэтому popup честно показывает policy-only coverage без имитации live precision.",
        "settings-and-setup-depth":
          "Те же mixed setup blockers сохранены, чтобы Settings отвечал за setup story вместо popup.",
        "provider-or-dashboard-depth":
          "Codex видим в warning, но правдивом detail-review state, чтобы side panel показал более глубокий contract context.",
        unlock:
          "Временный store-screenshot seed lock удален. Следующее обычное открытие side-panel вернется к regular init flow.",
      },
      submissionCaptions: {
        "toolbar-first-quick-glance":
          "Проверьте видимый статус AI tools одним быстрым взглядом на popup.",
        "setup-guidance":
          "Узнайте следующий setup step, когда отсутствуют access или credentials.",
        "honest-contract-or-policy-only":
          "Покажите честную provider coverage без имитации неподдерживаемой live usage.",
        "settings-and-setup-depth":
          "Используйте side panel для setup ownership и более глубоких controls.",
        "provider-or-dashboard-depth":
          "Откройте более глубокую provider review, когда popup нужен дополнительный context.",
      },
      routeFailedFallback: "Screenshot seed route неожиданно завершился ошибкой.",
    },
    nativePopupProbe: {
      sectionLabel: "Отладочный route Store Screenshot",
      openingTitle: "Открытие native toolbar popup",
      requestedTitle: "Native popup запрошен",
      failedTitle: "Native popup probe не выполнен",
      openingDetail:
        "Эта helper page просит background service worker вызвать chrome.action.openPopup, чтобы RDP Chrome показал настоящую toolbar bubble вместо popup app-window smoke helper.",
      acceptedMessage:
        "Chrome принял native toolbar action-popup request. Держите это probe window открытым только до тех пор, пока RDP helper не обнаружит и не захватит popup.",
      routeContractLabel: "Route contract",
      didNotOpenTitle: "Native popup не открылся",
      internalToolingOnlyTitle: "Только внутренний tooling",
      contractDetail:
        "Эта страница существует только для правдивого RDP Chrome popup probing. Она не является store-facing screenshot surface и должна быть закрыта после захвата или отклонения native toolbar bubble.",
    },
  },
  ar: {
    screenshotSeed: {
      sectionLabel: "Route تصحيح Store Screenshot",
      applyingTitle: "جار تطبيق preset لقطة الشاشة",
      failedTitle: "فشل preset لقطة الشاشة",
      applyingDetail: (preset) =>
        `تطبق الإضافة preset لقطة الشاشة request-bound \`${preset}\` على runtime storage الحقيقي الآن.`,
      routeContractLabel: "عقد route",
      seedRouteFailedTitle: "فشل seed route",
      internalToolingOnlyTitle: "أداة داخلية فقط",
      contractDetail:
        "توجد هذه الصفحة فقط لعمل seed لحالات runtime صادقة في extension-mode قبل التقاط popup أو side-panel screenshots. وهي ليست store-facing screenshot surface بحد ذاتها.",
      temporaryLockActiveDetail:
        "يبقى side-panel seed lock المؤقت فعالا حتى تشغيل unlock preset.",
      unlockRestoredDetail:
        "تم مسح screenshot seed lock واستعادة extension runtime state السابق.",
      unlockNoBackupDetail:
        "تمت إزالة store-screenshot seed lock المؤقتة. لم تكن هناك حالة runtime pre-seed محفوظة للاستعادة، لذلك تم مسح القفل المؤقت فقط.",
      submissionCaptionLabel: "Caption دعم الإرسال",
      submissionCaptionDetail:
        "يساعد هذا caption المشغل فقط على مطابقة preset الحالي مع store-listing story. لا يتم حقنه في popup أو side panel أو full-page screenshot النهائي.",
      presetHeadlines: {
        "toolbar-first-quick-glance": "تم تطبيق seed نظرة toolbar-first السريعة",
        "setup-guidance": "تم تطبيق seed setup guidance",
        "honest-contract-or-policy-only": "تم تطبيق seed contract-only",
        "settings-and-setup-depth": "تم تطبيق seed عمق Settings",
        "provider-or-dashboard-depth": "تم تطبيق seed عمق provider",
        unlock: "تم مسح screenshot seed lock",
      },
      presetDetails: {
        "toolbar-first-quick-glance":
          "تظهر Cursor وClaude Code وCodex في runtime state صحي يركز على popup لأول storyboard screenshot.",
        "setup-guidance":
          "يفتقد Cursor إلى host access ويفتقد Codex إلى workspace credentials حتى يستطيع popup عرض setup guidance بصدق.",
        "honest-contract-or-policy-only":
          "Gemini هو provider الوحيد المرئي، لذلك يعرض popup تغطية policy-only بصدق من دون تزييف live precision.",
        "settings-and-setup-depth":
          "يتم حفظ mixed setup blockers نفسها كي تتحمل Settings قصة setup بدلا من popup.",
        "provider-or-dashboard-depth":
          "يظهر Codex في حالة warning لكنها صادقة للمراجعة التفصيلية، حتى يثبت side panel contract context أعمق.",
        unlock:
          "تمت إزالة store-screenshot seed lock المؤقتة. الفتح العادي التالي لل side-panel سيعود إلى regular init flow.",
      },
      submissionCaptions: {
        "toolbar-first-quick-glance":
          "تحقق من حالة أدوات AI المرئية في نظرة popup سريعة واحدة.",
        "setup-guidance":
          "اعرف خطوة setup التالية عندما يكون access أو credentials مفقودا.",
        "honest-contract-or-policy-only":
          "اعرض provider coverage صادقة من دون تزييف live usage غير مدعوم.",
        "settings-and-setup-depth":
          "استخدم side panel لملكية setup وcontrols أعمق.",
        "provider-or-dashboard-depth":
          "افتح provider review أعمق عندما يحتاج popup إلى context أكثر.",
      },
      routeFailedFallback: "فشل screenshot seed route بشكل غير متوقع.",
    },
    nativePopupProbe: {
      sectionLabel: "Route تصحيح Store Screenshot",
      openingTitle: "جار فتح native toolbar popup",
      requestedTitle: "تم طلب native popup",
      failedTitle: "فشل native popup probe",
      openingDetail:
        "تطلب هذه helper page من background service worker استدعاء chrome.action.openPopup حتى يستطيع RDP Chrome إظهار toolbar bubble الحقيقي بدلا من popup app-window smoke helper.",
      acceptedMessage:
        "قبل Chrome طلب native toolbar action-popup. أبق نافذة probe هذه مفتوحة فقط حتى يكتشف RDP helper ال popup ويلتقطه.",
      routeContractLabel: "عقد route",
      didNotOpenTitle: "لم يتم فتح native popup",
      internalToolingOnlyTitle: "أداة داخلية فقط",
      contractDetail:
        "توجد هذه الصفحة فقط من أجل RDP Chrome popup probing صادق. ليست store-facing screenshot surface ويجب إغلاقها بعد التقاط native toolbar bubble أو رفضها.",
    },
  },
  hi: {
    screenshotSeed: {
      sectionLabel: "Store Screenshot debug रूट",
      applyingTitle: "Screenshot preset लागू हो रहा है",
      failedTitle: "Screenshot preset विफल",
      applyingDetail: (preset) =>
        `extension request-bound screenshot preset \`${preset}\` को real runtime storage पर लागू कर रहा है।`,
      routeContractLabel: "Route contract",
      seedRouteFailedTitle: "Seed route विफल",
      internalToolingOnlyTitle: "केवल internal tooling",
      contractDetail:
        "यह page popup या side-panel screenshots capture करने से पहले truthful extension-mode runtime states seed करने के लिए है। यह खुद store-facing screenshot surface नहीं है।",
      temporaryLockActiveDetail:
        "temporary side-panel seed lock unlock preset चलने तक active रहता है।",
      unlockRestoredDetail:
        "screenshot seed lock clear हो गया और previous extension runtime state restore हो गया।",
      unlockNoBackupDetail:
        "temporary store-screenshot seed lock हट गया। restore करने के लिए stored pre-seed runtime state उपलब्ध नहीं था, इसलिए केवल temporary lock clear हुआ।",
      submissionCaptionLabel: "Submission-support caption",
      submissionCaptionDetail:
        "यह caption operator को current preset को store-listing story से match कराने में मदद करता है। इसे final popup, side panel, या full-page screenshot में inject नहीं किया जाता।",
      presetHeadlines: {
        "toolbar-first-quick-glance": "Toolbar-first quick glance seed लागू",
        "setup-guidance": "Setup guidance seed लागू",
        "honest-contract-or-policy-only": "Contract-only seed लागू",
        "settings-and-setup-depth": "Settings depth seed लागू",
        "provider-or-dashboard-depth": "Provider depth seed लागू",
        unlock: "Screenshot seed lock clear",
      },
      presetDetails: {
        "toolbar-first-quick-glance":
          "पहले storyboard screenshot के लिए Cursor, Claude Code और Codex एक healthy popup-focused runtime state में visible हैं।",
        "setup-guidance":
          "Cursor में host access missing है और Codex में workspace credentials missing हैं, इसलिए popup truthfully setup guidance दिखा सकता है।",
        "honest-contract-or-policy-only":
          "Gemini अकेला visible provider है, इसलिए popup live precision fake किए बिना policy-only coverage truthfully दिखाता है।",
        "settings-and-setup-depth":
          "वही mixed setup blockers preserve रहते हैं ताकि setup story popup के बजाय Settings के पास रहे।",
        "provider-or-dashboard-depth":
          "Codex warning लेकिन truthful detail-review state में visible है, ताकि side panel deeper contract context दिखा सके।",
        unlock:
          "temporary store-screenshot seed lock हट गया। अगली normal side-panel opening regular init flow में लौटेगी।",
      },
      submissionCaptions: {
        "toolbar-first-quick-glance":
          "एक quick popup glance में visible AI tool status देखें।",
        "setup-guidance":
          "जब access या credentials missing हों तो next setup step जानें।",
        "honest-contract-or-policy-only":
          "unsupported live usage fake किए बिना honest provider coverage देखें।",
        "settings-and-setup-depth":
          "setup ownership और deeper controls के लिए side panel उपयोग करें।",
        "provider-or-dashboard-depth":
          "जब popup को अधिक context चाहिए, deeper provider review खोलें।",
      },
      routeFailedFallback: "screenshot seed route अनपेक्षित रूप से विफल हुआ।",
    },
    nativePopupProbe: {
      sectionLabel: "Store Screenshot debug रूट",
      openingTitle: "native toolbar popup खुल रहा है",
      requestedTitle: "native popup requested",
      failedTitle: "native popup probe विफल",
      openingDetail:
        "यह helper page background service worker से chrome.action.openPopup call कराता है, ताकि RDP Chrome popup app-window smoke helper के बजाय real toolbar bubble expose कर सके।",
      acceptedMessage:
        "Chrome ने native toolbar action-popup request स्वीकार किया। RDP helper द्वारा popup detect और capture होने तक ही यह probe window खुली रखें।",
      routeContractLabel: "Route contract",
      didNotOpenTitle: "native popup नहीं खुला",
      internalToolingOnlyTitle: "केवल internal tooling",
      contractDetail:
        "यह page truthful RDP Chrome popup probing के लिए है। यह store-facing screenshot surface नहीं है और native toolbar bubble capture या reject होने पर बंद होना चाहिए।",
    },
  },
  id: {
    screenshotSeed: {
      sectionLabel: "Route debug Store Screenshot",
      applyingTitle: "Menerapkan preset screenshot",
      failedTitle: "Preset screenshot gagal",
      applyingDetail: (preset) =>
        `Extension sedang menerapkan preset screenshot request-bound \`${preset}\` ke runtime storage nyata.`,
      routeContractLabel: "Kontrak route",
      seedRouteFailedTitle: "Seed route gagal",
      internalToolingOnlyTitle: "Hanya tooling internal",
      contractDetail:
        "Halaman ini hanya ada untuk seed runtime state extension-mode yang jujur sebelum mengambil screenshot popup atau side-panel. Halaman ini bukan store-facing screenshot surface.",
      temporaryLockActiveDetail:
        "Side-panel seed lock sementara aktif sampai preset unlock berjalan.",
      unlockRestoredDetail:
        "Screenshot seed lock dibersihkan dan extension runtime state sebelumnya dipulihkan.",
      unlockNoBackupDetail:
        "Store-screenshot seed lock sementara dihapus. Tidak ada runtime state pre-seed tersimpan untuk dipulihkan, jadi hanya lock sementara yang dibersihkan.",
      submissionCaptionLabel: "Caption pendukung submission",
      submissionCaptionDetail:
        "Caption ini hanya membantu operator mencocokkan preset saat ini dengan store-listing story. Caption tidak disisipkan ke screenshot popup, side panel, atau full-page final.",
      presetHeadlines: {
        "toolbar-first-quick-glance": "Seed toolbar-first quick glance diterapkan",
        "setup-guidance": "Seed setup guidance diterapkan",
        "honest-contract-or-policy-only": "Seed contract-only diterapkan",
        "settings-and-setup-depth": "Seed Settings depth diterapkan",
        "provider-or-dashboard-depth": "Seed provider depth diterapkan",
        unlock: "Screenshot seed lock dibersihkan",
      },
      presetDetails: {
        "toolbar-first-quick-glance":
          "Cursor, Claude Code, dan Codex terlihat dalam runtime state sehat yang berfokus pada popup untuk storyboard screenshot pertama.",
        "setup-guidance":
          "Cursor kehilangan host access dan Codex kehilangan workspace credentials sehingga popup dapat menampilkan setup guidance dengan jujur.",
        "honest-contract-or-policy-only":
          "Gemini adalah satu-satunya provider terlihat, sehingga popup menampilkan coverage policy-only tanpa memalsukan live precision.",
        "settings-and-setup-depth":
          "Mixed setup blockers yang sama dipertahankan agar Settings memegang setup story, bukan popup.",
        "provider-or-dashboard-depth":
          "Codex terlihat dalam warning tetapi detail-review state yang jujur agar side panel dapat membuktikan contract context lebih dalam.",
        unlock:
          "Store-screenshot seed lock sementara dihapus. Pembukaan side-panel normal berikutnya akan kembali ke regular init flow.",
      },
      submissionCaptions: {
        "toolbar-first-quick-glance":
          "Periksa status AI tool yang terlihat dalam satu quick popup glance.",
        "setup-guidance":
          "Ketahui setup step berikutnya saat access atau credentials hilang.",
        "honest-contract-or-policy-only":
          "Lihat provider coverage yang jujur tanpa memalsukan live usage yang tidak didukung.",
        "settings-and-setup-depth":
          "Gunakan side panel untuk setup ownership dan kontrol lebih dalam.",
        "provider-or-dashboard-depth":
          "Buka review provider lebih dalam saat popup membutuhkan context tambahan.",
      },
      routeFailedFallback: "Screenshot seed route gagal secara tidak terduga.",
    },
    nativePopupProbe: {
      sectionLabel: "Route debug Store Screenshot",
      openingTitle: "Membuka native toolbar popup",
      requestedTitle: "Native popup diminta",
      failedTitle: "Native popup probe gagal",
      openingDetail:
        "Halaman helper ini meminta background service worker memanggil chrome.action.openPopup agar RDP Chrome dapat menampilkan toolbar bubble nyata, bukan popup app-window smoke helper.",
      acceptedMessage:
        "Chrome menerima native toolbar action-popup request. Biarkan probe window ini terbuka hanya sampai RDP helper mendeteksi dan menangkap popup.",
      routeContractLabel: "Kontrak route",
      didNotOpenTitle: "Native popup tidak terbuka",
      internalToolingOnlyTitle: "Hanya tooling internal",
      contractDetail:
        "Halaman ini hanya untuk RDP Chrome popup probing yang jujur. Halaman ini bukan store-facing screenshot surface dan harus ditutup setelah native toolbar bubble tertangkap atau ditolak.",
    },
  },
};

export function buildStoreWorkflowLocalizedCopy(i18n: RuntimeI18n) {
  const copy = STORE_WORKFLOW_COPY[i18n.resolvedLocale];
  const errorPresentation =
    STORE_WORKFLOW_ERROR_PRESENTATION[i18n.resolvedLocale];
  const screenshotSeed = copy.screenshotSeed;

  return {
    screenshotSeed: {
      sectionLabel: screenshotSeed.sectionLabel,
      applyingTitle: screenshotSeed.applyingTitle,
      failedTitle: screenshotSeed.failedTitle,
      applyingDetail: screenshotSeed.applyingDetail,
      routeContractLabel: screenshotSeed.routeContractLabel,
      seedRouteFailedTitle: screenshotSeed.seedRouteFailedTitle,
      internalToolingOnlyTitle: screenshotSeed.internalToolingOnlyTitle,
      contractDetail: screenshotSeed.contractDetail,
      temporaryLockActiveDetail: screenshotSeed.temporaryLockActiveDetail,
      unlockRestoredDetail: screenshotSeed.unlockRestoredDetail,
      unlockNoBackupDetail: screenshotSeed.unlockNoBackupDetail,
      submissionCaptionLabel: screenshotSeed.submissionCaptionLabel,
      submissionCaptionDetail: screenshotSeed.submissionCaptionDetail,
      presetHeadline: (preset: string, fallback: string) =>
        screenshotSeed.presetHeadlines[preset as StoreScreenshotPresetKey] ??
        fallback,
      presetDetail: (preset: string, fallback: string) =>
        screenshotSeed.presetDetails[preset as StoreScreenshotPresetKey] ??
        fallback,
      submissionCaption: (preset: string) =>
        screenshotSeed.submissionCaptions[preset as CaptionPresetKey] ?? "",
      routeFailedFallback: screenshotSeed.routeFailedFallback,
      errorDetail: (rawMessage: string) =>
        errorPresentation.screenshotSeedErrorDetail(rawMessage),
    },
    nativePopupProbe: {
      ...copy.nativePopupProbe,
      errorDetail: (rawMessage: string) =>
        errorPresentation.nativePopupProbeErrorDetail(rawMessage),
    },
  };
}
