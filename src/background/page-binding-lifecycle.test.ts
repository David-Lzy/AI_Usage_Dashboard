import { describe, expect, it } from "vitest";

import type { AppState, ProviderId, ProviderSetting } from "../providers/types";
import { createPageBindingFromTab } from "../shared/page-bindings";
import { SAMPLE_APP_STATE } from "../shared/constants";
import {
  reconcilePageBindingsForRemovedTab,
  reconcilePageBindingsForTabUrlChange,
} from "./page-binding-lifecycle";

function buildStateWithBinding(
  providerId: ProviderId,
  tabId: number,
  matchedUrl: string,
): AppState {
  return {
    ...SAMPLE_APP_STATE,
    providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
      provider.id === providerId
        ? {
            ...provider,
            pageBinding: createPageBindingFromTab({
              mode: "bound",
              tabId,
              matchedUrl,
              matchedTitle: `${provider.label} usage`,
              updatedAt: "2026-04-29T13:45:00.000Z",
            }),
          }
        : provider,
    ),
  };
}

function findProviderSetting(
  state: AppState,
  providerId: ProviderId,
): ProviderSetting {
  const provider = state.providerSettings.find(
    (candidate) => candidate.id === providerId,
  );

  if (!provider) {
    throw new Error(`Missing provider setting for ${providerId}`);
  }

  return provider;
}

describe("page binding lifecycle", () => {
  it("marks a bound provider page stale when the bound tab closes", () => {
    const state = buildStateWithBinding(
      "cursor",
      42,
      "https://cursor.com/dashboard/usage",
    );
    const result = reconcilePageBindingsForRemovedTab(state, 42);
    const cursor = findProviderSetting(result.state, "cursor");

    expect(result.changedProviderIds).toEqual(["cursor"]);
    expect(cursor.pageBinding.status).toBe("stale");
    expect(cursor.pageBinding.tabId).toBe(42);
    expect(cursor.pageBinding.matchedUrl).toBe(
      "https://cursor.com/dashboard/usage",
    );
  });

  it("ignores tab close events for unrelated provider bindings", () => {
    const state = buildStateWithBinding(
      "codex",
      77,
      "https://chatgpt.com/codex/cloud/settings/analytics#usage",
    );
    const result = reconcilePageBindingsForRemovedTab(state, 78);

    expect(result.changedProviderIds).toEqual([]);
    expect(result.state).toBe(state);
  });

  it("keeps a binding healthy when the bound tab navigates within provider route hints", () => {
    const state = buildStateWithBinding(
      "codex",
      88,
      "https://chatgpt.com/codex/cloud/settings/analytics#usage",
    );
    const result = reconcilePageBindingsForTabUrlChange(
      state,
      88,
      "https://chatgpt.com/codex/cloud/settings/analytics?window=weekly#usage",
    );

    expect(result.changedProviderIds).toEqual([]);
    expect(result.state).toBe(state);
  });

  it("marks a binding stale when the bound tab navigates away from provider routes", () => {
    const state = buildStateWithBinding(
      "codex",
      88,
      "https://chatgpt.com/codex/cloud/settings/analytics#usage",
    );
    const result = reconcilePageBindingsForTabUrlChange(
      state,
      88,
      "https://chatgpt.com/gpts",
    );
    const codex = findProviderSetting(result.state, "codex");

    expect(result.changedProviderIds).toEqual(["codex"]);
    expect(codex.pageBinding.status).toBe("stale");
    expect(codex.pageBinding.mode).toBe("bound");
  });
});
