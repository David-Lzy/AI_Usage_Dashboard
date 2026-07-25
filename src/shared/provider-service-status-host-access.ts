import type { ProviderServiceStatusVendorId } from "../providers/types";
import { getExtensionPermissionsApi } from "./extension-api";
import { PROVIDER_SERVICE_STATUS_CONFIG } from "./provider-service-status";

type ProviderStatusHostAccessOptions = {
  permissionsApi?: {
    contains?: (permissions: { origins?: string[] }) => boolean | Promise<boolean>;
    request?: (permissions: { origins?: string[] }) => boolean | Promise<boolean>;
  } | null;
};

function getPermissionsApi(
  options: ProviderStatusHostAccessOptions,
): NonNullable<ProviderStatusHostAccessOptions["permissionsApi"]> | null {
  return options.permissionsApi ?? getExtensionPermissionsApi();
}

export function getProviderServiceStatusOriginPattern(
  vendorId: ProviderServiceStatusVendorId,
): string {
  return PROVIDER_SERVICE_STATUS_CONFIG[vendorId].originPattern;
}

export async function hasProviderServiceStatusHostAccess(
  vendorId: ProviderServiceStatusVendorId,
  options: ProviderStatusHostAccessOptions = {},
): Promise<boolean> {
  const permissionsApi = getPermissionsApi(options);
  if (typeof permissionsApi?.contains !== "function") {
    return false;
  }

  return permissionsApi.contains({
    origins: [getProviderServiceStatusOriginPattern(vendorId)],
  });
}

export async function requestProviderServiceStatusHostAccess(
  vendorId: ProviderServiceStatusVendorId,
  options: ProviderStatusHostAccessOptions = {},
): Promise<boolean> {
  const permissionsApi = getPermissionsApi(options);
  if (typeof permissionsApi?.request !== "function") {
    return false;
  }

  return permissionsApi.request({
    origins: [getProviderServiceStatusOriginPattern(vendorId)],
  });
}
