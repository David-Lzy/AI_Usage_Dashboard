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
2. `README.md`
3. `CONTRIBUTING.md`
4. `Doc/README.md`
5. the relevant public `Doc/` functional reference for the current task

Rules:

- treat tracked root docs plus `Doc/` as the canonical source of truth
- treat local `.local/` and `.agent/` content as private helper material only when present
- do not duplicate maintained `Doc/` files into private local docs; link to public docs and add only local-only operational notes
- read the relevant docs first, then start implementation or analysis
