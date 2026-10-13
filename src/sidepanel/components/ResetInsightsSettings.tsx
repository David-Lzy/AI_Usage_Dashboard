import { useEffect, useRef, useState } from "react";
import type { AppState } from "../../providers/types";
import type { RuntimeI18n } from "../../shared/i18n";
import { getActiveProviderAccountId } from "../../shared/provider-accounts";
import { COMMUNITY_RESET_CONFIG, COMMUNITY_RESET_SOURCES, type CommunityResetMode, type CommunityResetSource, type CommunityResetPreferences } from "../../shared/community-reset-feeds";
import { requestCommunityResetAccess, sendCommunityResetMessage, subscribeToCommunityResetChanges, type CommunityResetView } from "../../shared/community-reset-client";
import { requestResetNotificationPermission, sendResetNotificationMessage, subscribeToResetNotificationChanges, type ResetNotificationView } from "../../shared/reset-notification-client";
import { hasExtensionRuntime } from "../../shared/extension-api";
import { getCommunityResetCopy } from "../../shared/community-reset-copy";
import { getProviderInsightsUiCopy } from "../../shared/provider-insights-ui-copy";
import { getResetNotificationCopy } from "../../shared/reset-notification-localized-copy";
import { buildQuotaNotificationLocalizedCopy } from "../../shared/quota-notification-localized-copy";
import { FusionSelect, FusionCheckbox, FusionButton } from "./material-ui/FusionControls";
import { MaterialActionIcon } from "../../shared/components/MaterialActionIcon";
import { SettingsSaveFeedback } from "./SettingsSaveFeedback";
import { ControlVisibilityBoundary } from "../../shared/control-visibility";
import "./ResetInsightsSettings.css";

