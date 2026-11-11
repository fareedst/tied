# PLAN — REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE

**Status:** build-plan wave 2 complete · ready for `@close-out`  
**Workflow:** add-feature → refine-plan → `@build-plan` (wave 1) → refine-plan (wave 2) → **`@build-plan` (wave 2)** → close-out  
**Request token:** `REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE`  
**plan_phase:** `post-build` (wave 2)  
**profile_depth:** `minimal` · **gate_policy:** `advisory` (orchestrator gate; not integrated inquiry)

**Stack context:** [REQ-TIED_TRIAL_PROOF_INTENT_STACK](../REQ-TIED_TRIAL_PROOF_INTENT_STACK/PLAN.md) · L3 [REQ-WF_TRIAL_PROOF_MANIFEST_LITE](../REQ-WF_TRIAL_PROOF_MANIFEST_LITE/PLAN.md) · L4 [REQ-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK](../REQ-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK/PLAN.md)

**CITDP (draft):** [CITDP-REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE.yaml](./CITDP-REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE.yaml)  
**Test strategy:** [test-strategy.md](./test-strategy.md)  
**Sponsor G5:** [evidence/g5-sponsor-checkpoint.md](./evidence/g5-sponsor-checkpoint.md) (all PROMPT-WF when gate on)  
**Sponsor G6:** [evidence/g6-sponsor-orchestrator-default.md](./evidence/g6-sponsor-orchestrator-default.md) (default-on; remove REQUIRE env)

---

## 1. Refine (Touchpoint 1 — RESOLVE)

### Wave 1 — closed

| Sponsor term | Resolved concept | Disposition |
| --- | --- | --- |
| **L3** | `proof-facet-manifest.v1` on subject client + store MCP `tied_wf_proof_manifest_validate` | **Locked** |
| **Mandatory** | Orchestrator **fails non-zero** after four-phase when manifest missing/invalid; MCP `blocking=false` unchanged | **Locked** |
| **Prompt scope (G5)** | **Option B** — all PROMPT-WF-01..12 when gate on | **Locked** — [g5](./evidence/g5-sponsor-checkpoint.md) |
| Escape hatch | `WF_TRIAL_SKIP_PROOF_MANIFEST=1` | **Locked** |
| Proof boundary | Descriptive labeling — not Implemented / not grading auto-rewrite | **Locked** |

### Wave 2 — sponsor redirect (2026-11-11)

| Sponsor term | Resolved concept | Disposition |
| --- | --- | --- |
| **All orchestrator clients** | `workflow-trial-agentstream` default-on gate (not range-only) | **Locked** — [g6](./evidence/g6-sponsor-orchestrator-default.md) |
| **`WF_TRIAL_REQUIRE_PROOF_MANIFEST`** | Removed from code, help, preload, agent docs | **Locked** (no deprecated alias) |
| **Agent confusion** | Preload + turn-3 batch must not condition manifest on env | **Locked** |
| **`workflow_trial_range`** | Inherits default-on; **no** separate export | **Locked** |

**Costly choice (wave 2):** Single-cell matrix runs that previously exited 0 without manifest become **fail-closed** until `files[]` is completed; `WF_TRIAL_SKIP_PROOF_MANIFEST` for operator debug only.

**Superseded:** Wave 1 row “Direct `workflow_trial_agentstream` — no mandate unless REQUIRE exported.”

---

## 2. Problem

| Gap | Wave 1 (shipped) | Wave 2 (target) |
| --- | --- | --- |
| Single-cell runs | Exit 0 without manifest (e.g. WF-10 @ 1794369836) | Same orchestrator path **requires** manifest |
| Cohort science | Range cells only when REQUIRE inherited | All disposable WF clients |
| Agent guidance | “When `WF_TRIAL_REQUIRE_PROOF_MANIFEST=1`…” in preload | Unconditional build-plan obligation |
| Operator surface | REQUIRE + SKIP pair | **Default on** + SKIP only |

---

## 3. Normative paths (aligned with L4 MCP)

| Artifact | Path on disposable client |
| --- | --- |
| Manifest (primary) | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| Manifest (alt) | First match: `tied-project/working/*/evidence/proof-facet-manifest.v1.json` |
| Template (store) | `tied-bundle/templates/proof-facet-manifest.v1.template.json` |
| Taxonomy | [proof-test-label-taxonomy.md](../REQ-TIED_TRIAL_PROOF_INTENT_STACK/evidence/proof-test-label-taxonomy.md) |

