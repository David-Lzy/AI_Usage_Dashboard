import type { ResolvedAppLocale, RuntimeMessageId, RuntimeMessages } from "./i18n";
import { EN_RUNTIME_MESSAGES } from "./runtime-message-catalog-data/base";
import { CJK_RUNTIME_MESSAGE_OVERRIDES } from "./runtime-message-catalog-data/overrides-cjk";
import { LATIN_RUNTIME_MESSAGE_OVERRIDES } from "./runtime-message-catalog-data/overrides-latin";
import { OTHER_RUNTIME_MESSAGE_OVERRIDES } from "./runtime-message-catalog-data/overrides-other";

export { RUNTIME_SHELL_MESSAGE_IDS } from "./runtime-message-catalog-data/base";

const RUNTIME_MESSAGE_OVERRIDES: Partial<
  Record<ResolvedAppLocale, Partial<RuntimeMessages>>
> = {
  ...CJK_RUNTIME_MESSAGE_OVERRIDES,
  ...LATIN_RUNTIME_MESSAGE_OVERRIDES,
  ...OTHER_RUNTIME_MESSAGE_OVERRIDES,
};

export function buildRuntimeMessages(
  supportedLocales: readonly ResolvedAppLocale[],
): Record<ResolvedAppLocale, RuntimeMessages> {
  return Object.fromEntries(
    supportedLocales.map((locale) => [
      locale,
      {
        ...EN_RUNTIME_MESSAGES,
        ...(RUNTIME_MESSAGE_OVERRIDES[locale] ?? {}),
      },
    ]),
  ) as Record<ResolvedAppLocale, RuntimeMessages>;
}

export function getRuntimeMessageOverrideIds(
  locale: ResolvedAppLocale,
): readonly RuntimeMessageId[] {
  return Object.keys(RUNTIME_MESSAGE_OVERRIDES[locale] ?? {}) as RuntimeMessageId[];
}
