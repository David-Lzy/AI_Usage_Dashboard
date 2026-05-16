# Store Public Release 6 Locale Handoff

Date: 2026-05-16

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is the current six-locale Chrome Web Store handoff for the public repository release path
- it supplements, but does not replace, the 14-locale draft used by `npm run i18n:check`
- refresh it before Chrome Web Store submission if provider support, permissions, privacy text, or screenshots change materially

## Scope

Selected store languages:

- `en`
- `zh-CN`
- `zh-TW`
- `ja`
- `es-419`
- `pt-BR`

Rationale:

- English remains the default store listing.
- Simplified Chinese, Traditional Chinese, and Japanese match the user's requested priority set.
- Latin American Spanish and Brazilian Portuguese are high-coverage additional Chrome Web Store locales.

## Shared Claim Boundaries

- Keep the product name `AI Usage Dashboard` unchanged.
- Keep provider names unchanged: `Codex`, `Cursor`, `Claude Code`, `Gemini Code Assist`, `JetBrains AI`.
- Do not claim exact remaining quota where the shipped provider path is partial, window-scoped, policy-only, or diagnostic-only.
- Do not describe the extension as an official product from any provider.
- Mention that the project is open source under AGPL-3.0-only and link the public source repository after it is made public.
- Mention the `favicon` permission only as the provider-matched toolbar icon feature.

## Store Fields

### en

Title:

`AI Usage Dashboard`

Short description:

`Track usage, setup blockers, and sync health across AI coding tools.`

Abstract:

`AI Usage Dashboard puts AI coding quota, setup blockers, and sync health in one Chrome toolbar popup and side panel. It is built for Codex, Cursor, Claude Code, Gemini Code Assist, and related coding workflows where provider data can be exact, partial, window-scoped, or policy-only. The extension keeps those boundaries visible instead of pretending every provider exposes the same number.`

Details:

`Open the toolbar popup for a quick read on provider health, remaining usage windows, reset timing, and setup blockers. Open the side panel or full-page dashboard when you need the details: source type, snapshot freshness, diagnostics, permissions, credentials, display preferences, and provider-specific status.`

`AI Usage Dashboard is intentionally conservative. It does not ask you to paste cookies or raw browser auth headers. It stores settings, optional API credentials, page bindings, cached snapshots, and import/export files in your Chrome profile. Optional host permissions are requested only for supported provider origins. The favicon permission is used for the optional provider-matched toolbar icon feature.`

`This is not an official product from OpenAI, Cursor, Anthropic, Google, JetBrains, or any other provider. Provider dashboards, APIs, quota wording, and policies can change. When a source is unavailable or partial, the dashboard labels that state instead of inventing a value.`

Feature bullets:

- `Toolbar popup for quick provider and quota checks`
- `Side panel and full-page dashboard for deeper review`
- `Source labels for exact, partial, window-scoped, policy-only, or unavailable data`
- `Configurable themes, progress styles, provider order, toolbar badge, and toolbar icon`
- `Import/export and Chrome Sync support for extension settings`
- `Open-source code under AGPL-3.0-only`

Screenshot captions:

- `Check provider status and quota rings from the toolbar popup.`
- `Review all enabled providers in one dashboard.`
- `Inspect source boundaries before trusting a number.`
- `Tune language, theme, sync, badge, icon, and progress display.`
- `Use quick setup and appearance controls without leaving the extension.`

### zh-CN

Title:

`AI 使用仪表盘`

Short description:

`跟踪 AI 编码工具的用量、设置阻塞项和同步健康状态。`

Abstract:

`AI 使用仪表盘把 AI 编码配额、设置阻塞项和同步健康状态放进一个 Chrome 工具栏弹窗和侧边栏里。它面向 Codex、Cursor、Claude Code、Gemini Code Assist 等编码工作流；不同 provider 暴露的数据可能是精确值、部分信息、使用窗口，或者只是策略说明。这个扩展会把这些边界标清楚，而不是假装所有 provider 都给出同一种数字。`

Details:

