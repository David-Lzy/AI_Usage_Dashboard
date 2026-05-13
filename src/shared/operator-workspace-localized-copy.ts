import type { ResolvedAppLocale, RuntimeI18n } from "./i18n";
import type {
  AuditFrameReadinessCode,
  AuditPresetResultCode,
} from "./interaction-audit-frame-result-codes";

type OperatorWorkspaceLocalizedCopy = {
  interactionAudit: {
    topbar: {
      title: string;
      subtitle: string;
      openDashboard: string;
      openSettings: string;
    };
    hero: {
      eyebrow: string;
      title: string;
      detail: string;
      chip: string;
    };
    guidance: {
      eyebrow: string;
      title: string;
      detail: string;
      checks: string[];
      openDashboard: string;
      openSettings: string;
      openPopup: string;
    };
    signoff: {
      eyebrow: string;
      title: string;
      detail: string;
      reviewedSurfaces: string;
      pass: string;
      followUp: string;
      completedChecks: string;
      reviewerName: string;
      reviewerPlaceholder: string;
      sessionLabel: string;
      sessionPlaceholder: string;
      reviewedAt: string;
      reviewedAtPlaceholder: string;
      stampCurrentTime: string;
      reviewSession: string;
      reviewerPrefix: string;
      sessionPrefix: string;
      reviewedAtPrefix: string;
      notSet: string;
      requestBindingPrefix: string;
      requestRevisionPrefix: string;
      requestScope: string;
      boundRequestDetail: string;
      adHocDetail: string;
      repoBackedRequest: string;
      adHocWorkspace: string;
      binding: string;
      requestRevision: string;
      downloadIdentity: string;
      downloadsBound: string;
      downloadsAdHoc: string;
    };
  };
  themeRecovery: {
    topbar: {
      title: string;
      subtitle: string;
      refresh: string;
      openSettings: string;
    };
    hero: {
      eyebrow: string;
      title: string;
      detail: string;
      chip: string;
    };
    loading: {
      title: string;
      detail: string;
    };
    error: {
      title: string;
    };
    currentTruth: {
      eyebrow: string;
      title: string;
      reviewStage: string;
      popupSnapshot: string;
      actionBadge: string;
    };
    themeState: {
      eyebrow: string;
      title: string;
      detail: string;
      themeMode: string;
      resolvedMode: string;
      accentPreset: string;
      customSeed: string;
      scopeIsolation: string;
      liveBadgeSource: string;
      notSet: string;
      computedBadgeSource: string;
      scopeNote: string;
      popupSnapshotPrefix: string;
      actionBadgeTitlePrefix: string;
    };
    requestScope: {
      eyebrow: string;
      title: string;
      detail: string;
      requestId: string;
      createdAt: string;
      boundWorkspaceRoute: string;
      adHocTitle: string;
      adHocDetail: string;
    };
    workflow: {
      eyebrow: string;
      title: string;
      detail: string;
      steps: string[];
      extensionSurfaces: string;
      vendorSessionPages: string;
    };
    links: {
      sidePanel: {
        settings: string;
        dashboard: string;
        "cursor-detail": string;
        "codex-detail": string;
        popup: string;
      };
      vendor: {
        "cursor-session-page": string;
        "codex-session-page": string;
      };
    };
    outputs: {
      eyebrow: string;
      title: string;
      detail: string;
      copySummary: string;
      downloadSummary: string;
      copyJson: string;
      downloadJson: string;
      openSettingsTab: string;
      summaryDraft: string;
      jsonExport: string;
      copiedSummary: string;
      downloadedSummary: string;
      copiedJson: string;
      downloadedJson: string;
      clipboardUnavailable: string;
      downloadUnavailable: string;
      workspaceNote: string;
    };
  };
};

type InteractionAuditReviewQueueCopy = {
  label: string;
  detail: string;
  jumpToSurface: (surfaceTitle: string) => string;
  allSurfacesReady: string;
  allReady: string;
  nextTarget: string;
  followUp: string;
  notReviewed: string;
  pendingCheckSurfaces: string;
  ready: string;
  itemMeta: (input: {
    signoffLabel: string;
    completedManualCheckCount: number;
    totalManualCheckCount: number;
  }) => string;
  jumpToSurfaceAction: string;
  pendingChecks: (pendingManualCheckCount: number) => string;
  queueStatus: {
    followUp: string;
    notReviewed: string;
    pendingChecks: string;
    ready: string;
  };
  signoffStatus: {
    notReviewed: string;
    pass: string;
    followUp: string;
  };
};

type InteractionAuditSurfaceCardCopy = {
  sectionLabel: string;
  openStandalone: string;
  auditState: string;
  frameState: string;
  loadingFrame: string;
  manualChecks: string;
  surfaceSignoff: string;
  operatorNotes: string;
  notesPlaceholder: string;
  signoffStatus: {
    notReviewed: string;
    pass: string;
    followUp: string;
  };
};

type InteractionAuditWorkspaceControlsCopy = {
  copySignoffDraft: string;
  downloadSignoffDraft: string;
  copySignoffJson: string;
  downloadSignoffJson: string;
  resetSignoff: string;
  importSignoffJson: string;
  pastedSignoffJson: string;
  importPlaceholder: string;
  applyImportedSignoff: string;
  clearPastedJson: string;
  workspaceState: string;
  currentSignoffDraft: string;
  feedback: {
    noDecisions: string;
    updatedWorkspace: string;
    updatedMetadata: string;
    stampedReviewTime: string;
    copiedSignoffDraft: string;
    copiedSignoffJson: string;
    clipboardUnavailable: string;
    failedCopySignoffDraft: string;
    failedCopySignoffJson: string;
    downloadedSignoffDraft: (filename: string) => string;
    downloadedSignoffJson: (filename: string) => string;
    failedDownloadSignoffDraft: string;
    failedDownloadSignoffJson: string;
    resetWorkspace: string;
    importedSignoffJson: string;
    clearedPastedJson: string;
  };
};

type InteractionAuditRequestScopeCommandsCopy = {
  preflightNext: string;
  completeNext: string;
  archiveNext: string;
};

type InteractionAuditHandoffSummaryCopy = {
  label: string;
  detail: string;
  copyAction: string;
  downloadAction: string;
  readyForSignoff: string;
  ready: string;
  notReady: string;
  followUpSurfaces: string;
  notReviewed: string;
  pendingChecks: string;
  readyStatusLabel: string;
  readyStatusDetail: string;
  outstandingStatusLabel: string;
  outstandingStatusDetail: (input: {
    reviewSurfaceCount: number;
    pendingManualCheckCount: number;
  }) => string;
  followUpRequired: string;
  notReviewedGroup: string;
  pendingManualChecks: string;
  none: string;
  pendingChecksMeta: (input: {
    pendingManualCheckCount: number;
    totalManualCheckCount: number;
  }) => string;
  pendingOfTotal: (input: {
    pendingManualCheckCount: number;
    totalManualCheckCount: number;
  }) => string;
  noOperatorNotes: string;
  currentHandoffSummary: string;
  operatorHandoffWorkflow: string;
  workflowSteps: string[];
  feedback: {
    copiedHandoffSummary: string;
    clipboardUnavailable: string;
    failedCopyHandoffSummary: string;
    downloadedHandoffSummary: (filename: string) => string;
    failedDownloadHandoffSummary: string;
  };
};

type InteractionAuditFrameResultsCopy = {
  rawDetailLabel: string;
  readiness: Record<AuditFrameReadinessCode, string>;
  presets: Record<AuditPresetResultCode, string>;
};

const INTERACTION_AUDIT_REVIEW_QUEUE_COPY: Record<
  ResolvedAppLocale,
  InteractionAuditReviewQueueCopy
> = {
  en: {
    label: "Review Queue",
    detail:
      "The queue keeps follow-up surfaces first, then not-reviewed surfaces, then pass states with pending checks, so a reviewer can move through the unresolved work without scanning the whole page.",
    jumpToSurface: (surfaceTitle) => `Jump to ${surfaceTitle}`,
    allSurfacesReady: "All surfaces ready",
    allReady: "All ready",
    nextTarget: "Next target",
    followUp: "Follow-up",
    notReviewed: "Not reviewed",
    pendingCheckSurfaces: "Pending-check surfaces",
    ready: "Ready",
    itemMeta: ({ signoffLabel, completedManualCheckCount, totalManualCheckCount }) =>
      `Signoff: ${signoffLabel} · Checks: ${completedManualCheckCount} / ${totalManualCheckCount}`,
    jumpToSurfaceAction: "Jump to surface",
    pendingChecks: (pendingManualCheckCount) =>
      `Pending checks: ${pendingManualCheckCount}`,
    queueStatus: {
      followUp: "Follow-up required",
      notReviewed: "Not reviewed",
      pendingChecks: "Pending checks",
      ready: "Ready",
    },
    signoffStatus: {
      notReviewed: "Not reviewed",
      pass: "Pass",
      followUp: "Follow-up required",
    },
  },
  "zh-CN": {
    label: "复查队列",
    detail:
      "队列会先显示需要 follow-up 的 surface，再显示未复查 surface，然后显示仍有待办检查的 pass 状态，让复查者不用扫描整页也能处理未完成工作。",
    jumpToSurface: (surfaceTitle) => `跳转到 ${surfaceTitle}`,
    allSurfacesReady: "所有 surface 已就绪",
    allReady: "全部就绪",
    nextTarget: "下一个目标",
    followUp: "Follow-up",
    notReviewed: "未复查",
    pendingCheckSurfaces: "待检查 surface",
    ready: "就绪",
    itemMeta: ({ signoffLabel, completedManualCheckCount, totalManualCheckCount }) =>
      `签核：${signoffLabel} · 检查：${completedManualCheckCount} / ${totalManualCheckCount}`,
    jumpToSurfaceAction: "跳转到 surface",
    pendingChecks: (pendingManualCheckCount) =>
      `待检查：${pendingManualCheckCount}`,
    queueStatus: {
      followUp: "需要 follow-up",
      notReviewed: "未复查",
      pendingChecks: "待检查",
      ready: "就绪",
    },
    signoffStatus: {
      notReviewed: "未复查",
      pass: "通过",
      followUp: "需要 follow-up",
    },
  },
  "zh-TW": {
    label: "複查佇列",
    detail:
      "佇列會先顯示需要 follow-up 的 surface，再顯示未複查 surface，接著顯示仍有待辦檢查的 pass 狀態，讓 reviewer 不必掃描整頁也能處理未完成工作。",
    jumpToSurface: (surfaceTitle) => `跳到 ${surfaceTitle}`,
    allSurfacesReady: "所有 surface 已就緒",
    allReady: "全部就緒",
    nextTarget: "下一個目標",
    followUp: "Follow-up",
    notReviewed: "未複查",
    pendingCheckSurfaces: "待檢查 surface",
    ready: "就緒",
    itemMeta: ({ signoffLabel, completedManualCheckCount, totalManualCheckCount }) =>
      `簽核：${signoffLabel} · 檢查：${completedManualCheckCount} / ${totalManualCheckCount}`,
    jumpToSurfaceAction: "跳到 surface",
    pendingChecks: (pendingManualCheckCount) =>
      `待檢查：${pendingManualCheckCount}`,
    queueStatus: {
      followUp: "需要 follow-up",
      notReviewed: "未複查",
      pendingChecks: "待檢查",
      ready: "就緒",
    },
    signoffStatus: {
      notReviewed: "未複查",
      pass: "通過",
      followUp: "需要 follow-up",
    },
  },
  ja: {
    label: "レビューキュー",
    detail:
      "このキューは follow-up が必要な surface、未レビュー surface、未完了チェックが残る pass 状態の順に並べ、レビュー担当者がページ全体を探さず未解決作業を進められるようにします。",
    jumpToSurface: (surfaceTitle) => `${surfaceTitle} へ移動`,
    allSurfacesReady: "すべての surface が準備済み",
    allReady: "すべて準備済み",
    nextTarget: "次の対象",
    followUp: "Follow-up",
    notReviewed: "未レビュー",
    pendingCheckSurfaces: "未完了チェックのある surface",
    ready: "準備済み",
    itemMeta: ({ signoffLabel, completedManualCheckCount, totalManualCheckCount }) =>
      `サインオフ: ${signoffLabel} · チェック: ${completedManualCheckCount} / ${totalManualCheckCount}`,
    jumpToSurfaceAction: "Surface へ移動",
    pendingChecks: (pendingManualCheckCount) =>
      `未完了チェック: ${pendingManualCheckCount}`,
    queueStatus: {
      followUp: "Follow-up が必要",
      notReviewed: "未レビュー",
      pendingChecks: "未完了チェック",
      ready: "準備済み",
    },
    signoffStatus: {
      notReviewed: "未レビュー",
      pass: "合格",
      followUp: "Follow-up が必要",
    },
  },
  ko: {
    label: "검토 대기열",
    detail:
      "대기열은 follow-up 이 필요한 surface, 아직 검토하지 않은 surface, 보류 체크가 남은 pass 상태 순서로 보여 주어 reviewer 가 전체 페이지를 훑지 않고 미해결 작업을 처리하게 합니다.",
    jumpToSurface: (surfaceTitle) => `${surfaceTitle}(으)로 이동`,
    allSurfacesReady: "모든 surface 준비됨",
    allReady: "모두 준비됨",
    nextTarget: "다음 대상",
    followUp: "Follow-up",
    notReviewed: "미검토",
    pendingCheckSurfaces: "보류 체크 surface",
    ready: "준비됨",
    itemMeta: ({ signoffLabel, completedManualCheckCount, totalManualCheckCount }) =>
      `Signoff: ${signoffLabel} · Checks: ${completedManualCheckCount} / ${totalManualCheckCount}`,
    jumpToSurfaceAction: "Surface 로 이동",
    pendingChecks: (pendingManualCheckCount) =>
      `보류 체크: ${pendingManualCheckCount}`,
    queueStatus: {
      followUp: "Follow-up 필요",
      notReviewed: "미검토",
      pendingChecks: "보류 체크",
      ready: "준비됨",
    },
    signoffStatus: {
      notReviewed: "미검토",
      pass: "통과",
      followUp: "Follow-up 필요",
    },
  },
  "es-419": {
    label: "Cola de revisión",
    detail:
      "La cola mantiene primero las superficies con follow-up, luego las no revisadas y después los estados pass con checks pendientes, para avanzar por el trabajo abierto sin revisar toda la página.",
    jumpToSurface: (surfaceTitle) => `Ir a ${surfaceTitle}`,
    allSurfacesReady: "Todas las superficies listas",
    allReady: "Todo listo",
    nextTarget: "Siguiente objetivo",
    followUp: "Follow-up",
    notReviewed: "No revisado",
    pendingCheckSurfaces: "Superficies con checks pendientes",
    ready: "Listo",
    itemMeta: ({ signoffLabel, completedManualCheckCount, totalManualCheckCount }) =>
      `Signoff: ${signoffLabel} · Checks: ${completedManualCheckCount} / ${totalManualCheckCount}`,
    jumpToSurfaceAction: "Ir a la superficie",
    pendingChecks: (pendingManualCheckCount) =>
      `Checks pendientes: ${pendingManualCheckCount}`,
    queueStatus: {
      followUp: "Follow-up requerido",
      notReviewed: "No revisado",
      pendingChecks: "Checks pendientes",
      ready: "Listo",
    },
    signoffStatus: {
      notReviewed: "No revisado",
      pass: "Aprobado",
      followUp: "Follow-up requerido",
    },
  },
  "pt-BR": {
    label: "Fila de revisão",
    detail:
      "A fila mantém primeiro as superfícies com follow-up, depois as não revisadas e depois estados pass com checks pendentes, para o reviewer avançar no trabalho aberto sem varrer a página inteira.",
    jumpToSurface: (surfaceTitle) => `Ir para ${surfaceTitle}`,
    allSurfacesReady: "Todas as superfícies prontas",
    allReady: "Tudo pronto",
    nextTarget: "Próximo alvo",
    followUp: "Follow-up",
    notReviewed: "Não revisado",
    pendingCheckSurfaces: "Superfícies com checks pendentes",
    ready: "Pronto",
    itemMeta: ({ signoffLabel, completedManualCheckCount, totalManualCheckCount }) =>
      `Signoff: ${signoffLabel} · Checks: ${completedManualCheckCount} / ${totalManualCheckCount}`,
    jumpToSurfaceAction: "Ir para a superfície",
    pendingChecks: (pendingManualCheckCount) =>
      `Checks pendentes: ${pendingManualCheckCount}`,
    queueStatus: {
      followUp: "Follow-up necessário",
      notReviewed: "Não revisado",
      pendingChecks: "Checks pendentes",
      ready: "Pronto",
    },
    signoffStatus: {
      notReviewed: "Não revisado",
      pass: "Aprovado",
      followUp: "Follow-up necessário",
    },
  },
  fr: {
    label: "File de revue",
    detail:
      "La file place d'abord les surfaces avec follow-up, puis les surfaces non revues, puis les états pass avec checks en attente, afin de traiter le travail ouvert sans parcourir toute la page.",
    jumpToSurface: (surfaceTitle) => `Aller à ${surfaceTitle}`,
    allSurfacesReady: "Toutes les surfaces sont prêtes",
    allReady: "Tout est prêt",
    nextTarget: "Prochaine cible",
    followUp: "Follow-up",
    notReviewed: "Non revu",
    pendingCheckSurfaces: "Surfaces avec checks en attente",
    ready: "Prêt",
    itemMeta: ({ signoffLabel, completedManualCheckCount, totalManualCheckCount }) =>
      `Signoff: ${signoffLabel} · Checks: ${completedManualCheckCount} / ${totalManualCheckCount}`,
    jumpToSurfaceAction: "Aller à la surface",
    pendingChecks: (pendingManualCheckCount) =>
      `Checks en attente: ${pendingManualCheckCount}`,
    queueStatus: {
      followUp: "Follow-up requis",
      notReviewed: "Non revu",
      pendingChecks: "Checks en attente",
      ready: "Prêt",
    },
    signoffStatus: {
      notReviewed: "Non revu",
      pass: "Validé",
      followUp: "Follow-up requis",
    },
  },
  de: {
    label: "Review-Warteschlange",
    detail:
      "Die Warteschlange zeigt zuerst Follow-up-Surfaces, dann nicht geprüfte Surfaces und danach Pass-Zustände mit offenen Checks, damit Reviewer offene Arbeit ohne Seitensuche abarbeiten.",
    jumpToSurface: (surfaceTitle) => `Zu ${surfaceTitle} springen`,
    allSurfacesReady: "Alle Surfaces bereit",
    allReady: "Alles bereit",
    nextTarget: "Nächstes Ziel",
    followUp: "Follow-up",
    notReviewed: "Nicht geprüft",
    pendingCheckSurfaces: "Surfaces mit offenen Checks",
    ready: "Bereit",
    itemMeta: ({ signoffLabel, completedManualCheckCount, totalManualCheckCount }) =>
      `Signoff: ${signoffLabel} · Checks: ${completedManualCheckCount} / ${totalManualCheckCount}`,
    jumpToSurfaceAction: "Zum Surface springen",
    pendingChecks: (pendingManualCheckCount) =>
      `Offene Checks: ${pendingManualCheckCount}`,
    queueStatus: {
      followUp: "Follow-up erforderlich",
      notReviewed: "Nicht geprüft",
      pendingChecks: "Offene Checks",
      ready: "Bereit",
    },
    signoffStatus: {
      notReviewed: "Nicht geprüft",
      pass: "Bestanden",
      followUp: "Follow-up erforderlich",
    },
  },
  it: {
    label: "Coda di revisione",
    detail:
      "La coda mette prima le surface con follow-up, poi quelle non revisionate e quindi gli stati pass con check pendenti, così il reviewer procede sul lavoro aperto senza scansionare tutta la pagina.",
    jumpToSurface: (surfaceTitle) => `Vai a ${surfaceTitle}`,
    allSurfacesReady: "Tutte le surface sono pronte",
    allReady: "Tutto pronto",
    nextTarget: "Prossimo target",
    followUp: "Follow-up",
    notReviewed: "Non revisionato",
    pendingCheckSurfaces: "Surface con check pendenti",
    ready: "Pronto",
    itemMeta: ({ signoffLabel, completedManualCheckCount, totalManualCheckCount }) =>
      `Signoff: ${signoffLabel} · Check: ${completedManualCheckCount} / ${totalManualCheckCount}`,
    jumpToSurfaceAction: "Vai alla surface",
    pendingChecks: (pendingManualCheckCount) =>
      `Check pendenti: ${pendingManualCheckCount}`,
    queueStatus: {
      followUp: "Follow-up richiesto",
      notReviewed: "Non revisionato",
      pendingChecks: "Check pendenti",
      ready: "Pronto",
    },
    signoffStatus: {
      notReviewed: "Non revisionato",
      pass: "Pass",
      followUp: "Follow-up richiesto",
    },
  },
  ru: {
    label: "Очередь проверки",
    detail:
      "Очередь сначала показывает surfaces с follow-up, затем не проверенные surfaces, затем состояния pass с незавершенными checks, чтобы reviewer работал с открытыми задачами без просмотра всей страницы.",
    jumpToSurface: (surfaceTitle) => `Перейти к ${surfaceTitle}`,
    allSurfacesReady: "Все surfaces готовы",
    allReady: "Все готово",
    nextTarget: "Следующая цель",
    followUp: "Follow-up",
    notReviewed: "Не проверено",
    pendingCheckSurfaces: "Surfaces с незавершенными checks",
    ready: "Готово",
    itemMeta: ({ signoffLabel, completedManualCheckCount, totalManualCheckCount }) =>
      `Signoff: ${signoffLabel} · Checks: ${completedManualCheckCount} / ${totalManualCheckCount}`,
    jumpToSurfaceAction: "Перейти к surface",
    pendingChecks: (pendingManualCheckCount) =>
      `Незавершенные checks: ${pendingManualCheckCount}`,
    queueStatus: {
      followUp: "Требуется follow-up",
      notReviewed: "Не проверено",
      pendingChecks: "Незавершенные checks",
      ready: "Готово",
    },
    signoffStatus: {
      notReviewed: "Не проверено",
      pass: "Пройдено",
      followUp: "Требуется follow-up",
    },
  },
  ar: {
    label: "قائمة المراجعة",
    detail:
      "تعرض القائمة surfaces التي تحتاج follow-up أولا، ثم surfaces غير المراجعة، ثم حالات pass التي لديها checks معلقة، حتى يستطيع المراجع متابعة العمل المفتوح بدون فحص الصفحة كلها.",
    jumpToSurface: (surfaceTitle) => `انتقال إلى ${surfaceTitle}`,
    allSurfacesReady: "كل surfaces جاهزة",
    allReady: "كل شيء جاهز",
    nextTarget: "الهدف التالي",
    followUp: "Follow-up",
    notReviewed: "غير مراجع",
    pendingCheckSurfaces: "Surfaces لديها checks معلقة",
    ready: "جاهز",
    itemMeta: ({ signoffLabel, completedManualCheckCount, totalManualCheckCount }) =>
      `Signoff: ${signoffLabel} · Checks: ${completedManualCheckCount} / ${totalManualCheckCount}`,
    jumpToSurfaceAction: "انتقال إلى surface",
    pendingChecks: (pendingManualCheckCount) =>
      `Checks معلقة: ${pendingManualCheckCount}`,
    queueStatus: {
      followUp: "يتطلب follow-up",
      notReviewed: "غير مراجع",
      pendingChecks: "Checks معلقة",
      ready: "جاهز",
    },
    signoffStatus: {
      notReviewed: "غير مراجع",
      pass: "ناجح",
      followUp: "يتطلب follow-up",
    },
  },
  hi: {
    label: "Review queue",
    detail:
      "Queue पहले follow-up वाली surfaces, फिर not-reviewed surfaces, फिर pending checks वाले pass states दिखाती है ताकि reviewer पूरी page scan किए बिना unresolved work कर सके।",
    jumpToSurface: (surfaceTitle) => `${surfaceTitle} पर जाएं`,
    allSurfacesReady: "सभी surfaces ready हैं",
    allReady: "सब ready",
    nextTarget: "अगला target",
    followUp: "Follow-up",
    notReviewed: "Not reviewed",
    pendingCheckSurfaces: "Pending-check surfaces",
    ready: "Ready",
    itemMeta: ({ signoffLabel, completedManualCheckCount, totalManualCheckCount }) =>
      `Signoff: ${signoffLabel} · Checks: ${completedManualCheckCount} / ${totalManualCheckCount}`,
    jumpToSurfaceAction: "Surface पर जाएं",
    pendingChecks: (pendingManualCheckCount) =>
      `Pending checks: ${pendingManualCheckCount}`,
    queueStatus: {
      followUp: "Follow-up required",
      notReviewed: "Not reviewed",
      pendingChecks: "Pending checks",
      ready: "Ready",
    },
    signoffStatus: {
      notReviewed: "Not reviewed",
      pass: "Pass",
      followUp: "Follow-up required",
    },
  },
  id: {
    label: "Antrean review",
    detail:
      "Antrean menaruh surface yang butuh follow-up lebih dulu, lalu surface belum direview, lalu status pass dengan check tertunda, agar reviewer bisa menangani pekerjaan terbuka tanpa memindai seluruh halaman.",
    jumpToSurface: (surfaceTitle) => `Lompat ke ${surfaceTitle}`,
    allSurfacesReady: "Semua surface siap",
    allReady: "Semua siap",
    nextTarget: "Target berikutnya",
    followUp: "Follow-up",
    notReviewed: "Belum direview",
    pendingCheckSurfaces: "Surface dengan check tertunda",
    ready: "Siap",
    itemMeta: ({ signoffLabel, completedManualCheckCount, totalManualCheckCount }) =>
      `Signoff: ${signoffLabel} · Check: ${completedManualCheckCount} / ${totalManualCheckCount}`,
    jumpToSurfaceAction: "Lompat ke surface",
    pendingChecks: (pendingManualCheckCount) =>
      `Check tertunda: ${pendingManualCheckCount}`,
    queueStatus: {
      followUp: "Follow-up diperlukan",
      notReviewed: "Belum direview",
      pendingChecks: "Check tertunda",
      ready: "Siap",
    },
    signoffStatus: {
      notReviewed: "Belum direview",
      pass: "Lulus",
      followUp: "Follow-up diperlukan",
    },
  },
};

const INTERACTION_AUDIT_SURFACE_CARD_COPY: Record<
  ResolvedAppLocale,
  InteractionAuditSurfaceCardCopy
