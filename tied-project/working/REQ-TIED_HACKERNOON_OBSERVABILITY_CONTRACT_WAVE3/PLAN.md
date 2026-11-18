# Implementation plan — HackerNoon observability contract Wave 3 (intent + verify compose)

| Field | Value |
| --- | --- |
| **request_token** | `REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3` |
| **working_slug** | `REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3` |
| **Primary source** | [hackernoon-observability-contract-ci-vs-tied-agent-management.md](../../../docs/comparisons/hackernoon-observability-contract-ci-vs-tied-agent-management.md) |
| **Stub capture** | [hackernoon-observability-contract-ci.md](../../../docs/comparisons/hackernoon-observability-contract-ci.md) |
| **DOC outreach** | [DOC-HACKERNOON-OBSERVABILITY-CONTRACT-CI-COMPARISON](../DOC-HACKERNOON-OBSERVABILITY-CONTRACT-CI-COMPARISON/PLAN-refine-pass1.md) |
| **CITDP** | [CITDP-REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3.yaml](CITDP-REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3.yaml) |
| **Tracker** | [checklist-tracker.yaml](checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](test-strategy.md) |
| **IMPL draft (working)** | [IMPL-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3-pseudocode.md](IMPL-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3-pseudocode.md) |
| **depth_tier** | `minimal` |
| **gate_policy** | `advisory` |
| **methodology_surface_change_class** | `additive_ci` |
| **Operator interruption budget** | Opt-in receipt validator only; no global REQ scanning in v1 |
| **plan_phase** | `closed` |
| **program_phase** | `build-plan` (slices A–H, 2026-11-17) |

---

## 1. Refine (Touchpoint 1 — RESOLVE)

### Intent authority

- **Sponsor intent:** Wave 3 Phase **1** from HackerNoon × TIED: **intent + verify** literacy for implement-complete claims—compose guide, operator checklist, **doc contract test** (intent CI), **opt-in receipt validator** (verify CI), lightweight GitHub workflow—**without** Conftest/LGTM/OPA in stdd.
- **refine-plan resolution:** Matrix §2 row **21** **OutOfScope v1**; global enrollment **rejected**; workflow path scoped to receipt/compose tests only.
- **Pair-read:** [governance-sensing-proof-boundary-compose.md](../../../tied-bundle/docs/governance-sensing-proof-boundary-compose.md) (organizational odourless harm); this REQ owns **ops wiring / green-without-signal** on the delivery plane.

### RESOLVE table

| HackerNoon / informal | TIED preferred term / surface | Notes |
| --- | --- | --- |
| **Observability contract** | Implement-complete **receipt contract** | Compose + enrollment validator |
| **Observably dead** | Green chat / `tied_validate_consistency` without receipts | Anti-patterns |
| **CI intent gate** | Compose doc contract test | Slice F |
| **Nightly log audit** | `verification-evidence-manifest.v1.json` when `plan_phase: closed` | Slice G |
| **Conftest / Rego** | Client platform CI | **Defer** |
| **Fleet compliance story** | **HackerNoon-reported** / **`not_measured`** | Never TIED proof |

**PRELOAD:** [quality-assurance.md](../../vocab/quality-assurance.md), [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md), [pre-handoff-verification-charter.md](../../../tied-bundle/docs/pre-handoff-verification-charter.md).

**Compose authority:** `REQ-TIED_EXTERNAL_SERVICE_COMPARISON`, `REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER`, `REQ-TIED_HARNESS_PLATFORM_SEAM`; related `REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP`, `REQ-TIED_OPEN_GOVERNANCE_SENSING_WAVE3`.

### Consequence ladder (plan phase)

| Decision | Classification |
| --- | --- |
| Slices A–H doc/CI compose | **Reversible** |
| New GitHub workflow smoke | **Costly** — scoped paths only; sponsor-approved in add-feature |
| Global receipt validator | **Costly** — **rejected** v1 |
| Matrix §2 row 21 | **Costly** — **OutOfScope** v1 |
| Conftest in stdd | **Rejected** |

---

## 2. Compose-don't-replace contract

| Harness / outreach / CI literacy | Platform-adjacent authority |
| --- | --- |
| Intent vs verify tables; observably-dead catalog | `tied_checklist_gate_validate`, `tied_verify` |
| Receipt validator on **enrolled** REQ folders only | Gate receipts for implement-complete |
| HTOL optional pair-read | MCP YAML graph truth |
| Pre-handoff charter cross-links | Not merge or MCP gate automation |

---

## 3. Phased slices (build-plan)

### Slice A — `hackernoon-observability-contract-compose.md`

**Path:** `tied-bundle/docs/hackernoon-observability-contract-compose.md`

**Required H2 sections (contract test markers):**

| Section | Content |
| --- | --- |
| `## Proof boundary` | No Conftest/LGTM core; receipt CI ≠ gate authority |
| `## Scope slice` | TIED delivery vs client SRE fleet |
| `## Intent vs verify table` | Declared checklist/IMPL vs tests + manifest |
| `## Observably dead catalog` | healthz/CI/chat calm vs silent failure |
| `## Receipt contract schema` | Manifest fields; enrollment opt-in; handoff paths |
| `## Pair-read` | HackerNoon comparison, Open Governance compose, Netflix, pre-handoff, HTOL |
| `## CITDP prompt` | List **unwired proof** beside in-scope gates in change_definition |
| `## Anti-patterns` | Consistency-only close-out; Conftest as gate substitute |

### Slice B — Client development index

