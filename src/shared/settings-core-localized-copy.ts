import type { SettingsUserLevel } from "../providers/types";
import type { ResolvedAppLocale, RuntimeI18n } from "./i18n";

type SettingsCoreLocalizedLocale = Exclude<ResolvedAppLocale, "en" | "zh-CN">;

export type SettingsCoreCopyText = {
  layout: {
    sectionsAria: string;
    sections: {
      overview: string;
      quickSetup: string;
      appearance: string;
      advanced: string;
    };
    overview: {
      aria: string;
      eyebrow: string;
      title: string;
      detail: string;
    };
    summary: {
      enabled: string;
      connected: string;
      needsAction: string;
      storedSecrets: string;
      boundPages: string;
    };
    userLevel: {
      label: string;
      helpText: string;
      options: Record<SettingsUserLevel, string>;
    };
    advanced: {
      eyebrow: string;
      title: string;
      detail: string;
      show: string;
      hide: string;
      itemCount: (countLabel: string) => string;
    };
  };
  quickSetup: {
    eyebrow: string;
    title: string;
    detail: string;
    currentSetupLabel: string;
    nextStepLabel: string;
    visibilityLabel: string;
    pageStatusLabel: string;
    noActionNeeded: string;
    disabledProvidersSummary: (countLabel: string) => string;
    hideDisabledProviders: string;
    showTeamApiProviders?: string;
    hideTeamApiProviders?: string;
    firstProvider: {
      eyebrow: string;
      statusLabel: string;
      title: (providerLabel: string) => string;
      detail: (providerLabel: string) => string;
      action: (providerLabel: string) => string;
      moreHint: string;
    };
    currentSetup: {
      disabled: string;
      sessionPage: string;
      savedConnection: string;
      policyOnly: string;
    };
    helperText: {
      disabled: string;
      readySessionPage: string;
      readyCredential: string;
      policyOnly: string;
      hostAccessMissing: (hostsLabel: string) => string;
      credentialMissingBasic: string;
      credentialMissingAdvanced: string;
      openPageRequired: string;
      loggedOut: string;
      captureUnavailable: string;
      syncError: string;
    };
    actions: {
      enableProvider: string;
      disableProvider: string;
      grantAccess: string;
      openUsagePage: string;
      openAndSignIn: string;
      retryPage: string;
      openSourcePage: string;
      useCurrentPage: string;
      disconnectPage: string;
    };
  };
  preferences: {
    showMore: string;
    hideMore: string;
    detail: string;
  };
  themeCustomization: {
    previewingSeed: (seed: string, mode: "light" | "dark") => string;
    customSeedMissing: string;
    enterValidSeed: string;
  };
};

export const SETTINGS_CORE_COPY: Record<
  SettingsCoreLocalizedLocale,
  SettingsCoreCopyText
