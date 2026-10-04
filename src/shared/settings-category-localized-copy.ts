import type { ResolvedAppLocale } from "./i18n";

type CategoryCopy = {
  connections: string;
  usage: string;
  appearance: string;
  general: string;
  data: string;
  configure: string;
};

const COPY: Record<ResolvedAppLocale, CategoryCopy> = {
  en: {
    connections: "Accounts & connections",
    usage: "Usage & notifications",
    appearance: "Appearance & display",
    general: "General",
    data: "Data & backup",
    configure: "Configure",
  },
  "zh-CN": {
    connections: "账号与连接",
    usage: "用量与通知",
    appearance: "界面与显示",
    general: "常规",
    data: "数据与备份",
    configure: "配置",
  },
  "zh-TW": {
    connections: "帳號與連線",
    usage: "用量與通知",
    appearance: "介面與顯示",
    general: "一般",
    data: "資料與備份",
    configure: "設定",
  },
  ja: {
    connections: "アカウントと接続",
    usage: "使用量と通知",
    appearance: "外観と表示",
    general: "一般",
    data: "データとバックアップ",
    configure: "設定",
  },
  ko: {
    connections: "계정 및 연결",
    usage: "사용량 및 알림",
    appearance: "모양 및 표시",
    general: "일반",
    data: "데이터 및 백업",
    configure: "설정",
  },
  "es-419": {
    connections: "Cuentas y conexiones",
    usage: "Uso y notificaciones",
    appearance: "Apariencia y visualización",
    general: "General",
    data: "Datos y copias de seguridad",
    configure: "Configurar",
  },
  "pt-BR": {
    connections: "Contas e conexões",
    usage: "Uso e notificações",
    appearance: "Aparência e exibição",
    general: "Geral",
    data: "Dados e backup",
    configure: "Configurar",
  },
  fr: {
    connections: "Comptes et connexions",
    usage: "Utilisation et notifications",
    appearance: "Apparence et affichage",
    general: "Général",
    data: "Données et sauvegarde",
    configure: "Configurer",
  },
  de: {
    connections: "Konten und Verbindungen",
    usage: "Nutzung und Benachrichtigungen",
    appearance: "Aussehen und Anzeige",
    general: "Allgemein",
    data: "Daten und Sicherung",
    configure: "Konfigurieren",
  },
  it: {
    connections: "Account e connessioni",
    usage: "Utilizzo e notifiche",
    appearance: "Aspetto e visualizzazione",
    general: "Generali",
    data: "Dati e backup",
    configure: "Configura",
  },
  ru: {
    connections: "Аккаунты и подключения",
    usage: "Использование и уведомления",
    appearance: "Внешний вид и отображение",
    general: "Общие",
    data: "Данные и резервные копии",
    configure: "Настроить",
  },
  ar: {
    connections: "الحسابات والاتصالات",
    usage: "الاستخدام والإشعارات",
    appearance: "المظهر والعرض",
    general: "عام",
    data: "البيانات والنسخ الاحتياطي",
    configure: "إعداد",
  },
  hi: {
    connections: "खाते और कनेक्शन",
    usage: "उपयोग और सूचनाएँ",
    appearance: "रूप और प्रदर्शन",
    general: "सामान्य",
    data: "डेटा और बैकअप",
    configure: "कॉन्फ़िगर करें",
  },
  id: {
    connections: "Akun dan koneksi",
    usage: "Penggunaan dan notifikasi",
    appearance: "Tampilan",
    general: "Umum",
    data: "Data dan cadangan",
    configure: "Konfigurasi",
  },
};

export function getSettingsCategoryCopy(
  locale: ResolvedAppLocale,
): CategoryCopy {
  return COPY[locale];
}
