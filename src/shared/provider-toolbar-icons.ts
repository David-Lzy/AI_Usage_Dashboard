import type { ProviderId } from "../providers/types";

export const PROVIDER_TOOLBAR_ICON_PAGE_URLS: Record<ProviderId, string> = {
  "cursor-personal-page": "https://cursor.com/",
  "cursor-team-api": "https://cursor.com/",
  "jetbrains-org-page": "https://www.jetbrains.com/",
  "claude-code-team-page": "https://claude.ai/",
  "claude-code-admin-api": "https://claude.ai/",
  "gemini-policy": "https://gemini.google.com/",
  "codex-personal-page": "https://chatgpt.com/codex",
  "codex-enterprise-api": "https://chatgpt.com/codex",
  "sub2api-api-key": "https://github.com/Wei-Shaw/sub2api",
};

export const DEFAULT_TOOLBAR_ACTION_ICON_PATHS = {
  16: "icons/icon16.png",
  32: "icons/icon32.png",
} as const;
