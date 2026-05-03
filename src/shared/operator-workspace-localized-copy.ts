import type { RuntimeI18n } from "./i18n";

export function buildOperatorWorkspaceLocalizedCopy(i18n: RuntimeI18n) {
  if (i18n.resolvedLocale === "zh-CN") {
    return {
      interactionAudit: {
        topbar: {
          title: "交互审计",
          subtitle: "真实浏览器 QA 工作台",
          openDashboard: "打开 dashboard",
          openSettings: "打开设置",
        },
        hero: {
          eyebrow: "审计中心",
          title: "不用反复调整窗口的手动交互复查",
          detail:
            "这个页面把真实发布的 dashboard、settings、provider detail 和 popup 放进固定宽度 frame，让真实浏览器复查聚焦 hover、focus、pressed 和紧凑宽度行为，而不是反复重新打开路由。审计中心会跟随 side panel 与 popup 的共享主题偏好。",
          chip: "手动 QA · 固定宽度 frame",
        },
        guidance: {
          eyebrow: "使用方式",
          title: "复查指引",
          detail:
            "当自动化复查脚本之后还需要人工确认时，在普通浏览器标签页或扩展页面打开这个路由。即使外层浏览器窗口更大，内嵌 frame 仍会保留代表性宽度。",
          checks: [
            "悬停交互控件，并确认跨页面的状态层仍然一致。",
            "用键盘 tab 穿过内嵌 surface，并确认 focus 可见性仍然明确。",
            "使用下方 preset actions 打开 disclosure、聚焦控件或露出更低层 detail note，再签核一个 UI slice。",
          ],
          openDashboard: "打开 dashboard",
          openSettings: "打开设置",
          openPopup: "打开 popup",
        },
        signoff: {
          eyebrow: "签核工作台",
          title: "当前 operator 草稿",
          detail:
            "使用每个审计 surface 内的控件记录检查进度、reviewer notes，以及 pass 或 follow-up 状态。下面的草稿会跟随当前工作台状态实时更新。",
          reviewedSurfaces: "已复查 surface",
          pass: "通过",
          followUp: "待跟进",
          completedChecks: "已完成检查",
          reviewerName: "Reviewer 名称",
          reviewerPlaceholder: "记录 reviewer 或 operator 名称。",
          sessionLabel: "Session 标签",
          sessionPlaceholder: "标记这次复查，例如 Compact QA Pass。",
          reviewedAt: "复查时间",
          reviewedAtPlaceholder: "使用 ISO-8601 时间，或盖上当前复查时间。",
          stampCurrentTime: "填入当前时间",
          reviewSession: "Review session",
          reviewerPrefix: "Reviewer",
          sessionPrefix: "Session",
          reviewedAtPrefix: "Reviewed at",
          notSet: "未设置",
          requestBindingPrefix: "Request binding",
          requestRevisionPrefix: "Request revision",
          requestScope: "请求范围",
          boundRequestDetail:
            "这个工作台绑定到一个 repo-backed pending request。请针对该请求执行 preflight 和 completion，而不是使用 ad-hoc archive path。",
          adHocDetail:
            "这个工作台没有绑定 repo-backed request。除非先导入 pending request template，否则请使用 archive path。",
          repoBackedRequest: "Repo-backed request",
          adHocWorkspace: "Ad-hoc audit workspace",
          binding: "绑定",
          requestRevision: "Request revision",
          downloadIdentity: "下载身份",
          downloadsBound:
            "下载内容会包含绑定的 request id 和 request revision。",
          downloadsAdHoc: "下载内容仅保留当前 session scope。",
        },
      },
      themeRecovery: {
        topbar: {
          title: "主题恢复审核",
          subtitle: "Operator 工作台",
          refresh: "刷新",
          openSettings: "打开设置",
        },
        hero: {
          eyebrow: "真实 session 跟进",
          title: "集中执行 native prompt 与真实 session 恢复检查",
          detail:
            "这个路由不会声称 native host prompt 或真实 vendor session 已经通过。它会收集当前主题状态、恢复状态、快速链接和可复制证据，让下一次 operator pass 保持真实且可重复。",
          chip: "主题 QA · 恢复跟进",
        },
        loading: {
          title: "正在加载当前审核状态...",
          detail:
            "正在读取当前 app state 和 action badge，让这个工作台能反映与已发布 surface 相同的主题和 provider 状态。",
        },
        error: {
          title: "无法加载审核状态",
        },
        currentTruth: {
          eyebrow: "当前真值",
          title: "此刻的恢复状态",
          reviewStage: "复查阶段",
          popupSnapshot: "Popup 快照",
          actionBadge: "Action badge",
        },
        themeState: {
          eyebrow: "主题状态",
          title: "共享运行时状态",
          detail:
            "这个工作台读取 side panel、popup 和 audit hub 使用的同一份已保存主题设置。Operator pass 应在恢复 provider access 时保持当前 custom-seed 状态固定。",
          themeMode: "Theme mode",
          resolvedMode: "Resolved mode",
          accentPreset: "Accent preset",
          customSeed: "Custom seed",
          scopeIsolation: "Scope isolation",
          liveBadgeSource: "Live badge source",
          notSet: "未设置",
          computedBadgeSource: "由当前 app state 计算",
          scopeNote: "Scope note",
          popupSnapshotPrefix: "Popup 快照",
          actionBadgeTitlePrefix: "Action badge 标题",
        },
        requestScope: {
          eyebrow: "请求范围",
          title: "Repo-backed request 绑定",
          detail:
            "这个工作台绑定到一个 pending theme-recovery request。Summary 和 JSON export 必须保留该请求身份，避免 completion 意外履行另一个请求。",
          requestId: "Request id",
          createdAt: "Created at",
          boundWorkspaceRoute: "绑定的工作台路由",
          adHocTitle: "Ad-hoc 工作台",
          adHocDetail:
            "这个 review route 当前没有绑定 repo-backed request。它的 export 仍可用于本地检查，但不应拿来履行 pending request。",
        },
        workflow: {
          eyebrow: "Operator workflow",
          title: "真实 session 跟进步骤",
          detail:
            "在 Settings、popup 和目标 vendor 页面之间切换时保持这个页面打开。用下方链接在独立标签页打开准确的已发布 surface，且不丢失当前工作台。",
          steps: [
            "固定当前 custom seed，并确认工作台仍报告预期的 theme mode、resolved mode、preset 和 seed。",
            "在信任 popup alignment 与 action badge 之前，用 Settings 保持只有 Cursor 和 Codex 可见。",
            "先捕获 degraded state：缺少 host access 或真实 session 被阻塞时，这个页面应保持 warning 状态。",
            "通过 native prompt 授予 host access，或恢复真实 vendor session；随后刷新此页面，并确认 review stage 回到 recovered。",
            "真实 pass 之后复制 summary 或 JSON export，让结果可附加到后续 repo-backed archive 或 operator note。",
          ],
          extensionSurfaces: "扩展 surface",
          vendorSessionPages: "Vendor session 页面",
        },
        links: {
          sidePanel: {
            settings: "打开设置",
            dashboard: "打开 dashboard",
            "cursor-detail": "打开 Cursor 详情",
            "codex-detail": "打开 Codex 详情",
            popup: "打开 popup",
          },
          vendor: {
            "cursor-session-page": "打开 Cursor usage 页面",
            "codex-session-page": "打开 Codex analytics 页面",
          },
        },
        outputs: {
          eyebrow: "可复制输出",
          title: "Summary 与 JSON 证据",
          detail:
            "这些输出保持只读。它们会准确反映上方显示的当前工作台状态，并可在手动 extension-mode 或真实 session pass 之后复制。",
          copySummary: "复制 summary",
          downloadSummary: "下载 summary",
          copyJson: "复制 JSON",
          downloadJson: "下载 JSON",
          openSettingsTab: "在新标签页打开设置",
          summaryDraft: "Summary 草稿",
          jsonExport: "JSON export",
          copiedSummary: "已复制当前主题恢复 summary。",
          downloadedSummary: "已下载当前主题恢复 summary。",
          copiedJson: "已复制当前主题恢复 JSON export。",
          downloadedJson: "已下载当前主题恢复 JSON export。",
          clipboardUnavailable: "当前上下文无法访问 clipboard。",
          downloadUnavailable: "当前上下文无法直接下载。",
          workspaceNote: "工作台备注",
        },
      },
    } as const;
  }

  return {
    interactionAudit: {
      topbar: {
        title: "Interaction Audit",
        subtitle: "Real-browser QA hub",
        openDashboard: "Open dashboard",
        openSettings: "Open settings",
      },
      hero: {
        eyebrow: "Audit Hub",
        title: "Manual interaction review without repeated resizing",
        detail:
          "This page embeds the real shipped dashboard, settings, provider-detail, and popup surfaces inside fixed-width frames so real-browser review can focus on hover, focus, pressed, and compact-width behavior instead of repeatedly reopening routes. The audit hub now follows the same shared theme preferences as the shipped side panel and popup.",
        chip: "Manual QA · Fixed-width frames",
      },
      guidance: {
        eyebrow: "How To Use",
        title: "Review guidance",
        detail:
          "Open this route in a normal browser tab or extension page when you want a human pass after the automated review scripts. The embedded frames preserve representative widths even when the outer browser window is larger.",
        checks: [
          "Hover interactive controls and confirm the state layer still feels coherent across pages.",
          "Use keyboard tab focus across the embedded surfaces and confirm focus visibility stays explicit.",
          "Use the preset actions below to open disclosures, focus controls, or reveal lower detail notes before signing off a UI slice.",
        ],
        openDashboard: "Open dashboard",
        openSettings: "Open settings",
        openPopup: "Open popup",
      },
      signoff: {
        eyebrow: "Signoff Workspace",
        title: "Current operator draft",
        detail:
          "Use the controls inside each audit surface to record check progress, reviewer notes, and pass-versus-follow-up state. The draft below updates live from the current workspace state.",
        reviewedSurfaces: "Reviewed surfaces",
        pass: "Pass",
        followUp: "Follow-up",
        completedChecks: "Completed checks",
        reviewerName: "Reviewer name",
        reviewerPlaceholder: "Record the reviewer or operator name.",
        sessionLabel: "Session label",
        sessionPlaceholder: "Label this pass, for example Compact QA Pass.",
        reviewedAt: "Reviewed at",
        reviewedAtPlaceholder: "Use ISO-8601 time or stamp the current review moment.",
        stampCurrentTime: "Stamp current time",
        reviewSession: "Review session",
        reviewerPrefix: "Reviewer",
        sessionPrefix: "Session",
        reviewedAtPrefix: "Reviewed at",
        notSet: "not set",
        requestBindingPrefix: "Request binding",
        requestRevisionPrefix: "Request revision",
        requestScope: "Request Scope",
        boundRequestDetail:
          "This workspace is bound to one repo-backed pending request. Use preflight and completion against that request instead of the ad-hoc archive path.",
        adHocDetail:
          "This workspace is not bound to a repo-backed request. Use the archive path unless a pending request template is imported first.",
        repoBackedRequest: "Repo-backed request",
        adHocWorkspace: "Ad-hoc audit workspace",
        binding: "Binding",
        requestRevision: "Request revision",
        downloadIdentity: "Download identity",
        downloadsBound:
          "Downloads include the bound request id and request revision.",
        downloadsAdHoc: "Downloads stay session-scoped only.",
      },
    },
    themeRecovery: {
      topbar: {
        title: "Theme Recovery Review",
        subtitle: "Operator workspace",
        refresh: "Refresh",
        openSettings: "Open settings",
      },
      hero: {
        eyebrow: "Real-session follow-up",
        title: "One place to stage native-prompt and real-session recovery checks",
        detail:
          "This route does not claim that the native host prompt or a real vendor session already passed. It collects the current theme state, recovery state, quick links, and copyable evidence so the next operator pass can stay truthful and repeatable.",
        chip: "Theme QA · Recovery follow-up",
      },
      loading: {
        title: "Loading current review state...",
        detail:
          "Reading the current app state and action badge so this workspace can reflect the same theme and provider state as the shipped surfaces.",
      },
      error: {
        title: "Could not load review state",
      },
      currentTruth: {
        eyebrow: "Current truth",
        title: "Recovery status right now",
        reviewStage: "Review stage",
        popupSnapshot: "Popup snapshot",
        actionBadge: "Action badge",
      },
      themeState: {
        eyebrow: "Theme state",
        title: "Shared runtime state",
        detail:
          "This workspace reads the same saved theme settings used by the side panel, popup, and audit hub. The operator pass should keep the current custom-seed state fixed while recovering provider access.",
        themeMode: "Theme mode",
        resolvedMode: "Resolved mode",
        accentPreset: "Accent preset",
        customSeed: "Custom seed",
        scopeIsolation: "Scope isolation",
        liveBadgeSource: "Live badge source",
        notSet: "Not set",
        computedBadgeSource: "Computed from current app state",
        scopeNote: "Scope note",
        popupSnapshotPrefix: "Popup snapshot",
        actionBadgeTitlePrefix: "Action badge title",
      },
      requestScope: {
        eyebrow: "Request scope",
        title: "Repo-backed request binding",
        detail:
          "This workspace is bound to one pending theme-recovery request. Summary and JSON exports should preserve this request identity so completion cannot accidentally fulfill a different request.",
        requestId: "Request id",
        createdAt: "Created at",
        boundWorkspaceRoute: "Bound workspace route",
        adHocTitle: "Ad-hoc workspace",
        adHocDetail:
          "This review route is not currently bound to a repo-backed request. Its exports are still useful for local inspection, but they should not be used to fulfill a pending request.",
      },
      workflow: {
        eyebrow: "Operator workflow",
        title: "Real-session follow-up steps",
        detail:
          "Keep this page open while switching between Settings, popup, and the target vendor pages. Use the links below to open the exact shipped surfaces in separate tabs without losing this workspace.",
        steps: [
          "Keep the current custom seed fixed and confirm the workspace still reports the expected theme mode, resolved mode, preset, and seed.",
          "Use Settings to keep only Cursor and Codex visible before trusting popup alignment and the action badge.",
          "Capture the degraded state first: missing host access or a blocked real session should keep this page in a warning state.",
          "Grant host access through the native prompt or restore the real vendor session, then refresh this page and confirm the review stage returns to recovered.",
          "Copy the summary or JSON export after the real pass so the result can be attached to a later repo-backed archive or operator note.",
        ],
        extensionSurfaces: "Extension surfaces",
        vendorSessionPages: "Vendor session pages",
      },
      links: {
        sidePanel: {
          settings: "Open settings",
          dashboard: "Open dashboard",
          "cursor-detail": "Open Cursor detail",
          "codex-detail": "Open Codex detail",
          popup: "Open popup",
        },
        vendor: {
          "cursor-session-page": "Open Cursor usage page",
          "codex-session-page": "Open Codex analytics page",
        },
      },
      outputs: {
        eyebrow: "Copyable outputs",
        title: "Summary and JSON evidence",
        detail:
          "These outputs stay read-only. They reflect the current workspace state exactly as shown above and can be copied after a manual extension-mode or real-session pass.",
        copySummary: "Copy summary",
        downloadSummary: "Download summary",
        copyJson: "Copy JSON",
        downloadJson: "Download JSON",
        openSettingsTab: "Open settings in new tab",
        summaryDraft: "Summary draft",
        jsonExport: "JSON export",
        copiedSummary: "Copied the current theme recovery summary.",
        downloadedSummary: "Downloaded the current theme recovery summary.",
        copiedJson: "Copied the current theme recovery JSON export.",
        downloadedJson: "Downloaded the current theme recovery JSON export.",
        clipboardUnavailable: "Clipboard access is not available in this context.",
        downloadUnavailable: "Direct download is not available in this context.",
        workspaceNote: "Workspace note",
      },
    },
  };
}