`打开工具栏弹窗，可以快速查看 provider 健康状态、剩余额度窗口、重置时间和设置阻塞项。需要更多细节时，可以进入侧边栏或标签页仪表板，查看数据来源类型、快照新鲜度、诊断信息、权限、凭据、显示偏好和 provider 详情。`

`AI 使用仪表盘采用保守的数据边界：不要求粘贴 cookie，也不要求粘贴原始浏览器 auth header。扩展设置、可选 API 凭据、页面绑定、缓存快照和导入导出文件会保存在你的 Chrome 配置中。可选主机权限只用于支持的 provider 来源。favicon 权限用于可选的“工具栏图标匹配 provider”功能。`

`这不是 OpenAI、Cursor、Anthropic、Google、JetBrains 或其他 provider 的官方产品。各家 provider 可能改变 dashboard、API、配额文案和策略。当某个来源不可用或只能提供部分信息时，仪表盘会显示这个状态，而不是编造一个数值。`

Feature bullets:

- `工具栏弹窗快速查看 provider 和额度`
- `侧边栏和标签页仪表板用于深入检查`
- `清楚标注精确、部分、窗口级、策略级或不可用数据`
- `可配置主题、进度样式、provider 顺序、工具栏标记和图标`
- `支持设置导入导出和 Chrome Sync`
- `源码以 AGPL-3.0-only 开源`

Screenshot captions:

- `在工具栏弹窗里查看 provider 状态和额度圆环。`
- `在一个仪表板里查看所有已启用 provider。`
- `在相信数字前先检查数据来源边界。`
- `调整语言、主题、同步、标记、图标和进度显示。`
- `在扩展内完成快速设置和外观调整。`

### zh-TW

Title:

`AI 使用儀表板`

Short description:

`追蹤 AI 編碼工具的用量、設定阻塞項目與同步健康狀態。`

Abstract:

`AI 使用儀表板把 AI 編碼配額、設定阻塞項目與同步健康狀態放進一個 Chrome 工具列彈窗和側邊欄。它面向 Codex、Cursor、Claude Code、Gemini Code Assist 等編碼工作流程；不同 provider 暴露的資料可能是精確值、部分資訊、使用視窗，或只是政策說明。這個擴充功能會清楚標示這些邊界，而不是假裝每個 provider 都提供同一種數字。`

Details:

`打開工具列彈窗，可以快速查看 provider 健康狀態、剩餘使用視窗、重設時間與設定阻塞項目。需要更多細節時，可以進入側邊欄或完整頁面儀表板，查看資料來源類型、快照新鮮度、診斷資訊、權限、憑證、顯示偏好與 provider 詳情。`

`AI 使用儀表板採用保守的資料邊界：不要求貼上 cookie，也不要求貼上原始瀏覽器 auth header。擴充功能設定、可選 API 憑證、頁面綁定、快取快照與匯入匯出檔案會保存在你的 Chrome 設定檔中。可選主機權限只用於支援的 provider 來源。favicon 權限用於可選的「工具列圖示匹配 provider」功能。`

`這不是 OpenAI、Cursor、Anthropic、Google、JetBrains 或其他 provider 的官方產品。各家 provider 可能改變 dashboard、API、配額文字與政策。當某個來源不可用或只能提供部分資訊時，儀表板會顯示該狀態，而不是編造數值。`

Feature bullets:

- `工具列彈窗快速查看 provider 與配額`
- `側邊欄和完整頁面儀表板用於深入檢查`
- `清楚標示精確、部分、視窗級、政策級或不可用資料`
- `可設定主題、進度樣式、provider 順序、工具列標記與圖示`
- `支援設定匯入匯出與 Chrome Sync`
- `原始碼以 AGPL-3.0-only 開源`

Screenshot captions:

- `在工具列彈窗中查看 provider 狀態與配額圓環。`
- `在一個儀表板中查看所有已啟用 provider。`
- `相信數字前，先檢查資料來源邊界。`
- `調整語言、主題、同步、標記、圖示與進度顯示。`
- `在擴充功能內完成快速設定與外觀調整。`

### ja

Title:

