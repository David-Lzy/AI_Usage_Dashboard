AI 使用儀表板把 AI 編碼配額、設定阻塞項目與同步健康狀態放進一個 Chrome 工具列彈窗和側邊欄。

它支援 Codex、Cursor、Claude Code、Gemini Code Assist 等編碼工作流程。不同 provider 暴露的資料可能是精確值、部分資訊、使用視窗、政策說明，或暫時不可用。這個擴充功能會清楚標示這些邊界，而不是假裝每個 provider 都提供同一種數字。

它不要求你貼上 cookie，也不要求你貼上原始瀏覽器 auth header。擴充功能設定、可選 API 憑證、頁面綁定、快取快照與匯入匯出檔案都保存在你的 Chrome 設定檔中。

你可以查看：

• provider 健康狀態與設定阻塞項目
• provider 暴露時的使用視窗與重設時間
• 來源類型：API、已登入頁面、部分頁面上下文或文件政策
• 快照新鮮度與同步狀態
• 工具列標記與工具列圖示行為
• 語言、主題、popup 外觀、進度樣式、provider 順序與匯入匯出設定

使用方式：

打開工具列彈窗，可以快速看一眼目前狀態。需要細節時，進入側邊欄或完整頁面儀表板，查看 provider 詳情、來源邊界、診斷、權限、憑證與顯示設定。

AI 使用儀表板採用保守的資料邊界。可選主機權限只用於支援的 provider 來源。favicon 權限用於可選的「工具列圖示匹配 provider」功能。擴充功能只執行打包腳本，不載入遠端程式碼。

這不是 OpenAI、Cursor、Anthropic、Google、JetBrains 或其他 provider 的官方產品。各家 provider 可能改變 dashboard、API、配額文字與政策。當某個來源不可用或只能提供部分資訊時，儀表板會顯示該狀態，而不是編造數值。

專案原始碼以 AGPL-3.0-only 開源：
https://github.com/David-Lzy/AI_Usage_Dashboard
