# R8 — Claude adherence hook bridge — not_applicable (re-probe)

**Slice:** R8 (program remainder — doc close-out only)  
**Re-probe date:** 2026-09-24  
**Authority:** [`PLAN.md`](../PLAN.md) · bootstrap ops B4 · [`SPIKE_CLAUDE_ADHERENCE_HOOKS`](../../../tied/implementation-decisions/IMPL-TIED_CLAUDE_BOOTSTRAP_OPS-pseudocode.md)

## Prior disposition (B4)

[`working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/evidence/adherence-spike-na.md`](../../REQ-TIED_CLAUDE_BOOTSTRAP_OPS/evidence/adherence-spike-na.md) recorded **not_applicable** on **2026-09-23** with residual **RISK-BOOT-005** ([`CITDP-REQ-TIED_CLAUDE_BOOTSTRAP_OPS`](../../../tied/citdp/CITDP-REQ-TIED_CLAUDE_BOOTSTRAP_OPS.yaml)).

## Re-probe findings (2026-09-24)

| Surface | Result |
| --- | --- |
| Repo **`.claude/hooks`** or Claude **`hooks.json`** install path | **Absent** — no tracked templates or bootstrap copy target |
| Bootstrap **`copyHooks`** ([`tools/bootstrap/lib/skills.mjs`](../../../tools/bootstrap/lib/skills.mjs)) | **Cursor-only** → `.cursor/hooks.json`; Claude bootstrap installs **`.claude/skills/`** + **`.mcp.json`** only |
| Comparison doc Phase 3 deliverable | Historical: bridge **only with stable upstream hook points** — not a shipped slice |
| Vocabulary **append-only bridge** ([`tied/vocab/agentstream.md`](../../../tied/vocab/agentstream.md)) | Documents **`.cursor/hooks`** + `adherence-append-action-attempted.js`; no Claude equivalent in repo |
| Public Claude Code hook contract (web) | No **version-stable, adherence-parity** hook API cited for automated ledger bridge in this re-probe |

## Disposition

**not_applicable** — R8 adds **no implementation**; upstream hook contract remains **unstable / undocumented** for TIED adherence reconciliation on Claude. Do **not** ship or document Claude adherence automation as complete.

## Residual risk

**RISK-BOOT-005** (unchanged): Interactive Prompt Composer on Claude stays outside automated adherence ledger until Anthropic (or Claude Code) publishes a stable hook surface and sponsor opens a **new REQ** via **`plan-new-feature`** (not R8 remainder).

## Sponsor re-open criteria

1. Documented, version-pinned Claude hook contract equivalent to Cursor **`.cursor/hooks.json`** + active-turn marker correlation.  
2. Bootstrap path (or operator doc) to install hook bridge without breaking dual-harness MCP/skills layout.  
3. Explicit **`plan-new-feature`** scope — **do not** implement bridge under R8 or closed **`REQ-TIED_CLAUDE_BOOTSTRAP_OPS`** satisfaction criteria without LEAP.

## LEAP trigger (if contract stabilizes later)

New REQ → IMPL bridge module mirroring Cursor append-only path; composition tests; comparison doc **Current** row; CITDP update — **stop at receipt** until sponsor approves feature REQ.
