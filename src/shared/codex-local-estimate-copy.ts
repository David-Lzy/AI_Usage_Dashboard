import type { ResolvedAppLocale } from "./i18n";

type Copy = {
  used: string;
  full: string;
  resets: string;
  unknown: string;
  learning: string;
  disconnected: string;
  stale: string;
  unpriced: string;
  unverified: string;
  weekly: string;
  fiveHour: string;
  range: string;
  sample: string;
  confidence: string;
  low: string;
  medium: string;
  otherWindow: string;
  caveat: string;
};

const COPY: Record<ResolvedAppLocale, Omit<Copy, "stale" | "unpriced" | "confidence" | "low" | "medium" | "otherWindow">> = {
  en: { used: "Window used · API equivalent", full: "Full window · API equivalent", resets: "Available reset cards", unknown: "Unknown", learning: "Learning", disconnected: "Disconnected", unverified: "Account unverified", weekly: "Weekly", fiveHour: "5-hour", range: "Rounding range", sample: "Priced samples", caveat: "Observed API equivalent, not a subscription balance or bill. Other devices and unpriced calls are not measured." },
  "zh-CN": { used: "本窗口已用等价值", full: "100% 窗口等价值", resets: "可用重置卡", unknown: "未知", learning: "学习中", disconnected: "已断连", unverified: "账号未核对", weekly: "每周", fiveHour: "5 小时", range: "取整误差范围", sample: "已计价样本", caveat: "这是观测得到的 API 等价值，并非订阅余额或账单；其他设备和无法计价的调用未计入。" },
  "zh-TW": { used: "本視窗已用等價值", full: "完整視窗等價值", resets: "可用重置卡", unknown: "未知", learning: "學習中", disconnected: "已斷線", unverified: "帳號未核對", weekly: "每週", fiveHour: "5 小時", range: "四捨五入範圍", sample: "已計價樣本", caveat: "這是觀測所得的 API 等價值，並非訂閱餘額或帳單；其他裝置及無法計價的呼叫未計入。" },
  ja: { used: "使用済み · API換算", full: "全枠 · API換算", resets: "利用可能なリセットカード", unknown: "不明", learning: "学習中", disconnected: "切断中", unverified: "アカウント未確認", weekly: "週間", fiveHour: "5時間", range: "丸め誤差の範囲", sample: "価格計算済みサンプル", caveat: "観測した API 換算額であり、サブスクリプション残高や請求額ではありません。" },
  ko: { used: "사용량 · API 환산", full: "전체 기간 · API 환산", resets: "사용 가능한 리셋 카드", unknown: "알 수 없음", learning: "학습 중", disconnected: "연결 끊김", unverified: "계정 미확인", weekly: "주간", fiveHour: "5시간", range: "반올림 범위", sample: "가격 산정 표본", caveat: "관측된 API 환산액이며 구독 잔액이나 청구액이 아닙니다. 다른 기기와 미확인 호출은 제외됩니다." },
  "es-419": { used: "Uso de ventana · equivalente API", full: "Ventana completa · equivalente API", resets: "Tarjetas de reinicio", unknown: "Desconocido", learning: "Aprendiendo", disconnected: "Desconectado", unverified: "Cuenta sin verificar", weekly: "Semanal", fiveHour: "5 horas", range: "Rango por redondeo", sample: "Muestras valoradas", caveat: "Equivalente API observado; no es saldo ni factura. No incluye otros dispositivos ni llamadas sin precio." },
  "pt-BR": { used: "Uso da janela · equivalente API", full: "Janela completa · equivalente API", resets: "Cartões de redefinição", unknown: "Desconhecido", learning: "Aprendendo", disconnected: "Desconectado", unverified: "Conta não verificada", weekly: "Semanal", fiveHour: "5 horas", range: "Faixa de arredondamento", sample: "Amostras precificadas", caveat: "Equivalente API observado, não saldo ou fatura. Outros dispositivos e chamadas sem preço ficam de fora." },
  fr: { used: "Utilisé · équivalent API", full: "Fenêtre complète · équivalent API", resets: "Cartes de réinitialisation", unknown: "Inconnu", learning: "Apprentissage", disconnected: "Déconnecté", unverified: "Compte non vérifié", weekly: "Hebdomadaire", fiveHour: "5 heures", range: "Plage d'arrondi", sample: "Échantillons tarifés", caveat: "Équivalent API observé, pas un solde ni une facture. Les autres appareils et appels non tarifés sont exclus." },
  de: { used: "Genutzt · API-Gegenwert", full: "Ganzes Fenster · API-Gegenwert", resets: "Verfügbare Reset-Karten", unknown: "Unbekannt", learning: "Lernt", disconnected: "Getrennt", unverified: "Konto ungeprüft", weekly: "Wöchentlich", fiveHour: "5 Stunden", range: "Rundungsspanne", sample: "Bewertete Stichproben", caveat: "Beobachteter API-Gegenwert, kein Guthaben oder Rechnungsbetrag. Andere Geräte und unbewertete Aufrufe fehlen." },
  it: { used: "Usato · equivalente API", full: "Finestra intera · equivalente API", resets: "Carte di ripristino", unknown: "Sconosciuto", learning: "Apprendimento", disconnected: "Disconnesso", unverified: "Account non verificato", weekly: "Settimanale", fiveHour: "5 ore", range: "Intervallo arrotondamento", sample: "Campioni valutati", caveat: "Equivalente API osservato, non saldo o fattura. Altri dispositivi e chiamate senza prezzo sono esclusi." },
  ru: { used: "Потрачено · API-эквивалент", full: "Весь период · API-эквивалент", resets: "Доступные карты сброса", unknown: "Неизвестно", learning: "Сбор данных", disconnected: "Нет соединения", unverified: "Аккаунт не проверен", weekly: "Неделя", fiveHour: "5 часов", range: "Диапазон округления", sample: "Оценённые образцы", caveat: "Наблюдаемый API-эквивалент, не баланс и не счёт. Другие устройства и вызовы без цены не учитываются." },
  ar: { used: "المستخدم · معادل API", full: "النافذة الكاملة · معادل API", resets: "بطاقات إعادة الضبط", unknown: "غير معروف", learning: "قيد التعلم", disconnected: "غير متصل", unverified: "الحساب غير مؤكد", weekly: "أسبوعي", fiveHour: "5 ساعات", range: "نطاق التقريب", sample: "عينات مسعّرة", caveat: "معادل API مرصود، وليس رصيد اشتراك أو فاتورة. الأجهزة الأخرى والاستدعاءات غير المسعّرة غير مشمولة." },
  hi: { used: "उपयोग · API समतुल्य", full: "पूरी अवधि · API समतुल्य", resets: "उपलब्ध रीसेट कार्ड", unknown: "अज्ञात", learning: "सीख रहा है", disconnected: "कनेक्शन नहीं", unverified: "खाता अपुष्ट", weekly: "साप्ताहिक", fiveHour: "5 घंटे", range: "पूर्णांकन सीमा", sample: "मूल्यांकित नमूने", caveat: "यह देखा गया API समतुल्य है, सदस्यता शेष या बिल नहीं। अन्य उपकरणों और अज्ञात मूल्य वाली कॉल को शामिल नहीं किया गया है।" },
  id: { used: "Terpakai · setara API", full: "Jendela penuh · setara API", resets: "Kartu reset tersedia", unknown: "Tidak diketahui", learning: "Mempelajari", disconnected: "Terputus", unverified: "Akun belum diverifikasi", weekly: "Mingguan", fiveHour: "5 jam", range: "Rentang pembulatan", sample: "Sampel bernilai", caveat: "Setara API yang teramati, bukan saldo langganan atau tagihan. Perangkat lain dan panggilan tanpa harga tidak dihitung." },
};

