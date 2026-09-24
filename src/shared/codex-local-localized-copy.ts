import type { ResolvedAppLocale } from "./i18n";

type Copy = {
  title: string;
  detail: string;
  mode: string;
  browser: string;
  local: string;
  hybrid: string;
  baseUrl: string;
  pairingCode: string;
  pair: string;
  disconnect: string;
  connected: string;
  disconnected: string;
  expired: string;
  unavailable: string;
  permissionRequired: string;
  failed: string;
  localNote: string;
  hybridNote: string;
};

type SetupCopy = {
  setupTitle: string;
  setupPrepare: string;
  setupRun: string;
  setupFinish: string;
};

const COPY: Record<ResolvedAppLocale, Copy> = {
  en: { title: "Codex local connection", detail: "Connect a manually started companion on this device. Local mode reads quotas without opening a browser page.", mode: "Codex data source", browser: "Browser", local: "Local only", hybrid: "Local quota + browser history", baseUrl: "Companion URL", pairingCode: "Pairing code", pair: "Pair", disconnect: "Disconnect", connected: "Connected", disconnected: "Not connected", expired: "Pairing expired", unavailable: "Companion unavailable", permissionRequired: "Allow access to this loopback address to pair.", failed: "Could not complete the local connection.", localNote: "Local-only mode does not refresh the Codex browser page.", hybridNote: "Browser history appears only when both sources identify the same account." },
  "zh-CN": { title: "Codex 本地连接", detail: "连接这台设备上手动启动的 Companion；仅本地模式无需打开浏览器页面即可读取额度。", mode: "Codex 数据来源", browser: "浏览器", local: "仅本地", hybrid: "本地额度 + 浏览器历史", baseUrl: "Companion 地址", pairingCode: "配对码", pair: "配对", disconnect: "断开", connected: "已连接", disconnected: "未连接", expired: "配对已过期", unavailable: "Companion 不可用", permissionRequired: "请允许访问此本机地址后再配对。", failed: "本地连接未能完成。", localNote: "仅本地模式不会刷新 Codex 浏览器页面。", hybridNote: "只有两端确认属于同一账号时才显示浏览器历史。" },
  "zh-TW": { title: "Codex 本機連線", detail: "連接此裝置上手動啟動的 Companion；僅本機模式不必開啟瀏覽器頁面即可讀取額度。", mode: "Codex 資料來源", browser: "瀏覽器", local: "僅本機", hybrid: "本機額度 + 瀏覽器歷史", baseUrl: "Companion 位址", pairingCode: "配對碼", pair: "配對", disconnect: "中斷", connected: "已連線", disconnected: "未連線", expired: "配對已過期", unavailable: "Companion 無法使用", permissionRequired: "請允許存取本機位址後再配對。", failed: "本機連線未完成。", localNote: "僅本機模式不會重新整理 Codex 瀏覽器頁面。", hybridNote: "只有確認兩端屬於同一帳號時才顯示瀏覽器歷史。" },
  ja: { title: "Codex ローカル接続", detail: "この端末で手動起動した Companion に接続し、ブラウザーを開かずに上限を読み取ります。", mode: "Codex データソース", browser: "ブラウザー", local: "ローカルのみ", hybrid: "ローカル上限 + ブラウザー履歴", baseUrl: "Companion URL", pairingCode: "ペアリングコード", pair: "接続", disconnect: "切断", connected: "接続済み", disconnected: "未接続", expired: "接続期限切れ", unavailable: "Companion を利用できません", permissionRequired: "接続するにはローカルアドレスへのアクセスを許可してください。", failed: "ローカル接続に失敗しました。", localNote: "ローカルのみでは Codex のブラウザーページを更新しません。", hybridNote: "両方のソースで同じアカウントと確認できた場合のみ履歴を表示します。" },
  ko: { title: "Codex 로컬 연결", detail: "이 기기에서 수동으로 시작한 Companion에 연결해 브라우저 페이지 없이 한도를 읽습니다.", mode: "Codex 데이터 소스", browser: "브라우저", local: "로컬 전용", hybrid: "로컬 한도 + 브라우저 기록", baseUrl: "Companion URL", pairingCode: "페어링 코드", pair: "연결", disconnect: "연결 해제", connected: "연결됨", disconnected: "연결되지 않음", expired: "페어링 만료", unavailable: "Companion 사용 불가", permissionRequired: "연결하려면 로컬 주소 접근을 허용하세요.", failed: "로컬 연결에 실패했습니다.", localNote: "로컬 전용 모드에서는 Codex 브라우저 페이지를 새로고침하지 않습니다.", hybridNote: "두 소스의 계정이 같다고 확인될 때만 브라우저 기록을 표시합니다." },
  "es-419": { title: "Conexión local de Codex", detail: "Conecta el Companion iniciado manualmente en este equipo para leer cuotas sin abrir el navegador.", mode: "Origen de Codex", browser: "Navegador", local: "Solo local", hybrid: "Cuota local + historial web", baseUrl: "URL de Companion", pairingCode: "Código de vinculación", pair: "Vincular", disconnect: "Desconectar", connected: "Conectado", disconnected: "Sin conexión", expired: "Vínculo caducado", unavailable: "Companion no disponible", permissionRequired: "Permite el acceso a esta dirección local para vincular.", failed: "No se completó la conexión local.", localNote: "El modo local no actualiza la página web de Codex.", hybridNote: "El historial web aparece solo si ambas fuentes son de la misma cuenta." },
  "pt-BR": { title: "Conexão local do Codex", detail: "Conecte o Companion iniciado manualmente neste dispositivo para ler limites sem abrir o navegador.", mode: "Fonte do Codex", browser: "Navegador", local: "Somente local", hybrid: "Limite local + histórico web", baseUrl: "URL do Companion", pairingCode: "Código de pareamento", pair: "Parear", disconnect: "Desconectar", connected: "Conectado", disconnected: "Desconectado", expired: "Pareamento expirado", unavailable: "Companion indisponível", permissionRequired: "Permita acesso a este endereço local para parear.", failed: "A conexão local não foi concluída.", localNote: "O modo local não atualiza a página do Codex no navegador.", hybridNote: "O histórico web aparece somente quando as contas são confirmadas como iguais." },
  fr: { title: "Connexion locale Codex", detail: "Connectez le Companion démarré manuellement sur cet appareil pour lire les quotas sans ouvrir le navigateur.", mode: "Source Codex", browser: "Navigateur", local: "Local uniquement", hybrid: "Quota local + historique web", baseUrl: "URL du Companion", pairingCode: "Code d’association", pair: "Associer", disconnect: "Déconnecter", connected: "Connecté", disconnected: "Non connecté", expired: "Association expirée", unavailable: "Companion indisponible", permissionRequired: "Autorisez cette adresse locale pour l’association.", failed: "La connexion locale a échoué.", localNote: "Le mode local n’actualise pas la page Codex du navigateur.", hybridNote: "L’historique web n’apparaît que si les deux sources correspondent au même compte." },
  de: { title: "Lokale Codex-Verbindung", detail: "Verbinde den manuell gestarteten Companion auf diesem Gerät, um Kontingente ohne Browserseite zu lesen.", mode: "Codex-Datenquelle", browser: "Browser", local: "Nur lokal", hybrid: "Lokales Kontingent + Browserverlauf", baseUrl: "Companion-URL", pairingCode: "Kopplungscode", pair: "Koppeln", disconnect: "Trennen", connected: "Verbunden", disconnected: "Nicht verbunden", expired: "Kopplung abgelaufen", unavailable: "Companion nicht verfügbar", permissionRequired: "Erlaube den Zugriff auf diese lokale Adresse.", failed: "Die lokale Verbindung konnte nicht hergestellt werden.", localNote: "Der lokale Modus aktualisiert die Codex-Browserseite nicht.", hybridNote: "Browserverlauf erscheint nur bei bestätigter Kontoübereinstimmung." },
  it: { title: "Connessione locale Codex", detail: "Connetti il Companion avviato manualmente su questo dispositivo per leggere le quote senza aprire il browser.", mode: "Origine Codex", browser: "Browser", local: "Solo locale", hybrid: "Quota locale + cronologia web", baseUrl: "URL Companion", pairingCode: "Codice di associazione", pair: "Associa", disconnect: "Disconnetti", connected: "Connesso", disconnected: "Non connesso", expired: "Associazione scaduta", unavailable: "Companion non disponibile", permissionRequired: "Consenti l’accesso a questo indirizzo locale.", failed: "Connessione locale non riuscita.", localNote: "La modalità locale non aggiorna la pagina Codex nel browser.", hybridNote: "La cronologia web compare solo se gli account corrispondono." },
  ru: { title: "Локальное подключение Codex", detail: "Подключите Companion, запущенный вручную на этом устройстве, чтобы читать лимиты без страницы браузера.", mode: "Источник Codex", browser: "Браузер", local: "Только локально", hybrid: "Локальный лимит + история браузера", baseUrl: "Адрес Companion", pairingCode: "Код сопряжения", pair: "Подключить", disconnect: "Отключить", connected: "Подключено", disconnected: "Не подключено", expired: "Сопряжение истекло", unavailable: "Companion недоступен", permissionRequired: "Разрешите доступ к локальному адресу.", failed: "Не удалось подключиться локально.", localNote: "Локальный режим не обновляет страницу Codex в браузере.", hybridNote: "История браузера показывается только при совпадении аккаунтов." },
  ar: { title: "اتصال Codex المحلي", detail: "اتصل بخدمة Companion المشغلة يدويًا على هذا الجهاز لقراءة الحدود دون فتح المتصفح.", mode: "مصدر بيانات Codex", browser: "المتصفح", local: "محلي فقط", hybrid: "حدود محلية + سجل المتصفح", baseUrl: "عنوان Companion", pairingCode: "رمز الاقتران", pair: "اقتران", disconnect: "قطع الاتصال", connected: "متصل", disconnected: "غير متصل", expired: "انتهى الاقتران", unavailable: "Companion غير متاح", permissionRequired: "اسمح بالوصول إلى هذا العنوان المحلي للاقتران.", failed: "تعذر إكمال الاتصال المحلي.", localNote: "الوضع المحلي لا يحدث صفحة Codex في المتصفح.", hybridNote: "يظهر سجل المتصفح فقط عند التحقق من تطابق الحسابين." },
  hi: { title: "Codex स्थानीय कनेक्शन", detail: "ब्राउज़र पेज खोले बिना सीमा पढ़ने के लिए इस डिवाइस पर मैन्युअल रूप से शुरू किए गए Companion से जुड़ें।", mode: "Codex डेटा स्रोत", browser: "ब्राउज़र", local: "केवल स्थानीय", hybrid: "स्थानीय सीमा + ब्राउज़र इतिहास", baseUrl: "Companion URL", pairingCode: "पेयरिंग कोड", pair: "पेयर करें", disconnect: "डिस्कनेक्ट", connected: "कनेक्टेड", disconnected: "कनेक्ट नहीं है", expired: "पेयरिंग समाप्त", unavailable: "Companion उपलब्ध नहीं", permissionRequired: "पेयर करने के लिए इस स्थानीय पते की अनुमति दें।", failed: "स्थानीय कनेक्शन पूरा नहीं हुआ।", localNote: "स्थानीय मोड Codex ब्राउज़र पेज को रीफ़्रेश नहीं करता।", hybridNote: "ब्राउज़र इतिहास तभी दिखेगा जब दोनों स्रोत एक ही खाते के हों।" },
  id: { title: "Koneksi lokal Codex", detail: "Hubungkan Companion yang dijalankan manual di perangkat ini untuk membaca kuota tanpa membuka browser.", mode: "Sumber Codex", browser: "Browser", local: "Hanya lokal", hybrid: "Kuota lokal + riwayat browser", baseUrl: "URL Companion", pairingCode: "Kode pasangan", pair: "Pasangkan", disconnect: "Putuskan", connected: "Terhubung", disconnected: "Belum terhubung", expired: "Pasangan kedaluwarsa", unavailable: "Companion tidak tersedia", permissionRequired: "Izinkan akses ke alamat lokal ini untuk memasangkan.", failed: "Koneksi lokal gagal.", localNote: "Mode lokal tidak menyegarkan halaman Codex di browser.", hybridNote: "Riwayat browser hanya muncul jika kedua sumber memakai akun yang sama." },
};

