export const BUILD_ROOT_ENVIRONMENT_VARIABLE: "AI_USAGE_BUILD_ROOT";

export interface BuildPaths {
  projectRoot: string;
  buildRoot: string | null;
  chromeDir: string;
  firefoxDir: string;
  releaseDir: string;
  isIsolated: boolean;
}

export interface ResolveBuildPathsOptions {
  projectRoot?: string;
  environment?: NodeJS.ProcessEnv;
}

export function resolveBuildPaths(options?: ResolveBuildPathsOptions): BuildPaths;
export function shouldMaintainLegacyChromeDistAliases(buildPaths: BuildPaths): boolean;
export function assertConfiguredChromeBuildOutDir(
  buildPaths: BuildPaths,
  viteRoot: string,
  configuredOutDir: string,
): void;