> = {
  en: {
    sectionLabel: "Audit Surface",
    openStandalone: "Open standalone",
    auditState: "Audit state",
    frameState: "Frame state",
    loadingFrame: "Loading embedded frame for audit presets.",
    manualChecks: "Manual checks",
    surfaceSignoff: "Surface signoff",
    operatorNotes: "Operator notes",
    notesPlaceholder: "Record reviewer notes for this surface.",
    signoffStatus: {
      notReviewed: "Not reviewed",
      pass: "Pass",
      followUp: "Follow-up required",
    },
  },
  "zh-CN": {
    sectionLabel: "审计 surface",
    openStandalone: "单独打开",
    auditState: "审计状态",
    frameState: "Frame 状态",
    loadingFrame: "正在加载用于审计 preset 的嵌入 frame。",
    manualChecks: "手动检查",
    surfaceSignoff: "Surface 签核",
    operatorNotes: "Operator 备注",
    notesPlaceholder: "记录此 surface 的 reviewer 备注。",
    signoffStatus: {
      notReviewed: "未复查",
      pass: "通过",
      followUp: "需要 follow-up",
    },
  },
  "zh-TW": {
    sectionLabel: "稽核 surface",
    openStandalone: "單獨開啟",
    auditState: "稽核狀態",
    frameState: "Frame 狀態",
    loadingFrame: "正在載入用於稽核 preset 的嵌入 frame。",
    manualChecks: "手動檢查",
    surfaceSignoff: "Surface 簽核",
    operatorNotes: "Operator 備註",
    notesPlaceholder: "記錄此 surface 的 reviewer 備註。",
    signoffStatus: {
      notReviewed: "未複查",
      pass: "通過",
      followUp: "需要 follow-up",
    },
  },
  ja: {
    sectionLabel: "監査 surface",
    openStandalone: "単独で開く",
    auditState: "監査状態",
    frameState: "Frame 状態",
    loadingFrame: "監査 preset 用の埋め込み frame を読み込んでいます。",
    manualChecks: "手動チェック",
    surfaceSignoff: "Surface サインオフ",
    operatorNotes: "Operator メモ",
    notesPlaceholder: "この surface の reviewer メモを記録します。",
    signoffStatus: {
      notReviewed: "未レビュー",
      pass: "合格",
      followUp: "Follow-up が必要",
    },
  },
  ko: {
    sectionLabel: "감사 surface",
    openStandalone: "단독으로 열기",
    auditState: "감사 상태",
    frameState: "Frame 상태",
    loadingFrame: "감사 preset 용 embedded frame 을 로드하는 중입니다.",
    manualChecks: "수동 체크",
    surfaceSignoff: "Surface signoff",
    operatorNotes: "Operator notes",
    notesPlaceholder: "이 surface 에 대한 reviewer notes 를 기록합니다.",
    signoffStatus: {
      notReviewed: "미검토",
      pass: "통과",
      followUp: "Follow-up 필요",
    },
  },
  "es-419": {
    sectionLabel: "Superficie de auditoría",
    openStandalone: "Abrir independiente",
    auditState: "Estado de auditoría",
    frameState: "Estado del frame",
    loadingFrame: "Cargando frame embebido para presets de auditoría.",
    manualChecks: "Checks manuales",
    surfaceSignoff: "Signoff de superficie",
    operatorNotes: "Notas del operador",
    notesPlaceholder: "Registra notas del reviewer para esta superficie.",
    signoffStatus: {
      notReviewed: "No revisado",
      pass: "Aprobado",
      followUp: "Follow-up requerido",
    },
  },
  "pt-BR": {
    sectionLabel: "Superfície de auditoria",
    openStandalone: "Abrir separado",
    auditState: "Estado da auditoria",
    frameState: "Estado do frame",
    loadingFrame: "Carregando frame embutido para presets de auditoria.",
    manualChecks: "Checks manuais",
    surfaceSignoff: "Signoff da superfície",
    operatorNotes: "Notas do operador",
    notesPlaceholder: "Registre notas do reviewer para esta superfície.",
    signoffStatus: {
      notReviewed: "Não revisado",
      pass: "Aprovado",
      followUp: "Follow-up necessário",
    },
  },
  fr: {
    sectionLabel: "Surface d'audit",
    openStandalone: "Ouvrir séparément",
    auditState: "État d'audit",
    frameState: "État du frame",
    loadingFrame: "Chargement du frame intégré pour les presets d'audit.",
    manualChecks: "Checks manuels",
    surfaceSignoff: "Signoff de surface",
    operatorNotes: "Notes operator",
    notesPlaceholder: "Enregistrer les notes reviewer pour cette surface.",
    signoffStatus: {
      notReviewed: "Non revu",
      pass: "Validé",
      followUp: "Follow-up requis",
    },
  },
  de: {
    sectionLabel: "Audit-Surface",
    openStandalone: "Separat öffnen",
    auditState: "Audit-Status",
    frameState: "Frame-Status",
    loadingFrame: "Eingebetteter Frame für Audit-Presets wird geladen.",
    manualChecks: "Manuelle Checks",
    surfaceSignoff: "Surface-Signoff",
    operatorNotes: "Operator-Notizen",
    notesPlaceholder: "Reviewer-Notizen für dieses Surface erfassen.",
    signoffStatus: {
      notReviewed: "Nicht geprüft",
      pass: "Bestanden",
      followUp: "Follow-up erforderlich",
    },
  },
  it: {
    sectionLabel: "Surface di audit",
    openStandalone: "Apri separato",
    auditState: "Stato audit",
    frameState: "Stato frame",
    loadingFrame: "Caricamento frame incorporato per preset di audit.",
    manualChecks: "Check manuali",
    surfaceSignoff: "Signoff surface",
    operatorNotes: "Note operator",
    notesPlaceholder: "Registra note reviewer per questa surface.",
    signoffStatus: {
      notReviewed: "Non revisionato",
      pass: "Pass",
      followUp: "Follow-up richiesto",
    },
  },
  ru: {
    sectionLabel: "Audit surface",
    openStandalone: "Открыть отдельно",
    auditState: "Состояние аудита",
    frameState: "Состояние frame",
    loadingFrame: "Загрузка встроенного frame для audit presets.",
    manualChecks: "Ручные checks",
    surfaceSignoff: "Surface signoff",
    operatorNotes: "Заметки operator",
    notesPlaceholder: "Запишите reviewer notes для этого surface.",
    signoffStatus: {
      notReviewed: "Не проверено",
      pass: "Пройдено",
      followUp: "Требуется follow-up",
    },
  },
  ar: {
    sectionLabel: "Surface التدقيق",
    openStandalone: "فتح بشكل مستقل",
    auditState: "حالة التدقيق",
    frameState: "حالة frame",
    loadingFrame: "جار تحميل frame مضمن من أجل audit presets.",
    manualChecks: "Checks يدوية",
    surfaceSignoff: "توقيع surface",
    operatorNotes: "ملاحظات operator",
    notesPlaceholder: "سجل ملاحظات reviewer لهذه surface.",
    signoffStatus: {
      notReviewed: "غير مراجع",
      pass: "ناجح",
      followUp: "يتطلب follow-up",
    },
  },
  hi: {
    sectionLabel: "Audit surface",
    openStandalone: "अलग से खोलें",
    auditState: "Audit state",
    frameState: "Frame state",
    loadingFrame: "Audit presets के लिए embedded frame load हो रहा है।",
    manualChecks: "Manual checks",
    surfaceSignoff: "Surface signoff",
    operatorNotes: "Operator notes",
    notesPlaceholder: "इस surface के reviewer notes दर्ज करें।",
    signoffStatus: {
      notReviewed: "Not reviewed",
      pass: "Pass",
      followUp: "Follow-up required",
    },
  },
  id: {
    sectionLabel: "Surface audit",
    openStandalone: "Buka terpisah",
    auditState: "Status audit",
    frameState: "Status frame",
    loadingFrame: "Memuat frame tertanam untuk preset audit.",
    manualChecks: "Check manual",
    surfaceSignoff: "Signoff surface",
    operatorNotes: "Catatan operator",
    notesPlaceholder: "Catat notes reviewer untuk surface ini.",
    signoffStatus: {
      notReviewed: "Belum direview",
      pass: "Lulus",
      followUp: "Follow-up diperlukan",
    },
  },
};

const INTERACTION_AUDIT_WORKSPACE_CONTROLS_COPY: Record<
  ResolvedAppLocale,
  InteractionAuditWorkspaceControlsCopy
> = {
  en: {
    copySignoffDraft: "Copy signoff draft",
    downloadSignoffDraft: "Download signoff draft",
    copySignoffJson: "Copy signoff JSON",
    downloadSignoffJson: "Download signoff JSON",
    resetSignoff: "Reset signoff",
    importSignoffJson: "Import signoff JSON",
    pastedSignoffJson: "Pasted signoff JSON",
    importPlaceholder: "Paste exported signoff JSON to restore a workspace.",
    applyImportedSignoff: "Apply imported signoff",
    clearPastedJson: "Clear pasted JSON",
    workspaceState: "Workspace state",
    currentSignoffDraft: "Current signoff draft",
    feedback: {
      noDecisions: "No operator signoff decisions are recorded yet.",
      updatedWorkspace: "Updated the operator signoff workspace.",
      updatedMetadata: "Updated the review-session metadata.",
      stampedReviewTime:
        "Stamped the current review time into the workspace metadata.",
      copiedSignoffDraft: "Copied the current signoff draft to the clipboard.",
      copiedSignoffJson: "Copied the current signoff JSON to the clipboard.",
      clipboardUnavailable:
        "Clipboard access is unavailable in this audit environment.",
      failedCopySignoffDraft:
        "Failed to copy the current signoff draft to the clipboard.",
      failedCopySignoffJson:
        "Failed to copy the current signoff JSON to the clipboard.",
      downloadedSignoffDraft: (filename) =>
        `Downloaded the current signoff draft as ${filename}.`,
      downloadedSignoffJson: (filename) =>
        `Downloaded the current signoff JSON as ${filename}.`,
      failedDownloadSignoffDraft:
        "Failed to download the current signoff draft from this audit environment.",
      failedDownloadSignoffJson:
        "Failed to download the current signoff JSON from this audit environment.",
      resetWorkspace: "Reset the operator signoff workspace.",
      importedSignoffJson: "Imported signoff JSON into the workspace.",
      clearedPastedJson: "Cleared the pasted signoff JSON.",
    },
  },
  "zh-CN": {
    copySignoffDraft: "复制 signoff 草稿",
    downloadSignoffDraft: "下载 signoff 草稿",
    copySignoffJson: "复制 signoff JSON",
    downloadSignoffJson: "下载 signoff JSON",
    resetSignoff: "重置 signoff",
    importSignoffJson: "导入 signoff JSON",
    pastedSignoffJson: "粘贴的 signoff JSON",
    importPlaceholder: "粘贴已导出的 signoff JSON 以恢复 workspace。",
    applyImportedSignoff: "应用导入的 signoff",
    clearPastedJson: "清空粘贴的 JSON",
    workspaceState: "Workspace 状态",
    currentSignoffDraft: "当前 signoff 草稿",
    feedback: {
      noDecisions: "尚未记录 operator signoff 决策。",
      updatedWorkspace: "已更新 operator signoff workspace。",
      updatedMetadata: "已更新 review-session 元数据。",
      stampedReviewTime: "已将当前复查时间写入 workspace 元数据。",
      copiedSignoffDraft: "已将当前 signoff 草稿复制到剪贴板。",
      copiedSignoffJson: "已将当前 signoff JSON 复制到剪贴板。",
      clipboardUnavailable: "此审计环境无法访问剪贴板。",
      failedCopySignoffDraft: "无法将当前 signoff 草稿复制到剪贴板。",
      failedCopySignoffJson: "无法将当前 signoff JSON 复制到剪贴板。",
      downloadedSignoffDraft: (filename) =>
        `已将当前 signoff 草稿下载为 ${filename}。`,
      downloadedSignoffJson: (filename) =>
        `已将当前 signoff JSON 下载为 ${filename}。`,
      failedDownloadSignoffDraft:
        "无法从此审计环境下载当前 signoff 草稿。",
      failedDownloadSignoffJson:
        "无法从此审计环境下载当前 signoff JSON。",
      resetWorkspace: "已重置 operator signoff workspace。",
      importedSignoffJson: "已将 signoff JSON 导入 workspace。",
      clearedPastedJson: "已清空粘贴的 signoff JSON。",
    },
  },
  "zh-TW": {
    copySignoffDraft: "複製 signoff 草稿",
    downloadSignoffDraft: "下載 signoff 草稿",
    copySignoffJson: "複製 signoff JSON",
    downloadSignoffJson: "下載 signoff JSON",
    resetSignoff: "重置 signoff",
    importSignoffJson: "匯入 signoff JSON",
    pastedSignoffJson: "貼上的 signoff JSON",
    importPlaceholder: "貼上已匯出的 signoff JSON 以恢復 workspace。",
    applyImportedSignoff: "套用匯入的 signoff",
    clearPastedJson: "清除貼上的 JSON",
    workspaceState: "Workspace 狀態",
    currentSignoffDraft: "目前 signoff 草稿",
    feedback: {
      noDecisions: "尚未記錄 operator signoff 決策。",
      updatedWorkspace: "已更新 operator signoff workspace。",
      updatedMetadata: "已更新 review-session 中繼資料。",
      stampedReviewTime: "已將目前複查時間寫入 workspace 中繼資料。",
      copiedSignoffDraft: "已將目前 signoff 草稿複製到剪貼簿。",
      copiedSignoffJson: "已將目前 signoff JSON 複製到剪貼簿。",
      clipboardUnavailable: "此稽核環境無法存取剪貼簿。",
      failedCopySignoffDraft: "無法將目前 signoff 草稿複製到剪貼簿。",
      failedCopySignoffJson: "無法將目前 signoff JSON 複製到剪貼簿。",
      downloadedSignoffDraft: (filename) =>
        `已將目前 signoff 草稿下載為 ${filename}。`,
      downloadedSignoffJson: (filename) =>
        `已將目前 signoff JSON 下載為 ${filename}。`,
      failedDownloadSignoffDraft:
        "無法從此稽核環境下載目前 signoff 草稿。",
      failedDownloadSignoffJson:
        "無法從此稽核環境下載目前 signoff JSON。",
      resetWorkspace: "已重置 operator signoff workspace。",
      importedSignoffJson: "已將 signoff JSON 匯入 workspace。",
      clearedPastedJson: "已清除貼上的 signoff JSON。",
    },
  },
  ja: {
    copySignoffDraft: "Signoff 草稿をコピー",
    downloadSignoffDraft: "Signoff 草稿をダウンロード",
    copySignoffJson: "Signoff JSON をコピー",
    downloadSignoffJson: "Signoff JSON をダウンロード",
    resetSignoff: "Signoff をリセット",
    importSignoffJson: "Signoff JSON をインポート",
    pastedSignoffJson: "貼り付けた signoff JSON",
    importPlaceholder:
      "Export した signoff JSON を貼り付けて workspace を復元します。",
    applyImportedSignoff: "インポートした signoff を適用",
    clearPastedJson: "貼り付けた JSON をクリア",
    workspaceState: "Workspace 状態",
    currentSignoffDraft: "現在の signoff 草稿",
    feedback: {
      noDecisions: "Operator signoff の判断はまだ記録されていません。",
      updatedWorkspace: "Operator signoff workspace を更新しました。",
      updatedMetadata: "Review-session メタデータを更新しました。",
      stampedReviewTime: "現在のレビュー時刻を workspace メタデータに記録しました。",
      copiedSignoffDraft: "現在の signoff 草稿をクリップボードにコピーしました。",
      copiedSignoffJson: "現在の signoff JSON をクリップボードにコピーしました。",
      clipboardUnavailable:
        "この監査環境ではクリップボードにアクセスできません。",
      failedCopySignoffDraft:
        "現在の signoff 草稿をクリップボードにコピーできませんでした。",
      failedCopySignoffJson:
        "現在の signoff JSON をクリップボードにコピーできませんでした。",
      downloadedSignoffDraft: (filename) =>
        `現在の signoff 草稿を ${filename} としてダウンロードしました。`,
      downloadedSignoffJson: (filename) =>
        `現在の signoff JSON を ${filename} としてダウンロードしました。`,
      failedDownloadSignoffDraft:
        "この監査環境から現在の signoff 草稿をダウンロードできませんでした。",
      failedDownloadSignoffJson:
        "この監査環境から現在の signoff JSON をダウンロードできませんでした。",
      resetWorkspace: "Operator signoff workspace をリセットしました。",
      importedSignoffJson: "Signoff JSON を workspace にインポートしました。",
      clearedPastedJson: "貼り付けた signoff JSON をクリアしました。",
    },
  },
  ko: {
    copySignoffDraft: "Signoff draft 복사",
    downloadSignoffDraft: "Signoff draft 다운로드",
    copySignoffJson: "Signoff JSON 복사",
    downloadSignoffJson: "Signoff JSON 다운로드",
    resetSignoff: "Signoff 재설정",
    importSignoffJson: "Signoff JSON 가져오기",
    pastedSignoffJson: "붙여넣은 signoff JSON",
    importPlaceholder:
      "내보낸 signoff JSON 을 붙여넣어 workspace 를 복원합니다.",
    applyImportedSignoff: "가져온 signoff 적용",
    clearPastedJson: "붙여넣은 JSON 지우기",
    workspaceState: "Workspace 상태",
    currentSignoffDraft: "현재 signoff draft",
    feedback: {
      noDecisions: "Operator signoff 결정이 아직 기록되지 않았습니다.",
      updatedWorkspace: "Operator signoff workspace 를 업데이트했습니다.",
      updatedMetadata: "Review-session metadata 를 업데이트했습니다.",
      stampedReviewTime:
        "현재 review 시간을 workspace metadata 에 기록했습니다.",
      copiedSignoffDraft: "현재 signoff draft 를 clipboard 에 복사했습니다.",
      copiedSignoffJson: "현재 signoff JSON 을 clipboard 에 복사했습니다.",
      clipboardUnavailable:
        "이 audit 환경에서는 clipboard 접근을 사용할 수 없습니다.",
      failedCopySignoffDraft:
        "현재 signoff draft 를 clipboard 에 복사하지 못했습니다.",
      failedCopySignoffJson:
        "현재 signoff JSON 을 clipboard 에 복사하지 못했습니다.",
      downloadedSignoffDraft: (filename) =>
        `현재 signoff draft 를 ${filename}(으)로 다운로드했습니다.`,
      downloadedSignoffJson: (filename) =>
        `현재 signoff JSON 을 ${filename}(으)로 다운로드했습니다.`,
      failedDownloadSignoffDraft:
        "이 audit 환경에서 현재 signoff draft 를 다운로드하지 못했습니다.",
      failedDownloadSignoffJson:
        "이 audit 환경에서 현재 signoff JSON 을 다운로드하지 못했습니다.",
      resetWorkspace: "Operator signoff workspace 를 재설정했습니다.",
      importedSignoffJson: "Signoff JSON 을 workspace 로 가져왔습니다.",
      clearedPastedJson: "붙여넣은 signoff JSON 을 지웠습니다.",
    },
  },
  "es-419": {
    copySignoffDraft: "Copiar borrador de signoff",
    downloadSignoffDraft: "Descargar borrador de signoff",
    copySignoffJson: "Copiar signoff JSON",
    downloadSignoffJson: "Descargar signoff JSON",
    resetSignoff: "Restablecer signoff",
    importSignoffJson: "Importar signoff JSON",
    pastedSignoffJson: "Signoff JSON pegado",
    importPlaceholder:
      "Pega el signoff JSON exportado para restaurar un workspace.",
    applyImportedSignoff: "Aplicar signoff importado",
    clearPastedJson: "Limpiar JSON pegado",
    workspaceState: "Estado del workspace",
    currentSignoffDraft: "Borrador de signoff actual",
    feedback: {
      noDecisions: "Aún no se registran decisiones de signoff del operador.",
      updatedWorkspace: "Se actualizó el workspace de signoff del operador.",
      updatedMetadata: "Se actualizaron los metadatos de la review-session.",
      stampedReviewTime:
        "Se marcó la hora de revisión actual en los metadatos del workspace.",
      copiedSignoffDraft:
        "Se copió el borrador de signoff actual al portapapeles.",
      copiedSignoffJson: "Se copió el signoff JSON actual al portapapeles.",
      clipboardUnavailable:
        "El acceso al portapapeles no está disponible en este entorno de auditoría.",
      failedCopySignoffDraft:
        "No se pudo copiar el borrador de signoff actual al portapapeles.",
      failedCopySignoffJson:
        "No se pudo copiar el signoff JSON actual al portapapeles.",
      downloadedSignoffDraft: (filename) =>
        `Se descargó el borrador de signoff actual como ${filename}.`,
      downloadedSignoffJson: (filename) =>
        `Se descargó el signoff JSON actual como ${filename}.`,
      failedDownloadSignoffDraft:
        "No se pudo descargar el borrador de signoff actual desde este entorno de auditoría.",
      failedDownloadSignoffJson:
        "No se pudo descargar el signoff JSON actual desde este entorno de auditoría.",
      resetWorkspace: "Se restableció el workspace de signoff del operador.",
      importedSignoffJson: "Se importó el signoff JSON al workspace.",
      clearedPastedJson: "Se limpió el signoff JSON pegado.",
    },
  },
  "pt-BR": {
    copySignoffDraft: "Copiar rascunho de signoff",
    downloadSignoffDraft: "Baixar rascunho de signoff",
    copySignoffJson: "Copiar signoff JSON",
    downloadSignoffJson: "Baixar signoff JSON",
    resetSignoff: "Redefinir signoff",
    importSignoffJson: "Importar signoff JSON",
    pastedSignoffJson: "Signoff JSON colado",
    importPlaceholder:
      "Cole o signoff JSON exportado para restaurar um workspace.",
    applyImportedSignoff: "Aplicar signoff importado",
    clearPastedJson: "Limpar JSON colado",
    workspaceState: "Estado do workspace",
    currentSignoffDraft: "Rascunho de signoff atual",
    feedback: {
      noDecisions: "Ainda não há decisões de signoff do operador registradas.",
      updatedWorkspace: "Workspace de signoff do operador atualizado.",
      updatedMetadata: "Metadados da review-session atualizados.",
      stampedReviewTime:
        "Hora atual da revisão registrada nos metadados do workspace.",
      copiedSignoffDraft:
        "Rascunho de signoff atual copiado para a área de transferência.",
      copiedSignoffJson:
        "Signoff JSON atual copiado para a área de transferência.",
      clipboardUnavailable:
        "Acesso à área de transferência indisponível neste ambiente de auditoria.",
      failedCopySignoffDraft:
        "Falha ao copiar o rascunho de signoff atual para a área de transferência.",
      failedCopySignoffJson:
        "Falha ao copiar o signoff JSON atual para a área de transferência.",
      downloadedSignoffDraft: (filename) =>
        `Rascunho de signoff atual baixado como ${filename}.`,
      downloadedSignoffJson: (filename) =>
        `Signoff JSON atual baixado como ${filename}.`,
      failedDownloadSignoffDraft:
        "Falha ao baixar o rascunho de signoff atual deste ambiente de auditoria.",
      failedDownloadSignoffJson:
        "Falha ao baixar o signoff JSON atual deste ambiente de auditoria.",
      resetWorkspace: "Workspace de signoff do operador redefinido.",
      importedSignoffJson: "Signoff JSON importado para o workspace.",
      clearedPastedJson: "Signoff JSON colado limpo.",
    },
  },
  fr: {
    copySignoffDraft: "Copier le brouillon de signoff",
    downloadSignoffDraft: "Télécharger le brouillon de signoff",
    copySignoffJson: "Copier le signoff JSON",
    downloadSignoffJson: "Télécharger le signoff JSON",
    resetSignoff: "Réinitialiser le signoff",
    importSignoffJson: "Importer le signoff JSON",
    pastedSignoffJson: "Signoff JSON collé",
    importPlaceholder:
      "Collez le signoff JSON exporté pour restaurer un workspace.",
    applyImportedSignoff: "Appliquer le signoff importé",
    clearPastedJson: "Effacer le JSON collé",
    workspaceState: "État du workspace",
    currentSignoffDraft: "Brouillon de signoff actuel",
    feedback: {
      noDecisions: "Aucune décision de signoff operator n'est encore enregistrée.",
      updatedWorkspace: "Workspace de signoff operator mis à jour.",
      updatedMetadata: "Métadonnées de review-session mises à jour.",
      stampedReviewTime:
        "Heure de revue actuelle inscrite dans les métadonnées du workspace.",
      copiedSignoffDraft:
        "Brouillon de signoff actuel copié dans le presse-papiers.",
      copiedSignoffJson: "Signoff JSON actuel copié dans le presse-papiers.",
      clipboardUnavailable:
        "L'accès au presse-papiers est indisponible dans cet environnement d'audit.",
      failedCopySignoffDraft:
        "Impossible de copier le brouillon de signoff actuel dans le presse-papiers.",
      failedCopySignoffJson:
        "Impossible de copier le signoff JSON actuel dans le presse-papiers.",
      downloadedSignoffDraft: (filename) =>
        `Brouillon de signoff actuel téléchargé sous ${filename}.`,
      downloadedSignoffJson: (filename) =>
        `Signoff JSON actuel téléchargé sous ${filename}.`,
      failedDownloadSignoffDraft:
        "Impossible de télécharger le brouillon de signoff actuel depuis cet environnement d'audit.",
      failedDownloadSignoffJson:
        "Impossible de télécharger le signoff JSON actuel depuis cet environnement d'audit.",
      resetWorkspace: "Workspace de signoff operator réinitialisé.",
      importedSignoffJson: "Signoff JSON importé dans le workspace.",
      clearedPastedJson: "Signoff JSON collé effacé.",
    },
  },
  de: {
    copySignoffDraft: "Signoff-Entwurf kopieren",
    downloadSignoffDraft: "Signoff-Entwurf herunterladen",
    copySignoffJson: "Signoff-JSON kopieren",
    downloadSignoffJson: "Signoff-JSON herunterladen",
    resetSignoff: "Signoff zurücksetzen",
    importSignoffJson: "Signoff-JSON importieren",
    pastedSignoffJson: "Eingefügtes Signoff-JSON",
    importPlaceholder:
      "Exportiertes Signoff-JSON einfügen, um einen Workspace wiederherzustellen.",
    applyImportedSignoff: "Importierten Signoff anwenden",
    clearPastedJson: "Eingefügtes JSON löschen",
    workspaceState: "Workspace-Status",
    currentSignoffDraft: "Aktueller Signoff-Entwurf",
    feedback: {
      noDecisions: "Es sind noch keine Operator-Signoff-Entscheidungen erfasst.",
      updatedWorkspace: "Operator-Signoff-Workspace aktualisiert.",
      updatedMetadata: "Review-Session-Metadaten aktualisiert.",
      stampedReviewTime:
        "Aktuelle Review-Zeit in die Workspace-Metadaten geschrieben.",
      copiedSignoffDraft:
        "Aktueller Signoff-Entwurf in die Zwischenablage kopiert.",
      copiedSignoffJson: "Aktuelles Signoff-JSON in die Zwischenablage kopiert.",
      clipboardUnavailable:
        "Zwischenablagezugriff ist in dieser Audit-Umgebung nicht verfügbar.",
      failedCopySignoffDraft:
        "Aktueller Signoff-Entwurf konnte nicht in die Zwischenablage kopiert werden.",
      failedCopySignoffJson:
        "Aktuelles Signoff-JSON konnte nicht in die Zwischenablage kopiert werden.",
      downloadedSignoffDraft: (filename) =>
        `Aktueller Signoff-Entwurf als ${filename} heruntergeladen.`,
      downloadedSignoffJson: (filename) =>
        `Aktuelles Signoff-JSON als ${filename} heruntergeladen.`,
      failedDownloadSignoffDraft:
        "Aktueller Signoff-Entwurf konnte aus dieser Audit-Umgebung nicht heruntergeladen werden.",
      failedDownloadSignoffJson:
        "Aktuelles Signoff-JSON konnte aus dieser Audit-Umgebung nicht heruntergeladen werden.",
      resetWorkspace: "Operator-Signoff-Workspace zurückgesetzt.",
      importedSignoffJson: "Signoff-JSON in den Workspace importiert.",
      clearedPastedJson: "Eingefügtes Signoff-JSON gelöscht.",
    },
  },
  it: {
    copySignoffDraft: "Copia bozza signoff",
    downloadSignoffDraft: "Scarica bozza signoff",
    copySignoffJson: "Copia signoff JSON",
    downloadSignoffJson: "Scarica signoff JSON",
    resetSignoff: "Reimposta signoff",
    importSignoffJson: "Importa signoff JSON",
    pastedSignoffJson: "Signoff JSON incollato",
    importPlaceholder:
      "Incolla il signoff JSON esportato per ripristinare un workspace.",
    applyImportedSignoff: "Applica signoff importato",
    clearPastedJson: "Cancella JSON incollato",
    workspaceState: "Stato workspace",
    currentSignoffDraft: "Bozza signoff attuale",
    feedback: {
      noDecisions: "Nessuna decisione di signoff operator ancora registrata.",
      updatedWorkspace: "Workspace di signoff operator aggiornato.",
      updatedMetadata: "Metadati review-session aggiornati.",
      stampedReviewTime:
        "Ora di revisione attuale registrata nei metadati del workspace.",
      copiedSignoffDraft: "Bozza signoff attuale copiata negli appunti.",
      copiedSignoffJson: "Signoff JSON attuale copiato negli appunti.",
      clipboardUnavailable:
        "Accesso agli appunti non disponibile in questo ambiente di audit.",
      failedCopySignoffDraft:
        "Impossibile copiare la bozza signoff attuale negli appunti.",
      failedCopySignoffJson:
        "Impossibile copiare il signoff JSON attuale negli appunti.",
      downloadedSignoffDraft: (filename) =>
        `Bozza signoff attuale scaricata come ${filename}.`,
      downloadedSignoffJson: (filename) =>
        `Signoff JSON attuale scaricato come ${filename}.`,
      failedDownloadSignoffDraft:
        "Impossibile scaricare la bozza signoff attuale da questo ambiente di audit.",
      failedDownloadSignoffJson:
        "Impossibile scaricare il signoff JSON attuale da questo ambiente di audit.",
      resetWorkspace: "Workspace di signoff operator reimpostato.",
      importedSignoffJson: "Signoff JSON importato nel workspace.",
      clearedPastedJson: "Signoff JSON incollato cancellato.",
    },
  },
  ru: {
    copySignoffDraft: "Копировать draft signoff",
    downloadSignoffDraft: "Скачать draft signoff",
    copySignoffJson: "Копировать signoff JSON",
    downloadSignoffJson: "Скачать signoff JSON",
    resetSignoff: "Сбросить signoff",
    importSignoffJson: "Импортировать signoff JSON",
    pastedSignoffJson: "Вставленный signoff JSON",
    importPlaceholder:
      "Вставьте экспортированный signoff JSON, чтобы восстановить workspace.",
    applyImportedSignoff: "Применить импортированный signoff",
    clearPastedJson: "Очистить вставленный JSON",
    workspaceState: "Состояние workspace",
    currentSignoffDraft: "Текущий draft signoff",
    feedback: {
      noDecisions: "Решения operator signoff еще не записаны.",
      updatedWorkspace: "Operator signoff workspace обновлен.",
      updatedMetadata: "Метаданные review-session обновлены.",
      stampedReviewTime:
        "Текущее время проверки записано в метаданные workspace.",
      copiedSignoffDraft: "Текущий draft signoff скопирован в clipboard.",
      copiedSignoffJson: "Текущий signoff JSON скопирован в clipboard.",
      clipboardUnavailable:
        "Доступ к clipboard недоступен в этой audit-среде.",
      failedCopySignoffDraft:
        "Не удалось скопировать текущий draft signoff в clipboard.",
      failedCopySignoffJson:
        "Не удалось скопировать текущий signoff JSON в clipboard.",
      downloadedSignoffDraft: (filename) =>
        `Текущий draft signoff скачан как ${filename}.`,
      downloadedSignoffJson: (filename) =>
        `Текущий signoff JSON скачан как ${filename}.`,
      failedDownloadSignoffDraft:
        "Не удалось скачать текущий draft signoff из этой audit-среды.",
      failedDownloadSignoffJson:
        "Не удалось скачать текущий signoff JSON из этой audit-среды.",
      resetWorkspace: "Operator signoff workspace сброшен.",
      importedSignoffJson: "Signoff JSON импортирован в workspace.",
      clearedPastedJson: "Вставленный signoff JSON очищен.",
    },
  },
  ar: {
    copySignoffDraft: "نسخ مسودة signoff",
    downloadSignoffDraft: "تنزيل مسودة signoff",
    copySignoffJson: "نسخ signoff JSON",
    downloadSignoffJson: "تنزيل signoff JSON",
    resetSignoff: "إعادة ضبط signoff",
    importSignoffJson: "استيراد signoff JSON",
    pastedSignoffJson: "signoff JSON الملصق",
    importPlaceholder:
      "الصق signoff JSON المصدّر لاستعادة workspace.",
    applyImportedSignoff: "تطبيق signoff المستورد",
    clearPastedJson: "مسح JSON الملصق",
    workspaceState: "حالة workspace",
    currentSignoffDraft: "مسودة signoff الحالية",
    feedback: {
      noDecisions: "لم يتم تسجيل قرارات operator signoff بعد.",
      updatedWorkspace: "تم تحديث operator signoff workspace.",
      updatedMetadata: "تم تحديث بيانات review-session.",
      stampedReviewTime:
        "تم تسجيل وقت المراجعة الحالي في بيانات workspace.",
      copiedSignoffDraft: "تم نسخ مسودة signoff الحالية إلى clipboard.",
      copiedSignoffJson: "تم نسخ signoff JSON الحالي إلى clipboard.",
      clipboardUnavailable:
        "الوصول إلى clipboard غير متاح في بيئة التدقيق هذه.",
      failedCopySignoffDraft:
        "تعذر نسخ مسودة signoff الحالية إلى clipboard.",
      failedCopySignoffJson: "تعذر نسخ signoff JSON الحالي إلى clipboard.",
      downloadedSignoffDraft: (filename) =>
        `تم تنزيل مسودة signoff الحالية باسم ${filename}.`,
      downloadedSignoffJson: (filename) =>
        `تم تنزيل signoff JSON الحالي باسم ${filename}.`,
      failedDownloadSignoffDraft:
        "تعذر تنزيل مسودة signoff الحالية من بيئة التدقيق هذه.",
      failedDownloadSignoffJson:
        "تعذر تنزيل signoff JSON الحالي من بيئة التدقيق هذه.",
      resetWorkspace: "تمت إعادة ضبط operator signoff workspace.",
      importedSignoffJson: "تم استيراد signoff JSON إلى workspace.",
      clearedPastedJson: "تم مسح signoff JSON الملصق.",
    },
  },
  hi: {
    copySignoffDraft: "Signoff draft copy करें",
    downloadSignoffDraft: "Signoff draft download करें",
    copySignoffJson: "Signoff JSON copy करें",
    downloadSignoffJson: "Signoff JSON download करें",
    resetSignoff: "Signoff reset करें",
    importSignoffJson: "Signoff JSON import करें",
    pastedSignoffJson: "Pasted signoff JSON",
    importPlaceholder:
      "Workspace restore करने के लिए exported signoff JSON paste करें।",
    applyImportedSignoff: "Imported signoff apply करें",
    clearPastedJson: "Pasted JSON clear करें",
    workspaceState: "Workspace state",
    currentSignoffDraft: "Current signoff draft",
    feedback: {
      noDecisions: "अभी कोई operator signoff decision record नहीं है।",
      updatedWorkspace: "Operator signoff workspace updated.",
      updatedMetadata: "Review-session metadata updated.",
      stampedReviewTime:
        "Current review time workspace metadata में stamped.",
      copiedSignoffDraft: "Current signoff draft clipboard में copied.",
      copiedSignoffJson: "Current signoff JSON clipboard में copied.",
      clipboardUnavailable:
        "इस audit environment में clipboard access unavailable है।",
      failedCopySignoffDraft:
        "Current signoff draft clipboard में copy नहीं हुआ।",
      failedCopySignoffJson:
        "Current signoff JSON clipboard में copy नहीं हुआ।",
      downloadedSignoffDraft: (filename) =>
        `Current signoff draft ${filename} के रूप में downloaded.`,
      downloadedSignoffJson: (filename) =>
        `Current signoff JSON ${filename} के रूप में downloaded.`,
      failedDownloadSignoffDraft:
        "इस audit environment से current signoff draft download नहीं हुआ।",
      failedDownloadSignoffJson:
        "इस audit environment से current signoff JSON download नहीं हुआ।",
      resetWorkspace: "Operator signoff workspace reset.",
      importedSignoffJson: "Signoff JSON workspace में imported.",
      clearedPastedJson: "Pasted signoff JSON cleared.",
    },
  },
  id: {
    copySignoffDraft: "Salin draft signoff",
    downloadSignoffDraft: "Unduh draft signoff",
    copySignoffJson: "Salin signoff JSON",
    downloadSignoffJson: "Unduh signoff JSON",
    resetSignoff: "Reset signoff",
    importSignoffJson: "Impor signoff JSON",
    pastedSignoffJson: "Signoff JSON yang ditempel",
    importPlaceholder:
      "Tempel signoff JSON yang diekspor untuk memulihkan workspace.",
    applyImportedSignoff: "Terapkan signoff impor",
    clearPastedJson: "Bersihkan JSON tempel",
    workspaceState: "Status workspace",
    currentSignoffDraft: "Draft signoff saat ini",
    feedback: {
      noDecisions: "Belum ada keputusan signoff operator yang direkam.",
      updatedWorkspace: "Workspace signoff operator diperbarui.",
      updatedMetadata: "Metadata review-session diperbarui.",
      stampedReviewTime:
        "Waktu review saat ini dicatat ke metadata workspace.",
      copiedSignoffDraft: "Draft signoff saat ini disalin ke clipboard.",
      copiedSignoffJson: "Signoff JSON saat ini disalin ke clipboard.",
      clipboardUnavailable:
        "Akses clipboard tidak tersedia di lingkungan audit ini.",
      failedCopySignoffDraft:
        "Gagal menyalin draft signoff saat ini ke clipboard.",
      failedCopySignoffJson:
        "Gagal menyalin signoff JSON saat ini ke clipboard.",
      downloadedSignoffDraft: (filename) =>
        `Draft signoff saat ini diunduh sebagai ${filename}.`,
      downloadedSignoffJson: (filename) =>
        `Signoff JSON saat ini diunduh sebagai ${filename}.`,
      failedDownloadSignoffDraft:
        "Gagal mengunduh draft signoff saat ini dari lingkungan audit ini.",
      failedDownloadSignoffJson:
        "Gagal mengunduh signoff JSON saat ini dari lingkungan audit ini.",
      resetWorkspace: "Workspace signoff operator direset.",
      importedSignoffJson: "Signoff JSON diimpor ke workspace.",
      clearedPastedJson: "Signoff JSON yang ditempel dibersihkan.",
    },
  },
};

