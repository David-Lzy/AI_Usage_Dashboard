import type {
  ProviderId,
  ProviderTone,
  SummaryItem,
} from "../providers/types";
import type { ProviderViewModel } from "../shared/provider-view-models";

export type PopupSnapshotStatus = {
  label: string;
  tone: ProviderTone;
  headline: string;
  detail: string;
};

export type PopupGuidanceAction = {
  kind:
    | "settings"
    | "dashboard"
    | "provider-detail"
    | "source-page"
    | "hide-provider";
  label: string;
  providerId?: ProviderId;
  sourceStateKind?: ProviderViewModel["currentSourceStateKind"];
  sourcePageNavigationMode?: "recover" | "view";
};

export type PopupGuidanceCard = {
  label: string;
  tone: ProviderTone;
  headline: string;
  detail: string;
  action: PopupGuidanceAction;
};

export type PopupFeaturedSection = {
  label: string;
  headline: string;
  detail: string;
  emptyStateHeadline: string | null;
  emptyStateDetail: string | null;
};

export type PopupUsageProgressCircle = {
  label: string;
  valueLabel: string;
  ariaLabel: string;
  remainingPercent: number;
  tone: ProviderTone;
};

export type PopupSetupCoverage = {
  label: string;
  statusLabel: string;
  tone: ProviderTone;
  headline: string;
  detail: string;
  items: SummaryItem[];
  action: PopupGuidanceAction | null;
};

export type PopupActionSection = {
  label: string;
  detail: string;
  actions: PopupGuidanceAction[];
};

export type PopupSurfaceRolesCard = {
  label: string;
  headline: string;
  detail: string;
};

export type PopupFirstSetupProvider = {
  providerId: ProviderId;
  providerLabel: string;
};

export type PopupFeaturedProviderCard = {
  provider: ProviderViewModel;
  statusLabel: string;
  metaChips: string[];
  primaryDetail: string;
  secondaryDetail: string;
  usageProgressCircles: PopupUsageProgressCircle[];
  action: PopupGuidanceAction;
  secondaryAction: PopupGuidanceAction;
};

export type PopupViewModel = {
  headerDetail: string;
  summaryItems: SummaryItem[];
  firstSetupProvider: PopupFirstSetupProvider | null;
  visibleProviders: ProviderViewModel[];
  featuredProviders: ProviderViewModel[];
  featuredProviderCards: PopupFeaturedProviderCard[];
  showSnapshotStatus: boolean;
  snapshotStatus: PopupSnapshotStatus;
  guidanceCard: PopupGuidanceCard | null;
  setupCoverage: PopupSetupCoverage;
  actionSection: PopupActionSection;
  surfaceRolesCard: PopupSurfaceRolesCard;
  featuredSection: PopupFeaturedSection;
};

export type PopupSetupCoverageStats = {
  providerCount: number;
  liveReadyProviders: ProviderViewModel[];
  providersNeedingAccess: ProviderViewModel[];
  providersNeedingCredentials: ProviderViewModel[];
  policyOnlyProviders: ProviderViewModel[];
  providersNeedingReview: ProviderViewModel[];
};

export type PopupSummaryLabels = {
  visible: string;
  liveReady: string;
  setupBlockers: string;
  policyOnly: string;
};

export type PopupValueFormatter = (value: number) => string;
