import {
  MaterialActionIcon,
  type MaterialActionIconName,
} from "../shared/components/MaterialActionIcon";

export type PopupMaterialIconName = MaterialActionIconName;

export function PopupMaterialIcon({ name }: { name: PopupMaterialIconName }) {
  return (
    <MaterialActionIcon
      className="popup-header__action-icon"
      data-popup-material-icon={name}
      name={name}
    />
  );
}
