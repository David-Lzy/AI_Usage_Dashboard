export type RecommendedColorId =
  | "red"
  | "orange"
  | "brown"
  | "amber"
  | "yellow"
  | "green"
  | "teal"
  | "cyan"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "slate";

export type ColorChoice = {
  id: RecommendedColorId;
  hex: string;
};

export const RECOMMENDED_COLOR_CHOICES: readonly ColorChoice[] = [
  { id: "red", hex: "#B3261E" },
  { id: "orange", hex: "#C65300" },
  { id: "brown", hex: "#8A4B00" },
  { id: "amber", hex: "#B26A00" },
  { id: "yellow", hex: "#7D6700" },
  { id: "green", hex: "#146C2E" },
  { id: "teal", hex: "#006A60" },
  { id: "cyan", hex: "#006874" },
  { id: "blue", hex: "#005AC1" },
  { id: "indigo", hex: "#4F46E5" },
  { id: "purple", hex: "#6D43A6" },
  { id: "pink", hex: "#A7356B" },
  { id: "slate", hex: "#5F6368" },
] as const;
