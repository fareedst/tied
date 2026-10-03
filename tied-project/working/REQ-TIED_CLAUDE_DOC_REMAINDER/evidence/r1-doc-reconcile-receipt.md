# R1 — comparison doc reconcile receipt

**Date:** 2026-09-24  
**Slice:** R1 (doc-only)  
**Primary deliverable:** [`docs/comparisons/claude-code-tied-multi-harness-plan.md`](../../../docs/comparisons/claude-code-tied-multi-harness-plan.md)

## Validation sources (manual cross-check)

| Source | Checked |
| --- | --- |
| [`tools/bootstrap/README.md`](../../../tools/bootstrap/README.md) § Claude Code harness, `TIED_SKILLS_REROOT=1`, Windows CI | ✅ copy-default, optional re-root, `WINDOWS_COPY_PROVEN_IN_CI` |
| [`tools/bootstrap/lib/constants.mjs`](../../../tools/bootstrap/lib/constants.mjs) | ✅ `WINDOWS_COPY_PROVEN_IN_CI = true` |
| [`mcp-server/packages/agentstream/README.md`](../../../mcp-server/packages/agentstream/README.md) | ✅ `--harness claude`, operator live gate |
| [`fixtures/claude/README.md`](../../../mcp-server/packages/agentstream/fixtures/claude/README.md) | ✅ CLI pin **2.1.273** (R7) |
| Closed REQ YAML | ✅ `REQ-TIED_CLAUDE_HARNESS`, `REQ-TIED_CLAUDE_BOOTSTRAP_OPS`, `REQ-TIED_CLAUDE_LIVE_DRIVER`, `REQ-TIED_CLAUDE_SKILLS_REROOT` status **Implemented** |

## Sections reviewed (stale → fixed)

| Section | Stale signal | Fix |
| --- | --- | --- |
| **Status** (header) | Implied open follow-on / broad **Proposed** | All closed REQs + **R1–R8** remainder closed; **Proposed** = future sponsor REQ only |
| **What remains** | R1 still open | Program **closed** narrative; R1 ✅ with this receipt |
| **Post–Phases 0–3** Phase 3 row | B3 defer OK | **R3/B3** green; `TIED_SKILLS_REROOT=1` optional |
| **Target architecture** diagram | `skills/` optional B3 deferred | Optional **`TIED_SKILLS_REROOT=1`**, default off |
| **Skill portability** Step B | Deferred (B3 / R3) | **Current** opt-in per **`REQ-TIED_CLAUDE_SKILLS_REROOT`** |
| **Phased delivery** archive intro | Forward work pointer | Maintenance pointers only |
| **Phase 3** heading | “B3 deferred” | Removed; historical closed |
| **Implementation entry** | Forward remainder / new REQ for R3 | **Maintenance only** entry table |
| **TIED stack boundary** | B3/R3 deferred | R3 shipped; bootstrap row updated |
| **Open discovery** | B3 needs new REQ; B3 still R3 | R3 complete; strikethrough rows |

## Remainder evidence cited (R2–R8)

| Slice | Receipt |
| --- | --- |
| R5 | [`operator-live-claude-smoke-r5.md`](operator-live-claude-smoke-r5.md) |
| R6 | [`operator-interactive-claude-ide-r6.md`](operator-interactive-claude-ide-r6.md) |
| R7 | [`r7-cli-oracle-capture-receipt.md`](r7-cli-oracle-capture-receipt.md) |
| R8 | [`r8-adherence-hook-bridge-na.md`](r8-adherence-hook-bridge-na.md) · **RISK-BOOT-005** |

## Residual doc debt (honest)

- **Interactive Claude IDE:** R6 runbook only — no claim of human IDE session success.
- **Claude adherence automation:** R8 **N/A** — Cursor hooks only; no `.claude/hooks` bridge shipped.
- **Operator live Claude:** R5 preflight complete; live subprocess not run in CI/build-agent env.
