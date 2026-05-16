AI 使用仪表盘把 AI 编码配额、设置阻塞项和同步健康状态放进一个 Chrome 工具栏弹窗和侧边栏里。

它面向 Codex、Cursor、Claude Code、Gemini Code Assist 等编码工作流；不同 provider 暴露的数据可能是精确值、部分信息、使用窗口，或者只是策略说明。这个扩展会把这些边界标清楚，而不是假装所有 provider 都给出同一种数字。

你可以查看：

• provider 健康状态和设置阻塞项
• provider 暴露出的使用窗口和重置时间
• 数据来源类型：API、已登录页面、部分页面上下文，或文档化策略
• 快照新鲜度和同步状态
• 工具栏标记/图标、主题、进度样式、provider 顺序，以及设置导入导出

AI 使用仪表盘采用保守的数据边界：不要求粘贴 cookie，也不要求粘贴原始浏览器 auth header。扩展设置、可选 API 凭据、页面绑定、缓存快照和导入导出文件会保存在你的 Chrome 配置中。可选主机权限只用于支持的 provider 来源。favicon 权限用于可选的“工具栏图标匹配 provider”功能。

这不是 OpenAI、Cursor、Anthropic、Google、JetBrains 或其他 provider 的官方产品。各家 provider 可能改变 dashboard、API、配额文案和策略。当某个来源不可用或只能提供部分信息时，仪表盘会显示这个状态，而不是编造一个数值。

项目以 AGPL-3.0-only 开源。
