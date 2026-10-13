import { useEffect, useState } from "react";
import { sendCommunityResetMessage, subscribeToCommunityResetChanges, type CommunityResetView } from "./community-reset-client";
import { normalizeCommunityResetStore } from "./community-reset-feeds";

export function useCommunityResetView() {
  const [view, setView] = useState<CommunityResetView>({ store: normalizeCommunityResetStore(undefined), access: {} });
  const [loading, setLoading] = useState(true), [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true, generation = 0;
    const load = async () => {
      const token = ++generation;
      try {
        const next = await sendCommunityResetMessage({ type: "community-resets:read" });
        if (active && token === generation) { setView(next); setFailed(false); setLoading(false); }
      } catch { if (active && token === generation) { setFailed(true); setLoading(false); } }
    };
    void load();
    const unsubscribe = subscribeToCommunityResetChanges(() => { void load(); });
    return () => { active = false; generation += 1; unsubscribe(); };
  }, []);
  return { view, loading, failed };
}