const SETUP_COPY: Record<ResolvedAppLocale, SetupCopy> = {
  en: {
    setupTitle: "How to pair",
    setupPrepare: "On this computer, get the matching project source, install Node.js 22+ and Codex CLI, then sign in to Codex CLI.",
    setupRun: "From the project folder, replace the Codex Home path and run:",
    setupFinish: "Keep the terminal open. Enter its printed URL and one-time code below, then allow Chrome to access the local address. After a restart, pair again with the new code.",
  },
  "zh-CN": {
    setupTitle: "如何配对",
    setupPrepare: "在这台电脑获取对应版本的项目源码，安装 Node.js 22+ 和 Codex CLI，并登录 Codex CLI。",
    setupRun: "在项目目录中替换 Codex Home 的绝对路径，然后运行：",
    setupFinish: "保持终端运行，将打印的地址和一次性配对码填入下方，并允许 Chrome 访问本机地址。Companion 重启后需用新代码重新配对。",
  },
  "zh-TW": {
    setupTitle: "如何配對",
    setupPrepare: "在這台電腦取得對應版本的專案原始碼，安裝 Node.js 22+ 和 Codex CLI，並登入 Codex CLI。",
    setupRun: "在專案目錄中替換 Codex Home 的絕對路徑，然後執行：",
    setupFinish: "保持終端機執行，將顯示的位址和一次性配對碼填入下方，並允許 Chrome 存取本機位址。Companion 重新啟動後需使用新代碼再次配對。",
  },
  ja: {
    setupTitle: "ペアリング方法",
    setupPrepare: "この端末で対応する版のソースを入手し、Node.js 22+ と Codex CLI をインストールして、Codex CLI にログインします。",
    setupRun: "プロジェクトのフォルダーで Codex Home の絶対パスを置き換えて実行します：",
    setupFinish: "ターミナルを開いたまま、表示された URL とワンタイムコードを下に入力し、Chrome のローカルアドレスへのアクセスを許可します。再起動後は新しいコードで再接続してください。",
  },
  ko: {
    setupTitle: "페어링 방법",
    setupPrepare: "이 컴퓨터에서 해당 버전의 프로젝트 소스를 받고 Node.js 22+와 Codex CLI를 설치한 뒤 Codex CLI에 로그인하세요.",
    setupRun: "프로젝트 폴더에서 Codex Home의 절대 경로를 바꾼 뒤 실행하세요:",
    setupFinish: "터미널을 열어 두고 표시된 URL과 일회용 코드를 아래에 입력한 후 Chrome의 로컬 주소 접근을 허용하세요. Companion을 다시 시작하면 새 코드로 다시 페어링해야 합니다.",
  },
  "es-419": {
    setupTitle: "Cómo vincular",
    setupPrepare: "En esta computadora, descarga el código fuente de la versión correspondiente, instala Node.js 22+ y Codex CLI e inicia sesión en Codex CLI.",
    setupRun: "En la carpeta del proyecto, reemplaza la ruta absoluta de Codex Home y ejecuta:",
    setupFinish: "Deja abierta la terminal. Ingresa abajo la URL y el código temporal que muestra, y permite que Chrome acceda a la dirección local. Tras reiniciar Companion, vuelve a vincularlo con el nuevo código.",
  },
  "pt-BR": {
    setupTitle: "Como parear",
    setupPrepare: "Neste computador, baixe o código-fonte da versão correspondente, instale Node.js 22+ e Codex CLI e entre no Codex CLI.",
    setupRun: "Na pasta do projeto, substitua o caminho absoluto do Codex Home e execute:",
    setupFinish: "Mantenha o terminal aberto. Digite abaixo a URL e o código temporário exibidos e permita que o Chrome acesse o endereço local. Após reiniciar o Companion, pareie novamente com o novo código.",
  },
  fr: {
    setupTitle: "Comment associer",
    setupPrepare: "Sur cet ordinateur, récupérez le code source de la version correspondante, installez Node.js 22+ et Codex CLI, puis connectez-vous à Codex CLI.",
    setupRun: "Dans le dossier du projet, remplacez le chemin absolu vers Codex Home, puis exécutez :",
    setupFinish: "Laissez le terminal ouvert. Saisissez ci-dessous l’URL et le code à usage unique affichés, puis autorisez Chrome à accéder à l’adresse locale. Après un redémarrage, associez à nouveau le Companion avec le nouveau code.",
  },
  de: {
    setupTitle: "So koppelst du den Companion",
    setupPrepare: "Lade auf diesem Computer den Quellcode der passenden Version herunter, installiere Node.js 22+ und Codex CLI und melde dich bei Codex CLI an.",
    setupRun: "Ersetze im Projektordner den absoluten Pfad zu Codex Home und führe aus:",
    setupFinish: "Lass das Terminal geöffnet. Trage die angezeigte URL und den Einmalcode unten ein und erlaube Chrome den Zugriff auf die lokale Adresse. Nach einem Neustart musst du mit dem neuen Code erneut koppeln.",
  },
  it: {
    setupTitle: "Come associare",
    setupPrepare: "Su questo computer, scarica il codice sorgente della versione corrispondente, installa Node.js 22+ e Codex CLI, quindi accedi a Codex CLI.",
    setupRun: "Nella cartella del progetto, sostituisci il percorso assoluto di Codex Home ed esegui:",
    setupFinish: "Lascia aperto il terminale. Inserisci qui sotto l’URL e il codice monouso mostrati, poi consenti a Chrome l’accesso all’indirizzo locale. Dopo un riavvio, associa di nuovo il Companion con il nuovo codice.",
  },
  ru: {
    setupTitle: "Как подключить",
    setupPrepare: "На этом компьютере получите исходный код соответствующей версии, установите Node.js 22+ и Codex CLI и войдите в Codex CLI.",
    setupRun: "В каталоге проекта замените абсолютный путь к Codex Home и выполните:",
    setupFinish: "Оставьте терминал открытым. Введите ниже показанные URL и одноразовый код и разрешите Chrome доступ к локальному адресу. После перезапуска Companion подключитесь заново с новым кодом.",
  },
  ar: {
    setupTitle: "طريقة الاقتران",
    setupPrepare: "على هذا الجهاز، احصل على شيفرة المشروع للإصدار المطابق، وثبّت Node.js 22+ وCodex CLI، ثم سجّل الدخول إلى Codex CLI.",
    setupRun: "من مجلد المشروع، استبدل المسار المطلق لمجلد Codex Home ثم شغّل:",
    setupFinish: "أبقِ الطرفية مفتوحة. أدخل العنوان والرمز المؤقت المعروضين أدناه، ثم اسمح لـ Chrome بالوصول إلى العنوان المحلي. بعد إعادة تشغيل Companion، أعد الاقتران بالرمز الجديد.",
  },
  hi: {
    setupTitle: "पेयर कैसे करें",
    setupPrepare: "इस कंप्यूटर पर संबंधित संस्करण का प्रोजेक्ट स्रोत लें, Node.js 22+ और Codex CLI इंस्टॉल करें, फिर Codex CLI में साइन इन करें।",
    setupRun: "प्रोजेक्ट फ़ोल्डर में Codex Home का पूरा पथ बदलकर यह चलाएँ:",
    setupFinish: "टर्मिनल खुला रखें। उसमें दिखा URL और एक-बार का कोड नीचे भरें, फिर Chrome को स्थानीय पते की अनुमति दें। Companion दोबारा शुरू होने पर नए कोड से फिर पेयर करें।",
  },
  id: {
    setupTitle: "Cara memasangkan",
    setupPrepare: "Di komputer ini, ambil kode sumber proyek untuk versi yang sesuai, pasang Node.js 22+ dan Codex CLI, lalu masuk ke Codex CLI.",
    setupRun: "Di folder proyek, ganti jalur absolut Codex Home lalu jalankan:",
    setupFinish: "Biarkan terminal tetap terbuka. Masukkan URL dan kode sekali pakai yang ditampilkan di bawah, lalu izinkan Chrome mengakses alamat lokal. Setelah Companion dimulai ulang, pasangkan lagi dengan kode baru.",
  },
};

export function getCodexLocalConnectionCopy(locale: ResolvedAppLocale): Copy & SetupCopy {
  return { ...COPY[locale], ...SETUP_COPY[locale] };
}
