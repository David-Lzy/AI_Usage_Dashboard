import type { ResolvedAppLocale } from "./i18n";

export type DiagnosticsExportLocalizedCopy = {
  title: string;
  preview: string;
  previewTitle: string;
  download: string;
  downloadTitle: string;
  close: string;
  closeTitle: string;
  previewFailed: string;
  downloadFailed: string;
};

const COPY_BY_LOCALE: Record<
  ResolvedAppLocale,
  DiagnosticsExportLocalizedCopy
> = {
  en: {
    title: "Sanitized diagnostic export",
    preview: "Preview JSON",
    previewTitle: "Sanitized diagnostic preview",
    download: "Download JSON",
    downloadTitle: "Download this sanitized diagnostic snapshot as JSON",
    close: "Close preview",
    closeTitle: "Close the sanitized diagnostic preview",
    previewFailed: "Could not prepare the sanitized diagnostic export.",
    downloadFailed: "Could not start the diagnostic download. Try again.",
  },
  "zh-CN": {
    title: "已脱敏的诊断导出",
    preview: "预览 JSON",
    previewTitle: "已脱敏的诊断预览",
    download: "下载 JSON",
    downloadTitle: "将此已脱敏的诊断快照下载为 JSON",
    close: "关闭预览",
    closeTitle: "关闭已脱敏的诊断预览",
    previewFailed: "无法准备已脱敏的诊断导出。",
    downloadFailed: "无法开始诊断下载，请重试。",
  },
  "zh-TW": {
    title: "已去識別化診斷匯出",
    preview: "預覽 JSON",
    previewTitle: "已去識別化診斷預覽",
    download: "下載 JSON",
    downloadTitle: "將此已去識別化診斷快照下載為 JSON",
    close: "關閉預覽",
    closeTitle: "關閉已去識別化診斷預覽",
    previewFailed: "無法準備已去識別化診斷匯出。",
    downloadFailed: "無法開始診斷下載，請再試一次。",
  },
  ja: {
    title: "匿名化された診断情報のエクスポート",
    preview: "JSON をプレビュー",
    previewTitle: "匿名化された診断情報のプレビュー",
    download: "JSON をダウンロード",
    downloadTitle:
      "この匿名化された診断スナップショットを JSON としてダウンロード",
    close: "プレビューを閉じる",
    closeTitle: "匿名化された診断情報のプレビューを閉じる",
    previewFailed: "匿名化された診断情報のエクスポートを準備できませんでした。",
    downloadFailed:
      "診断情報のダウンロードを開始できませんでした。もう一度お試しください。",
  },
  ko: {
    title: "정리된 진단 내보내기",
    preview: "JSON 미리 보기",
    previewTitle: "정리된 진단 미리 보기",
    download: "JSON 다운로드",
    downloadTitle: "이 정리된 진단 스냅샷을 JSON으로 다운로드",
    close: "미리 보기 닫기",
    closeTitle: "정리된 진단 미리 보기 닫기",
    previewFailed: "정리된 진단 내보내기를 준비할 수 없습니다.",
    downloadFailed: "진단 다운로드를 시작할 수 없습니다. 다시 시도하세요.",
  },
  "es-419": {
    title: "Exportación de diagnóstico depurada",
    preview: "Vista previa de JSON",
    previewTitle: "Vista previa del diagnóstico depurado",
    download: "Descargar JSON",
    downloadTitle:
      "Descargar esta instantánea de diagnóstico depurada como JSON",
    close: "Cerrar vista previa",
    closeTitle: "Cerrar la vista previa del diagnóstico depurado",
    previewFailed:
      "No se pudo preparar la exportación de diagnóstico depurada.",
    downloadFailed:
      "No se pudo iniciar la descarga del diagnóstico. Inténtalo de nuevo.",
  },
  "pt-BR": {
    title: "Exportação de diagnóstico sanitizada",
    preview: "Visualizar JSON",
    previewTitle: "Visualização do diagnóstico sanitizado",
    download: "Baixar JSON",
    downloadTitle: "Baixar este retrato de diagnóstico sanitizado como JSON",
    close: "Fechar visualização",
    closeTitle: "Fechar a visualização do diagnóstico sanitizado",
    previewFailed:
      "Não foi possível preparar a exportação de diagnóstico sanitizada.",
    downloadFailed:
      "Não foi possível iniciar o download do diagnóstico. Tente novamente.",
  },
  fr: {
    title: "Export de diagnostic assaini",
    preview: "Aperçu JSON",
    previewTitle: "Aperçu du diagnostic assaini",
    download: "Télécharger le JSON",
    downloadTitle:
      "Télécharger cet instantané de diagnostic assaini au format JSON",
    close: "Fermer l'aperçu",
    closeTitle: "Fermer l'aperçu du diagnostic assaini",
    previewFailed: "Impossible de préparer l'export de diagnostic assaini.",
    downloadFailed:
      "Impossible de lancer le téléchargement du diagnostic. Réessayez.",
  },
  de: {
    title: "Bereinigter Diagnoseexport",
    preview: "JSON-Vorschau",
    previewTitle: "Bereinigte Diagnosevorschau",
    download: "JSON herunterladen",
    downloadTitle:
      "Diese bereinigte Diagnose-Momentaufnahme als JSON herunterladen",
    close: "Vorschau schließen",
    closeTitle: "Bereinigte Diagnosevorschau schließen",
    previewFailed:
      "Der bereinigte Diagnoseexport konnte nicht vorbereitet werden.",
    downloadFailed:
      "Der Diagnosedownload konnte nicht gestartet werden. Bitte erneut versuchen.",
  },
  it: {
    title: "Esportazione diagnostica sanitizzata",
    preview: "Anteprima JSON",
    previewTitle: "Anteprima diagnostica sanitizzata",
    download: "Scarica JSON",
    downloadTitle:
      "Scarica questa istantanea diagnostica sanitizzata come JSON",
    close: "Chiudi anteprima",
    closeTitle: "Chiudi l'anteprima diagnostica sanitizzata",
    previewFailed:
      "Non è stato possibile preparare l'esportazione diagnostica sanitizzata.",
    downloadFailed:
      "Non è stato possibile avviare il download diagnostico. Riprova.",
  },
  ru: {
    title: "Экспорт очищенной диагностики",
    preview: "Предпросмотр JSON",
    previewTitle: "Предпросмотр очищенной диагностики",
    download: "Скачать JSON",
    downloadTitle: "Скачать этот очищенный диагностический снимок как JSON",
    close: "Закрыть предпросмотр",
    closeTitle: "Закрыть предпросмотр очищенной диагностики",
    previewFailed: "Не удалось подготовить экспорт очищенной диагностики.",
    downloadFailed:
      "Не удалось начать скачивание диагностики. Повторите попытку.",
  },
  ar: {
    title: "تصدير تشخيص منقح",
    preview: "معاينة JSON",
    previewTitle: "معاينة التشخيص المنقح",
    download: "تنزيل JSON",
    downloadTitle: "تنزيل لقطة التشخيص المنقحة هذه بصيغة JSON",
    close: "إغلاق المعاينة",
    closeTitle: "إغلاق معاينة التشخيص المنقح",
    previewFailed: "تعذر إعداد تصدير التشخيص المنقح.",
    downloadFailed: "تعذر بدء تنزيل التشخيص. حاول مرة أخرى.",
  },
  hi: {
    title: "सैनिटाइज़ किया गया निदान निर्यात",
    preview: "JSON पूर्वावलोकन",
    previewTitle: "सैनिटाइज़ किया गया निदान पूर्वावलोकन",
    download: "JSON डाउनलोड करें",
    downloadTitle:
      "इस सैनिटाइज़ किए गए निदान स्नैपशॉट को JSON के रूप में डाउनलोड करें",
    close: "पूर्वावलोकन बंद करें",
    closeTitle: "सैनिटाइज़ किया गया निदान पूर्वावलोकन बंद करें",
    previewFailed: "सैनिटाइज़ किया गया निदान निर्यात तैयार नहीं किया जा सका।",
    downloadFailed: "निदान डाउनलोड शुरू नहीं किया जा सका। फिर से कोशिश करें।",
  },
  id: {
    title: "Ekspor diagnostik tersanitasi",
    preview: "Pratinjau JSON",
    previewTitle: "Pratinjau diagnostik tersanitasi",
    download: "Unduh JSON",
    downloadTitle: "Unduh snapshot diagnostik tersanitasi ini sebagai JSON",
    close: "Tutup pratinjau",
    closeTitle: "Tutup pratinjau diagnostik tersanitasi",
    previewFailed: "Ekspor diagnostik tersanitasi tidak dapat disiapkan.",
    downloadFailed: "Unduhan diagnostik tidak dapat dimulai. Coba lagi.",
  },
};

export function buildDiagnosticsExportLocalizedCopy(
  locale: ResolvedAppLocale,
): DiagnosticsExportLocalizedCopy {
  return { ...COPY_BY_LOCALE[locale] };
}