> = {
  "zh-TW": {
    layout: {
      sectionsAria: "設定分區",
      sections: {
        overview: "概覽",
        quickSetup: "快速設定",
        appearance: "外觀與同步",
        advanced: "進階",
      },
      overview: {
        aria: "設定概覽",
        eyebrow: "設定概覽",
        title: "先從個人帳戶路徑開始",
        detail:
          "多數個人使用者只需要 Quick Setup、語言/主題和同步控制。切換下方模式即可決定要顯示多少 team/API 設定與診斷資訊。",
      },
      summary: {
        enabled: "已啟用",
        connected: "已連線",
        needsAction: "待處理",
        storedSecrets: "已存密鑰",
        boundPages: "已綁定頁面",
      },
      userLevel: {
        label: "顯示層級",
        helpText:
          "Basic 模式聚焦常用路徑。Advanced、Developer 和 Debug 會逐步顯示 team/API 設定、source controls 和更深診斷。",
        options: {
          basic: "Basic",
          advanced: "Advanced",
          developer: "Developer",
          debug: "Debug",
        },
      },
      advanced: {
        eyebrow: "進階",
        title: "Team / API / source controls",
        detail:
          "只有需要 team 或 enterprise 設定、source preference 變更或 page-binding 管理時才打開這裡。",
        show: "顯示進階設定",
        hide: "隱藏進階設定",
        itemCount: (count) => `${count} 組`,
      },
    },
    quickSetup: {
      eyebrow: "快速設定",
      title: "用一般使用者路徑設定 provider",
      detail:
        "這裡聚焦個人帳戶最常見的動作：啟用 provider、授予 browser access、打開 usage page，並確認 provider 是否已連線。",
      currentSetupLabel: "目前設定",
      nextStepLabel: "建議下一步",
      visibilityLabel: "顯示在 dashboard",
      pageStatusLabel: "頁面狀態",
      noActionNeeded: "目前不需要額外動作",
      disabledProvidersSummary: (count) => `更多 provider（${count}）`,
      hideDisabledProviders: "隱藏更多 provider",
      firstProvider: {
        eyebrow: "建議第一步",
        statusLabel: "建議",
        title: (provider) => `先從 ${provider} 開始`,
        detail: (provider) =>
          `先啟用 ${provider}。Quick Setup 接著會引導 browser access、usage page，以及 provider 是否已連線。也可以在更多 provider 中選其他工具。`,
        action: (provider) => `啟用 ${provider}`,
        moreHint: "想換工具？展開下方更多 provider。",
      },
      currentSetup: {
        disabled: "已關閉",
        sessionPage: "已登入 usage page",
        savedConnection: "已存 team / API 設定",
        policyOnly: "僅文件化 policy",
      },
      helperText: {
        disabled: "啟用後，這個 provider 才會回到 dashboard 和 refresh flow。",
        readySessionPage:
          "這個 provider 會從此瀏覽器中已登入的 usage page 同步。",
        readyCredential:
          "這個 provider 會從此 browser profile 已儲存的 team 或 enterprise 設定同步。",
        policyOnly:
          "這個 provider 目前只顯示文件化限制，不會假裝有即時個人用量。",
        hostAccessMissing: (hosts) =>
          `live sync 繼續之前，需要允許瀏覽器存取 ${hosts}。`,
        credentialMissingBasic:
          "如果確實需要 team 或 enterprise API 路徑，請先切到 Advanced 模式。",
        credentialMissingAdvanced:
          "如果需要 team 或 enterprise API 路徑，請在 Advanced 中完成 credential 設定。",
        openPageRequired: "先打開 provider usage page，再回來刷新。",
        loggedOut: "請打開 provider usage page 並重新登入後再試。",
        captureUnavailable:
          "頁面已開啟，但目前 session 無法讀取。請重新打開頁面再試。",
        syncError:
          "上次同步未成功。先重新打開 source page 或檢查 advanced source controls。",
      },
      actions: {
        enableProvider: "啟用 provider",
        disableProvider: "隱藏 provider",
        grantAccess: "授予 access",
        openUsagePage: "打開 usage page",
        openAndSignIn: "打開頁面並登入",
        retryPage: "重試頁面",
        openSourcePage: "打開 source page",
        useCurrentPage: "使用目前頁面",
        disconnectPage: "中斷頁面",
      },
    },
    preferences: {
      showMore: "更多",
      hideMore: "較少",
      detail:
        "App 語言、popup 外觀和各 surface 的 quota 樣式都在這裡，需要時再展開。",
    },
    themeCustomization: {
      previewingSeed: (seed, mode) =>
        `正在為目前${mode === "dark" ? "深色" : "淺色"}配色預覽 ${seed}。套用後會把 accent preset 切到 Custom Seed。`,
      customSeedMissing:
        "已選 Custom Seed，但還沒有有效的已存 seed。套用有效 #RRGGBB 前，預設 accent roles 會保持作用。",
      enterValidSeed:
        "輸入有效的 #RRGGBB 值即可產生自訂 accent palette，不需要開啟 raw token editing。",
    },
  },
  ja: {
    layout: {
      sectionsAria: "設定セクション",
      sections: {
        overview: "概要",
        quickSetup: "Quick Setup",
        appearance: "外観と同期",
        advanced: "詳細",
      },
      overview: {
        aria: "設定概要",
        eyebrow: "設定概要",
        title: "個人アカウントの経路から開始",
        detail:
          "多くの個人ユーザーは Quick Setup、言語/テーマ、同期コントロールだけで足ります。下のモードで team/API 設定や診断をどこまで表示するかを選べます。",
      },
      summary: {
        enabled: "有効",
        connected: "接続済み",
        needsAction: "要対応",
        storedSecrets: "保存済み secret",
        boundPages: "紐付けページ",
      },
      userLevel: {
        label: "表示レベル",
        helpText:
          "Basic は共通経路に集中します。Advanced、Developer、Debug は team/API 設定、source controls、詳細診断を段階的に表示します。",
        options: {
          basic: "Basic",
          advanced: "Advanced",
          developer: "Developer",
          debug: "Debug",
        },
      },
      advanced: {
        eyebrow: "詳細",
        title: "Team / API / source controls",
        detail:
          "team または enterprise 設定、source preference の変更、page-binding 管理が必要な場合だけ開いてください。",
        show: "詳細設定を表示",
        hide: "詳細設定を隠す",
        itemCount: (count) => `${count} グループ`,
      },
    },
    quickSetup: {
      eyebrow: "Quick Setup",
      title: "通常ユーザー向けに provider を設定",
      detail:
        "provider の有効化、browser access の許可、usage page の起動、接続状態の確認という個人アカウントでよく使う操作に集中します。",
      currentSetupLabel: "現在の設定",
      nextStepLabel: "おすすめの次の手順",
      visibilityLabel: "dashboard に表示",
      pageStatusLabel: "ページ状態",
      noActionNeeded: "今は追加操作は不要",
      disabledProvidersSummary: (count) => `その他の provider（${count}）`,
      hideDisabledProviders: "その他の provider を隠す",
      firstProvider: {
        eyebrow: "おすすめの第一歩",
        statusLabel: "おすすめ",
        title: (provider) => `${provider} から開始`,
        detail: (provider) =>
          `まず ${provider} を有効にします。Quick Setup が browser access、usage page、接続確認を案内します。別の provider は More providers から選べます。`,
        action: (provider) => `${provider} を有効化`,
        moreHint: "別のツールを使う場合は、下の More providers を開きます。",
      },
      currentSetup: {
        disabled: "オフ",
        sessionPage: "サインイン済み usage page",
        savedConnection: "保存済み team / API config",
        policyOnly: "文書化 policy のみ",
      },
      helperText: {
        disabled:
          "この provider を dashboard と refresh flow に戻すにはオンにします。",
        readySessionPage:
          "この provider はこのブラウザーでサインイン済みの usage page から同期します。",
        readyCredential:
          "この provider はこの browser profile に保存された team または enterprise 設定から同期します。",
        policyOnly:
          "この provider は文書化された制限のみを表示し、live personal usage があるとは扱いません。",
        hostAccessMissing: (hosts) =>
          `live sync を続ける前に ${hosts} への browser access が必要です。`,
        credentialMissingBasic:
          "team または enterprise API path が必要な場合は、先に Advanced mode へ切り替えてください。",
        credentialMissingAdvanced:
          "team または enterprise API path が必要な場合は、Advanced で credential setup を完了してください。",
        openPageRequired:
          "先に provider usage page を開き、その後戻って refresh します。",
        loggedOut:
          "provider usage page を開いて再度サインインしてから試してください。",
        captureUnavailable:
          "ページは開いていますが、現在の session は読み取れません。ページを開き直して再試行してください。",
        syncError:
          "前回の sync は完了しませんでした。source page を開き直すか advanced source controls を確認してください。",
      },
      actions: {
        enableProvider: "provider を有効化",
        disableProvider: "provider を隠す",
        grantAccess: "access を許可",
        openUsagePage: "usage page を開く",
        openAndSignIn: "ページを開いてサインイン",
        retryPage: "ページを再試行",
        openSourcePage: "source page を開く",
        useCurrentPage: "現在のページを使用",
        disconnectPage: "ページ接続を解除",
      },
    },
    preferences: {
      showMore: "さらに表示",
      hideMore: "少なく表示",
      detail:
        "App 言語、popup 形状、各 surface の quota スタイルは必要なときここで調整します。",
    },
    themeCustomization: {
      previewingSeed: (seed, mode) =>
        `現在の${mode === "dark" ? "ダーク" : "ライト"}パレットで ${seed} をプレビューしています。適用すると accent preset が Custom Seed に切り替わります。`,
      customSeedMissing:
        "Custom Seed が選択されていますが、有効な保存済み seed がまだありません。有効な #RRGGBB を適用するまで default accent roles が使われます。",
      enterValidSeed:
        "有効な #RRGGBB 値を入力すると、raw token editing を開かずに custom accent palette を生成できます。",
    },
  },
  ko: {
    layout: {
      sectionsAria: "Settings 섹션",
      sections: {
        overview: "개요",
        quickSetup: "Quick Setup",
        appearance: "모양 및 sync",
        advanced: "고급",
      },
      overview: {
        aria: "Settings 개요",
        eyebrow: "Settings 개요",
        title: "개인 계정 경로부터 시작",
        detail:
          "대부분의 개인 사용자는 Quick Setup, 언어/테마, sync controls만 필요합니다. 아래 mode로 team/API setup과 diagnostics 표시 범위를 정할 수 있습니다.",
      },
      summary: {
        enabled: "활성화됨",
        connected: "연결됨",
        needsAction: "조치 필요",
        storedSecrets: "저장된 secrets",
        boundPages: "바인딩된 페이지",
      },
      userLevel: {
        label: "표시 수준",
        helpText:
          "Basic mode는 일반 경로에 집중합니다. Advanced, Developer, Debug는 team/API setup, source controls, 더 깊은 diagnostics를 단계적으로 표시합니다.",
        options: {
          basic: "Basic",
          advanced: "Advanced",
          developer: "Developer",
          debug: "Debug",
        },
      },
      advanced: {
        eyebrow: "고급",
        title: "Team / API / source controls",
        detail:
          "team 또는 enterprise 설정, source preference 변경, page-binding 관리가 필요할 때만 여세요.",
        show: "고급 Settings 표시",
        hide: "고급 Settings 숨기기",
        itemCount: (count) => `${count}개 그룹`,
      },
    },
    quickSetup: {
      eyebrow: "Quick Setup",
      title: "일반 사용자 방식으로 provider 설정",
      detail:
        "provider 활성화, browser access 허용, usage page 열기, provider 연결 확인 같은 개인 계정의 일반 작업에 집중합니다.",
      currentSetupLabel: "현재 setup",
      nextStepLabel: "추천 다음 단계",
      visibilityLabel: "dashboard에 표시",
      pageStatusLabel: "페이지 상태",
      noActionNeeded: "지금은 추가 조치가 필요 없습니다",
      disabledProvidersSummary: (count) => `더 많은 provider (${count})`,
      hideDisabledProviders: "더 많은 provider 숨기기",
      firstProvider: {
        eyebrow: "추천 첫 단계",
        statusLabel: "추천",
        title: (provider) => `${provider}부터 시작`,
        detail: (provider) =>
          `먼저 ${provider}를 활성화하세요. Quick Setup이 browser access, usage page, provider 연결 여부를 안내합니다. More providers에서 다른 provider도 선택할 수 있습니다.`,
        action: (provider) => `${provider} 활성화`,
        moreHint: "다른 도구를 원하면 아래 More providers를 여세요.",
      },
      currentSetup: {
        disabled: "꺼짐",
        sessionPage: "로그인된 usage page",
        savedConnection: "저장된 team / API config",
        policyOnly: "문서화된 policy only",
      },
      helperText: {
        disabled:
          "이 provider를 dashboard와 refresh flow에 다시 포함하려면 켜세요.",
        readySessionPage:
          "이 provider는 이 브라우저에서 이미 로그인된 usage page에서 sync합니다.",
        readyCredential:
          "이 provider는 이 browser profile에 저장된 team 또는 enterprise config에서 sync합니다.",
        policyOnly:
          "이 provider는 현재 문서화된 제한만 표시하며 live personal usage를 제공한다고 보지 않습니다.",
        hostAccessMissing: (hosts) =>
          `live sync를 계속하려면 ${hosts}에 대한 browser access가 필요합니다.`,
        credentialMissingBasic:
          "team 또는 enterprise API path가 꼭 필요하면 먼저 Advanced mode로 전환하세요.",
        credentialMissingAdvanced:
          "team 또는 enterprise API path가 필요하면 Advanced에서 credential setup을 완료하세요.",
        openPageRequired: "먼저 provider usage page를 열고 돌아와 refresh하세요.",
        loggedOut: "provider usage page를 열어 다시 로그인한 뒤 재시도하세요.",
        captureUnavailable:
          "페이지는 열려 있지만 현재 session을 읽을 수 없습니다. 페이지를 다시 열고 재시도하세요.",
        syncError:
          "마지막 sync가 완료되지 않았습니다. source page를 다시 열거나 advanced source controls를 확인하세요.",
      },
      actions: {
        enableProvider: "provider 활성화",
        disableProvider: "provider 숨기기",
        grantAccess: "access 허용",
        openUsagePage: "usage page 열기",
        openAndSignIn: "페이지 열고 로그인",
        retryPage: "페이지 재시도",
        openSourcePage: "source page 열기",
        useCurrentPage: "현재 페이지 사용",
        disconnectPage: "페이지 연결 해제",
      },
    },
    preferences: {
      showMore: "더 보기",
      hideMore: "줄이기",
      detail:
        "App 언어, popup 형태, surface별 quota 스타일은 필요할 때 여기에서 조정합니다.",
    },
    themeCustomization: {
      previewingSeed: (seed, mode) =>
        `현재 ${mode === "dark" ? "dark" : "light"} palette에서 ${seed}를 preview 중입니다. 적용하면 accent preset이 Custom Seed로 바뀝니다.`,
      customSeedMissing:
        "Custom Seed가 선택되어 있지만 유효한 저장 seed가 아직 없습니다. 유효한 #RRGGBB를 적용할 때까지 default accent roles가 유지됩니다.",
      enterValidSeed:
        "유효한 #RRGGBB 값을 입력하면 raw token editing 없이 custom accent palette를 생성할 수 있습니다.",
    },
  },
  "es-419": {
    layout: {
      sectionsAria: "Secciones de Settings",
      sections: {
        overview: "Resumen",
        quickSetup: "Quick Setup",
        appearance: "Apariencia y sync",
        advanced: "Avanzado",
      },
      overview: {
        aria: "Resumen de Settings",
        eyebrow: "Resumen de Settings",
        title: "Empieza con la ruta de cuenta personal",
        detail:
          "La mayoría de usuarios personales solo necesita Quick Setup, idioma/tema y controles de sync. Cambia el modo abajo para decidir cuánto setup team/API y diagnostics se muestran.",
      },
      summary: {
        enabled: "Activados",
        connected: "Conectados",
        needsAction: "Requiere acción",
        storedSecrets: "Secrets guardados",
        boundPages: "Páginas vinculadas",
      },
      userLevel: {
        label: "Nivel de visualización",
        helpText:
          "Basic mantiene Settings enfocado en la ruta común. Advanced, Developer y Debug revelan progresivamente setup team/API, source controls y diagnostics más profundos.",
        options: {
          basic: "Basic",
          advanced: "Advanced",
          developer: "Developer",
          debug: "Debug",
        },
      },
      advanced: {
        eyebrow: "Avanzado",
        title: "Team / API / source controls",
        detail:
          "Ábrelo solo cuando necesites configuración team o enterprise, cambios de source preference o gestión de page-binding.",
        show: "Mostrar Settings avanzados",
        hide: "Ocultar Settings avanzados",
        itemCount: (count) => `${count} grupos`,
      },
    },
    quickSetup: {
      eyebrow: "Quick Setup",
      title: "Configura providers como usuario normal",
      detail:
        "Esta sección se enfoca en tareas comunes de cuenta personal: activar un provider, conceder browser access, abrir la usage page y revisar si ya está conectado.",
      currentSetupLabel: "Setup actual",
      nextStepLabel: "Siguiente paso recomendado",
      visibilityLabel: "Mostrar en dashboard",
      pageStatusLabel: "Estado de página",
      noActionNeeded: "No hace falta otra acción ahora",
      disabledProvidersSummary: (count) => `Más providers (${count})`,
      hideDisabledProviders: "Ocultar más providers",
      firstProvider: {
        eyebrow: "Primer paso sugerido",
        statusLabel: "Recomendado",
        title: (provider) => `Empieza con ${provider}`,
        detail: (provider) =>
          `Activa ${provider} primero. Quick Setup te guiará por browser access, usage page y conexión del provider. Puedes elegir otro provider en More providers.`,
        action: (provider) => `Activar ${provider}`,
        moreHint: "¿Prefieres otra herramienta? Abre More providers abajo.",
      },
      currentSetup: {
        disabled: "Desactivado",
        sessionPage: "Usage page con sesión iniciada",
        savedConnection: "Config team / API guardada",
        policyOnly: "Solo policy documentada",
      },
      helperText: {
        disabled:
          "Activa este provider cuando quieras devolverlo al dashboard y al refresh flow.",
        readySessionPage:
          "Este provider sincroniza desde una usage page ya iniciada en este navegador.",
        readyCredential:
          "Este provider sincroniza desde configuración team o enterprise guardada en este browser profile.",
        policyOnly:
          "Este provider solo muestra límites documentados y no promete live personal usage.",
        hostAccessMissing: (hosts) =>
          `Se requiere browser access a ${hosts} antes de continuar live sync.`,
        credentialMissingBasic:
          "Si necesitas la ruta team o enterprise API, cambia primero a Advanced mode.",
        credentialMissingAdvanced:
          "Si necesitas la ruta team o enterprise API, completa credential setup en Advanced.",
        openPageRequired:
          "Abre primero la provider usage page, luego vuelve y refresca.",
        loggedOut:
          "Abre la provider usage page e inicia sesión de nuevo antes de reintentar.",
        captureUnavailable:
          "La página está abierta, pero la session actual no se puede leer. Reabre la página y reintenta.",
        syncError:
          "El último sync no terminó correctamente. Reabre la source page o revisa advanced source controls.",
      },
      actions: {
        enableProvider: "Activar provider",
        disableProvider: "Ocultar provider",
        grantAccess: "Conceder access",
        openUsagePage: "Abrir usage page",
        openAndSignIn: "Abrir página e iniciar sesión",
        retryPage: "Reintentar página",
        openSourcePage: "Abrir source page",
        useCurrentPage: "Usar página actual",
        disconnectPage: "Desconectar página",
      },
    },
    preferences: {
      showMore: "Más",
      hideMore: "Menos",
      detail:
        "El idioma de la app, la forma del popup y el estilo de quota por surface viven aquí cuando los necesites.",
    },
    themeCustomization: {
      previewingSeed: (seed, mode) =>
        `Previsualizando ${seed} para la paleta ${mode === "dark" ? "oscura" : "clara"} actual. Al aplicarlo, el accent preset cambia a Custom Seed.`,
      customSeedMissing:
        "Custom Seed está seleccionado, pero aún no hay un seed guardado válido. Los default accent roles siguen activos hasta aplicar un #RRGGBB válido.",
      enterValidSeed:
        "Ingresa un #RRGGBB válido para generar una custom accent palette sin abrir raw token editing.",
    },
  },
  "pt-BR": {
    layout: {
      sectionsAria: "Seções de Settings",
      sections: {
        overview: "Visão geral",
        quickSetup: "Quick Setup",
        appearance: "Aparência e sync",
        advanced: "Avançado",
      },
      overview: {
        aria: "Visão geral de Settings",
        eyebrow: "Visão geral de Settings",
        title: "Comece pela rota de conta pessoal",
        detail:
          "A maioria dos usuários pessoais só precisa de Quick Setup, idioma/tema e controles de sync. Troque o modo abaixo para decidir quanto setup team/API e diagnostics aparecem.",
      },
      summary: {
        enabled: "Ativos",
        connected: "Conectados",
        needsAction: "Precisa ação",
        storedSecrets: "Secrets salvos",
        boundPages: "Páginas vinculadas",
      },
      userLevel: {
        label: "Nível de exibição",
        helpText:
          "Basic mantém Settings focado no caminho comum. Advanced, Developer e Debug revelam aos poucos setup team/API, source controls e diagnostics mais profundos.",
        options: {
          basic: "Basic",
          advanced: "Advanced",
          developer: "Developer",
          debug: "Debug",
        },
      },
      advanced: {
        eyebrow: "Avançado",
        title: "Team / API / source controls",
        detail:
          "Abra isso só quando precisar de configuração team ou enterprise, mudanças de source preference ou gerenciamento de page-binding.",
        show: "Mostrar Settings avançados",
        hide: "Ocultar Settings avançados",
        itemCount: (count) => `${count} grupos`,
      },
    },
    quickSetup: {
      eyebrow: "Quick Setup",
      title: "Configure providers pelo caminho comum",
      detail:
        "Esta seção foca nas tarefas comuns de conta pessoal: ativar um provider, conceder browser access, abrir a usage page e verificar se ele já está conectado.",
      currentSetupLabel: "Setup atual",
      nextStepLabel: "Próximo passo recomendado",
      visibilityLabel: "Mostrar no dashboard",
      pageStatusLabel: "Status da página",
      noActionNeeded: "Nenhuma ação extra agora",
      disabledProvidersSummary: (count) => `Mais providers (${count})`,
      hideDisabledProviders: "Ocultar mais providers",
      firstProvider: {
        eyebrow: "Primeiro passo sugerido",
        statusLabel: "Recomendado",
        title: (provider) => `Comece com ${provider}`,
        detail: (provider) =>
          `Ative ${provider} primeiro. Quick Setup guiará browser access, usage page e conexão do provider. Você pode escolher outro provider em More providers.`,
        action: (provider) => `Ativar ${provider}`,
        moreHint: "Prefere outra ferramenta? Abra More providers abaixo.",
      },
      currentSetup: {
        disabled: "Desativado",
        sessionPage: "Usage page com login",
        savedConnection: "Config team / API salva",
        policyOnly: "Somente policy documentada",
      },
      helperText: {
        disabled:
          "Ative este provider quando quiser colocá-lo de volta no dashboard e no refresh flow.",
        readySessionPage:
          "Este provider sincroniza a partir de uma usage page já logada neste navegador.",
        readyCredential:
          "Este provider sincroniza a partir de configuração team ou enterprise salva neste browser profile.",
        policyOnly:
          "Este provider mostra apenas limites documentados e não finge ter live personal usage.",
        hostAccessMissing: (hosts) =>
          `É necessário browser access a ${hosts} antes de continuar live sync.`,
        credentialMissingBasic:
          "Se você precisa mesmo do caminho team ou enterprise API, mude primeiro para Advanced mode.",
        credentialMissingAdvanced:
          "Se você precisa do caminho team ou enterprise API, conclua credential setup em Advanced.",
        openPageRequired:
          "Abra primeiro a provider usage page, depois volte e atualize.",
        loggedOut:
          "Abra a provider usage page e faça login novamente antes de tentar.",
        captureUnavailable:
          "A página está aberta, mas a session atual não pode ser lida. Reabra a página e tente de novo.",
        syncError:
          "O último sync não terminou. Reabra a source page ou verifique advanced source controls.",
      },
      actions: {
        enableProvider: "Ativar provider",
        disableProvider: "Ocultar provider",
        grantAccess: "Conceder access",
        openUsagePage: "Abrir usage page",
        openAndSignIn: "Abrir página e entrar",
        retryPage: "Tentar página de novo",
        openSourcePage: "Abrir source page",
        useCurrentPage: "Usar página atual",
        disconnectPage: "Desconectar página",
      },
    },
    preferences: {
      showMore: "Mais",
      hideMore: "Menos",
      detail:
        "Idioma do app, forma do popup e estilo de quota por surface ficam aqui quando você precisar.",
    },
    themeCustomization: {
      previewingSeed: (seed, mode) =>
        `Pré-visualizando ${seed} para a paleta ${mode === "dark" ? "escura" : "clara"} atual. Ao aplicar, o accent preset muda para Custom Seed.`,
      customSeedMissing:
        "Custom Seed está selecionado, mas ainda não há seed salvo válido. Os default accent roles continuam ativos até aplicar um #RRGGBB válido.",
      enterValidSeed:
        "Digite um #RRGGBB válido para gerar uma custom accent palette sem abrir raw token editing.",
    },
  },
  fr: {
    layout: {
      sectionsAria: "Sections Settings",
      sections: {
        overview: "Aperçu",
        quickSetup: "Quick Setup",
        appearance: "Apparence et sync",
        advanced: "Avancé",
      },
      overview: {
        aria: "Aperçu Settings",
        eyebrow: "Aperçu Settings",
        title: "Commencer par le chemin du compte personnel",
        detail:
          "La plupart des utilisateurs personnels n'ont besoin que de Quick Setup, langue/thème et contrôles de sync. Le mode ci-dessous décide combien de setup team/API et diagnostics sont affichés.",
      },
      summary: {
        enabled: "Activés",
        connected: "Connectés",
        needsAction: "Action requise",
        storedSecrets: "Secrets enregistrés",
        boundPages: "Pages liées",
      },
      userLevel: {
        label: "Niveau d'affichage",
        helpText:
          "Basic garde Settings centré sur le chemin commun. Advanced, Developer et Debug révèlent progressivement le setup team/API, les source controls et les diagnostics plus profonds.",
        options: {
          basic: "Basic",
          advanced: "Advanced",
          developer: "Developer",
          debug: "Debug",
        },
      },
      advanced: {
        eyebrow: "Avancé",
        title: "Team / API / source controls",
        detail:
          "Ouvrez ceci seulement pour une configuration team ou enterprise, des changements de source preference ou la gestion de page-binding.",
        show: "Afficher les Settings avancés",
        hide: "Masquer les Settings avancés",
        itemCount: (count) => `${count} groupes`,
      },
    },
    quickSetup: {
      eyebrow: "Quick Setup",
      title: "Configurer les providers par le chemin courant",
      detail:
        "Cette section cible les tâches communes du compte personnel : activer un provider, accorder browser access, ouvrir la usage page et vérifier la connexion.",
      currentSetupLabel: "Setup actuel",
      nextStepLabel: "Prochaine étape recommandée",
      visibilityLabel: "Afficher dans dashboard",
      pageStatusLabel: "État de page",
      noActionNeeded: "Aucune action supplémentaire pour l'instant",
      disabledProvidersSummary: (count) => `Plus de providers (${count})`,
      hideDisabledProviders: "Masquer plus de providers",
      firstProvider: {
        eyebrow: "Première étape suggérée",
        statusLabel: "Recommandé",
        title: (provider) => `Commencer avec ${provider}`,
        detail: (provider) =>
          `Activez d'abord ${provider}. Quick Setup guidera browser access, usage page et connexion du provider. Vous pouvez choisir un autre provider dans More providers.`,
        action: (provider) => `Activer ${provider}`,
        moreHint: "Vous préférez un autre outil ? Ouvrez More providers ci-dessous.",
      },
      currentSetup: {
        disabled: "Désactivé",
        sessionPage: "Usage page connectée",
        savedConnection: "Config team / API enregistrée",
        policyOnly: "Policy documentée seulement",
      },
      helperText: {
        disabled:
          "Activez ce provider pour le remettre dans dashboard et refresh flow.",
        readySessionPage:
          "Ce provider synchronise depuis une usage page déjà connectée dans ce navigateur.",
        readyCredential:
          "Ce provider synchronise depuis une configuration team ou enterprise enregistrée dans ce browser profile.",
        policyOnly:
          "Ce provider affiche seulement des limites documentées et ne prétend pas fournir live personal usage.",
        hostAccessMissing: (hosts) =>
          `Browser access à ${hosts} est requis avant de continuer live sync.`,
        credentialMissingBasic:
          "Si vous avez besoin du chemin team ou enterprise API, passez d'abord en Advanced mode.",
        credentialMissingAdvanced:
          "Si vous avez besoin du chemin team ou enterprise API, terminez credential setup dans Advanced.",
        openPageRequired:
          "Ouvrez d'abord la provider usage page, puis revenez rafraîchir.",
        loggedOut:
          "Ouvrez la provider usage page et reconnectez-vous avant de réessayer.",
        captureUnavailable:
          "La page est ouverte, mais la session actuelle ne peut pas être lue. Rouvrez la page et réessayez.",
        syncError:
          "Le dernier sync n'a pas abouti. Rouvrez la source page ou vérifiez les advanced source controls.",
      },
      actions: {
        enableProvider: "Activer provider",
        disableProvider: "Masquer provider",
        grantAccess: "Accorder access",
        openUsagePage: "Ouvrir usage page",
        openAndSignIn: "Ouvrir la page et se connecter",
        retryPage: "Réessayer la page",
        openSourcePage: "Ouvrir source page",
        useCurrentPage: "Utiliser la page actuelle",
        disconnectPage: "Déconnecter la page",
      },
    },
    preferences: {
      showMore: "Plus",
      hideMore: "Moins",
      detail:
        "La langue de l'app, la forme du popup et le style de quota par surface vivent ici quand vous en avez besoin.",
    },
    themeCustomization: {
      previewingSeed: (seed, mode) =>
        `Aperçu de ${seed} pour la palette ${mode === "dark" ? "sombre" : "claire"} actuelle. L'appliquer fera passer l'accent preset à Custom Seed.`,
      customSeedMissing:
        "Custom Seed est sélectionné, mais aucun seed enregistré valide n'est encore disponible. Les default accent roles restent actifs jusqu'à l'application d'un #RRGGBB valide.",
      enterValidSeed:
        "Entrez une valeur #RRGGBB valide pour générer une custom accent palette sans ouvrir raw token editing.",
    },
  },
  de: {
    layout: {
      sectionsAria: "Settings-Bereiche",
      sections: {
        overview: "Übersicht",
        quickSetup: "Quick Setup",
        appearance: "Darstellung und sync",
        advanced: "Erweitert",
      },
      overview: {
        aria: "Settings-Übersicht",
        eyebrow: "Settings-Übersicht",
        title: "Mit dem persönlichen Konto-Pfad starten",
        detail:
          "Die meisten persönlichen Nutzer brauchen nur Quick Setup, Sprache/Theme und sync controls. Der Modus unten steuert, wie viel team/API setup und diagnostics sichtbar sind.",
      },
      summary: {
        enabled: "Aktiviert",
        connected: "Verbunden",
        needsAction: "Aktion nötig",
        storedSecrets: "Gespeicherte secrets",
        boundPages: "Gebundene Seiten",
      },
      userLevel: {
        label: "Anzeigelevel",
        helpText:
          "Basic hält Settings auf den üblichen Pfad fokussiert. Advanced, Developer und Debug zeigen schrittweise team/API setup, source controls und tiefere diagnostics.",
        options: {
          basic: "Basic",
          advanced: "Advanced",
          developer: "Developer",
          debug: "Debug",
        },
      },
      advanced: {
        eyebrow: "Erweitert",
        title: "Team / API / source controls",
        detail:
          "Öffne dies nur für team- oder enterprise-Konfiguration, Änderungen an source preference oder page-binding Verwaltung.",
        show: "Erweiterte Settings anzeigen",
        hide: "Erweiterte Settings ausblenden",
        itemCount: (count) => `${count} Gruppen`,
      },
    },
    quickSetup: {
      eyebrow: "Quick Setup",
      title: "Provider über den normalen Nutzerpfad einrichten",
      detail:
        "Dieser Bereich fokussiert typische persönliche Aufgaben: provider aktivieren, browser access gewähren, usage page öffnen und prüfen, ob der provider verbunden ist.",
      currentSetupLabel: "Aktuelles setup",
      nextStepLabel: "Empfohlener nächster Schritt",
      visibilityLabel: "Im dashboard anzeigen",
      pageStatusLabel: "Seitenstatus",
      noActionNeeded: "Aktuell keine zusätzliche Aktion nötig",
      disabledProvidersSummary: (count) => `Weitere provider (${count})`,
      hideDisabledProviders: "Weitere provider ausblenden",
      firstProvider: {
        eyebrow: "Empfohlener erster Schritt",
        statusLabel: "Empfohlen",
        title: (provider) => `Mit ${provider} starten`,
        detail: (provider) =>
          `Aktiviere zuerst ${provider}. Quick Setup führt durch browser access, usage page und die Verbindung des providers. Einen anderen provider findest du unter More providers.`,
        action: (provider) => `${provider} aktivieren`,
        moreHint: "Lieber ein anderes Tool? Öffne unten More providers.",
      },
      currentSetup: {
        disabled: "Ausgeschaltet",
        sessionPage: "Angemeldete usage page",
        savedConnection: "Gespeicherte team / API config",
        policyOnly: "Nur dokumentierte policy",
      },
      helperText: {
        disabled:
          "Schalte diesen provider ein, wenn er wieder in dashboard und refresh flow erscheinen soll.",
        readySessionPage:
          "Dieser provider synchronisiert von einer usage page, die in diesem Browser bereits angemeldet ist.",
        readyCredential:
          "Dieser provider synchronisiert aus team- oder enterprise-Konfiguration, die in diesem browser profile gespeichert ist.",
        policyOnly:
          "Dieser provider zeigt nur dokumentierte Limits und behauptet keine live personal usage.",
        hostAccessMissing: (hosts) =>
          `Browser access auf ${hosts} ist erforderlich, bevor live sync fortgesetzt werden kann.`,
        credentialMissingBasic:
          "Wenn du den team- oder enterprise API path wirklich brauchst, wechsle zuerst in Advanced mode.",
        credentialMissingAdvanced:
          "Wenn du den team- oder enterprise API path brauchst, schließe credential setup in Advanced ab.",
        openPageRequired:
          "Öffne zuerst die provider usage page, kehre dann zurück und aktualisiere.",
        loggedOut:
          "Öffne die provider usage page und melde dich erneut an, bevor du es noch einmal versuchst.",
        captureUnavailable:
          "Die Seite ist geöffnet, aber die aktuelle session kann nicht gelesen werden. Öffne die Seite neu und versuche es erneut.",
        syncError:
          "Der letzte sync wurde nicht erfolgreich abgeschlossen. Öffne die source page erneut oder prüfe advanced source controls.",
      },
      actions: {
        enableProvider: "provider aktivieren",
        disableProvider: "provider ausblenden",
        grantAccess: "access gewähren",
        openUsagePage: "usage page öffnen",
        openAndSignIn: "Seite öffnen und anmelden",
        retryPage: "Seite erneut versuchen",
        openSourcePage: "source page öffnen",
        useCurrentPage: "Aktuelle Seite verwenden",
        disconnectPage: "Seite trennen",
      },
    },
    preferences: {
      showMore: "Mehr",
      hideMore: "Weniger",
      detail:
        "App-Sprache, popup-Form und quota-Stil je surface findest du hier, wenn du sie brauchst.",
    },
    themeCustomization: {
      previewingSeed: (seed, mode) =>
        `Vorschau von ${seed} für die aktuelle ${mode === "dark" ? "dunkle" : "helle"} Palette. Beim Anwenden wechselt der accent preset zu Custom Seed.`,
      customSeedMissing:
        "Custom Seed ist ausgewählt, aber es gibt noch keinen gültigen gespeicherten seed. Die default accent roles bleiben aktiv, bis ein gültiger #RRGGBB-Wert angewendet wird.",
      enterValidSeed:
        "Gib einen gültigen #RRGGBB-Wert ein, um eine custom accent palette zu erzeugen, ohne raw token editing zu öffnen.",
    },
  },
  it: {
    layout: {
      sectionsAria: "Sezioni Settings",
      sections: {
        overview: "Panoramica",
        quickSetup: "Quick Setup",
        appearance: "Aspetto e sync",
        advanced: "Avanzate",
      },
      overview: {
        aria: "Panoramica Settings",
        eyebrow: "Panoramica Settings",
        title: "Inizia dal percorso account personale",
        detail:
          "La maggior parte degli utenti personali usa solo Quick Setup, lingua/tema e controlli di sync. Il mode sotto decide quanto setup team/API e diagnostics mostrare.",
      },
      summary: {
        enabled: "Abilitati",
        connected: "Connessi",
        needsAction: "Richiede azione",
        storedSecrets: "Secrets salvati",
        boundPages: "Pagine associate",
      },
      userLevel: {
        label: "Livello di visualizzazione",
        helpText:
          "Basic mantiene Settings sul percorso comune. Advanced, Developer e Debug mostrano gradualmente setup team/API, source controls e diagnostics più profondi.",
        options: {
          basic: "Basic",
          advanced: "Advanced",
          developer: "Developer",
          debug: "Debug",
        },
      },
      advanced: {
        eyebrow: "Avanzate",
        title: "Team / API / source controls",
        detail:
          "Apri questa parte solo se ti servono configurazione team o enterprise, cambi di source preference o gestione page-binding.",
        show: "Mostra Settings avanzate",
        hide: "Nascondi Settings avanzate",
        itemCount: (count) => `${count} gruppi`,
      },
    },
    quickSetup: {
      eyebrow: "Quick Setup",
      title: "Configura provider nel modo comune",
      detail:
        "Questa sezione copre le azioni comuni dell'account personale: abilitare un provider, concedere browser access, aprire la usage page e verificare se è connesso.",
      currentSetupLabel: "Setup attuale",
      nextStepLabel: "Prossimo passo consigliato",
      visibilityLabel: "Mostra in dashboard",
      pageStatusLabel: "Stato pagina",
      noActionNeeded: "Nessuna azione extra ora",
      disabledProvidersSummary: (count) => `Altri provider (${count})`,
      hideDisabledProviders: "Nascondi altri provider",
      firstProvider: {
        eyebrow: "Primo passo suggerito",
        statusLabel: "Consigliato",
        title: (provider) => `Inizia con ${provider}`,
        detail: (provider) =>
          `Abilita prima ${provider}. Quick Setup guiderà browser access, usage page e controllo connessione del provider. Puoi scegliere un altro provider in More providers.`,
        action: (provider) => `Abilita ${provider}`,
        moreHint: "Preferisci un altro tool? Apri More providers sotto.",
      },
      currentSetup: {
        disabled: "Disattivato",
        sessionPage: "Usage page con accesso",
        savedConnection: "Config team / API salvata",
        policyOnly: "Solo policy documentata",
      },
      helperText: {
        disabled:
          "Attiva questo provider per riportarlo nel dashboard e nel refresh flow.",
        readySessionPage:
          "Questo provider sincronizza da una usage page già autenticata in questo browser.",
        readyCredential:
          "Questo provider sincronizza da configurazione team o enterprise salvata in questo browser profile.",
        policyOnly:
          "Questo provider mostra solo limiti documentati e non promette live personal usage.",
        hostAccessMissing: (hosts) =>
          `Serve browser access a ${hosts} prima di continuare live sync.`,
        credentialMissingBasic:
          "Se ti serve davvero il percorso team o enterprise API, passa prima ad Advanced mode.",
        credentialMissingAdvanced:
          "Se ti serve il percorso team o enterprise API, completa credential setup in Advanced.",
        openPageRequired:
          "Apri prima la provider usage page, poi torna e aggiorna.",
        loggedOut:
          "Apri la provider usage page e accedi di nuovo prima di riprovare.",
        captureUnavailable:
          "La pagina è aperta, ma la session attuale non può essere letta. Riapri la pagina e riprova.",
        syncError:
          "L'ultimo sync non è riuscito. Riapri la source page o controlla advanced source controls.",
      },
      actions: {
        enableProvider: "Abilita provider",
        disableProvider: "Nascondi provider",
        grantAccess: "Concedi access",
        openUsagePage: "Apri usage page",
        openAndSignIn: "Apri pagina e accedi",
        retryPage: "Riprova pagina",
        openSourcePage: "Apri source page",
        useCurrentPage: "Usa pagina attuale",
        disconnectPage: "Disconnetti pagina",
      },
    },
    preferences: {
      showMore: "Altro",
      hideMore: "Meno",
      detail:
        "Lingua app, forma popup e stile quota per surface sono qui quando servono.",
    },
    themeCustomization: {
      previewingSeed: (seed, mode) =>
        `Anteprima di ${seed} per la palette ${mode === "dark" ? "scura" : "chiara"} attuale. Applicandolo, accent preset passa a Custom Seed.`,
      customSeedMissing:
        "Custom Seed è selezionato, ma non esiste ancora un seed salvato valido. I default accent roles restano attivi finché non applichi un #RRGGBB valido.",
      enterValidSeed:
        "Inserisci un valore #RRGGBB valido per generare una custom accent palette senza aprire raw token editing.",
    },
  },
  ru: {
    layout: {
      sectionsAria: "Разделы Settings",
      sections: {
        overview: "Обзор",
        quickSetup: "Quick Setup",
        appearance: "Внешний вид и sync",
        advanced: "Расширенно",
      },
      overview: {
        aria: "Обзор Settings",
        eyebrow: "Обзор Settings",
        title: "Начните с пути личного аккаунта",
        detail:
          "Большинству личных пользователей нужны только Quick Setup, язык/тема и sync controls. Режим ниже задает, сколько team/API setup и diagnostics показывать.",
      },
      summary: {
        enabled: "Включено",
        connected: "Подключено",
        needsAction: "Нужно действие",
        storedSecrets: "Сохраненные secrets",
        boundPages: "Привязанные страницы",
      },
      userLevel: {
        label: "Уровень отображения",
        helpText:
          "Basic держит Settings на обычном пути. Advanced, Developer и Debug постепенно раскрывают team/API setup, source controls и более глубокие diagnostics.",
        options: {
          basic: "Basic",
          advanced: "Advanced",
          developer: "Developer",
          debug: "Debug",
        },
      },
      advanced: {
        eyebrow: "Расширенно",
        title: "Team / API / source controls",
        detail:
          "Открывайте только когда нужна team или enterprise конфигурация, изменение source preference или управление page-binding.",
        show: "Показать расширенные Settings",
        hide: "Скрыть расширенные Settings",
        itemCount: (count) => `${count} групп`,
      },
    },
    quickSetup: {
      eyebrow: "Quick Setup",
      title: "Настройте providers обычным путем",
      detail:
        "Раздел фокусируется на типичных задачах личного аккаунта: включить provider, выдать browser access, открыть usage page и проверить подключение.",
      currentSetupLabel: "Текущий setup",
      nextStepLabel: "Рекомендуемый следующий шаг",
      visibilityLabel: "Показывать в dashboard",
      pageStatusLabel: "Статус страницы",
      noActionNeeded: "Сейчас дополнительное действие не нужно",
      disabledProvidersSummary: (count) => `Другие providers (${count})`,
      hideDisabledProviders: "Скрыть другие providers",
      firstProvider: {
        eyebrow: "Рекомендуемый первый шаг",
        statusLabel: "Рекомендуется",
        title: (provider) => `Начните с ${provider}`,
        detail: (provider) =>
          `Сначала включите ${provider}. Quick Setup проведет через browser access, usage page и проверку подключения provider. Другой provider можно выбрать в More providers.`,
        action: (provider) => `Включить ${provider}`,
        moreHint: "Нужен другой инструмент? Откройте More providers ниже.",
      },
      currentSetup: {
        disabled: "Выключено",
        sessionPage: "Usage page с входом",
        savedConnection: "Сохраненная team / API config",
        policyOnly: "Только документированная policy",
      },
      helperText: {
        disabled:
          "Включите этот provider, чтобы вернуть его в dashboard и refresh flow.",
        readySessionPage:
          "Этот provider синхронизируется с usage page, где уже выполнен вход в этом браузере.",
        readyCredential:
          "Этот provider синхронизируется из team или enterprise конфигурации, сохраненной в этом browser profile.",
        policyOnly:
          "Этот provider сейчас показывает только документированные лимиты и не обещает live personal usage.",
        hostAccessMissing: (hosts) =>
          `Для продолжения live sync нужен browser access к ${hosts}.`,
        credentialMissingBasic:
          "Если действительно нужен team или enterprise API path, сначала переключитесь в Advanced mode.",
        credentialMissingAdvanced:
          "Если нужен team или enterprise API path, завершите credential setup в Advanced.",
        openPageRequired:
          "Сначала откройте provider usage page, затем вернитесь и обновите.",
        loggedOut:
          "Откройте provider usage page и войдите снова перед повтором.",
        captureUnavailable:
          "Страница открыта, но текущую session нельзя прочитать. Откройте страницу заново и повторите.",
        syncError:
          "Последний sync не завершился успешно. Откройте source page заново или проверьте advanced source controls.",
      },
      actions: {
        enableProvider: "Включить provider",
        disableProvider: "Скрыть provider",
        grantAccess: "Выдать access",
        openUsagePage: "Открыть usage page",
        openAndSignIn: "Открыть страницу и войти",
        retryPage: "Повторить страницу",
        openSourcePage: "Открыть source page",
        useCurrentPage: "Использовать текущую страницу",
        disconnectPage: "Отвязать страницу",
      },
    },
    preferences: {
      showMore: "Больше",
      hideMore: "Меньше",
      detail:
        "Язык app, форма popup и стиль quota для каждой surface находятся здесь, когда понадобятся.",
    },
    themeCustomization: {
      previewingSeed: (seed, mode) =>
        `Предпросмотр ${seed} для текущей ${mode === "dark" ? "темной" : "светлой"} палитры. После применения accent preset станет Custom Seed.`,
      customSeedMissing:
        "Custom Seed выбран, но действительный сохраненный seed еще недоступен. Default accent roles остаются активными до применения действительного #RRGGBB.",
      enterValidSeed:
        "Введите действительное значение #RRGGBB, чтобы создать custom accent palette без открытия raw token editing.",
    },
  },
  ar: {
    layout: {
      sectionsAria: "أقسام Settings",
      sections: {
        overview: "نظرة عامة",
        quickSetup: "Quick Setup",
        appearance: "المظهر و sync",
        advanced: "متقدم",
      },
      overview: {
        aria: "نظرة عامة على Settings",
        eyebrow: "نظرة عامة على Settings",
        title: "ابدأ بمسار الحساب الشخصي",
        detail:
          "معظم المستخدمين الشخصيين يحتاجون فقط Quick Setup واللغة/الثيم و sync controls. غيّر الوضع أدناه لتحديد مقدار team/API setup و diagnostics المعروض.",
      },
      summary: {
        enabled: "مفعلة",
        connected: "متصلة",
        needsAction: "تحتاج إجراء",
        storedSecrets: "secrets محفوظة",
        boundPages: "صفحات مرتبطة",
      },
      userLevel: {
        label: "مستوى العرض",
        helpText:
          "Basic يبقي Settings مركزة على المسار الشائع. Advanced و Developer و Debug تعرض تدريجيا team/API setup و source controls و diagnostics أعمق.",
        options: {
          basic: "Basic",
          advanced: "Advanced",
          developer: "Developer",
          debug: "Debug",
        },
      },
      advanced: {
        eyebrow: "متقدم",
        title: "Team / API / source controls",
        detail:
          "افتح هذا فقط عندما تحتاج إعداد team أو enterprise أو تغييرات source preference أو إدارة page-binding.",
        show: "إظهار Settings المتقدمة",
        hide: "إخفاء Settings المتقدمة",
        itemCount: (count) => `${count} مجموعات`,
      },
    },
    quickSetup: {
      eyebrow: "Quick Setup",
      title: "إعداد providers بالطريق الشائع",
      detail:
        "يركز هذا القسم على مهام الحساب الشخصي الشائعة: تفعيل provider ومنح browser access وفتح usage page والتحقق من الاتصال.",
      currentSetupLabel: "setup الحالي",
      nextStepLabel: "الخطوة التالية المقترحة",
      visibilityLabel: "إظهار في dashboard",
      pageStatusLabel: "حالة الصفحة",
      noActionNeeded: "لا حاجة لإجراء إضافي الآن",
      disabledProvidersSummary: (count) => `providers إضافية (${count})`,
      hideDisabledProviders: "إخفاء providers إضافية",
      firstProvider: {
        eyebrow: "الخطوة الأولى المقترحة",
        statusLabel: "مقترح",
        title: (provider) => `ابدأ بـ ${provider}`,
        detail: (provider) =>
          `فعّل ${provider} أولا. سيقودك Quick Setup عبر browser access و usage page والتحقق من اتصال provider. يمكنك اختيار provider آخر من More providers.`,
        action: (provider) => `تفعيل ${provider}`,
        moreHint: "تفضل أداة أخرى؟ افتح More providers أدناه.",
      },
      currentSetup: {
        disabled: "متوقف",
        sessionPage: "usage page مسجلة الدخول",
        savedConnection: "team / API config محفوظة",
        policyOnly: "policy موثقة فقط",
      },
      helperText: {
        disabled:
          "فعّل هذا provider عندما تريد إعادته إلى dashboard و refresh flow.",
        readySessionPage:
          "هذا provider يزامن من usage page مسجلة الدخول في هذا المتصفح.",
        readyCredential:
          "هذا provider يزامن من team أو enterprise config محفوظة في browser profile هذا.",
        policyOnly:
          "هذا provider يعرض حاليا الحدود الموثقة فقط ولا يدعي وجود live personal usage.",
        hostAccessMissing: (hosts) =>
          `يلزم browser access إلى ${hosts} قبل متابعة live sync.`,
        credentialMissingBasic:
          "إذا كنت تحتاج فعلا مسار team أو enterprise API، انتقل أولا إلى Advanced mode.",
        credentialMissingAdvanced:
          "إذا كنت تحتاج مسار team أو enterprise API، أكمل credential setup في Advanced.",
        openPageRequired: "افتح provider usage page أولا، ثم عد وقم بالrefresh.",
        loggedOut:
          "افتح provider usage page وسجل الدخول مرة أخرى قبل إعادة المحاولة.",
        captureUnavailable:
          "الصفحة مفتوحة، لكن session الحالية غير قابلة للقراءة. أعد فتح الصفحة وجرب مرة أخرى.",
        syncError:
          "آخر sync لم يكتمل بنجاح. ابدأ بإعادة فتح source page أو مراجعة advanced source controls.",
      },
      actions: {
        enableProvider: "تفعيل provider",
        disableProvider: "إخفاء provider",
        grantAccess: "منح access",
        openUsagePage: "فتح usage page",
        openAndSignIn: "فتح الصفحة وتسجيل الدخول",
        retryPage: "إعادة محاولة الصفحة",
        openSourcePage: "فتح source page",
        useCurrentPage: "استخدام الصفحة الحالية",
        disconnectPage: "فصل الصفحة",
      },
    },
    preferences: {
      showMore: "المزيد",
      hideMore: "أقل",
      detail:
        "لغة app وشكل popup ونمط quota لكل surface موجودة هنا عند الحاجة.",
    },
    themeCustomization: {
      previewingSeed: (seed, mode) =>
        `معاينة ${seed} للوحة ${mode === "dark" ? "داكنة" : "فاتحة"} الحالية. عند التطبيق، يتحول accent preset إلى Custom Seed.`,
      customSeedMissing:
        "تم اختيار Custom Seed، لكن لا يوجد seed محفوظ صالح بعد. تبقى default accent roles فعالة حتى تطبق قيمة #RRGGBB صالحة.",
      enterValidSeed:
        "أدخل قيمة #RRGGBB صالحة لإنشاء custom accent palette بدون فتح raw token editing.",
    },
  },
  hi: {
    layout: {
      sectionsAria: "Settings sections",
      sections: {
        overview: "Overview",
        quickSetup: "Quick Setup",
        appearance: "Appearance और sync",
        advanced: "Advanced",
      },
      overview: {
        aria: "Settings overview",
        eyebrow: "Settings overview",
        title: "personal-account path से शुरू करें",
        detail:
          "अधिकांश personal users को सिर्फ Quick Setup, language/theme और sync controls चाहिए। नीचे mode बदलकर तय करें कि कितना team/API setup और diagnostics दिखे।",
      },
      summary: {
        enabled: "Enabled",
        connected: "Connected",
        needsAction: "Action चाहिए",
        storedSecrets: "Stored secrets",
        boundPages: "Bound pages",
      },
      userLevel: {
        label: "Display level",
        helpText:
          "Basic mode Settings को common path पर रखता है। Advanced, Developer और Debug धीरे-धीरे team/API setup, source controls और deeper diagnostics दिखाते हैं।",
        options: {
          basic: "Basic",
          advanced: "Advanced",
          developer: "Developer",
          debug: "Debug",
        },
      },
      advanced: {
        eyebrow: "Advanced",
        title: "Team / API / source controls",
        detail:
          "इसे तभी खोलें जब team या enterprise config, source preference changes या page-binding management चाहिए।",
        show: "Advanced Settings दिखाएं",
        hide: "Advanced Settings छिपाएं",
        itemCount: (count) => `${count} groups`,
      },
    },
    quickSetup: {
      eyebrow: "Quick Setup",
      title: "normal-user तरीके से providers set up करें",
      detail:
        "यह section common personal-account tasks पर केंद्रित है: provider enable करना, browser access देना, usage page खोलना, और connected status जांचना।",
      currentSetupLabel: "Current setup",
      nextStepLabel: "Recommended next step",
      visibilityLabel: "dashboard पर दिखाएं",
      pageStatusLabel: "Page status",
      noActionNeeded: "अभी कोई extra action नहीं चाहिए",
      disabledProvidersSummary: (count) => `More providers (${count})`,
      hideDisabledProviders: "More providers छिपाएं",
      firstProvider: {
        eyebrow: "Suggested first step",
        statusLabel: "Recommended",
        title: (provider) => `${provider} से शुरू करें`,
        detail: (provider) =>
          `पहले ${provider} enable करें। Quick Setup फिर browser access, usage page और provider connection check में guide करेगा। More providers में दूसरा provider चुन सकते हैं।`,
        action: (provider) => `${provider} enable करें`,
        moreHint: "दूसरा tool चाहिए? नीचे More providers खोलें।",
      },
      currentSetup: {
        disabled: "Turned off",
        sessionPage: "Signed-in usage page",
        savedConnection: "Saved team / API config",
        policyOnly: "Documented policy only",
      },
      helperText: {
        disabled:
          "इस provider को dashboard और refresh flow में वापस लाने के लिए इसे on करें।",
        readySessionPage:
          "यह provider इस browser में signed-in usage page से sync करता है।",
        readyCredential:
          "यह provider इस browser profile में saved team या enterprise config से sync करता है।",
        policyOnly:
          "यह provider अभी documented limits ही दिखाता है और live personal usage का दावा नहीं करता।",
        hostAccessMissing: (hosts) =>
          `live sync जारी रखने से पहले ${hosts} के लिए browser access चाहिए।`,
        credentialMissingBasic:
          "अगर team या enterprise API path सच में चाहिए, पहले Advanced mode पर जाएं।",
        credentialMissingAdvanced:
          "अगर team या enterprise API path चाहिए, Advanced में credential setup पूरा करें।",
        openPageRequired:
          "पहले provider usage page खोलें, फिर वापस आकर refresh करें।",
        loggedOut:
          "provider usage page खोलकर फिर sign in करें, फिर retry करें।",
        captureUnavailable:
          "page खुला है, लेकिन current session पढ़ी नहीं जा सकती। page फिर खोलकर retry करें।",
        syncError:
          "last sync सफल नहीं हुआ। source page फिर खोलें या advanced source controls जांचें।",
      },
      actions: {
        enableProvider: "provider enable करें",
        disableProvider: "provider छिपाएं",
        grantAccess: "access दें",
        openUsagePage: "usage page खोलें",
        openAndSignIn: "page खोलें और sign in करें",
        retryPage: "page retry करें",
        openSourcePage: "source page खोलें",
        useCurrentPage: "current page इस्तेमाल करें",
        disconnectPage: "page disconnect करें",
      },
    },
    preferences: {
      showMore: "More",
      hideMore: "Less",
      detail:
        "App language, popup shape और per-surface quota styling जरूरत पड़ने पर यहां मिलते हैं।",
    },
    themeCustomization: {
      previewingSeed: (seed, mode) =>
        `current ${mode === "dark" ? "dark" : "light"} palette के लिए ${seed} preview हो रहा है। Apply करने पर accent preset Custom Seed हो जाएगा।`,
      customSeedMissing:
        "Custom Seed selected है, लेकिन valid saved seed अभी उपलब्ध नहीं है। valid #RRGGBB apply होने तक default accent roles active रहेंगे।",
      enterValidSeed:
        "raw token editing खोले बिना custom accent palette बनाने के लिए valid #RRGGBB value डालें।",
    },
  },
  id: {
    layout: {
      sectionsAria: "Bagian Settings",
      sections: {
        overview: "Ringkasan",
        quickSetup: "Quick Setup",
        appearance: "Tampilan & sync",
        advanced: "Advanced",
      },
      overview: {
        aria: "Ringkasan Settings",
        eyebrow: "Ringkasan Settings",
        title: "Mulai dari jalur akun personal",
        detail:
          "Sebagian besar pengguna personal hanya perlu Quick Setup, bahasa/tema, dan sync controls. Ubah mode di bawah untuk menentukan seberapa banyak team/API setup dan diagnostics ditampilkan.",
      },
      summary: {
        enabled: "Aktif",
        connected: "Terhubung",
        needsAction: "Perlu tindakan",
        storedSecrets: "Secrets tersimpan",
        boundPages: "Halaman tertaut",
      },
      userLevel: {
        label: "Level tampilan",
        helpText:
          "Basic menjaga Settings tetap fokus pada jalur umum. Advanced, Developer, dan Debug bertahap menampilkan team/API setup, source controls, dan diagnostics yang lebih dalam.",
        options: {
          basic: "Basic",
          advanced: "Advanced",
          developer: "Developer",
          debug: "Debug",
        },
      },
      advanced: {
        eyebrow: "Advanced",
        title: "Team / API / source controls",
        detail:
          "Buka ini hanya saat perlu konfigurasi team atau enterprise, perubahan source preference, atau pengelolaan page-binding.",
        show: "Tampilkan Settings advanced",
        hide: "Sembunyikan Settings advanced",
        itemCount: (count) => `${count} grup`,
      },
    },
    quickSetup: {
      eyebrow: "Quick Setup",
      title: "Setup provider lewat jalur pengguna normal",
      detail:
        "Bagian ini fokus pada tugas akun personal yang umum: mengaktifkan provider, memberi browser access, membuka usage page, dan memeriksa apakah provider sudah terhubung.",
      currentSetupLabel: "Setup saat ini",
      nextStepLabel: "Langkah berikutnya",
      visibilityLabel: "Tampilkan di dashboard",
      pageStatusLabel: "Status halaman",
      noActionNeeded: "Tidak perlu tindakan tambahan sekarang",
      disabledProvidersSummary: (count) => `Provider lain (${count})`,
      hideDisabledProviders: "Sembunyikan provider lain",
      firstProvider: {
        eyebrow: "Langkah pertama yang disarankan",
        statusLabel: "Disarankan",
        title: (provider) => `Mulai dengan ${provider}`,
        detail: (provider) =>
          `Aktifkan ${provider} terlebih dahulu. Quick Setup akan memandu browser access, usage page, dan apakah provider sudah terhubung. Anda bisa memilih provider lain di More providers.`,
        action: (provider) => `Aktifkan ${provider}`,
        moreHint: "Lebih suka tool lain? Buka More providers di bawah.",
      },
      currentSetup: {
        disabled: "Dimatikan",
        sessionPage: "Usage page sudah login",
        savedConnection: "Config team / API tersimpan",
        policyOnly: "Hanya policy terdokumentasi",
      },
      helperText: {
        disabled:
          "Aktifkan provider ini saat ingin mengembalikannya ke dashboard dan refresh flow.",
        readySessionPage:
          "Provider ini sync dari usage page yang sudah login di browser ini.",
        readyCredential:
          "Provider ini sync dari konfigurasi team atau enterprise yang tersimpan di browser profile ini.",
        policyOnly:
          "Provider ini hanya menampilkan batas terdokumentasi dan tidak mengklaim live personal usage.",
        hostAccessMissing: (hosts) =>
          `Browser access ke ${hosts} diperlukan sebelum live sync berlanjut.`,
        credentialMissingBasic:
          "Jika benar-benar perlu jalur team atau enterprise API, pindah dulu ke Advanced mode.",
        credentialMissingAdvanced:
          "Jika perlu jalur team atau enterprise API, selesaikan credential setup di Advanced.",
        openPageRequired:
          "Buka provider usage page terlebih dahulu, lalu kembali dan refresh.",
        loggedOut:
          "Buka provider usage page dan login lagi sebelum mencoba ulang.",
        captureUnavailable:
          "Halaman terbuka, tetapi session saat ini tidak bisa dibaca. Buka ulang halaman dan coba lagi.",
        syncError:
          "Sync terakhir tidak berhasil. Mulai dengan membuka ulang source page atau memeriksa advanced source controls.",
      },
      actions: {
        enableProvider: "Aktifkan provider",
        disableProvider: "Sembunyikan provider",
        grantAccess: "Beri access",
        openUsagePage: "Buka usage page",
        openAndSignIn: "Buka halaman dan login",
        retryPage: "Coba ulang halaman",
        openSourcePage: "Buka source page",
        useCurrentPage: "Gunakan halaman saat ini",
        disconnectPage: "Putuskan halaman",
      },
    },
    preferences: {
      showMore: "Lainnya",
      hideMore: "Lebih sedikit",
      detail:
        "Bahasa app, bentuk popup, dan gaya quota per surface ada di sini saat diperlukan.",
    },
    themeCustomization: {
      previewingSeed: (seed, mode) =>
        `Preview ${seed} untuk palette ${mode === "dark" ? "gelap" : "terang"} saat ini. Saat diterapkan, accent preset berubah ke Custom Seed.`,
      customSeedMissing:
        "Custom Seed dipilih, tetapi belum ada seed tersimpan yang valid. Default accent roles tetap aktif sampai #RRGGBB valid diterapkan.",
      enterValidSeed:
        "Masukkan nilai #RRGGBB valid untuk membuat custom accent palette tanpa membuka raw token editing.",
    },
  },
};

export function getSettingsCoreCopy(
  locale: ResolvedAppLocale,
): SettingsCoreCopyText | null {
  if (locale === "en" || locale === "zh-CN") {
    return null;
  }

  return SETTINGS_CORE_COPY[locale];
}

export function buildLocalizedSettingsCoreSections(
  i18n: RuntimeI18n,
  copy: SettingsCoreCopyText,
) {
  return {
    layout: {
      ...copy.layout,
      advanced: {
        ...copy.layout.advanced,
        itemCount: (count: number) =>
          copy.layout.advanced.itemCount(i18n.formatNumber(count)),
      },
    },
    quickSetup: {
      ...copy.quickSetup,
      showTeamApiProviders:
        copy.quickSetup.showTeamApiProviders ?? "Show team/API providers",
      hideTeamApiProviders:
        copy.quickSetup.hideTeamApiProviders ?? "Hide team/API providers",
      disabledProvidersSummary: (count: number) =>
        copy.quickSetup.disabledProvidersSummary(i18n.formatNumber(count)),
    },
    preferences: copy.preferences,
    themeCustomization: copy.themeCustomization,
  } as const;
}
