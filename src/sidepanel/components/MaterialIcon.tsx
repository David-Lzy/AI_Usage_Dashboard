type MaterialIconName =
  | "help-outline"
  | "keyboard-arrow-left"
  | "keyboard-arrow-right";

type MaterialIconProps = {
  name: MaterialIconName;
  className?: string;
};

const MATERIAL_ICON_PATHS: Record<MaterialIconName, string> = {
  "help-outline":
    "M11 18h2v-2h-2v2Zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4Z",
  "keyboard-arrow-left": "M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41Z",
  "keyboard-arrow-right": "M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41Z",
};

export function MaterialIcon({ className = "", name }: MaterialIconProps) {
  return (
    <svg
      className={`material-icon${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      data-material-icon={name}
      focusable="false"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d={MATERIAL_ICON_PATHS[name]} />
    </svg>
  );
}
