---
name: harness-trace-review
description: "Explicit-only harness trace review into Kaizen tied_feedback_capture_observation—no gate authority or YAML writes. Use when the caller names harness-trace-review or @harness-trace-review after a session batch. Do not use for build-plan implement, close-out, or substituting tied_checklist_gate_validate."
disable-model-invocation: true
---

# harness-trace-review

Explicit invocation only (`@harness-trace-review` or `prompt-type: harness-trace-review`).

This skill is the workflow source of truth for Loop 2 harness trace review.
`tied-install.sh` installs it under `.cursor/skills/harness-trace-review/`.
[REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP] [ARCH-TIED_HARNESS_TRACE_OBSERVATION]
[IMPL-TIED_HARNESS_TRACE_OBSERVATION]

## Inputs

- **Invocation remainder:** optional scope (REQ token, working folder, transcript path hints).
- **Review inputs:** session transcript, Tracker dispositions, adherence notes, or harness working artifacts—caller supplies paths or pasted excerpts.

## TIED applicability

**Minimal** — Kaizen capture and harness documentation only. Not a substitute for
`add-feature`, `refine-plan`, `build-plan`, or `close-out`.

**Canonical guide:** `tied-bundle/docs/harness-trace-observation-loop.md` in the
TIED store (clients: same path after `tied-install` refresh under methodology docs).

## Procedure

1. Read the methodology guide sections: Proof boundary, Procedure, Failure-mode taxonomy.
2. Classify findings; do not treat chat assertions as gate receipts.
3. Call **`tied_feedback_capture_observation`** once per review batch idempotency key
   unless sponsor documents duplicate capture. For Loop 3 HTOL pilot cohorting, optionally set
   **`context.denominator_fingerprint: htol-v1`** (see [harness-trace-learning-experiment-charter.md](../../../tied-bundle/docs/harness-trace-learning-experiment-charter.md)).
4. Optional: Task fan-out for failure analysis with explicit readonly scope.
5. Route methodology or REQ changes through owning prompt-type skills—not from this skill.

## Gates

- This skill **does not** call **`tied_checklist_gate_validate`** on behalf of implement-complete claims.
- **`tied_verify`**, **`pseudocode_validate`**, and checklist gates remain authoritative for TIED-tracked implement and close-out.

## Forbidden

- LangSmith or external trace-store adapters as TIED core
- Project REQ/ARCH/IMPL YAML writes without **`tied_config_get_base_path`** and TIED MCP / **`tied-cli.sh`**
- Language that **`tied_checklist_gate_validate`** outcomes are waived, replaced, or implied by trace review
- Automatic LEAP or token mint from observations alone
- **`pbpaste`** / **`pbcopy`**; automatic git stage, commit, or push

## Outputs

- One or more **operational observations** with capture receipts
- Short handoff listing promotion path (harness fix vs **`add-feature`** vs sponsor review)
