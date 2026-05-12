import {
  createRuntimeI18n,
  DEFAULT_APP_LOCALE_PREFERENCE,
  type RuntimeI18n,
} from "../shared/i18n";

type RuntimeI18nReader = Parameters<typeof createRuntimeI18n>[1];

export function createDefaultOperatorRuntimeI18n(
  reader: RuntimeI18nReader =
    typeof window !== "undefined" ? window : undefined,
): RuntimeI18n {
  return createRuntimeI18n(DEFAULT_APP_LOCALE_PREFERENCE, reader);
}
