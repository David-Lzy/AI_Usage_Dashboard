import { lstatSync, realpathSync } from "node:fs";
import path from "node:path";

export const BUILD_ROOT_ENVIRONMENT_VARIABLE = "AI_USAGE_BUILD_ROOT";

function pathsOverlap(firstPath, secondPath) {
  const relativePath = path.relative(firstPath, secondPath);

  return (
    relativePath === "" ||
    (!relativePath.startsWith(`..${path.sep}`) && relativePath !== ".." && !path.isAbsolute(relativePath))
  );
}

function assertPathDoesNotContainSymbolicLinks(absolutePath, label) {
  const parsedPath = path.parse(absolutePath);
  const segments = absolutePath
    .slice(parsedPath.root.length)
    .split(path.sep)
    .filter(Boolean);
  let currentPath = parsedPath.root;

  for (const segment of segments) {
    currentPath = path.join(currentPath, segment);

    try {
      if (lstatSync(currentPath).isSymbolicLink()) {
        throw new Error(`${label} must not use a symbolic link: ${currentPath}`);
      }
    } catch (error) {
      if (error?.code === "ENOENT") {
        return;
      }
      throw error;
    }
  }
}

function resolveIsolatedBuildRoot(projectRoot, realProjectRoot, configuredRoot) {
  if (configuredRoot === "") {
    throw new Error(`${BUILD_ROOT_ENVIRONMENT_VARIABLE} must not be empty when set.`);
  }

  if (configuredRoot.trim() !== configuredRoot || !path.isAbsolute(configuredRoot)) {
    throw new Error(`${BUILD_ROOT_ENVIRONMENT_VARIABLE} must be an absolute path without surrounding whitespace.`);
  }

  const buildRoot = path.resolve(configuredRoot);

  if (buildRoot === path.parse(buildRoot).root) {
    throw new Error(`${BUILD_ROOT_ENVIRONMENT_VARIABLE} must not be a filesystem root.`);
  }

  if (
    pathsOverlap(projectRoot, buildRoot) ||
    pathsOverlap(buildRoot, projectRoot) ||
    pathsOverlap(realProjectRoot, buildRoot) ||
    pathsOverlap(buildRoot, realProjectRoot)
  ) {
    throw new Error(
      `${BUILD_ROOT_ENVIRONMENT_VARIABLE} must not overlap the project source tree: ${projectRoot}`,
    );
  }

  assertPathDoesNotContainSymbolicLinks(buildRoot, BUILD_ROOT_ENVIRONMENT_VARIABLE);
  for (const outputDirectory of ["chrome", "firefox", "release"]) {
    assertPathDoesNotContainSymbolicLinks(
      path.join(buildRoot, outputDirectory),
      `${BUILD_ROOT_ENVIRONMENT_VARIABLE} ${outputDirectory} output`,
    );
  }

  return buildRoot;
}

export function resolveBuildPaths({
  projectRoot = process.cwd(),
  environment = process.env,
} = {}) {
  const absoluteProjectRoot = path.resolve(projectRoot);
  const realProjectRoot = realpathSync(absoluteProjectRoot);
  const configuredRoot = environment[BUILD_ROOT_ENVIRONMENT_VARIABLE];

  if (configuredRoot === undefined) {
    return {
      projectRoot: absoluteProjectRoot,
      buildRoot: null,
      chromeDir: path.join(absoluteProjectRoot, "dist", "chrome"),
      firefoxDir: path.join(absoluteProjectRoot, "dist", "firefox"),
      releaseDir: path.join(absoluteProjectRoot, "release"),
      isIsolated: false,
    };
  }

  const buildRoot = resolveIsolatedBuildRoot(
    absoluteProjectRoot,
    realProjectRoot,
    configuredRoot,
  );

  return {
    projectRoot: absoluteProjectRoot,
    buildRoot,
    chromeDir: path.join(buildRoot, "chrome"),
    firefoxDir: path.join(buildRoot, "firefox"),
    releaseDir: path.join(buildRoot, "release"),
    isIsolated: true,
  };
}

export function shouldMaintainLegacyChromeDistAliases(buildPaths) {
  return !buildPaths.isIsolated;
}

export function assertConfiguredChromeBuildOutDir(
  buildPaths,
  viteRoot,
  configuredOutDir,
) {
  if (path.resolve(viteRoot, configuredOutDir) !== buildPaths.chromeDir) {
    throw new Error(
      `Vite outDir must remain ${buildPaths.chromeDir}. Do not override --outDir when using ${buildPaths.isIsolated ? "AI_USAGE_BUILD_ROOT" : "the extension build"}.`,
    );
  }
}
