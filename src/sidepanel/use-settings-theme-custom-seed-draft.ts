import { type FormEvent, useEffect, useState } from "react";

import { normalizeThemeCustomSeedHex } from "../shared/theme";

type UseSettingsThemeCustomSeedDraftOptions = {
  themeCustomSeedHex: string | null;
  onSaveThemeCustomSeed: (themeCustomSeedHex: string) => void;
  onResetThemeCustomSeed: () => void;
};

export function useSettingsThemeCustomSeedDraft({
  themeCustomSeedHex,
  onSaveThemeCustomSeed,
  onResetThemeCustomSeed,
}: UseSettingsThemeCustomSeedDraftOptions) {
  const [themeCustomSeedDraft, setThemeCustomSeedDraft] = useState(
    themeCustomSeedHex ?? "",
  );
  const normalizedThemeCustomSeedDraft =
    normalizeThemeCustomSeedHex(themeCustomSeedDraft);

  useEffect(() => {
    setThemeCustomSeedDraft(themeCustomSeedHex ?? "");
  }, [themeCustomSeedHex]);

  function handleApplyThemeCustomSeed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!normalizedThemeCustomSeedDraft) {
      return;
    }

    onSaveThemeCustomSeed(normalizedThemeCustomSeedDraft);
    setThemeCustomSeedDraft(normalizedThemeCustomSeedDraft);
  }

  function handleResetThemeCustomSeed() {
    setThemeCustomSeedDraft("");
    onResetThemeCustomSeed();
  }

  return {
    handleApplyThemeCustomSeed,
    handleResetThemeCustomSeed,
    setThemeCustomSeedDraft,
    themeCustomSeedDraft,
  };
}
