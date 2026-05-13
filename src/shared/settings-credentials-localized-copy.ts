import type { ResolvedAppLocale } from "./i18n";

type SettingsCredentialsLocalizedLocale = Exclude<
  ResolvedAppLocale,
  "en" | "zh-CN"
>;

export type SettingsCredentialsCopyText = {
  sectionLabel: string;
  configured: string;
  missing: string;
  saveKey: string;
  clearStoredKey: string;
  saveConfig: string;
  clearStoredConfig: string;
  adminApiKeyLabel: string;
  analyticsApiKeyLabel: string;
  workspaceIdLabel: string;
  cursorTitle: string;
  cursorHelpText: string;
  cursorFooterText: string;
  cursorPlaceholderMissing: string;
  cursorPlaceholderConfigured: string;
  claudeTitle: string;
  claudeHelpText: string;
  claudeFooterText: string;
  claudePlaceholderMissing: string;
  claudePlaceholderConfigured: string;
  codexTitle: string;
  codexHelpText: string;
  codexFooterText: string;
  codexAnalyticsPlaceholderMissing: string;
  codexAnalyticsPlaceholderConfigured: string;
  codexWorkspacePlaceholderMissing: string;
  codexWorkspacePlaceholderConfigured: string;
};

export const SETTINGS_CREDENTIALS_COPY: Record<
  SettingsCredentialsLocalizedLocale,
  SettingsCredentialsCopyText
