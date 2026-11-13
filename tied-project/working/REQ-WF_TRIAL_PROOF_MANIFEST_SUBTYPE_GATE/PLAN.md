# PLAN — REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE (wave 3)

**Status:** build-plan complete (2026-11-12) — `@close-out` next  
**Parent context:** [REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE](../REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE/PLAN.md) · field case disposable `1794511862` (WF-10 Cursor Composer 2.5)  
**Request token:** `REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE`  
**plan_phase:** `post-build`  
**profile_depth:** `minimal` · **gate_policy:** `advisory`

**CITDP (draft):** [citdp-draft.md](./citdp-draft.md)  
**Test strategy:** [test-strategy.md](./test-strategy.md)  
**CITDP YAML (working):** [CITDP-REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE.yaml](./CITDP-REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE.yaml)  
**IMPL pseudo-code:** [IMPL-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE-pseudocode.md](../../../implementation-decisions/IMPL-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE-pseudocode.md)

**Build alignment:** Exploratory `@debug` patch on disk matches locked contracts below; `@build-plan` must add token comments, LEAP file header, formal RED→GREEN, and close-out — not claim done from debug alone.

---

## 1. Refine (RESOLVE) — locked

| # | Term | Resolution |
| --- | --- | --- |
| R1 | **Failure mode** | Four-phase product close-out succeeds but orchestrator exits **1** on L3 proof manifest gate: agents set `proof_subtype` to coarse **`proof_facet`** values (`unit`, `composition`, `e2e`, `binding_inventory`) instead of fine labels (`unit.default`, …). Incident: `1794511862`. |
| R2 | **Gate gap (wave 2)** | `validateMinManifestShape` only inspected **`files[0]`**; generic `files[0].proof_subtype invalid` hid additional bad rows and root cause. |
| R3 | **`FACET_AS_SUBTYPE`** | Distinct error **code** when subtype string equals a coarse facet; message cites row index and fine-label examples (`unit.default`, `composition.wiring`, `e2e.ui`). |
| R4 | **Operator hints (SC-PMG-13)** | After subtype failures on CLI `main`, emit **DIAGNOSTIC** (not ERROR) lines: taxonomy markdown path + suggest MCP `tied_wf_proof_manifest_validate` before turn 4. |
| R5 | **Validation order** | Per-row subtype pass runs in **min-shape** phase **before** `FILE_EXISTS` / `FILE_COVERAGE` (unchanged parent ordering). |
| R6 | **Bindings** | When `bindings[].proof_subtype` present, same validator with `bindings[i]` loc prefix. |
| R7 | **Scope** | `wf-trial-proof-manifest-gate.mjs`, `.test.mjs`, `wf-trial-proof-manifest-adjunct.md`, `wf-trial-build-plan-handoff.md`; vocab `FACET_AS_SUBTYPE` recorded. |
| R8 | **Out of scope** | Auto-rewrite manifests; changing MCP `validateWfProofManifest` blocking; registering disposable run `1794511862`; deduplicating enum into shared TS import from .mjs in this wave. |
| R9 | **Parent LEAP** | `REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE` unchanged; child SC-PMG-11..13 additive. Optional doc cross-link in RPM PLAN only. |

### 1.1 `proofSubtypeValidationError` contract (locked)

| Field | Value |
| --- | --- |
| **EXPORTS** | `proofSubtypeValidationError`, `COARSE_PROOF_FACETS`, existing `VALID_PROOF_SUBTYPES` |
| **PRE** | `index` ≥ 0; `rowKind` ∈ `{files, bindings}` |
| **POST (null)** | `value` ∈ `VALID_PROOF_SUBTYPES` |
| **POST (FACET_AS_SUBTYPE)** | `value` ∈ `COARSE_PROOF_FACETS` |
| **POST (UNKNOWN_SUBTYPE)** | non-empty string not in either set |
| **POST (SUBTYPE_MISSING)** | missing/blank subtype |

---

## 2. Acceptance criteria → verification

| ID | Criterion | Verification signal |
| --- | --- | --- |
| SC-PMG-11 | Every `files[]` row validated | Unit: manifest with bad rows 0 and 1 both report errors |
| SC-PMG-12 | `FACET_AS_SUBTYPE` + index + hint | Unit: message contains `proof_facet not proof_subtype` and `files[1]` |
| SC-PMG-13 | Taxonomy + MCP DIAGNOSTICs | Unit or shell: CLI stderr contains taxonomy path when FACET_AS_SUBTYPE present (optional bootstrap extend) |

---

## 3. Build-plan scope

| ID | Deliverable | Status |
| --- | --- | --- |
| BP.1 | IMPL pseudo-code sidecar | Done (refine-plan) |
| BP.2 | Align `.mjs` token comments + tests | Done |
| BP.3 | Adjunct docs | Done (refine + debug) |
| BP.4 | `pseudocode_validate` ok + consistency | `gate_mode` ok; full consistency has parent ref warnings |
| BP.5 | Header `[REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE]` on gate module | Done |

**Verification:** `node --test tools/bootstrap/lib/wf-trial-proof-manifest-gate.test.mjs`

---

## Do next

**`@close-out`** — persist CITDP, traceable commit, CHANGELOG.
