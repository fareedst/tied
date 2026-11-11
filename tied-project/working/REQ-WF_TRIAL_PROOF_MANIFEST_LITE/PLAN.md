# PLAN — REQ-WF_TRIAL_PROOF_MANIFEST_LITE

**Token:** `REQ-WF_TRIAL_PROOF_MANIFEST_LITE`  
**plan_phase:** `post-build`  
**Stack:** [REQ-TIED_TRIAL_PROOF_INTENT_STACK](../REQ-TIED_TRIAL_PROOF_INTENT_STACK/PLAN.md)  
**Taxonomy:** [proof-test-label-taxonomy.md](../REQ-TIED_TRIAL_PROOF_INTENT_STACK/evidence/proof-test-label-taxonomy.md)  
**Depends on:** `REQ-WF_TRIAL_COMPOSITION_PROMPTS`, L2 `label_case_counts`

---

## Sponsor intent (locked)

Agents **declare** bindings and **per-file labels** so store-side validators reconcile path/header/inference vs intent. WF-lite — not full binding inventory on every disposable client.

---

## Schema sketch `proof-facet-manifest.v1.json`

| Field | Purpose |
| --- | --- |
| `schema_version` | `proof-facet-manifest.v1` |
| `prompt_id` | e.g. `PROMPT-WF-10` |
| `proof_boundary` | Same string family as size receipt |
| `bindings[]` | `id`, `trigger`, `callee`, `test_files[]`, optional `proof_subtype` per file |
| `files[]` | `path`, `proof_facet`, `proof_subtype`, optional `colocated_unit`, `tags[]`, optional `e2e_only_reason` |

**Validation (`tied_wf_proof_manifest_validate`):**

- Enum check against taxonomy `proof_subtype` list
- `proof_facet` matches rollup map for each subtype
- Files exist under `repo_root`
- Reconcile vs L2 snapshot: mismatch → `label_reconcile_diagnostics[]` (advisory)

---

## Skills

- Build-plan adjunct: write/update manifest during WF composition builds; default labels from path when agent omits `files[]`.
- Workflow trial preload: “manifest recommended before close-out” (advisory).

---

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| SC-MAN-01 | Schema template in `tied-bundle/templates/` matches taxonomy enums |
| SC-MAN-02 | Validator rejects unknown `proof_subtype` |
| SC-MAN-03 | Override changes receipt resolution when L3 reconcile pass runs (integration test) |
| SC-MAN-04 | Contract test `wf-trial-proof-manifest-contract.test.mjs` |
| SC-MAN-05 | Advisory default; blocking flag off unless sponsor sets at G3 |

---

## Sponsor G3

Approve manifest required fields + advisory vs blocking close-out.

---

## Do next

`@build-plan` after **G2**.
