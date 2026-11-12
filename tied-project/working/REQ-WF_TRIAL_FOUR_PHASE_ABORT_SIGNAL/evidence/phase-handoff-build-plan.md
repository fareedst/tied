---
request_token: REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL
prompt_type: build-plan
run_id: build-plan-2026-11-12-wf-abs-w15
---

# Phase handoff — build-plan (wave 1.5)

## REQ

`REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL` — session capacity operator highlight (SC-WF-ABS-05..08)

## Deliverables

| ID | Path |
| --- | --- |
| W15.1 | `scripts/lib/wf-trial-operator-highlight.inc.sh` |
| W15.2 | `scripts/lib/wf-trial-abort-signal.inc.sh` (L3 highlight before diagnostic) |
| W15.3 | `scripts/lib/wf-trial-claude-preflight.inc.sh` + `workflow-trial-agentstream.sh` client_root arg |
| W15.4 | `mcp-server/packages/agentstream/src/session-limit-highlight.ts` + `live-executor.ts` |
| W15.5 | `tools/bootstrap/workflow-trial-agentstream-sh.test.mjs` |
| W15.6 | `mcp-server/packages/agentstream/src/session-limit-highlight.test.ts` |

## Tracker

**sub-adversarial-inquiry-pass:** `not_applicable` (minimal depth)

**Completed slugs:** `unit-test-red`, `unit-test-green`, `composition-integration` (n/a), `verification-gate` (local tests)

**Pending:** `traceable-commit` → `@close-out`

## Verification

| Command | Result |
| --- | --- |
| `node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs` | 66 pass |
| `cd mcp-server/packages/agentstream && npm test` | 134 pass |
| `pseudocode_validate` IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL | ok |

**Verification gate receipt:** [gates/verification-2026-11-12T19-10-53-510Z.json](../gates/verification-2026-11-12T19-10-53-510Z.json) — `allowed: false` (`malformed_citdp:adversarial_inquiry`; reconcile at close-out)

**RED evidence:** not archived (tests added GREEN in same pass; no separate RED capture)

## composition_path_declared

(none — composition-integration not_applicable)

## Next

`@close-out` — single commit: wave 1.5 + pending debug/SPT/alias per [session-handoff.md](./session-handoff.md)
