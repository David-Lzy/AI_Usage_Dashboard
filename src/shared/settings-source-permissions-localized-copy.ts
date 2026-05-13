import type {
  ProviderSourceKind,
  ProviderSourcePreference,
} from "../providers/types";
import type { ResolvedAppLocale, RuntimeI18n } from "./i18n";

type SettingsSourcePermissionLocalizedLocale = Exclude<
  ResolvedAppLocale,
  "en" | "zh-CN"
>;

export type SettingsSourceAndPermissionCopyText = {
  sources: {
    preferenceLabel: string;
    operationalNoteLabel: string;
    sessionPageTrackLabel: string;
    sessionPageNoteLabel: string;
    findOrOpenPage: string;
    useActivePage: string;
    extensionModeOnly: string;
    disconnectBinding: string;
    detailedDiagnostics: string;
    compactFields: {
      currentSetup: string;
      setupStatus: string;
      pageStatus: string;
      pageRoute: string;
    };
    compactCurrentSetup: {
      sessionPage: string;
      savedConnection: string;
      policyOnly: string;
    };
    itemCount: (countLabel: string) => string;
    routeFallback: string;
    sourcePreferenceLabels: Record<ProviderSourcePreference, string>;
    sourceKindLabels: Record<ProviderSourceKind, string>;
    cardLabels: {
      primary: {
        accessModel: string;
        availabilitySummary: string;
        fallback: string;
        noneFallback: string;
        route: string;
        availability: string;
        graduationGate: string;
        selectionReason: string;
        fallbackReason: string;
        selectionDiagnostic: string;
        selectionDiagnosticSummary: string;
        fallbackDiagnostic: string;
        fallbackDiagnosticSummary: string;
        diagnostic: string;
        diagnosticSummary: string;
        readinessDetail: string;
        fidelityDetail: string;
        usedValue: string;
        remainingValue: string;
        resetValue: string;
        credentialPersistence: string;
        cookieStorage: string;
        manualCookieImport: string;
        hostAccess: string;
        pageBinding: string;
        bindingMode: string;
        bindingDetail: string;
      };
      groups: {
        sourceDecision: string;
        valueSemantics: string;
        trustBoundary: string;
      };
      notes: {
        graduationGatePrefix: string;
      };
    };
  };
  permissions: {
    noHostAccessRequired: string;
    hostAccessGranted: string;
    hostAccessMissing: string;
    noActionNeeded: string;
    removeAccess: string;
    requestAccess: string;
  };
};

export const SETTINGS_SOURCE_PERMISSIONS_COPY: Record<
  SettingsSourcePermissionLocalizedLocale,
  SettingsSourceAndPermissionCopyText