type State = Pick<AppState, "providers" | "providerSettings" | "providerAccounts">;
export function ResetInsightsSettings({ state, i18n }: { state: State; i18n: RuntimeI18n }) {
  const [feed, setFeed] = useState<CommunityResetView | null>(null), [notifications, setNotifications] = useState<ResetNotificationView | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(false), [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [saved, setSaved] = useState(false);
  const pending = useRef(false), retry = useRef<(() => Promise<void>) | null>(null);
  const copy = getCommunityResetCopy(i18n.resolvedLocale), ui = getProviderInsightsUiCopy(i18n.resolvedLocale), fixed = getResetNotificationCopy(i18n.resolvedLocale), quota = buildQuotaNotificationLocalizedCopy(i18n.resolvedLocale);
  const accountKey = JSON.stringify(["codex-personal-page", getActiveProviderAccountId(state, "codex-personal-page")]);
  const snapshot = state.providers.find((provider) => provider.providerId === "codex-personal-page");
  useEffect(() => {
    let active = true, generation = 0;
    const load = async () => {
      const token = ++generation;
      try {
        const next = await sendCommunityResetMessage({ type: "community-resets:read" });
        if (active && token === generation) setFeed(next);
        const reset = await sendResetNotificationMessage({ type: "reset-notifications:read" });
        if (!reset.ok) throw new Error("read");
        if (active && token === generation) { setNotifications(reset.view); if (!pending.current) setError(false); }
        return true;
      } catch {
        if (active && token === generation) {
          setError(true);
          if (!pending.current) retry.current = async () => { if (!await load()) throw new Error("read"); };
        }
        return false;
      } finally { if (active && token === generation) setLoading(false); }
    };
    void load();
    const unsubscribeFeed = subscribeToCommunityResetChanges(() => { void load(); });
    const unsubscribeReset = subscribeToResetNotificationChanges(() => { void load(); });
    return () => { active = false; generation += 1; unsubscribeFeed(); unsubscribeReset(); };
  }, [accountKey, snapshot?.lastSuccessAt, snapshot?.syncStatus]);
  const runtime = hasExtensionRuntime(), preferences = feed?.store.preferences;
  const grantEnabled = notifications?.preferences.grantAccountKeys.includes(accountKey) === true;
  const accountEligible = notifications?.accountEligible === true && notifications.accountKey === accountKey;
  const grantMode = !grantEnabled ? "off" : notifications?.preferences.accountPaused ? "paused" : "on";
  async function operation(work: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true; retry.current = work;
    setBusy(true); setError(false); setSaved(false); setNotice(null);
    try { await work(); retry.current = null; } catch { setError(true); } finally { pending.current = false; setBusy(false); }
  }
  async function savePreferences(patch: Partial<CommunityResetPreferences> | ((current: CommunityResetPreferences) => Partial<CommunityResetPreferences>)) {
    if (!feed) return;
    const refresh = async () => { setFeed(await sendCommunityResetMessage({ type: "community-resets:refresh" })); };
    const write = async (base: CommunityResetView) => {
      const changes = typeof patch === "function" ? patch(base.store.preferences) : patch;
      const next = await sendCommunityResetMessage({ type: "community-resets:update", expectedRevision: base.store.revision, preferences: { ...base.store.preferences, ...changes } });
      setFeed(next); setSaved(true);
      if (next.store.preferences.mode !== "off") { retry.current = refresh; await refresh(); }
    };
    // Only an explicit retry rebases the intended field onto another window's revision.
    retry.current = async () => { const latest = await sendCommunityResetMessage({ type: "community-resets:read" }); setFeed(latest); await write(latest); };
    await write(feed);
  }
  function changeMode(mode: CommunityResetMode) {
    if (!preferences || pending.current) return;
    // Keep optional permissions in the originating select gesture, before any await.
    const permission = mode === "off" ? Promise.resolve(true) : requestCommunityResetAccess(preferences.sources, mode === "desktop");
    void operation(async () => {
      const granted = await permission;
      let target = mode;
      if (!granted) { target = mode === "desktop" ? "in_app" : mode; setNotice(copy.denied); }
      const reset = await sendResetNotificationMessage({ type: "reset-notifications:read" });
      if (mode === "desktop" && (!reset.ok || reset.view.permission !== "granted")) {
        target = "in_app"; setNotice(quota.permissionNotGranted);
      }
      await savePreferences({ mode: target });
    });
  }
  function changeSource(source: CommunityResetSource, enabled: boolean) {
    if (!preferences || pending.current) return;
    const permission = enabled && preferences.mode !== "off" ? requestCommunityResetAccess([source]) : Promise.resolve(true);
    void operation(async () => {
      if (!await permission) setNotice(copy.denied);
      await savePreferences((current) => ({ sources: enabled ? [...new Set([...current.sources, source])] : current.sources.filter((item) => item !== source) }));
    });
  }
  function changeGrant(mode: "off" | "on" | "paused") {
    if (!notifications || pending.current || mode !== "off" && !accountEligible) return;
    const permission = mode !== "off" && !grantEnabled && notifications.permission !== "granted" ? requestResetNotificationPermission() : Promise.resolve(true);
    void operation(async () => {
      if (!await permission) { setNotice(quota.permissionNotGranted); return; }
      const changes = mode === "off" ? [{ type: "account-grants" as const, accountKey, value: false }]
        : [{ type: "account-paused" as const, value: mode === "paused" }, { type: "account-grants" as const, accountKey, value: true }];
      for (const change of changes) {
        const result = await sendResetNotificationMessage({ type: "reset-notifications:update", change });
        if (!result.ok) throw new Error("save"); setNotifications(result.view);
      }
      setSaved(true);
    });
  }
  async function test(group: "community" | "account") {
    await operation(async () => {
      const result = await sendResetNotificationMessage({ type: "reset-notifications:test", group });
      setNotice(result.ok && result.tested ? quota.testSent : quota.testFailed);
    });
  }
  const grantOptions = [{ value: "off" as const, label: quota.modeOff }, { value: "on" as const, label: quota.modeOn }, { value: "paused" as const, label: quota.modePaused }]
    .filter((option) => accountEligible || option.value === "off" || option.value === grantMode);
  return <section className="reset-insights-settings" data-reset-insights-settings="" aria-busy={busy || loading}>
    <div className="reset-insights-settings__fields">
      <FusionSelect<CommunityResetMode> label={ui.communityTitle} value={preferences?.mode ?? "off"} fieldIdPrefix="community-reset-mode"
        disabled={!runtime || busy || !preferences} options={[{ value: "off", label: quota.modeOff }, { value: "in_app", label: copy.inApp }, { value: "desktop", label: copy.desktop }]}
        onChange={changeMode} />
      <FusionSelect<"off" | "on" | "paused"> label={copy.grantSubscription} value={grantMode} fieldIdPrefix="account-reset-card-mode"
        disabled={!runtime || busy || !notifications || !accountEligible && !grantEnabled}
        options={grantOptions} onChange={changeGrant} />
    </div>
    <div className="reset-insights-settings__sources">
      {COMMUNITY_RESET_SOURCES.map((source) => <div className="reset-insights-settings__source" key={source}>
        <FusionCheckbox checked={preferences?.sources.includes(source) === true} disabled={busy || !preferences || !runtime}
          onChange={(enabled) => changeSource(source, enabled)}>{COMMUNITY_RESET_CONFIG[source].label}</FusionCheckbox>
        <a className="text-button text-button--inline" aria-label={`${fixed.source}: ${COMMUNITY_RESET_CONFIG[source].label}`} href={COMMUNITY_RESET_CONFIG[source].url} target="_blank" rel="noreferrer">{fixed.source} · {COMMUNITY_RESET_CONFIG[source].label}</a>
        {preferences && preferences.mode !== "off" && preferences.sources.includes(source) && feed?.access[source] !== true ? <span className="supporting-copy">{copy.denied}</span> : null}
      </div>)}
    </div>
    <p className="supporting-copy">{copy.warning}</p>
    <p className="supporting-copy">{!runtime ? copy.previewUnavailable : notifications && !accountEligible ? fixed.unverified : fixed.earlyUnavailable}</p>
    <ControlVisibilityBoundary animate hidden={preferences?.mode !== "desktop"} className="reset-insights-settings__desktop"
      data-motion-focus-target={'[data-fusion-field="community-reset-mode"] mdui-select'}>
      <FusionCheckbox checked={notifications?.preferences.communityPaused === true} disabled={busy || !notifications}
        onChange={(value) => { void operation(async () => { const result = await sendResetNotificationMessage({ type: "reset-notifications:update", change: { type: "community-paused", value } }); if (!result.ok) throw new Error("save"); setNotifications(result.view); setSaved(true); }); }}>{fixed.pause}</FusionCheckbox>
      <FusionButton compact disabled={busy || notifications?.permission !== "granted" || notifications.preferences.communityPaused} onClick={() => { void test("community"); }}>{quota.test}</FusionButton>
    </ControlVisibilityBoundary>
    <div className="reset-insights-settings__actions">
      <a className="text-button text-button--outlined" href="#provider-detail/codex-personal-page">{copy.openDetails}</a>
      <FusionButton compact icon={<MaterialActionIcon name="refresh" width="18" height="18" fill="currentColor" />} disabled={busy || !runtime || !preferences || preferences.mode === "off"}
        onClick={() => { void operation(async () => { setFeed(await sendCommunityResetMessage({ type: "community-resets:refresh" })); }); }}>{i18n.t("common.actions.refresh")}</FusionButton>
      {grantEnabled ? <FusionButton compact disabled={busy || notifications?.permission !== "granted" || notifications.preferences.accountPaused} onClick={() => { void test("account"); }}>{quota.test}</FusionButton> : null}
    </div>
    {notice ? <p className="supporting-copy" role="status">{notice}</p> : null}
    {error || saved ? <SettingsSaveFeedback status={error ? "error" : "saved"} locale={i18n.resolvedLocale} onRetry={() => { if (retry.current) void operation(retry.current); }} /> : null}
  </section>;
}