> = {
  "zh-TW": {
    sectionLabel: "Provider 憑據",
    configured: "已設定",
    missing: "缺失",
    saveKey: "儲存 key",
    clearStoredKey: "清除已存 key",
    saveConfig: "儲存 config",
    clearStoredConfig: "清除已存 config",
    adminApiKeyLabel: "Admin API key",
    analyticsApiKeyLabel: "Analytics API key",
    workspaceIdLabel: "Workspace ID",
    cursorTitle: "Cursor Team Admin API key",
    cursorHelpText:
      "只會儲存在目前 browser profile 的 extension-managed local storage。可選：需要 team-admin API path 時才設定；若只使用已登入 personal usage page，可以留空。",
    cursorFooterText:
      "僅限 team-admin scope。設定後，background worker 會向 `https://api.cursor.com` 送出請求並使用 Basic auth。personal usage-page sync 不需要此 key。",
    cursorPlaceholderMissing: "貼上 Cursor Admin API key",
    cursorPlaceholderConfigured: "已在本機設定。輸入新的 key 可取代舊值。",
    claudeTitle: "Claude Code Analytics Admin API key",
    claudeHelpText:
      "只會儲存在目前 browser profile 的 extension-managed local storage。支援的 v1 Claude organization analytics path 需要它。",
    claudeFooterText:
      "僅限 Admin API scope。background worker 會向 `https://api.anthropic.com/v1/organizations/usage_report/claude_code` 送出請求，並帶上 `x-api-key` 與 `anthropic-version` headers。",
    claudePlaceholderMissing: "貼上 Anthropic Admin API key",
    claudePlaceholderConfigured: "已在本機設定。輸入新的 key 可取代舊值。",
    codexTitle: "Codex Enterprise analytics config",
    codexHelpText:
      "只會儲存在目前 browser profile 的 extension-managed local storage。這是可選項，只在需要 Enterprise analytics path 時使用。personal Codex usage-page sync 不需要 analytics key 或 workspace ID。",
    codexFooterText:
      "只有要使用 Enterprise workspace path 時，才需要 Codex analytics 的 Platform API key 和 ChatGPT admin console 的 workspace ID。請求會送往 `https://api.chatgpt.com/v1/analytics/codex`。",
    codexAnalyticsPlaceholderMissing: "貼上 Codex analytics API key",
    codexAnalyticsPlaceholderConfigured:
      "已在本機設定。輸入新的 analytics key 可取代舊值。",
    codexWorkspacePlaceholderMissing: "貼上 Codex workspace ID",
    codexWorkspacePlaceholderConfigured:
      "已在本機設定。輸入新的 workspace ID 可取代舊值。",
  },
  ja: {
    sectionLabel: "Provider credentials",
    configured: "設定済み",
    missing: "未設定",
    saveKey: "key を保存",
    clearStoredKey: "保存済み key を削除",
    saveConfig: "config を保存",
    clearStoredConfig: "保存済み config を削除",
    adminApiKeyLabel: "Admin API key",
    analyticsApiKeyLabel: "Analytics API key",
    workspaceIdLabel: "Workspace ID",
    cursorTitle: "Cursor Team Admin API key",
    cursorHelpText:
      "この browser profile の extension-managed local storage にのみ保存されます。team-admin API path を使う場合だけ任意で設定し、ログイン済み personal usage page だけを使うなら空のままで構いません。",
    cursorFooterText:
      "team-admin scope のみ。設定すると background worker が `https://api.cursor.com` に Basic auth でリクエストします。personal usage-page sync にはこの key は不要です。",
    cursorPlaceholderMissing: "Cursor Admin API key を貼り付け",
    cursorPlaceholderConfigured: "ローカル設定済み。新しい key で置き換えます。",
    claudeTitle: "Claude Code Analytics Admin API key",
    claudeHelpText:
      "この browser profile の extension-managed local storage にのみ保存されます。対応済み v1 Claude organization analytics path で必要です。",
    claudeFooterText:
      "Admin API scope のみ。background worker が `https://api.anthropic.com/v1/organizations/usage_report/claude_code` に `x-api-key` と `anthropic-version` headers 付きで送信します。",
    claudePlaceholderMissing: "Anthropic Admin API key を貼り付け",
    claudePlaceholderConfigured: "ローカル設定済み。新しい key で置き換えます。",
    codexTitle: "Codex Enterprise analytics config",
    codexHelpText:
      "この browser profile の extension-managed local storage にのみ保存されます。Enterprise analytics path が必要な場合だけ使う任意設定です。personal Codex usage-page sync には analytics key も workspace ID も不要です。",
    codexFooterText:
      "Enterprise workspace path を使う場合だけ、Codex analytics 用 Platform API key と ChatGPT admin console の workspace ID を設定します。リクエスト先は `https://api.chatgpt.com/v1/analytics/codex` です。",
    codexAnalyticsPlaceholderMissing: "Codex analytics API key を貼り付け",
    codexAnalyticsPlaceholderConfigured:
      "ローカル設定済み。新しい analytics key で置き換えます。",
    codexWorkspacePlaceholderMissing: "Codex workspace ID を貼り付け",
    codexWorkspacePlaceholderConfigured:
      "ローカル設定済み。新しい workspace ID で置き換えます。",
  },
  ko: {
    sectionLabel: "Provider credentials",
    configured: "설정됨",
    missing: "없음",
    saveKey: "key 저장",
    clearStoredKey: "저장된 key 지우기",
    saveConfig: "config 저장",
    clearStoredConfig: "저장된 config 지우기",
    adminApiKeyLabel: "Admin API key",
    analyticsApiKeyLabel: "Analytics API key",
    workspaceIdLabel: "Workspace ID",
    cursorTitle: "Cursor Team Admin API key",
    cursorHelpText:
      "현재 browser profile의 extension-managed local storage에만 저장됩니다. team-admin API path를 사용할 때만 선택적으로 설정하고, 로그인된 personal usage page만 쓸 경우 비워 두세요.",
    cursorFooterText:
      "team-admin scope 전용입니다. 설정하면 background worker가 `https://api.cursor.com`으로 Basic auth 요청을 보냅니다. personal usage-page sync에는 이 key가 필요하지 않습니다.",
    cursorPlaceholderMissing: "Cursor Admin API key 붙여넣기",
    cursorPlaceholderConfigured: "로컬에 설정됨. 새 key를 입력하면 교체됩니다.",
    claudeTitle: "Claude Code Analytics Admin API key",
    claudeHelpText:
      "현재 browser profile의 extension-managed local storage에만 저장됩니다. 지원되는 v1 Claude organization analytics path에 필요합니다.",
    claudeFooterText:
      "Admin API scope 전용입니다. background worker가 `https://api.anthropic.com/v1/organizations/usage_report/claude_code`로 `x-api-key`와 `anthropic-version` headers를 포함해 요청합니다.",
    claudePlaceholderMissing: "Anthropic Admin API key 붙여넣기",
    claudePlaceholderConfigured: "로컬에 설정됨. 새 key를 입력하면 교체됩니다.",
    codexTitle: "Codex Enterprise analytics config",
    codexHelpText:
      "현재 browser profile의 extension-managed local storage에만 저장됩니다. Enterprise analytics path가 필요할 때만 쓰는 선택 설정입니다. personal Codex usage-page sync에는 analytics key나 workspace ID가 필요하지 않습니다.",
    codexFooterText:
      "Enterprise workspace path를 사용할 때만 Codex analytics용 Platform API key와 ChatGPT admin console의 workspace ID를 설정하세요. 요청은 `https://api.chatgpt.com/v1/analytics/codex`로 전송됩니다.",
    codexAnalyticsPlaceholderMissing: "Codex analytics API key 붙여넣기",
    codexAnalyticsPlaceholderConfigured:
      "로컬에 설정됨. 새 analytics key를 입력하면 교체됩니다.",
    codexWorkspacePlaceholderMissing: "Codex workspace ID 붙여넣기",
    codexWorkspacePlaceholderConfigured:
      "로컬에 설정됨. 새 workspace ID를 입력하면 교체됩니다.",
  },
  "es-419": {
    sectionLabel: "Credenciales de provider",
    configured: "Configurado",
    missing: "Falta",
    saveKey: "Guardar key",
    clearStoredKey: "Borrar key guardada",
    saveConfig: "Guardar config",
    clearStoredConfig: "Borrar config guardada",
    adminApiKeyLabel: "Admin API key",
    analyticsApiKeyLabel: "Analytics API key",
    workspaceIdLabel: "Workspace ID",
    cursorTitle: "Cursor Team Admin API key",
    cursorHelpText:
      "Se guarda solo en extension-managed local storage de este browser profile. Opcional: configuralo para el team-admin API path, o dejalo vacio si usaras la personal usage page con sesion iniciada.",
    cursorFooterText:
      "Solo team-admin scope. Al configurarlo, el background worker envia requests a `https://api.cursor.com` con Basic auth. personal usage-page sync no requiere esta key.",
    cursorPlaceholderMissing: "Pega una Cursor Admin API key",
    cursorPlaceholderConfigured:
      "Configurado localmente. Ingresa una key nueva para reemplazarla.",
    claudeTitle: "Claude Code Analytics Admin API key",
    claudeHelpText:
      "Se guarda solo en extension-managed local storage de este browser profile. Es necesaria para el v1 Claude organization analytics path soportado.",
    claudeFooterText:
      "Solo Admin API scope. El background worker envia requests a `https://api.anthropic.com/v1/organizations/usage_report/claude_code` con headers `x-api-key` y `anthropic-version`.",
    claudePlaceholderMissing: "Pega una Anthropic Admin API key",
    claudePlaceholderConfigured:
      "Configurado localmente. Ingresa una key nueva para reemplazarla.",
    codexTitle: "Codex Enterprise analytics config",
    codexHelpText:
      "Se guarda solo en extension-managed local storage de este browser profile. Es opcional y solo hace falta para Enterprise analytics path. personal Codex usage-page sync no requiere analytics key ni workspace ID.",
    codexFooterText:
      "Configura una Platform API key para Codex analytics y el workspace ID de ChatGPT admin console solo si quieres Enterprise workspace path. Los requests van a `https://api.chatgpt.com/v1/analytics/codex`.",
    codexAnalyticsPlaceholderMissing: "Pega una Codex analytics API key",
    codexAnalyticsPlaceholderConfigured:
      "Configurado localmente. Ingresa una analytics key nueva para reemplazarla.",
    codexWorkspacePlaceholderMissing: "Pega el Codex workspace ID",
    codexWorkspacePlaceholderConfigured:
      "Configurado localmente. Ingresa un workspace ID nuevo para reemplazarlo.",
  },
  "pt-BR": {
    sectionLabel: "Credenciais do provider",
    configured: "Configurado",
    missing: "Ausente",
    saveKey: "Salvar key",
    clearStoredKey: "Limpar key salva",
    saveConfig: "Salvar config",
    clearStoredConfig: "Limpar config salva",
    adminApiKeyLabel: "Admin API key",
    analyticsApiKeyLabel: "Analytics API key",
    workspaceIdLabel: "Workspace ID",
    cursorTitle: "Cursor Team Admin API key",
    cursorHelpText:
      "Armazenado apenas no extension-managed local storage deste browser profile. Opcional: configure para o team-admin API path ou deixe vazio se for usar a personal usage page logada.",
    cursorFooterText:
      "Somente team-admin scope. Quando configurado, o background worker envia requests para `https://api.cursor.com` com Basic auth. personal usage-page sync nao requer esta key.",
    cursorPlaceholderMissing: "Cole uma Cursor Admin API key",
    cursorPlaceholderConfigured:
      "Configurado localmente. Informe uma nova key para substituir.",
    claudeTitle: "Claude Code Analytics Admin API key",
    claudeHelpText:
      "Armazenado apenas no extension-managed local storage deste browser profile. Necessario para o v1 Claude organization analytics path suportado.",
    claudeFooterText:
      "Somente Admin API scope. O background worker envia requests para `https://api.anthropic.com/v1/organizations/usage_report/claude_code` com headers `x-api-key` e `anthropic-version`.",
    claudePlaceholderMissing: "Cole uma Anthropic Admin API key",
    claudePlaceholderConfigured:
      "Configurado localmente. Informe uma nova key para substituir.",
    codexTitle: "Codex Enterprise analytics config",
    codexHelpText:
      "Armazenado apenas no extension-managed local storage deste browser profile. E opcional e so necessario para Enterprise analytics path. personal Codex usage-page sync nao requer analytics key nem workspace ID.",
    codexFooterText:
      "Configure uma Platform API key para Codex analytics e o workspace ID do ChatGPT admin console apenas se quiser Enterprise workspace path. Requests vao para `https://api.chatgpt.com/v1/analytics/codex`.",
    codexAnalyticsPlaceholderMissing: "Cole uma Codex analytics API key",
    codexAnalyticsPlaceholderConfigured:
      "Configurado localmente. Informe uma nova analytics key para substituir.",
    codexWorkspacePlaceholderMissing: "Cole o Codex workspace ID",
    codexWorkspacePlaceholderConfigured:
      "Configurado localmente. Informe um novo workspace ID para substituir.",
  },
  fr: {
    sectionLabel: "Credentials provider",
    configured: "Configure",
    missing: "Manquant",
    saveKey: "Enregistrer key",
    clearStoredKey: "Effacer la key enregistree",
    saveConfig: "Enregistrer config",
    clearStoredConfig: "Effacer la config enregistree",
    adminApiKeyLabel: "Admin API key",
    analyticsApiKeyLabel: "Analytics API key",
    workspaceIdLabel: "Workspace ID",
    cursorTitle: "Cursor Team Admin API key",
    cursorHelpText:
      "Stocke seulement dans l'extension-managed local storage de ce browser profile. Optionnel : utilisez-le pour le team-admin API path, ou laissez vide si vous utilisez seulement la personal usage page connectee.",
    cursorFooterText:
      "Scope team-admin seulement. Une fois configure, le background worker envoie des requests vers `https://api.cursor.com` avec Basic auth. personal usage-page sync n'a pas besoin de cette key.",
    cursorPlaceholderMissing: "Coller une Cursor Admin API key",
    cursorPlaceholderConfigured:
      "Configure localement. Entrez une nouvelle key pour remplacer l'ancienne.",
    claudeTitle: "Claude Code Analytics Admin API key",
    claudeHelpText:
      "Stocke seulement dans l'extension-managed local storage de ce browser profile. Requis pour le v1 Claude organization analytics path pris en charge.",
    claudeFooterText:
      "Scope Admin API seulement. Les requests partent du background worker vers `https://api.anthropic.com/v1/organizations/usage_report/claude_code` avec les headers `x-api-key` et `anthropic-version`.",
    claudePlaceholderMissing: "Coller une Anthropic Admin API key",
    claudePlaceholderConfigured:
      "Configure localement. Entrez une nouvelle key pour remplacer l'ancienne.",
    codexTitle: "Codex Enterprise analytics config",
    codexHelpText:
      "Stocke seulement dans l'extension-managed local storage de ce browser profile. C'est optionnel et necessaire seulement pour l'Enterprise analytics path. personal Codex usage-page sync n'exige ni analytics key ni workspace ID.",
    codexFooterText:
      "Utilisez une Platform API key pour Codex analytics et le workspace ID depuis ChatGPT admin console seulement si vous voulez l'Enterprise workspace path. Les requests vont vers `https://api.chatgpt.com/v1/analytics/codex`.",
    codexAnalyticsPlaceholderMissing: "Coller une Codex analytics API key",
    codexAnalyticsPlaceholderConfigured:
      "Configure localement. Entrez une nouvelle analytics key pour remplacer l'ancienne.",
    codexWorkspacePlaceholderMissing: "Coller le Codex workspace ID",
    codexWorkspacePlaceholderConfigured:
      "Configure localement. Entrez un nouveau workspace ID pour remplacer l'ancien.",
  },
  de: {
    sectionLabel: "Provider credentials",
    configured: "Konfiguriert",
    missing: "Fehlt",
    saveKey: "key speichern",
    clearStoredKey: "Gespeicherte key loeschen",
    saveConfig: "config speichern",
    clearStoredConfig: "Gespeicherte config loeschen",
    adminApiKeyLabel: "Admin API key",
    analyticsApiKeyLabel: "Analytics API key",
    workspaceIdLabel: "Workspace ID",
    cursorTitle: "Cursor Team Admin API key",
    cursorHelpText:
      "Wird nur im extension-managed local storage dieses browser profile gespeichert. Optional: fuer den team-admin API path nutzen oder leer lassen, wenn nur die angemeldete personal usage page verwendet wird.",
    cursorFooterText:
      "Nur team-admin scope. Nach der Konfiguration sendet der background worker Requests an `https://api.cursor.com` mit Basic auth. personal usage-page sync benoetigt diese key nicht.",
    cursorPlaceholderMissing: "Cursor Admin API key einfuegen",
    cursorPlaceholderConfigured:
      "Lokal konfiguriert. Neue key eingeben, um sie zu ersetzen.",
    claudeTitle: "Claude Code Analytics Admin API key",
    claudeHelpText:
      "Wird nur im extension-managed local storage dieses browser profile gespeichert. Fuer den unterstuetzten v1 Claude organization analytics path erforderlich.",
    claudeFooterText:
      "Nur Admin API scope. Requests gehen vom background worker an `https://api.anthropic.com/v1/organizations/usage_report/claude_code` mit den Headers `x-api-key` und `anthropic-version`.",
    claudePlaceholderMissing: "Anthropic Admin API key einfuegen",
    claudePlaceholderConfigured:
      "Lokal konfiguriert. Neue key eingeben, um sie zu ersetzen.",
    codexTitle: "Codex Enterprise analytics config",
    codexHelpText:
      "Wird nur im extension-managed local storage dieses browser profile gespeichert. Optional und nur fuer den Enterprise analytics path noetig. personal Codex usage-page sync benoetigt weder analytics key noch workspace ID.",
    codexFooterText:
      "Platform API key fuer Codex analytics und workspace ID aus der ChatGPT admin console nur verwenden, wenn der Enterprise workspace path gewuenscht ist. Requests gehen an `https://api.chatgpt.com/v1/analytics/codex`.",
    codexAnalyticsPlaceholderMissing: "Codex analytics API key einfuegen",
    codexAnalyticsPlaceholderConfigured:
      "Lokal konfiguriert. Neue analytics key eingeben, um sie zu ersetzen.",
    codexWorkspacePlaceholderMissing: "Codex workspace ID einfuegen",
    codexWorkspacePlaceholderConfigured:
      "Lokal konfiguriert. Neue workspace ID eingeben, um sie zu ersetzen.",
  },
  it: {
    sectionLabel: "Credentials provider",
    configured: "Configurato",
    missing: "Mancante",
    saveKey: "Salva key",
    clearStoredKey: "Cancella key salvata",
    saveConfig: "Salva config",
    clearStoredConfig: "Cancella config salvata",
    adminApiKeyLabel: "Admin API key",
    analyticsApiKeyLabel: "Analytics API key",
    workspaceIdLabel: "Workspace ID",
    cursorTitle: "Cursor Team Admin API key",
    cursorHelpText:
      "Salvata solo nell'extension-managed local storage di questo browser profile. Facoltativa: usala per il team-admin API path, oppure lasciala vuota se usi solo la personal usage page con accesso.",
    cursorFooterText:
      "Solo team-admin scope. Quando configurata, le richieste partono dal background worker verso `https://api.cursor.com` con Basic auth. personal usage-page sync non richiede questa key.",
    cursorPlaceholderMissing: "Incolla una Cursor Admin API key",
    cursorPlaceholderConfigured:
      "Configurata localmente. Inserisci una nuova key per sostituirla.",
    claudeTitle: "Claude Code Analytics Admin API key",
    claudeHelpText:
      "Salvata solo nell'extension-managed local storage di questo browser profile. Necessaria per il v1 Claude organization analytics path supportato.",
    claudeFooterText:
      "Solo Admin API scope. Le richieste partono dal background worker verso `https://api.anthropic.com/v1/organizations/usage_report/claude_code` con headers `x-api-key` e `anthropic-version`.",
    claudePlaceholderMissing: "Incolla una Anthropic Admin API key",
    claudePlaceholderConfigured:
      "Configurata localmente. Inserisci una nuova key per sostituirla.",
    codexTitle: "Codex Enterprise analytics config",
    codexHelpText:
      "Salvata solo nell'extension-managed local storage di questo browser profile. E facoltativa e serve solo per l'Enterprise analytics path. personal Codex usage-page sync non richiede analytics key o workspace ID.",
    codexFooterText:
      "Usa una Platform API key per Codex analytics e il workspace ID dalla ChatGPT admin console solo se vuoi l'Enterprise workspace path. Le richieste vanno a `https://api.chatgpt.com/v1/analytics/codex`.",
    codexAnalyticsPlaceholderMissing: "Incolla una Codex analytics API key",
    codexAnalyticsPlaceholderConfigured:
      "Configurata localmente. Inserisci una nuova analytics key per sostituirla.",
    codexWorkspacePlaceholderMissing: "Incolla il Codex workspace ID",
    codexWorkspacePlaceholderConfigured:
      "Configurato localmente. Inserisci un nuovo workspace ID per sostituirlo.",
  },
  ru: {
    sectionLabel: "Provider credentials",
    configured: "Настроено",
    missing: "Отсутствует",
    saveKey: "Сохранить key",
    clearStoredKey: "Очистить сохраненную key",
    saveConfig: "Сохранить config",
    clearStoredConfig: "Очистить сохраненную config",
    adminApiKeyLabel: "Admin API key",
    analyticsApiKeyLabel: "Analytics API key",
    workspaceIdLabel: "Workspace ID",
    cursorTitle: "Cursor Team Admin API key",
    cursorHelpText:
      "Хранится только в extension-managed local storage этого browser profile. Необязательно: используйте для team-admin API path или оставьте пустым, если нужна только personal usage page с входом.",
    cursorFooterText:
      "Только team-admin scope. После настройки background worker отправляет requests на `https://api.cursor.com` с Basic auth. personal usage-page sync не требует эту key.",
    cursorPlaceholderMissing: "Вставьте Cursor Admin API key",
    cursorPlaceholderConfigured:
      "Настроено локально. Введите новую key для замены.",
    claudeTitle: "Claude Code Analytics Admin API key",
    claudeHelpText:
      "Хранится только в extension-managed local storage этого browser profile. Требуется для поддерживаемого v1 Claude organization analytics path.",
    claudeFooterText:
      "Только Admin API scope. Requests идут из background worker на `https://api.anthropic.com/v1/organizations/usage_report/claude_code` с headers `x-api-key` и `anthropic-version`.",
    claudePlaceholderMissing: "Вставьте Anthropic Admin API key",
    claudePlaceholderConfigured:
      "Настроено локально. Введите новую key для замены.",
    codexTitle: "Codex Enterprise analytics config",
    codexHelpText:
      "Хранится только в extension-managed local storage этого browser profile. Необязательно и нужно только для Enterprise analytics path. personal Codex usage-page sync не требует analytics key или workspace ID.",
    codexFooterText:
      "Используйте Platform API key для Codex analytics и workspace ID из ChatGPT admin console только для Enterprise workspace path. Requests идут на `https://api.chatgpt.com/v1/analytics/codex`.",
    codexAnalyticsPlaceholderMissing: "Вставьте Codex analytics API key",
    codexAnalyticsPlaceholderConfigured:
      "Настроено локально. Введите новую analytics key для замены.",
    codexWorkspacePlaceholderMissing: "Вставьте Codex workspace ID",
    codexWorkspacePlaceholderConfigured:
      "Настроено локально. Введите новый workspace ID для замены.",
  },
  ar: {
    sectionLabel: "credentials الخاصة بـ provider",
    configured: "تم الإعداد",
    missing: "مفقود",
    saveKey: "حفظ key",
    clearStoredKey: "مسح key المحفوظة",
    saveConfig: "حفظ config",
    clearStoredConfig: "مسح config المحفوظة",
    adminApiKeyLabel: "Admin API key",
    analyticsApiKeyLabel: "Analytics API key",
    workspaceIdLabel: "Workspace ID",
    cursorTitle: "Cursor Team Admin API key",
    cursorHelpText:
      "تُحفظ فقط في extension-managed local storage داخل browser profile هذا. اختيارية: استخدمها لمسار team-admin API، أو اتركها فارغة إذا كنت تستخدم personal usage page المسجلة الدخول.",
    cursorFooterText:
      "team-admin scope فقط. عند الإعداد، يرسل background worker الطلبات إلى `https://api.cursor.com` مع Basic auth. personal usage-page sync لا يحتاج هذه key.",
    cursorPlaceholderMissing: "الصق Cursor Admin API key",
    cursorPlaceholderConfigured: "تم الإعداد محليا. أدخل key جديدة للاستبدال.",
    claudeTitle: "Claude Code Analytics Admin API key",
    claudeHelpText:
      "تُحفظ فقط في extension-managed local storage داخل browser profile هذا. مطلوبة لمسار v1 Claude organization analytics المدعوم.",
    claudeFooterText:
      "Admin API scope فقط. يرسل background worker الطلبات إلى `https://api.anthropic.com/v1/organizations/usage_report/claude_code` مع headers `x-api-key` و `anthropic-version`.",
    claudePlaceholderMissing: "الصق Anthropic Admin API key",
    claudePlaceholderConfigured: "تم الإعداد محليا. أدخل key جديدة للاستبدال.",
    codexTitle: "Codex Enterprise analytics config",
    codexHelpText:
      "تُحفظ فقط في extension-managed local storage داخل browser profile هذا. اختيارية ولا تلزم إلا لمسار Enterprise analytics path. personal Codex usage-page sync لا يحتاج analytics key أو workspace ID.",
    codexFooterText:
      "استخدم Platform API key لـ Codex analytics و workspace ID من ChatGPT admin console فقط إذا كنت تريد Enterprise workspace path. الطلبات تذهب إلى `https://api.chatgpt.com/v1/analytics/codex`.",
    codexAnalyticsPlaceholderMissing: "الصق Codex analytics API key",
    codexAnalyticsPlaceholderConfigured:
      "تم الإعداد محليا. أدخل analytics key جديدة للاستبدال.",
    codexWorkspacePlaceholderMissing: "الصق Codex workspace ID",
    codexWorkspacePlaceholderConfigured:
      "تم الإعداد محليا. أدخل workspace ID جديدا للاستبدال.",
  },
  hi: {
    sectionLabel: "Provider credentials",
    configured: "Configured",
    missing: "Missing",
    saveKey: "key save करें",
    clearStoredKey: "stored key clear करें",
    saveConfig: "config save करें",
    clearStoredConfig: "stored config clear करें",
    adminApiKeyLabel: "Admin API key",
    analyticsApiKeyLabel: "Analytics API key",
    workspaceIdLabel: "Workspace ID",
    cursorTitle: "Cursor Team Admin API key",
    cursorHelpText:
      "यह सिर्फ इस browser profile के extension-managed local storage में store होता है। वैकल्पिक: team-admin API path के लिए use करें, या signed-in personal usage page इस्तेमाल करनी हो तो खाली छोड़ दें।",
    cursorFooterText:
      "केवल team-admin scope। configured होने पर background worker `https://api.cursor.com` पर Basic auth के साथ requests भेजता है। personal usage-page sync को यह key नहीं चाहिए।",
    cursorPlaceholderMissing: "Cursor Admin API key paste करें",
    cursorPlaceholderConfigured:
      "Locally configured। replace करने के लिए नई key डालें।",
    claudeTitle: "Claude Code Analytics Admin API key",
    claudeHelpText:
      "यह सिर्फ इस browser profile के extension-managed local storage में store होता है। supported v1 Claude organization analytics path के लिए यह required है।",
    claudeFooterText:
      "केवल Admin API scope। requests background worker से `https://api.anthropic.com/v1/organizations/usage_report/claude_code` पर `x-api-key` और `anthropic-version` headers के साथ जाती हैं।",
    claudePlaceholderMissing: "Anthropic Admin API key paste करें",
    claudePlaceholderConfigured:
      "Locally configured। replace करने के लिए नई key डालें।",
    codexTitle: "Codex Enterprise analytics config",
    codexHelpText:
      "यह सिर्फ इस browser profile के extension-managed local storage में store होता है। यह optional है और केवल Enterprise analytics path के लिए चाहिए। personal Codex usage-page sync को analytics key या workspace ID नहीं चाहिए।",
    codexFooterText:
      "Codex analytics के लिए Platform API key और ChatGPT admin console का workspace ID तभी use करें जब Enterprise workspace path चाहिए। requests `https://api.chatgpt.com/v1/analytics/codex` पर जाती हैं।",
    codexAnalyticsPlaceholderMissing: "Codex analytics API key paste करें",
    codexAnalyticsPlaceholderConfigured:
      "Locally configured। replace करने के लिए नई analytics key डालें।",
    codexWorkspacePlaceholderMissing: "Codex workspace ID paste करें",
    codexWorkspacePlaceholderConfigured:
      "Locally configured। replace करने के लिए नया workspace ID डालें।",
  },
  id: {
    sectionLabel: "Credentials provider",
    configured: "Terkonfigurasi",
    missing: "Belum ada",
    saveKey: "Simpan key",
    clearStoredKey: "Hapus key tersimpan",
    saveConfig: "Simpan config",
    clearStoredConfig: "Hapus config tersimpan",
    adminApiKeyLabel: "Admin API key",
    analyticsApiKeyLabel: "Analytics API key",
    workspaceIdLabel: "Workspace ID",
    cursorTitle: "Cursor Team Admin API key",
    cursorHelpText:
      "Disimpan hanya di extension-managed local storage pada browser profile ini. Opsional: gunakan untuk jalur team-admin API, atau biarkan kosong jika hanya memakai personal usage page yang sudah login.",
    cursorFooterText:
      "Hanya team-admin scope. Saat dikonfigurasi, request dikirim dari background worker ke `https://api.cursor.com` dengan Basic auth. personal usage-page sync tidak memerlukan key ini.",
    cursorPlaceholderMissing: "Tempel Cursor Admin API key",
    cursorPlaceholderConfigured:
      "Terkonfigurasi lokal. Masukkan key baru untuk mengganti.",
    claudeTitle: "Claude Code Analytics Admin API key",
    claudeHelpText:
      "Disimpan hanya di extension-managed local storage pada browser profile ini. Diperlukan untuk jalur v1 Claude organization analytics yang didukung.",
    claudeFooterText:
      "Hanya Admin API scope. Request dikirim dari background worker ke `https://api.anthropic.com/v1/organizations/usage_report/claude_code` dengan headers `x-api-key` dan `anthropic-version`.",
    claudePlaceholderMissing: "Tempel Anthropic Admin API key",
    claudePlaceholderConfigured:
      "Terkonfigurasi lokal. Masukkan key baru untuk mengganti.",
    codexTitle: "Codex Enterprise analytics config",
    codexHelpText:
      "Disimpan hanya di extension-managed local storage pada browser profile ini. Opsional dan hanya diperlukan untuk Enterprise analytics path. personal Codex usage-page sync tidak memerlukan analytics key atau workspace ID.",
    codexFooterText:
      "Gunakan Platform API key untuk Codex analytics dan workspace ID dari ChatGPT admin console hanya jika membutuhkan Enterprise workspace path. Request menuju `https://api.chatgpt.com/v1/analytics/codex`.",
    codexAnalyticsPlaceholderMissing: "Tempel Codex analytics API key",
    codexAnalyticsPlaceholderConfigured:
      "Terkonfigurasi lokal. Masukkan analytics key baru untuk mengganti.",
    codexWorkspacePlaceholderMissing: "Tempel Codex workspace ID",
    codexWorkspacePlaceholderConfigured:
      "Terkonfigurasi lokal. Masukkan workspace ID baru untuk mengganti.",
  },
};

export function getSettingsCredentialsCopy(
  locale: ResolvedAppLocale,
): SettingsCredentialsCopyText | null {
  if (locale === "en" || locale === "zh-CN") {
    return null;
  }

  return SETTINGS_CREDENTIALS_COPY[locale];
}

export function buildLocalizedSettingsCredentialsSection(
  copy: SettingsCredentialsCopyText,
) {
  return {
    credentials: copy,
  } as const;
}
