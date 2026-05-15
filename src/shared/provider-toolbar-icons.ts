import type { ProviderId } from "../providers/types";

export const PROVIDER_TOOLBAR_ICON_PAGE_URLS: Record<ProviderId, string> = {
  cursor: "https://cursor.com/",
  jetbrains: "https://www.jetbrains.com/",
  "claude-code": "https://claude.ai/",
  gemini: "https://gemini.google.com/",
  codex: "https://chatgpt.com/",
};

export const DEFAULT_TOOLBAR_ACTION_ICON_PATHS = {
  16: "icons/icon16.png",
  32: "icons/icon32.png",
} as const;