> = {
  "zh-TW": {
    sources: {
      preferenceLabel: "偏好",
      operationalNoteLabel: "你需要知道",
      sessionPageTrackLabel: "Session-page 軌道",
      sessionPageNoteLabel: "Session-page 說明",
      findOrOpenPage: "尋找或打開頁面",
      useActivePage: "使用目前頁面",
      extensionModeOnly: "僅 extension 模式",
      disconnectBinding: "中斷綁定",
      detailedDiagnostics: "詳細診斷",
      compactFields: {
        currentSetup: "目前設定",
        setupStatus: "狀態",
        pageStatus: "頁面狀態",
        pageRoute: "頁面入口",
      },
      compactCurrentSetup: {
        sessionPage: "已登入 usage page",
        savedConnection: "已存 team / API 設定",
        policyOnly: "僅文件化 policy",
      },
      itemCount: (count) => `${count} 項`,
      routeFallback: "從 provider settings 打開",
      sourcePreferenceLabels: {
        auto: "自動",
        official_api: "官方 API",
        session_page: "Session page",
      },
      sourceKindLabels: {
        official_api: "官方 API",
        session_page: "Session page",
        policy_only: "僅 policy",
      },
      cardLabels: {
        primary: {
          accessModel: "存取模型",
          availabilitySummary: "可用性摘要",
          fallback: "回退",
          noneFallback: "無",
          route: "Route",
          availability: "可用性",
          graduationGate: "Graduation gate",
          selectionReason: "選擇原因",
          fallbackReason: "回退原因",
          selectionDiagnostic: "選擇診斷",
          selectionDiagnosticSummary: "選擇摘要",
          fallbackDiagnostic: "回退診斷",
          fallbackDiagnosticSummary: "回退摘要",
          diagnostic: "診斷",
          diagnosticSummary: "診斷摘要",
          readinessDetail: "就緒詳情",
          fidelityDetail: "保真度詳情",
          usedValue: "已用值",
          remainingValue: "剩餘值",
          resetValue: "重置值",
          credentialPersistence: "credential 持久化",
          cookieStorage: "Cookie 儲存",
          manualCookieImport: "手動 Cookie 匯入",
          hostAccess: "Host access",
          pageBinding: "頁面綁定",
          bindingMode: "綁定模式",
          bindingDetail: "綁定詳情",
        },
        groups: {
          sourceDecision: "來源決策",
          valueSemantics: "值語義",
          trustBoundary: "信任邊界",
        },
        notes: {
          graduationGatePrefix: "Graduation gate: ",
        },
      },
    },
    permissions: {
      noHostAccessRequired: "不需要 host access",
      hostAccessGranted: "Host access 已授權",
      hostAccessMissing: "缺少 host access",
      noActionNeeded: "不需要操作",
      removeAccess: "移除授權",
      requestAccess: "請求授權",
    },
  },
  ja: {
    sources: {
      preferenceLabel: "優先設定",
      operationalNoteLabel: "知っておくこと",
      sessionPageTrackLabel: "Session-page トラック",
      sessionPageNoteLabel: "Session-page メモ",
      findOrOpenPage: "ページを探す/開く",
      useActivePage: "現在のページを使う",
      extensionModeOnly: "Extension mode のみ",
      disconnectBinding: "紐付けを解除",
      detailedDiagnostics: "詳細診断",
      compactFields: {
        currentSetup: "現在の設定",
        setupStatus: "状態",
        pageStatus: "ページ状態",
        pageRoute: "ページルート",
      },
      compactCurrentSetup: {
        sessionPage: "サインイン済み usage page",
        savedConnection: "保存済み team / API config",
        policyOnly: "文書化 policy のみ",
      },
      itemCount: (count) => `${count} 件`,
      routeFallback: "provider settings から開く",
      sourcePreferenceLabels: {
        auto: "自動",
        official_api: "公式 API",
        session_page: "Session page",
      },
      sourceKindLabels: {
        official_api: "公式 API",
        session_page: "Session page",
        policy_only: "Policy のみ",
      },
      cardLabels: {
        primary: {
          accessModel: "アクセスモデル",
          availabilitySummary: "利用可否の要約",
          fallback: "フォールバック",
          noneFallback: "なし",
          route: "ルート",
          availability: "利用可否",
          graduationGate: "移行ゲート",
          selectionReason: "選択理由",
          fallbackReason: "フォールバック理由",
          selectionDiagnostic: "選択診断",
          selectionDiagnosticSummary: "選択要約",
          fallbackDiagnostic: "フォールバック診断",
          fallbackDiagnosticSummary: "フォールバック要約",
          diagnostic: "診断",
          diagnosticSummary: "診断要約",
          readinessDetail: "準備状況の詳細",
          fidelityDetail: "精度の詳細",
          usedValue: "使用量",
          remainingValue: "残量",
          resetValue: "リセット値",
          credentialPersistence: "credential の永続化",
          cookieStorage: "Cookie 保存",
          manualCookieImport: "手動 Cookie インポート",
          hostAccess: "Host access",
          pageBinding: "ページ紐付け",
          bindingMode: "紐付けモード",
          bindingDetail: "紐付け詳細",
        },
        groups: {
          sourceDecision: "ソース判定",
          valueSemantics: "値の意味",
          trustBoundary: "信頼境界",
        },
        notes: {
          graduationGatePrefix: "移行ゲート: ",
        },
      },
    },
    permissions: {
      noHostAccessRequired: "host access は不要",
      hostAccessGranted: "Host access 付与済み",
      hostAccessMissing: "host access が不足",
      noActionNeeded: "操作は不要",
      removeAccess: "アクセスを削除",
      requestAccess: "アクセスを要求",
    },
  },
  ko: {
    sources: {
      preferenceLabel: "선호도",
      operationalNoteLabel: "알아둘 점",
      sessionPageTrackLabel: "Session-page 트랙",
      sessionPageNoteLabel: "Session-page 참고",
      findOrOpenPage: "페이지 찾기 또는 열기",
      useActivePage: "현재 페이지 사용",
      extensionModeOnly: "Extension mode 전용",
      disconnectBinding: "바인딩 해제",
      detailedDiagnostics: "상세 진단",
      compactFields: {
        currentSetup: "현재 설정",
        setupStatus: "상태",
        pageStatus: "페이지 상태",
        pageRoute: "페이지 경로",
      },
      compactCurrentSetup: {
        sessionPage: "로그인된 usage page",
        savedConnection: "저장된 team / API config",
        policyOnly: "문서화된 policy 전용",
      },
      itemCount: (count) => `${count}개 항목`,
      routeFallback: "provider settings에서 열기",
      sourcePreferenceLabels: {
        auto: "자동",
        official_api: "공식 API",
        session_page: "Session page",
      },
      sourceKindLabels: {
        official_api: "공식 API",
        session_page: "Session page",
        policy_only: "Policy 전용",
      },
      cardLabels: {
        primary: {
          accessModel: "접근 모델",
          availabilitySummary: "사용 가능성 요약",
          fallback: "대체 경로",
          noneFallback: "없음",
          route: "경로",
          availability: "사용 가능성",
          graduationGate: "승격 조건",
          selectionReason: "선택 이유",
          fallbackReason: "대체 이유",
          selectionDiagnostic: "선택 진단",
          selectionDiagnosticSummary: "선택 요약",
          fallbackDiagnostic: "대체 진단",
          fallbackDiagnosticSummary: "대체 요약",
          diagnostic: "진단",
          diagnosticSummary: "진단 요약",
          readinessDetail: "준비 상태 상세",
          fidelityDetail: "정확도 상세",
          usedValue: "사용 값",
          remainingValue: "남은 값",
          resetValue: "리셋 값",
          credentialPersistence: "credential 지속성",
          cookieStorage: "Cookie 저장",
          manualCookieImport: "수동 Cookie 가져오기",
          hostAccess: "Host access",
          pageBinding: "페이지 바인딩",
          bindingMode: "바인딩 모드",
          bindingDetail: "바인딩 상세",
        },
        groups: {
          sourceDecision: "소스 결정",
          valueSemantics: "값 의미",
          trustBoundary: "신뢰 경계",
        },
        notes: {
          graduationGatePrefix: "승격 조건: ",
        },
      },
    },
    permissions: {
      noHostAccessRequired: "host access 필요 없음",
      hostAccessGranted: "Host access 허용됨",
      hostAccessMissing: "host access 없음",
      noActionNeeded: "필요한 작업 없음",
      removeAccess: "접근 권한 제거",
      requestAccess: "접근 권한 요청",
    },
  },
  "es-419": {
    sources: {
      preferenceLabel: "Preferencia",
      operationalNoteLabel: "Que saber",
      sessionPageTrackLabel: "Ruta session-page",
      sessionPageNoteLabel: "Nota session-page",
      findOrOpenPage: "Buscar o abrir pagina",
      useActivePage: "Usar pagina actual",
      extensionModeOnly: "Solo extension mode",
      disconnectBinding: "Desconectar enlace",
      detailedDiagnostics: "Diagnosticos detallados",
      compactFields: {
        currentSetup: "Configuracion actual",
        setupStatus: "Estado",
        pageStatus: "Estado de pagina",
        pageRoute: "Ruta de pagina",
      },
      compactCurrentSetup: {
        sessionPage: "Usage page con sesion iniciada",
        savedConnection: "Config team / API guardada",
        policyOnly: "Solo policy documentada",
      },
      itemCount: (count) => `${count} elementos`,
      routeFallback: "Abrir desde provider settings",
      sourcePreferenceLabels: {
        auto: "Automatico",
        official_api: "API oficial",
        session_page: "Session page",
      },
      sourceKindLabels: {
        official_api: "API oficial",
        session_page: "Session page",
        policy_only: "Solo policy",
      },
      cardLabels: {
        primary: {
          accessModel: "Modelo de acceso",
          availabilitySummary: "Resumen de disponibilidad",
          fallback: "Reserva",
          noneFallback: "Ninguna",
          route: "Ruta",
          availability: "Disponibilidad",
          graduationGate: "Condicion de graduacion",
          selectionReason: "Razon de seleccion",
          fallbackReason: "Razon de reserva",
          selectionDiagnostic: "Diagnostico de seleccion",
          selectionDiagnosticSummary: "Resumen de seleccion",
          fallbackDiagnostic: "Diagnostico de reserva",
          fallbackDiagnosticSummary: "Resumen de reserva",
          diagnostic: "Diagnostico",
          diagnosticSummary: "Resumen diagnostico",
          readinessDetail: "Detalle de preparacion",
          fidelityDetail: "Detalle de fidelidad",
          usedValue: "Valor usado",
          remainingValue: "Valor restante",
          resetValue: "Valor de reinicio",
          credentialPersistence: "Persistencia de credential",
          cookieStorage: "Almacenamiento de Cookie",
          manualCookieImport: "Importacion manual de Cookie",
          hostAccess: "Host access",
          pageBinding: "Enlace de pagina",
          bindingMode: "Modo de enlace",
          bindingDetail: "Detalle de enlace",
        },
        groups: {
          sourceDecision: "Decision de fuente",
          valueSemantics: "Semantica de valores",
          trustBoundary: "Limite de confianza",
        },
        notes: {
          graduationGatePrefix: "Condicion de graduacion: ",
        },
      },
    },
    permissions: {
      noHostAccessRequired: "No requiere host access",
      hostAccessGranted: "Host access concedido",
      hostAccessMissing: "Falta host access",
      noActionNeeded: "No requiere accion",
      removeAccess: "Quitar acceso",
      requestAccess: "Solicitar acceso",
    },
  },
  "pt-BR": {
    sources: {
      preferenceLabel: "Preferencia",
      operationalNoteLabel: "O que saber",
      sessionPageTrackLabel: "Trilha session-page",
      sessionPageNoteLabel: "Nota session-page",
      findOrOpenPage: "Encontrar ou abrir pagina",
      useActivePage: "Usar pagina atual",
      extensionModeOnly: "Somente extension mode",
      disconnectBinding: "Desconectar vinculacao",
      detailedDiagnostics: "Diagnosticos detalhados",
      compactFields: {
        currentSetup: "Configuracao atual",
        setupStatus: "Status",
        pageStatus: "Status da pagina",
        pageRoute: "Rota da pagina",
      },
      compactCurrentSetup: {
        sessionPage: "Usage page logada",
        savedConnection: "Config team / API salva",
        policyOnly: "Somente policy documentada",
      },
      itemCount: (count) => `${count} itens`,
      routeFallback: "Abrir a partir de provider settings",
      sourcePreferenceLabels: {
        auto: "Automatico",
        official_api: "API oficial",
        session_page: "Session page",
      },
      sourceKindLabels: {
        official_api: "API oficial",
        session_page: "Session page",
        policy_only: "Somente policy",
      },
      cardLabels: {
        primary: {
          accessModel: "Modelo de acesso",
          availabilitySummary: "Resumo de disponibilidade",
          fallback: "Fallback",
          noneFallback: "Nenhum",
          route: "Rota",
          availability: "Disponibilidade",
          graduationGate: "Gate de graduacao",
          selectionReason: "Motivo da selecao",
          fallbackReason: "Motivo do fallback",
          selectionDiagnostic: "Diagnostico da selecao",
          selectionDiagnosticSummary: "Resumo da selecao",
          fallbackDiagnostic: "Diagnostico do fallback",
          fallbackDiagnosticSummary: "Resumo do fallback",
          diagnostic: "Diagnostico",
          diagnosticSummary: "Resumo diagnostico",
          readinessDetail: "Detalhe de prontidao",
          fidelityDetail: "Detalhe de fidelidade",
          usedValue: "Valor usado",
          remainingValue: "Valor restante",
          resetValue: "Valor de reset",
          credentialPersistence: "Persistencia de credential",
          cookieStorage: "Armazenamento de Cookie",
          manualCookieImport: "Importacao manual de Cookie",
          hostAccess: "Host access",
          pageBinding: "Vinculacao de pagina",
          bindingMode: "Modo de vinculacao",
          bindingDetail: "Detalhe da vinculacao",
        },
        groups: {
          sourceDecision: "Decisao de fonte",
          valueSemantics: "Semantica de valores",
          trustBoundary: "Limite de confianca",
        },
        notes: {
          graduationGatePrefix: "Gate de graduacao: ",
        },
      },
    },
    permissions: {
      noHostAccessRequired: "Host access nao requerido",
      hostAccessGranted: "Host access concedido",
      hostAccessMissing: "Host access ausente",
      noActionNeeded: "Nenhuma acao necessaria",
      removeAccess: "Remover acesso",
      requestAccess: "Solicitar acesso",
    },
  },
  fr: {
    sources: {
      preferenceLabel: "Préférence",
      operationalNoteLabel: "A savoir",
      sessionPageTrackLabel: "Parcours session-page",
      sessionPageNoteLabel: "Note session-page",
      findOrOpenPage: "Trouver ou ouvrir la page",
      useActivePage: "Utiliser la page actuelle",
      extensionModeOnly: "Extension mode uniquement",
      disconnectBinding: "Deconnecter le lien",
      detailedDiagnostics: "Diagnostics detailles",
      compactFields: {
        currentSetup: "Configuration actuelle",
        setupStatus: "Etat",
        pageStatus: "Etat de la page",
        pageRoute: "Route de page",
      },
      compactCurrentSetup: {
        sessionPage: "Usage page connectee",
        savedConnection: "Config team / API enregistree",
        policyOnly: "Policy documentee uniquement",
      },
      itemCount: (count) => `${count} elements`,
      routeFallback: "Ouvrir depuis provider settings",
      sourcePreferenceLabels: {
        auto: "Automatique",
        official_api: "API officielle",
        session_page: "Session page",
      },
      sourceKindLabels: {
        official_api: "API officielle",
        session_page: "Session page",
        policy_only: "Policy uniquement",
      },
      cardLabels: {
        primary: {
          accessModel: "Modele d'acces",
          availabilitySummary: "Resume de disponibilite",
          fallback: "Repli",
          noneFallback: "Aucun",
          route: "Route",
          availability: "Disponibilite",
          graduationGate: "Gate de graduation",
          selectionReason: "Raison de selection",
          fallbackReason: "Raison de repli",
          selectionDiagnostic: "Diagnostic de selection",
          selectionDiagnosticSummary: "Resume de selection",
          fallbackDiagnostic: "Diagnostic de repli",
          fallbackDiagnosticSummary: "Resume de repli",
          diagnostic: "Diagnostic",
          diagnosticSummary: "Resume diagnostic",
          readinessDetail: "Detail de preparation",
          fidelityDetail: "Detail de fidelite",
          usedValue: "Valeur utilisee",
          remainingValue: "Valeur restante",
          resetValue: "Valeur de reset",
          credentialPersistence: "Persistance du credential",
          cookieStorage: "Stockage Cookie",
          manualCookieImport: "Import manuel de Cookie",
          hostAccess: "Host access",
          pageBinding: "Lien de page",
          bindingMode: "Mode de lien",
          bindingDetail: "Detail du lien",
        },
        groups: {
          sourceDecision: "Decision de source",
          valueSemantics: "Semantique des valeurs",
          trustBoundary: "Limite de confiance",
        },
        notes: {
          graduationGatePrefix: "Gate de graduation: ",
        },
      },
    },
    permissions: {
      noHostAccessRequired: "Aucun host access requis",
      hostAccessGranted: "Host access accorde",
      hostAccessMissing: "Host access manquant",
      noActionNeeded: "Aucune action requise",
      removeAccess: "Retirer l'acces",
      requestAccess: "Demander l'acces",
    },
  },
  de: {
    sources: {
      preferenceLabel: "Praferenz",
      operationalNoteLabel: "Wichtig",
      sessionPageTrackLabel: "Session-page Pfad",
      sessionPageNoteLabel: "Session-page Hinweis",
      findOrOpenPage: "Seite finden oder offnen",
      useActivePage: "Aktuelle Seite verwenden",
      extensionModeOnly: "Nur extension mode",
      disconnectBinding: "Bindung trennen",
      detailedDiagnostics: "Detaillierte Diagnosen",
      compactFields: {
        currentSetup: "Aktuelle Einrichtung",
        setupStatus: "Status",
        pageStatus: "Seitenstatus",
        pageRoute: "Seitenroute",
      },
      compactCurrentSetup: {
        sessionPage: "Angemeldete usage page",
        savedConnection: "Gespeicherte team / API config",
        policyOnly: "Nur dokumentierte policy",
      },
      itemCount: (count) => `${count} Elemente`,
      routeFallback: "Aus provider settings offnen",
      sourcePreferenceLabels: {
        auto: "Automatisch",
        official_api: "Offizielle API",
        session_page: "Session page",
      },
      sourceKindLabels: {
        official_api: "Offizielle API",
        session_page: "Session page",
        policy_only: "Nur policy",
      },
      cardLabels: {
        primary: {
          accessModel: "Zugriffsmodell",
          availabilitySummary: "Verfugbarkeitsubersicht",
          fallback: "Fallback",
          noneFallback: "Keiner",
          route: "Route",
          availability: "Verfugbarkeit",
          graduationGate: "Graduation gate",
          selectionReason: "Auswahlgrund",
          fallbackReason: "Fallback-Grund",
          selectionDiagnostic: "Auswahldiagnose",
          selectionDiagnosticSummary: "Auswahlubersicht",
          fallbackDiagnostic: "Fallback-Diagnose",
          fallbackDiagnosticSummary: "Fallback-Ubersicht",
          diagnostic: "Diagnose",
          diagnosticSummary: "Diagnoseubersicht",
          readinessDetail: "Bereitschaftsdetail",
          fidelityDetail: "Fidelity-Detail",
          usedValue: "Genutzter Wert",
          remainingValue: "Restwert",
          resetValue: "Reset-Wert",
          credentialPersistence: "Credential-Persistenz",
          cookieStorage: "Cookie-Speicher",
          manualCookieImport: "Manueller Cookie-Import",
          hostAccess: "Host access",
          pageBinding: "Seitenbindung",
          bindingMode: "Bindungsmodus",
          bindingDetail: "Bindungsdetail",
        },
        groups: {
          sourceDecision: "Quellenentscheidung",
          valueSemantics: "Wertsemantik",
          trustBoundary: "Vertrauensgrenze",
        },
        notes: {
          graduationGatePrefix: "Graduation gate: ",
        },
      },
    },
    permissions: {
      noHostAccessRequired: "Kein host access erforderlich",
      hostAccessGranted: "Host access gewahrt",
      hostAccessMissing: "Host access fehlt",
      noActionNeeded: "Keine Aktion erforderlich",
      removeAccess: "Zugriff entfernen",
      requestAccess: "Zugriff anfordern",
    },
  },
  it: {
    sources: {
      preferenceLabel: "Preferenza",
      operationalNoteLabel: "Da sapere",
      sessionPageTrackLabel: "Percorso session-page",
      sessionPageNoteLabel: "Nota session-page",
      findOrOpenPage: "Trova o apri pagina",
      useActivePage: "Usa pagina corrente",
      extensionModeOnly: "Solo extension mode",
      disconnectBinding: "Disconnetti binding",
      detailedDiagnostics: "Diagnostica dettagliata",
      compactFields: {
        currentSetup: "Configurazione attuale",
        setupStatus: "Stato",
        pageStatus: "Stato pagina",
        pageRoute: "Route pagina",
      },
      compactCurrentSetup: {
        sessionPage: "Usage page con sessione attiva",
        savedConnection: "Config team / API salvata",
        policyOnly: "Solo policy documentata",
      },
      itemCount: (count) => `${count} elementi`,
      routeFallback: "Apri da provider settings",
      sourcePreferenceLabels: {
        auto: "Automatico",
        official_api: "API ufficiale",
        session_page: "Session page",
      },
      sourceKindLabels: {
        official_api: "API ufficiale",
        session_page: "Session page",
        policy_only: "Solo policy",
      },
      cardLabels: {
        primary: {
          accessModel: "Modello di accesso",
          availabilitySummary: "Riepilogo disponibilita",
          fallback: "Fallback",
          noneFallback: "Nessuno",
          route: "Route",
          availability: "Disponibilita",
          graduationGate: "Gate di graduazione",
          selectionReason: "Motivo selezione",
          fallbackReason: "Motivo fallback",
          selectionDiagnostic: "Diagnostica selezione",
          selectionDiagnosticSummary: "Riepilogo selezione",
          fallbackDiagnostic: "Diagnostica fallback",
          fallbackDiagnosticSummary: "Riepilogo fallback",
          diagnostic: "Diagnostica",
          diagnosticSummary: "Riepilogo diagnostica",
          readinessDetail: "Dettaglio prontezza",
          fidelityDetail: "Dettaglio fedelta",
          usedValue: "Valore usato",
          remainingValue: "Valore restante",
          resetValue: "Valore reset",
          credentialPersistence: "Persistenza credential",
          cookieStorage: "Archiviazione Cookie",
          manualCookieImport: "Import manuale Cookie",
          hostAccess: "Host access",
          pageBinding: "Binding pagina",
          bindingMode: "Modalita binding",
          bindingDetail: "Dettaglio binding",
        },
        groups: {
          sourceDecision: "Decisione sorgente",
          valueSemantics: "Semantica valori",
          trustBoundary: "Confine di fiducia",
        },
        notes: {
          graduationGatePrefix: "Gate di graduazione: ",
        },
      },
    },
    permissions: {
      noHostAccessRequired: "Host access non richiesto",
      hostAccessGranted: "Host access concesso",
      hostAccessMissing: "Host access mancante",
      noActionNeeded: "Nessuna azione richiesta",
      removeAccess: "Rimuovi accesso",
      requestAccess: "Richiedi accesso",
    },
  },
  ru: {
    sources: {
      preferenceLabel: "Предпочтение",
      operationalNoteLabel: "Что важно знать",
      sessionPageTrackLabel: "Маршрут session-page",
      sessionPageNoteLabel: "Примечание session-page",
      findOrOpenPage: "Найти или открыть страницу",
      useActivePage: "Использовать текущую страницу",
      extensionModeOnly: "Только extension mode",
      disconnectBinding: "Отключить привязку",
      detailedDiagnostics: "Подробная диагностика",
      compactFields: {
        currentSetup: "Текущая настройка",
        setupStatus: "Статус",
        pageStatus: "Статус страницы",
        pageRoute: "Маршрут страницы",
      },
      compactCurrentSetup: {
        sessionPage: "Usage page с активным входом",
        savedConnection: "Сохраненная team / API config",
        policyOnly: "Только документированная policy",
      },
      itemCount: (count) => `${count} элементов`,
      routeFallback: "Открыть из provider settings",
      sourcePreferenceLabels: {
        auto: "Авто",
        official_api: "Официальный API",
        session_page: "Session page",
      },
      sourceKindLabels: {
        official_api: "Официальный API",
        session_page: "Session page",
        policy_only: "Только policy",
      },
      cardLabels: {
        primary: {
          accessModel: "Модель доступа",
          availabilitySummary: "Сводка доступности",
          fallback: "Резервный путь",
          noneFallback: "Нет",
          route: "Маршрут",
          availability: "Доступность",
          graduationGate: "Условие выпуска",
          selectionReason: "Причина выбора",
          fallbackReason: "Причина резерва",
          selectionDiagnostic: "Диагностика выбора",
          selectionDiagnosticSummary: "Сводка выбора",
          fallbackDiagnostic: "Диагностика резерва",
          fallbackDiagnosticSummary: "Сводка резерва",
          diagnostic: "Диагностика",
          diagnosticSummary: "Сводка диагностики",
          readinessDetail: "Детали готовности",
          fidelityDetail: "Детали точности",
          usedValue: "Использованное значение",
          remainingValue: "Оставшееся значение",
          resetValue: "Значение сброса",
          credentialPersistence: "Хранение credential",
          cookieStorage: "Хранение Cookie",
          manualCookieImport: "Ручной импорт Cookie",
          hostAccess: "Host access",
          pageBinding: "Привязка страницы",
          bindingMode: "Режим привязки",
          bindingDetail: "Детали привязки",
        },
        groups: {
          sourceDecision: "Решение источника",
          valueSemantics: "Семантика значений",
          trustBoundary: "Граница доверия",
        },
        notes: {
          graduationGatePrefix: "Условие выпуска: ",
        },
      },
    },
    permissions: {
      noHostAccessRequired: "Host access не требуется",
      hostAccessGranted: "Host access предоставлен",
      hostAccessMissing: "Host access отсутствует",
      noActionNeeded: "Действие не требуется",
      removeAccess: "Удалить доступ",
      requestAccess: "Запросить доступ",
    },
  },
  ar: {
    sources: {
      preferenceLabel: "التفضيل",
      operationalNoteLabel: "ما يجب معرفته",
      sessionPageTrackLabel: "مسار session-page",
      sessionPageNoteLabel: "ملاحظة session-page",
      findOrOpenPage: "العثور على الصفحة أو فتحها",
      useActivePage: "استخدام الصفحة الحالية",
      extensionModeOnly: "وضع extension فقط",
      disconnectBinding: "قطع ربط الصفحة",
      detailedDiagnostics: "تشخيصات مفصلة",
      compactFields: {
        currentSetup: "الإعداد الحالي",
        setupStatus: "الحالة",
        pageStatus: "حالة الصفحة",
        pageRoute: "مسار الصفحة",
      },
      compactCurrentSetup: {
        sessionPage: "صفحة استخدام مسجل دخولها",
        savedConnection: "إعداد team / API محفوظ",
        policyOnly: "سياسة موثقة فقط",
      },
      itemCount: (count) => `${count} عناصر`,
      routeFallback: "افتح من provider settings",
      sourcePreferenceLabels: {
        auto: "تلقائي",
        official_api: "API رسمي",
        session_page: "Session page",
      },
      sourceKindLabels: {
        official_api: "API رسمي",
        session_page: "Session page",
        policy_only: "سياسة فقط",
      },
      cardLabels: {
        primary: {
          accessModel: "نموذج الوصول",
          availabilitySummary: "ملخص التوفر",
          fallback: "مسار احتياطي",
          noneFallback: "لا يوجد",
          route: "المسار",
          availability: "التوفر",
          graduationGate: "شرط الترقية",
          selectionReason: "سبب الاختيار",
          fallbackReason: "سبب الاحتياط",
          selectionDiagnostic: "تشخيص الاختيار",
          selectionDiagnosticSummary: "ملخص الاختيار",
          fallbackDiagnostic: "تشخيص الاحتياط",
          fallbackDiagnosticSummary: "ملخص الاحتياط",
          diagnostic: "تشخيص",
          diagnosticSummary: "ملخص التشخيص",
          readinessDetail: "تفاصيل الجاهزية",
          fidelityDetail: "تفاصيل الدقة",
          usedValue: "القيمة المستخدمة",
          remainingValue: "القيمة المتبقية",
          resetValue: "قيمة إعادة الضبط",
          credentialPersistence: "استمرارية credential",
          cookieStorage: "تخزين Cookie",
          manualCookieImport: "استيراد Cookie يدويا",
          hostAccess: "Host access",
          pageBinding: "ربط الصفحة",
          bindingMode: "وضع الربط",
          bindingDetail: "تفاصيل الربط",
        },
        groups: {
          sourceDecision: "قرار المصدر",
          valueSemantics: "دلالة القيم",
          trustBoundary: "حد الثقة",
        },
        notes: {
          graduationGatePrefix: "شرط الترقية: ",
        },
      },
    },
    permissions: {
      noHostAccessRequired: "لا حاجة إلى host access",
      hostAccessGranted: "تم منح Host access",
      hostAccessMissing: "host access مفقود",
      noActionNeeded: "لا حاجة إلى إجراء",
      removeAccess: "إزالة الوصول",
      requestAccess: "طلب الوصول",
    },
  },
  hi: {
    sources: {
      preferenceLabel: "प्राथमिकता",
      operationalNoteLabel: "जानने योग्य",
      sessionPageTrackLabel: "Session-page ट्रैक",
      sessionPageNoteLabel: "Session-page नोट",
      findOrOpenPage: "पेज खोजें या खोलें",
      useActivePage: "मौजूदा पेज इस्तेमाल करें",
      extensionModeOnly: "सिर्फ extension mode",
      disconnectBinding: "बाइंडिंग हटाएं",
      detailedDiagnostics: "विस्तृत diagnostics",
      compactFields: {
        currentSetup: "मौजूदा सेटअप",
        setupStatus: "स्थिति",
        pageStatus: "पेज स्थिति",
        pageRoute: "पेज route",
      },
      compactCurrentSetup: {
        sessionPage: "साइन-इन usage page",
        savedConnection: "सहेजी गई team / API config",
        policyOnly: "सिर्फ documented policy",
      },
      itemCount: (count) => `${count} आइटम`,
      routeFallback: "provider settings से खोलें",
      sourcePreferenceLabels: {
        auto: "ऑटो",
        official_api: "Official API",
        session_page: "Session page",
      },
      sourceKindLabels: {
        official_api: "Official API",
        session_page: "Session page",
        policy_only: "सिर्फ policy",
      },
      cardLabels: {
        primary: {
          accessModel: "Access model",
          availabilitySummary: "उपलब्धता सारांश",
          fallback: "Fallback",
          noneFallback: "कोई नहीं",
          route: "Route",
          availability: "उपलब्धता",
          graduationGate: "Graduation gate",
          selectionReason: "चयन कारण",
          fallbackReason: "Fallback कारण",
          selectionDiagnostic: "चयन diagnostic",
          selectionDiagnosticSummary: "चयन सारांश",
          fallbackDiagnostic: "Fallback diagnostic",
          fallbackDiagnosticSummary: "Fallback सारांश",
          diagnostic: "Diagnostic",
          diagnosticSummary: "Diagnostic सारांश",
          readinessDetail: "तैयारी विवरण",
          fidelityDetail: "Fidelity विवरण",
          usedValue: "इस्तेमाल मूल्य",
          remainingValue: "शेष मूल्य",
          resetValue: "Reset मूल्य",
          credentialPersistence: "credential persistence",
          cookieStorage: "Cookie storage",
          manualCookieImport: "Manual Cookie import",
          hostAccess: "Host access",
          pageBinding: "पेज binding",
          bindingMode: "Binding mode",
          bindingDetail: "Binding विवरण",
        },
        groups: {
          sourceDecision: "Source निर्णय",
          valueSemantics: "Value semantics",
          trustBoundary: "Trust boundary",
        },
        notes: {
          graduationGatePrefix: "Graduation gate: ",
        },
      },
    },
    permissions: {
      noHostAccessRequired: "host access जरूरी नहीं",
      hostAccessGranted: "Host access दिया गया",
      hostAccessMissing: "host access गायब",
      noActionNeeded: "कार्रवाई जरूरी नहीं",
      removeAccess: "Access हटाएं",
      requestAccess: "Access मांगें",
    },
  },
  id: {
    sources: {
      preferenceLabel: "Preferensi",
      operationalNoteLabel: "Yang perlu diketahui",
      sessionPageTrackLabel: "Jalur session-page",
      sessionPageNoteLabel: "Catatan session-page",
      findOrOpenPage: "Cari atau buka halaman",
      useActivePage: "Gunakan halaman saat ini",
      extensionModeOnly: "Hanya extension mode",
      disconnectBinding: "Putuskan binding",
      detailedDiagnostics: "Diagnostik detail",
      compactFields: {
        currentSetup: "Setup saat ini",
        setupStatus: "Status",
        pageStatus: "Status halaman",
        pageRoute: "Route halaman",
      },
      compactCurrentSetup: {
        sessionPage: "Usage page sudah login",
        savedConnection: "Config team / API tersimpan",
        policyOnly: "Hanya policy terdokumentasi",
      },
      itemCount: (count) => `${count} item`,
      routeFallback: "Buka dari provider settings",
      sourcePreferenceLabels: {
        auto: "Otomatis",
        official_api: "API resmi",
        session_page: "Session page",
      },
      sourceKindLabels: {
        official_api: "API resmi",
        session_page: "Session page",
        policy_only: "Hanya policy",
      },
      cardLabels: {
        primary: {
          accessModel: "Model akses",
          availabilitySummary: "Ringkasan ketersediaan",
          fallback: "Fallback",
          noneFallback: "Tidak ada",
          route: "Route",
          availability: "Ketersediaan",
          graduationGate: "Graduation gate",
          selectionReason: "Alasan pemilihan",
          fallbackReason: "Alasan fallback",
          selectionDiagnostic: "Diagnostik pemilihan",
          selectionDiagnosticSummary: "Ringkasan pemilihan",
          fallbackDiagnostic: "Diagnostik fallback",
          fallbackDiagnosticSummary: "Ringkasan fallback",
          diagnostic: "Diagnostik",
          diagnosticSummary: "Ringkasan diagnostik",
          readinessDetail: "Detail kesiapan",
          fidelityDetail: "Detail fidelity",
          usedValue: "Nilai terpakai",
          remainingValue: "Nilai tersisa",
          resetValue: "Nilai reset",
          credentialPersistence: "Persistensi credential",
          cookieStorage: "Penyimpanan Cookie",
          manualCookieImport: "Import Cookie manual",
          hostAccess: "Host access",
          pageBinding: "Binding halaman",
          bindingMode: "Mode binding",
          bindingDetail: "Detail binding",
        },
        groups: {
          sourceDecision: "Keputusan sumber",
          valueSemantics: "Semantik nilai",
          trustBoundary: "Batas kepercayaan",
        },
        notes: {
          graduationGatePrefix: "Graduation gate: ",
        },
      },
    },
    permissions: {
      noHostAccessRequired: "Host access tidak diperlukan",
      hostAccessGranted: "Host access diberikan",
      hostAccessMissing: "Host access belum ada",
      noActionNeeded: "Tidak perlu tindakan",
      removeAccess: "Hapus akses",
      requestAccess: "Minta akses",
    },
  },
};

export function getSettingsSourcePermissionsCopy(
  locale: ResolvedAppLocale,
): SettingsSourceAndPermissionCopyText | null {
  if (locale === "en" || locale === "zh-CN") {
    return null;
  }

  return SETTINGS_SOURCE_PERMISSIONS_COPY[locale];
}

export function buildLocalizedSettingsSourcePermissionsSections(
  i18n: RuntimeI18n,
  copy: SettingsSourceAndPermissionCopyText,
) {
  return {
    sources: {
      ...copy.sources,
      itemCount: (count: number) =>
        copy.sources.itemCount(i18n.formatNumber(count)),
    },
    permissions: copy.permissions,
  } as const;
}
