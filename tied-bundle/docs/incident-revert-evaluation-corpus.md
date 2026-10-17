# Incident and revert evaluation corpus (Loop 3 guide)

**Audience:** Methodology owners, Kaizen operators, and sponsors curating **bounded** Loop 3 evidence after ship or review.

**Traceability:** [REQ-TIED_INCIDENT_REVERT_EVAL_CORPUS](../../tied-project/requirements/REQ-TIED_INCIDENT_REVERT_EVAL_CORPUS.yaml) · Claude comparison [Phase 4](../../docs/comparisons/claude-code-team-code-review-vs-tied.md#7-phased-approach-to-improving-tied-recommendations-only) · feedback **`fb-mvclklsa-t5gzbo`**

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| **Guide + example rows** for adding **confirmed post-merge incidents**, **reverts**, and **review false positives** to an **`evaluation-corpus.v1`** registry | Reopening closed QMM Batch 0–6 or W6 methodology YAML without a **new REQ** |
| Explicit **denominators**, **provenance**, **privacy tier**, and **pilot stop criteria** | Treating revert counts or Anthropic article metrics as universal TIED targets |
| Compose with [review-convergence-policy.md](review-convergence-policy.md) false-positive routing and Kaizen **operational observation** | New MCP gates, mandatory PR-bot evaluators, or auto-promotion to methodology experiments |
| Operator-local corpus under `working/evaluation/` (template in repo) | Exporting client secrets, absolute paths in **shareable_hashed** tiers without redaction |

This Phase 4 slice is **documentation + installable template**—not a new batch collector or cohort export service.

---

## Case kinds

| Kind | When to add | Minimum provenance |
| --- | --- | --- |
| **`post_merge_incident`** | Production or staging failure tied to a merged change with sponsor-confirmed scope | Merge ref, detection time, blast-radius summary, link to postmortem or Tracker handoff |
| **`revert`** | Change reverted (full or partial) with recorded reason | Revert commit/ref, original REQ or PR id, sponsor **costly choice** note if waived |
| **`review_false_positive`** | Automated or agent review finding confirmed **invalid** after human review | Finding text hash, reviewer disposition, link to [review convergence](review-convergence-policy.md) suppression row |

**Distinct from** a **historical defect proxy** alone ([fidelity-research](../../tied-project/vocab/fidelity-research.md)): raw revert labels without sponsor confirmation stay **out of corpus** until promoted to a **confirmed finding** narrative.

---

## Evaluation corpus rows

Use **`schema_version: "evaluation-corpus.v1"`** (see [quality-assurance](../../tied-project/vocab/quality-assurance.md) **evaluation corpus**).

| Field | Phase 4 guidance |
| --- | --- |
| `request_token` / `project_root` | Anchor row to the owning client REQ when the incident maps to one slice; use `class: methodology` rows for store-only pilots |
| `notes` | One-line **confirmed finding** summary—not article quotes |
| `execution_policy` | Prefer **`static_only`** for postmortem-only rows; **`live_ok`** only when re-run checks are ethical and bounded |
| `privacy_tier` | Default **`operator_local`**; **`shareable_hashed`** only after redaction review |
| `envelope_artifact` | Optional link to `request-evidence-envelope.v1.json` when the incident maps to a closed REQ |

**Starter template:** [evaluation-corpus-incident-revert-rows.v1.example.yaml](../templates/evaluation-corpus-incident-revert-rows.v1.example.yaml) · full multi-client template remains at `tied-project/working/evaluation/evaluation-corpus.v1.template.yaml` (operator copy).

Optional batch tooling (existing): `request-evidence-envelope-batch-collect` with corpus path—**does not** auto-ingest incidents; operators append rows deliberately.

---

## Pilot bounds and stop criteria

| Bound | Default |
| --- | --- |
| **Row cap** | **≤ 20** incident/revert/false-positive rows per pilot charter unless sponsor extends in CITDP |
| **Denominator** | Every rollup names population size (merged changes in window, review findings sampled, etc.) |
| **Stop** | Halt pilot when (a) cap reached, (b) two consecutive rows lack provenance, or (c) sponsor declares **costly choice** on promotion to methodology experiment |
| **Promotion** | Corpus rows feed **Kaizen analysis digest** / explicit **methodology learning experiment** bridge—never silent YAML promotion |

---

## Compose with closed Loop 3 programs

| Program | Phase 4 disposition |
| --- | --- |
| [QMM methodology learning plan](../../docs/tied-qmm-methodology-learning-plan.md) (closed W1–W5) | **Compose** machinery; **do not** reopen W6 |
| [Kaizen feedback loop plan](../../docs/tied-kaizen-feedback-loop-plan.md) | Route **review false positive** noise to **operational observation** first |
| [Review convergence policy](review-convergence-policy.md) | § Repeated-finding suppression → this corpus for sustained false positives |
| [Pre-handoff charter](pre-handoff-verification-charter.md) · [Sponsor risk-tier playbook](sponsor-risk-tier-playbook.md) | Incidents on high **depth_tier** slices require sponsor attention per playbook—not auto-waived |

---

## Operator workflow (minimal)

1. Copy example template or append rows to operator `working/evaluation/evaluation-corpus.v1.yaml`.
2. For each row, record **case kind**, **provenance**, and **denominator** context in `notes`.
3. After a pilot window, run Kaizen **feedback analysis digest** (when enabled) with explicit stop criteria.
4. Promote learnings via **new REQ** + CITDP—never from corpus rows alone.

**Cross-REQ:** [REQ-TIED_REVIEW_CONVERGENCE_POLICY](../../tied-project/requirements/REQ-TIED_REVIEW_CONVERGENCE_POLICY.yaml) · [REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER](../../tied-project/requirements/REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER.yaml) · [REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK](../../tied-project/requirements/REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK.yaml)
