---
name: harness-trace-langsmith-compose
description: "Explicit-only optional LangSmith trace export into local HTOL review paths, then compose with @harness-trace-review or @harness-trace-analyzer—client-side only, not TIED core, no gate authority or YAML writes. Use when the caller names harness-trace-langsmith-compose or @harness-trace-langsmith-compose with LangSmith run ids. Do not use for build-plan implement claims or substituting tied_checklist_gate_validate."
disable-model-invocation: true
---

# harness-trace-langsmith-compose

Explicit invocation only (`@harness-trace-langsmith-compose` or `prompt-type: harness-trace-langsmith-compose`).

This skill is the workflow source of truth for **optional LangSmith → local path** compose
ahead of HTOL review. It is **client-side operator tooling**, not TIED core MCP.
`tied-install.sh` installs it under `.cursor/skills/harness-trace-langsmith-compose/`.
[REQ-TIED_HARNESS_LANGSMITH_COMPOSE] [ARCH-TIED_HARNESS_LANGSMITH_COMPOSE]
[IMPL-TIED_HARNESS_LANGSMITH_COMPOSE]

## Inputs

- **Invocation remainder:** LangSmith **run id(s)**, optional project label, target working folder under `tied-project/working/{REQ-TOKEN}/` or caller-supplied `--out` directory.
- **Credentials:** operator-owned **`LANGSMITH_API_KEY`** (never commit; fleet egress is sponsor responsibility).

## TIED applicability

**Minimal** — export + compose handoff only. Not a substitute for
`add-feature`, `refine-plan`, `build-plan`, or `close-out`.

**Canonical guide:** `tied-bundle/docs/harness-trace-observation-loop.md` (sections:
Proof boundary, **Optional LangSmith client compose**, Outer loop).

## Procedure

1. Read the methodology guide proof boundary — LangSmith remains **out of TIED core**; this skill is **optional client compose** only.
2. **Export (optional script)** — from the installed skill directory, operator may run:
   `node scripts/export-langsmith-traces.mjs --out <absolute-or-repo-relative-dir> --run-id <uuid> [--run-id <uuid> ...]`
   with **`LANGSMITH_API_KEY`** set. Output: `run-<uuid>.json` files plus `manifest.v1.json`.
3. **Scope review inputs** — point `@harness-trace-review` or `@harness-trace-analyzer` at exported JSON excerpts or summarized failure notes; do not treat LangSmith latency/token metrics as TIED effectiveness (**LangChain-reported** / **`not_measured`** only).
4. **Compose handoff** — invoke **`@harness-trace-review`** for lightweight Loop 2 capture, or **`@harness-trace-analyzer`** when parallel Task fan-out is needed.
5. **No gate claims** — export success does not imply implement-complete, checklist pass, or **`tied_verify`** outcomes.

## Gates

- This skill **does not** call **`tied_checklist_gate_validate`** on behalf of implement-complete claims.
- **`tied_verify`**, **`pseudocode_validate`**, and checklist gates remain authoritative for TIED-tracked implement and close-out.

## Forbidden

- Describing LangSmith export as **TIED core**, MCP gate input, or substitute for adherence ledger authority
- Project REQ/ARCH/IMPL YAML writes without **`tied_config_get_base_path`** and TIED MCP / **`tied-cli.sh`**
- Language that **`tied_checklist_gate_validate`** outcomes are waived, replaced, or implied by trace export
- Citing Terminal Bench or LangChain-reported percentages as TIED methodology effectiveness
- Automatic LEAP or token mint from exported traces alone
- Committing API keys or `.env` secrets into the repository
- **`pbpaste`** / **`pbcopy`**; automatic git stage, commit, or push

## Outputs

- Local trace JSON directory suitable for HTOL skills (manifest + per-run files)
- Short handoff listing which **`@harness-trace-*`** skill to run next and promotion path (Kaizen vs **`add-feature`**)
