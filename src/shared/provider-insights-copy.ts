import type { ResolvedAppLocale } from "./i18n";

type Copy = { sharedScope: string; expires: string; partial: string; page: string; local: string; captured: string };
type ClaudeCopy = { fullReset: string; fiveHourReset: string; available: string; unavailable: string; cloudCredits: string; usageCredits: string };
const VALUES: Record<ResolvedAppLocale, [string, string, string, string, string, string]> = {
  en: ["Work / Codex / agents · shared plan", "Expires", "Reset details may be incomplete", "Usage page", "Local Companion", "Captured"],
  "zh-CN": ["Work / Codex / 智能体共享套餐", "有效期至", "重置券明细可能不完整", "用量页面", "本地 Companion", "采集时间"],
  "zh-TW": ["Work / Codex / 智慧體共享方案", "有效期限", "重置券明細可能不完整", "用量頁面", "本機 Companion", "擷取時間"],
  ja: ["Work / Codex / エージェント共有枠", "有効期限", "リセット詳細は一部のみの場合があります", "使用量ページ", "ローカル Companion", "取得日時"],
  ko: ["Work / Codex / 에이전트 공유 한도", "만료", "리셋 세부 정보가 일부일 수 있음", "사용량 페이지", "로컬 Companion", "수집 시간"],
  "es-419": ["Plan compartido · Work / Codex / agentes", "Vence", "Los detalles de reinicio pueden estar incompletos", "Página de uso", "Companion local", "Capturado"],
  "pt-BR": ["Plano compartilhado · Work / Codex / agentes", "Expira", "Os detalhes de redefinição podem estar incompletos", "Página de uso", "Companion local", "Coletado"],
  fr: ["Forfait partagé · Work / Codex / agents", "Expiration", "Les détails de réinitialisation peuvent être incomplets", "Page d'utilisation", "Companion local", "Collecté"],
  de: ["Gemeinsamer Tarif · Work / Codex / Agenten", "Gültig bis", "Reset-Details können unvollständig sein", "Nutzungsseite", "Lokaler Companion", "Erfasst"],
  it: ["Piano condiviso · Work / Codex / agenti", "Scadenza", "I dettagli del ripristino possono essere incompleti", "Pagina utilizzo", "Companion locale", "Acquisito"],
  ru: ["Общий тариф · Work / Codex / агенты", "Действует до", "Сведения о сбросах могут быть неполными", "Страница использования", "Локальный Companion", "Получено"],
  ar: ["خطة مشتركة · Work / Codex / الوكلاء", "تنتهي", "قد تكون تفاصيل إعادة الضبط غير مكتملة", "صفحة الاستخدام", "Companion محلي", "وقت الالتقاط"],
  hi: ["साझा योजना · Work / Codex / एजेंट", "समाप्ति", "रीसेट का विवरण अधूरा हो सकता है", "उपयोग पृष्ठ", "स्थानीय Companion", "संग्रह समय"],
  id: ["Paket bersama · Work / Codex / agen", "Kedaluwarsa", "Rincian reset mungkin tidak lengkap", "Halaman penggunaan", "Companion lokal", "Diambil"],
};

const CLAUDE: Record<ResolvedAppLocale, [string, string, string, string, string, string]> = {
  en: ["Full reset", "5-hour reset", "Available", "Not available", "Cloud-session credits", "Usage credits"],
  "zh-CN": ["完全重置", "5 小时重置", "可用", "暂无", "云会话额度", "用量额度"],
  "zh-TW": ["完整重置", "5 小時重置", "可用", "暫無", "雲端工作階段額度", "用量額度"],
  ja: ["完全リセット", "5時間リセット", "利用可能", "利用不可", "クラウドセッション枠", "使用クレジット"],
  ko: ["전체 리셋", "5시간 리셋", "사용 가능", "사용 불가", "클라우드 세션 크레딧", "사용량 크레딧"],
  "es-419": ["Reinicio completo", "Reinicio de 5 horas", "Disponible", "No disponible", "Créditos de sesión en la nube", "Créditos de uso"],
  "pt-BR": ["Redefinição completa", "Redefinição de 5 horas", "Disponível", "Indisponível", "Créditos de sessão na nuvem", "Créditos de uso"],
  fr: ["Réinitialisation complète", "Réinitialisation de 5 heures", "Disponible", "Indisponible", "Crédits de session cloud", "Crédits d'utilisation"],
  de: ["Vollständiger Reset", "5-Stunden-Reset", "Verfügbar", "Nicht verfügbar", "Cloud-Sitzungsguthaben", "Nutzungsguthaben"],
  it: ["Ripristino completo", "Ripristino di 5 ore", "Disponibile", "Non disponibile", "Crediti sessione cloud", "Crediti di utilizzo"],
  ru: ["Полный сброс", "Сброс на 5 часов", "Доступен", "Недоступен", "Кредиты облачной сессии", "Кредиты использования"],
  ar: ["إعادة ضبط كاملة", "إعادة ضبط 5 ساعات", "متاح", "غير متاح", "رصيد الجلسة السحابية", "رصيد الاستخدام"],
  hi: ["पूर्ण रीसेट", "5 घंटे रीसेट", "उपलब्ध", "उपलब्ध नहीं", "क्लाउड सत्र क्रेडिट", "उपयोग क्रेडिट"],
  id: ["Reset penuh", "Reset 5 jam", "Tersedia", "Tidak tersedia", "Kredit sesi cloud", "Kredit penggunaan"],
};

export function getProviderInsightsCopy(locale: ResolvedAppLocale): Copy & ClaudeCopy {
  const [sharedScope, expires, partial, page, local, captured] = VALUES[locale];
  const [fullReset, fiveHourReset, available, unavailable, cloudCredits, usageCredits] = CLAUDE[locale];
  return { sharedScope, expires, partial, page, local, captured, fullReset, fiveHourReset, available, unavailable, cloudCredits, usageCredits };
}