const INTERACTION_AUDIT_REQUEST_SCOPE_COMMANDS_COPY: Record<
  ResolvedAppLocale,
  InteractionAuditRequestScopeCommandsCopy
> = {
  en: {
    preflightNext: "Preflight next",
    completeNext: "Complete next",
    archiveNext: "Archive next",
  },
  "zh-CN": {
    preflightNext: "下一步预检",
    completeNext: "下一步完成",
    archiveNext: "下一步归档",
  },
  "zh-TW": {
    preflightNext: "下一步預檢",
    completeNext: "下一步完成",
    archiveNext: "下一步歸檔",
  },
  ja: {
    preflightNext: "次に preflight",
    completeNext: "次に complete",
    archiveNext: "次に archive",
  },
  ko: {
    preflightNext: "다음 preflight",
    completeNext: "다음 complete",
    archiveNext: "다음 archive",
  },
  "es-419": {
    preflightNext: "Siguiente preflight",
    completeNext: "Siguiente complete",
    archiveNext: "Siguiente archive",
  },
  "pt-BR": {
    preflightNext: "Próximo preflight",
    completeNext: "Próximo complete",
    archiveNext: "Próximo archive",
  },
  fr: {
    preflightNext: "Preflight suivant",
    completeNext: "Complete suivant",
    archiveNext: "Archive suivante",
  },
  de: {
    preflightNext: "Nächster Preflight",
    completeNext: "Nächster Complete-Schritt",
    archiveNext: "Nächster Archive-Schritt",
  },
  it: {
    preflightNext: "Preflight successivo",
    completeNext: "Complete successivo",
    archiveNext: "Archive successivo",
  },
  ru: {
    preflightNext: "Следующий preflight",
    completeNext: "Следующий complete",
    archiveNext: "Следующий archive",
  },
  ar: {
    preflightNext: "Preflight التالي",
    completeNext: "Complete التالي",
    archiveNext: "Archive التالي",
  },
  hi: {
    preflightNext: "अगला preflight",
    completeNext: "अगला complete",
    archiveNext: "अगला archive",
  },
  id: {
    preflightNext: "Preflight berikutnya",
    completeNext: "Complete berikutnya",
    archiveNext: "Archive berikutnya",
  },
};

const INTERACTION_AUDIT_HANDOFF_SUMMARY_COPY: Record<
  ResolvedAppLocale,
  InteractionAuditHandoffSummaryCopy
> = {
  en: {
    label: "Handoff Summary",
    detail:
      "Use this summary to see what still blocks final operator signoff before exporting the current workspace conclusions.",
    copyAction: "Copy handoff summary",
    downloadAction: "Download handoff summary",
    readyForSignoff: "Ready for signoff",
    ready: "Ready",
    notReady: "Not ready",
    followUpSurfaces: "Follow-up surfaces",
    notReviewed: "Not reviewed",
    pendingChecks: "Pending checks",
    readyStatusLabel: "Ready for final signoff",
    readyStatusDetail:
      "All audit surfaces are reviewed, no follow-up state remains, and every manual check is complete.",
    outstandingStatusLabel: "Outstanding review work",
    outstandingStatusDetail: ({
      reviewSurfaceCount,
      pendingManualCheckCount,
    }) =>
      `${reviewSurfaceCount} surfaces still need review attention, and ${pendingManualCheckCount} manual checks remain incomplete.`,
    followUpRequired: "Follow-up Required",
    notReviewedGroup: "Not Reviewed",
    pendingManualChecks: "Pending Manual Checks",
    none: "None",
    pendingChecksMeta: ({
      pendingManualCheckCount,
      totalManualCheckCount,
    }) => `Pending checks: ${pendingManualCheckCount} / ${totalManualCheckCount}`,
    pendingOfTotal: ({ pendingManualCheckCount, totalManualCheckCount }) =>
      `${pendingManualCheckCount} pending of ${totalManualCheckCount}`,
    noOperatorNotes: "No operator notes recorded yet.",
    currentHandoffSummary: "Current handoff summary",
    operatorHandoffWorkflow: "Operator handoff workflow",
    workflowSteps: [
      "Finish the current review state in the audit hub or import an existing signoff JSON snapshot.",
      "Fill the review-session metadata so the export records reviewer, session label, and review time.",
      "Use `Download signoff JSON` for a direct local file, or `Copy signoff JSON` if the current environment cannot download files.",
      "Keep the downloaded or pasted file under a local path such as `tmp/operator-signoff-export.json`.",
      "Run the bundle command below to package the current export with the latest preset evidence references and preserved review-session metadata.",
    ],
    feedback: {
      copiedHandoffSummary:
        "Copied the current handoff summary to the clipboard.",
      clipboardUnavailable:
        "Clipboard access is unavailable in this audit environment.",
      failedCopyHandoffSummary:
        "Failed to copy the current handoff summary to the clipboard.",
      downloadedHandoffSummary: (filename) =>
        `Downloaded the current handoff summary as ${filename}.`,
      failedDownloadHandoffSummary:
        "Failed to download the current handoff summary from this audit environment.",
    },
  },
  "zh-CN": {
    label: "Handoff 摘要",
    detail:
      "用此摘要查看导出当前 workspace 结论前，哪些内容仍阻塞最终 operator signoff。",
    copyAction: "复制 handoff 摘要",
    downloadAction: "下载 handoff 摘要",
    readyForSignoff: "可 signoff",
    ready: "就绪",
    notReady: "未就绪",
    followUpSurfaces: "Follow-up surface",
    notReviewed: "未复查",
    pendingChecks: "待检查",
    readyStatusLabel: "可进行最终 signoff",
    readyStatusDetail:
      "所有 audit surface 均已复查，没有 follow-up 状态，且所有手动检查均已完成。",
    outstandingStatusLabel: "仍有复查工作",
    outstandingStatusDetail: ({
      reviewSurfaceCount,
      pendingManualCheckCount,
    }) =>
      `${reviewSurfaceCount} 个 surface 仍需复查关注，且 ${pendingManualCheckCount} 个手动检查尚未完成。`,
    followUpRequired: "需要 Follow-up",
    notReviewedGroup: "未复查",
    pendingManualChecks: "待办手动检查",
    none: "无",
    pendingChecksMeta: ({
      pendingManualCheckCount,
      totalManualCheckCount,
    }) => `待检查：${pendingManualCheckCount} / ${totalManualCheckCount}`,
    pendingOfTotal: ({ pendingManualCheckCount, totalManualCheckCount }) =>
      `${pendingManualCheckCount} 个待办，共 ${totalManualCheckCount} 个`,
    noOperatorNotes: "尚未记录 operator 备注。",
    currentHandoffSummary: "当前 handoff 摘要",
    operatorHandoffWorkflow: "Operator handoff 流程",
    workflowSteps: [
      "在 audit hub 中完成当前复查状态，或导入现有 signoff JSON snapshot。",
      "填写 review-session 元数据，使导出记录 reviewer、session label 和 review time。",
      "使用 `Download signoff JSON` 获取本地文件；如果当前环境无法下载文件，则使用 `Copy signoff JSON`。",
      "将下载或粘贴的文件保存在本地路径，例如 `tmp/operator-signoff-export.json`。",
      "运行下方 bundle 命令，将当前导出与最新 preset evidence 引用和保留的 review-session 元数据打包。",
    ],
    feedback: {
      copiedHandoffSummary: "已将当前 handoff 摘要复制到剪贴板。",
      clipboardUnavailable: "此审计环境无法访问剪贴板。",
      failedCopyHandoffSummary: "无法将当前 handoff 摘要复制到剪贴板。",
      downloadedHandoffSummary: (filename) =>
        `已将当前 handoff 摘要下载为 ${filename}。`,
      failedDownloadHandoffSummary:
        "无法从此审计环境下载当前 handoff 摘要。",
    },
  },
  "zh-TW": {
    label: "Handoff 摘要",
    detail:
      "用此摘要查看匯出目前 workspace 結論前，哪些內容仍阻塞最終 operator signoff。",
    copyAction: "複製 handoff 摘要",
    downloadAction: "下載 handoff 摘要",
    readyForSignoff: "可 signoff",
    ready: "就緒",
    notReady: "未就緒",
    followUpSurfaces: "Follow-up surface",
    notReviewed: "未複查",
    pendingChecks: "待檢查",
    readyStatusLabel: "可進行最終 signoff",
    readyStatusDetail:
      "所有 audit surface 均已複查，沒有 follow-up 狀態，且所有手動檢查均已完成。",
    outstandingStatusLabel: "仍有複查工作",
    outstandingStatusDetail: ({
      reviewSurfaceCount,
      pendingManualCheckCount,
    }) =>
      `${reviewSurfaceCount} 個 surface 仍需複查關注，且 ${pendingManualCheckCount} 個手動檢查尚未完成。`,
    followUpRequired: "需要 Follow-up",
    notReviewedGroup: "未複查",
    pendingManualChecks: "待辦手動檢查",
    none: "無",
    pendingChecksMeta: ({
      pendingManualCheckCount,
      totalManualCheckCount,
    }) => `待檢查：${pendingManualCheckCount} / ${totalManualCheckCount}`,
    pendingOfTotal: ({ pendingManualCheckCount, totalManualCheckCount }) =>
      `${pendingManualCheckCount} 個待辦，共 ${totalManualCheckCount} 個`,
    noOperatorNotes: "尚未記錄 operator 備註。",
    currentHandoffSummary: "目前 handoff 摘要",
    operatorHandoffWorkflow: "Operator handoff 流程",
    workflowSteps: [
      "在 audit hub 中完成目前複查狀態，或匯入現有 signoff JSON snapshot。",
      "填寫 review-session 中繼資料，使匯出記錄 reviewer、session label 和 review time。",
      "使用 `Download signoff JSON` 取得本機檔案；如果目前環境無法下載檔案，則使用 `Copy signoff JSON`。",
      "將下載或貼上的檔案保存在本機路徑，例如 `tmp/operator-signoff-export.json`。",
      "執行下方 bundle 命令，將目前匯出與最新 preset evidence 參照和保留的 review-session 中繼資料打包。",
    ],
    feedback: {
      copiedHandoffSummary: "已將目前 handoff 摘要複製到剪貼簿。",
      clipboardUnavailable: "此稽核環境無法存取剪貼簿。",
      failedCopyHandoffSummary: "無法將目前 handoff 摘要複製到剪貼簿。",
      downloadedHandoffSummary: (filename) =>
        `已將目前 handoff 摘要下載為 ${filename}。`,
      failedDownloadHandoffSummary:
        "無法從此稽核環境下載目前 handoff 摘要。",
    },
  },
  ja: {
    label: "Handoff サマリー",
    detail:
      "現在の workspace の結論をエクスポートする前に、最終 operator signoff を妨げる残作業を確認します。",
    copyAction: "Handoff サマリーをコピー",
    downloadAction: "Handoff サマリーをダウンロード",
    readyForSignoff: "Signoff 可能",
    ready: "準備済み",
    notReady: "未準備",
    followUpSurfaces: "Follow-up surface",
    notReviewed: "未レビュー",
    pendingChecks: "未完了チェック",
    readyStatusLabel: "最終 signoff 可能",
    readyStatusDetail:
      "すべての audit surface がレビュー済みで、follow-up 状態はなく、すべての手動チェックが完了しています。",
    outstandingStatusLabel: "未解決のレビュー作業",
    outstandingStatusDetail: ({
      reviewSurfaceCount,
      pendingManualCheckCount,
    }) =>
      `${reviewSurfaceCount} 件の surface にレビュー対応が必要で、${pendingManualCheckCount} 件の手動チェックが未完了です。`,
    followUpRequired: "Follow-up が必要",
    notReviewedGroup: "未レビュー",
    pendingManualChecks: "未完了の手動チェック",
    none: "なし",
    pendingChecksMeta: ({
      pendingManualCheckCount,
      totalManualCheckCount,
    }) => `未完了チェック: ${pendingManualCheckCount} / ${totalManualCheckCount}`,
    pendingOfTotal: ({ pendingManualCheckCount, totalManualCheckCount }) =>
      `${totalManualCheckCount} 件中 ${pendingManualCheckCount} 件が未完了`,
    noOperatorNotes: "Operator メモはまだ記録されていません。",
    currentHandoffSummary: "現在の handoff サマリー",
    operatorHandoffWorkflow: "Operator handoff ワークフロー",
    workflowSteps: [
      "Audit hub で現在のレビュー状態を完了するか、既存の signoff JSON snapshot をインポートします。",
      "Review-session メタデータを入力し、export に reviewer、session label、review time を記録します。",
      "直接ローカルファイルを作るには `Download signoff JSON` を使い、現在の環境でダウンロードできない場合は `Copy signoff JSON` を使います。",
      "ダウンロードまたは貼り付けたファイルを `tmp/operator-signoff-export.json` などのローカルパスに置きます。",
      "下の bundle command を実行し、現在の export を最新 preset evidence 参照と保持された review-session メタデータでパッケージ化します。",
    ],
    feedback: {
      copiedHandoffSummary:
        "現在の handoff サマリーをクリップボードにコピーしました。",
      clipboardUnavailable:
        "この監査環境ではクリップボードにアクセスできません。",
      failedCopyHandoffSummary:
        "現在の handoff サマリーをクリップボードにコピーできませんでした。",
      downloadedHandoffSummary: (filename) =>
        `現在の handoff サマリーを ${filename} としてダウンロードしました。`,
      failedDownloadHandoffSummary:
        "この監査環境から現在の handoff サマリーをダウンロードできませんでした。",
    },
  },
  ko: {
    label: "Handoff summary",
    detail:
      "현재 workspace 결론을 내보내기 전에 최종 operator signoff 를 막는 항목을 확인합니다.",
    copyAction: "Handoff summary 복사",
    downloadAction: "Handoff summary 다운로드",
    readyForSignoff: "Signoff 준비됨",
    ready: "준비됨",
    notReady: "준비 안 됨",
    followUpSurfaces: "Follow-up surface",
    notReviewed: "미검토",
    pendingChecks: "보류 체크",
    readyStatusLabel: "최종 signoff 준비됨",
    readyStatusDetail:
      "모든 audit surface 가 검토되었고 follow-up 상태가 없으며 모든 수동 체크가 완료되었습니다.",
    outstandingStatusLabel: "남은 검토 작업",
    outstandingStatusDetail: ({
      reviewSurfaceCount,
      pendingManualCheckCount,
    }) =>
      `${reviewSurfaceCount}개 surface 에 검토가 더 필요하고 ${pendingManualCheckCount}개 수동 체크가 미완료입니다.`,
    followUpRequired: "Follow-up 필요",
    notReviewedGroup: "미검토",
    pendingManualChecks: "보류 수동 체크",
    none: "없음",
    pendingChecksMeta: ({
      pendingManualCheckCount,
      totalManualCheckCount,
    }) => `보류 체크: ${pendingManualCheckCount} / ${totalManualCheckCount}`,
    pendingOfTotal: ({ pendingManualCheckCount, totalManualCheckCount }) =>
      `${totalManualCheckCount}개 중 ${pendingManualCheckCount}개 보류`,
    noOperatorNotes: "Operator notes 가 아직 기록되지 않았습니다.",
    currentHandoffSummary: "현재 handoff summary",
    operatorHandoffWorkflow: "Operator handoff workflow",
    workflowSteps: [
      "Audit hub 에서 현재 review state 를 완료하거나 기존 signoff JSON snapshot 을 가져옵니다.",
      "Export 가 reviewer, session label, review time 을 기록하도록 review-session metadata 를 채웁니다.",
      "직접 local file 이 필요하면 `Download signoff JSON` 을 사용하고, 현재 환경에서 파일을 다운로드할 수 없으면 `Copy signoff JSON` 을 사용합니다.",
      "다운로드하거나 붙여넣은 파일을 `tmp/operator-signoff-export.json` 같은 local path 에 둡니다.",
      "아래 bundle command 로 현재 export 를 최신 preset evidence references 및 보존된 review-session metadata 와 함께 패키징합니다.",
    ],
    feedback: {
      copiedHandoffSummary: "현재 handoff summary 를 clipboard 에 복사했습니다.",
      clipboardUnavailable:
        "이 audit 환경에서는 clipboard 접근을 사용할 수 없습니다.",
      failedCopyHandoffSummary:
        "현재 handoff summary 를 clipboard 에 복사하지 못했습니다.",
      downloadedHandoffSummary: (filename) =>
        `현재 handoff summary 를 ${filename}(으)로 다운로드했습니다.`,
      failedDownloadHandoffSummary:
        "이 audit 환경에서 현재 handoff summary 를 다운로드하지 못했습니다.",
    },
  },
  "es-419": {
    label: "Resumen de handoff",
    detail:
      "Usa este resumen para ver qué bloquea el signoff final del operador antes de exportar las conclusiones actuales del workspace.",
    copyAction: "Copiar resumen de handoff",
    downloadAction: "Descargar resumen de handoff",
    readyForSignoff: "Listo para signoff",
    ready: "Listo",
    notReady: "No listo",
    followUpSurfaces: "Superficies con follow-up",
    notReviewed: "No revisado",
    pendingChecks: "Checks pendientes",
    readyStatusLabel: "Listo para signoff final",
    readyStatusDetail:
      "Todas las superficies de auditoría están revisadas, no queda estado follow-up y cada check manual está completo.",
    outstandingStatusLabel: "Trabajo de revisión pendiente",
    outstandingStatusDetail: ({
      reviewSurfaceCount,
      pendingManualCheckCount,
    }) =>
      `${reviewSurfaceCount} superficies aún necesitan atención de revisión y ${pendingManualCheckCount} checks manuales siguen incompletos.`,
    followUpRequired: "Follow-up requerido",
    notReviewedGroup: "No revisado",
    pendingManualChecks: "Checks manuales pendientes",
    none: "Ninguno",
    pendingChecksMeta: ({
      pendingManualCheckCount,
      totalManualCheckCount,
    }) => `Checks pendientes: ${pendingManualCheckCount} / ${totalManualCheckCount}`,
    pendingOfTotal: ({ pendingManualCheckCount, totalManualCheckCount }) =>
      `${pendingManualCheckCount} pendientes de ${totalManualCheckCount}`,
    noOperatorNotes: "Aún no hay notas del operador.",
    currentHandoffSummary: "Resumen de handoff actual",
    operatorHandoffWorkflow: "Workflow de handoff del operador",
    workflowSteps: [
      "Termina el estado de revisión actual en el audit hub o importa un snapshot signoff JSON existente.",
      "Completa los metadatos de review-session para que el export registre reviewer, session label y review time.",
      "Usa `Download signoff JSON` para un archivo local directo, o `Copy signoff JSON` si el entorno actual no puede descargar archivos.",
      "Mantén el archivo descargado o pegado en una ruta local como `tmp/operator-signoff-export.json`.",
      "Ejecuta el bundle command de abajo para empaquetar el export actual con las referencias preset evidence más recientes y los metadatos review-session preservados.",
    ],
    feedback: {
      copiedHandoffSummary:
        "Se copió el resumen de handoff actual al portapapeles.",
      clipboardUnavailable:
        "El acceso al portapapeles no está disponible en este entorno de auditoría.",
      failedCopyHandoffSummary:
        "No se pudo copiar el resumen de handoff actual al portapapeles.",
      downloadedHandoffSummary: (filename) =>
        `Se descargó el resumen de handoff actual como ${filename}.`,
      failedDownloadHandoffSummary:
        "No se pudo descargar el resumen de handoff actual desde este entorno de auditoría.",
    },
  },
  "pt-BR": {
    label: "Resumo de handoff",
    detail:
      "Use este resumo para ver o que ainda bloqueia o signoff final do operador antes de exportar as conclusões atuais do workspace.",
    copyAction: "Copiar resumo de handoff",
    downloadAction: "Baixar resumo de handoff",
    readyForSignoff: "Pronto para signoff",
    ready: "Pronto",
    notReady: "Não pronto",
    followUpSurfaces: "Superfícies com follow-up",
    notReviewed: "Não revisado",
    pendingChecks: "Checks pendentes",
    readyStatusLabel: "Pronto para signoff final",
    readyStatusDetail:
      "Todas as superfícies de auditoria foram revisadas, não resta estado follow-up e todos os checks manuais estão completos.",
    outstandingStatusLabel: "Trabalho de revisão pendente",
    outstandingStatusDetail: ({
      reviewSurfaceCount,
      pendingManualCheckCount,
    }) =>
      `${reviewSurfaceCount} superfícies ainda precisam de atenção de revisão e ${pendingManualCheckCount} checks manuais seguem incompletos.`,
    followUpRequired: "Follow-up necessário",
    notReviewedGroup: "Não revisado",
    pendingManualChecks: "Checks manuais pendentes",
    none: "Nenhum",
    pendingChecksMeta: ({
      pendingManualCheckCount,
      totalManualCheckCount,
    }) => `Checks pendentes: ${pendingManualCheckCount} / ${totalManualCheckCount}`,
    pendingOfTotal: ({ pendingManualCheckCount, totalManualCheckCount }) =>
      `${pendingManualCheckCount} pendentes de ${totalManualCheckCount}`,
    noOperatorNotes: "Nenhuma nota do operador registrada ainda.",
    currentHandoffSummary: "Resumo de handoff atual",
    operatorHandoffWorkflow: "Workflow de handoff do operador",
    workflowSteps: [
      "Conclua o estado de revisão atual no audit hub ou importe um snapshot signoff JSON existente.",
      "Preencha os metadados de review-session para que o export registre reviewer, session label e review time.",
      "Use `Download signoff JSON` para um arquivo local direto, ou `Copy signoff JSON` se o ambiente atual não puder baixar arquivos.",
      "Mantenha o arquivo baixado ou colado em um caminho local como `tmp/operator-signoff-export.json`.",
      "Execute o bundle command abaixo para empacotar o export atual com as referências preset evidence mais recentes e os metadados review-session preservados.",
    ],
    feedback: {
      copiedHandoffSummary:
        "Resumo de handoff atual copiado para a área de transferência.",
      clipboardUnavailable:
        "Acesso à área de transferência indisponível neste ambiente de auditoria.",
      failedCopyHandoffSummary:
        "Falha ao copiar o resumo de handoff atual para a área de transferência.",
      downloadedHandoffSummary: (filename) =>
        `Resumo de handoff atual baixado como ${filename}.`,
      failedDownloadHandoffSummary:
        "Falha ao baixar o resumo de handoff atual deste ambiente de auditoria.",
    },
  },
  fr: {
    label: "Résumé de handoff",
    detail:
      "Utilisez ce résumé pour voir ce qui bloque encore le signoff operator final avant d'exporter les conclusions actuelles du workspace.",
    copyAction: "Copier le résumé de handoff",
    downloadAction: "Télécharger le résumé de handoff",
    readyForSignoff: "Prêt pour signoff",
    ready: "Prêt",
    notReady: "Non prêt",
    followUpSurfaces: "Surfaces avec follow-up",
    notReviewed: "Non revu",
    pendingChecks: "Checks en attente",
    readyStatusLabel: "Prêt pour le signoff final",
    readyStatusDetail:
      "Toutes les surfaces d'audit sont revues, aucun état follow-up ne reste et chaque check manuel est terminé.",
    outstandingStatusLabel: "Travail de revue restant",
    outstandingStatusDetail: ({
      reviewSurfaceCount,
      pendingManualCheckCount,
    }) =>
      `${reviewSurfaceCount} surfaces nécessitent encore une revue et ${pendingManualCheckCount} checks manuels restent incomplets.`,
    followUpRequired: "Follow-up requis",
    notReviewedGroup: "Non revu",
    pendingManualChecks: "Checks manuels en attente",
    none: "Aucun",
    pendingChecksMeta: ({
      pendingManualCheckCount,
      totalManualCheckCount,
    }) => `Checks en attente: ${pendingManualCheckCount} / ${totalManualCheckCount}`,
    pendingOfTotal: ({ pendingManualCheckCount, totalManualCheckCount }) =>
      `${pendingManualCheckCount} en attente sur ${totalManualCheckCount}`,
    noOperatorNotes: "Aucune note operator enregistrée pour l'instant.",
    currentHandoffSummary: "Résumé de handoff actuel",
    operatorHandoffWorkflow: "Workflow de handoff operator",
    workflowSteps: [
      "Terminez l'état de revue actuel dans l'audit hub ou importez un snapshot signoff JSON existant.",
      "Renseignez les métadonnées review-session afin que l'export enregistre reviewer, session label et review time.",
      "Utilisez `Download signoff JSON` pour un fichier local direct, ou `Copy signoff JSON` si l'environnement actuel ne peut pas télécharger de fichiers.",
      "Conservez le fichier téléchargé ou collé sous un chemin local comme `tmp/operator-signoff-export.json`.",
      "Exécutez le bundle command ci-dessous pour empaqueter l'export actuel avec les dernières références preset evidence et les métadonnées review-session préservées.",
    ],
    feedback: {
      copiedHandoffSummary:
        "Résumé de handoff actuel copié dans le presse-papiers.",
      clipboardUnavailable:
        "L'accès au presse-papiers est indisponible dans cet environnement d'audit.",
      failedCopyHandoffSummary:
        "Impossible de copier le résumé de handoff actuel dans le presse-papiers.",
      downloadedHandoffSummary: (filename) =>
        `Résumé de handoff actuel téléchargé sous ${filename}.`,
      failedDownloadHandoffSummary:
        "Impossible de télécharger le résumé de handoff actuel depuis cet environnement d'audit.",
    },
  },
  de: {
    label: "Handoff-Zusammenfassung",
    detail:
      "Diese Zusammenfassung zeigt, was den finalen Operator-Signoff vor dem Export der aktuellen Workspace-Ergebnisse noch blockiert.",
    copyAction: "Handoff-Zusammenfassung kopieren",
    downloadAction: "Handoff-Zusammenfassung herunterladen",
    readyForSignoff: "Bereit für Signoff",
    ready: "Bereit",
    notReady: "Nicht bereit",
    followUpSurfaces: "Follow-up-Surfaces",
    notReviewed: "Nicht geprüft",
    pendingChecks: "Offene Checks",
    readyStatusLabel: "Bereit für finalen Signoff",
    readyStatusDetail:
      "Alle Audit-Surfaces sind geprüft, kein Follow-up-Status bleibt offen, und jeder manuelle Check ist abgeschlossen.",
    outstandingStatusLabel: "Offene Review-Arbeit",
    outstandingStatusDetail: ({
      reviewSurfaceCount,
      pendingManualCheckCount,
    }) =>
      `${reviewSurfaceCount} Surfaces benötigen noch Review-Aufmerksamkeit, und ${pendingManualCheckCount} manuelle Checks sind unvollständig.`,
    followUpRequired: "Follow-up erforderlich",
    notReviewedGroup: "Nicht geprüft",
    pendingManualChecks: "Offene manuelle Checks",
    none: "Keine",
    pendingChecksMeta: ({
      pendingManualCheckCount,
      totalManualCheckCount,
    }) => `Offene Checks: ${pendingManualCheckCount} / ${totalManualCheckCount}`,
    pendingOfTotal: ({ pendingManualCheckCount, totalManualCheckCount }) =>
      `${pendingManualCheckCount} offen von ${totalManualCheckCount}`,
    noOperatorNotes: "Noch keine Operator-Notizen erfasst.",
    currentHandoffSummary: "Aktuelle Handoff-Zusammenfassung",
    operatorHandoffWorkflow: "Operator-Handoff-Workflow",
    workflowSteps: [
      "Schließe den aktuellen Review-Status im Audit Hub ab oder importiere einen vorhandenen Signoff-JSON-Snapshot.",
      "Fülle die Review-Session-Metadaten aus, damit der Export Reviewer, Session Label und Review Time erfasst.",
      "Nutze `Download signoff JSON` für eine direkte lokale Datei oder `Copy signoff JSON`, wenn die aktuelle Umgebung keine Dateien herunterladen kann.",
      "Lege die heruntergeladene oder eingefügte Datei unter einem lokalen Pfad wie `tmp/operator-signoff-export.json` ab.",
      "Führe den bundle command unten aus, um den aktuellen Export mit den neuesten preset evidence references und den erhaltenen Review-Session-Metadaten zu paketieren.",
    ],
    feedback: {
      copiedHandoffSummary:
        "Aktuelle Handoff-Zusammenfassung in die Zwischenablage kopiert.",
      clipboardUnavailable:
        "Zwischenablagezugriff ist in dieser Audit-Umgebung nicht verfügbar.",
      failedCopyHandoffSummary:
        "Aktuelle Handoff-Zusammenfassung konnte nicht in die Zwischenablage kopiert werden.",
      downloadedHandoffSummary: (filename) =>
        `Aktuelle Handoff-Zusammenfassung als ${filename} heruntergeladen.`,
      failedDownloadHandoffSummary:
        "Aktuelle Handoff-Zusammenfassung konnte aus dieser Audit-Umgebung nicht heruntergeladen werden.",
    },
  },
  it: {
    label: "Riepilogo handoff",
    detail:
      "Usa questo riepilogo per vedere cosa blocca ancora il signoff operator finale prima di esportare le conclusioni attuali del workspace.",
    copyAction: "Copia riepilogo handoff",
    downloadAction: "Scarica riepilogo handoff",
    readyForSignoff: "Pronto per signoff",
    ready: "Pronto",
    notReady: "Non pronto",
    followUpSurfaces: "Surface con follow-up",
    notReviewed: "Non revisionato",
    pendingChecks: "Check pendenti",
    readyStatusLabel: "Pronto per signoff finale",
    readyStatusDetail:
      "Tutte le surface di audit sono revisionate, non resta alcuno stato follow-up e ogni check manuale è completo.",
    outstandingStatusLabel: "Lavoro di review restante",
    outstandingStatusDetail: ({
      reviewSurfaceCount,
      pendingManualCheckCount,
    }) =>
      `${reviewSurfaceCount} surface richiedono ancora attenzione di review e ${pendingManualCheckCount} check manuali restano incompleti.`,
    followUpRequired: "Follow-up richiesto",
    notReviewedGroup: "Non revisionato",
    pendingManualChecks: "Check manuali pendenti",
    none: "Nessuno",
    pendingChecksMeta: ({
      pendingManualCheckCount,
      totalManualCheckCount,
    }) => `Check pendenti: ${pendingManualCheckCount} / ${totalManualCheckCount}`,
    pendingOfTotal: ({ pendingManualCheckCount, totalManualCheckCount }) =>
      `${pendingManualCheckCount} pendenti su ${totalManualCheckCount}`,
    noOperatorNotes: "Nessuna nota operator ancora registrata.",
    currentHandoffSummary: "Riepilogo handoff attuale",
    operatorHandoffWorkflow: "Workflow handoff operator",
    workflowSteps: [
      "Completa lo stato di review corrente nell'audit hub o importa uno snapshot signoff JSON esistente.",
      "Compila i metadati review-session così l'export registra reviewer, session label e review time.",
      "Usa `Download signoff JSON` per un file locale diretto, oppure `Copy signoff JSON` se l'ambiente corrente non può scaricare file.",
      "Mantieni il file scaricato o incollato in un percorso locale come `tmp/operator-signoff-export.json`.",
      "Esegui il bundle command sotto per impacchettare l'export corrente con i riferimenti preset evidence più recenti e i metadati review-session preservati.",
    ],
    feedback: {
      copiedHandoffSummary:
        "Riepilogo handoff attuale copiato negli appunti.",
      clipboardUnavailable:
        "Accesso agli appunti non disponibile in questo ambiente di audit.",
      failedCopyHandoffSummary:
        "Impossibile copiare il riepilogo handoff attuale negli appunti.",
      downloadedHandoffSummary: (filename) =>
        `Riepilogo handoff attuale scaricato come ${filename}.`,
      failedDownloadHandoffSummary:
        "Impossibile scaricare il riepilogo handoff attuale da questo ambiente di audit.",
    },
  },
  ru: {
    label: "Сводка handoff",
    detail:
      "Эта сводка показывает, что еще блокирует финальный operator signoff перед экспортом текущих выводов workspace.",
    copyAction: "Копировать сводку handoff",
    downloadAction: "Скачать сводку handoff",
    readyForSignoff: "Готово к signoff",
    ready: "Готово",
    notReady: "Не готово",
    followUpSurfaces: "Surfaces с follow-up",
    notReviewed: "Не проверено",
    pendingChecks: "Незавершенные checks",
    readyStatusLabel: "Готово к финальному signoff",
    readyStatusDetail:
      "Все audit surfaces проверены, follow-up не остается, и каждый manual check завершен.",
    outstandingStatusLabel: "Оставшаяся review-работа",
    outstandingStatusDetail: ({
      reviewSurfaceCount,
      pendingManualCheckCount,
    }) =>
      `${reviewSurfaceCount} surfaces еще требуют review-внимания, и ${pendingManualCheckCount} manual checks остаются незавершенными.`,
    followUpRequired: "Требуется follow-up",
    notReviewedGroup: "Не проверено",
    pendingManualChecks: "Незавершенные manual checks",
    none: "Нет",
    pendingChecksMeta: ({
      pendingManualCheckCount,
      totalManualCheckCount,
    }) => `Незавершенные checks: ${pendingManualCheckCount} / ${totalManualCheckCount}`,
    pendingOfTotal: ({ pendingManualCheckCount, totalManualCheckCount }) =>
      `${pendingManualCheckCount} pending из ${totalManualCheckCount}`,
    noOperatorNotes: "Operator notes пока не записаны.",
    currentHandoffSummary: "Текущая сводка handoff",
    operatorHandoffWorkflow: "Operator handoff workflow",
    workflowSteps: [
      "Завершите текущий review state в audit hub или импортируйте существующий signoff JSON snapshot.",
      "Заполните review-session metadata, чтобы export записал reviewer, session label и review time.",
      "Используйте `Download signoff JSON` для прямого local file или `Copy signoff JSON`, если текущая среда не может скачивать файлы.",
      "Держите скачанный или вставленный файл в local path, например `tmp/operator-signoff-export.json`.",
      "Запустите bundle command ниже, чтобы упаковать текущий export с последними preset evidence references и сохраненными review-session metadata.",
    ],
    feedback: {
      copiedHandoffSummary: "Текущая сводка handoff скопирована в clipboard.",
      clipboardUnavailable:
        "Доступ к clipboard недоступен в этой audit-среде.",
      failedCopyHandoffSummary:
        "Не удалось скопировать текущую сводку handoff в clipboard.",
      downloadedHandoffSummary: (filename) =>
        `Текущая сводка handoff скачана как ${filename}.`,
      failedDownloadHandoffSummary:
        "Не удалось скачать текущую сводку handoff из этой audit-среды.",
    },
  },
  ar: {
    label: "ملخص handoff",
    detail:
      "استخدم هذا الملخص لمعرفة ما الذي ما زال يمنع operator signoff النهائي قبل تصدير استنتاجات workspace الحالية.",
    copyAction: "نسخ ملخص handoff",
    downloadAction: "تنزيل ملخص handoff",
    readyForSignoff: "جاهز لـ signoff",
    ready: "جاهز",
    notReady: "غير جاهز",
    followUpSurfaces: "Surfaces لديها follow-up",
    notReviewed: "غير مراجع",
    pendingChecks: "Checks معلقة",
    readyStatusLabel: "جاهز لـ signoff النهائي",
    readyStatusDetail:
      "تمت مراجعة كل audit surfaces، ولا تبقى حالة follow-up، وكل manual check مكتمل.",
    outstandingStatusLabel: "عمل مراجعة متبق",
    outstandingStatusDetail: ({
      reviewSurfaceCount,
      pendingManualCheckCount,
    }) =>
      `${reviewSurfaceCount} surfaces ما زالت تحتاج مراجعة، و ${pendingManualCheckCount} manual checks ما زالت غير مكتملة.`,
    followUpRequired: "يتطلب follow-up",
    notReviewedGroup: "غير مراجع",
    pendingManualChecks: "Manual checks معلقة",
    none: "لا يوجد",
    pendingChecksMeta: ({
      pendingManualCheckCount,
      totalManualCheckCount,
    }) => `Checks معلقة: ${pendingManualCheckCount} / ${totalManualCheckCount}`,
    pendingOfTotal: ({ pendingManualCheckCount, totalManualCheckCount }) =>
      `${pendingManualCheckCount} معلقة من ${totalManualCheckCount}`,
    noOperatorNotes: "لم يتم تسجيل ملاحظات operator بعد.",
    currentHandoffSummary: "ملخص handoff الحالي",
    operatorHandoffWorkflow: "سير عمل operator handoff",
    workflowSteps: [
      "أكمل review state الحالية في audit hub أو استورد signoff JSON snapshot موجودا.",
      "املأ review-session metadata حتى يسجل export كل من reviewer و session label و review time.",
      "استخدم `Download signoff JSON` للحصول على ملف محلي مباشر، أو `Copy signoff JSON` إذا كانت البيئة الحالية لا تستطيع تنزيل الملفات.",
      "احتفظ بالملف المنزل أو الملصق في local path مثل `tmp/operator-signoff-export.json`.",
      "شغل bundle command أدناه لتغليف export الحالي مع أحدث preset evidence references و review-session metadata المحفوظة.",
    ],
    feedback: {
      copiedHandoffSummary: "تم نسخ ملخص handoff الحالي إلى clipboard.",
      clipboardUnavailable:
        "الوصول إلى clipboard غير متاح في بيئة التدقيق هذه.",
      failedCopyHandoffSummary:
        "تعذر نسخ ملخص handoff الحالي إلى clipboard.",
      downloadedHandoffSummary: (filename) =>
        `تم تنزيل ملخص handoff الحالي باسم ${filename}.`,
      failedDownloadHandoffSummary:
        "تعذر تنزيل ملخص handoff الحالي من بيئة التدقيق هذه.",
    },
  },
  hi: {
    label: "Handoff summary",
    detail:
      "Current workspace conclusions export करने से पहले final operator signoff को block करने वाली चीजें देखें।",
    copyAction: "Handoff summary copy करें",
    downloadAction: "Handoff summary download करें",
    readyForSignoff: "Signoff के लिए ready",
    ready: "Ready",
    notReady: "Not ready",
    followUpSurfaces: "Follow-up surfaces",
    notReviewed: "Not reviewed",
    pendingChecks: "Pending checks",
    readyStatusLabel: "Final signoff के लिए ready",
    readyStatusDetail:
      "सभी audit surfaces reviewed हैं, कोई follow-up state बाकी नहीं है, और हर manual check complete है।",
    outstandingStatusLabel: "Outstanding review work",
    outstandingStatusDetail: ({
      reviewSurfaceCount,
      pendingManualCheckCount,
    }) =>
      `${reviewSurfaceCount} surfaces को अभी review attention चाहिए, और ${pendingManualCheckCount} manual checks incomplete हैं।`,
    followUpRequired: "Follow-up required",
    notReviewedGroup: "Not reviewed",
    pendingManualChecks: "Pending manual checks",
    none: "None",
    pendingChecksMeta: ({
      pendingManualCheckCount,
      totalManualCheckCount,
    }) => `Pending checks: ${pendingManualCheckCount} / ${totalManualCheckCount}`,
    pendingOfTotal: ({ pendingManualCheckCount, totalManualCheckCount }) =>
      `${totalManualCheckCount} में से ${pendingManualCheckCount} pending`,
    noOperatorNotes: "अभी कोई operator notes record नहीं हैं।",
    currentHandoffSummary: "Current handoff summary",
    operatorHandoffWorkflow: "Operator handoff workflow",
    workflowSteps: [
      "Audit hub में current review state finish करें या existing signoff JSON snapshot import करें।",
      "Review-session metadata भरें ताकि export reviewer, session label, और review time record करे।",
      "Direct local file के लिए `Download signoff JSON` इस्तेमाल करें, या current environment files download नहीं कर सकता तो `Copy signoff JSON` इस्तेमाल करें।",
      "Downloaded या pasted file को `tmp/operator-signoff-export.json` जैसे local path में रखें।",
      "Current export को latest preset evidence references और preserved review-session metadata के साथ package करने के लिए नीचे bundle command चलाएं।",
    ],
    feedback: {
      copiedHandoffSummary: "Current handoff summary clipboard में copied.",
      clipboardUnavailable:
        "इस audit environment में clipboard access unavailable है।",
      failedCopyHandoffSummary:
        "Current handoff summary clipboard में copy नहीं हुआ।",
      downloadedHandoffSummary: (filename) =>
        `Current handoff summary ${filename} के रूप में downloaded.`,
      failedDownloadHandoffSummary:
        "इस audit environment से current handoff summary download नहीं हुआ।",
    },
  },
  id: {
    label: "Ringkasan handoff",
    detail:
      "Gunakan ringkasan ini untuk melihat apa yang masih memblokir signoff operator final sebelum mengekspor kesimpulan workspace saat ini.",
    copyAction: "Salin ringkasan handoff",
    downloadAction: "Unduh ringkasan handoff",
    readyForSignoff: "Siap untuk signoff",
    ready: "Siap",
    notReady: "Belum siap",
    followUpSurfaces: "Surface follow-up",
    notReviewed: "Belum direview",
    pendingChecks: "Check tertunda",
    readyStatusLabel: "Siap untuk signoff final",
    readyStatusDetail:
      "Semua surface audit sudah direview, tidak ada status follow-up tersisa, dan setiap check manual selesai.",
    outstandingStatusLabel: "Pekerjaan review tersisa",
    outstandingStatusDetail: ({
      reviewSurfaceCount,
      pendingManualCheckCount,
    }) =>
      `${reviewSurfaceCount} surface masih butuh perhatian review, dan ${pendingManualCheckCount} check manual masih belum selesai.`,
    followUpRequired: "Follow-up diperlukan",
    notReviewedGroup: "Belum direview",
    pendingManualChecks: "Check manual tertunda",
    none: "Tidak ada",
    pendingChecksMeta: ({
      pendingManualCheckCount,
      totalManualCheckCount,
    }) => `Check tertunda: ${pendingManualCheckCount} / ${totalManualCheckCount}`,
    pendingOfTotal: ({ pendingManualCheckCount, totalManualCheckCount }) =>
      `${pendingManualCheckCount} tertunda dari ${totalManualCheckCount}`,
    noOperatorNotes: "Belum ada catatan operator yang direkam.",
    currentHandoffSummary: "Ringkasan handoff saat ini",
    operatorHandoffWorkflow: "Workflow handoff operator",
    workflowSteps: [
      "Selesaikan status review saat ini di audit hub atau impor snapshot signoff JSON yang sudah ada.",
      "Isi metadata review-session agar export merekam reviewer, session label, dan review time.",
      "Gunakan `Download signoff JSON` untuk file lokal langsung, atau `Copy signoff JSON` jika lingkungan saat ini tidak dapat mengunduh file.",
      "Simpan file yang diunduh atau ditempel di path lokal seperti `tmp/operator-signoff-export.json`.",
      "Jalankan bundle command di bawah untuk memaketkan export saat ini dengan referensi preset evidence terbaru dan metadata review-session yang dipertahankan.",
    ],
    feedback: {
      copiedHandoffSummary:
        "Ringkasan handoff saat ini disalin ke clipboard.",
      clipboardUnavailable:
        "Akses clipboard tidak tersedia di lingkungan audit ini.",
      failedCopyHandoffSummary:
        "Gagal menyalin ringkasan handoff saat ini ke clipboard.",
      downloadedHandoffSummary: (filename) =>
        `Ringkasan handoff saat ini diunduh sebagai ${filename}.`,
      failedDownloadHandoffSummary:
        "Gagal mengunduh ringkasan handoff saat ini dari lingkungan audit ini.",
    },
  },
};

