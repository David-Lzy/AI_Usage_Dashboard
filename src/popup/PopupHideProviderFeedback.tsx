import type { CSSProperties } from "react";

import type { ProviderId } from "../providers/types";
import type { PopupHideProviderFeedbackCopy } from "./popup-hide-provider-feedback-copy";

export type PopupHideProviderFeedbackState =
  | {
      kind: "undo";
      providerId: ProviderId;
      providerLabel: string;
      secondsRemaining: number;
    }
  | {
      kind: "notice";
      providerId: ProviderId;
      providerLabel: string;
    };

type PopupHideProviderFeedbackProps = {
  copy: PopupHideProviderFeedbackCopy;
  feedback: PopupHideProviderFeedbackState;
  undoSeconds: number;
  onOpenSettings: () => void | Promise<void>;
  onUndo: (providerId: ProviderId) => void | Promise<void>;
};

export function PopupHideProviderFeedback({
  copy,
  feedback,
  undoSeconds,
  onOpenSettings,
  onUndo,
}: PopupHideProviderFeedbackProps) {
  const isUndo = feedback.kind === "undo";
  const secondsRemaining = isUndo ? feedback.secondsRemaining : 0;
  const progressPercent = isUndo
    ? Math.max(0, Math.min(100, (secondsRemaining / undoSeconds) * 100))
    : 0;
  const style = {
    "--popup-hide-feedback-progress": `${progressPercent}%`,
  } as CSSProperties;

  return (
    <div
      className={`popup-hide-feedback popup-hide-feedback--${feedback.kind}`}
      role="status"
      aria-live="polite"
      style={style}
    >
      <span className="popup-hide-feedback__message">
        {isUndo
          ? copy.undoMessage(
              feedback.providerLabel,
              copy.formatSeconds(secondsRemaining),
            )
          : copy.noticeMessage(feedback.providerLabel)}
      </span>
      {isUndo ? (
        <button
          className="text-button text-button--inline popup-hide-feedback__action"
          type="button"
          onClick={() => {
            void onUndo(feedback.providerId);
          }}
        >
          {copy.undoAction}
        </button>
      ) : (
        <button
          className="text-button text-button--inline popup-hide-feedback__action"
          type="button"
          onClick={() => {
            void onOpenSettings();
          }}
        >
          {copy.settingsAction}
        </button>
      )}
    </div>
  );
}
