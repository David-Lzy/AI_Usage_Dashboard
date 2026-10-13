import { describe, expect, it } from "vitest";
import { consumePendingSettingsSurfaceSession, storePendingSettingsSurfaceSession } from "./extension-surface-entry";

function storage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
}
describe("one-shot settings surface session entry", () => {
  it("restores a matching internal section handoff only once", () => {
    const local = storage();
    storePendingSettingsSurfaceSession("settings/section/settings-appearance", local, 100);
    expect(consumePendingSettingsSurfaceSession("#settings/section/settings-appearance", local, 200)).toBe(true);
    expect(consumePendingSettingsSurfaceSession("#settings/section/settings-appearance", local, 201)).toBe(false);
  });
  it("does not override a different manual deep link, expired marker or other route", () => {
    const local = storage();
    storePendingSettingsSurfaceSession("#settings/section/settings-appearance", local, 100);
    expect(consumePendingSettingsSurfaceSession("#settings/section/settings-quick-setup", local, 200)).toBe(false);
    storePendingSettingsSurfaceSession("#settings/section/settings-appearance", local, 100);
    expect(consumePendingSettingsSurfaceSession("#settings/section/settings-appearance", local, 15100)).toBe(false);
    storePendingSettingsSurfaceSession("#provider-detail/codex-personal-page", local, 100);
    expect(consumePendingSettingsSurfaceSession("#provider-detail/codex-personal-page", local, 200)).toBe(false);
  });
  it("navigation remains possible when optional local storage is unavailable", () => {
    expect(consumePendingSettingsSurfaceSession("#settings", null)).toBe(false);
    const local = { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("denied"); }, removeItem: () => {} };
    expect(() => storePendingSettingsSurfaceSession("#settings/section/settings-appearance", local)).not.toThrow();
    expect(consumePendingSettingsSurfaceSession("#settings/section/settings-appearance", local)).toBe(false);
  });
});