const INTERACTION_AUDIT_FRAME_RESULTS_COPY: Record<
  ResolvedAppLocale,
  InteractionAuditFrameResultsCopy
> = {
  en: {
    rawDetailLabel: "Raw detail",
    readiness: {
      frame_not_ready: "Frame not ready yet.",
      ready: "Frame loaded and ready for audit presets.",
      waiting_dashboard_provider_actions:
        "Frame loaded. Waiting for dashboard provider actions.",
      waiting_settings_source_controls:
        "Frame loaded. Waiting for Settings source controls.",
      waiting_provider_detail_notes:
        "Frame loaded. Waiting for provider detail notes.",
      waiting_popup_actions: "Frame loaded. Waiting for popup actions.",
    },
    presets: {
      frame_not_ready: "Frame not ready yet.",
      focused_first_provider_action:
        "Focused the first provider action button.",
      missing_first_provider_action:
        "Could not find the first provider action.",
      opened_first_source_diagnostics:
        "Opened the first source diagnostics disclosure.",
      missing_source_diagnostics_disclosure:
        "Could not find a source diagnostics disclosure.",
      focused_source_preference:
        "Focused the first source-preference material select.",
      missing_source_preference_select:
        "Could not find a source-preference material select.",
      scrolled_first_detail_note:
        "Scrolled the detail frame to the first note block.",
      missing_detail_note: "Could not find a detail note block.",
      focused_popup_dashboard_action:
        "Focused the popup dashboard action.",
      missing_popup_dashboard_action:
        "Could not find the popup dashboard action.",
      focused_featured_provider_detail_action:
        "Focused the first featured-provider detail action.",
      missing_featured_provider_detail_action:
        "Could not find the featured-provider detail action.",
      unsupported_audit_preset: "Unsupported audit preset.",
    },
  },
  "zh-CN": {
    rawDetailLabel: "原始详情",
    readiness: {
      frame_not_ready: "Frame 尚未就绪。",
      ready: "Frame 已加载，可运行审计 preset。",
      waiting_dashboard_provider_actions:
        "Frame 已加载，正在等待 dashboard provider action。",
      waiting_settings_source_controls:
        "Frame 已加载，正在等待 Settings source 控件。",
      waiting_provider_detail_notes:
        "Frame 已加载，正在等待 provider detail note。",
      waiting_popup_actions: "Frame 已加载，正在等待 popup action。",
    },
    presets: {
      frame_not_ready: "Frame 尚未就绪。",
      focused_first_provider_action: "已聚焦第一个 provider action 按钮。",
      missing_first_provider_action: "找不到第一个 provider action。",
      opened_first_source_diagnostics:
        "已打开第一个 source diagnostics disclosure。",
      missing_source_diagnostics_disclosure:
        "找不到 source diagnostics disclosure。",
      focused_source_preference:
        "已聚焦第一个 source-preference material select。",
      missing_source_preference_select:
        "找不到 source-preference material select。",
      scrolled_first_detail_note: "已滚动 detail frame 到第一个 note block。",
      missing_detail_note: "找不到 detail note block。",
      focused_popup_dashboard_action: "已聚焦 popup dashboard action。",
      missing_popup_dashboard_action: "找不到 popup dashboard action。",
      focused_featured_provider_detail_action:
        "已聚焦第一个 featured-provider detail action。",
      missing_featured_provider_detail_action:
        "找不到 featured-provider detail action。",
      unsupported_audit_preset: "不支持此 audit preset。",
    },
  },
  "zh-TW": {
    rawDetailLabel: "原始詳情",
    readiness: {
      frame_not_ready: "Frame 尚未就緒。",
      ready: "Frame 已載入，可執行稽核 preset。",
      waiting_dashboard_provider_actions:
        "Frame 已載入，正在等待 dashboard provider action。",
      waiting_settings_source_controls:
        "Frame 已載入，正在等待 Settings source 控制項。",
      waiting_provider_detail_notes:
        "Frame 已載入，正在等待 provider detail note。",
      waiting_popup_actions: "Frame 已載入，正在等待 popup action。",
    },
    presets: {
      frame_not_ready: "Frame 尚未就緒。",
      focused_first_provider_action: "已聚焦第一個 provider action 按鈕。",
      missing_first_provider_action: "找不到第一個 provider action。",
      opened_first_source_diagnostics:
        "已開啟第一個 source diagnostics disclosure。",
      missing_source_diagnostics_disclosure:
        "找不到 source diagnostics disclosure。",
      focused_source_preference:
        "已聚焦第一個 source-preference material select。",
      missing_source_preference_select:
        "找不到 source-preference material select。",
      scrolled_first_detail_note: "已將 detail frame 捲動到第一個 note block。",
      missing_detail_note: "找不到 detail note block。",
      focused_popup_dashboard_action: "已聚焦 popup dashboard action。",
      missing_popup_dashboard_action: "找不到 popup dashboard action。",
      focused_featured_provider_detail_action:
        "已聚焦第一個 featured-provider detail action。",
      missing_featured_provider_detail_action:
        "找不到 featured-provider detail action。",
      unsupported_audit_preset: "不支援此 audit preset。",
    },
  },
  ja: {
    rawDetailLabel: "生の詳細",
    readiness: {
      frame_not_ready: "Frame はまだ準備できていません。",
      ready: "Frame が読み込まれ、監査 preset を実行できます。",
      waiting_dashboard_provider_actions:
        "Frame は読み込み済みです。Dashboard の provider action を待機しています。",
      waiting_settings_source_controls:
        "Frame は読み込み済みです。Settings の source controls を待機しています。",
      waiting_provider_detail_notes:
        "Frame は読み込み済みです。Provider detail notes を待機しています。",
      waiting_popup_actions:
        "Frame は読み込み済みです。Popup actions を待機しています。",
    },
    presets: {
      frame_not_ready: "Frame はまだ準備できていません。",
      focused_first_provider_action:
        "最初の provider action ボタンにフォーカスしました。",
      missing_first_provider_action:
        "最初の provider action が見つかりませんでした。",
      opened_first_source_diagnostics:
        "最初の source diagnostics disclosure を開きました。",
      missing_source_diagnostics_disclosure:
        "Source diagnostics disclosure が見つかりませんでした。",
      focused_source_preference:
        "最初の source-preference material select にフォーカスしました。",
      missing_source_preference_select:
        "Source-preference material select が見つかりませんでした。",
      scrolled_first_detail_note:
        "Detail frame を最初の note block までスクロールしました。",
      missing_detail_note: "Detail note block が見つかりませんでした。",
      focused_popup_dashboard_action:
        "Popup dashboard action にフォーカスしました。",
      missing_popup_dashboard_action:
        "Popup dashboard action が見つかりませんでした。",
      focused_featured_provider_detail_action:
        "最初の featured-provider detail action にフォーカスしました。",
      missing_featured_provider_detail_action:
        "Featured-provider detail action が見つかりませんでした。",
      unsupported_audit_preset: "未対応の audit preset です。",
    },
  },
  ko: {
    rawDetailLabel: "Raw detail",
    readiness: {
      frame_not_ready: "Frame 이 아직 준비되지 않았습니다.",
      ready: "Frame 이 로드되어 audit preset 을 실행할 준비가 되었습니다.",
      waiting_dashboard_provider_actions:
        "Frame 이 로드되었습니다. Dashboard provider action 을 기다리는 중입니다.",
      waiting_settings_source_controls:
        "Frame 이 로드되었습니다. Settings source control 을 기다리는 중입니다.",
      waiting_provider_detail_notes:
        "Frame 이 로드되었습니다. Provider detail note 를 기다리는 중입니다.",
      waiting_popup_actions:
        "Frame 이 로드되었습니다. Popup action 을 기다리는 중입니다.",
    },
    presets: {
      frame_not_ready: "Frame 이 아직 준비되지 않았습니다.",
      focused_first_provider_action:
        "첫 번째 provider action 버튼에 focus 했습니다.",
      missing_first_provider_action:
        "첫 번째 provider action 을 찾을 수 없습니다.",
      opened_first_source_diagnostics:
        "첫 번째 source diagnostics disclosure 를 열었습니다.",
      missing_source_diagnostics_disclosure:
        "Source diagnostics disclosure 를 찾을 수 없습니다.",
      focused_source_preference:
        "첫 번째 source-preference material select 에 focus 했습니다.",
      missing_source_preference_select:
        "Source-preference material select 를 찾을 수 없습니다.",
      scrolled_first_detail_note:
        "Detail frame 을 첫 번째 note block 으로 스크롤했습니다.",
      missing_detail_note: "Detail note block 을 찾을 수 없습니다.",
      focused_popup_dashboard_action: "Popup dashboard action 에 focus 했습니다.",
      missing_popup_dashboard_action:
        "Popup dashboard action 을 찾을 수 없습니다.",
      focused_featured_provider_detail_action:
        "첫 번째 featured-provider detail action 에 focus 했습니다.",
      missing_featured_provider_detail_action:
        "Featured-provider detail action 을 찾을 수 없습니다.",
      unsupported_audit_preset: "지원되지 않는 audit preset 입니다.",
    },
  },
  "es-419": {
    rawDetailLabel: "Detalle raw",
    readiness: {
      frame_not_ready: "El frame aún no está listo.",
      ready: "El frame cargó y está listo para presets de auditoría.",
      waiting_dashboard_provider_actions:
        "El frame cargó. Esperando acciones de provider en dashboard.",
      waiting_settings_source_controls:
        "El frame cargó. Esperando controles de source en Settings.",
      waiting_provider_detail_notes:
        "El frame cargó. Esperando notas de detalle del provider.",
      waiting_popup_actions: "El frame cargó. Esperando acciones del popup.",
    },
    presets: {
      frame_not_ready: "El frame aún no está listo.",
      focused_first_provider_action:
        "Se enfocó el primer botón de acción del provider.",
      missing_first_provider_action:
        "No se encontró la primera acción del provider.",
      opened_first_source_diagnostics:
        "Se abrió el primer disclosure de diagnósticos de source.",
      missing_source_diagnostics_disclosure:
        "No se encontró un disclosure de diagnósticos de source.",
      focused_source_preference:
        "Se enfocó el primer material select de source-preference.",
      missing_source_preference_select:
        "No se encontró un material select de source-preference.",
      scrolled_first_detail_note:
        "Se desplazó el frame de detalle al primer bloque de notas.",
      missing_detail_note: "No se encontró un bloque de notas de detalle.",
      focused_popup_dashboard_action:
        "Se enfocó la acción de dashboard del popup.",
      missing_popup_dashboard_action:
        "No se encontró la acción de dashboard del popup.",
      focused_featured_provider_detail_action:
        "Se enfocó la primera acción de detalle del featured provider.",
      missing_featured_provider_detail_action:
        "No se encontró la acción de detalle del featured provider.",
      unsupported_audit_preset: "Preset de auditoría no compatible.",
    },
  },
  "pt-BR": {
    rawDetailLabel: "Detalhe raw",
    readiness: {
      frame_not_ready: "O frame ainda não está pronto.",
      ready: "O frame carregou e está pronto para presets de auditoria.",
      waiting_dashboard_provider_actions:
        "O frame carregou. Aguardando ações de provider no dashboard.",
      waiting_settings_source_controls:
        "O frame carregou. Aguardando controles de source em Settings.",
      waiting_provider_detail_notes:
        "O frame carregou. Aguardando notas de detalhe do provider.",
      waiting_popup_actions: "O frame carregou. Aguardando ações do popup.",
    },
    presets: {
      frame_not_ready: "O frame ainda não está pronto.",
      focused_first_provider_action:
        "Focou o primeiro botão de ação do provider.",
      missing_first_provider_action:
        "Não foi possível encontrar a primeira ação do provider.",
      opened_first_source_diagnostics:
        "Abriu o primeiro disclosure de diagnósticos de source.",
      missing_source_diagnostics_disclosure:
        "Não foi possível encontrar um disclosure de diagnósticos de source.",
      focused_source_preference:
        "Focou o primeiro material select de source-preference.",
      missing_source_preference_select:
        "Não foi possível encontrar um material select de source-preference.",
      scrolled_first_detail_note:
        "Rolou o frame de detalhe até o primeiro bloco de notas.",
      missing_detail_note:
        "Não foi possível encontrar um bloco de notas de detalhe.",
      focused_popup_dashboard_action:
        "Focou a ação de dashboard do popup.",
      missing_popup_dashboard_action:
        "Não foi possível encontrar a ação de dashboard do popup.",
      focused_featured_provider_detail_action:
        "Focou a primeira ação de detalhe do featured provider.",
      missing_featured_provider_detail_action:
        "Não foi possível encontrar a ação de detalhe do featured provider.",
      unsupported_audit_preset: "Preset de auditoria não compatível.",
    },
  },
  fr: {
    rawDetailLabel: "Détail raw",
    readiness: {
      frame_not_ready: "Le frame n'est pas encore prêt.",
      ready: "Le frame est chargé et prêt pour les presets d'audit.",
      waiting_dashboard_provider_actions:
        "Le frame est chargé. En attente des actions provider du dashboard.",
      waiting_settings_source_controls:
        "Le frame est chargé. En attente des contrôles source dans Settings.",
      waiting_provider_detail_notes:
        "Le frame est chargé. En attente des notes de détail provider.",
      waiting_popup_actions: "Le frame est chargé. En attente des actions popup.",
    },
    presets: {
      frame_not_ready: "Le frame n'est pas encore prêt.",
      focused_first_provider_action:
        "Le premier bouton d'action provider a reçu le focus.",
      missing_first_provider_action:
        "Impossible de trouver la première action provider.",
      opened_first_source_diagnostics:
        "Le premier disclosure de diagnostics source a été ouvert.",
      missing_source_diagnostics_disclosure:
        "Impossible de trouver un disclosure de diagnostics source.",
      focused_source_preference:
        "Le premier material select source-preference a reçu le focus.",
      missing_source_preference_select:
        "Impossible de trouver un material select source-preference.",
      scrolled_first_detail_note:
        "Le frame de détail a défilé jusqu'au premier bloc de notes.",
      missing_detail_note: "Impossible de trouver un bloc de notes de détail.",
      focused_popup_dashboard_action:
        "L'action dashboard du popup a reçu le focus.",
      missing_popup_dashboard_action:
        "Impossible de trouver l'action dashboard du popup.",
      focused_featured_provider_detail_action:
        "La première action de détail du featured provider a reçu le focus.",
      missing_featured_provider_detail_action:
        "Impossible de trouver l'action de détail du featured provider.",
      unsupported_audit_preset: "Preset d'audit non pris en charge.",
    },
  },
  de: {
    rawDetailLabel: "Raw-Detail",
    readiness: {
      frame_not_ready: "Der Frame ist noch nicht bereit.",
      ready: "Der Frame ist geladen und bereit für Audit-Presets.",
      waiting_dashboard_provider_actions:
        "Der Frame ist geladen. Warte auf Dashboard-Provider-Aktionen.",
      waiting_settings_source_controls:
        "Der Frame ist geladen. Warte auf Settings-Source-Controls.",
      waiting_provider_detail_notes:
        "Der Frame ist geladen. Warte auf Provider-Detail-Notizen.",
      waiting_popup_actions: "Der Frame ist geladen. Warte auf Popup-Aktionen.",
    },
    presets: {
      frame_not_ready: "Der Frame ist noch nicht bereit.",
      focused_first_provider_action:
        "Der erste Provider-Aktionsbutton wurde fokussiert.",
      missing_first_provider_action:
        "Die erste Provider-Aktion wurde nicht gefunden.",
      opened_first_source_diagnostics:
        "Die erste Source-Diagnostics-Disclosure wurde geöffnet.",
      missing_source_diagnostics_disclosure:
        "Keine Source-Diagnostics-Disclosure gefunden.",
      focused_source_preference:
        "Der erste Source-Preference-Material-Select wurde fokussiert.",
      missing_source_preference_select:
        "Kein Source-Preference-Material-Select gefunden.",
      scrolled_first_detail_note:
        "Der Detail-Frame wurde zum ersten Notizblock gescrollt.",
      missing_detail_note: "Kein Detail-Notizblock gefunden.",
      focused_popup_dashboard_action:
        "Die Popup-Dashboard-Aktion wurde fokussiert.",
      missing_popup_dashboard_action:
        "Die Popup-Dashboard-Aktion wurde nicht gefunden.",
      focused_featured_provider_detail_action:
        "Die erste Featured-Provider-Detailaktion wurde fokussiert.",
      missing_featured_provider_detail_action:
        "Die Featured-Provider-Detailaktion wurde nicht gefunden.",
      unsupported_audit_preset: "Nicht unterstütztes Audit-Preset.",
    },
  },
  it: {
    rawDetailLabel: "Dettaglio raw",
    readiness: {
      frame_not_ready: "Il frame non è ancora pronto.",
      ready: "Il frame è caricato e pronto per i preset di audit.",
      waiting_dashboard_provider_actions:
        "Il frame è caricato. In attesa delle azioni provider nella dashboard.",
      waiting_settings_source_controls:
        "Il frame è caricato. In attesa dei controlli source in Settings.",
      waiting_provider_detail_notes:
        "Il frame è caricato. In attesa delle note di dettaglio provider.",
      waiting_popup_actions: "Il frame è caricato. In attesa delle azioni popup.",
    },
    presets: {
      frame_not_ready: "Il frame non è ancora pronto.",
      focused_first_provider_action:
        "Il primo pulsante azione provider ha ricevuto il focus.",
      missing_first_provider_action:
        "Impossibile trovare la prima azione provider.",
      opened_first_source_diagnostics:
        "Aperto il primo disclosure dei diagnostics source.",
      missing_source_diagnostics_disclosure:
        "Impossibile trovare un disclosure dei diagnostics source.",
      focused_source_preference:
        "Il primo material select source-preference ha ricevuto il focus.",
      missing_source_preference_select:
        "Impossibile trovare un material select source-preference.",
      scrolled_first_detail_note:
        "Il frame di dettaglio è stato scrollato al primo blocco note.",
      missing_detail_note: "Impossibile trovare un blocco note di dettaglio.",
      focused_popup_dashboard_action:
        "L'azione dashboard del popup ha ricevuto il focus.",
      missing_popup_dashboard_action:
        "Impossibile trovare l'azione dashboard del popup.",
      focused_featured_provider_detail_action:
        "La prima azione di dettaglio del featured provider ha ricevuto il focus.",
      missing_featured_provider_detail_action:
        "Impossibile trovare l'azione di dettaglio del featured provider.",
      unsupported_audit_preset: "Preset di audit non supportato.",
    },
  },
  ru: {
    rawDetailLabel: "Raw detail",
    readiness: {
      frame_not_ready: "Frame еще не готов.",
      ready: "Frame загружен и готов к audit presets.",
      waiting_dashboard_provider_actions:
        "Frame загружен. Ожидание dashboard provider actions.",
      waiting_settings_source_controls:
        "Frame загружен. Ожидание Settings source controls.",
      waiting_provider_detail_notes:
        "Frame загружен. Ожидание provider detail notes.",
      waiting_popup_actions: "Frame загружен. Ожидание popup actions.",
    },
    presets: {
      frame_not_ready: "Frame еще не готов.",
      focused_first_provider_action:
        "Фокус установлен на первую кнопку provider action.",
      missing_first_provider_action:
        "Не удалось найти первую provider action.",
      opened_first_source_diagnostics:
        "Открыт первый disclosure source diagnostics.",
      missing_source_diagnostics_disclosure:
        "Не удалось найти disclosure source diagnostics.",
      focused_source_preference:
        "Фокус установлен на первый source-preference material select.",
      missing_source_preference_select:
        "Не удалось найти source-preference material select.",
      scrolled_first_detail_note:
        "Detail frame прокручен к первому note block.",
      missing_detail_note: "Не удалось найти detail note block.",
      focused_popup_dashboard_action:
        "Фокус установлен на popup dashboard action.",
      missing_popup_dashboard_action:
        "Не удалось найти popup dashboard action.",
      focused_featured_provider_detail_action:
        "Фокус установлен на первую featured-provider detail action.",
      missing_featured_provider_detail_action:
        "Не удалось найти featured-provider detail action.",
      unsupported_audit_preset: "Неподдерживаемый audit preset.",
    },
  },
  ar: {
    rawDetailLabel: "تفاصيل raw",
    readiness: {
      frame_not_ready: "Frame غير جاهز بعد.",
      ready: "تم تحميل frame وهو جاهز لتشغيل audit presets.",
      waiting_dashboard_provider_actions:
        "تم تحميل frame. بانتظار dashboard provider actions.",
      waiting_settings_source_controls:
        "تم تحميل frame. بانتظار عناصر تحكم Settings source.",
      waiting_provider_detail_notes:
        "تم تحميل frame. بانتظار provider detail notes.",
      waiting_popup_actions: "تم تحميل frame. بانتظار popup actions.",
    },
    presets: {
      frame_not_ready: "Frame غير جاهز بعد.",
      focused_first_provider_action:
        "تم تركيز أول زر provider action.",
      missing_first_provider_action:
        "تعذر العثور على أول provider action.",
      opened_first_source_diagnostics:
        "تم فتح أول source diagnostics disclosure.",
      missing_source_diagnostics_disclosure:
        "تعذر العثور على source diagnostics disclosure.",
      focused_source_preference:
        "تم تركيز أول source-preference material select.",
      missing_source_preference_select:
        "تعذر العثور على source-preference material select.",
      scrolled_first_detail_note:
        "تم تمرير detail frame إلى أول note block.",
      missing_detail_note: "تعذر العثور على detail note block.",
      focused_popup_dashboard_action:
        "تم تركيز popup dashboard action.",
      missing_popup_dashboard_action:
        "تعذر العثور على popup dashboard action.",
      focused_featured_provider_detail_action:
        "تم تركيز أول featured-provider detail action.",
      missing_featured_provider_detail_action:
        "تعذر العثور على featured-provider detail action.",
      unsupported_audit_preset: "Audit preset غير مدعوم.",
    },
  },
  hi: {
    rawDetailLabel: "Raw detail",
    readiness: {
      frame_not_ready: "Frame अभी ready नहीं है।",
      ready: "Frame load हो गया है और audit presets के लिए ready है।",
      waiting_dashboard_provider_actions:
        "Frame load हो गया है। Dashboard provider actions का इंतजार है।",
      waiting_settings_source_controls:
        "Frame load हो गया है। Settings source controls का इंतजार है।",
      waiting_provider_detail_notes:
        "Frame load हो गया है। Provider detail notes का इंतजार है।",
      waiting_popup_actions:
        "Frame load हो गया है। Popup actions का इंतजार है।",
    },
    presets: {
      frame_not_ready: "Frame अभी ready नहीं है।",
      focused_first_provider_action:
        "पहले provider action button पर focus किया गया।",
      missing_first_provider_action:
        "पहला provider action नहीं मिला।",
      opened_first_source_diagnostics:
        "पहला source diagnostics disclosure खोला गया।",
      missing_source_diagnostics_disclosure:
        "Source diagnostics disclosure नहीं मिला।",
      focused_source_preference:
        "पहले source-preference material select पर focus किया गया।",
      missing_source_preference_select:
        "Source-preference material select नहीं मिला।",
      scrolled_first_detail_note:
        "Detail frame को पहले note block तक scroll किया गया।",
      missing_detail_note: "Detail note block नहीं मिला।",
      focused_popup_dashboard_action:
        "Popup dashboard action पर focus किया गया।",
      missing_popup_dashboard_action:
        "Popup dashboard action नहीं मिला।",
      focused_featured_provider_detail_action:
        "पहले featured-provider detail action पर focus किया गया।",
      missing_featured_provider_detail_action:
        "Featured-provider detail action नहीं मिला।",
      unsupported_audit_preset: "Audit preset समर्थित नहीं है।",
    },
  },
  id: {
    rawDetailLabel: "Detail raw",
    readiness: {
      frame_not_ready: "Frame belum siap.",
      ready: "Frame sudah dimuat dan siap untuk preset audit.",
      waiting_dashboard_provider_actions:
        "Frame sudah dimuat. Menunggu aksi provider di dashboard.",
      waiting_settings_source_controls:
        "Frame sudah dimuat. Menunggu kontrol source di Settings.",
      waiting_provider_detail_notes:
        "Frame sudah dimuat. Menunggu note detail provider.",
      waiting_popup_actions: "Frame sudah dimuat. Menunggu aksi popup.",
    },
    presets: {
      frame_not_ready: "Frame belum siap.",
      focused_first_provider_action:
        "Tombol aksi provider pertama sudah difokuskan.",
      missing_first_provider_action:
        "Aksi provider pertama tidak ditemukan.",
      opened_first_source_diagnostics:
        "Disclosure diagnostics source pertama sudah dibuka.",
      missing_source_diagnostics_disclosure:
        "Disclosure diagnostics source tidak ditemukan.",
      focused_source_preference:
        "Material select source-preference pertama sudah difokuskan.",
      missing_source_preference_select:
        "Material select source-preference tidak ditemukan.",
      scrolled_first_detail_note:
        "Frame detail sudah digulir ke blok note pertama.",
      missing_detail_note: "Blok note detail tidak ditemukan.",
      focused_popup_dashboard_action:
        "Aksi dashboard popup sudah difokuskan.",
      missing_popup_dashboard_action:
        "Aksi dashboard popup tidak ditemukan.",
      focused_featured_provider_detail_action:
        "Aksi detail featured provider pertama sudah difokuskan.",
      missing_featured_provider_detail_action:
        "Aksi detail featured provider tidak ditemukan.",
      unsupported_audit_preset: "Preset audit tidak didukung.",
    },
  },
};