- **Quick reads** row: *HackerNoon observability contract × TIED intent/verify* → compose guide + comparisons.

### Slice C — `intent-verify-operator-checklist.md`

**Path:** this working folder (committed with REQ).

**Minimum rows:** CITDP start; before implement-complete; after green validate; before YAML write; optional HTOL batch — columns per Open Governance checklist pattern.

### Slice D — `citdp-policy.md` pointer

- One bullet: **intent vs verify** in change_definition (declare proof observability, not intent-only plans).

### Slice E — Comparison reciprocals

- HackerNoon analysis: Phase **1** **Implemented**; **Executable follow-up** → `REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3`.
- Stub **Notes** link to compose guide.

### Slice F — Intent CI (doc contract test)

- RED/GREEN: `tools/bootstrap/lib/hackernoon-observability-contract-compose-doc.test.mjs` (pattern: `governance-sensing-proof-boundary-compose-doc.test.mjs`).
- Asserts: REQ token, comparison links, `implement-complete-receipt-contract`, `not_measured`, pre-handoff charter.

### Slice G — Verify CI (receipt validator)

| File | Role |
| --- | --- |
| `tools/bootstrap/lib/implement-complete-receipt-contract.mjs` | Export `validateEnrolledCloseout(repoRoot, enrollmentPath)` |
| `tied-bundle/docs/schemas/implement-complete-receipt-enrollment.v1.json` | `schemaVersion`, `enrolled_request_tokens[]` (v1: this REQ only) |
| `tools/bootstrap/lib/implement-complete-receipt-contract.test.mjs` | Fixtures under `tools/bootstrap/fixtures/receipt-contract/` |

**Closeout rules (v1):**

1. For each token in enrollment, if `PLAN.md` contains `plan_phase: closed` (case-insensitive line match),
2. Require `evidence/verification-evidence-manifest.v1.json` with ≥1 `commands[]` entry (`command`, `exit_code`),
3. Require `evidence/session-handoff.md` to reference manifest path **or** a `gates/` receipt path **or** explicit `non-tied-close` / doc-only exception string in handoff.

**Non-goals v1:** Scan all `tied-project/working/REQ-*`; parse `tied_checklist_gate_validate` receipts.

### Slice H — GitHub workflow

- **Path:** `.github/workflows/observability-receipt-contract-smoke.yml`
- **on:** `pull_request` + `push` paths: compose guide, receipt lib/tests, hackernoon doc test, workflow file
- **job:** `node --test` both test modules (Node 22)
- **Evidence:** REQ working folder stores first green run URL or `workflow_dispatch` note in build-plan

### Slice I — Traceability

1. Mint REQ/ARCH/IMPL via TIED MCP (`tied_config_get_base_path` first).
2. Promote IMPL sidecar; `pseudocode_validate` gate_mode.
3. `tied_validate_consistency` at close-out.

### Slice J — Matrix §2 row

**OutOfScope v1** — draft in appendix only.

---

## 4. Draft satisfaction criteria (REQ index)

| ID | Criterion | Metric |
| --- | --- | --- |
| SC-HOC-GUIDE | Compose guide + doc test | `hackernoon-observability-contract-compose-doc.test.mjs` |
| SC-HOC-RECEIPT | Receipt validator + schema | `implement-complete-receipt-contract.test.mjs` |
| SC-HOC-CI | Workflow smoke | Workflow file + evidence note |
| SC-HOC-INDEX | Quick reads | Doc test link audit |
| SC-HOC-CHECKLIST | Operator checklist | File + link audit |
| SC-HOC-CITDP | Policy pointer | Doc test marker |
| SC-HOC-COMPOSE | Comparison reciprocals | Link audit |
| SC-HOC-TRACE | R+A+I graph | `tied_validate_consistency` |

---

## 5. refine-plan / build-plan boundary

**Completed (add-feature cursor plan + refine-plan pass 2):**

- PLAN slices A–J; CITDP wrapper; test-strategy; tracker; IMPL draft; refine gate note
- `pseudocode_validate` gate_mode — run after IMPL draft (see evidence)

**build-plan owns:** RED tests; mint R+A+I; slices A–H; persist CITDP to `tied-project/citdp/`; workflow; comparison reciprocals; `pre_implementation` gate retry.

**Do next:** `@build-plan`

---

## 6. Build-plan staging map

| Path | Slice |
| --- | --- |
| `tied-bundle/docs/hackernoon-observability-contract-compose.md` | A |
| `tied-bundle/docs/client-development-index.md` | B |
| `tied-project/working/REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3/intent-verify-operator-checklist.md` | C |
| `tied-bundle/docs/citdp-policy.md` | D |
| `docs/comparisons/hackernoon-observability-contract-ci*.md` | E |
| `tools/bootstrap/lib/hackernoon-observability-contract-compose-doc.test.mjs` | F |
| `tools/bootstrap/lib/implement-complete-receipt-contract.{mjs,test.mjs}` | G |
| `tied-bundle/docs/schemas/implement-complete-receipt-enrollment.v1.json` | G |
| `.github/workflows/observability-receipt-contract-smoke.yml` | H |
| `tied-project/requirements/` + architecture + implementation detail | I |

---

## Appendix A — Deferred matrix §2 row (draft)

*Do not implement without REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX LEAP.*

| # | Framework | Disposition | TIED COG (draft) |
| --- | --- | --- | --- |
| 21 | HackerNoon observability contract CI (intent/verify compose) | **Composable** | Receipt contract literacy vs gates; pair Netflix row 17 + Open Governance |