Gate **does not** invoke MCP over the network; local Node helper mirrors minimum shape checks.

---

## 4. Exit code composition

Unchanged from wave 1: four-phase failure wins; gate elevates 0→1; dry-run skips gate; skip env emits DIAGNOSTIC.

---

## 5. Scope — wave 2 delta

### In scope

- **`wf_trial_proof_manifest_gate_enabled`**: return enabled unless `WF_TRIAL_SKIP_PROOF_MANIFEST` (remove REQUIRE branch).
- **`workflow-trial-agentstream.sh`**: scaffold + gate unchanged call sites; gate always eligible when not skipped/dry-run.
- **`scripts/build-commands.sh`**: remove `export WF_TRIAL_REQUIRE_PROOF_MANIFEST=1` and range DIAGNOSTIC.
- **Agent surfaces**
  - [`tied-bundle/docs/wf-trial-agent-preload-contract.yaml`](../../../tied-bundle/docs/wf-trial-agent-preload-contract.yaml) — unconditional manifest bullet
  - [`docs/demos/traditional-four-phase-agentstream.yaml`](../../../docs/demos/traditional-four-phase-agentstream.yaml) — turn 3 references `wf-trial-proof-manifest-adjunct.md`
  - [`wf-trial-proof-manifest-adjunct.md`](../../../tools/bundled-prompt-type-skills/prompt-shared/wf-trial-proof-manifest-adjunct.md) — all PROMPT-WF; primary scaffold path
  - Optional: [`wf-trial-build-plan-handoff.md`](../../../tools/bundled-prompt-type-skills/prompt-shared/wf-trial-build-plan-handoff.md) manifest receipt row
- **`wf-trial-agentstream-help.inc.sh`** + [`tied-project/vocab/agentstream.md`](../../vocab/agentstream.md) — remove REQUIRE; document default-on + SKIP
- **Tests** per [test-strategy.md](./test-strategy.md)
- **TIED LEAP:** REQ description + SC-RPM-01/04/06; IMPL pseudo-code `GATE_ENABLED`; persist CITDP to `tied-project/citdp/` at close-out

### Out of scope

- Global MCP `blocking=true`
- Auto-filling manifest from snapshot
- L4 subcheck rule changes
- Non-orchestrated IDE-only four-phase (no `workflow-trial-agentstream`)

---

## 6. Implementation sequence (`@build-plan` wave 2)

| Step | Deliverable |
| --- | --- |
| 1 | RED: update `workflow-trial-agentstream-sh.test.mjs` expectations (SC-RPM-01, SC-RPM-06, no REQUIRE grep) |
| 2 | `wf-trial-proof-manifest-gate.inc.sh` default-on; remove REQUIRE |
| 3 | `build-commands.sh` + help + vocab |
| 4 | Preload YAML + four-phase YAML + proof-manifest adjunct (+ optional build-plan handoff) |
| 5 | IMPL pseudo-code LEAP + REQ index detail + `tied_validate_consistency` |

**Pseudo-code owner:** [IMPL-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE-pseudocode.md](../../implementation-decisions/IMPL-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE-pseudocode.md) — revise `GATE_ENABLED` and remove `EXPORT mandate env`.

---

## 7. Acceptance criteria (wave 2)

| ID | Criterion |
| --- | --- |
| SC-RPM-01 | `wf_trial_proof_manifest_gate_enabled` is true with **no** env vars; `WF_TRIAL_REQUIRE_PROOF_MANIFEST` absent from repo shell/docs/preload |
| SC-RPM-02 | WF-10 + missing manifest → gate exit non-zero when four-phase exit 0 (simulated gate call) |
| SC-RPM-03 | `WF_TRIAL_SKIP_PROOF_MANIFEST=1` → gate disabled with DIAGNOSTIC |
| SC-RPM-04 | WF-03 + default gate → gate **applies** (G5 B; supersedes wave 1 Option A wording) |
| SC-RPM-05 | Valid minimal manifest JSON on fixture workspace → gate 0 |
| SC-RPM-06 | Help documents **default-on** gate + SKIP only |
| SC-RPM-07 | Four-phase non-zero exit preserved when gate would fail |
| SC-RPM-08 | Scaffold seeds template at primary path when gate on and file absent |

---

## 8. LEAP / stack note

Wave 1 delivered range-only opt-in. Wave 2 extends **orchestrator policy** to all `workflow-trial-agentstream` invocations without renaming the REQ token (description widened). Does not amend L3 MCP semantics.

---

## Do next

**`@close-out`** — traceable commit when sponsor approves