const STALE: Record<ResolvedAppLocale, string> = {
  en: "Stale", "zh-CN": "数据过期", "zh-TW": "資料過期", ja: "期限切れ", ko: "오래된 데이터",
  "es-419": "Datos antiguos", "pt-BR": "Dados antigos", fr: "Données anciennes", de: "Veraltet", it: "Dati non aggiornati",
  ru: "Устарело", ar: "بيانات قديمة", hi: "पुराना डेटा", id: "Data lama",
};
const UNPRICED: Record<ResolvedAppLocale, string> = {
  en: "Price unavailable", "zh-CN": "价格不可用", "zh-TW": "價格不可用", ja: "価格不明", ko: "가격 정보 없음",
  "es-419": "Precio no disponible", "pt-BR": "Preço indisponível", fr: "Prix indisponible", de: "Preis unbekannt", it: "Prezzo non disponibile",
  ru: "Цена недоступна", ar: "السعر غير متاح", hi: "मूल्य उपलब्ध नहीं", id: "Harga tidak tersedia",
};
const DETAIL: Record<ResolvedAppLocale, Pick<Copy, "confidence" | "low" | "medium" | "otherWindow">> = {
  en: { confidence: "Confidence", low: "Low", medium: "Medium", otherWindow: "Window" },
  "zh-CN": { confidence: "置信度", low: "低", medium: "中", otherWindow: "窗口" },
  "zh-TW": { confidence: "信心程度", low: "低", medium: "中", otherWindow: "視窗" },
  ja: { confidence: "信頼度", low: "低", medium: "中", otherWindow: "ウィンドウ" },
  ko: { confidence: "신뢰도", low: "낮음", medium: "보통", otherWindow: "기간" },
  "es-419": { confidence: "Confianza", low: "Baja", medium: "Media", otherWindow: "Ventana" },
  "pt-BR": { confidence: "Confiança", low: "Baixa", medium: "Média", otherWindow: "Janela" },
  fr: { confidence: "Confiance", low: "Faible", medium: "Moyenne", otherWindow: "Fenêtre" },
  de: { confidence: "Verlässlichkeit", low: "Niedrig", medium: "Mittel", otherWindow: "Fenster" },
  it: { confidence: "Affidabilità", low: "Bassa", medium: "Media", otherWindow: "Finestra" },
  ru: { confidence: "Достоверность", low: "Низкая", medium: "Средняя", otherWindow: "Окно" },
  ar: { confidence: "مستوى الثقة", low: "منخفضة", medium: "متوسطة", otherWindow: "نافذة" },
  hi: { confidence: "विश्वसनीयता", low: "कम", medium: "मध्यम", otherWindow: "अवधि" },
  id: { confidence: "Keyakinan", low: "Rendah", medium: "Sedang", otherWindow: "Periode" },
};

export function getCodexLocalEstimateCopy(locale: ResolvedAppLocale): Copy {
  return { ...COPY[locale], ...DETAIL[locale], stale: STALE[locale], unpriced: UNPRICED[locale] };
}
