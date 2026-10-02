import type { AppSettings } from "../providers/types";

export type SettingsSaveStatus = "idle" | "pending" | "saved" | "error";
export type SettingsSaveFeedback = {
  status: SettingsSaveStatus;
  draft: Partial<AppSettings>;
  retryPatch: Partial<AppSettings>;
};
type SettingKey = keyof AppSettings;
type Entry = {
  request: number;
  value: AppSettings[SettingKey];
  failed: boolean;
};

// Latest ownership is per setting, so unrelated failures survive later saves.
export class SettingsSaveTracker {
  private sequence = 0;
  private attempted = false;
  private entries = new Map<SettingKey, Entry>();

  begin(patch: Partial<AppSettings>): number {
    const request = ++this.sequence;
    this.attempted = true;
    for (const key of Object.keys(patch) as SettingKey[]) {
      if (patch[key] !== undefined) {
        this.entries.set(key, { request, value: patch[key]!, failed: false });
      }
    }
    return request;
  }

  finish(request: number, confirmed?: AppSettings): Partial<AppSettings> {
    const accepted: Partial<AppSettings> = {};
    for (const [key, entry] of this.entries) {
      if (entry.request !== request) continue;
      if (confirmed) {
        Object.assign(accepted, { [key]: confirmed[key] });
        this.entries.delete(key);
      } else {
        this.entries.set(key, { ...entry, failed: true });
      }
    }
    return accepted;
  }

  owns(request: number): boolean {
    return [...this.entries.values()].some(
      (entry) => entry.request === request,
    );
  }

  get checkpoint(): number {
    return this.sequence;
  }

  discardThrough(request = this.sequence): void {
    for (const [key, entry] of this.entries) {
      if (entry.request <= request) this.entries.delete(key);
    }
    if (this.sequence <= request) this.attempted = false;
  }

  get feedback(): SettingsSaveFeedback {
    const draft: Partial<AppSettings> = {};
    const retryPatch: Partial<AppSettings> = {};
    let pending = false;
    for (const [key, entry] of this.entries) {
      Object.assign(draft, { [key]: entry.value });
      if (entry.failed) Object.assign(retryPatch, { [key]: entry.value });
      else pending = true;
    }
    return {
      status: pending
        ? "pending"
        : this.entries.size
          ? "error"
          : this.attempted
            ? "saved"
            : "idle",
      draft,
      retryPatch,
    };
  }
}

export type StateResponseTicket = { request: number; storageRevision: number };

// A delayed message must not replace newer storage events or accepted replies.
export class StateResponseFence {
  private sequence = 0;
  private accepted = 0;
  private storageRevision = 0;

  begin(): StateResponseTicket {
    return { request: ++this.sequence, storageRevision: this.storageRevision };
  }

  storageChanged() {
    this.storageRevision++;
  }

  storageUnchanged(ticket: StateResponseTicket): boolean {
    return ticket.storageRevision === this.storageRevision;
  }

  accept(ticket: StateResponseTicket): boolean {
    if (!this.storageUnchanged(ticket) || ticket.request < this.accepted)
      return false;
    this.accepted = ticket.request;
    return true;
  }
}
