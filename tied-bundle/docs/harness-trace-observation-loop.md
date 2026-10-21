# Harness trace observation loop

**Audience:** Operators reviewing agent sessions, transcripts, adherence notes, or harness traces after a TIED-tracked turn batch.

**Traceability:** [REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP](../../tied-project/requirements/REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml) · [ARCH-TIED_HARNESS_TRACE_OBSERVATION](../../tied-project/architecture-decisions/ARCH-TIED_HARNESS_TRACE_OBSERVATION.yaml) · [IMPL-TIED_HARNESS_TRACE_OBSERVATION](../../tied-project/implementation-decisions/IMPL-TIED_HARNESS_TRACE_OBSERVATION.yaml)

**Invoke skill:** `@harness-trace-review` (`tools/bundled-prompt-type-skills/harness-trace-review/SKILL.md`; installed under `.cursor/skills/harness-trace-review/`).

**Source study:** [LangChain harness engineering × TIED](../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md) (Phase 1 compose).

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| Structured review of **session / transcript / adherence** inputs → **operational observation** via **`tied_feedback_capture_observation`** | LangSmith, Harbor, Daytona, or other vendor trace stores |
| Optional **Task** fan-out for failure-mode analysis (harness plane) | **`tied_checklist_gate_validate`**, **`tied_verify`**, or checklist waivers |
| **test-strategy executable matrix** wording in Tracker / test-strategy | Automatic REQ/ARCH/IMPL or LEAP from trace review |
| Compose with [pre-handoff verification charter](pre-handoff-verification-charter.md) | Terminal Bench or vendor benchmark scores as TIED effectiveness |

Trace review produces **Kaizen Loop 2** evidence. It does **not** prove implement-complete, merge-ready, or methodology rule changes.

---

## Procedure

1. **Scope inputs** — Collect the minimum review set: agent transcript excerpt, Tracker slug dispositions, gate receipt paths (if any), adherence notes, or harness working-folder artifacts under `tied-bundle/working/` (regenerable) vs committed rationale under `tied-project/working/`.
2. **Classify failure modes** — Map findings to the taxonomy below; avoid naming vendor “Trace Analyzer” as a shipped TIED product class.
3. **Compose, don’t replace** — Tune harness knobs (skills, PRELOAD, prompt-type choice); do **not** describe observations as gate outcomes ([authority boundary operator checklist](../../tied-project/working/REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md)).
4. **Capture once per batch** — Call **`tied_feedback_capture_observation`** with a stable **idempotency key** for the review batch (at most one capture per batch unless sponsor documents duplicate intent). See [feedback-to-tied.md](../../tied-project/vocab/feedback-to-tied.md).
5. **Optional Task fan-out** — For deep failure analysis, delegate to a foreground Task with explicit scope; Task output remains advisory until checklist-owned promotion (`add-feature`, `refine-plan`, `build-plan`, `close-out`).
6. **Promotion path** — Follow [Promotion path](#promotion-path); never mint project YAML from trace review alone.

---

## Failure-mode taxonomy

| Class | Symptom | Default harness response | Platform-adjacent note |
| --- | --- | --- | --- |
| **Context discovery** | Wrong repo, stale `TIED_BASE_PATH`, missing PRELOAD | Record observation; fix session bootstrap on next turn | **`tied_config_get_base_path`** before MCP writes |
| **Self-verify drift** | Chat claims tests passed without command evidence | Record observation; cite [test-strategy executable matrix](#test-strategy-executable-matrix) | **`tied_verify`** + gate receipts for implement claims |
| **Gate confusion** | Skill/hook language waives or replaces checklist gates | Record observation; fix harness prose | Gate authority unchanged |
| **YAML bypass** | Trace loop suggested direct index edits | Record observation; route via TIED MCP / **`tied-cli.sh`** | **`tied_validate_consistency`** after mutations |
| **Benchmark overclaim** | Vendor Terminal Bench % cited as TIED success | Record observation; label **LangChain-reported** / **`not_measured`** | No methodology effectiveness claim |
| **Promotion skip** | Observation treated as LEAP or REQ mint | Record observation; open **`add-feature`** or sponsor queue | LEAP via reviewed paths only |

---

## Promotion path

| Observation severity | Next step | Authority |
| --- | --- | --- |
| Harness wording / PRELOAD / skill clarity | Kaizen **operational observation** + optional doc fix via scoped plan | Harness |
| Methodology rule or checklist slug change | Sponsor **`add-feature`** or **`refine-plan`** on owning REQ | Checklist + TIED stack |
| Production-system countermeasure | Kaizen digest → **review bridge** → LEAP queue when approved | Sponsor ladder |
| Implement-complete claim | **`tied_checklist_gate_validate`** `verification` receipt + **`tied_verify`** when enabled | Platform-adjacent |

Observations stay **`promotion_pending`** until an owning workflow confirms.

---

## Test-strategy executable matrix

For TIED-tracked **implement** passes (`build-plan`, `add-feature` implement leg), the task **test-strategy** (or Tracker `test-strategy` step) must name **commands**, not model self-check prose alone.

| Field | Required content |
| --- | --- |
| **RED command(s)** | Concrete shell/test commands run before production/doc finalization (example: `node --test tools/bootstrap/lib/harness-trace-observation-loop-doc.test.mjs`) |
| **Green command(s)** | Same suite after implementation (exit code 0) |
| **Verification gate** | `tied_checklist_gate_validate` with `phase: verification` and receipt under `tied-project/working/{REQ-TOKEN}/gates/` |
| **Proof line** | Explicit statement that **model self-check is not sole proof** of test pass or gate allow |

Compose with [pre-handoff verification charter](pre-handoff-verification-charter.md) **Executable checks before handoff** table.

---

## Related documents

- [LangChain harness engineering × TIED — Phase 1](../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md#phased-recommendations-doc-first)
- [Traefik harness/platform × TIED](../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md)
- [Client development index](client-development-index.md)
- [Feedback to TIED (vocab)](../../tied-project/vocab/feedback-to-tied.md)
- [Agentstream README](../../mcp-server/packages/agentstream/README.md)

**Last updated:** 2026-10-21
