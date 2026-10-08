# sponsor-decisions

Request: `PLAN-TIED-KAIZEN-FEEDBACK-LOOP`

Sponsor recorded answers to the three costly choices on **2026-10-07**:

| Question | Answer |
|---|---|
| First behavior-changing request: local append and export only, no upstream transport? | Yes |
| Privacy tier `operator_local` until named owner and expiry for `shareable_hashed`? | Yes |
| Three **feedback entry types** with **observation kind** additive (no fourth type in first contract)? | Yes |

Artifacts updated:

- `docs/tied-kaizen-feedback-loop-plan.md` — Refine *Sponsor decisions (costly choices)* and *Sponsor decisions (recorded)*
- `tied-project/citdp/CITDP-PLAN-TIED-KAIZEN-FEEDBACK-LOOP.yaml` — `sponsor_decisions` block
- `tied-project/vocab/feedback-to-tied.md` — planning decisions cross-link

Proof boundary: planning and CITDP only. Does not implement transport, privacy enforcement, or new store fields.

## Follow-up — transport hinge (2026-10-07)

After Phase 2 close-out, sponsor confirmed:

| Question | Answer |
| --- | --- |
| Reopen upstream transport (Phase 3) now? | **No** — keep hinge closed |
| How to proceed? | Finish **Phases 4–7** (analysis → review → outcome → pilot) on **local append + export only** |
| When to reopen Phase 3? | When sponsor records a **hinge reopen** on CITDP with named **recipient** and **channel** |

Recorded on: [`kaizen-program-execution-checklist.yaml`](../kaizen-program-execution-checklist.yaml) (`agent_handoff.sponsor_confirmations`).

## Reaffirmation — Phase 3 (2026-10-08)

Sponsor reviewed Phase 3 options (transport / notification / outbox) and chose **Option A — keep Phase 3 closed**.

| Question | Answer |
| --- | --- |
| Reopen Phase 3 (`REQ-KAIZEN-FEEDBACK-OUTBOX`) or add upstream delivery? | **No** — remain on local append, receipt, export, and MCP tools only |
| Notification policy / outbox / webhook work? | **Deferred** until an explicit future hinge reopen (recipient + channel on CITDP) |
| Privacy for this decision | Unchanged — **`operator_local`** default; no `shareable_hashed` without separate owner + expiry |

Agents: do not CALL `plan-new-feature` for Phase 3 unless sponsor submits a new change request that reopens the transport hinge.
