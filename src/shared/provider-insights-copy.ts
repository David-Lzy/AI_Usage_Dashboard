import type { ResolvedAppLocale } from "./i18n";

type Copy = { sharedScope: string; expires: string; partial: string; page: string; local: string; captured: string };
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

export function getProviderInsightsCopy(locale: ResolvedAppLocale): Copy {
  const [sharedScope, expires, partial, page, local, captured] = VALUES[locale];
  return { sharedScope, expires, partial, page, local, captured };
}
