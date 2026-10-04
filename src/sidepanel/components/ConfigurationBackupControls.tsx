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
  onResetToInitialConfiguration: () => void;
};

export function ConfigurationBackupControls({
  copy,
  onExportJson,
  onImportJson,
  onSaveToChromeSync,
  onRestoreFromChromeSync,
  onResetToInitialConfiguration,
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
        <div className="configuration-backup-controls__action-group">
          <button
            className="text-button text-button--outlined"
            type="button"
            data-backup-action="export"
            onClick={onExportJson}
          >
            {copy.exportJson}
          </button>
          <label className="text-button configuration-backup-controls__import">
            <span>{copy.importJson}</span>
            <input
              type="file"
              data-backup-action="import"
              accept="application/json,.json"
              onChange={handleImportFileChange}
            />
          </label>
        </div>
        <div className="configuration-backup-controls__action-group">
          <button
            className="text-button text-button--outlined"
            type="button"
            data-backup-action="sync-save"
            onClick={onSaveToChromeSync}
          >
            {copy.saveToChromeSync}
          </button>
          <button
            className="text-button text-button--outlined"
            type="button"
            data-backup-action="sync-restore"
            onClick={onRestoreFromChromeSync}
          >
            {copy.restoreFromChromeSync}
          </button>
        </div>
        <div className="configuration-backup-controls__action-group configuration-backup-controls__reset">
          <button
            className="text-button"
            type="button"
            data-backup-action="reset"
            onClick={onResetToInitialConfiguration}
          >
            {copy.resetToInitial}
          </button>
        </div>
      </div>
    </div>
  );
}