`AI Usage Dashboard`

Short description:

`AI コーディングツールの使用量、設定の詰まり、同期状態を確認。`

Abstract:

`AI Usage Dashboard は、AI コーディングのクォータ、設定の詰まり、同期状態を Chrome ツールバーのポップアップとサイドパネルにまとめます。Codex、Cursor、Claude Code、Gemini Code Assist などのワークフローでは、provider ごとに取得できる情報が正確な数値、部分的な情報、使用ウィンドウ、またはポリシーのみの場合があります。この拡張機能は、その違いを隠さず表示します。`

Details:

`ツールバーのポップアップでは、provider の状態、残り使用量のウィンドウ、リセット時刻、設定ブロッカーをすばやく確認できます。詳細が必要なときは、サイドパネルまたはフルページのダッシュボードで、データソースの種類、スナップショットの鮮度、診断、権限、認証情報、表示設定、provider 詳細を確認できます。`

`AI Usage Dashboard は保守的なデータ境界を採用しています。cookie や生のブラウザー auth header の貼り付けは求めません。設定、任意の API 認証情報、ページの関連付け、キャッシュされたスナップショット、インポート/エクスポート用 JSON は Chrome プロファイルに保存されます。任意のホスト権限は、対応 provider のオリジンにのみ使用します。favicon 権限は、任意の provider 連動ツールバーアイコン機能に使用します。`

`これは OpenAI、Cursor、Anthropic、Google、JetBrains、その他 provider の公式製品ではありません。各 provider は dashboard、API、クォータ文言、ポリシーを変更する可能性があります。情報が取得できない場合や部分的な場合、この拡張機能は数値を推測せず、その状態を表示します。`

Feature bullets:

- `ツールバーポップアップで provider とクォータをすばやく確認`
- `サイドパネルとフルページダッシュボードで詳細確認`
- `正確、部分的、ウィンドウ単位、ポリシーのみ、利用不可を明示`
- `テーマ、進捗表示、provider 順序、ツールバーバッジとアイコンを設定可能`
- `設定のインポート/エクスポートと Chrome Sync に対応`
- `AGPL-3.0-only のオープンソース`

Screenshot captions:

- `ツールバーポップアップで provider 状態とクォータリングを確認。`
- `1 つのダッシュボードで有効な provider を確認。`
- `数値を信頼する前にデータソース境界を確認。`
- `言語、テーマ、同期、バッジ、アイコン、進捗表示を調整。`
- `拡張機能内でクイック設定と外観設定を完了。`

### es-419

Title:

`AI Usage Dashboard`

Short description:

`Supervisa uso, bloqueos de configuración y sincronización en herramientas de IA.`

Abstract:

`AI Usage Dashboard reúne cuotas de herramientas de IA para código, bloqueos de configuración y estado de sincronización en un popup de la barra de Chrome y un panel lateral. Está pensado para flujos con Codex, Cursor, Claude Code, Gemini Code Assist y herramientas similares, donde los datos del provider pueden ser exactos, parciales, por ventana de uso o solo de política. La extensión muestra esos límites en vez de fingir que todos los providers exponen el mismo número.`

Details:

`Abre el popup de la barra para revisar rápido el estado del provider, ventanas de uso restantes, hora de reinicio y bloqueos de configuración. Abre el panel lateral o el dashboard de página completa cuando necesites más detalle: tipo de fuente, frescura del snapshot, diagnósticos, permisos, credenciales, preferencias visuales y estado por provider.`

`AI Usage Dashboard usa límites de datos conservadores. No te pide pegar cookies ni headers de autenticación del navegador. Guarda configuración, credenciales API opcionales, vínculos de páginas, snapshots en caché y archivos JSON de importación/exportación en tu perfil de Chrome. Los permisos opcionales de host solo se usan para orígenes de providers compatibles. El permiso favicon se usa para la función opcional de icono de barra que coincide con el provider.`

`Este no es un producto oficial de OpenAI, Cursor, Anthropic, Google, JetBrains ni de ningún otro provider. Los providers pueden cambiar dashboards, APIs, textos de cuota y políticas. Si una fuente no está disponible o solo entrega información parcial, el dashboard muestra ese estado en vez de inventar un valor.`

