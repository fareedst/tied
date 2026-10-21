---
name: harness-trace-analyzer
description: "Explicit-only LangChain-style outer loop compose: parallel Task failure analysis and harness knob synthesis into Kaizen capture—no LangSmith, gate authority, or YAML writes. Use when the caller names harness-trace-analyzer or @harness-trace-analyzer for multi-failure trace batches. Do not use for quick post-batch review (use harness-trace-review), build-plan implement claims, or substituting tied_checklist_gate_validate."
disable-model-invocation: true
---

# harness-trace-analyzer

Explicit invocation only (`@harness-trace-analyzer` or `prompt-type: harness-trace-analyzer`).

This skill is the workflow source of truth for the **outer loop compose** pattern
(LangChain Trace Analyzer **analog** — caller-supplied inputs only).
`tied-install.sh` installs it under `.cursor/skills/harness-trace-analyzer/`.
[REQ-TIED_HARNESS_LANGCHAIN_PHASE3] [ARCH-TIED_HARNESS_LANGCHAIN_PHASE3]
[IMPL-TIED_HARNESS_LANGCHAIN_PHASE3]

## Inputs

- **Invocation remainder:** optional scope (REQ token, working folder, transcript path hints).
- **Review inputs:** session transcript excerpts, Tracker dispositions, adherence notes, or harness working artifacts — **caller supplies paths or pasted excerpts** (no vendor trace-store fetch).

## TIED applicability

**Minimal** — Kaizen capture and harness synthesis proposals only. Not a substitute for
`add-feature`, `refine-plan`, `build-plan`, or `close-out`.

**Canonical guide:** `tied-bundle/docs/harness-trace-observation-loop.md` (sections:
Proof boundary, Procedure, Failure-mode taxonomy, **Outer loop (LangChain compose)**).

**When to use `@harness-trace-review` instead:** single batch, few failure modes, fast Loop 2 capture.

## Procedure

1. Read the methodology guide **Outer loop** section and failure-mode taxonomy.
2. **Scope inputs** — minimum review set only; do not treat chat assertions as gate receipts.
3. **Classify** — map findings to HTOL taxonomy classes (context discovery, self-verify drift, gate confusion, YAML bypass, benchmark overclaim, promotion skip).
4. **Task fan-out (normative for this skill)** — spawn one or more foreground **Task** subagents with **readonly** scope and explicit file/transcript paths; synthesize their outputs (do not treat Task output as gate receipts).
5. **Synthesize harness knobs** — propose **prompt / tools / middleware analog** edits (skills, PRELOAD, prompt-type choice, hooks) as **proposals only** — no automatic file edits.
6. **Capture once per batch** — call **`tied_feedback_capture_observation`** with a stable idempotency key (at most one capture per batch unless sponsor documents duplicate intent). Optional **`context.denominator_fingerprint: htol-v1`** per [harness-trace-learning-experiment-charter.md](../../../tied-bundle/docs/harness-trace-learning-experiment-charter.md).
7. **Promotion handoff** — list next step: harness doc/skill fix vs **`add-feature`** / **`refine-plan`** / sponsor review; never mint project YAML from synthesis alone.

## Gates

- This skill **does not** call **`tied_checklist_gate_validate`** on behalf of implement-complete claims.
- **`tied_verify`**, **`pseudocode_validate`**, and checklist gates remain authoritative for TIED-tracked implement and close-out.

## Forbidden

- LangSmith, Harbor, Daytona, or other vendor trace-store adapters as TIED core
- Project REQ/ARCH/IMPL YAML writes without **`tied_config_get_base_path`** and TIED MCP / **`tied-cli.sh`**
- Language that **`tied_checklist_gate_validate`** outcomes are waived, replaced, or implied by trace analysis
- Citing Terminal Bench or LangChain-reported percentages as TIED methodology effectiveness
- Automatic LEAP or token mint from observations or synthesis alone
- **`pbpaste`** / **`pbcopy`**; automatic git stage, commit, or push

## Outputs

- Structured synthesis (failure classes + harness knob proposals)
- One **operational observation** capture receipt per batch (unless sponsor documents duplicate)
- Short handoff listing promotion path
