# Completion signals — parent handoff contract

**Tokens:** `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]`, `[REQ-REQUEST_EVIDENCE_ENVELOPE]`, `[PROC-AGENT_REQ_CHECKLIST]`

Every prompt type that reports implementation or close-out status must **separate three completion signals** in the parent handoff. Do not collapse them into “done” or “gate passed.”

## The three signals

| Signal | Question answered | Required evidence |
|---|---|---|
| **Machine close-out** | May this REQ close without blocking gaps? | `tied_checklist_gate_validate` `allowed: true` at the relevant phase **and** `request_evidence_envelope_validate` with `fail_on_error_gaps: true` (zero blocking error gaps). At integrated depth, process gaps also block when `fail_on_error_gaps` is true (Wave 6 default). |
| **Process contract** | Did baseline-functional steps run with typed refs? | Authoritative Tracker dispositions match `execution_evidence.completed`; verification manifest when test slugs completed; Layer C PSA reports when IMPL inventory non-empty; `sub-close-out-evidence-sync` completed before close-out gates. |
| **Adherence ledger** | Are slug outcomes hash-correlated? | `tied_adherence_reconcile_run` with `include_process_grade: true`; `outcome_verified` rows for completed slugs (or explicit thin-ledger waiver). |

## Handoff template (copy into parent return)

```markdown
### Completion signals
- **Machine close-out:** {pass | fail | not_run} — gate {phase} allowed={true|false}; envelope validate fail_on_error_gaps={true|false} blocking_gaps={N}; envelope path={path or missing}
- **Process contract:** {pass | fail | partial} — dual-write={clear|present}; manifest={present|missing|n/a}; PSA Layer C={present|missing|n/a}; profile={present|missing|n/a}
- **Adherence ledger:** {pass | fail | not_run} — reconcile process_grade={band or n/a}; thin_ledger={clear|warn}

### Remaining risks
- {open findings, waivers, deferred steps}
```

## Conversation rules

1. **Never claim “complete”** from gate success alone when integrated depth applies.
2. **Never claim “complete”** when the envelope is missing, stale, or has blocking gaps without documented waivers.
3. **`build-plan` and `tied-implement`** may hand off after verification gate but must label close-out as **deferred** until `plan-close-out` or `traceable-commit` runs unified close-out.
4. **`plan-close-out`, `leap-diff-promote`, `ammend-commit`** must run `sub-close-out-evidence-sync` (or `run-close-out-gates.mjs --envelope-blocking --sync-dispositions`) before completion claims.
5. When any signal is **fail** or **not_run**, label the work **incomplete** in the handoff.

## Canonical replay

```bash
node tools/bootstrap/templates/run-close-out-gates.mjs \
  --project-root /path/to/repo \
  --request-token REQ-EXAMPLE \
  --tracker-path working/REQ-EXAMPLE/agent-req-implementation-checklist.yaml \
  --citdp-path working/REQ-EXAMPLE/CITDP-....yaml \
  --phase close_out \
  --envelope-blocking \
  --sync-dispositions
```

At integrated depth, `--envelope-blocking` also enables process-strict envelope validate (Wave 6).
