import type { ResolvedAppLocale } from "./i18n";

type Copy = {
  title: string; boundary: string; source: string; announcementTime: string;
  reset: string; grant: string; credits: string; other: string;
  fresh: string; partial: string; permission: string; unavailable: string; details: string;
};

const VALUES: Record<ResolvedAppLocale, [string, string, string, string, string, string, string, string, string, string, string, string, string]> = {
  en: ["Community updates", "Community report, not account confirmation", "Source", "Announcement time", "Quota reset", "Reset-card grant", "Credit grant", "Community announcement", "Updated", "Some sources unavailable", "Access needed", "Sources unavailable", "Details"],
  "zh-CN": ["社区动态", "社区报告，非账号确认", "来源", "公告时间", "额度重置", "重置卡赠送", "额度赠送", "社区公告", "已更新", "部分来源不可用", "需访问权限", "来源不可用", "查看详情"],
  "zh-TW": ["社群動態", "社群報告，非帳戶確認", "來源", "公告時間", "額度重置", "重置卡贈送", "額度贈送", "社群公告", "已更新", "部分來源不可用", "需存取權限", "來源不可用", "查看詳情"],
  ja: ["コミュニティ情報", "コミュニティの報告であり、アカウントの確証ではありません", "ソース", "告知時刻", "利用枠のリセット", "リセット券の配布", "クレジットの付与", "コミュニティの告知", "更新済み", "一部ソースが利用不可", "アクセス権限が必要", "ソースが利用不可", "詳細"],
  ko: ["커뮤니티 소식", "커뮤니티 보고이며 계정 확인이 아님", "출처", "공지 시각", "한도 초기화", "리셋 카드 지급", "크레딧 지급", "커뮤니티 공지", "업데이트됨", "일부 출처 사용 불가", "접근 권한 필요", "출처 사용 불가", "상세 보기"],
  "es-419": ["Noticias comunitarias", "Reporte comunitario, no confirmación de tu cuenta", "Fuente", "Hora del anuncio", "Restablecimiento de cuota", "Tarjetas de reinicio otorgadas", "Créditos otorgados", "Anuncio comunitario", "Actualizado", "Algunas fuentes no disponibles", "Requiere acceso", "Fuentes no disponibles", "Detalles"],
  "pt-BR": ["Notícias da comunidade", "Relato da comunidade, não confirmação da conta", "Fonte", "Horário do anúncio", "Redefinição de cota", "Concessão de cartões de redefinição", "Concessão de créditos", "Anúncio da comunidade", "Atualizado", "Algumas fontes indisponíveis", "Acesso necessário", "Fontes indisponíveis", "Detalhes"],
  fr: ["Actualités communautaires", "Signalement communautaire, pas confirmation du compte", "Source", "Heure de l'annonce", "Réinitialisation du quota", "Attribution de tickets de réinitialisation", "Attribution de crédits", "Annonce communautaire", "À jour", "Certaines sources indisponibles", "Accès requis", "Sources indisponibles", "Détails"],
  de: ["Community-Meldungen", "Community-Bericht, keine Kontobestätigung", "Quelle", "Ankündigungszeit", "Kontingent-Reset", "Vergabe von Reset-Karten", "Vergabe von Guthaben", "Community-Ankündigung", "Aktualisiert", "Einige Quellen nicht verfügbar", "Zugriff erforderlich", "Quellen nicht verfügbar", "Details"],
  it: ["Novità della comunità", "Segnalazione della comunità, non conferma dell'account", "Fonte", "Ora dell'annuncio", "Ripristino della quota", "Assegnazione di carte di ripristino", "Assegnazione di crediti", "Annuncio della comunità", "Aggiornato", "Alcune fonti non disponibili", "Accesso necessario", "Fonti non disponibili", "Dettagli"],
  ru: ["Новости сообщества", "Сообщение сообщества, не подтверждение аккаунта", "Источник", "Время объявления", "Сброс квоты", "Выдача карт сброса", "Начисление кредитов", "Объявление сообщества", "Обновлено", "Часть источников недоступна", "Требуется доступ", "Источники недоступны", "Подробнее"],
  ar: ["أخبار المجتمع", "تقرير مجتمعي وليس تأكيدا لحسابك", "المصدر", "وقت الإعلان", "إعادة تعيين الحصة", "منح بطاقات إعادة التعيين", "منح أرصدة", "إعلان مجتمعي", "محدث", "بعض المصادر غير متاحة", "يلزم الوصول", "المصادر غير متاحة", "التفاصيل"],
  hi: ["समुदाय की खबरें", "समुदाय की रिपोर्ट, खाते की पुष्टि नहीं", "स्रोत", "घोषणा का समय", "कोटा रीसेट", "रीसेट कार्ड का अनुदान", "क्रेडिट का अनुदान", "समुदाय की घोषणा", "अपडेट किया गया", "कुछ स्रोत अनुपलब्ध", "पहुंच आवश्यक", "स्रोत अनुपलब्ध", "विवरण"],
  id: ["Kabar komunitas", "Laporan komunitas, bukan konfirmasi akun", "Sumber", "Waktu pengumuman", "Reset kuota", "Pemberian kartu reset", "Pemberian kredit", "Pengumuman komunitas", "Diperbarui", "Sebagian sumber tidak tersedia", "Akses diperlukan", "Sumber tidak tersedia", "Detail"],
};

export function getCommunityResetPopupCopy(locale: ResolvedAppLocale): Copy {
  const [title, boundary, source, announcementTime, reset, grant, credits, other, fresh, partial, permission, unavailable, details] = VALUES[locale];
  return { title, boundary, source, announcementTime, reset, grant, credits, other, fresh, partial, permission, unavailable, details };
}
