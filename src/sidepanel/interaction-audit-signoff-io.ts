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
import {
  getSafeLocalStorage,
  getSafeStorageItem,
  removeSafeStorageItem,
  setSafeStorageItem,
} from "../shared/local-storage";

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

function readMemoryFallbackState(
  definitions: InteractionAuditSurfaceSignoffDefinition[],
): InteractionAuditSignoffState | null {
  return memoryFallbackState
    ? normalizeInteractionAuditSignoffState(
        cloneSignoffState(memoryFallbackState),
        definitions,
      )
    : null;
}

function readMemoryFallbackMetadata(): InteractionAuditSignoffMetadata | null {
  return memoryFallbackMetadata
    ? normalizeInteractionAuditSignoffMetadata(
        cloneSignoffMetadata(memoryFallbackMetadata),
      )
    : null;
}

function readMemoryFallbackRequestContext(): InteractionAuditSignoffRequestContext | null {
  return memoryFallbackRequestContext
    ? normalizeInteractionAuditSignoffRequestContext(
        cloneSignoffRequestContext(memoryFallbackRequestContext),
      )
    : null;
}

export function readInteractionAuditSignoffState(
  definitions: InteractionAuditSurfaceSignoffDefinition[],
): InteractionAuditSignoffState {
  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    const rawState = getSafeStorageItem(
      localStorage,
      INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY,
    );

    if (!rawState) {
      return (
        readMemoryFallbackState(definitions) ??
        buildInitialInteractionAuditSignoffState(definitions)
      );
    }

    try {
      return normalizeInteractionAuditSignoffState(
        JSON.parse(rawState) as InteractionAuditSignoffState,
        definitions,
      );
    } catch {
      removeSafeStorageItem(localStorage, INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY);
      return (
        readMemoryFallbackState(definitions) ??
        buildInitialInteractionAuditSignoffState(definitions)
      );
    }
  }

  return (
    readMemoryFallbackState(definitions) ??
    buildInitialInteractionAuditSignoffState(definitions)
  );
}

export function readInteractionAuditSignoffMetadata(): InteractionAuditSignoffMetadata {
  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    const rawMetadata = getSafeStorageItem(
      localStorage,
      INTERACTION_AUDIT_SIGNOFF_METADATA_STORAGE_KEY,
    );

    if (!rawMetadata) {
      return (
        readMemoryFallbackMetadata() ??
        buildInitialInteractionAuditSignoffMetadata()
      );
    }

    try {
      return normalizeInteractionAuditSignoffMetadata(
        JSON.parse(rawMetadata) as InteractionAuditSignoffMetadata,
      );
    } catch {
      removeSafeStorageItem(
        localStorage,
        INTERACTION_AUDIT_SIGNOFF_METADATA_STORAGE_KEY,
      );
      return (
        readMemoryFallbackMetadata() ??
        buildInitialInteractionAuditSignoffMetadata()
      );
    }
  }

  return (
    readMemoryFallbackMetadata() ?? buildInitialInteractionAuditSignoffMetadata()
  );
}

export function readInteractionAuditSignoffRequestContext(): InteractionAuditSignoffRequestContext {
  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    const rawRequestContext = getSafeStorageItem(
      localStorage,
      INTERACTION_AUDIT_SIGNOFF_REQUEST_CONTEXT_STORAGE_KEY,
    );

    if (!rawRequestContext) {
      return (
        readMemoryFallbackRequestContext() ??
        buildInitialInteractionAuditSignoffRequestContext()
      );
    }

    try {
      return normalizeInteractionAuditSignoffRequestContext(
        JSON.parse(rawRequestContext) as InteractionAuditSignoffRequestContext,
      );
    } catch {
      removeSafeStorageItem(
        localStorage,
        INTERACTION_AUDIT_SIGNOFF_REQUEST_CONTEXT_STORAGE_KEY,
      );
      return (
        readMemoryFallbackRequestContext() ??
        buildInitialInteractionAuditSignoffRequestContext()
      );
    }
  }

  return (
    readMemoryFallbackRequestContext() ??
    buildInitialInteractionAuditSignoffRequestContext()
  );
}

export function writeInteractionAuditSignoffState(
  state: InteractionAuditSignoffState,
  definitions: InteractionAuditSurfaceSignoffDefinition[],
): InteractionAuditSignoffState {
  const normalizedState = normalizeInteractionAuditSignoffState(state, definitions);
  const localStorage = getSafeLocalStorage();

  if (
    localStorage &&
    setSafeStorageItem(
      localStorage,
      INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY,
      JSON.stringify(normalizedState),
    )
  ) {
    memoryFallbackState = null;
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

  if (
    localStorage &&
    setSafeStorageItem(
      localStorage,
      INTERACTION_AUDIT_SIGNOFF_METADATA_STORAGE_KEY,
      JSON.stringify(normalizedMetadata),
    )
  ) {
    memoryFallbackMetadata = null;
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

  if (
    localStorage &&
    setSafeStorageItem(
      localStorage,
      INTERACTION_AUDIT_SIGNOFF_REQUEST_CONTEXT_STORAGE_KEY,
      JSON.stringify(normalizedRequestContext),
    )
  ) {
    memoryFallbackRequestContext = null;
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
    removeSafeStorageItem(localStorage, INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY);
  }

  memoryFallbackState = null;
}

export function clearInteractionAuditSignoffMetadata() {
  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    removeSafeStorageItem(
      localStorage,
      INTERACTION_AUDIT_SIGNOFF_METADATA_STORAGE_KEY,
    );
  }

  memoryFallbackMetadata = null;
}

export function clearInteractionAuditSignoffRequestContext() {
  const localStorage = getSafeLocalStorage();

  if (localStorage) {
    removeSafeStorageItem(
      localStorage,
      INTERACTION_AUDIT_SIGNOFF_REQUEST_CONTEXT_STORAGE_KEY,
    );
  }

  memoryFallbackRequestContext = null;
}
