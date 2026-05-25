import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { WebStorageLike } from "../shared/local-storage";
import {
  clearInteractionAuditSignoffMetadata,
  clearInteractionAuditSignoffRequestContext,
  clearInteractionAuditSignoffState,
  readInteractionAuditSignoffMetadata,
  readInteractionAuditSignoffRequestContext,
  readInteractionAuditSignoffState,
  writeInteractionAuditSignoffMetadata,
  writeInteractionAuditSignoffRequestContext,
  writeInteractionAuditSignoffState,
} from "./interaction-audit-signoff-io";
import {
  INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY,
  buildInitialInteractionAuditSignoffMetadata,
  buildInitialInteractionAuditSignoffRequestContext,
  buildInitialInteractionAuditSignoffState,
  type InteractionAuditSignoffMetadata,
  type InteractionAuditSignoffRequestContext,
  type InteractionAuditSignoffState,
  type InteractionAuditSurfaceSignoffDefinition,
} from "./interaction-audit-signoff-state";

const TEST_SURFACES: InteractionAuditSurfaceSignoffDefinition[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Dashboard review surface.",
    manualChecks: ["Check focus.", "Check density."],
  },
  {
    id: "popup",
    title: "Popup",
    description: "Popup review surface.",
    manualChecks: ["Check compact spacing."],
  },
];

function createMemoryStorage(): WebStorageLike {
  const values = new Map<string, string>();

  return {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

function createThrowingStorage(): WebStorageLike {
  return {
    getItem: () => {
      throw new Error("getItem failed");
    },
    removeItem: () => {
      throw new Error("removeItem failed");
    },
    setItem: () => {
      throw new Error("setItem failed");
    },
  };
}

describe("interaction audit signoff storage IO", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    clearInteractionAuditSignoffState();
    clearInteractionAuditSignoffMetadata();
    clearInteractionAuditSignoffRequestContext();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads, writes, and clears successful localStorage values", () => {
    const storage = createMemoryStorage();
    const state: InteractionAuditSignoffState = {
      dashboard: {
        manualCheckStates: [true, false],
        operatorNotes: "Focus pass.",
        signoffStatus: "pass",
      },
      popup: {
        manualCheckStates: [true],
        operatorNotes: "Spacing needs one more check.",
        signoffStatus: "follow_up",
      },
    };
    const metadata: InteractionAuditSignoffMetadata = {
      reviewerName: "Codex QA",
      sessionLabel: "Local pass",
      reviewedAt: "2026-05-25T00:00:00.000Z",
    };
    const requestContext: InteractionAuditSignoffRequestContext = {
      requestId: "request-1",
      requestCreatedAt: "2026-05-25T00:00:00.000Z",
      requestRevisionSha256:
        "c9175c1e90b3442819b91bb6c9173cd506f860835c0e32f3b95dd1a3c8ea58e1",
    };

    vi.stubGlobal("window", {
      localStorage: storage,
    });

    expect(writeInteractionAuditSignoffState(state, TEST_SURFACES)).toEqual(state);
    expect(writeInteractionAuditSignoffMetadata(metadata)).toEqual(metadata);
    expect(writeInteractionAuditSignoffRequestContext(requestContext)).toEqual(
      requestContext,
    );

    expect(readInteractionAuditSignoffState(TEST_SURFACES)).toEqual(state);
    expect(readInteractionAuditSignoffMetadata()).toEqual(metadata);
    expect(readInteractionAuditSignoffRequestContext()).toEqual(requestContext);

    clearInteractionAuditSignoffState();
    clearInteractionAuditSignoffMetadata();
    clearInteractionAuditSignoffRequestContext();

    expect(readInteractionAuditSignoffState(TEST_SURFACES)).toEqual(
      buildInitialInteractionAuditSignoffState(TEST_SURFACES),
    );
    expect(readInteractionAuditSignoffMetadata()).toEqual(
      buildInitialInteractionAuditSignoffMetadata(),
    );
    expect(readInteractionAuditSignoffRequestContext()).toEqual(
      buildInitialInteractionAuditSignoffRequestContext(),
    );
  });

  it("falls back to memory when localStorage operations throw", () => {
    const state: InteractionAuditSignoffState = {
      dashboard: {
        manualCheckStates: [true, true],
        operatorNotes: "Local storage unavailable.",
        signoffStatus: "pass",
      },
      popup: {
        manualCheckStates: [false],
        operatorNotes: "",
        signoffStatus: "not_reviewed",
      },
    };
    const metadata: InteractionAuditSignoffMetadata = {
      reviewerName: "Codex QA",
      sessionLabel: "Memory pass",
      reviewedAt: "2026-05-25T00:00:00.000Z",
    };
    const requestContext: InteractionAuditSignoffRequestContext = {
      requestId: "request-2",
      requestCreatedAt: "2026-05-25T00:00:00.000Z",
      requestRevisionSha256: "abc123",
    };

    vi.stubGlobal("window", {
      localStorage: createThrowingStorage(),
    });

    expect(writeInteractionAuditSignoffState(state, TEST_SURFACES)).toEqual(state);
    expect(writeInteractionAuditSignoffMetadata(metadata)).toEqual(metadata);
    expect(writeInteractionAuditSignoffRequestContext(requestContext)).toEqual(
      requestContext,
    );

    expect(readInteractionAuditSignoffState(TEST_SURFACES)).toEqual(state);
    expect(readInteractionAuditSignoffMetadata()).toEqual(metadata);
    expect(readInteractionAuditSignoffRequestContext()).toEqual(requestContext);

    clearInteractionAuditSignoffState();
    clearInteractionAuditSignoffMetadata();
    clearInteractionAuditSignoffRequestContext();

    expect(readInteractionAuditSignoffState(TEST_SURFACES)).toEqual(
      buildInitialInteractionAuditSignoffState(TEST_SURFACES),
    );
    expect(readInteractionAuditSignoffMetadata()).toEqual(
      buildInitialInteractionAuditSignoffMetadata(),
    );
    expect(readInteractionAuditSignoffRequestContext()).toEqual(
      buildInitialInteractionAuditSignoffRequestContext(),
    );
  });

  it("drops malformed localStorage state when cleanup throws", () => {
    const removeItem = vi.fn(() => {
      throw new Error("removeItem failed");
    });

    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) =>
          key === INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY ? "{not-json" : null,
        removeItem,
        setItem: () => {},
      } satisfies WebStorageLike,
    });

    expect(readInteractionAuditSignoffState(TEST_SURFACES)).toEqual(
      buildInitialInteractionAuditSignoffState(TEST_SURFACES),
    );
    expect(removeItem).toHaveBeenCalledWith(INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY);
  });
});
