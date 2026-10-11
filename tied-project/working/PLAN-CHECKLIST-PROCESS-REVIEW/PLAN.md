# PLAN-CHECKLIST-PROCESS-REVIEW — active checklist and process review

## Planning status

Program orchestrator updated 2026-10-10. **Phase 1 complete** · **Phase 2 complete** · **Phase 3** batches CPR-F01–F03 complete. Phase 4 pending.
Handoff: [`evidence/session-handoff.md`](evidence/session-handoff.md) · Phase 2: [`REVIEW-20261010/evidence/session-handoff.md`](REVIEW-20261010/evidence/session-handoff.md) · REQ phase 1: [`../REQ-CHECKLIST-PROCESS-REVIEW/evidence/session-handoff.md`](../REQ-CHECKLIST-PROCESS-REVIEW/evidence/session-handoff.md)

**Linked plan:** `/Users/fareed/.cursor/plans/checklist-process-review_c5da706c.plan.md`  
**Documentation CITDP:** `tied-project/citdp/CITDP-PLAN-CHECKLIST-PROCESS-REVIEW.yaml`  
**Plan-only Tracker:** `checklist-tracker.yaml` in this folder

## RESOLVE — canonical vocabulary

| Sponsor wording | Canonical term | Resolution |
| --- | --- | --- |
| active checklist | **[PROC-AGENT_REQ_CHECKLIST]** executable YAML + Markdown mirror | Machine step order lives in `tied-bundle/docs/agent-req-implementation-checklist.yaml`; mirror explains steps |
| process review | **checklist/process review program** | Repeatable inventory + classification passes; not a substitute implementation workflow |
| generic review plan | **`docs/checklist-process-review-plan.md`** (phase 1 deliverable) | Operator procedure; created only after sponsor approves linked plan |
| reusable checklist | **`docs/checklist-process-review-checklist.md`** (phase 1 deliverable) | Sign-off oriented worksheet referencing authority rules |
| delete-candidate | **delete-candidate** lifecycle label | Requires inbound reference sweep evidence; never applied to ambiguous artifacts |
| canonical surface | **methodology read-only** `tied-bundle/` | Review may recommend changes; implementation requires methodology-surface enrollment |

RECORD of new glossary rows deferred to implement phase 1 if terms appear in shipped docs.

## Phased program (authority)

| Phase | ID | Authorized by | Outcome |
| --- | --- | --- | --- |
| 0 | Plan-only refine | `/refine-plan` | Linked plan + this folder + documentation CITDP |
| 1 | Deliverables | `/build-plan` + sponsor approval | Two generic docs under `docs/` |
| 2 | Inventory & review | `/build-plan` or operator | Findings ledger, disposition table, no deletes |
| 3 | Cleanup batches | Separate bounded `/build-plan` per batch | Reference-proof then delete/migrate |
| 4 | Methodology surface | `plan-new-feature` when review demands | Checklist/gate changes with W1/W2 enrollment |

## Costly-choice register (defaults until sponsor overrides)

| Decision | Default | Ladder |
| --- | --- | --- |
| Phase 1 scope | Prose deliverables only | Reversible |
| Canonical checklist mutation | Deferred to phase 4 | Costly |
| Bulk deletion | Forbidden without per-batch reference proof | Costly |
| Making review steps mandatory on every REQ | Forbidden | Costly |

## Next agent

1. Phases **1–2 done** — operator docs + [REVIEW-20261010/inventory-findings-ledger.md](REVIEW-20261010/inventory-findings-ledger.md).
2. Phase 3 CPR-F01–F03 done; optional `../tied/*` doc batch or `/plan-close-out` when sponsor ready.
3. Commit when sponsor requests; phase 1–2 artifacts remain **uncommitted** on disk unless close-out committed.
