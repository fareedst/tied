# PLAN — REQ-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK

**Token:** `REQ-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK`  
**plan_phase:** `post-build`  
**Stack:** [REQ-TIED_TRIAL_PROOF_INTENT_STACK](../REQ-TIED_TRIAL_PROOF_INTENT_STACK/PLAN.md)  
**Taxonomy:** [proof-test-label-taxonomy.md](../REQ-TIED_TRIAL_PROOF_INTENT_STACK/evidence/proof-test-label-taxonomy.md)  
**Depends on:** L2, L3, `REQ-WF_TRIAL_READOUT_GRADING_RATIONALE`

---

## Sponsor intent (locked)

Facilitator **Lens A** subcheck combines coarse receipt, **label histogram**, manifest presence, and inference — for `@record-wf-trial` on PROMPT-WF-09..12.

---

## Schema `wf-composition-evidence-subcheck.v2.json`

| Field | Purpose |
| --- | --- |
| `composition_evidence_subcheck` | pass \| fail \| n_a |
| `primary_lens` | `wf-cohort` |
| `receipt_composition_declared` | L1 coarse |
| `receipt_composition_inferred` | L2 |
| `label_case_counts` | Copy or embed from snapshot |
| `label_histogram_markdown` | Compact table for readout |
| `manifest_present` | boolean |
| `manifest_reconcile_ok` | boolean |
| `binding_test_present` | Rule: manifest binding row OR `composition.wiring` > 0 OR inferred |

---

## MCP `tied_trial_composition_evidence_subcheck`

Inputs: `repo_root`, optional `prompt_id`, `primary_lens`, optional manifest path.  
Runs: snapshot 1.2.0 + manifest validate + histogram renderer.

---

## `record-wf-trial` updates

- New appendix subsection: **Proof labels (dissection)** beside **Size receipt `comp`**.
- Test strategy rationale may cite label mismatch (facilitator judgment).

**v1:** Evidence append only — no auto band rewrite.

---

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| SC-SUB-01 | v2 JSON schema contract tests |
| SC-SUB-02 | WF-09 fail cohort + WF-10 medium pass fixtures |
| SC-SUB-03 | Readout contains histogram when subcheck runs |
| SC-SUB-04 | Grading rationale contract test updated only if new section required |

---

## Sponsor G4

Confirm evidence-only vs auto band adjustment (default evidence-only).

---

## Do next

`@build-plan` after **G3**.
