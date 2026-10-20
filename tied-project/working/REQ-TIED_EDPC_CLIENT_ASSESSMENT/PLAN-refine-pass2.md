---
name: EDPC Client Assessment Report
overview: Reconcile Workflow H after platform build and Chart Viewer pilot; retroactive integrated gates before close-out; finish dogfood follow-on and deferred H4/H6.
todos:
  - id: h0-chartviewer-baseline
    content: Chart Viewer EDPC authority, freshness, and receipt audit (18/18 refs)
    status: completed
  - id: h1-client-assessment-contract
    content: REQ/ARCH/IMPL/PROC, templates, pseudo-code sidecar
    status: completed
  - id: h2-chartviewer-handoff
    content: Consultant technical summary + docs/assessments handoff (client repo may be uncommitted)
    status: completed
  - id: h3-reusable-assessment-tools
    content: validate / compose / render modules, fixtures, MCP registration
    status: completed
  - id: h4-client-playbook-and-dogfood
    content: Full client playbook doc, install refresh, golden compare vs pilot
    status: pending
  - id: h5-close-out
    content: Retroactive inquiry + verification/close_out gates + three completion signals
    status: completed
  - id: h6-golden-compare
    content: Platform regenerate vs hand-authored pilot; document diff policy
    status: pending
isProject: false
---

# EDPC client assessment report workflow

**Refine-plan pass:** 2 · **2026-10-19**  
**Prior pass:** [PLAN-refine-pass1.md](./PLAN-refine-pass1.md)  
**Program REQ (platform):** `[REQ-TIED_EDPC_CLIENT_ASSESSMENT]` (minted — commit **`6577f890`**)  
**Pilot engagement (external):** `REQ-CHARTVIEWER-BROWNFIELD_EDPC_COMPREHENSION`  
**Tracker:** [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml) (pass 2 metadata)  
**CITDP:** [CITDP-REQ-TIED_EDPC_CLIENT_ASSESSMENT.yaml](./CITDP-REQ-TIED_EDPC_CLIENT_ASSESSMENT.yaml)  
**Test strategy:** [test-strategy.md](./test-strategy.md)  
**Build status:** [evidence/build-plan-platform-status.md](./evidence/build-plan-platform-status.md)  
**Handoff:** [evidence/session-handoff.md](./evidence/session-handoff.md)  
**Hard dependency (satisfied):** [REQ-TIED_EDPC_COMPREHENSION](../../REQ-TIED_EDPC_COMPREHENSION/evidence/session-handoff.md) Slice D **`a03bdb0f`**

**Depth / gates:** `profile_depth` / `depth_tier`: **`integrated`** · `gate_policy`: **`advisory`**

---

## Refine (pass 2 — execution reconciliation)

Pass 1 assumptions remain valid for scope, proof boundary, and architecture. Pass 2 records **what shipped**, **process debt**, and **remaining work** without reopening platform RED unless LEAP requires it.

### Resolved since pass 1

