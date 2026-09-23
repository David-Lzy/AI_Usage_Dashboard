const EXPECTED_WARNING = {
  code: "UNSAFE_VAR_ASSIGNMENT",
  file: "assets/usage-progress.js",
  message: "Unsafe assignment to innerHTML",
};

export function isKnownReactDomInnerHtmlWarning(warning, bundleText) {
  if (
    warning?.code !== EXPECTED_WARNING.code ||
    warning?.file !== EXPECTED_WARNING.file ||
    warning?.message !== EXPECTED_WARNING.message ||
    !Number.isInteger(warning.line) ||
    !Number.isInteger(warning.column)
  ) {
    return false;
  }

  const line = bundleText.split(/\r?\n/)[warning.line - 1];
  const offset = warning.column - 1;
  if (!line || offset < 0 || !/^[$A-Z_a-z][$\w]*\.innerHTML=/.test(line.slice(offset))) {
    return false;
  }

  const context = line.slice(Math.max(0, offset - 350), offset);
  return context.includes('case"dangerouslySetInnerHTML":') && context.includes('"__html"');
}
