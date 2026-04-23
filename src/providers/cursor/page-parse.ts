export function createCursorPageParseUnsupportedError(): Error {
  return new Error("Cursor dashboard parsing is not selected for the MVP path.");
}
