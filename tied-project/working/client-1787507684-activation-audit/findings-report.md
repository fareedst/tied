# Client 1787507684 — activation findings report

**Generated:** 2026-08-23 (America/Los_Angeles)
**Request:** `REQ-ROOTJOBS` — Go root-jobs process tree CLI
**Project root:** `/Users/fareed/Documents/dev/test/1787507684`
**Commit:** `a83f729`
**Reviewer:** agent (read-only audit)

Structured YAML: [`findings-report.yaml`](findings-report.yaml)
Finding ledger: [`finding-ledger.jsonl`](finding-ledger.jsonl)
MCP metrics extract: [`tied-mcp-metrics-client-1787507684.jsonl`](tied-mcp-metrics-client-1787507684.jsonl)

---

## Executive summary

Client `1787507684` completed a full checklist pass for a greenfield CLI feature with **strong minimal-tier adversarial thinking** and **solid feature delivery evidence**, but **no integrated adversarial-inquiry activation**. That outcome is **valid** under the CITDP selection of `depth_tier: minimal` and a documented `integrated_waiver` (approval: plan-refine, expiry 2026-09-23).

Two **checklist integrity** findings (f007, f010) indicate disposition drift that Batch 2 gate enforcement should address — they do not invalidate the feature work itself.

| Verdict | Status |
|---------|--------|
| Minimal adversarial thinking | **Present** |
| Integrated activation evidence | **Absent** (expected at minimal) |
| Feature delivery evidence | **Present** |
| Checklist integrity | **Degraded** |

---

## Activation matrix

| Signal | Required (minimal) | Observed |
|--------|-------------------|----------|
| `depth_tier` | minimal | minimal |
| Counterexamples CE-001..003 | yes | yes (CITDP + tests) |
| Falsification questions | yes | yes |
| `tied_adversarial_inquiry_run` | no | **0 calls** |
| Four-artifact bundle | no | **all missing** |
| `go test ./...` | yes | **pass** |
| `tied_validate_consistency` | yes | **2× ok (MCP)** |

---

## Findings

### Confirmed — adversarial thinking (minimal tier)

**f001 — Minimal adversarial spec present** (info, human_decision)
CITDP captures CE-001..CE-003, falsification questions, disconfirming observations, and non-goals. Evidence: `tied/citdp/CITDP-REQ-ROOTJOBS.yaml`.

**f002 — Counterexamples encoded in unit tests** (info, executable_behavior)
`tree_test.go` tests orphan-as-root (CE-001), PID sort (CE-002), and empty input (CE-003) with `[REQ-*]` / `[IMPL-*]` token comments.

**f003 — Integrated inquiry waived** (info, human_decision)
`integrated_waiver` records plan-refine approval; rationale states integrated MCP inquiry not required for this local read-only CLI.

### Confirmed — integrated activation absent

**f004 — Artifact bundle missing** (warn, semantic_fidelity)
No `working/REQ-ROOTJOBS/adversarial-inquiry/` directory. Missing: `obligation-report.json`, `finding-ledger.jsonl`, `gate-result.json`, `evidence-provenance.json`.

**f005 — Zero MCP inquiry calls** (warn, traceability_structure)
Client-scoped metrics: 7 rows total; `tied_adversarial_inquiry_run` count = 0.

**f006 — Operator smoke not run** (info, human_decision)
Checklist `execution_evidence.operator_evidence.status: not_run` for `@/tmp/inquiry-smoke.json`.

### Confirmed — delivery evidence

**f008 — Feature delivery evidence present** (info, executable_behavior)
- `cd tools/rootjobs && go test ./...` — pass (re-verified 2026-08-23)
- CITDP `quality_evidence_matrix` baseline-functional → `result: passed`
- MCP `tied_validate_consistency` ×2 — ok

### Checklist integrity gaps

**f007 — Sub-stub pending vs parents completed** (error, pseudo_code_structure)
`sub-adversarial-inquiry-pass` tracking `status: pending`, while callers (`gate-pseudocode-validation`, `verification-gate`, `traceable-commit`) are `completed`. At minimal depth the sub-stub should be `not_applicable` or `waived`, not pending behind completed parents.

**f010 — Traceable commit deferred** (warn, human_decision)
`execution_evidence.completed` includes `traceable-commit`, but `close_out_evidence.deferred` lists git commit deferred to operator.

### Observed — instrumentation limits

**f009 — No evidence-chain profile** (info, traceability_structure)
No `working/evidence-chain/`; no `evidence_chain_profile_generate` MCP calls.

**f011 — Thin MCP footprint** (info, traceability_structure)
7 metric rows vs 85 for pilot client `1787461685` (~8%). Most TDD/TIED work likely occurred outside instrumented MCP.

---

## MCP tool breakdown (7 rows)

| Tool | Count |
|------|------:|
| `tied_config_get_base_path` | 4 |
| `tied_validate_consistency` | 2 |
| `tied_checklist_gate_validate` | 1 |

Window: 2026-08-23T17:56–18:25Z (from metrics timestamps).

---

## Residual risks

1. **Integrated activation cannot be claimed** without re-run at `depth_tier: integrated` or `strict_candidate`.
2. **Checklist disposition drift** (f007, f010) weakens fail-closed gate trust until Batch 2 enforcement ships.
3. **Thin MCP instrumentation** limits deferred-stats observability for this pass.

---

## Recommendations

### Accept minimal (default for this client)

Treat client `1787507684` as **valid minimal activation** — same class as client `1787503424` in [`docs/integrated-activation-checklist-enforcement-plan.md`](../../docs/integrated-activation-checklist-enforcement-plan.md). Do **not** retroactively fail.

### Re-run integrated (if H5 pilot or Batch 2 calibration needs it)

1. Set `depth_tier: integrated`, `prior_depth_tier: minimal` in CITDP.
2. Run `tied_adversarial_inquiry_run` at `pre_implementation`, `verification`, and `close_out` (distinct `run_id` per phase).
3. Persist four artifacts under `working/REQ-ROOTJOBS/adversarial-inquiry/`.

### Fix checklist integrity (regression fixture)

1. Mark `sub-adversarial-inquiry-pass` `not_applicable` with minimal-depth rationale.
2. Align `traceable-commit` disposition with deferred git commit (completed vs pending/deferred).

---

## Provenance

- Observation record: [`observation-record.yaml`](observation-record.yaml)
- Metrics summary: [`metrics-summary.yaml`](metrics-summary.yaml)
- Related pilot: [`working/REQ-DEFERRED_STATS_ROADMAP/v1-observation/`](../REQ-DEFERRED_STATS_ROADMAP/v1-observation/)
- Enforcement plan: [`docs/integrated-activation-checklist-enforcement-plan.md`](../../docs/integrated-activation-checklist-enforcement-plan.md)
