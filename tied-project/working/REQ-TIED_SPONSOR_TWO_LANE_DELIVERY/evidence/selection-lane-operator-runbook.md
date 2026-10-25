# Selection lane operator runbook — REQ-TIED_SPONSOR_TWO_LANE_DELIVERY

**Purpose:** Unblock selection-lane sponsor preference by attaching **implemented** evidence before verification.

## Before verification-gate

1. List each **selectable option** (not hypotheticals).
2. For each option, add at least one **`selection_evidence`** ref:
   - `kind: test_id` → green test name or file (e.g. `T-TLD-06`)
   - `kind: demo_path` → committed doc or script under repo
   - `kind: gate_receipt` → verification gate JSON path
   - `kind: feature_flag` → config key that toggles the shipped behavior
3. Record rows on working CITDP **`sponsor_selection_backlog`** (see `operator_selection_lane_example` in [CITDP-REQ-TIED_SPONSOR_TWO_LANE_DELIVERY.yaml](../CITDP-REQ-TIED_SPONSOR_TWO_LANE_DELIVERY.yaml)).

## At verification-gate

- Run **`VALIDATE_SELECTION_EVIDENCE`** (checklist step 0b): missing refs → **`selection_evidence_missing`** warn; defer preference until refs exist.
- Use MCP **`tied_sponsor_questions`** with lane filter; confirm selection rows include **`selection_evidence`**.

## Worked example (this REQ)

| Option | Evidence |
| --- | --- |
| MCP lane metadata shipped | `T-TLD-06`, `project-operations-mcp.test.ts` |

## Mid-lane deferral (policy)

**Warn-only is intentional** (PLAN costly-choice reject). Treat **`mid_lane_sponsor_deferral`** diagnostics as backlog review signals — not a gate failure at advisory depth. Hard-block requires a **new REQ** and non-advisory `gate_policy`.
