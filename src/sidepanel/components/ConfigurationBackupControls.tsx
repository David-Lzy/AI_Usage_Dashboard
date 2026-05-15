import type { ChangeEvent } from "react";

import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";

type ConfigurationBackupCopy = ReturnType<
  typeof buildSettingsLocalizedCopy
>["configurationBackup"];

type ConfigurationBackupControlsProps = {
  copy: ConfigurationBackupCopy;
  onExportJson: () => void;
  onImportJson: (rawJson: string) => void;
  onSaveToChromeSync: () => void;
  onRestoreFromChromeSync: () => void;
};

export function ConfigurationBackupControls({
  copy,
  onExportJson,
  onImportJson,
  onSaveToChromeSync,
  onRestoreFromChromeSync,
}: ConfigurationBackupControlsProps) {
  function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        onImportJson(reader.result);
      }
    });
    reader.readAsText(file);
  }

  return (
    <div className="configuration-backup-controls" data-configuration-backup="">
      <div className="configuration-backup-controls__header">
        <div>
          <h3 className="configuration-backup-controls__title">{copy.title}</h3>
          <p className="configuration-backup-controls__subtitle">
            {copy.subtitle}
          </p>
        </div>
        <MaterialInfoTooltip>{copy.tooltip}</MaterialInfoTooltip>
      </div>

      <div className="configuration-backup-controls__actions">
        <button className="text-button" type="button" onClick={onExportJson}>
          {copy.exportJson}
        </button>
        <label className="text-button configuration-backup-controls__import">
          <span>{copy.importJson}</span>
          <input
            type="file"
            accept="application/json,.json"
            onChange={handleImportFileChange}
          />
        </label>
        <button
          className="text-button"
          type="button"
          onClick={onSaveToChromeSync}
        >
          {copy.saveToChromeSync}
        </button>
        <button
          className="text-button"
          type="button"
          onClick={onRestoreFromChromeSync}
        >
          {copy.restoreFromChromeSync}
        </button>
      </div>
    </div>
  );
}
