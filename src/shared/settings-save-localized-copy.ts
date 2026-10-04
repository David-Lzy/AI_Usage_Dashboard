import type { ResolvedAppLocale } from "./i18n";

type Copy = {
  pending: string;
  saved: string;
  error: string;
  retry: string;
  inAppThreshold: string;
  notificationThreshold: string;
};

const COPY: Record<ResolvedAppLocale, Copy> = {
  en: {
    pending: "Saving",
    saved: "Saved",
    error: "Not saved",
    retry: "Retry",
    inAppThreshold: "In-app warning (% used)",
    notificationThreshold: "System notification (% used)",
  },
  "zh-CN": {
    pending: "正在保存",
    saved: "已保存",
    error: "未保存",
    retry: "重试",
    inAppThreshold: "界面告警阈值（已用 %）",
    notificationThreshold: "系统通知阈值（已用 %）",
  },
  "zh-TW": {
    pending: "儲存中",
    saved: "已儲存",
    error: "尚未儲存",
    retry: "重試",
    inAppThreshold: "介面警示門檻（已用 %）",
    notificationThreshold: "系統通知門檻（已用 %）",
  },
  ja: {
    pending: "保存中",
    saved: "保存済み",
    error: "未保存",
    retry: "再試行",
    inAppThreshold: "画面内の警告（使用率 %）",
    notificationThreshold: "システム通知（使用率 %）",
  },
  ko: {
    pending: "저장 중",
    saved: "저장됨",
    error: "저장되지 않음",
    retry: "재시도",
    inAppThreshold: "앱 경고 (사용률 %)",
    notificationThreshold: "시스템 알림 (사용률 %)",
  },
  "es-419": {
    pending: "Guardando",
    saved: "Guardado",
    error: "Sin guardar",
    retry: "Reintentar",
    inAppThreshold: "Alerta en la app (% usado)",
    notificationThreshold: "Notificación del sistema (% usado)",
  },
  "pt-BR": {
    pending: "Salvando",
    saved: "Salvo",
    error: "Não salvo",
    retry: "Tentar novamente",
    inAppThreshold: "Alerta no app (% usado)",
    notificationThreshold: "Notificação do sistema (% usado)",
  },
  fr: {
    pending: "Enregistrement",
    saved: "Enregistré",
    error: "Non enregistré",
    retry: "Réessayer",
    inAppThreshold: "Alerte dans l’app (% utilisé)",
    notificationThreshold: "Notification système (% utilisé)",
  },
  de: {
    pending: "Wird gespeichert",
    saved: "Gespeichert",
    error: "Nicht gespeichert",
    retry: "Erneut versuchen",
    inAppThreshold: "App-Warnung (% genutzt)",
    notificationThreshold: "Systembenachrichtigung (% genutzt)",
  },
  it: {
    pending: "Salvataggio",
    saved: "Salvato",
    error: "Non salvato",
    retry: "Riprova",
    inAppThreshold: "Avviso nell’app (% usata)",
    notificationThreshold: "Notifica di sistema (% usata)",
  },
  ru: {
    pending: "Сохранение",
    saved: "Сохранено",
    error: "Не сохранено",
    retry: "Повторить",
    inAppThreshold: "Предупреждение в приложении (% использовано)",
    notificationThreshold: "Системное уведомление (% использовано)",
  },
  ar: {
    pending: "جارٍ الحفظ",
    saved: "تم الحفظ",
    error: "لم يُحفظ",
    retry: "إعادة المحاولة",
    inAppThreshold: "تنبيه التطبيق (النسبة المستخدمة %)",
    notificationThreshold: "إشعار النظام (النسبة المستخدمة %)",
  },
  hi: {
    pending: "सहेजा जा रहा है",
    saved: "सहेजा गया",
    error: "सहेजा नहीं गया",
    retry: "फिर प्रयास करें",
    inAppThreshold: "ऐप चेतावनी (% उपयोग)",
    notificationThreshold: "सिस्टम सूचना (% उपयोग)",
  },
  id: {
    pending: "Menyimpan",
    saved: "Tersimpan",
    error: "Belum tersimpan",
    retry: "Coba lagi",
    inAppThreshold: "Peringatan aplikasi (% terpakai)",
    notificationThreshold: "Notifikasi sistem (% terpakai)",
  },
};

export function getSettingsSaveCopy(locale: ResolvedAppLocale): Copy {
  return COPY[locale];
}