Feature bullets:

- `Popup de la barra para revisar providers y cuotas rápidamente`
- `Panel lateral y dashboard de página completa para revisión detallada`
- `Etiquetas para datos exactos, parciales, por ventana, solo política o no disponibles`
- `Temas, estilos de progreso, orden de providers, badge e icono configurables`
- `Importación/exportación y Chrome Sync para la configuración`
- `Código abierto bajo AGPL-3.0-only`

Screenshot captions:

- `Revisa estado de providers y anillos de cuota desde el popup.`
- `Consulta todos los providers habilitados en un solo dashboard.`
- `Inspecciona límites de fuente antes de confiar en un número.`
- `Ajusta idioma, tema, sincronización, badge, icono y progreso.`
- `Completa configuración rápida y apariencia dentro de la extensión.`

### pt-BR

Title:

`AI Usage Dashboard`

Short description:

`Acompanhe uso, bloqueios de configuração e sincronização em ferramentas de IA.`

Abstract:

`AI Usage Dashboard reúne cotas de ferramentas de IA para programação, bloqueios de configuração e saúde de sincronização em um popup da barra do Chrome e em um painel lateral. Ele foi feito para fluxos com Codex, Cursor, Claude Code, Gemini Code Assist e ferramentas relacionadas, onde os dados de cada provider podem ser exatos, parciais, por janela de uso ou apenas baseados em política. A extensão mantém esses limites visíveis em vez de fingir que todos os providers expõem o mesmo número.`

Details:

`Abra o popup da barra para verificar rapidamente a saúde do provider, janelas de uso restantes, horário de reset e bloqueios de configuração. Abra o painel lateral ou o dashboard em página completa quando precisar de mais detalhes: tipo de fonte, frescor do snapshot, diagnósticos, permissões, credenciais, preferências visuais e status por provider.`

`AI Usage Dashboard usa limites de dados conservadores. Ele não pede cookies nem headers brutos de autenticação do navegador. Configurações, credenciais API opcionais, vínculos de página, snapshots em cache e arquivos JSON de importação/exportação ficam no seu perfil do Chrome. Permissões opcionais de host são usadas apenas para origens de providers compatíveis. A permissão favicon é usada para o recurso opcional de ícone da barra combinado com o provider.`

`Este não é um produto oficial da OpenAI, Cursor, Anthropic, Google, JetBrains ou de qualquer outro provider. Providers podem mudar dashboards, APIs, textos de cota e políticas. Quando uma fonte está indisponível ou fornece apenas dados parciais, o dashboard mostra esse estado em vez de inventar um valor.`

Feature bullets:

- `Popup da barra para checar providers e cotas rapidamente`
- `Painel lateral e dashboard em página completa para revisão detalhada`
- `Rótulos para dados exatos, parciais, por janela, somente política ou indisponíveis`
- `Temas, estilos de progresso, ordem de providers, badge e ícone configuráveis`
- `Importação/exportação e Chrome Sync para configurações`
- `Código aberto sob AGPL-3.0-only`

Screenshot captions:

- `Veja status de providers e anéis de cota no popup da barra.`
- `Revise todos os providers habilitados em um só dashboard.`
- `Inspecione os limites da fonte antes de confiar em um número.`
- `Ajuste idioma, tema, sync, badge, ícone e progresso.`
- `Faça configuração rápida e ajustes de aparência dentro da extensão.`

## Submission Notes

- Use the abstract as the first visible paragraph because Chrome Web Store truncates long descriptions in the default view.
- Keep [PRIVACY.md](../../PRIVACY.md) available from the public repository before adding the privacy-policy URL in the store dashboard.
- Use the refreshed screenshot archive from [2026-05-16-public-store-readiness-request-archive](../testing/store_screenshot_archives/2026-05-16-public-store-readiness-request-archive/README.md) for the current dark-mode screenshot set.
- Do not use a light/dark split promotional image until a real light-mode capture pass is completed.
