# START PROMPT

Date: 2026-05-11

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this file is a one-line bootstrap target for agents working in this repo
- keep it short; it should point agents at canonical instructions instead of duplicating them

## Use

You can start an agent with:

```text
请遵守 START_PROMPT.md
```

## Agent Instruction

Before doing any work in this repository, read and follow these files in order:

1. `AGENTS.md`
2. `Doc/Project_Quickstart.md`
3. `Doc/Development_Guardrails.md`
4. `Doc/Documentation_Taxonomy.md`
5. the relevant `Doc/testing/*.md` or release/runbook doc for the current task
6. `Doc/TODOs/00_Phase_Index.md`
7. `Doc/AI_Usage_Dashboard_TODOs.md`
8. `Doc/Roadmap/00_Strategic_Directions_Index.md`
9. the active phase file named in the phase index, if one exists

Rules:

- treat tracked root docs plus `Doc/` as the canonical source of truth
- treat local `.agent/` content as optional helper material only when present
- read the relevant docs first, then start implementation or analysis
