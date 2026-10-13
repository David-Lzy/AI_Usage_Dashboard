import type { ProviderResetCredits } from "../providers/types";

export function getResetExpirySummary(credits: ProviderResetCredits | undefined, now = Date.now()) {
  const available = credits?.availableCount === 0 ? [] : credits?.offers?.filter((offer) => offer.available === true) ?? [];
  const known = available.filter((offer) => offer.expiresAt && Date.parse(offer.expiresAt) > now)
    .sort((a, b) => Date.parse(a.expiresAt!) - Date.parse(b.expiresAt!));
  return {
    knownExpiry: known[0]?.expiresAt ?? available.find((offer) => !offer.expiresAt && offer.expiryText)?.expiryText ?? null,
    precise: Boolean(known[0]?.expiresAt),
    expiredCapture: (credits?.availableCount ?? 0) > 0 && available.some((offer) => offer.expiresAt
      && Date.parse(offer.expiresAt) > Date.parse(credits!.capturedAt) && Date.parse(offer.expiresAt) <= now),
  };
}
