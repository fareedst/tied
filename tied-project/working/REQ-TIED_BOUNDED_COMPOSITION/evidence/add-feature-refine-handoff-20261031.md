# add-feature refine handoff — REQ-TIED_BOUNDED_COMPOSITION (REQ-CTRL-008)

**Date:** 2026-10-31  
**Prompt type:** `@add-feature`  
**Invocation:** `REQ-TIED_BOUNDED_COMPOSITION (REQ-CTRL-008)`

## Refine (Touchpoint 1 — RESOLVE)

| Resolved term | Meaning |
| --- | --- |
| **REQ-CTRL-008** | Portable agent driver — at least two hosts can run the same canonical procedure (handoff §12 P1). |
| **REQ-TIED_BOUNDED_COMPOSITION** | Default-off bounded composition + **injectable AgentDriver** seam (`SC-BC-DRIVER`); maps to ICP gap matrix row for REQ-CTRL-008. |

**Ambiguity cleared:** This is **not** a greenfield feature request. Implementation and program close-out already completed **2026-10-18** (`aeb9be67`, `bc-closeout-20261018`). **45/45** bounded-composition unit tests pass on **2026-10-31**.

**Authoritative program record:** [session-handoff.md](./session-handoff.md) · [PLAN-CLOSE-OUT.md](../PLAN-CLOSE-OUT.md) · persisted [CITDP-REQ-TIED_BOUNDED_COMPOSITION.yaml](../../../citdp/CITDP-REQ-TIED_BOUNDED_COMPOSITION.yaml).

**Index drift:** Project `requirements.yaml` / detail still show **`status: Planned`** for REQ and IMPL rows despite close-out claiming **Implemented** / **Active** — requires **`tied_verify`** with valid **`checklist_gate`**, not manual index edits ([PROC-TIED_VERIFICATION_GATED]).

**depth_tier / gate_policy:** Reuse program defaults — **integrated** / **advisory** — unless sponsor opens a **minimal** reconcile-only CITDP (costly: weakens inquiry pairing for status promotion).

## Plan gate (blocked for fresh verify promotion)

`pre_implementation` is satisfied historically; **2026-10-31** replay of `tied_checklist_gate_validate` **`phase: verification`** with full persisted CITDP → **`allowed: false`** — `activation_pairing_incomplete` / `integrated_depth_requires_pairing` (integrated inquiry artifacts under `tied-bundle/working/REQ-TIED_BOUNDED_COMPOSITION/adversarial-inquiry/` not present in workspace).

Receipt: `tied-project/working/REQ-TIED_BOUNDED_COMPOSITION/gates/verification-2026-10-31T21-02-28-800Z.json`.

## What remains (REQ-CTRL-008 vs shipped BC)

| Item | Status |
| --- | --- |
| Six BC modules + seam + tests | **Shipped** |
| ICP gap matrix “Partial” for REQ-CTRL-008 | **Sponsor interpretation** — BC closes **driver seam**; full handoff wording (“two hosts, same procedure”) may need an explicit **Cursor + agentstream** composition doc/test slice (beyond `SC-BC-DRIVER` alone) |
| CITDP costly choice **C2** (external executor binaries) | **Deferred** — injectable descriptor only |
| TIED index status sync | **Open** — blocked on gate + fresh verification manifest |
| Regenerable inquiry artifacts | **Open** if integrated verify replay required |

## Option A — complete (2026-10-31)

| Step | Result |
| --- | --- |
| Integrated inquiry (verification) | `run_id=bc-add-feature-reconcile-20261031` under `tied-bundle/working/REQ-TIED_BOUNDED_COMPOSITION/adversarial-inquiry/phase-verification/` |
| PSA backfill | Six `IMPL-TIED_BOUNDED_*.v1.json` under `tied-bundle/working/.../pseudocode-analysis/` |
| Verification gate | **allowed** — [verification-gate-reconcile-20261031.json](./verification-gate-reconcile-20261031.json) |
| Manifest | [verification-evidence-manifest.v1.json](./verification-evidence-manifest.v1.json) @ commit `ac08900f` |
| `tied_verify` | **ok** — REQ **Implemented**, six IMPL **Active** — [tied-verify-reconcile-20261031.json](./tied-verify-reconcile-20261031.json) |
| Detail LEAP | REQ/IMPL detail `status` synced via MCP `yaml_detail_update` |
| ICP gap matrix | REQ-CTRL-008 row updated (C2 external executors still deferred) |

**Runner:** [run-reconcile-add-feature-20261031.mjs](./run-reconcile-add-feature-20261031.mjs)

**Note:** Envelope auto-patch logged `envelope_revision_conflict` (non-blocking); manifest written explicitly for CASE-002 provenance.
