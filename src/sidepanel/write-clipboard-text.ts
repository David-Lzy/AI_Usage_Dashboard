export type ClipboardWriteResult = "success" | "unavailable" | "failed";

export async function writeClipboardText(
  value: string,
): Promise<ClipboardWriteResult> {
  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard?.writeText
  ) {
    return "unavailable";
  }

  try {
    await navigator.clipboard.writeText(value);
    return "success";
  } catch {
    return "failed";
  }
}
