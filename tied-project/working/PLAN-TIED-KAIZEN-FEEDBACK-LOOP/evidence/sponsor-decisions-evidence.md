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

## Reaffirmation — Phase 3 (2026-10-10, `/unblock`)

After QMM follow-on **(a)** (`REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE`) close-out, sponsor reaffirmed:

| Question | Answer |
| --- | --- |
| Reopen Kaizen Phase 3 transport because QMM W6 was waived or Loop 3 work continued? | **No — Phase 3 remains deferred** |
| Where recorded for follow-on context? | [`REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE/evidence/sponsor-decisions-evidence.md`](../../REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE/evidence/sponsor-decisions-evidence.md) |

QMM **W6 waived_at_program_close** is **not** Phase 3 implement and **not** a transport hinge reopen.

## Scoped export authorization — methodology experiments (2026-10-10)

Sponsor authorized **`shareable_hashed`** cross-client cohort export for **methodology learning experiments** only (QMM follow-on **(c)**). This does **not** change the Kaizen program default **`operator_local`** for operational feedback capture unless a future implement pass explicitly extends tier policy.

| Question | Answer |
| --- | --- |
| Enable `shareable_hashed` for methodology experiment cohort export? | **Yes** — see [`sponsor-authority-followon-c-shareable-hashed-20261010.md`](../../PLAN-TIED-QMM-METHODOLOGY-LEARNING/evidence/sponsor-authority-followon-c-shareable-hashed-20261010.md) |
| Redaction owner + expiry | **Required on follow-on (c) implement CITDP** before production export paths |
