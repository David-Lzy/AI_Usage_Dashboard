import type { ResolvedAppLocale, RuntimeMessageId, RuntimeMessages } from "./i18n";
import { EN_RUNTIME_MESSAGES } from "./runtime-message-catalog-data/base";
import { COMPLETION_RUNTIME_MESSAGE_OVERRIDES } from "./runtime-message-catalog-data/overrides-completion";
import { CJK_RUNTIME_MESSAGE_OVERRIDES } from "./runtime-message-catalog-data/overrides-cjk";
import { LATIN_RUNTIME_MESSAGE_OVERRIDES } from "./runtime-message-catalog-data/overrides-latin";
import { OTHER_RUNTIME_MESSAGE_OVERRIDES } from "./runtime-message-catalog-data/overrides-other";

export { RUNTIME_SHELL_MESSAGE_IDS } from "./runtime-message-catalog-data/base";

const RUNTIME_MESSAGE_OVERRIDE_SOURCES: ReadonlyArray<
  Partial<Record<ResolvedAppLocale, Partial<RuntimeMessages>>>
> = [
  CJK_RUNTIME_MESSAGE_OVERRIDES,
  LATIN_RUNTIME_MESSAGE_OVERRIDES,
  OTHER_RUNTIME_MESSAGE_OVERRIDES,
  COMPLETION_RUNTIME_MESSAGE_OVERRIDES,
];

const RUNTIME_MESSAGE_OVERRIDES =
  RUNTIME_MESSAGE_OVERRIDE_SOURCES.reduce<
    Partial<Record<ResolvedAppLocale, Partial<RuntimeMessages>>>
  >((mergedOverrides, source) => {
    for (const [locale, messages] of Object.entries(source) as Array<
      [ResolvedAppLocale, Partial<RuntimeMessages>]
    >) {
      mergedOverrides[locale] = {
        ...(mergedOverrides[locale] ?? {}),
        ...messages,
      };
    }

    return mergedOverrides;
  }, {});

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
