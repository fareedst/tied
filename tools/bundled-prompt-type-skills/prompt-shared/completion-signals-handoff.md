# Completion signals — parent handoff contract

**Tokens:** `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]`, `[REQ-REQUEST_EVIDENCE_ENVELOPE]`, `[PROC-AGENT_REQ_CHECKLIST]`

Every prompt type that reports implementation or close-out status must **separate three completion signals** in the parent handoff. Do not collapse them into “done” or “gate passed.”

## The three signals

| Signal | Question answered | Required evidence |
|---|---|---|
| **Machine close-out** | May this REQ close without blocking gaps? | `tied_checklist_gate_validate` `allowed: true` at the relevant phase **and** `request_evidence_envelope_validate` with `fail_on_error_gaps: true` (zero blocking error gaps). At integrated depth, process gaps also block when `fail_on_error_gaps` is true (Wave 6 default). |
| **Process contract** | Did baseline-functional steps run with typed refs? | Authoritative Tracker dispositions match `execution_evidence.completed`; verification manifest when test slugs completed; Layer C PSA reports when IMPL inventory non-empty; `sub-close-out-evidence-sync` completed before close-out gates. |
| **Adherence ledger** | Are slug outcomes hash-correlated? | `tied_adherence_reconcile_run` with `include_process_grade: true`; `outcome_verified` rows for completed slugs (or explicit thin-ledger waiver). |

## Workspace cleanliness (scoped REQ)

This is **not** a fourth completion signal. It clarifies what “workspace clean” means after a REQ or PLAN wave closes.

| Meaning | Pass for the active `request_token` | Does **not** require |
| --- | --- | --- |
| **Post-REQ workspace clean** | Scoped artifacts committed or classified in the staging map; regenerable noise for **that** REQ restored or deleted in the **same** close-out pass (gitignore hygiene, `tied_git_hygiene` preview, traceable-commit staging per [traceable-commit-close-out.md](traceable-commit-close-out.md)) | Entire repo free of unrelated REQ WIP, other trackers/CITDP drafts, or `tied-bundle/working/` gate JSON |
| **Feedback / PLAN ingest complete** | Store or client feedback row ingested with traceability | Whole monorepo clean — orthogonal REQ dirt is **expected** until those REQs close |

**`@clear-workspace`** is a **router / recovery** skill when close-out did not finish or scope is ambiguous — not a mandatory follow-on after a **complete** `@close-out` on a named REQ. See [clear-workspace-routing.md](clear-workspace-routing.md).

## Close-out completion pass (Wave 5)

When **machine close-out** passes early but **process contract** or **adherence ledger** is still partial, run the normative **completion pass** on the **same** `request_token` (not a new phase): sync dispositions, reconcile, rebuild/validate envelope, then re-check all three signals before EXIT.

**Operator reference:** [close-out-wave5-completion-pass.md](close-out-wave5-completion-pass.md) (handoff slug `close-out-wave5-completion`). **tied-yaml:** close-out recovery procedure in the bundled tied-yaml skill.

Do not claim **complete** until either all three signals pass or the handoff documents explicit waivers.

## Handoff template (copy into parent return)

```markdown
### Completion signals
- **Machine close-out:** {pass | fail | not_run} — gate {phase} allowed={true|false}; envelope validate fail_on_error_gaps={true|false} blocking_gaps={N}; envelope path={path or missing}
- **Process contract:** {pass | fail | partial} — dual-write={clear|present}; manifest={present|missing|n/a}; PSA Layer C={present|missing|n/a}; profile={present|missing|n/a}
- **Adherence ledger:** {pass | fail | not_run} — reconcile process_grade={band or n/a}; thin_ledger={clear|warn}
- **Workspace cleanliness (scoped REQ):** {pass | partial | n/a} — scoped staging/hygiene in same close-out pass={yes|no}; unrelated REQ/repo drift documented={yes|no}; @clear-workspace={not_needed|recovery_only|invoked}

### Remaining risks
- {open findings, waivers, deferred steps}
```

## Conversation rules

1. **Never claim “complete”** from gate success alone when integrated depth applies.
2. **Never claim “complete”** when the envelope is missing, stale, or has blocking gaps without documented waivers.
3. **`build-plan` and `tied-implement`** may hand off after verification gate but must label close-out as **deferred** until **`close-out`** runs unified close-out (including **traceable-commit** when gates allow).
4. **`close-out`, `leap-diff-promote`, `ammend-commit`** must run `sub-close-out-evidence-sync` (or `run-close-out-gates.mjs --envelope-blocking --sync-dispositions`) before completion claims.
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
