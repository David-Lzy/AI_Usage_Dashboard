export type AuditFrameReadinessCode =
  | "frame_not_ready"
  | "ready"
  | "waiting_dashboard_provider_actions"
  | "waiting_settings_source_controls"
  | "waiting_provider_detail_notes"
  | "waiting_popup_actions";

export type AuditPresetResultCode =
  | "frame_not_ready"
  | "focused_first_provider_action"
  | "missing_first_provider_action"
  | "opened_first_source_diagnostics"
  | "missing_source_diagnostics_disclosure"
  | "focused_source_preference"
  | "missing_source_preference_select"
  | "scrolled_first_detail_note"
  | "missing_detail_note"
  | "focused_popup_dashboard_action"
  | "missing_popup_dashboard_action"
  | "focused_featured_provider_detail_action"
  | "missing_featured_provider_detail_action"
  | "unsupported_audit_preset";
