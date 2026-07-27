import path from "node:path";

export const DESIGN_CONTRACT_REQUIRED_SECTIONS = [
  "Authority And Scope",
  "Product Character",
  "Design Tokens",
  "Typography And Localization",
  "Surfaces And Elevation",
  "Components And Controls",
  "Responsive Layout",
  "Data Visualization",
  "Motion And Feedback",
  "Accessibility",
  "Do And Don't",
  "Verification",
];

export const DESIGN_CONTRACT_REQUIRED_REFERENCES = [
  "src/sidepanel/theme/tokens.css",
  "src/sidepanel/theme/material-theme.css",
  "src/sidepanel/theme/typography.css",
  "src/sidepanel/theme/surfaces.css",
  "src/sidepanel/theme/buttons.css",
  "src/sidepanel/theme/form-controls.css",
  "src/sidepanel/theme/layout-primitives.css",
  "src/shared/components/usage-history-charts.css",
  "Doc/testing/README.md",
];

const RAW_HEX_COLOR_PATTERN = /#[0-9a-f]{3,8}\b/gi;

export function extractDesignContractHeadings(content) {
  return Array.from(content.matchAll(/^##\s+(.+?)\s*$/gm), (match) => match[1]);
}

export function extractLocalMarkdownLinks(content) {
  return Array.from(content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g), (match) => match[1])
    .map((target) => target.split("#", 1)[0].trim())
    .filter(
      (target) =>
        target.length > 0 &&
        !target.startsWith("http://") &&
        !target.startsWith("https://") &&
        !target.startsWith("mailto:"),
    )
    .map((target) => path.posix.normalize(target));
}

export function validateDesignContract({ content, pathExists = () => true }) {
  const issues = [];
  const headings = extractDesignContractHeadings(content);
  let previousIndex = -1;

  for (const requiredHeading of DESIGN_CONTRACT_REQUIRED_SECTIONS) {
    const currentIndex = headings.indexOf(requiredHeading);

    if (currentIndex === -1) {
      issues.push(`DESIGN.md is missing the \`## ${requiredHeading}\` section.`);
      continue;
    }

    if (currentIndex < previousIndex) {
      issues.push(
        `DESIGN.md section \`## ${requiredHeading}\` is out of the required order.`,
      );
    }

    previousIndex = Math.max(previousIndex, currentIndex);
  }

  const rawHexColors = [...new Set(content.match(RAW_HEX_COLOR_PATTERN) ?? [])];
  if (rawHexColors.length > 0) {
    issues.push(
      `DESIGN.md contains raw color literals (${rawHexColors.join(", ")}); reference semantic tokens instead.`,
    );
  }

  const localLinks = extractLocalMarkdownLinks(content);
  const localLinkSet = new Set(localLinks);

  for (const requiredReference of DESIGN_CONTRACT_REQUIRED_REFERENCES) {
    if (!localLinkSet.has(requiredReference)) {
      issues.push(
        `DESIGN.md must link to the implementation source \`${requiredReference}\`.`,
      );
    }
  }

  for (const localLink of localLinkSet) {
    if (path.posix.isAbsolute(localLink) || localLink.startsWith("../")) {
      issues.push(`DESIGN.md local link \`${localLink}\` must stay inside the repository.`);
      continue;
    }

    if (!pathExists(localLink)) {
      issues.push(`DESIGN.md references missing local path \`${localLink}\`.`);
    }
  }

  return issues;
}

