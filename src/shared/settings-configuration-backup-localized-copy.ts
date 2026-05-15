import type { ResolvedAppLocale } from "./i18n";

export type SettingsConfigurationBackupCopy = {
  title: string;
  subtitle: string;
  tooltip: string;
  exportJson: string;
  importJson: string;
  saveToChromeSync: string;
  restoreFromChromeSync: string;
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
  },
};

export function getSettingsConfigurationBackupCopy(
  locale: ResolvedAppLocale,
): SettingsConfigurationBackupCopy {
  return SETTINGS_CONFIGURATION_BACKUP_COPY[locale];
}
