# PLAN — REQ-TIED_GATE_LEDGER_JSONL_PATH

**Sponsor intent:** Fix `lint_yaml -F tied-project` failure from misnamed P3 gate ledger; prevent recurrence.

**Scope:**

1. Rename `PLAN-TIED-LG-P3-TDD/evidence/gate-ledger.v1.yaml` → `gate-ledger.jsonl` (JSONL content unchanged except `source.path`).
2. Enforce `.jsonl` adherence ledger paths in `mcp-server/src/adherence-ledger.ts` (`assertJsonlLedgerPath`).

**Traceability:** [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT], [REQ-TIED_WORKING_ARTIFACT_PLACEMENT]

**depth_tier:** minimal
