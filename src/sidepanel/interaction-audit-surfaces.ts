export type InteractionAuditSurfaceAction = {
  id: string;
  label: string;
  expectation: string;
};

export type InteractionAuditSurface = {
  id: string;
  title: string;
  description: string;
  width: number;
  height: number;
  path: string;
  actions: InteractionAuditSurfaceAction[];
  manualChecks: string[];
};

export const INTERACTION_AUDIT_SURFACES: InteractionAuditSurface[] = [
  {
    id: "dashboard-360",
    title: "Dashboard",
    description:
      "Use this frame to inspect summary pills, provider-card density, and the main top-bar action row at a realistic narrow side-panel width.",
    width: 360,
    height: 920,
    path: "./index.html#dashboard",
    actions: [
      {
        id: "focus-first-provider-open",
        label: "Focus first provider action",
        expectation:
          "The first provider card should place visible keyboard focus on its Open action so hover-versus-focus parity can be checked.",
      },
    ],
    manualChecks: [
      "Confirm the focused Open action still feels visually coherent with the hover treatment on nearby dashboard controls.",
      "Confirm provider-card summary density remains readable at the shipped 360px audit width without chip or text collisions.",
    ],
  },
  {
    id: "settings-420",
    title: "Settings",
    description:
      "Review sticky actions, section-jump chips, disclosure density, selects, switch rows, and compact source-card readability in one wider audit frame.",
    width: 420,
    height: 980,
    path: "./index.html#settings",
    actions: [
      {
        id: "open-first-diagnostics",
        label: "Open first diagnostics",
        expectation:
          "The first Source Connections disclosure should open and keep its summary toggle focused for grouped-diagnostics review.",
      },
      {
        id: "focus-first-source-preference",
        label: "Focus source preference",
        expectation:
          "The first source-preference select inside Source Connections should receive focus for keyboard-state review.",
      },
    ],
    manualChecks: [
      "Confirm the sticky top bar and section-jump shell still feel stable after the diagnostics disclosure and focused select are prepared.",
      "Confirm the expanded diagnostics groups remain scannable and do not introduce horizontal overflow at the shipped 420px audit width.",
      "Confirm the focused source-preference select stays visually explicit without overpowering the surrounding source-card summary.",
    ],
  },
  {
    id: "cursor-detail-360",
    title: "Provider Detail · Cursor",
    description:
      "Inspect long-value wrapping, neutral note hierarchy, status surfaces, and progress honesty on a compact provider-detail route.",
    width: 360,
    height: 920,
    path: "./index.html#provider-detail/cursor",
    actions: [
      {
        id: "jump-first-note",
        label: "Jump to first note",
        expectation:
          "The first detail note block should be brought into view so note hierarchy and dense supporting content can be reviewed quickly.",
      },
    ],
    manualChecks: [
      "Confirm the first note remains visually distinct from the lighter detail-field tiles instead of blending into the parent surface.",
      "Confirm long supporting values and labels still wrap cleanly at the shipped 360px compact detail width.",
    ],
  },
  {
    id: "codex-detail-420",
    title: "Provider Detail · Codex",
    description:
      "Use this frame for the denser hybrid-source detail path, especially fidelity notes, graduation gates, and supporting-surface hierarchy.",
    width: 420,
    height: 980,
    path: "./index.html#provider-detail/codex",
    actions: [
      {
        id: "jump-first-note",
        label: "Jump to first note",
        expectation:
          "The first detail note block should be brought into view so fidelity and graduation-gate note treatment can be reviewed quickly.",
      },
    ],
    manualChecks: [
      "Confirm fidelity and graduation-gate notes remain easy to distinguish from regular supporting fields at the shipped 420px detail width.",
      "Confirm dense hybrid-source supporting text still reads cleanly without overflow or flattened hierarchy after the note jump.",
    ],
  },
  {
    id: "popup-360",
    title: "Toolbar Popup",
    description:
      "Review quick actions, snapshot-status tone, featured provider cards, and compact popup spacing without opening the browser action repeatedly.",
    width: 360,
    height: 760,
    path: "../popup/index.html",
    actions: [
      {
        id: "focus-open-dashboard",
        label: "Focus dashboard action",
        expectation:
          "The popup Quick Actions row should place visible focus on Open dashboard for keyboard and compact-spacing review.",
      },
      {
        id: "focus-first-detail",
        label: "Focus featured detail action",
        expectation:
          "The first featured-provider card should place visible focus on Open detail for compact action density review.",
      },
    ],
    manualChecks: [
      "Confirm quick actions and featured-provider actions still feel readable and comfortably tappable at the shipped 360px popup width.",
      "Confirm the focused popup actions preserve compact spacing instead of collapsing the snapshot-status and featured-card rhythm.",
    ],
  },
];

export const INTERACTION_AUDIT_SIGNOFF_SURFACES = INTERACTION_AUDIT_SURFACES.map(
  (surface) => ({
    id: surface.id,
    title: surface.title,
    description: surface.description,
    manualChecks: surface.manualChecks,
  }),
);
