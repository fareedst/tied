# Process Adherence Evidence Grade Plan

**Status:** Implemented (Wave 5, W5-D1–D11; W5-D12/D13 deferred)  
**Parent:** [`methodology-closeout-integrity-plan.md`](methodology-closeout-integrity-plan.md) (Waves 1–4)  
**Primary tokens:** `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]`, `[REQ-REQUEST_EVIDENCE_ENVELOPE]`, `[REQ-QUALITY_ASSURANCE_EVIDENCE]`

## Three completion signals

| Signal | Meaning |
|---|---|
| **Machine close-out** | Gate `allowed: true` + envelope zero blocking `severity: error` gaps |
| **Process contract** | Baseline-functional step dispositions + typed evidence refs |
| **Adherence ledger** | `outcome_verified` rows correlating slugs to artifact hashes |

Never conflate these in skills, CHANGELOG, or completion claims.

## Wave ownership

| Artifact | Path |
|---|---|
| Tracker | `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/agent-req-implementation-checklist-wave5-process-adherence.yaml` |
| CITDP (draft) | `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/CITDP-wave5-process-adherence.yaml` |
| External fixture | `/Users/fareed/Documents/dev/test/1789087315` (replay only) |

## Deliverables (W5-D1–D11)

- **W5-D1–D3:** Envelope auto-detects `tracker_dual_write`, manifest missing, `evidence_stale` hash drift, `thin_ledger`
- **W5-D4:** `fail_on_process_gaps` on envelope validate
- **W5-D5–D8:** `sub-close-out-evidence-sync`, sync helper, gate runner flags, skill CALL contracts
- **W5-D9–D11:** Process grade rubric, evaluation corpus row, reconcile `process_grade` extension

## Process grade rubric

| Dimension | Weight | Full credit |
|---|---|---|
| Tracker integrity | 30% | Zero dual-write; every `execution_evidence.completed` slug has matching step disposition |
| Verification manifest | 25% | `verification-evidence-manifest.v1.json` when tests ran |
| Hash alignment | 20% | Consistent tracker hash across envelope, latest gate receipt, current tracker |
| Ledger correlation | 15% | ≥1 `outcome_verified` row per completed slug |
| Typed evidence refs | 10% | No generic-only refs |

| Band | Score | Interpretation |
|---|---|---|
| A | 90–100 | Process contract fully satisfied |
| B | 75–89 | Minor gaps only |
| C | 60–74 | Hollow baseline-functional evidence (fixture `1789087315` baseline) |
| D | &lt; 60 | Critical dual-write or missing manifest |

## Blocking policy (minimal depth default)

Process-adherence gaps default to **warn** unless `fail_on_process_gaps: true`. At integrated close-out, `fail_on_error_gaps: true` implicitly enables process-strict validate (Wave 6) unless `fail_on_process_gaps: false` is set explicitly. Structural and activation failures remain **error**.

## Producer contract (W5-D6)

Do **not** write `execution_evidence.completed` without updating matching `steps[].tracking.status` and typed `evidence_refs` in the same pass. Use `tools/bootstrap/templates/sync-tracker-dispositions.mjs` or CALL `sub-close-out-evidence-sync`.

## Verification commands

```bash
npm run build --prefix mcp-server
node --test mcp-server/dist/request-evidence-envelope/process-adherence-gaps.test.js
node --test mcp-server/dist/request-evidence-envelope/request-evidence-envelope.test.js
node --test mcp-server/dist/checklist-validator.test.js
go test ./tools/agentstream/checklist/... -count=1
go test ./tools/agentstream/cmd/adherence-reconcile/... -count=1
```

**Last updated:** 2026-09-10 (Wave 5 build-plan)
