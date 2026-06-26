import {
  normalizeCustomSourceEndpointUrl,
  type CustomSourceValidationResult,
} from "./custom-sources";
import { getExtensionPermissionsApi } from "./extension-api";

type CustomSourceHostAccessOptions = {
  permissionsApi?: {
    contains?: (permissions: { origins?: string[] }) => boolean | Promise<boolean>;
    request?: (permissions: { origins?: string[] }) => boolean | Promise<boolean>;
  } | null;
};

export function getCustomSourceEndpointOriginPattern(
  endpointUrl: unknown,
): CustomSourceValidationResult<string> {
  const normalizedUrl = normalizeCustomSourceEndpointUrl(endpointUrl);

  if (!normalizedUrl.ok) {
    return normalizedUrl;
  }

  const parsedUrl = new URL(normalizedUrl.value);

  return {
    ok: true,
    value: `${parsedUrl.protocol}//${parsedUrl.hostname}/*`,
  };
}

function getPermissionsApi(
  options: CustomSourceHostAccessOptions,
): NonNullable<CustomSourceHostAccessOptions["permissionsApi"]> | null {
  return options.permissionsApi ?? getExtensionPermissionsApi();
}

export async function hasCustomSourceHostAccess(
  endpointUrl: unknown,
  options: CustomSourceHostAccessOptions = {},
): Promise<boolean> {
  const originPattern = getCustomSourceEndpointOriginPattern(endpointUrl);
  const permissionsApi = getPermissionsApi(options);

  if (!originPattern.ok || typeof permissionsApi?.contains !== "function") {
    return false;
  }

  return permissionsApi.contains({
    origins: [originPattern.value],
  });
}

export async function requestCustomSourceHostAccess(
  endpointUrl: unknown,
  options: CustomSourceHostAccessOptions = {},
): Promise<boolean> {
  const originPattern = getCustomSourceEndpointOriginPattern(endpointUrl);
  const permissionsApi = getPermissionsApi(options);

  if (!originPattern.ok || typeof permissionsApi?.request !== "function") {
    return false;
  }

  return permissionsApi.request({
    origins: [originPattern.value],
  });
}
