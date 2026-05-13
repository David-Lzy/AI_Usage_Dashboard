import {
  buildInitialInteractionAuditSignoffState,
  type InteractionAuditSignoffState,
  type InteractionAuditSignoffStatus,
} from "../interaction-audit-signoff";
import {
  INTERACTION_AUDIT_SIGNOFF_SURFACES,
  INTERACTION_AUDIT_SURFACES,
} from "../interaction-audit-surfaces";
import {
  InteractionAuditSurfaceCard,
  type InteractionAuditAccessibilityCopy,
  type InteractionAuditSurfaceCardCopy,
  type InteractionAuditSurfaceStatus,
} from "./InteractionAuditSurfaceCard";

export type { InteractionAuditSurfaceStatus };

type InteractionAuditSurfaceGridSectionProps = {
  copy: InteractionAuditSurfaceCardCopy;
  accessibilityCopy: InteractionAuditAccessibilityCopy;
  buildAuditUrl: (path: string) => string;
  loadedSurfaces: Record<string, boolean>;
  signoffState: InteractionAuditSignoffState;
  surfaceStatus: Record<string, InteractionAuditSurfaceStatus>;
  onAction: (surfaceId: string, actionId: string) => void;
  onCardRef: (surfaceId: string, element: HTMLElement | null) => void;
  onFrameLoad: (surfaceId: string) => void;
  onFrameRef: (surfaceId: string, node: HTMLIFrameElement | null) => void;
  onManualCheckToggle: (
    surfaceId: string,
    checkIndex: number,
    checked: boolean,
  ) => void;
  onNotes: (surfaceId: string, notes: string) => void;
  onSignoffStatus: (
    surfaceId: string,
    status: InteractionAuditSignoffStatus,
  ) => void;
};

export function InteractionAuditSurfaceGridSection({
  copy,
  accessibilityCopy,
  buildAuditUrl,
  loadedSurfaces,
  signoffState,
  surfaceStatus,
  onAction,
  onCardRef,
  onFrameLoad,
  onFrameRef,
  onManualCheckToggle,
  onNotes,
  onSignoffStatus,
}: InteractionAuditSurfaceGridSectionProps) {
  const initialSignoffState = buildInitialInteractionAuditSignoffState(
    INTERACTION_AUDIT_SIGNOFF_SURFACES,
  );

  return (
    <section
      className="interaction-audit-grid"
      aria-label={accessibilityCopy.surfaceGridLabel}
    >
      {INTERACTION_AUDIT_SURFACES.map((surface) => {
        const surfaceSignoffState =
          signoffState[surface.id] ?? initialSignoffState[surface.id];

        return (
          <InteractionAuditSurfaceCard
            key={surface.id}
            copy={copy}
            accessibilityCopy={accessibilityCopy}
            surface={surface}
            loaded={Boolean(loadedSurfaces[surface.id])}
            status={surfaceStatus[surface.id]}
            signoffState={surfaceSignoffState}
            buildAuditUrl={buildAuditUrl}
            onAction={onAction}
            onCardRef={onCardRef}
            onFrameLoad={onFrameLoad}
            onFrameRef={onFrameRef}
            onManualCheckToggle={onManualCheckToggle}
            onNotes={onNotes}
            onSignoffStatus={onSignoffStatus}
          />
        );
      })}
    </section>
  );
}
