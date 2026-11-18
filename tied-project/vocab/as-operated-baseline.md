# As-operated baseline (canonical)

**Scope:** TIED methodology enrollment for **Replacement Discovery Baseline** analysis slice (runbook phases **0–7** only). Distinct from **VRAI** and from replacement phases **8–11**.

**Traceability:** [replacement-discovery-baseline-runbook.md](../../docs/methodologies/replacement-discovery-baseline-runbook.md) · `[REQ-TIED_AS_OPERATED_BASELINE]` · `[REQ-TIED_BROWNFIELD_INTENT_ELEVATION]` · `[ARCH-TIED_AS_OPERATED_BASELINE]` · `[IMPL-TIED_AS_OPERATED_BASELINE]` · `[PROC-TIED_AS_OPERATED_BASELINE]` · `[PROC-AGENT_REQ_CHECKLIST]`

**See also:** [`routing.md`](routing.md) (row **2k**) · [`edpc-comprehension.md`](edpc-comprehension.md) (BFIE compose) · [`fidelity-research.md`](fidelity-research.md) (observed vs declared)

---

## Canonical terms

| Term | Definition |
| --- | --- |
| **VRAI** | Vocab + REQ + ARCH + IMPL in `tied-project/` — **design intent**, tests, and verification targets |
| **As-operated baseline** | Evidence package describing what the **implemented** system **controls** at boundaries: artifacts `00`–`09`, `replacement-discovery/registry/*.yaml`, runbook phases **0–7** |
| **RDB** | Replacement Discovery Baseline — generic methodology name; **not** a TIED semantic token prefix |
| **RDB record prefix** | `OUT`, `CAP`, `CON`, `EV`, etc. — registry IDs only; **not** `[REQ-*]` / `[ARCH-*]` |
| **Snapshot-A** | Partial as-operated tree at **`composition-integration`** checklist gate (active mode) |
| **Snapshot-B** | Full analysis gates **G-0–G-7**, **G-9** at **`verification-gate`** (active mode) |
| **`as_operated_baseline.mode`** | Tracker facet: `follow_up_only` (default) or `active` (mandatory snapshots) |

---

## Tracker facet (sketch)

```yaml
as_operated_baseline:
  mode: follow_up_only  # or active
  working_root: "tied-project/working/{REQ-TOKEN}/replacement-discovery"
  snapshot_gates:
    - slug: composition-integration
      receipt: "tied-project/working/{REQ-TOKEN}/evidence/rdb-snapshot-composition-integration-receipt.v1.json"
    - slug: verification-gate
      receipt: "tied-project/working/{REQ-TOKEN}/evidence/rdb-snapshot-pre-verification-gate-receipt.v1.json"
```

---

## Authority rules

1. **VRAI wins** for product intent and `tied_verify` targets.
2. **As-operated** wins for **observed** boundary behavior and operational monitoring narratives.
3. **BFIE** alone may promote observed rows toward REQ text; default on RDB snapshots is `observed` / `report_only`.
4. Phases **8–11** and artifacts **10–13** are **forbidden** as completion criteria for `[REQ-TIED_AS_OPERATED_BASELINE]`.

---

## Layout

```text
tied-project/working/{REQ-TOKEN}/
  replacement-discovery/
    00-mission-boundary-and-assumptions.md
    …
    09-evidence-uncertainties-and-questions.md
    registry/*.yaml
  evidence/rdb-snapshot-*.v1.json
```

Registry **shapes** inherit store dogfood [DOC-TIED-RDB-ANALYSIS](../../working/DOC-TIED-RDB-ANALYSIS/replacement-discovery/registry/) — do not fork field names.

---

## EDPC / BFIE compose

When EDPC engagement is active, **compose** paths to claims ledger and SCM shell; do not duplicate BFIE matrix bodies inside every registry file. RDB snapshots remain evidence inputs, not substituted VRAI.

---

## Alphabetical index

| Term | Section |
|------|---------|
| As-operated baseline | Canonical terms |
| as_operated_baseline.mode | Canonical terms |
| BFIE | Authority rules; EDPC / BFIE compose |
| follow_up_only | Tracker facet (sketch) |
| RDB | Canonical terms |
| RDB record prefix | Canonical terms |
| Snapshot-A | Canonical terms |
| Snapshot-B | Canonical terms |
| VRAI | Canonical terms; Authority rules |