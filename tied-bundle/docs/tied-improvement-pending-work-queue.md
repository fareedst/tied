# Primary TIED improvement and maintenance queue

**Audience:** Operators and sponsors tracking **cross-REQ improvement arcs**, deferred maintenance, methodology hygiene, and handoff follow-ups in one workspace.

**Traceability:** [REQ-TIED_IMPROVEMENT_PENDING_WORK_QUEUE](../../tied-project/requirements/REQ-TIED_IMPROVEMENT_PENDING_WORK_QUEUE.yaml)

**Authoritative method vs live data:** This guide is **committed methodology** (refreshed to clients via `tied-install`). The **live queue file is local-only** on each machine and is **not** synchronized, validated, or written by TIED MCP.

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| Operator **index** of improvement/maintenance work with stable **`TIQ-*`** row ids | Org-wide or git-published backlog |
| Links to **committed** detail under `tied-project/working/` (RESUMPTION, PLAN, handoffs) | Replacing per-REQ Tracker, CITDP, or checklist gates |
| Handoff/close-out **maintenance norms** (review, update status, link evidence) | MCP read/write of queue rows; mandatory `[PROC-*]` queue slug in v1 |
| Compose with [pre-handoff verification charter](pre-handoff-verification-charter.md) | MCP **`tied_backlog`** (REQ dependency/order views) or [LEAP proposal queue](../../tied-project/requirements/REQ-LEAP_PROPOSAL_QUEUE.yaml) |

Queue rows are **not** TIED YAML and do not carry canonical intent authority.

---

## Primary queue path

| Artifact | Path | Git |
| --- | --- | --- |
| **Live queue (private data)** | `tied-bundle/working/TIED-IMPROVEMENT-PENDING-WORK-QUEUE.md` | **Ignored** (store: `# BEGIN TIED STORE LOCAL WORKING`) |
| **This guide** | `tied-bundle/docs/tied-improvement-pending-work-queue.md` | Committed |
| **Bootstrap template** | `tied-bundle/templates/tied-improvement-pending-work-queue.v1.example.md` | Committed (example only) |

On clients, the entire `tied-bundle/working/` tree is typically ignored after install; the same relative path applies.

Copy the template when creating the live file; **preserve existing rows** when updating.

---

## Task schema

Header title: **Primary TIED Improvement and Maintenance Queue** (local operator index).

| Column | Purpose |
| --- | --- |
| `task_id` | Stable id, e.g. `TIQ-20261021-LANGCHAIN-HARNESS-ARC` (`TIQ-` + date + suffix) |
| `title` | Short label |
| `status` | `pending` \| `active` \| `blocked` \| `parked` \| `done` \| `cancelled` |
| `priority` | P0–P3 |
| `sponsor_band` | S0–S4 (see [sponsor risk-tier playbook](sponsor-risk-tier-playbook.md)) |
| `committed_detail` | Link(s) to RESUMPTION, PLAN, handoffs under `tied-project/working/` |
| `req_tokens` | Related REQs (informational) |
| `next_action` | One resumption line |
| `last_updated` | ISO date |

---

## Handoff and close-out maintenance

1. **Session handoff:** Review the queue; add or update cross-REQ arcs; set `last_updated`.
2. **Close-out:** Update row `status`; link close-out evidence paths; list remaining follow-ups; compose [pre-handoff verification charter](pre-handoff-verification-charter.md) checks. Confirm `git status` does **not** stage `tied-bundle/working/TIED-IMPROVEMENT-PENDING-WORK-QUEUE.md`.
3. **TIED tracking:** Link REQs and committed evidence in rows; a queue row is **not** a Tracker, CITDP, or gate receipt.
4. **Privacy:** No secrets in the queue file.
5. **No duplication:** Link committed arc docs (e.g. harness [RESUMPTION.md](../../tied-project/working/HARNESS-IMPROVEMENT-ARC/RESUMPTION.md)); do not paste full arc prose into the queue.

---

## Distinction from other backlog surfaces

| Surface | Role |
| --- | --- |
| [`tied next`](client-development-index.md) | Next **checklist slug** for an active REQ Tracker |
| MCP **`tied_backlog`** | REQ **dependency / order** views |
| [LEAP proposal queue](../../tied-project/requirements/REQ-LEAP_PROPOSAL_QUEUE.yaml) | Promotable methodology **diff proposals** |
| Committed arc docs (RESUMPTION, PLAN) | **Auditable facts** and resumption detail (stay in git) |
| **This queue** | **Private operator index** across improvement/maintenance arcs in **this workspace** |

---

## Related docs

- [Working artifact placement](working-artifact-placement.md) — commit vs ignore for `tied-project/working/` vs `tied-bundle/working/`
- [Client development index](client-development-index.md) — core seven and scenario entry
- [Pre-handoff verification charter](pre-handoff-verification-charter.md) — executable checks before handoff