const OPERATOR_WORKSPACE_COPY: Record<
  ResolvedAppLocale,
  OperatorWorkspaceLocalizedCopy
> = {
  en: {
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
  },
  "zh-CN": {
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
  },
  "zh-TW": {
    interactionAudit: {
      topbar: {
        title: "互動稽核",
        subtitle: "真實瀏覽器 QA 工作台",
        openDashboard: "開啟 dashboard",
        openSettings: "開啟設定",
      },
      hero: {
        eyebrow: "稽核中心",
        title: "不用反覆調整視窗的手動互動複查",
        detail:
          "這個頁面會把實際發布的 dashboard、settings、provider detail 和 popup 放進固定寬度 frame，讓真實瀏覽器複查專注在 hover、focus、pressed 與緊湊寬度行為，而不是反覆重新開啟路由。稽核中心會跟隨 side panel 與 popup 的共用主題偏好。",
        chip: "手動 QA · 固定寬度 frame",
      },
      guidance: {
        eyebrow: "使用方式",
        title: "複查指引",
        detail:
          "當自動化複查腳本之後仍需要人工確認時，請在一般瀏覽器分頁或擴充功能頁面開啟此路由。即使外層瀏覽器視窗更大，內嵌 frame 仍會保留代表性寬度。",
        checks: [
          "懸停互動控制項，確認跨頁面的狀態層仍然一致。",
          "用鍵盤 tab 穿過內嵌 surface，確認 focus 可見性仍然明確。",
          "使用下方 preset actions 開啟 disclosure、聚焦控制項或露出較低層 detail note，再簽核一個 UI slice。",
        ],
        openDashboard: "開啟 dashboard",
        openSettings: "開啟設定",
        openPopup: "開啟 popup",
      },
      signoff: {
        eyebrow: "簽核工作台",
        title: "目前 operator 草稿",
        detail:
          "使用每個稽核 surface 內的控制項記錄檢查進度、reviewer notes，以及 pass 或 follow-up 狀態。下方草稿會隨目前工作台狀態即時更新。",
        reviewedSurfaces: "已複查 surface",
        pass: "通過",
        followUp: "待跟進",
        completedChecks: "已完成檢查",
        reviewerName: "Reviewer 名稱",
        reviewerPlaceholder: "記錄 reviewer 或 operator 名稱。",
        sessionLabel: "Session 標籤",
        sessionPlaceholder: "標記這次複查，例如 Compact QA Pass。",
        reviewedAt: "複查時間",
        reviewedAtPlaceholder: "使用 ISO-8601 時間，或蓋上目前複查時間。",
        stampCurrentTime: "填入目前時間",
        reviewSession: "Review session",
        reviewerPrefix: "Reviewer",
        sessionPrefix: "Session",
        reviewedAtPrefix: "Reviewed at",
        notSet: "未設定",
        requestBindingPrefix: "Request binding",
        requestRevisionPrefix: "Request revision",
        requestScope: "請求範圍",
        boundRequestDetail:
          "這個工作台已綁定一個 repo-backed pending request。請針對該請求執行 preflight 與 completion，而不是使用 ad-hoc archive path。",
        adHocDetail:
          "這個工作台未綁定 repo-backed request。除非先匯入 pending request template，否則請使用 archive path。",
        repoBackedRequest: "Repo-backed request",
        adHocWorkspace: "Ad-hoc audit workspace",
        binding: "綁定",
        requestRevision: "Request revision",
        downloadIdentity: "下載身分",
        downloadsBound: "下載內容會包含綁定的 request id 與 request revision。",
        downloadsAdHoc: "下載內容只保留目前 session scope。",
      },
    },
    themeRecovery: {
      topbar: {
        title: "主題恢復審核",
        subtitle: "Operator 工作台",
        refresh: "重新整理",
        openSettings: "開啟設定",
      },
      hero: {
        eyebrow: "真實 session 跟進",
        title: "集中執行 native prompt 與真實 session 復原檢查",
        detail:
          "這個路由不會宣稱 native host prompt 或真實 vendor session 已經通過。它會收集目前主題狀態、復原狀態、快速連結與可複製證據，讓下一次 operator pass 保持真實且可重複。",
        chip: "主題 QA · 復原跟進",
      },
      loading: {
        title: "正在載入目前審核狀態...",
        detail:
          "正在讀取目前 app state 與 action badge，讓這個工作台反映與已發布 surface 相同的主題和 provider 狀態。",
      },
      error: {
        title: "無法載入審核狀態",
      },
      currentTruth: {
        eyebrow: "目前真值",
        title: "此刻的復原狀態",
        reviewStage: "複查階段",
        popupSnapshot: "Popup 快照",
        actionBadge: "Action badge",
      },
      themeState: {
        eyebrow: "主題狀態",
        title: "共用執行時狀態",
        detail:
          "這個工作台讀取 side panel、popup 與 audit hub 使用的同一份已儲存主題設定。Operator pass 應在復原 provider access 時固定目前 custom-seed 狀態。",
        themeMode: "Theme mode",
        resolvedMode: "Resolved mode",
        accentPreset: "Accent preset",
        customSeed: "Custom seed",
        scopeIsolation: "Scope isolation",
        liveBadgeSource: "Live badge source",
        notSet: "未設定",
        computedBadgeSource: "由目前 app state 計算",
        scopeNote: "Scope note",
        popupSnapshotPrefix: "Popup 快照",
        actionBadgeTitlePrefix: "Action badge 標題",
      },
      requestScope: {
        eyebrow: "請求範圍",
        title: "Repo-backed request 綁定",
        detail:
          "這個工作台已綁定一個 pending theme-recovery request。Summary 與 JSON export 必須保留該請求身分，避免 completion 意外履行另一個請求。",
        requestId: "Request id",
        createdAt: "Created at",
        boundWorkspaceRoute: "綁定的工作台路由",
        adHocTitle: "Ad-hoc 工作台",
        adHocDetail:
          "這個 review route 目前未綁定 repo-backed request。它的 export 仍可用於本機檢查，但不應用來履行 pending request。",
      },
      workflow: {
        eyebrow: "Operator workflow",
        title: "真實 session 跟進步驟",
        detail:
          "在 Settings、popup 與目標 vendor 頁面之間切換時保持這個頁面開啟。用下方連結在獨立分頁開啟準確的已發布 surface，且不會遺失目前工作台。",
        steps: [
          "固定目前 custom seed，並確認工作台仍回報預期的 theme mode、resolved mode、preset 與 seed。",
          "在信任 popup alignment 與 action badge 之前，用 Settings 保持只有 Cursor 和 Codex 可見。",
          "先捕捉 degraded state：缺少 host access 或真實 session 被阻擋時，此頁面應保持 warning 狀態。",
          "透過 native prompt 授予 host access，或復原真實 vendor session；接著重新整理此頁，確認 review stage 回到 recovered。",
          "真實 pass 後複製 summary 或 JSON export，讓結果可附加到後續 repo-backed archive 或 operator note。",
        ],
        extensionSurfaces: "擴充功能 surface",
        vendorSessionPages: "Vendor session 頁面",
      },
      links: {
        sidePanel: {
          settings: "開啟設定",
          dashboard: "開啟 dashboard",
          "cursor-detail": "開啟 Cursor 詳細資訊",
          "codex-detail": "開啟 Codex 詳細資訊",
          popup: "開啟 popup",
        },
        vendor: {
          "cursor-session-page": "開啟 Cursor usage 頁面",
          "codex-session-page": "開啟 Codex analytics 頁面",
        },
      },
      outputs: {
        eyebrow: "可複製輸出",
        title: "Summary 與 JSON 證據",
        detail:
          "這些輸出保持唯讀。它們會準確反映上方顯示的目前工作台狀態，並可在手動 extension-mode 或真實 session pass 後複製。",
        copySummary: "複製 summary",
        downloadSummary: "下載 summary",
        copyJson: "複製 JSON",
        downloadJson: "下載 JSON",
        openSettingsTab: "在新分頁開啟設定",
        summaryDraft: "Summary 草稿",
        jsonExport: "JSON export",
        copiedSummary: "已複製目前主題復原 summary。",
        downloadedSummary: "已下載目前主題復原 summary。",
        copiedJson: "已複製目前主題復原 JSON export。",
        downloadedJson: "已下載目前主題復原 JSON export。",
        clipboardUnavailable: "目前內容無法存取 clipboard。",
        downloadUnavailable: "目前內容無法直接下載。",
        workspaceNote: "工作台備註",
      },
    },
  },
  ja: {
    interactionAudit: {
      topbar: {
        title: "インタラクション監査",
        subtitle: "実ブラウザー QA ハブ",
        openDashboard: "dashboard を開く",
        openSettings: "設定を開く",
      },
      hero: {
        eyebrow: "監査ハブ",
        title: "リサイズを繰り返さない手動インタラクションレビュー",
        detail:
          "このページは実際に出荷されている dashboard、settings、provider detail、popup の各 surface を固定幅 frame に埋め込みます。実ブラウザーのレビューでは、route を何度も開き直す代わりに hover、focus、pressed、コンパクト幅の挙動へ集中できます。監査ハブは出荷済み side panel と popup と同じ共有テーマ設定に従います。",
        chip: "手動 QA · 固定幅 frame",
      },
      guidance: {
        eyebrow: "使い方",
        title: "レビューガイダンス",
        detail:
          "自動レビュー script の後に人の確認が必要なときは、この route を通常のブラウザータブまたは拡張機能ページで開きます。外側のブラウザーウィンドウが大きくても、埋め込み frame は代表的な幅を保ちます。",
        checks: [
          "インタラクティブなコントロールに hover し、ページ間で state layer が一貫していることを確認します。",
          "キーボードの tab で埋め込み surface を移動し、focus の可視性が明確なままか確認します。",
          "下の preset actions で disclosure を開く、コントロールへ focus する、または下位の detail note を表示してから UI slice を sign off します。",
        ],
        openDashboard: "dashboard を開く",
        openSettings: "設定を開く",
        openPopup: "popup を開く",
      },
      signoff: {
        eyebrow: "サインオフ作業領域",
        title: "現在の operator draft",
        detail:
          "各監査 surface 内のコントロールで、チェック進捗、reviewer notes、pass または follow-up 状態を記録します。下の draft は現在の workspace 状態からリアルタイムに更新されます。",
        reviewedSurfaces: "レビュー済み surface",
        pass: "合格",
        followUp: "フォローアップ",
        completedChecks: "完了したチェック",
        reviewerName: "Reviewer 名",
        reviewerPlaceholder: "reviewer または operator 名を記録します。",
        sessionLabel: "Session ラベル",
        sessionPlaceholder: "例: Compact QA Pass のようにこの pass をラベル付けします。",
        reviewedAt: "レビュー日時",
        reviewedAtPlaceholder: "ISO-8601 時刻を使うか、現在のレビュー時刻を入れます。",
        stampCurrentTime: "現在時刻を入力",
        reviewSession: "Review session",
        reviewerPrefix: "Reviewer",
        sessionPrefix: "Session",
        reviewedAtPrefix: "Reviewed at",
        notSet: "未設定",
        requestBindingPrefix: "Request binding",
        requestRevisionPrefix: "Request revision",
        requestScope: "Request scope",
        boundRequestDetail:
          "この workspace は repo-backed pending request に紐付いています。ad-hoc archive path ではなく、その request に対して preflight と completion を実行してください。",
        adHocDetail:
          "この workspace は repo-backed request に紐付いていません。pending request template を先に import しない限り archive path を使ってください。",
        repoBackedRequest: "Repo-backed request",
        adHocWorkspace: "Ad-hoc audit workspace",
        binding: "紐付け",
        requestRevision: "Request revision",
        downloadIdentity: "ダウンロード識別情報",
        downloadsBound: "ダウンロードには紐付いた request id と request revision が含まれます。",
        downloadsAdHoc: "ダウンロードは現在の session scope のみに限定されます。",
      },
    },
    themeRecovery: {
      topbar: {
        title: "テーマ復旧レビュー",
        subtitle: "Operator workspace",
        refresh: "更新",
        openSettings: "設定を開く",
      },
      hero: {
        eyebrow: "実 session のフォローアップ",
        title: "native prompt と実 session 復旧チェックをまとめて準備",
        detail:
          "この route は native host prompt や実 vendor session がすでに通過したとは主張しません。現在のテーマ状態、復旧状態、クイックリンク、コピー可能な証拠を集め、次の operator pass を正確で再現可能にします。",
        chip: "テーマ QA · 復旧フォローアップ",
      },
      loading: {
        title: "現在のレビュー状態を読み込み中...",
        detail:
          "現在の app state と action badge を読み込み、この workspace が出荷済み surface と同じテーマおよび provider 状態を反映できるようにしています。",
      },
      error: {
        title: "レビュー状態を読み込めませんでした",
      },
      currentTruth: {
        eyebrow: "現在の真実",
        title: "現時点の復旧状態",
        reviewStage: "Review stage",
        popupSnapshot: "Popup snapshot",
        actionBadge: "Action badge",
      },
      themeState: {
        eyebrow: "テーマ状態",
        title: "共有 runtime 状態",
        detail:
          "この workspace は side panel、popup、audit hub が使う同じ保存済みテーマ設定を読みます。operator pass では provider access を復旧する間、現在の custom-seed 状態を固定してください。",
        themeMode: "Theme mode",
        resolvedMode: "Resolved mode",
        accentPreset: "Accent preset",
        customSeed: "Custom seed",
        scopeIsolation: "Scope isolation",
        liveBadgeSource: "Live badge source",
        notSet: "未設定",
        computedBadgeSource: "現在の app state から計算",
        scopeNote: "Scope note",
        popupSnapshotPrefix: "Popup snapshot",
        actionBadgeTitlePrefix: "Action badge title",
      },
      requestScope: {
        eyebrow: "Request scope",
        title: "Repo-backed request の紐付け",
        detail:
          "この workspace は pending theme-recovery request に紐付いています。Summary と JSON export は、この request identity を保持し、completion が別の request を誤って完了しないようにします。",
        requestId: "Request id",
        createdAt: "Created at",
        boundWorkspaceRoute: "紐付いた workspace route",
        adHocTitle: "Ad-hoc workspace",
        adHocDetail:
          "この review route は現在 repo-backed request に紐付いていません。export はローカル検査には有用ですが、pending request の完了には使わないでください。",
      },
      workflow: {
        eyebrow: "Operator workflow",
        title: "実 session フォローアップ手順",
        detail:
          "Settings、popup、対象 vendor ページの間を切り替える間、このページを開いたままにします。下のリンクで正確な出荷済み surface を別タブで開き、現在の workspace を失わないようにします。",
        steps: [
          "現在の custom seed を固定し、workspace が期待した theme mode、resolved mode、preset、seed を報告していることを確認します。",
          "popup alignment と action badge を信頼する前に、Settings で Cursor と Codex だけを表示します。",
          "まず degraded state を記録します。host access がない場合や実 session がブロックされている場合、このページは warning 状態のままであるべきです。",
          "native prompt で host access を許可するか、実 vendor session を復旧します。その後このページを更新し、review stage が recovered に戻ることを確認します。",
          "実 pass の後に summary または JSON export をコピーし、後続の repo-backed archive や operator note へ添付できるようにします。",
        ],
        extensionSurfaces: "拡張機能 surface",
        vendorSessionPages: "Vendor session ページ",
      },
      links: {
        sidePanel: {
          settings: "設定を開く",
          dashboard: "dashboard を開く",
          "cursor-detail": "Cursor detail を開く",
          "codex-detail": "Codex detail を開く",
          popup: "popup を開く",
        },
        vendor: {
          "cursor-session-page": "Cursor usage ページを開く",
          "codex-session-page": "Codex analytics ページを開く",
        },
      },
      outputs: {
        eyebrow: "コピー可能な出力",
        title: "Summary と JSON 証拠",
        detail:
          "これらの出力は読み取り専用です。上に表示される現在の workspace 状態を正確に反映し、手動 extension-mode または実 session pass の後にコピーできます。",
        copySummary: "summary をコピー",
        downloadSummary: "summary をダウンロード",
        copyJson: "JSON をコピー",
        downloadJson: "JSON をダウンロード",
        openSettingsTab: "新しいタブで設定を開く",
        summaryDraft: "Summary draft",
        jsonExport: "JSON export",
        copiedSummary: "現在のテーマ復旧 summary をコピーしました。",
        downloadedSummary: "現在のテーマ復旧 summary をダウンロードしました。",
        copiedJson: "現在のテーマ復旧 JSON export をコピーしました。",
        downloadedJson: "現在のテーマ復旧 JSON export をダウンロードしました。",
        clipboardUnavailable: "この context では clipboard にアクセスできません。",
        downloadUnavailable: "この context では直接ダウンロードできません。",
        workspaceNote: "Workspace note",
      },
    },
  },
  ko: {
    interactionAudit: {
      topbar: {
        title: "상호작용 감사",
        subtitle: "실제 브라우저 QA 허브",
        openDashboard: "dashboard 열기",
        openSettings: "설정 열기",
      },
      hero: {
        eyebrow: "감사 허브",
        title: "반복 리사이즈 없이 수동 상호작용 검토",
        detail:
          "이 페이지는 실제 배포된 dashboard, settings, provider detail, popup surface 를 고정 너비 frame 안에 넣습니다. 실제 브라우저 검토는 route 를 반복해서 다시 여는 대신 hover, focus, pressed, compact-width 동작에 집중할 수 있습니다. 감사 허브는 배포된 side panel 및 popup 과 같은 공유 theme preferences 를 따릅니다.",
        chip: "수동 QA · 고정 너비 frame",
      },
      guidance: {
        eyebrow: "사용 방법",
        title: "검토 가이드",
        detail:
          "자동 검토 script 이후 사람의 확인이 필요할 때 이 route 를 일반 브라우저 탭이나 확장 페이지에서 여세요. 바깥 브라우저 창이 더 커도 embedded frame 은 대표 너비를 유지합니다.",
        checks: [
          "상호작용 컨트롤에 hover 하고 페이지 간 state layer 가 일관적인지 확인합니다.",
          "키보드 tab 으로 embedded surface 를 이동하며 focus 가 명확하게 보이는지 확인합니다.",
          "아래 preset actions 로 disclosure 를 열거나 컨트롤에 focus 하거나 더 낮은 detail note 를 노출한 뒤 UI slice 를 sign off 합니다.",
        ],
        openDashboard: "dashboard 열기",
        openSettings: "설정 열기",
        openPopup: "popup 열기",
      },
      signoff: {
        eyebrow: "Signoff workspace",
        title: "현재 operator draft",
        detail:
          "각 감사 surface 안의 컨트롤로 check 진행 상황, reviewer notes, pass 또는 follow-up 상태를 기록합니다. 아래 draft 는 현재 workspace state 에서 실시간으로 업데이트됩니다.",
        reviewedSurfaces: "검토된 surface",
        pass: "통과",
        followUp: "후속 조치",
        completedChecks: "완료된 check",
        reviewerName: "Reviewer 이름",
        reviewerPlaceholder: "reviewer 또는 operator 이름을 기록합니다.",
        sessionLabel: "Session 라벨",
        sessionPlaceholder: "예: Compact QA Pass 처럼 이번 pass 를 표시합니다.",
        reviewedAt: "검토 시간",
        reviewedAtPlaceholder: "ISO-8601 시간을 쓰거나 현재 검토 시간을 입력합니다.",
        stampCurrentTime: "현재 시간 입력",
        reviewSession: "Review session",
        reviewerPrefix: "Reviewer",
        sessionPrefix: "Session",
        reviewedAtPrefix: "Reviewed at",
        notSet: "설정되지 않음",
        requestBindingPrefix: "Request binding",
        requestRevisionPrefix: "Request revision",
        requestScope: "Request scope",
        boundRequestDetail:
          "이 workspace 는 repo-backed pending request 에 바인딩되어 있습니다. ad-hoc archive path 대신 해당 request 에 대해 preflight 와 completion 을 실행하세요.",
        adHocDetail:
          "이 workspace 는 repo-backed request 에 바인딩되어 있지 않습니다. pending request template 을 먼저 가져오지 않는 한 archive path 를 사용하세요.",
        repoBackedRequest: "Repo-backed request",
        adHocWorkspace: "Ad-hoc audit workspace",
        binding: "바인딩",
        requestRevision: "Request revision",
        downloadIdentity: "다운로드 identity",
        downloadsBound: "다운로드에는 바인딩된 request id 와 request revision 이 포함됩니다.",
        downloadsAdHoc: "다운로드는 현재 session scope 에만 유지됩니다.",
      },
    },
    themeRecovery: {
      topbar: {
        title: "테마 복구 검토",
        subtitle: "Operator workspace",
        refresh: "새로고침",
        openSettings: "설정 열기",
      },
      hero: {
        eyebrow: "실제 session follow-up",
        title: "native prompt 와 실제 session 복구 검사를 한곳에서 준비",
        detail:
          "이 route 는 native host prompt 나 실제 vendor session 이 이미 통과했다고 주장하지 않습니다. 현재 theme state, recovery state, quick links, 복사 가능한 evidence 를 모아 다음 operator pass 가 사실에 맞고 반복 가능하도록 합니다.",
        chip: "Theme QA · 복구 follow-up",
      },
      loading: {
        title: "현재 검토 상태를 불러오는 중...",
        detail:
          "현재 app state 와 action badge 를 읽어 이 workspace 가 배포된 surface 와 같은 theme 및 provider 상태를 반영하도록 합니다.",
      },
      error: {
        title: "검토 상태를 불러올 수 없음",
      },
      currentTruth: {
        eyebrow: "현재 truth",
        title: "지금의 복구 상태",
        reviewStage: "Review stage",
        popupSnapshot: "Popup snapshot",
        actionBadge: "Action badge",
      },
      themeState: {
        eyebrow: "Theme state",
        title: "공유 runtime state",
        detail:
          "이 workspace 는 side panel, popup, audit hub 가 사용하는 같은 저장된 theme settings 를 읽습니다. operator pass 는 provider access 를 복구하는 동안 현재 custom-seed state 를 고정해야 합니다.",
        themeMode: "Theme mode",
        resolvedMode: "Resolved mode",
        accentPreset: "Accent preset",
        customSeed: "Custom seed",
        scopeIsolation: "Scope isolation",
        liveBadgeSource: "Live badge source",
        notSet: "설정되지 않음",
        computedBadgeSource: "현재 app state 에서 계산됨",
        scopeNote: "Scope note",
        popupSnapshotPrefix: "Popup snapshot",
        actionBadgeTitlePrefix: "Action badge title",
      },
      requestScope: {
        eyebrow: "Request scope",
        title: "Repo-backed request 바인딩",
        detail:
          "이 workspace 는 pending theme-recovery request 하나에 바인딩되어 있습니다. Summary 와 JSON export 는 이 request identity 를 보존해 completion 이 다른 request 를 실수로 완료하지 않도록 해야 합니다.",
        requestId: "Request id",
        createdAt: "Created at",
        boundWorkspaceRoute: "바인딩된 workspace route",
        adHocTitle: "Ad-hoc workspace",
        adHocDetail:
          "이 review route 는 현재 repo-backed request 에 바인딩되어 있지 않습니다. export 는 로컬 검사에는 유용하지만 pending request 완료에는 사용하지 마세요.",
      },
      workflow: {
        eyebrow: "Operator workflow",
        title: "실제 session follow-up 단계",
        detail:
          "Settings, popup, 대상 vendor page 사이를 전환하는 동안 이 페이지를 열어 두세요. 아래 링크로 정확한 배포 surface 를 별도 탭에서 열어 현재 workspace 를 잃지 않습니다.",
        steps: [
          "현재 custom seed 를 고정하고 workspace 가 예상 theme mode, resolved mode, preset, seed 를 계속 보고하는지 확인합니다.",
          "popup alignment 와 action badge 를 신뢰하기 전에 Settings 에서 Cursor 와 Codex 만 보이게 유지합니다.",
          "먼저 degraded state 를 캡처합니다. host access 누락이나 실제 session 차단은 이 페이지가 warning 상태를 유지해야 합니다.",
          "native prompt 로 host access 를 부여하거나 실제 vendor session 을 복구한 뒤 이 페이지를 새로고침하고 review stage 가 recovered 로 돌아오는지 확인합니다.",
          "실제 pass 후 summary 또는 JSON export 를 복사해 이후 repo-backed archive 나 operator note 에 첨부할 수 있게 합니다.",
        ],
        extensionSurfaces: "확장 surface",
        vendorSessionPages: "Vendor session 페이지",
      },
      links: {
        sidePanel: {
          settings: "설정 열기",
          dashboard: "dashboard 열기",
          "cursor-detail": "Cursor detail 열기",
          "codex-detail": "Codex detail 열기",
          popup: "popup 열기",
        },
        vendor: {
          "cursor-session-page": "Cursor usage 페이지 열기",
          "codex-session-page": "Codex analytics 페이지 열기",
        },
      },
      outputs: {
        eyebrow: "복사 가능한 출력",
        title: "Summary 및 JSON evidence",
        detail:
          "이 출력은 읽기 전용입니다. 위에 표시된 현재 workspace state 를 정확히 반영하며 수동 extension-mode 또는 실제 session pass 후 복사할 수 있습니다.",
        copySummary: "summary 복사",
        downloadSummary: "summary 다운로드",
        copyJson: "JSON 복사",
        downloadJson: "JSON 다운로드",
        openSettingsTab: "새 탭에서 설정 열기",
        summaryDraft: "Summary draft",
        jsonExport: "JSON export",
        copiedSummary: "현재 theme recovery summary 를 복사했습니다.",
        downloadedSummary: "현재 theme recovery summary 를 다운로드했습니다.",
        copiedJson: "현재 theme recovery JSON export 를 복사했습니다.",
        downloadedJson: "현재 theme recovery JSON export 를 다운로드했습니다.",
        clipboardUnavailable: "현재 context 에서 clipboard 에 접근할 수 없습니다.",
        downloadUnavailable: "현재 context 에서 직접 다운로드할 수 없습니다.",
        workspaceNote: "Workspace note",
      },
    },
  },
  "es-419": {
    interactionAudit: {
      topbar: {
        title: "Auditoría de interacción",
        subtitle: "Hub QA en navegador real",
        openDashboard: "Abrir dashboard",
        openSettings: "Abrir Settings",
      },
      hero: {
        eyebrow: "Hub de auditoria",
        title: "Revision manual de interacciones sin redimensionar una y otra vez",
        detail:
          "Esta pagina incrusta las superficies reales publicadas de dashboard, settings, provider detail y popup dentro de frames de ancho fijo. Asi la revision en navegador real puede enfocarse en hover, focus, pressed y comportamiento en ancho compacto, en vez de reabrir rutas repetidamente. El hub de auditoria sigue las mismas preferencias de tema compartidas que el side panel y el popup publicados.",
        chip: "QA manual · Frames de ancho fijo",
      },
      guidance: {
        eyebrow: "Como usarlo",
        title: "Guia de revision",
        detail:
          "Abre esta ruta en una pestana normal del navegador o en una pagina de la extension cuando quieras una pasada humana despues de los scripts de revision automatizada. Los frames incrustados conservan anchos representativos incluso si la ventana externa es mas grande.",
        checks: [
          "Haz hover sobre controles interactivos y confirma que la capa de estado siga siendo coherente entre paginas.",
          "Usa tabulacion de teclado en las superficies incrustadas y confirma que el focus siga siendo visible.",
          "Usa las preset actions de abajo para abrir disclosures, enfocar controles o mostrar notas de detalle mas profundas antes de firmar un UI slice.",
        ],
        openDashboard: "Abrir dashboard",
        openSettings: "Abrir Settings",
        openPopup: "Abrir popup",
      },
      signoff: {
        eyebrow: "Workspace de signoff",
        title: "Borrador actual del operator",
        detail:
          "Usa los controles dentro de cada superficie auditada para registrar progreso de checks, reviewer notes y estado pass o follow-up. El borrador de abajo se actualiza en vivo desde el estado actual del workspace.",
        reviewedSurfaces: "Superficies revisadas",
        pass: "Pass",
        followUp: "Follow-up",
        completedChecks: "Checks completados",
        reviewerName: "Nombre del reviewer",
        reviewerPlaceholder: "Registra el nombre del reviewer u operator.",
        sessionLabel: "Etiqueta de session",
        sessionPlaceholder: "Etiqueta esta pasada, por ejemplo Compact QA Pass.",
        reviewedAt: "Reviewed at",
        reviewedAtPlaceholder: "Usa hora ISO-8601 o marca el momento actual de revision.",
        stampCurrentTime: "Marcar hora actual",
        reviewSession: "Review session",
        reviewerPrefix: "Reviewer",
        sessionPrefix: "Session",
        reviewedAtPrefix: "Reviewed at",
        notSet: "sin definir",
        requestBindingPrefix: "Request binding",
        requestRevisionPrefix: "Request revision",
        requestScope: "Alcance del request",
        boundRequestDetail:
          "Este workspace esta vinculado a un pending request repo-backed. Usa preflight y completion contra ese request en vez del ad-hoc archive path.",
        adHocDetail:
          "Este workspace no esta vinculado a un repo-backed request. Usa el archive path salvo que primero importes un pending request template.",
        repoBackedRequest: "Repo-backed request",
        adHocWorkspace: "Ad-hoc audit workspace",
        binding: "Vinculo",
        requestRevision: "Request revision",
        downloadIdentity: "Identidad de descarga",
        downloadsBound:
          "Las descargas incluyen el request id vinculado y el request revision.",
        downloadsAdHoc: "Las descargas quedan limitadas al session scope actual.",
      },
    },
    themeRecovery: {
      topbar: {
        title: "Revisión de recuperación de tema",
        subtitle: "Workspace del operator",
        refresh: "Actualizar",
        openSettings: "Abrir Settings",
      },
      hero: {
        eyebrow: "Seguimiento de session real",
        title: "Un lugar para preparar checks de native prompt y recuperacion de session real",
        detail:
          "Esta ruta no afirma que el native host prompt o una session real del vendor ya hayan pasado. Reune el estado actual del tema, estado de recuperacion, enlaces rapidos y evidencia copiable para que la proxima pasada del operator sea veraz y repetible.",
        chip: "Theme QA · Seguimiento de recuperacion",
      },
      loading: {
        title: "Cargando estado actual de revision...",
        detail:
          "Leyendo el app state actual y el action badge para que este workspace refleje el mismo tema y estado de provider que las superficies publicadas.",
      },
      error: {
        title: "No se pudo cargar el estado de revision",
      },
      currentTruth: {
        eyebrow: "Verdad actual",
        title: "Estado de recuperacion ahora",
        reviewStage: "Review stage",
        popupSnapshot: "Popup snapshot",
        actionBadge: "Action badge",
      },
      themeState: {
        eyebrow: "Estado del tema",
        title: "Estado runtime compartido",
        detail:
          "Este workspace lee la misma configuracion de tema guardada que usan side panel, popup y audit hub. La pasada del operator debe mantener fijo el custom-seed actual mientras recupera provider access.",
        themeMode: "Theme mode",
        resolvedMode: "Resolved mode",
        accentPreset: "Accent preset",
        customSeed: "Custom seed",
        scopeIsolation: "Scope isolation",
        liveBadgeSource: "Live badge source",
        notSet: "Sin definir",
        computedBadgeSource: "Calculado desde el app state actual",
        scopeNote: "Scope note",
        popupSnapshotPrefix: "Popup snapshot",
        actionBadgeTitlePrefix: "Action badge title",
      },
      requestScope: {
        eyebrow: "Alcance del request",
        title: "Vinculo de repo-backed request",
        detail:
          "Este workspace esta vinculado a un pending theme-recovery request. Summary y JSON export deben conservar esta identidad del request para que completion no cierre otro request por error.",
        requestId: "Request id",
        createdAt: "Created at",
        boundWorkspaceRoute: "Ruta de workspace vinculada",
        adHocTitle: "Ad-hoc workspace",
        adHocDetail:
          "Esta review route no esta vinculada actualmente a un repo-backed request. Sus exports siguen siendo utiles para inspeccion local, pero no deben usarse para completar un pending request.",
      },
      workflow: {
        eyebrow: "Operator workflow",
        title: "Pasos de seguimiento de session real",
        detail:
          "Manten esta pagina abierta mientras cambias entre Settings, popup y las paginas vendor objetivo. Usa los enlaces de abajo para abrir las superficies publicadas exactas en pestanas separadas sin perder este workspace.",
        steps: [
          "Mantener fijo el custom seed actual y confirmar que el workspace aun reporta el theme mode, resolved mode, preset y seed esperados.",
          "Usar Settings para mantener visibles solo Cursor y Codex antes de confiar en popup alignment y action badge.",
          "Capturar primero el degraded state: falta de host access o una session real bloqueada debe mantener esta pagina en warning.",
          "Conceder host access mediante el native prompt o restaurar la session real del vendor; luego actualizar esta pagina y confirmar que review stage vuelve a recovered.",
          "Copiar el summary o JSON export despues de la pasada real para adjuntarlo luego a un repo-backed archive u operator note.",
        ],
        extensionSurfaces: "Superficies de extension",
        vendorSessionPages: "Paginas de vendor session",
      },
      links: {
        sidePanel: {
          settings: "Abrir Settings",
          dashboard: "Abrir dashboard",
          "cursor-detail": "Abrir detalle de Cursor",
          "codex-detail": "Abrir detalle de Codex",
          popup: "Abrir popup",
        },
        vendor: {
          "cursor-session-page": "Abrir pagina de usage de Cursor",
          "codex-session-page": "Abrir pagina de analytics de Codex",
        },
      },
      outputs: {
        eyebrow: "Salidas copiables",
        title: "Evidencia Summary y JSON",
        detail:
          "Estas salidas permanecen en solo lectura. Reflejan exactamente el estado actual del workspace mostrado arriba y pueden copiarse despues de una pasada manual extension-mode o de session real.",
        copySummary: "Copiar summary",
        downloadSummary: "Descargar summary",
        copyJson: "Copiar JSON",
        downloadJson: "Descargar JSON",
        openSettingsTab: "Abrir Settings en nueva pestana",
        summaryDraft: "Summary draft",
        jsonExport: "JSON export",
        copiedSummary: "Se copio el summary actual de recuperacion de tema.",
        downloadedSummary: "Se descargo el summary actual de recuperacion de tema.",
        copiedJson: "Se copio el JSON export actual de recuperacion de tema.",
        downloadedJson: "Se descargo el JSON export actual de recuperacion de tema.",
        clipboardUnavailable: "Clipboard no esta disponible en este contexto.",
        downloadUnavailable: "La descarga directa no esta disponible en este contexto.",
        workspaceNote: "Nota del workspace",
      },
    },
  },
  "pt-BR": {
    interactionAudit: {
      topbar: {
        title: "Auditoria de interação",
        subtitle: "Hub de QA em navegador real",
        openDashboard: "Abrir dashboard",
        openSettings: "Abrir Settings",
      },
      hero: {
        eyebrow: "Hub de auditoria",
        title: "Revisao manual de interacoes sem redimensionar varias vezes",
        detail:
          "Esta pagina incorpora as superficies reais publicadas de dashboard, settings, provider detail e popup dentro de frames de largura fixa. Assim a revisao em navegador real pode focar hover, focus, pressed e comportamento em largura compacta, em vez de reabrir rotas repetidamente. O hub de auditoria segue as mesmas preferencias de tema compartilhadas do side panel e do popup publicados.",
        chip: "QA manual · Frames de largura fixa",
      },
      guidance: {
        eyebrow: "Como usar",
        title: "Orientacao de revisao",
        detail:
          "Abra esta rota em uma aba normal do navegador ou em uma pagina da extensao quando quiser uma passada humana depois dos scripts de revisao automatizada. Os frames incorporados preservam larguras representativas mesmo quando a janela externa do navegador e maior.",
        checks: [
          "Passe o mouse sobre controles interativos e confirme que a camada de estado continua coerente entre paginas.",
          "Use tab pelo teclado nas superficies incorporadas e confirme que a visibilidade de focus continua explicita.",
          "Use as preset actions abaixo para abrir disclosures, focar controles ou revelar detail notes mais baixos antes de assinar um UI slice.",
        ],
        openDashboard: "Abrir dashboard",
        openSettings: "Abrir Settings",
        openPopup: "Abrir popup",
      },
      signoff: {
        eyebrow: "Workspace de signoff",
        title: "Rascunho atual do operator",
        detail:
          "Use os controles dentro de cada superficie auditada para registrar progresso de checks, reviewer notes e estado pass ou follow-up. O rascunho abaixo atualiza ao vivo a partir do estado atual do workspace.",
        reviewedSurfaces: "Superficies revisadas",
        pass: "Pass",
        followUp: "Follow-up",
        completedChecks: "Checks concluidos",
        reviewerName: "Nome do reviewer",
        reviewerPlaceholder: "Registre o nome do reviewer ou operator.",
        sessionLabel: "Rotulo da session",
        sessionPlaceholder: "Rotule esta passada, por exemplo Compact QA Pass.",
        reviewedAt: "Reviewed at",
        reviewedAtPlaceholder: "Use horario ISO-8601 ou marque o momento atual da revisao.",
        stampCurrentTime: "Marcar horario atual",
        reviewSession: "Review session",
        reviewerPrefix: "Reviewer",
        sessionPrefix: "Session",
        reviewedAtPrefix: "Reviewed at",
        notSet: "nao definido",
        requestBindingPrefix: "Request binding",
        requestRevisionPrefix: "Request revision",
        requestScope: "Escopo do request",
        boundRequestDetail:
          "Este workspace esta vinculado a um pending request repo-backed. Use preflight e completion nesse request em vez do ad-hoc archive path.",
        adHocDetail:
          "Este workspace nao esta vinculado a um repo-backed request. Use o archive path a menos que um pending request template seja importado primeiro.",
        repoBackedRequest: "Repo-backed request",
        adHocWorkspace: "Ad-hoc audit workspace",
        binding: "Vinculo",
        requestRevision: "Request revision",
        downloadIdentity: "Identidade do download",
        downloadsBound:
          "Downloads incluem o request id vinculado e o request revision.",
        downloadsAdHoc: "Downloads ficam somente no session scope atual.",
      },
    },
    themeRecovery: {
      topbar: {
        title: "Revisão de recuperação de tema",
        subtitle: "Workspace do operator",
        refresh: "Atualizar",
        openSettings: "Abrir Settings",
      },
      hero: {
        eyebrow: "Acompanhamento de session real",
        title: "Um lugar para preparar checks de native prompt e recuperacao de session real",
        detail:
          "Esta rota nao afirma que o native host prompt ou uma session real do vendor ja passou. Ela coleta o estado atual do tema, estado de recuperacao, links rapidos e evidencias copiaveis para que a proxima passada do operator seja verdadeira e repetivel.",
        chip: "Theme QA · Acompanhamento de recuperacao",
      },
      loading: {
        title: "Carregando estado atual da revisao...",
        detail:
          "Lendo o app state atual e o action badge para que este workspace reflita o mesmo tema e estado de provider das superficies publicadas.",
      },
      error: {
        title: "Nao foi possivel carregar o estado da revisao",
      },
      currentTruth: {
        eyebrow: "Verdade atual",
        title: "Estado de recuperacao agora",
        reviewStage: "Review stage",
        popupSnapshot: "Popup snapshot",
        actionBadge: "Action badge",
      },
      themeState: {
        eyebrow: "Estado do tema",
        title: "Estado runtime compartilhado",
        detail:
          "Este workspace le as mesmas configuracoes de tema salvas usadas pelo side panel, popup e audit hub. A passada do operator deve manter o custom-seed atual fixo enquanto recupera provider access.",
        themeMode: "Theme mode",
        resolvedMode: "Resolved mode",
        accentPreset: "Accent preset",
        customSeed: "Custom seed",
        scopeIsolation: "Scope isolation",
        liveBadgeSource: "Live badge source",
        notSet: "Nao definido",
        computedBadgeSource: "Calculado do app state atual",
        scopeNote: "Scope note",
        popupSnapshotPrefix: "Popup snapshot",
        actionBadgeTitlePrefix: "Action badge title",
      },
      requestScope: {
        eyebrow: "Escopo do request",
        title: "Vinculo de repo-backed request",
        detail:
          "Este workspace esta vinculado a um pending theme-recovery request. Summary e JSON export devem preservar esta identidade de request para que completion nao conclua outro request por acidente.",
        requestId: "Request id",
        createdAt: "Created at",
        boundWorkspaceRoute: "Rota do workspace vinculada",
        adHocTitle: "Ad-hoc workspace",
        adHocDetail:
          "Esta review route nao esta vinculada a um repo-backed request no momento. Seus exports ainda sao uteis para inspecao local, mas nao devem ser usados para concluir um pending request.",
      },
      workflow: {
        eyebrow: "Operator workflow",
        title: "Passos de acompanhamento da session real",
        detail:
          "Mantenha esta pagina aberta enquanto alterna entre Settings, popup e as paginas vendor de destino. Use os links abaixo para abrir as superficies publicadas exatas em abas separadas sem perder este workspace.",
        steps: [
          "Manter o custom seed atual fixo e confirmar que o workspace ainda relata theme mode, resolved mode, preset e seed esperados.",
          "Usar Settings para manter apenas Cursor e Codex visiveis antes de confiar no popup alignment e no action badge.",
          "Capturar primeiro o degraded state: falta de host access ou session real bloqueada deve manter esta pagina em warning.",
          "Conceder host access pelo native prompt ou restaurar a session real do vendor; depois atualizar esta pagina e confirmar que review stage voltou para recovered.",
          "Copiar o summary ou JSON export depois da passada real para anexar o resultado a um repo-backed archive ou operator note posterior.",
        ],
        extensionSurfaces: "Superficies da extensao",
        vendorSessionPages: "Paginas de vendor session",
      },
      links: {
        sidePanel: {
          settings: "Abrir Settings",
          dashboard: "Abrir dashboard",
          "cursor-detail": "Abrir detalhe de Cursor",
          "codex-detail": "Abrir detalhe de Codex",
          popup: "Abrir popup",
        },
        vendor: {
          "cursor-session-page": "Abrir pagina de usage do Cursor",
          "codex-session-page": "Abrir pagina de analytics do Codex",
        },
      },
      outputs: {
        eyebrow: "Saidas copiaveis",
        title: "Evidencia Summary e JSON",
        detail:
          "Estas saidas ficam somente leitura. Elas refletem exatamente o estado atual do workspace mostrado acima e podem ser copiadas depois de uma passada manual extension-mode ou de session real.",
        copySummary: "Copiar summary",
        downloadSummary: "Baixar summary",
        copyJson: "Copiar JSON",
        downloadJson: "Baixar JSON",
        openSettingsTab: "Abrir Settings em nova aba",
        summaryDraft: "Summary draft",
        jsonExport: "JSON export",
        copiedSummary: "Summary atual de recuperacao de tema copiado.",
        downloadedSummary: "Summary atual de recuperacao de tema baixado.",
        copiedJson: "JSON export atual de recuperacao de tema copiado.",
        downloadedJson: "JSON export atual de recuperacao de tema baixado.",
        clipboardUnavailable: "Clipboard nao esta disponivel neste contexto.",
        downloadUnavailable: "Download direto nao esta disponivel neste contexto.",
        workspaceNote: "Nota do workspace",
      },
    },
  },
  fr: {
    interactionAudit: {
      topbar: {
        title: "Audit d'interaction",
        subtitle: "Hub QA en navigateur reel",
        openDashboard: "Ouvrir dashboard",
        openSettings: "Ouvrir Settings",
      },
      hero: {
        eyebrow: "Hub d'audit",
        title: "Revue manuelle des interactions sans redimensionnements repetes",
        detail:
          "Cette page integre les surfaces reellement publiees dashboard, settings, provider detail et popup dans des frames a largeur fixe. La revue en navigateur reel peut ainsi se concentrer sur hover, focus, pressed et les comportements en largeur compacte au lieu de rouvrir les routes. Le hub d'audit suit les memes preferences de theme partagees que le side panel et le popup publies.",
        chip: "QA manuelle · Frames a largeur fixe",
      },
      guidance: {
        eyebrow: "Utilisation",
        title: "Guide de revue",
        detail:
          "Ouvrez cette route dans un onglet navigateur normal ou une page d'extension lorsque vous voulez une passe humaine apres les scripts de revue automatises. Les frames integrees conservent des largeurs representatives meme si la fenetre externe est plus grande.",
        checks: [
          "Survolez les controles interactifs et confirmez que la couche d'etat reste coherente entre les pages.",
          "Utilisez tab au clavier dans les surfaces integrees et confirmez que la visibilite du focus reste explicite.",
          "Utilisez les preset actions ci-dessous pour ouvrir des disclosures, focaliser des controles ou afficher des detail notes plus basses avant de signer un UI slice.",
        ],
        openDashboard: "Ouvrir dashboard",
        openSettings: "Ouvrir Settings",
        openPopup: "Ouvrir popup",
      },
      signoff: {
        eyebrow: "Workspace de signoff",
        title: "Brouillon operator actuel",
        detail:
          "Utilisez les controles dans chaque surface auditee pour enregistrer la progression des checks, les reviewer notes et l'etat pass ou follow-up. Le brouillon ci-dessous se met a jour en direct depuis l'etat actuel du workspace.",
        reviewedSurfaces: "Surfaces revues",
        pass: "Pass",
        followUp: "Follow-up",
        completedChecks: "Checks termines",
        reviewerName: "Nom du reviewer",
        reviewerPlaceholder: "Notez le nom du reviewer ou de l'operator.",
        sessionLabel: "Libelle de session",
        sessionPlaceholder: "Nommez cette passe, par exemple Compact QA Pass.",
        reviewedAt: "Reviewed at",
        reviewedAtPlaceholder: "Utilisez l'heure ISO-8601 ou marquez le moment actuel de revue.",
        stampCurrentTime: "Marquer l'heure actuelle",
        reviewSession: "Review session",
        reviewerPrefix: "Reviewer",
        sessionPrefix: "Session",
        reviewedAtPrefix: "Reviewed at",
        notSet: "non defini",
        requestBindingPrefix: "Request binding",
        requestRevisionPrefix: "Request revision",
        requestScope: "Portee du request",
        boundRequestDetail:
          "Ce workspace est lie a un pending request repo-backed. Utilisez preflight et completion sur ce request au lieu du ad-hoc archive path.",
        adHocDetail:
          "Ce workspace n'est pas lie a un repo-backed request. Utilisez l'archive path sauf si un pending request template est d'abord importe.",
        repoBackedRequest: "Repo-backed request",
        adHocWorkspace: "Ad-hoc audit workspace",
        binding: "Lien",
        requestRevision: "Request revision",
        downloadIdentity: "Identite de telechargement",
        downloadsBound:
          "Les telechargements incluent le request id lie et le request revision.",
        downloadsAdHoc: "Les telechargements restent limites au session scope actuel.",
      },
    },
    themeRecovery: {
      topbar: {
        title: "Revue de récupération du thème",
        subtitle: "Workspace operator",
        refresh: "Actualiser",
        openSettings: "Ouvrir Settings",
      },
      hero: {
        eyebrow: "Suivi de session reelle",
        title: "Un endroit pour preparer les checks de native prompt et de recuperation de session reelle",
        detail:
          "Cette route ne pretend pas que le native host prompt ou une session vendor reelle a deja reussi. Elle rassemble l'etat actuel du theme, l'etat de recuperation, les liens rapides et les preuves copiables afin que la prochaine passe operator reste exacte et reproductible.",
        chip: "Theme QA · Suivi de recuperation",
      },
      loading: {
        title: "Chargement de l'etat de revue actuel...",
        detail:
          "Lecture de l'app state actuel et de l'action badge afin que ce workspace reflete le meme theme et le meme etat provider que les surfaces publiees.",
      },
      error: {
        title: "Impossible de charger l'etat de revue",
      },
      currentTruth: {
        eyebrow: "Verite actuelle",
        title: "Etat de recuperation maintenant",
        reviewStage: "Review stage",
        popupSnapshot: "Popup snapshot",
        actionBadge: "Action badge",
      },
      themeState: {
        eyebrow: "Etat du theme",
        title: "Etat runtime partage",
        detail:
          "Ce workspace lit les memes reglages de theme enregistres que le side panel, le popup et l'audit hub. La passe operator doit garder l'etat custom-seed actuel fixe pendant la recuperation du provider access.",
        themeMode: "Theme mode",
        resolvedMode: "Resolved mode",
        accentPreset: "Accent preset",
        customSeed: "Custom seed",
        scopeIsolation: "Scope isolation",
        liveBadgeSource: "Live badge source",
        notSet: "Non defini",
        computedBadgeSource: "Calcule depuis l'app state actuel",
        scopeNote: "Scope note",
        popupSnapshotPrefix: "Popup snapshot",
        actionBadgeTitlePrefix: "Action badge title",
      },
      requestScope: {
        eyebrow: "Portee du request",
        title: "Lien repo-backed request",
        detail:
          "Ce workspace est lie a un pending theme-recovery request. Summary et JSON export doivent conserver cette identite de request afin que completion ne remplisse pas accidentellement un autre request.",
        requestId: "Request id",
        createdAt: "Created at",
        boundWorkspaceRoute: "Route workspace liee",
        adHocTitle: "Ad-hoc workspace",
        adHocDetail:
          "Cette review route n'est actuellement pas liee a un repo-backed request. Ses exports restent utiles pour l'inspection locale, mais ne doivent pas servir a remplir un pending request.",
      },
      workflow: {
        eyebrow: "Operator workflow",
        title: "Etapes de suivi de session reelle",
        detail:
          "Gardez cette page ouverte pendant que vous passez entre Settings, popup et les pages vendor cible. Utilisez les liens ci-dessous pour ouvrir les surfaces publiees exactes dans des onglets separes sans perdre ce workspace.",
        steps: [
          "Garder le custom seed actuel fixe et confirmer que le workspace signale toujours le theme mode, resolved mode, preset et seed attendus.",
          "Utiliser Settings pour ne garder visibles que Cursor et Codex avant de faire confiance au popup alignment et a l'action badge.",
          "Capturer d'abord le degraded state : un host access manquant ou une session reelle bloquee doit garder cette page en warning.",
          "Accorder host access via le native prompt ou restaurer la session vendor reelle ; actualiser ensuite cette page et confirmer que review stage revient a recovered.",
          "Copier le summary ou JSON export apres la passe reelle afin d'attacher le resultat a une archive repo-backed ou une operator note ulterieure.",
        ],
        extensionSurfaces: "Surfaces d'extension",
        vendorSessionPages: "Pages de vendor session",
      },
      links: {
        sidePanel: {
          settings: "Ouvrir Settings",
          dashboard: "Ouvrir dashboard",
          "cursor-detail": "Ouvrir le detail Cursor",
          "codex-detail": "Ouvrir le detail Codex",
          popup: "Ouvrir popup",
        },
        vendor: {
          "cursor-session-page": "Ouvrir la page usage Cursor",
          "codex-session-page": "Ouvrir la page analytics Codex",
        },
      },
      outputs: {
        eyebrow: "Sorties copiables",
        title: "Preuve Summary et JSON",
        detail:
          "Ces sorties restent en lecture seule. Elles refletent exactement l'etat actuel du workspace affiche ci-dessus et peuvent etre copiees apres une passe manuelle extension-mode ou de session reelle.",
        copySummary: "Copier summary",
        downloadSummary: "Telecharger summary",
        copyJson: "Copier JSON",
        downloadJson: "Telecharger JSON",
        openSettingsTab: "Ouvrir Settings dans un nouvel onglet",
        summaryDraft: "Summary draft",
        jsonExport: "JSON export",
        copiedSummary: "Summary actuel de recuperation du theme copie.",
        downloadedSummary: "Summary actuel de recuperation du theme telecharge.",
        copiedJson: "JSON export actuel de recuperation du theme copie.",
        downloadedJson: "JSON export actuel de recuperation du theme telecharge.",
        clipboardUnavailable: "Le clipboard n'est pas disponible dans ce contexte.",
        downloadUnavailable: "Le telechargement direct n'est pas disponible dans ce contexte.",
        workspaceNote: "Note du workspace",
      },
    },
  },
  de: {
    interactionAudit: {
      topbar: {
        title: "Interaktionsaudit",
        subtitle: "QA-Hub im echten Browser",
        openDashboard: "dashboard offnen",
        openSettings: "Settings offnen",
      },
      hero: {
        eyebrow: "Audit-Hub",
        title: "Manuelle Interaktionsprufung ohne wiederholtes Skalieren",
        detail:
          "Diese Seite bettet die wirklich ausgelieferten dashboard-, settings-, provider-detail- und popup-Oberflachen in Frames mit fester Breite ein. Die Prufung im echten Browser kann sich dadurch auf hover, focus, pressed und kompaktes Breitenverhalten konzentrieren, statt Routen wiederholt neu zu offnen. Der Audit-Hub folgt denselben gemeinsamen Theme-Einstellungen wie das ausgelieferte side panel und popup.",
        chip: "Manuelle QA · Frames mit fester Breite",
      },
      guidance: {
        eyebrow: "Verwendung",
        title: "Prufhinweise",
        detail:
          "Offnen Sie diese Route in einem normalen Browser-Tab oder auf einer Erweiterungsseite, wenn nach automatisierten Review-Scripts eine menschliche Prufung gewunscht ist. Die eingebetteten Frames behalten representative Breiten bei, auch wenn das außere Browserfenster großer ist.",
        checks: [
          "Interaktive Controls per hover prufen und bestatigen, dass die state layer seitenubergreifend koharent bleibt.",
          "Mit der Tastatur per tab durch die eingebetteten surfaces gehen und bestatigen, dass focus sichtbar bleibt.",
          "Die preset actions unten nutzen, um disclosures zu offnen, controls zu fokussieren oder tiefere detail notes sichtbar zu machen, bevor ein UI slice signiert wird.",
        ],
        openDashboard: "dashboard offnen",
        openSettings: "Settings offnen",
        openPopup: "popup offnen",
      },
      signoff: {
        eyebrow: "Signoff-Workspace",
        title: "Aktueller operator draft",
        detail:
          "Nutzen Sie die Controls in jeder audit surface, um Check-Fortschritt, reviewer notes und pass- oder follow-up-Status zu erfassen. Der draft unten aktualisiert sich live aus dem aktuellen workspace state.",
        reviewedSurfaces: "Geprufte surfaces",
        pass: "Pass",
        followUp: "Follow-up",
        completedChecks: "Abgeschlossene checks",
        reviewerName: "Reviewer-Name",
        reviewerPlaceholder: "Reviewer- oder operator-Namen erfassen.",
        sessionLabel: "Session-Label",
        sessionPlaceholder: "Diese Prufung benennen, zum Beispiel Compact QA Pass.",
        reviewedAt: "Reviewed at",
        reviewedAtPlaceholder: "ISO-8601-Zeit verwenden oder den aktuellen Review-Zeitpunkt stempeln.",
        stampCurrentTime: "Aktuelle Zeit stempeln",
        reviewSession: "Review session",
        reviewerPrefix: "Reviewer",
        sessionPrefix: "Session",
        reviewedAtPrefix: "Reviewed at",
        notSet: "nicht gesetzt",
        requestBindingPrefix: "Request binding",
        requestRevisionPrefix: "Request revision",
        requestScope: "Request scope",
        boundRequestDetail:
          "Dieser workspace ist an einen repo-backed pending request gebunden. Preflight und completion gegen diesen request ausfuhren, nicht gegen den ad-hoc archive path.",
        adHocDetail:
          "Dieser workspace ist nicht an einen repo-backed request gebunden. Den archive path verwenden, sofern nicht zuerst ein pending request template importiert wird.",
        repoBackedRequest: "Repo-backed request",
        adHocWorkspace: "Ad-hoc audit workspace",
        binding: "Bindung",
        requestRevision: "Request revision",
        downloadIdentity: "Download-Identitat",
        downloadsBound:
          "Downloads enthalten die gebundene request id und request revision.",
        downloadsAdHoc: "Downloads bleiben nur im aktuellen session scope.",
      },
    },
    themeRecovery: {
      topbar: {
        title: "Theme-Recovery-Review",
        subtitle: "Operator workspace",
        refresh: "Aktualisieren",
        openSettings: "Settings offnen",
      },
      hero: {
        eyebrow: "Follow-up fur echte session",
        title: "Ein Ort fur native-prompt- und echte-session-Recovery-Checks",
        detail:
          "Diese Route behauptet nicht, dass native host prompt oder eine echte vendor session bereits bestanden haben. Sie sammelt aktuellen theme state, recovery state, Schnelllinks und kopierbare evidence, damit der nachste operator pass wahrheitsgemaß und wiederholbar bleibt.",
        chip: "Theme QA · Recovery-Follow-up",
      },
      loading: {
        title: "Aktuellen Review-Status laden...",
        detail:
          "Aktuellen app state und action badge lesen, damit dieser workspace denselben theme- und provider-state wie die ausgelieferten surfaces widerspiegelt.",
      },
      error: {
        title: "Review-Status konnte nicht geladen werden",
      },
      currentTruth: {
        eyebrow: "Aktuelle Wahrheit",
        title: "Recovery-Status jetzt",
        reviewStage: "Review stage",
        popupSnapshot: "Popup snapshot",
        actionBadge: "Action badge",
      },
      themeState: {
        eyebrow: "Theme state",
        title: "Gemeinsamer runtime state",
        detail:
          "Dieser workspace liest dieselben gespeicherten Theme-Einstellungen, die side panel, popup und audit hub nutzen. Der operator pass sollte den aktuellen custom-seed state festhalten, wahrend provider access wiederhergestellt wird.",
        themeMode: "Theme mode",
        resolvedMode: "Resolved mode",
        accentPreset: "Accent preset",
        customSeed: "Custom seed",
        scopeIsolation: "Scope isolation",
        liveBadgeSource: "Live badge source",
        notSet: "Nicht gesetzt",
        computedBadgeSource: "Aus aktuellem app state berechnet",
        scopeNote: "Scope note",
        popupSnapshotPrefix: "Popup snapshot",
        actionBadgeTitlePrefix: "Action badge title",
      },
      requestScope: {
        eyebrow: "Request scope",
        title: "Repo-backed request binding",
        detail:
          "Dieser workspace ist an einen pending theme-recovery request gebunden. Summary und JSON export mussen diese request identity bewahren, damit completion nicht versehentlich einen anderen request erfullt.",
        requestId: "Request id",
        createdAt: "Created at",
        boundWorkspaceRoute: "Gebundene workspace route",
        adHocTitle: "Ad-hoc workspace",
        adHocDetail:
          "Diese review route ist aktuell nicht an einen repo-backed request gebunden. Ihre exports sind fur lokale Inspektion nutzlich, sollten aber nicht zur Erfullung eines pending request verwendet werden.",
      },
      workflow: {
        eyebrow: "Operator workflow",
        title: "Follow-up-Schritte fur echte session",
        detail:
          "Diese Seite offen lassen, wahrend zwischen Settings, popup und den Ziel-vendor-Seiten gewechselt wird. Die Links unten offnen die exakten ausgelieferten surfaces in separaten Tabs, ohne diesen workspace zu verlieren.",
        steps: [
          "Den aktuellen custom seed fixieren und bestatigen, dass der workspace weiterhin erwarteten theme mode, resolved mode, preset und seed meldet.",
          "Mit Settings nur Cursor und Codex sichtbar halten, bevor popup alignment und action badge vertraut wird.",
          "Zuerst den degraded state erfassen: fehlender host access oder eine blockierte echte session sollte diese Seite im warning state halten.",
          "Host access uber den native prompt gewahren oder die echte vendor session wiederherstellen; danach diese Seite aktualisieren und bestatigen, dass review stage zu recovered zuruckkehrt.",
          "Nach dem echten pass summary oder JSON export kopieren, damit das Ergebnis spater an ein repo-backed archive oder eine operator note angehangt werden kann.",
        ],
        extensionSurfaces: "Erweiterungs-surfaces",
        vendorSessionPages: "Vendor-session-Seiten",
      },
      links: {
        sidePanel: {
          settings: "Settings offnen",
          dashboard: "dashboard offnen",
          "cursor-detail": "Cursor detail offnen",
          "codex-detail": "Codex detail offnen",
          popup: "popup offnen",
        },
        vendor: {
          "cursor-session-page": "Cursor usage page offnen",
          "codex-session-page": "Codex analytics page offnen",
        },
      },
      outputs: {
        eyebrow: "Kopierbare Ausgaben",
        title: "Summary- und JSON-Evidence",
        detail:
          "Diese Ausgaben bleiben read-only. Sie spiegeln den oben angezeigten aktuellen workspace state exakt wider und konnen nach einem manuellen extension-mode- oder real-session-pass kopiert werden.",
        copySummary: "summary kopieren",
        downloadSummary: "summary herunterladen",
        copyJson: "JSON kopieren",
        downloadJson: "JSON herunterladen",
        openSettingsTab: "Settings in neuem Tab offnen",
        summaryDraft: "Summary draft",
        jsonExport: "JSON export",
        copiedSummary: "Aktuelle theme recovery summary kopiert.",
        downloadedSummary: "Aktuelle theme recovery summary heruntergeladen.",
        copiedJson: "Aktuellen theme recovery JSON export kopiert.",
        downloadedJson: "Aktuellen theme recovery JSON export heruntergeladen.",
        clipboardUnavailable: "Clipboard-Zugriff ist in diesem context nicht verfugbar.",
        downloadUnavailable: "Direkter Download ist in diesem context nicht verfugbar.",
        workspaceNote: "Workspace note",
      },
    },
  },
  it: {
    interactionAudit: {
      topbar: {
        title: "Audit interazioni",
        subtitle: "Hub QA nel browser reale",
        openDashboard: "Apri dashboard",
        openSettings: "Apri Settings",
      },
      hero: {
        eyebrow: "Hub audit",
        title: "Revisione manuale delle interazioni senza ridimensionamenti ripetuti",
        detail:
          "Questa pagina incorpora le superfici realmente pubblicate dashboard, settings, provider detail e popup dentro frame a larghezza fissa. La revisione nel browser reale puo concentrarsi su hover, focus, pressed e comportamento a larghezza compatta invece di riaprire route ripetutamente. L'hub audit segue le stesse preferenze tema condivise del side panel e del popup pubblicati.",
        chip: "QA manuale · Frame a larghezza fissa",
      },
      guidance: {
        eyebrow: "Come usarlo",
        title: "Guida alla revisione",
        detail:
          "Apri questa route in una normale scheda del browser o in una pagina dell'estensione quando vuoi una passata umana dopo gli script di revisione automatizzati. I frame incorporati mantengono larghezze rappresentative anche se la finestra esterna del browser e piu grande.",
        checks: [
          "Passa sui controlli interattivi e conferma che lo state layer resti coerente tra le pagine.",
          "Usa tab da tastiera sulle superfici incorporate e conferma che la visibilita del focus resti esplicita.",
          "Usa le preset actions sotto per aprire disclosure, focalizzare controlli o mostrare detail notes inferiori prima di firmare un UI slice.",
        ],
        openDashboard: "Apri dashboard",
        openSettings: "Apri Settings",
        openPopup: "Apri popup",
      },
      signoff: {
        eyebrow: "Workspace di signoff",
        title: "Bozza operator corrente",
        detail:
          "Usa i controlli dentro ogni superficie audit per registrare avanzamento dei check, reviewer notes e stato pass o follow-up. La bozza sotto si aggiorna live dallo stato corrente del workspace.",
        reviewedSurfaces: "Superfici revisionate",
        pass: "Pass",
        followUp: "Follow-up",
        completedChecks: "Check completati",
        reviewerName: "Nome reviewer",
        reviewerPlaceholder: "Registra il nome del reviewer o operator.",
        sessionLabel: "Etichetta session",
        sessionPlaceholder: "Etichetta questa passata, per esempio Compact QA Pass.",
        reviewedAt: "Reviewed at",
        reviewedAtPlaceholder: "Usa orario ISO-8601 o marca il momento corrente di revisione.",
        stampCurrentTime: "Marca ora corrente",
        reviewSession: "Review session",
        reviewerPrefix: "Reviewer",
        sessionPrefix: "Session",
        reviewedAtPrefix: "Reviewed at",
        notSet: "non impostato",
        requestBindingPrefix: "Request binding",
        requestRevisionPrefix: "Request revision",
        requestScope: "Ambito request",
        boundRequestDetail:
          "Questo workspace e collegato a un pending request repo-backed. Usa preflight e completion su quel request invece dell'ad-hoc archive path.",
        adHocDetail:
          "Questo workspace non e collegato a un repo-backed request. Usa l'archive path a meno che prima venga importato un pending request template.",
        repoBackedRequest: "Repo-backed request",
        adHocWorkspace: "Ad-hoc audit workspace",
        binding: "Collegamento",
        requestRevision: "Request revision",
        downloadIdentity: "Identita download",
        downloadsBound:
          "I download includono il request id collegato e il request revision.",
        downloadsAdHoc: "I download restano solo nel session scope corrente.",
      },
    },
    themeRecovery: {
      topbar: {
        title: "Revisione recupero tema",
        subtitle: "Operator workspace",
        refresh: "Aggiorna",
        openSettings: "Apri Settings",
      },
      hero: {
        eyebrow: "Follow-up di session reale",
        title: "Un posto per preparare check di native prompt e recupero session reale",
        detail:
          "Questa route non sostiene che il native host prompt o una session vendor reale siano gia passati. Raccoglie theme state corrente, recovery state, link rapidi ed evidenza copiabile, cosi la prossima passata operator resta veritiera e ripetibile.",
        chip: "Theme QA · Follow-up recupero",
      },
      loading: {
        title: "Caricamento stato revisione corrente...",
        detail:
          "Lettura dell'app state corrente e dell'action badge per far riflettere a questo workspace lo stesso tema e stato provider delle superfici pubblicate.",
      },
      error: {
        title: "Impossibile caricare lo stato revisione",
      },
      currentTruth: {
        eyebrow: "Verita corrente",
        title: "Stato recupero adesso",
        reviewStage: "Review stage",
        popupSnapshot: "Popup snapshot",
        actionBadge: "Action badge",
      },
      themeState: {
        eyebrow: "Theme state",
        title: "Runtime state condiviso",
        detail:
          "Questo workspace legge le stesse impostazioni tema salvate usate da side panel, popup e audit hub. La passata operator deve mantenere fisso il custom-seed state corrente mentre recupera provider access.",
        themeMode: "Theme mode",
        resolvedMode: "Resolved mode",
        accentPreset: "Accent preset",
        customSeed: "Custom seed",
        scopeIsolation: "Scope isolation",
        liveBadgeSource: "Live badge source",
        notSet: "Non impostato",
        computedBadgeSource: "Calcolato dall'app state corrente",
        scopeNote: "Scope note",
        popupSnapshotPrefix: "Popup snapshot",
        actionBadgeTitlePrefix: "Action badge title",
      },
      requestScope: {
        eyebrow: "Ambito request",
        title: "Collegamento repo-backed request",
        detail:
          "Questo workspace e collegato a un pending theme-recovery request. Summary e JSON export devono preservare questa request identity affinche completion non soddisfi per errore un altro request.",
        requestId: "Request id",
        createdAt: "Created at",
        boundWorkspaceRoute: "Route workspace collegata",
        adHocTitle: "Ad-hoc workspace",
        adHocDetail:
          "Questa review route non e attualmente collegata a un repo-backed request. I suoi export restano utili per ispezione locale, ma non devono essere usati per completare un pending request.",
      },
      workflow: {
        eyebrow: "Operator workflow",
        title: "Passi follow-up di session reale",
        detail:
          "Tieni aperta questa pagina mentre passi tra Settings, popup e le pagine vendor target. Usa i link sotto per aprire le superfici pubblicate esatte in schede separate senza perdere questo workspace.",
        steps: [
          "Mantieni fisso il custom seed corrente e conferma che il workspace riporti ancora theme mode, resolved mode, preset e seed attesi.",
          "Usa Settings per tenere visibili solo Cursor e Codex prima di fidarti di popup alignment e action badge.",
          "Cattura prima il degraded state: host access mancante o session reale bloccata deve mantenere questa pagina in warning.",
          "Concedi host access tramite native prompt o ripristina la session vendor reale; poi aggiorna questa pagina e conferma che review stage torni a recovered.",
          "Copia summary o JSON export dopo la passata reale cosi il risultato puo essere allegato a un repo-backed archive o operator note successivo.",
        ],
        extensionSurfaces: "Superfici estensione",
        vendorSessionPages: "Pagine vendor session",
      },
      links: {
        sidePanel: {
          settings: "Apri Settings",
          dashboard: "Apri dashboard",
          "cursor-detail": "Apri dettaglio Cursor",
          "codex-detail": "Apri dettaglio Codex",
          popup: "Apri popup",
        },
        vendor: {
          "cursor-session-page": "Apri pagina usage Cursor",
          "codex-session-page": "Apri pagina analytics Codex",
        },
      },
      outputs: {
        eyebrow: "Output copiabili",
        title: "Evidenza Summary e JSON",
        detail:
          "Questi output restano in sola lettura. Riflettono esattamente lo stato workspace corrente mostrato sopra e possono essere copiati dopo una passata manuale extension-mode o di session reale.",
        copySummary: "Copia summary",
        downloadSummary: "Scarica summary",
        copyJson: "Copia JSON",
        downloadJson: "Scarica JSON",
        openSettingsTab: "Apri Settings in nuova scheda",
        summaryDraft: "Summary draft",
        jsonExport: "JSON export",
        copiedSummary: "Summary corrente di recupero tema copiato.",
        downloadedSummary: "Summary corrente di recupero tema scaricato.",
        copiedJson: "JSON export corrente di recupero tema copiato.",
        downloadedJson: "JSON export corrente di recupero tema scaricato.",
        clipboardUnavailable: "Clipboard non disponibile in questo context.",
        downloadUnavailable: "Download diretto non disponibile in questo context.",
        workspaceNote: "Nota workspace",
      },
    },
  },
  ru: {
    interactionAudit: {
      topbar: {
        title: "Аудит взаимодействий",
        subtitle: "QA-хаб в реальном браузере",
        openDashboard: "Открыть dashboard",
        openSettings: "Открыть Settings",
      },
      hero: {
        eyebrow: "Хаб аудита",
        title: "Ручная проверка взаимодействий без повторного изменения размера",
        detail:
          "Эта страница встраивает реально поставляемые поверхности dashboard, settings, provider detail и popup во frame фиксированной ширины. Проверка в реальном браузере может сосредоточиться на hover, focus, pressed и поведении в компактной ширине, вместо повторного открытия route. Хаб аудита следует тем же общим настройкам темы, что и поставляемые side panel и popup.",
        chip: "Ручной QA · Frame фиксированной ширины",
      },
      guidance: {
        eyebrow: "Как использовать",
        title: "Инструкции проверки",
        detail:
          "Откройте этот route в обычной вкладке браузера или на странице расширения, когда после автоматизированных review scripts нужна ручная проверка. Встроенные frames сохраняют representative width даже при большем внешнем окне браузера.",
        checks: [
          "Наведите курсор на интерактивные controls и подтвердите, что state layer остается согласованным между страницами.",
          "Пройдите по встроенным surfaces клавишей tab и подтвердите, что focus остается явно видимым.",
          "Используйте preset actions ниже, чтобы открыть disclosures, сфокусировать controls или показать нижние detail notes перед signoff UI slice.",
        ],
        openDashboard: "Открыть dashboard",
        openSettings: "Открыть Settings",
        openPopup: "Открыть popup",
      },
      signoff: {
        eyebrow: "Signoff workspace",
        title: "Текущий operator draft",
        detail:
          "Используйте controls внутри каждой audit surface, чтобы записывать прогресс checks, reviewer notes и состояние pass или follow-up. Draft ниже обновляется live из текущего workspace state.",
        reviewedSurfaces: "Проверенные surfaces",
        pass: "Pass",
        followUp: "Follow-up",
        completedChecks: "Завершенные checks",
        reviewerName: "Имя reviewer",
        reviewerPlaceholder: "Запишите имя reviewer или operator.",
        sessionLabel: "Метка session",
        sessionPlaceholder: "Назовите эту проверку, например Compact QA Pass.",
        reviewedAt: "Reviewed at",
        reviewedAtPlaceholder: "Используйте время ISO-8601 или отметьте текущий момент проверки.",
        stampCurrentTime: "Поставить текущее время",
        reviewSession: "Review session",
        reviewerPrefix: "Reviewer",
        sessionPrefix: "Session",
        reviewedAtPrefix: "Reviewed at",
        notSet: "не задано",
        requestBindingPrefix: "Request binding",
        requestRevisionPrefix: "Request revision",
        requestScope: "Request scope",
        boundRequestDetail:
          "Этот workspace привязан к repo-backed pending request. Выполняйте preflight и completion для этого request, а не для ad-hoc archive path.",
        adHocDetail:
          "Этот workspace не привязан к repo-backed request. Используйте archive path, если pending request template не импортирован заранее.",
        repoBackedRequest: "Repo-backed request",
        adHocWorkspace: "Ad-hoc audit workspace",
        binding: "Привязка",
        requestRevision: "Request revision",
        downloadIdentity: "Идентификатор загрузки",
        downloadsBound:
          "Загрузки включают привязанный request id и request revision.",
        downloadsAdHoc: "Загрузки остаются только в текущем session scope.",
      },
    },
    themeRecovery: {
      topbar: {
        title: "Проверка восстановления темы",
        subtitle: "Operator workspace",
        refresh: "Обновить",
        openSettings: "Открыть Settings",
      },
      hero: {
        eyebrow: "Follow-up реальной session",
        title: "Одно место для native-prompt и real-session recovery checks",
        detail:
          "Этот route не утверждает, что native host prompt или реальная vendor session уже прошли. Он собирает текущий theme state, recovery state, быстрые ссылки и копируемую evidence, чтобы следующий operator pass оставался правдивым и повторяемым.",
        chip: "Theme QA · Recovery follow-up",
      },
      loading: {
        title: "Загрузка текущего состояния review...",
        detail:
          "Чтение текущего app state и action badge, чтобы этот workspace отражал те же theme и provider state, что и поставляемые surfaces.",
      },
      error: {
        title: "Не удалось загрузить состояние review",
      },
      currentTruth: {
        eyebrow: "Текущая правда",
        title: "Состояние recovery сейчас",
        reviewStage: "Review stage",
        popupSnapshot: "Popup snapshot",
        actionBadge: "Action badge",
      },
      themeState: {
        eyebrow: "Theme state",
        title: "Общий runtime state",
        detail:
          "Этот workspace читает те же сохраненные theme settings, которые используют side panel, popup и audit hub. Operator pass должен удерживать текущий custom-seed state фиксированным во время восстановления provider access.",
        themeMode: "Theme mode",
        resolvedMode: "Resolved mode",
        accentPreset: "Accent preset",
        customSeed: "Custom seed",
        scopeIsolation: "Scope isolation",
        liveBadgeSource: "Live badge source",
        notSet: "Не задано",
        computedBadgeSource: "Вычислено из текущего app state",
        scopeNote: "Scope note",
        popupSnapshotPrefix: "Popup snapshot",
        actionBadgeTitlePrefix: "Action badge title",
      },
      requestScope: {
        eyebrow: "Request scope",
        title: "Привязка repo-backed request",
        detail:
          "Этот workspace привязан к pending theme-recovery request. Summary и JSON export должны сохранять эту request identity, чтобы completion случайно не выполнил другой request.",
        requestId: "Request id",
        createdAt: "Created at",
        boundWorkspaceRoute: "Привязанный workspace route",
        adHocTitle: "Ad-hoc workspace",
        adHocDetail:
          "Этот review route сейчас не привязан к repo-backed request. Его exports полезны для локальной проверки, но не должны использоваться для выполнения pending request.",
      },
      workflow: {
        eyebrow: "Operator workflow",
        title: "Шаги follow-up для реальной session",
        detail:
          "Держите эту страницу открытой при переключении между Settings, popup и целевыми vendor pages. Используйте ссылки ниже, чтобы открыть точные поставляемые surfaces в отдельных вкладках, не теряя этот workspace.",
        steps: [
          "Зафиксировать текущий custom seed и подтвердить, что workspace все еще сообщает ожидаемые theme mode, resolved mode, preset и seed.",
          "Использовать Settings, чтобы оставить видимыми только Cursor и Codex перед доверием popup alignment и action badge.",
          "Сначала зафиксировать degraded state: отсутствие host access или заблокированная реальная session должны удерживать страницу в warning state.",
          "Предоставить host access через native prompt или восстановить реальную vendor session; затем обновить страницу и подтвердить, что review stage вернулся в recovered.",
          "Скопировать summary или JSON export после реального pass, чтобы результат можно было приложить к последующему repo-backed archive или operator note.",
        ],
        extensionSurfaces: "Surfaces расширения",
        vendorSessionPages: "Страницы vendor session",
      },
      links: {
        sidePanel: {
          settings: "Открыть Settings",
          dashboard: "Открыть dashboard",
          "cursor-detail": "Открыть detail Cursor",
          "codex-detail": "Открыть detail Codex",
          popup: "Открыть popup",
        },
        vendor: {
          "cursor-session-page": "Открыть страницу usage Cursor",
          "codex-session-page": "Открыть страницу analytics Codex",
        },
      },
      outputs: {
        eyebrow: "Копируемые выходные данные",
        title: "Summary и JSON evidence",
        detail:
          "Эти outputs остаются read-only. Они точно отражают текущий workspace state, показанный выше, и могут быть скопированы после ручного extension-mode или real-session pass.",
        copySummary: "Копировать summary",
        downloadSummary: "Скачать summary",
        copyJson: "Копировать JSON",
        downloadJson: "Скачать JSON",
        openSettingsTab: "Открыть Settings в новой вкладке",
        summaryDraft: "Summary draft",
        jsonExport: "JSON export",
        copiedSummary: "Текущий theme recovery summary скопирован.",
        downloadedSummary: "Текущий theme recovery summary скачан.",
        copiedJson: "Текущий theme recovery JSON export скопирован.",
        downloadedJson: "Текущий theme recovery JSON export скачан.",
        clipboardUnavailable: "Clipboard недоступен в этом context.",
        downloadUnavailable: "Прямая загрузка недоступна в этом context.",
        workspaceNote: "Workspace note",
      },
    },
  },
  ar: {
    interactionAudit: {
      topbar: {
        title: "تدقيق التفاعل",
        subtitle: "مركز QA في متصفح حقيقي",
        openDashboard: "فتح dashboard",
        openSettings: "فتح الإعدادات",
      },
      hero: {
        eyebrow: "مركز التدقيق",
        title: "مراجعة تفاعل يدوية من دون تكرار تغيير الحجم",
        detail:
          "تضع هذه الصفحة أسطح dashboard وsettings وprovider detail وpopup المنشورة فعليا داخل frames ثابتة العرض. بذلك يمكن لمراجعة المتصفح الحقيقي التركيز على hover وfocus وpressed وسلوك العرض المدمج بدلا من إعادة فتح routes مرارا. يتبع مركز التدقيق تفضيلات theme المشتركة نفسها في side panel وpopup المنشورين.",
        chip: "QA يدوي · frames ثابتة العرض",
      },
      guidance: {
        eyebrow: "طريقة الاستخدام",
        title: "إرشادات المراجعة",
        detail:
          "افتح هذه route في تبويب متصفح عادي أو صفحة extension عندما تحتاج إلى مرور بشري بعد scripts المراجعة الآلية. تحافظ frames المضمنة على عروض تمثيلية حتى عندما تكون نافذة المتصفح الخارجية أكبر.",
        checks: [
          "مرر فوق عناصر التحكم التفاعلية وتأكد من بقاء state layer متماسكة عبر الصفحات.",
          "استخدم tab من لوحة المفاتيح عبر الأسطح المضمنة وتأكد من أن focus يبقى واضحا.",
          "استخدم preset actions أدناه لفتح disclosures أو تركيز controls أو إظهار detail notes أعمق قبل signoff على UI slice.",
        ],
        openDashboard: "فتح dashboard",
        openSettings: "فتح الإعدادات",
        openPopup: "فتح popup",
      },
      signoff: {
        eyebrow: "Workspace التوقيع",
        title: "مسودة operator الحالية",
        detail:
          "استخدم عناصر التحكم داخل كل audit surface لتسجيل تقدم checks وreviewer notes وحالة pass أو follow-up. تتحدث المسودة أدناه مباشرة من workspace state الحالي.",
        reviewedSurfaces: "الأسطح التي تمت مراجعتها",
        pass: "نجح",
        followUp: "متابعة",
        completedChecks: "Checks مكتملة",
        reviewerName: "اسم Reviewer",
        reviewerPlaceholder: "سجل اسم reviewer أو operator.",
        sessionLabel: "تسمية Session",
        sessionPlaceholder: "ضع تسمية لهذه الجولة، مثل Compact QA Pass.",
        reviewedAt: "وقت المراجعة",
        reviewedAtPlaceholder: "استخدم وقت ISO-8601 أو اختم لحظة المراجعة الحالية.",
        stampCurrentTime: "ختم الوقت الحالي",
        reviewSession: "Review session",
        reviewerPrefix: "Reviewer",
        sessionPrefix: "Session",
        reviewedAtPrefix: "Reviewed at",
        notSet: "غير محدد",
        requestBindingPrefix: "Request binding",
        requestRevisionPrefix: "Request revision",
        requestScope: "نطاق request",
        boundRequestDetail:
          "هذا workspace مرتبط بطلب pending repo-backed واحد. استخدم preflight وcompletion لذلك request بدلا من ad-hoc archive path.",
        adHocDetail:
          "هذا workspace غير مرتبط ب repo-backed request. استخدم archive path ما لم يتم استيراد pending request template أولا.",
        repoBackedRequest: "Repo-backed request",
        adHocWorkspace: "Ad-hoc audit workspace",
        binding: "الارتباط",
        requestRevision: "Request revision",
        downloadIdentity: "هوية التنزيل",
        downloadsBound: "تتضمن التنزيلات request id وrequest revision المرتبطين.",
        downloadsAdHoc: "تبقى التنزيلات ضمن session scope الحالي فقط.",
      },
    },
    themeRecovery: {
      topbar: {
        title: "مراجعة استعادة theme",
        subtitle: "Operator workspace",
        refresh: "تحديث",
        openSettings: "فتح الإعدادات",
      },
      hero: {
        eyebrow: "متابعة session حقيقية",
        title: "مكان واحد لتحضير فحوص native prompt واستعادة session حقيقية",
        detail:
          "لا تدعي هذه route أن native host prompt أو vendor session حقيقية قد نجحت بالفعل. إنها تجمع theme state الحالي وrecovery state والروابط السريعة والأدلة القابلة للنسخ كي تبقى جولة operator التالية صادقة وقابلة للتكرار.",
        chip: "Theme QA · متابعة الاستعادة",
      },
      loading: {
        title: "جار تحميل حالة المراجعة الحالية...",
        detail:
          "تتم قراءة app state الحالي وaction badge كي يعكس هذا workspace theme وprovider state نفسيهما كما في الأسطح المنشورة.",
      },
      error: {
        title: "تعذر تحميل حالة المراجعة",
      },
      currentTruth: {
        eyebrow: "الحقيقة الحالية",
        title: "حالة الاستعادة الآن",
        reviewStage: "Review stage",
        popupSnapshot: "Popup snapshot",
        actionBadge: "Action badge",
      },
      themeState: {
        eyebrow: "Theme state",
        title: "Runtime state مشترك",
        detail:
          "يقرأ هذا workspace إعدادات theme المحفوظة نفسها التي يستخدمها side panel وpopup وaudit hub. يجب أن تبقي جولة operator حالة custom-seed الحالية ثابتة أثناء استعادة provider access.",
        themeMode: "Theme mode",
        resolvedMode: "Resolved mode",
        accentPreset: "Accent preset",
        customSeed: "Custom seed",
        scopeIsolation: "Scope isolation",
        liveBadgeSource: "Live badge source",
        notSet: "غير محدد",
        computedBadgeSource: "محسوب من app state الحالي",
        scopeNote: "Scope note",
        popupSnapshotPrefix: "Popup snapshot",
        actionBadgeTitlePrefix: "Action badge title",
      },
      requestScope: {
        eyebrow: "نطاق request",
        title: "ارتباط repo-backed request",
        detail:
          "هذا workspace مرتبط ب pending theme-recovery request واحد. يجب أن يحافظ Summary وJSON export على request identity هذه حتى لا ينفذ completion طلبا مختلفا بالخطأ.",
        requestId: "Request id",
        createdAt: "Created at",
        boundWorkspaceRoute: "Workspace route المرتبطة",
        adHocTitle: "Ad-hoc workspace",
        adHocDetail:
          "هذه review route غير مرتبطة حاليا ب repo-backed request. تبقى exports مفيدة للفحص المحلي، لكنها لا يجب أن تستخدم لإنجاز pending request.",
      },
      workflow: {
        eyebrow: "Operator workflow",
        title: "خطوات متابعة session حقيقية",
        detail:
          "اترك هذه الصفحة مفتوحة أثناء التنقل بين Settings وpopup وصفحات vendor الهدف. استخدم الروابط أدناه لفتح الأسطح المنشورة الدقيقة في تبويبات منفصلة من دون فقدان هذا workspace.",
        steps: [
          "ثبّت custom seed الحالي وتأكد من أن workspace لا يزال يبلغ theme mode وresolved mode وpreset وseed المتوقعة.",
          "استخدم Settings لإبقاء Cursor وCodex فقط مرئيين قبل الثقة في popup alignment وaction badge.",
          "التقط degraded state أولا: نقص host access أو session حقيقية محجوبة يجب أن يبقي هذه الصفحة في حالة warning.",
          "امنح host access عبر native prompt أو استعد vendor session الحقيقية؛ ثم حدث هذه الصفحة وتأكد من عودة review stage إلى recovered.",
          "انسخ summary أو JSON export بعد الجولة الحقيقية كي يمكن إرفاق النتيجة لاحقا ب repo-backed archive أو operator note.",
        ],
        extensionSurfaces: "أسطح extension",
        vendorSessionPages: "صفحات vendor session",
      },
      links: {
        sidePanel: {
          settings: "فتح الإعدادات",
          dashboard: "فتح dashboard",
          "cursor-detail": "فتح تفاصيل Cursor",
          "codex-detail": "فتح تفاصيل Codex",
          popup: "فتح popup",
        },
        vendor: {
          "cursor-session-page": "فتح صفحة Cursor usage",
          "codex-session-page": "فتح صفحة Codex analytics",
        },
      },
      outputs: {
        eyebrow: "مخرجات قابلة للنسخ",
        title: "أدلة Summary وJSON",
        detail:
          "تبقى هذه المخرجات للقراءة فقط. إنها تعكس workspace state الحالي كما يظهر أعلاه ويمكن نسخها بعد مرور extension-mode يدوي أو session حقيقية.",
        copySummary: "نسخ summary",
        downloadSummary: "تنزيل summary",
        copyJson: "نسخ JSON",
        downloadJson: "تنزيل JSON",
        openSettingsTab: "فتح الإعدادات في تبويب جديد",
        summaryDraft: "Summary draft",
        jsonExport: "JSON export",
        copiedSummary: "تم نسخ summary استعادة theme الحالي.",
        downloadedSummary: "تم تنزيل summary استعادة theme الحالي.",
        copiedJson: "تم نسخ JSON export لاستعادة theme الحالية.",
        downloadedJson: "تم تنزيل JSON export لاستعادة theme الحالية.",
        clipboardUnavailable: "الوصول إلى clipboard غير متاح في هذا context.",
        downloadUnavailable: "التنزيل المباشر غير متاح في هذا context.",
        workspaceNote: "Workspace note",
      },
    },
  },
  hi: {
    interactionAudit: {
      topbar: {
        title: "इंटरैक्शन audit",
        subtitle: "Real-browser QA hub",
        openDashboard: "dashboard खोलें",
        openSettings: "Settings खोलें",
      },
      hero: {
        eyebrow: "Audit hub",
        title: "बार-बार resize किए बिना manual interaction review",
        detail:
          "यह page वास्तविक shipped dashboard, settings, provider detail और popup surfaces को fixed-width frames में embed करता है। इससे real-browser review route दोबारा खोलने के बजाय hover, focus, pressed और compact-width behavior पर ध्यान दे सकता है। audit hub वही shared theme preferences follow करता है जो shipped side panel और popup करते हैं।",
        chip: "Manual QA · Fixed-width frames",
      },
      guidance: {
        eyebrow: "कैसे उपयोग करें",
        title: "Review guidance",
        detail:
          "जब automated review scripts के बाद human pass चाहिए, तो इस route को सामान्य browser tab या extension page में खोलें। outer browser window बड़ी होने पर भी embedded frames representative widths बनाए रखते हैं।",
        checks: [
          "interactive controls पर hover करें और confirm करें कि state layer pages के बीच coherent रहती है।",
          "embedded surfaces में keyboard tab focus का उपयोग करें और confirm करें कि focus visibility explicit रहती है।",
          "UI slice sign off करने से पहले disclosures खोलने, controls focus करने, या lower detail notes दिखाने के लिए नीचे preset actions उपयोग करें।",
        ],
        openDashboard: "dashboard खोलें",
        openSettings: "Settings खोलें",
        openPopup: "popup खोलें",
      },
      signoff: {
        eyebrow: "Signoff workspace",
        title: "Current operator draft",
        detail:
          "हर audit surface के controls से check progress, reviewer notes और pass या follow-up state record करें। नीचे draft current workspace state से live update होता है।",
        reviewedSurfaces: "Reviewed surfaces",
        pass: "Pass",
        followUp: "Follow-up",
        completedChecks: "Completed checks",
        reviewerName: "Reviewer name",
        reviewerPlaceholder: "reviewer या operator name record करें।",
        sessionLabel: "Session label",
        sessionPlaceholder: "इस pass को label करें, जैसे Compact QA Pass.",
        reviewedAt: "Reviewed at",
        reviewedAtPlaceholder: "ISO-8601 time उपयोग करें या current review moment stamp करें।",
        stampCurrentTime: "Current time stamp करें",
        reviewSession: "Review session",
        reviewerPrefix: "Reviewer",
        sessionPrefix: "Session",
        reviewedAtPrefix: "Reviewed at",
        notSet: "set नहीं",
        requestBindingPrefix: "Request binding",
        requestRevisionPrefix: "Request revision",
        requestScope: "Request scope",
        boundRequestDetail:
          "यह workspace एक repo-backed pending request से bound है। ad-hoc archive path के बजाय उसी request पर preflight और completion चलाएं।",
        adHocDetail:
          "यह workspace repo-backed request से bound नहीं है। जब तक pending request template पहले import न हो, archive path उपयोग करें।",
        repoBackedRequest: "Repo-backed request",
        adHocWorkspace: "Ad-hoc audit workspace",
        binding: "Binding",
        requestRevision: "Request revision",
        downloadIdentity: "Download identity",
        downloadsBound: "Downloads में bound request id और request revision शामिल होते हैं।",
        downloadsAdHoc: "Downloads केवल current session scope में रहते हैं।",
      },
    },
    themeRecovery: {
      topbar: {
        title: "Theme recovery समीक्षा",
        subtitle: "Operator workspace",
        refresh: "Refresh",
        openSettings: "Settings खोलें",
      },
      hero: {
        eyebrow: "Real-session follow-up",
        title: "native prompt और real-session recovery checks stage करने की एक जगह",
        detail:
          "यह route दावा नहीं करता कि native host prompt या real vendor session पहले ही pass हो गया है। यह current theme state, recovery state, quick links और copyable evidence collect करता है ताकि अगला operator pass truthful और repeatable रहे।",
        chip: "Theme QA · Recovery follow-up",
      },
      loading: {
        title: "Current review state load हो रहा है...",
        detail:
          "current app state और action badge पढ़े जा रहे हैं ताकि यह workspace shipped surfaces जैसा ही theme और provider state reflect कर सके।",
      },
      error: {
        title: "Review state load नहीं हो सका",
      },
      currentTruth: {
        eyebrow: "Current truth",
        title: "अभी recovery status",
        reviewStage: "Review stage",
        popupSnapshot: "Popup snapshot",
        actionBadge: "Action badge",
      },
      themeState: {
        eyebrow: "Theme state",
        title: "Shared runtime state",
        detail:
          "यह workspace वही saved theme settings पढ़ता है जिन्हें side panel, popup और audit hub उपयोग करते हैं। operator pass को provider access recover करते समय current custom-seed state fixed रखना चाहिए।",
        themeMode: "Theme mode",
        resolvedMode: "Resolved mode",
        accentPreset: "Accent preset",
        customSeed: "Custom seed",
        scopeIsolation: "Scope isolation",
        liveBadgeSource: "Live badge source",
        notSet: "Set नहीं",
        computedBadgeSource: "current app state से computed",
        scopeNote: "Scope note",
        popupSnapshotPrefix: "Popup snapshot",
        actionBadgeTitlePrefix: "Action badge title",
      },
      requestScope: {
        eyebrow: "Request scope",
        title: "Repo-backed request binding",
        detail:
          "यह workspace एक pending theme-recovery request से bound है। Summary और JSON export को यह request identity preserve करनी चाहिए ताकि completion गलती से किसी दूसरे request को fulfill न करे।",
        requestId: "Request id",
        createdAt: "Created at",
        boundWorkspaceRoute: "Bound workspace route",
        adHocTitle: "Ad-hoc workspace",
        adHocDetail:
          "यह review route अभी repo-backed request से bound नहीं है। इसके exports local inspection के लिए उपयोगी हैं, लेकिन pending request fulfill करने के लिए उपयोग नहीं होने चाहिए।",
      },
      workflow: {
        eyebrow: "Operator workflow",
        title: "Real-session follow-up steps",
        detail:
          "Settings, popup और target vendor pages के बीच switch करते समय यह page open रखें। नीचे links exact shipped surfaces को अलग tabs में खोलते हैं, current workspace खोए बिना।",
        steps: [
          "current custom seed fixed रखें और confirm करें कि workspace expected theme mode, resolved mode, preset और seed report करता है।",
          "popup alignment और action badge पर भरोसा करने से पहले Settings में केवल Cursor और Codex visible रखें।",
          "पहले degraded state capture करें: missing host access या blocked real session इस page को warning state में रखना चाहिए।",
          "native prompt से host access grant करें या real vendor session restore करें; फिर इस page को refresh करें और confirm करें कि review stage recovered पर लौटता है।",
          "real pass के बाद summary या JSON export copy करें ताकि result बाद के repo-backed archive या operator note में attach हो सके।",
        ],
        extensionSurfaces: "Extension surfaces",
        vendorSessionPages: "Vendor session pages",
      },
      links: {
        sidePanel: {
          settings: "Settings खोलें",
          dashboard: "dashboard खोलें",
          "cursor-detail": "Cursor detail खोलें",
          "codex-detail": "Codex detail खोलें",
          popup: "popup खोलें",
        },
        vendor: {
          "cursor-session-page": "Cursor usage page खोलें",
          "codex-session-page": "Codex analytics page खोलें",
        },
      },
      outputs: {
        eyebrow: "Copyable outputs",
        title: "Summary और JSON evidence",
        detail:
          "ये outputs read-only रहते हैं। ये ऊपर दिखाए गए current workspace state को ठीक से reflect करते हैं और manual extension-mode या real-session pass के बाद copy किए जा सकते हैं।",
        copySummary: "summary copy करें",
        downloadSummary: "summary download करें",
        copyJson: "JSON copy करें",
        downloadJson: "JSON download करें",
        openSettingsTab: "Settings नए tab में खोलें",
        summaryDraft: "Summary draft",
        jsonExport: "JSON export",
        copiedSummary: "current theme recovery summary copy हो गया।",
        downloadedSummary: "current theme recovery summary download हो गया।",
        copiedJson: "current theme recovery JSON export copy हो गया।",
        downloadedJson: "current theme recovery JSON export download हो गया।",
        clipboardUnavailable: "इस context में clipboard access available नहीं है।",
        downloadUnavailable: "इस context में direct download available नहीं है।",
        workspaceNote: "Workspace note",
      },
    },
  },
  id: {
    interactionAudit: {
      topbar: {
        title: "Audit interaksi",
        subtitle: "Hub QA browser nyata",
        openDashboard: "Buka dashboard",
        openSettings: "Buka Settings",
      },
      hero: {
        eyebrow: "Hub audit",
        title: "Review interaksi manual tanpa resize berulang",
        detail:
          "Halaman ini menanamkan surface dashboard, settings, provider detail, dan popup yang benar-benar dikirim dalam frame lebar tetap. Review browser nyata bisa fokus pada hover, focus, pressed, dan perilaku lebar compact, bukan membuka ulang route berkali-kali. Hub audit mengikuti preferensi theme bersama yang sama dengan side panel dan popup yang dikirim.",
        chip: "QA manual · Frame lebar tetap",
      },
      guidance: {
        eyebrow: "Cara pakai",
        title: "Panduan review",
        detail:
          "Buka route ini di tab browser normal atau halaman extension saat Anda ingin pass manusia setelah script review otomatis. Frame tertanam tetap mempertahankan lebar representatif walau jendela browser luar lebih besar.",
        checks: [
          "Hover kontrol interaktif dan pastikan state layer tetap koheren di seluruh halaman.",
          "Gunakan keyboard tab focus di surface tertanam dan pastikan visibilitas focus tetap jelas.",
          "Gunakan preset actions di bawah untuk membuka disclosure, memfokuskan kontrol, atau menampilkan detail note yang lebih rendah sebelum sign off UI slice.",
        ],
        openDashboard: "Buka dashboard",
        openSettings: "Buka Settings",
        openPopup: "Buka popup",
      },
      signoff: {
        eyebrow: "Workspace signoff",
        title: "Draft operator saat ini",
        detail:
          "Gunakan kontrol di dalam setiap audit surface untuk mencatat progress check, reviewer notes, dan status pass atau follow-up. Draft di bawah diperbarui live dari workspace state saat ini.",
        reviewedSurfaces: "Surface yang direview",
        pass: "Pass",
        followUp: "Follow-up",
        completedChecks: "Check selesai",
        reviewerName: "Nama reviewer",
        reviewerPlaceholder: "Catat nama reviewer atau operator.",
        sessionLabel: "Label session",
        sessionPlaceholder: "Beri label pass ini, misalnya Compact QA Pass.",
        reviewedAt: "Reviewed at",
        reviewedAtPlaceholder: "Gunakan waktu ISO-8601 atau stamp momen review saat ini.",
        stampCurrentTime: "Stamp waktu saat ini",
        reviewSession: "Review session",
        reviewerPrefix: "Reviewer",
        sessionPrefix: "Session",
        reviewedAtPrefix: "Reviewed at",
        notSet: "belum diset",
        requestBindingPrefix: "Request binding",
        requestRevisionPrefix: "Request revision",
        requestScope: "Request scope",
        boundRequestDetail:
          "Workspace ini terikat ke satu pending request repo-backed. Gunakan preflight dan completion terhadap request itu, bukan ad-hoc archive path.",
        adHocDetail:
          "Workspace ini tidak terikat ke repo-backed request. Gunakan archive path kecuali pending request template diimpor lebih dulu.",
        repoBackedRequest: "Repo-backed request",
        adHocWorkspace: "Ad-hoc audit workspace",
        binding: "Binding",
        requestRevision: "Request revision",
        downloadIdentity: "Identitas download",
        downloadsBound:
          "Download menyertakan request id dan request revision yang terikat.",
        downloadsAdHoc: "Download hanya tetap dalam session scope saat ini.",
      },
    },
    themeRecovery: {
      topbar: {
        title: "Review pemulihan theme",
        subtitle: "Operator workspace",
        refresh: "Refresh",
        openSettings: "Buka Settings",
      },
      hero: {
        eyebrow: "Follow-up session nyata",
        title: "Satu tempat untuk menyiapkan check native prompt dan pemulihan session nyata",
        detail:
          "Route ini tidak mengklaim bahwa native host prompt atau session vendor nyata sudah lulus. Route ini mengumpulkan theme state saat ini, recovery state, quick link, dan evidence yang bisa disalin agar pass operator berikutnya tetap jujur dan dapat diulang.",
        chip: "Theme QA · Follow-up pemulihan",
      },
      loading: {
        title: "Memuat status review saat ini...",
        detail:
          "Membaca app state dan action badge saat ini agar workspace ini mencerminkan theme dan provider state yang sama dengan surface yang dikirim.",
      },
      error: {
        title: "Tidak dapat memuat status review",
      },
      currentTruth: {
        eyebrow: "Truth saat ini",
        title: "Status pemulihan saat ini",
        reviewStage: "Review stage",
        popupSnapshot: "Popup snapshot",
        actionBadge: "Action badge",
      },
      themeState: {
        eyebrow: "Theme state",
        title: "Shared runtime state",
        detail:
          "Workspace ini membaca pengaturan theme tersimpan yang sama dengan side panel, popup, dan audit hub. Pass operator harus menjaga custom-seed state saat ini tetap fixed saat memulihkan provider access.",
        themeMode: "Theme mode",
        resolvedMode: "Resolved mode",
        accentPreset: "Accent preset",
        customSeed: "Custom seed",
        scopeIsolation: "Scope isolation",
        liveBadgeSource: "Live badge source",
        notSet: "Belum diset",
        computedBadgeSource: "Dihitung dari app state saat ini",
        scopeNote: "Scope note",
        popupSnapshotPrefix: "Popup snapshot",
        actionBadgeTitlePrefix: "Action badge title",
      },
      requestScope: {
        eyebrow: "Request scope",
        title: "Binding repo-backed request",
        detail:
          "Workspace ini terikat ke satu pending theme-recovery request. Summary dan JSON export harus mempertahankan request identity ini agar completion tidak tanpa sengaja memenuhi request lain.",
        requestId: "Request id",
        createdAt: "Created at",
        boundWorkspaceRoute: "Workspace route terikat",
        adHocTitle: "Ad-hoc workspace",
        adHocDetail:
          "Review route ini saat ini tidak terikat ke repo-backed request. Export-nya tetap berguna untuk inspeksi lokal, tetapi tidak boleh digunakan untuk memenuhi pending request.",
      },
      workflow: {
        eyebrow: "Operator workflow",
        title: "Langkah follow-up session nyata",
        detail:
          "Biarkan halaman ini terbuka saat berpindah antara Settings, popup, dan halaman vendor target. Gunakan link di bawah untuk membuka surface yang dikirim secara tepat di tab terpisah tanpa kehilangan workspace ini.",
        steps: [
          "Pertahankan custom seed saat ini dan pastikan workspace masih melaporkan theme mode, resolved mode, preset, dan seed yang diharapkan.",
          "Gunakan Settings untuk menjaga hanya Cursor dan Codex yang terlihat sebelum mempercayai popup alignment dan action badge.",
          "Tangkap degraded state lebih dulu: host access yang hilang atau session nyata yang terblokir harus membuat halaman ini tetap dalam warning state.",
          "Berikan host access melalui native prompt atau pulihkan session vendor nyata; lalu refresh halaman ini dan pastikan review stage kembali ke recovered.",
          "Salin summary atau JSON export setelah pass nyata agar hasilnya bisa dilampirkan ke repo-backed archive atau operator note berikutnya.",
        ],
        extensionSurfaces: "Surface extension",
        vendorSessionPages: "Halaman vendor session",
      },
      links: {
        sidePanel: {
          settings: "Buka Settings",
          dashboard: "Buka dashboard",
          "cursor-detail": "Buka detail Cursor",
          "codex-detail": "Buka detail Codex",
          popup: "Buka popup",
        },
        vendor: {
          "cursor-session-page": "Buka halaman usage Cursor",
          "codex-session-page": "Buka halaman analytics Codex",
        },
      },
      outputs: {
        eyebrow: "Output yang bisa disalin",
        title: "Evidence Summary dan JSON",
        detail:
          "Output ini tetap read-only. Output mencerminkan workspace state saat ini persis seperti yang ditampilkan di atas dan bisa disalin setelah pass manual extension-mode atau session nyata.",
        copySummary: "Salin summary",
        downloadSummary: "Download summary",
        copyJson: "Salin JSON",
        downloadJson: "Download JSON",
        openSettingsTab: "Buka Settings di tab baru",
        summaryDraft: "Summary draft",
        jsonExport: "JSON export",
        copiedSummary: "Summary theme recovery saat ini disalin.",
        downloadedSummary: "Summary theme recovery saat ini didownload.",
        copiedJson: "JSON export theme recovery saat ini disalin.",
        downloadedJson: "JSON export theme recovery saat ini didownload.",
        clipboardUnavailable: "Akses clipboard tidak tersedia dalam context ini.",
        downloadUnavailable: "Download langsung tidak tersedia dalam context ini.",
        workspaceNote: "Workspace note",
      },
    },
  },
};

export function buildOperatorWorkspaceLocalizedCopy(i18n: RuntimeI18n) {
  const copy = OPERATOR_WORKSPACE_COPY[i18n.resolvedLocale];

  return {
    ...copy,
    interactionAudit: {
      ...copy.interactionAudit,
      reviewQueue: INTERACTION_AUDIT_REVIEW_QUEUE_COPY[i18n.resolvedLocale],
      surfaceCard: INTERACTION_AUDIT_SURFACE_CARD_COPY[i18n.resolvedLocale],
      workspaceControls:
        INTERACTION_AUDIT_WORKSPACE_CONTROLS_COPY[i18n.resolvedLocale],
      requestScopeCommands:
        INTERACTION_AUDIT_REQUEST_SCOPE_COMMANDS_COPY[i18n.resolvedLocale],
      handoffSummary:
        INTERACTION_AUDIT_HANDOFF_SUMMARY_COPY[i18n.resolvedLocale],
      frameResults:
        INTERACTION_AUDIT_FRAME_RESULTS_COPY[i18n.resolvedLocale],
    },
  };
}
