import {
  buildInteractionAuditSignoffHandoffSummary,
  type InteractionAuditSignoffState,
  type InteractionAuditSignoffStatus,
  type InteractionAuditSurfaceSignoffDefinition,
} from "./interaction-audit-signoff";

export type InteractionAuditReviewQueueStatus =
  | "follow_up"
  | "not_reviewed"
  | "pending_checks"
  | "ready";

export type InteractionAuditReviewQueueItem = {
  id: string;
  title: string;
  queueStatus: InteractionAuditReviewQueueStatus;
  signoffStatus: InteractionAuditSignoffStatus;
  completedManualCheckCount: number;
  totalManualCheckCount: number;
  pendingManualCheckCount: number;
};

export type InteractionAuditReviewQueue = {
  nextTargetId: string | null;
  followUpCount: number;
  notReviewedCount: number;
  pendingCheckSurfaceCount: number;
  readyCount: number;
  items: InteractionAuditReviewQueueItem[];
};

function getQueueStatusPriority(status: InteractionAuditReviewQueueStatus): number {
  switch (status) {
    case "follow_up":
      return 0;
    case "not_reviewed":
      return 1;
    case "pending_checks":
      return 2;
    case "ready":
      return 3;
    default:
      return 4;
  }
}

export function buildInteractionAuditReviewQueue(
  definitions: InteractionAuditSurfaceSignoffDefinition[],
  state: InteractionAuditSignoffState,
): InteractionAuditReviewQueue {
  const handoffSummary = buildInteractionAuditSignoffHandoffSummary(definitions, state);
  const items = handoffSummary.surfaces.map((surface) => {
    let queueStatus: InteractionAuditReviewQueueStatus = "ready";

    if (surface.signoffStatus === "follow_up") {
      queueStatus = "follow_up";
    } else if (surface.signoffStatus === "not_reviewed") {
      queueStatus = "not_reviewed";
    } else if (surface.pendingManualChecks.length > 0) {
      queueStatus = "pending_checks";
    }

    return {
      id: surface.id,
      title: surface.title,
      queueStatus,
      signoffStatus: surface.signoffStatus,
      completedManualCheckCount: surface.completedManualCheckCount,
      totalManualCheckCount: surface.totalManualCheckCount,
      pendingManualCheckCount: surface.pendingManualChecks.length,
    };
  });

  const sortedItems = [...items].sort(
    (
      left: InteractionAuditReviewQueueItem,
      right: InteractionAuditReviewQueueItem,
    ) => {
      const priorityDelta =
        getQueueStatusPriority(left.queueStatus) -
        getQueueStatusPriority(right.queueStatus);

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return left.title.localeCompare(right.title);
    },
  );

  return {
    nextTargetId:
      sortedItems.find(
        (item: InteractionAuditReviewQueueItem) => item.queueStatus !== "ready",
      )?.id ?? null,
    followUpCount: items.filter((item) => item.queueStatus === "follow_up").length,
    notReviewedCount: items.filter((item) => item.queueStatus === "not_reviewed").length,
    pendingCheckSurfaceCount: items.filter(
      (item) => item.queueStatus === "pending_checks",
    ).length,
    readyCount: items.filter((item) => item.queueStatus === "ready").length,
    items: sortedItems,
  };
}
