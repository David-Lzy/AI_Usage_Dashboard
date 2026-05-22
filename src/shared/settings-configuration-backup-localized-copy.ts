import type { ResolvedAppLocale } from "./i18n";

export type SettingsConfigurationBackupCopy = {
  title: string;
  subtitle: string;
  tooltip: string;
  exportJson: string;
  importJson: string;
  saveToChromeSync: string;
  restoreFromChromeSync: string;
  resetToInitial: string;
  resetToInitialConfirm: string;
  resetToInitialSuccessTitle: string;
  resetToInitialSuccessMessage: string;
};

export const SETTINGS_CONFIGURATION_BACKUP_COPY: Record<
  ResolvedAppLocale,
  SettingsConfigurationBackupCopy
> = {
  en: {
    title: "Configuration backup and sync",
    subtitle: "Export JSON, or sync portable settings through Chrome.",
    tooltip:
      "Chrome Sync uses the Google/Chrome account already signed in to the browser; the extension does not add a separate login. Only portable configuration is synced: UI, language, theme, provider visibility, and source preferences. API keys, permissions, page bindings, runtime snapshots, and large custom toolbar images remain local.",
    exportJson: "Export JSON",
    importJson: "Import JSON",
    saveToChromeSync: "Save to Chrome Sync",
    restoreFromChromeSync: "Restore from Chrome Sync",
    resetToInitial: "Initialize configuration",
    resetToInitialConfirm:
      "Reset portable configuration to the initial defaults? This replaces UI, language, theme, provider visibility, source preferences, toolbar, and sync settings. API keys, permissions, page bindings, and runtime snapshots stay local and are not reset.",
    resetToInitialSuccessTitle: "Configuration initialized",
    resetToInitialSuccessMessage:
      "Portable settings and provider display preferences were reset to the initial defaults.",
  },
  "zh-CN": {
    title: "配置备份与同步",
    subtitle: "导出 JSON，或通过 Chrome 账户同步可迁移配置。",
    tooltip:
      "Chrome 同步使用浏览器已登录的 Google/Chrome 账户，不会单独要求扩展登录。只同步可迁移配置：界面、语言、主题、Provider 显示和来源偏好。API key、权限、页面绑定、运行快照和自定义图标大图保持本机本地。",
    exportJson: "导出 JSON",
    importJson: "导入 JSON",
    saveToChromeSync: "保存到 Chrome 同步",
    restoreFromChromeSync: "从 Chrome 同步恢复",
    resetToInitial: "初始化配置",
    resetToInitialConfirm:
      "要将可迁移配置重置为初始默认值吗？这会替换界面、语言、主题、Provider 显示、来源偏好、工具栏和同步设置。API key、权限、页面绑定和运行快照仍保留在本机，不会被重置。",
    resetToInitialSuccessTitle: "配置已初始化",
    resetToInitialSuccessMessage:
      "可迁移设置和 Provider 显示偏好已重置为初始默认值。",
  },
  "zh-TW": {
    title: "設定備份與同步",
    subtitle: "匯出 JSON，或透過 Chrome 同步可攜設定。",
    tooltip:
      "Chrome 同步使用瀏覽器已登入的 Google/Chrome 帳戶；擴充功能不會加入另一個登入流程。只同步可攜設定：介面、語言、主題、Provider 顯示與來源偏好。API key、權限、頁面繫結、執行快照和大型自訂工具列圖示仍留在本機。",
    exportJson: "匯出 JSON",
    importJson: "匯入 JSON",
    saveToChromeSync: "儲存到 Chrome 同步",
    restoreFromChromeSync: "從 Chrome 同步還原",
    resetToInitial: "初始化設定",
    resetToInitialConfirm:
      "要將可攜設定重設為初始預設值嗎？這會取代介面、語言、主題、Provider 顯示、來源偏好、工具列和同步設定。API key、權限、頁面繫結和執行快照仍留在本機，不會被重設。",
    resetToInitialSuccessTitle: "設定已初始化",
    resetToInitialSuccessMessage:
      "可攜設定和 Provider 顯示偏好已重設為初始預設值。",
  },
  ja: {
    title: "設定のバックアップと同期",
    subtitle: "JSON をエクスポートするか、Chrome で移行可能な設定を同期します。",
    tooltip:
      "Chrome Sync はブラウザでサインイン済みの Google/Chrome アカウントを使います。拡張機能は別のログインを追加しません。同期するのは UI、言語、テーマ、Provider 表示、ソース設定などの移行可能な設定のみです。API key、権限、ページ紐付け、実行時スナップショット、大きなカスタムツールバー画像はローカルに残ります。",
    exportJson: "JSON をエクスポート",
    importJson: "JSON をインポート",
    saveToChromeSync: "Chrome Sync に保存",
    restoreFromChromeSync: "Chrome Sync から復元",
    resetToInitial: "設定を初期化",
    resetToInitialConfirm:
      "移行可能な設定を初期状態に戻しますか？UI、言語、テーマ、Provider 表示、ソース設定、ツールバー、同期設定が置き換わります。API key、権限、ページ紐付け、実行時スナップショットはローカルに残り、リセットされません。",
    resetToInitialSuccessTitle: "設定を初期化しました",
    resetToInitialSuccessMessage:
      "移行可能な設定と Provider 表示設定を初期状態に戻しました。",
  },
  ko: {
    title: "구성 백업 및 동기화",
    subtitle: "JSON으로 내보내거나 Chrome에서 이동 가능한 설정을 동기화합니다.",
    tooltip:
      "Chrome Sync는 브라우저에 이미 로그인된 Google/Chrome 계정을 사용하며, 확장 프로그램은 별도 로그인을 추가하지 않습니다. UI, 언어, 테마, Provider 표시, 소스 기본값 같은 이동 가능한 설정만 동기화됩니다. API key, 권한, 페이지 바인딩, 런타임 스냅샷, 큰 사용자 지정 툴바 이미지는 로컬에 남습니다.",
    exportJson: "JSON 내보내기",
    importJson: "JSON 가져오기",
    saveToChromeSync: "Chrome Sync에 저장",
    restoreFromChromeSync: "Chrome Sync에서 복원",
    resetToInitial: "구성 초기화",
    resetToInitialConfirm:
      "이동 가능한 구성을 초기 기본값으로 재설정할까요? UI, 언어, 테마, Provider 표시, 소스 기본값, 툴바, 동기화 설정이 교체됩니다. API key, 권한, 페이지 바인딩, 런타임 스냅샷은 로컬에 남고 재설정되지 않습니다.",
    resetToInitialSuccessTitle: "구성이 초기화됨",
    resetToInitialSuccessMessage:
      "이동 가능한 설정과 Provider 표시 기본값을 초기 기본값으로 재설정했습니다.",
  },
  "es-419": {
    title: "Respaldo y sincronización de configuración",
    subtitle: "Exporta JSON o sincroniza ajustes portables con Chrome.",
    tooltip:
      "Chrome Sync usa la cuenta Google/Chrome que ya inició sesión en el navegador; la extensión no agrega otro inicio de sesión. Solo se sincroniza configuración portable: UI, idioma, tema, visibilidad de providers y preferencias de origen. API keys, permisos, vínculos de página, snapshots de ejecución e imágenes grandes de icono personalizado quedan locales.",
    exportJson: "Exportar JSON",
    importJson: "Importar JSON",
    saveToChromeSync: "Guardar en Chrome Sync",
    restoreFromChromeSync: "Restaurar desde Chrome Sync",
    resetToInitial: "Inicializar configuración",
    resetToInitialConfirm:
      "¿Restablecer la configuración portable a los valores iniciales? Esto reemplaza UI, idioma, tema, visibilidad de providers, preferencias de origen, barra de herramientas y sincronización. API keys, permisos, vínculos de página y snapshots de ejecución quedan locales y no se restablecen.",
    resetToInitialSuccessTitle: "Configuración inicializada",
    resetToInitialSuccessMessage:
      "Los ajustes portables y las preferencias de visualización de providers volvieron a los valores iniciales.",
  },
  "pt-BR": {
    title: "Backup e sincronização da configuração",
    subtitle: "Exporte JSON ou sincronize ajustes portáteis pelo Chrome.",
    tooltip:
      "O Chrome Sync usa a conta Google/Chrome já conectada no navegador; a extensão não adiciona outro login. Apenas configurações portáteis são sincronizadas: UI, idioma, tema, visibilidade de providers e preferências de origem. API keys, permissões, vínculos de página, snapshots de runtime e imagens grandes de ícone personalizado ficam locais.",
    exportJson: "Exportar JSON",
    importJson: "Importar JSON",
    saveToChromeSync: "Salvar no Chrome Sync",
    restoreFromChromeSync: "Restaurar do Chrome Sync",
    resetToInitial: "Inicializar configuração",
    resetToInitialConfirm:
      "Redefinir a configuração portátil para os padrões iniciais? Isso substitui UI, idioma, tema, visibilidade de providers, preferências de origem, barra de ferramentas e sincronização. API keys, permissões, vínculos de página e snapshots de runtime continuam locais e não são redefinidos.",
    resetToInitialSuccessTitle: "Configuração inicializada",
    resetToInitialSuccessMessage:
      "As configurações portáteis e preferências de exibição de providers foram redefinidas para os padrões iniciais.",
  },
  fr: {
    title: "Sauvegarde et synchronisation de la configuration",
    subtitle: "Exportez un JSON ou synchronisez les réglages portables avec Chrome.",
    tooltip:
      "Chrome Sync utilise le compte Google/Chrome déjà connecté dans le navigateur ; l'extension n'ajoute pas de connexion séparée. Seule la configuration portable est synchronisée : UI, langue, thème, visibilité des providers et préférences de source. Les API keys, permissions, liens de page, instantanés d'exécution et grandes images d'icône personnalisée restent locaux.",
    exportJson: "Exporter JSON",
    importJson: "Importer JSON",
    saveToChromeSync: "Enregistrer dans Chrome Sync",
    restoreFromChromeSync: "Restaurer depuis Chrome Sync",
    resetToInitial: "Initialiser la configuration",
    resetToInitialConfirm:
      "Réinitialiser la configuration portable aux valeurs initiales ? Cela remplace l'UI, la langue, le thème, la visibilité des providers, les préférences de source, la barre d'outils et la synchronisation. Les API keys, permissions, liens de page et instantanés d'exécution restent locaux et ne sont pas réinitialisés.",
    resetToInitialSuccessTitle: "Configuration initialisée",
    resetToInitialSuccessMessage:
      "Les réglages portables et les préférences d'affichage des providers ont été réinitialisés.",
  },
  de: {
    title: "Konfiguration sichern und synchronisieren",
    subtitle: "JSON exportieren oder portable Einstellungen mit Chrome synchronisieren.",
    tooltip:
      "Chrome Sync nutzt das Google/Chrome-Konto, das bereits im Browser angemeldet ist; die Erweiterung fügt keinen separaten Login hinzu. Synchronisiert werden nur portable Einstellungen: UI, Sprache, Theme, Provider-Sichtbarkeit und Quellenpräferenzen. API keys, Berechtigungen, Seitenbindungen, Laufzeit-Snapshots und große benutzerdefinierte Toolbar-Bilder bleiben lokal.",
    exportJson: "JSON exportieren",
    importJson: "JSON importieren",
    saveToChromeSync: "In Chrome Sync speichern",
    restoreFromChromeSync: "Aus Chrome Sync wiederherstellen",
    resetToInitial: "Konfiguration initialisieren",
    resetToInitialConfirm:
      "Portable Konfiguration auf die Anfangswerte zurücksetzen? Dadurch werden UI, Sprache, Theme, Provider-Sichtbarkeit, Quellenpräferenzen, Toolbar und Sync-Einstellungen ersetzt. API keys, Berechtigungen, Seitenbindungen und Laufzeit-Snapshots bleiben lokal und werden nicht zurückgesetzt.",
    resetToInitialSuccessTitle: "Konfiguration initialisiert",
    resetToInitialSuccessMessage:
      "Portable Einstellungen und Provider-Anzeigepräferenzen wurden auf die Anfangswerte zurückgesetzt.",
  },
  it: {
    title: "Backup e sincronizzazione della configurazione",
    subtitle: "Esporta JSON o sincronizza le impostazioni portabili con Chrome.",
    tooltip:
      "Chrome Sync usa l'account Google/Chrome già connesso nel browser; l'estensione non aggiunge un login separato. Viene sincronizzata solo la configurazione portabile: UI, lingua, tema, visibilità dei provider e preferenze sorgente. API keys, permessi, collegamenti pagina, snapshot runtime e grandi immagini icona personalizzate restano locali.",
    exportJson: "Esporta JSON",
    importJson: "Importa JSON",
    saveToChromeSync: "Salva in Chrome Sync",
    restoreFromChromeSync: "Ripristina da Chrome Sync",
    resetToInitial: "Inizializza configurazione",
    resetToInitialConfirm:
      "Ripristinare la configurazione portabile ai valori iniziali? Verranno sostituiti UI, lingua, tema, visibilità dei provider, preferenze sorgente, toolbar e sincronizzazione. API keys, permessi, collegamenti pagina e snapshot runtime restano locali e non vengono reimpostati.",
    resetToInitialSuccessTitle: "Configurazione inizializzata",
    resetToInitialSuccessMessage:
      "Le impostazioni portabili e le preferenze di visualizzazione dei provider sono tornate ai valori iniziali.",
  },
  ru: {
    title: "Резервная копия и синхронизация настроек",
    subtitle: "Экспортируйте JSON или синхронизируйте переносимые настройки через Chrome.",
    tooltip:
      "Chrome Sync использует аккаунт Google/Chrome, уже подключенный в браузере; расширение не добавляет отдельный вход. Синхронизируются только переносимые настройки: UI, язык, тема, видимость provider и предпочтения источников. API keys, разрешения, привязки страниц, runtime snapshots и большие пользовательские изображения значка остаются локально.",
    exportJson: "Экспорт JSON",
    importJson: "Импорт JSON",
    saveToChromeSync: "Сохранить в Chrome Sync",
    restoreFromChromeSync: "Восстановить из Chrome Sync",
    resetToInitial: "Инициализировать настройки",
    resetToInitialConfirm:
      "Сбросить переносимую конфигурацию к начальным значениям? Это заменит UI, язык, тему, видимость provider, предпочтения источников, панель инструментов и синхронизацию. API keys, разрешения, привязки страниц и runtime snapshots останутся локально и не будут сброшены.",
    resetToInitialSuccessTitle: "Конфигурация инициализирована",
    resetToInitialSuccessMessage:
      "Переносимые настройки и параметры отображения provider сброшены к начальным значениям.",
  },
  ar: {
    title: "نسخ الإعدادات ومزامنتها",
    subtitle: "صدّر JSON أو زامن الإعدادات القابلة للنقل عبر Chrome.",
    tooltip:
      "يستخدم Chrome Sync حساب Google/Chrome المسجّل في المتصفح بالفعل؛ ولا تضيف الإضافة تسجيل دخول منفصلًا. تتم مزامنة الإعدادات القابلة للنقل فقط: الواجهة واللغة والسمة وظهور Provider وتفضيلات المصدر. تبقى API keys والأذونات وروابط الصفحات ولقطات التشغيل وصور أيقونة شريط الأدوات الكبيرة محلية.",
    exportJson: "تصدير JSON",
    importJson: "استيراد JSON",
    saveToChromeSync: "حفظ في Chrome Sync",
    restoreFromChromeSync: "استعادة من Chrome Sync",
    resetToInitial: "تهيئة الإعدادات",
    resetToInitialConfirm:
      "هل تريد إعادة الإعدادات القابلة للنقل إلى القيم الأولية؟ سيستبدل ذلك الواجهة واللغة والسمة وظهور Provider وتفضيلات المصدر وشريط الأدوات والمزامنة. ستبقى API keys والأذونات وروابط الصفحات ولقطات التشغيل محلية ولن تتم إعادة ضبطها.",
    resetToInitialSuccessTitle: "تمت تهيئة الإعدادات",
    resetToInitialSuccessMessage:
      "تمت إعادة الإعدادات القابلة للنقل وتفضيلات عرض Provider إلى القيم الأولية.",
  },
  hi: {
    title: "Configuration backup और sync",
    subtitle: "JSON export करें या portable settings को Chrome से sync करें.",
    tooltip:
      "Chrome Sync उस Google/Chrome account का उपयोग करता है जो browser में पहले से signed in है; extension अलग login नहीं जोड़ता. सिर्फ portable configuration sync होती है: UI, भाषा, theme, Provider visibility और source preferences. API keys, permissions, page bindings, runtime snapshots और बड़े custom toolbar images local रहते हैं.",
    exportJson: "JSON export",
    importJson: "JSON import",
    saveToChromeSync: "Chrome Sync में save",
    restoreFromChromeSync: "Chrome Sync से restore",
    resetToInitial: "Configuration initialize",
    resetToInitialConfirm:
      "Portable configuration को initial defaults पर reset करें? इससे UI, भाषा, theme, Provider visibility, source preferences, toolbar और sync settings बदल जाएंगी. API keys, permissions, page bindings और runtime snapshots local रहेंगे और reset नहीं होंगे.",
    resetToInitialSuccessTitle: "Configuration initialized",
    resetToInitialSuccessMessage:
      "Portable settings और Provider display preferences initial defaults पर reset हो गए.",
  },
  id: {
    title: "Cadangan dan sinkronisasi konfigurasi",
    subtitle: "Ekspor JSON, atau sinkronkan pengaturan portabel melalui Chrome.",
    tooltip:
      "Chrome Sync memakai akun Google/Chrome yang sudah masuk di browser; ekstensi tidak menambahkan login terpisah. Hanya konfigurasi portabel yang disinkronkan: UI, bahasa, tema, visibilitas provider, dan preferensi sumber. API keys, izin, binding halaman, snapshot runtime, dan gambar ikon toolbar khusus yang besar tetap lokal.",
    exportJson: "Ekspor JSON",
    importJson: "Impor JSON",
    saveToChromeSync: "Simpan ke Chrome Sync",
    restoreFromChromeSync: "Pulihkan dari Chrome Sync",
    resetToInitial: "Inisialisasi konfigurasi",
    resetToInitialConfirm:
      "Reset konfigurasi portabel ke default awal? Ini mengganti UI, bahasa, tema, visibilitas provider, preferensi sumber, toolbar, dan sinkronisasi. API keys, izin, binding halaman, dan snapshot runtime tetap lokal dan tidak direset.",
    resetToInitialSuccessTitle: "Konfigurasi diinisialisasi",
    resetToInitialSuccessMessage:
      "Pengaturan portabel dan preferensi tampilan provider direset ke default awal.",
  },
};

export function getSettingsConfigurationBackupCopy(
  locale: ResolvedAppLocale,
): SettingsConfigurationBackupCopy {
  return SETTINGS_CONFIGURATION_BACKUP_COPY[locale];
}
