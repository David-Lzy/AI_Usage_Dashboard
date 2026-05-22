import {
  type InteractionAuditSignoffState,
  type InteractionAuditSignoffMetadata,
  type InteractionAuditSignoffRequestContext,
  type InteractionAuditSurfaceSignoffDefinition,
  INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY,
  INTERACTION_AUDIT_SIGNOFF_METADATA_STORAGE_KEY,
  INTERACTION_AUDIT_SIGNOFF_REQUEST_CONTEXT_STORAGE_KEY,
  buildInitialInteractionAuditSignoffState,
  buildInitialInteractionAuditSignoffMetadata,
  buildInitialInteractionAuditSignoffRequestContext,
  normalizeInteractionAuditSignoffState,
  normalizeInteractionAuditSignoffMetadata,
  normalizeInteractionAuditSignoffRequestContext,
} from "./interaction-audit-signoff-state";
import { getSafeLocalStorage } from "../shared/local-storage";

let memoryFallbackState: InteractionAuditSignoffState | null = null;
let memoryFallbackMetadata: InteractionAuditSignoffMetadata | null = null;
let memoryFallbackRequestContext: InteractionAuditSignoffRequestContext | null =
  null;

function cloneSignoffState(
  state: InteractionAuditSignoffState,
): InteractionAuditSignoffState {
  return structuredClone(state);
}

function cloneSignoffMetadata(
  metadata: InteractionAuditSignoffMetadata,
): InteractionAuditSignoffMetadata {
  return structuredClone(metadata);
}

function cloneSignoffRequestContext(
  requestContext: InteractionAuditSignoffRequestContext,
): InteractionAuditSignoffRequestContext {
  return structuredClone(requestContext);
}

export function readInteractionAuditSignoffState(
  definitions: InteractionAuditSurfaceSignoffDefinition[],
): InteractionAuditSignoffState {
  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    try {
      const rawState = localStorage.getItem(INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY);

      if (!rawState) {
        return buildInitialInteractionAuditSignoffState(definitions);
      }

      return normalizeInteractionAuditSignoffState(
        JSON.parse(rawState) as InteractionAuditSignoffState,
        definitions,
      );
    } catch {
      localStorage.removeItem(INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY);
      return buildInitialInteractionAuditSignoffState(definitions);
    }
  }

  return memoryFallbackState
    ? normalizeInteractionAuditSignoffState(
        cloneSignoffState(memoryFallbackState),
        definitions,
      )
    : buildInitialInteractionAuditSignoffState(definitions);
}

export function readInteractionAuditSignoffMetadata(): InteractionAuditSignoffMetadata {
  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    try {
      const rawMetadata = localStorage.getItem(
        INTERACTION_AUDIT_SIGNOFF_METADATA_STORAGE_KEY,
      );

      if (!rawMetadata) {
        return buildInitialInteractionAuditSignoffMetadata();
      }

      return normalizeInteractionAuditSignoffMetadata(
        JSON.parse(rawMetadata) as InteractionAuditSignoffMetadata,
      );
    } catch {
      localStorage.removeItem(INTERACTION_AUDIT_SIGNOFF_METADATA_STORAGE_KEY);
      return buildInitialInteractionAuditSignoffMetadata();
    }
  }

  return memoryFallbackMetadata
    ? normalizeInteractionAuditSignoffMetadata(
        cloneSignoffMetadata(memoryFallbackMetadata),
      )
    : buildInitialInteractionAuditSignoffMetadata();
}

export function readInteractionAuditSignoffRequestContext(): InteractionAuditSignoffRequestContext {
  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    try {
      const rawRequestContext = localStorage.getItem(
        INTERACTION_AUDIT_SIGNOFF_REQUEST_CONTEXT_STORAGE_KEY,
      );

      if (!rawRequestContext) {
        return buildInitialInteractionAuditSignoffRequestContext();
      }

      return normalizeInteractionAuditSignoffRequestContext(
        JSON.parse(rawRequestContext) as InteractionAuditSignoffRequestContext,
      );
    } catch {
      localStorage.removeItem(
        INTERACTION_AUDIT_SIGNOFF_REQUEST_CONTEXT_STORAGE_KEY,
      );
      return buildInitialInteractionAuditSignoffRequestContext();
    }
  }

  return memoryFallbackRequestContext
    ? normalizeInteractionAuditSignoffRequestContext(
        cloneSignoffRequestContext(memoryFallbackRequestContext),
      )
    : buildInitialInteractionAuditSignoffRequestContext();
}

export function writeInteractionAuditSignoffState(
  state: InteractionAuditSignoffState,
  definitions: InteractionAuditSurfaceSignoffDefinition[],
): InteractionAuditSignoffState {
  const normalizedState = normalizeInteractionAuditSignoffState(state, definitions);
  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    localStorage.setItem(
      INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY,
      JSON.stringify(normalizedState),
    );
  } else {
    memoryFallbackState = cloneSignoffState(normalizedState);
  }

  return normalizedState;
}

export function writeInteractionAuditSignoffMetadata(
  metadata: InteractionAuditSignoffMetadata,
): InteractionAuditSignoffMetadata {
  const normalizedMetadata = normalizeInteractionAuditSignoffMetadata(metadata);
  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    localStorage.setItem(
      INTERACTION_AUDIT_SIGNOFF_METADATA_STORAGE_KEY,
      JSON.stringify(normalizedMetadata),
    );
  } else {
    memoryFallbackMetadata = cloneSignoffMetadata(normalizedMetadata);
  }

  return normalizedMetadata;
}

export function writeInteractionAuditSignoffRequestContext(
  requestContext: InteractionAuditSignoffRequestContext,
): InteractionAuditSignoffRequestContext {
  const normalizedRequestContext =
    normalizeInteractionAuditSignoffRequestContext(requestContext);
  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    localStorage.setItem(
      INTERACTION_AUDIT_SIGNOFF_REQUEST_CONTEXT_STORAGE_KEY,
      JSON.stringify(normalizedRequestContext),
    );
  } else {
    memoryFallbackRequestContext = cloneSignoffRequestContext(
      normalizedRequestContext,
    );
  }

  return normalizedRequestContext;
}

export function clearInteractionAuditSignoffState() {
  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    localStorage.removeItem(INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY);
    return;
  }

  memoryFallbackState = null;
}

export function clearInteractionAuditSignoffMetadata() {
  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    localStorage.removeItem(INTERACTION_AUDIT_SIGNOFF_METADATA_STORAGE_KEY);
    return;
  }

  memoryFallbackMetadata = null;
}

export function clearInteractionAuditSignoffRequestContext() {
  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    localStorage.removeItem(
      INTERACTION_AUDIT_SIGNOFF_REQUEST_CONTEXT_STORAGE_KEY,
    );
    return;
  }

  memoryFallbackRequestContext = null;
}