| Topic | Pass 2 resolution |
| --- | --- |
| **Slice D dependency** | OFSM/publish contracts consumed; compose uses D-lite stubs in fixtures; Chart Viewer pilot uses engagement OFSM stub. |
| **Platform RED (H1, H3–H5)** | Shipped at **`6577f890`**: `client-assessment-validate|compose|render`, MCP tools, templates, `[PROC-EDPC_CLIENT_ASSESSMENT]`, vocab Workflow **H**. |
| **Chart Viewer H0** | 18/18 publish `receipt_refs` resolve — [assessment-audit-2026-10-19.md](file:///Users/fareed/Documents/persante/repos/261016/chartviewer/tied-project/working/REQ-CHARTVIEWER-BROWNFIELD_EDPC_COMPREHENSION/evidence/reports/assessment-audit-2026-10-19.md). |
| **Chart Viewer H2** | Consultant `technical-summary.v1.md` + `docs/assessments/` copy; platform dogfood produced `assessment-model.v1.yaml` (client artifacts may be uncommitted). |
| **Claims ledger row shape** | Compose accepts **`text`** (fixtures) and **`statement`** (Chart Viewer `claims-ledger.v1.yaml`); maps to CAM finding `assertion` — **SC-CAM-LEDGER-FIELDS**. |
| **Dogfood boundary** | [`mcp-server/scripts/dogfood-chartviewer-cam.mjs`](../../../mcp-server/scripts/dogfood-chartviewer-cam.mjs) is an **operator harness** (reads sponsor-approved client paths, writes client working reports); MCP handlers stay path-free. |

### Process debt (costly — document, do not hide)

Build-plan executed **before** integrated `pre_implementation` gate **`allowed: true`**. This violates pass 1 Implement entry but is **irreversible** without revert. **Close-out must not claim complete** until retroactive inquiry, pseudocode gate, and unified close-out gates pass.

**Pre_implementation gate snapshot (pass 2):** **`allowed: false`** — [evidence/refine-pass2-pre-implementation-gate.md](./evidence/refine-pass2-pre-implementation-gate.md). Diagnostics unchanged: `tracker_sparse`, `missing_required_step:sub-adversarial-inquiry-pass`, `missing_required_step:gate-pseudocode-validation`, `integrated_depth_requires_pairing`, `activation_pairing_incomplete`.

### Refine pass 2 additions

- **Inquiry run_ids (planned):** `edpc-cam-pre-impl-20261019` · `edpc-cam-verify-20261019` · `edpc-cam-closeout-20261019` — payload seed: [evidence/pre-impl-inquiry-payload.json](./evidence/pre-impl-inquiry-payload.json); four artifacts per phase under `tied-bundle/working/REQ-TIED_EDPC_CLIENT_ASSESSMENT/adversarial-inquiry/`.
- **Close-out authority:** `@plan-close-out` with `run-close-out-gates.mjs --envelope-blocking --sync-dispositions --reconcile`; three completion signals per [completion-signals-handoff.md](../../../tools/bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md).
- **Commit scope (stdd follow-on):** compose `statement` fix, dogfood script, pilot access doc, build status, tests, gate/envelope artifacts — **exclude** unrelated dirty tree (source-graph, process-cert, foreign fixtures).
- **H4 deferral:** PROC stub exists in `processes.md`; full **future-client playbook** (install refresh, golden policy doc) remains open — record in close-out tracker `deferred` if gates require explicit waiver.
- **H6:** Dogfood ran once; formal golden compare vs consultant summary is **pending** (not blocking platform MCP correctness if fixtures pass).

### Proof boundary (unchanged)

Workflow **H** does not certify target health, compliance, or business value. Chart Viewer remains `source_static` / `production_touch: none`.

---

## Evidence-based refinement findings (pass 2)

- Platform tools are **live**; integrated process evidence is **not**.
- Chart Viewer engagement close-out is **allowed** for its own REQ; **Workflow H platform REQ** close-out is separate.
- Six advisory envelope findings stay in meta-assessment / consultant actions — not claims-ledger rows (unchanged).

---

## Target architecture

Unchanged from pass 1 — see [PLAN-refine-pass1.md § Target architecture](./PLAN-refine-pass1.md#target-architecture).

---

## Acceptance criteria (delta)

Add to pass 1 list:

- **SC-CAM-LEDGER-FIELDS** — compose maps each claims-ledger row using `text` or `statement` without upgrading `claim_class` or inventing assertions.

---

## Implementation sequence (revised)

| Id | Track | Pass 2 status | Next action |
| --- | --- | --- | --- |
| **H0** | Pilot | **done** | Maintain audit if publish manifest changes |
| **H1** | Platform | **done** (`6577f890`) | LEAP pseudo-code if compose rules change |
| **H2** | Pilot | **done** (client uncommitted optional) | Sponsor commit in chartviewer repo |
| **H3–H5** | Platform | **done** (`6577f890`) | Follow-on: `statement` field + test (uncommitted) |
| **H4** | Platform | **deferred** | Playbook doc + install refresh + dogfood rerun |
| **H6** | Both | **partial** | Golden compare policy + optional diff report |
| **H5 gates** | Platform | **not_run** | Retroactive inquiry → verification → `@plan-close-out` |

---

## Costly vs reversible choices

| Choice | Consequence ladder |
| --- | --- |
| Ship RED before pre_impl gate (occurred at build-plan) | **Costly** — retroactive inquiry + honest handoff; do not claim process-complete without gates |
| Exclude unrelated dirty files from Workflow H commit | **Reversible** |
| Defer H4 full playbook to post-close-out | **Reversible** — must appear in tracker deferrals |
| Optional Chart Viewer commit of platform-generated CAM | **Reversible** — sponsor-owned repo |

---

## Plan (CITDP summary)

| Field | Value |
| --- | --- |
| `change_request_id` | `REQ-TIED_EDPC_CLIENT_ASSESSMENT` |
| `depth_tier` / `profile_depth` | `integrated` |
| `gate_policy` | `advisory` |
| Dependency | `REQ-TIED_EDPC_COMPREHENSION` + Slice D — **satisfied** (`a03bdb0f`) |
| Process debt | RED before pre_impl — retroactive gates required before close-out claim |
| Non-goals | Unchanged from pass 1 |

Full analysis: [CITDP-REQ-TIED_EDPC_CLIENT_ASSESSMENT.yaml](./CITDP-REQ-TIED_EDPC_CLIENT_ASSESSMENT.yaml) · persisted [citdp copy](../../../citdp/CITDP-REQ-TIED_EDPC_CLIENT_ASSESSMENT.yaml).

**Gate (Plan section):** `pre_implementation` **`allowed: false`** until tracker includes `sub-adversarial-inquiry-pass`, `gate-pseudocode-validation`, and identity-bound activation pairing. **Do not treat pass 2 Plan as authorization for new RED** — only for retroactive evidence and remaining H4/H6/H5 gates.

---

## Implement

### A. Immediate (uncommitted follow-on — no new MCP surface)

1. Stage LEAP: `statement`/`text` in [IMPL-TIED_EDPC_CLIENT_ASSESSMENT-pseudocode.md](../../../implementation-decisions/IMPL-TIED_EDPC_CLIENT_ASSESSMENT-pseudocode.md); `pseudocode_validate` `gate_mode: true`.
2. Run `npm run build --prefix mcp-server` and `npx tsx --test src/edpc/client-assessment-*.test.ts`.
3. Optional operator dogfood: `node mcp-server/scripts/dogfood-chartviewer-cam.mjs` (sponsor path in [chartviewer-pilot-access.md](./evidence/chartviewer-pilot-access.md)).

### B. Retroactive integrated gates (required before close-out claim)

1. `tied_adversarial_inquiry_run` for `pre_implementation`, `verification`, `close_out` (run_ids above); persist four artifacts per phase.
2. `tied_checklist_activation_collect` per phase; author `gate-tracker-pre-implementation.yaml`, `gate-tracker-verification.yaml`, `gate-tracker-close-out.yaml`.
3. `tied_checklist_gate_validate` for each phase until `close_out` **`allowed: true`**.
4. `node tools/bootstrap/templates/run-close-out-gates.mjs` with `--envelope-blocking --sync-dispositions --reconcile`.
5. `tied_validate_consistency` after any TIED YAML edits.

### C. Deferred (explicit)

- **H4** client playbook expansion (beyond PROC stub).
- **H6** golden Markdown compare vs consultant `technical-summary.v1.md`.
- Chart Viewer repo commits (sponsor scope).

**Build-plan:** Complete — do not re-invoke `@build-plan` for H3–H5 unless scope expands.

**Close-out:** `@plan-close-out` after section **B**; propose commit only — no agent commit in plan-close-out skill.
