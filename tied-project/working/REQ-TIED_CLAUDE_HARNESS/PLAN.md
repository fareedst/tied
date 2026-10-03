# Claude Code multi-harness — linked plan

| Field | Value |
| --- | --- |
| **REQ** | [REQ-TIED_CLAUDE_HARNESS](../../tied/requirements/REQ-TIED_CLAUDE_HARNESS.yaml) (**Implemented** — Phases 0–3 closed 2026-09-23) |
| **program_phase** | **`closed`** (Tracker + plan-close-out 2026-09-23) |
| **ARCH** | [ARCH-TIED_CLAUDE_HARNESS](../../tied/architecture-decisions/ARCH-TIED_CLAUDE_HARNESS.yaml) |
| **IMPL** | [IMPL-TIED_CLAUDE_HARNESS](../../tied/implementation-decisions/IMPL-TIED_CLAUDE_HARNESS.yaml) · [pseudo-code](../../tied/implementation-decisions/IMPL-TIED_CLAUDE_HARNESS-pseudocode.md) |
| **CITDP** | [CITDP-REQ-TIED_CLAUDE_HARNESS](../../tied/citdp/CITDP-REQ-TIED_CLAUDE_HARNESS.yaml) |
| **Tracker** | [checklist-tracker.yaml](./checklist-tracker.yaml) |
| **Comparison source** | [claude-code-tied-multi-harness-plan.md](../../docs/comparisons/claude-code-tied-multi-harness-plan.md) (sponsor decision log 2026-09-23) |
| **profile_depth** | **`integrated`** |
| **gate_policy** | `advisory` |

---

## Goal

Deliver **Claude Code parity** for TIED client bootstrap and checklist automation in one **REQ-TIED_CLAUDE_HARNESS** arc (Phases **0→3**), without forking Prompt Composer taxonomy or replacing **AGENTS.md** as canonical obligations.

## Non-goals

- PLAN.md-only state replacing project `tied/` YAML
- Parallel requirements/architecture/review skill taxonomy
- `--agent-path` as Claude adapter
- Live Claude checklist before fixture gates
- Changing Cursor `.cursor/mcp.json` create-only preservation policy

## Operating modes (explicit)

| Mode | Entry | Evidence accepted for automation |
| --- | --- | --- |
| Interactive **Prompt Composer** | `/plan-new-feature`, `/build-plan`, … | MCP/`tied-cli` writes; **not** agentstream receipts |
| Semi-automated | Same skills + manual Tracker | Manual Tracker slugs |
| **tied agentstream** | `tied agentstream … --checklist-tracker-yaml …` | Tracker receipts + driver contracts |

## Phased delivery

| Phase | Focus | Status (2026-09-23) |
| --- | --- | --- |
| **0** | Pilot discovery (temp skill copy, gap list, fixture contracts) | **Done** — `phase0/` artifacts |
| **1** | Dual bootstrap: `.claude/skills/`, `.mcp.json` safe merge, harness metrics, optional `CLAUDE.md` | **Done** — unit + composition tests green; README |
| **2** | `--harness claude` **AgentDriver** (not `--agent-path`) | **GREEN (slice 3)** — `SELECT_AGENT_HARNESS` + dry-run `--harness` wiring; live Claude still fixture-gated |
| **3** | **client-development-index** REQ vs FEAT matrix | **Done (slice 4)** — `## Multi-harness entry matrix (Cursor vs Claude Code)` in [client-development-index.md](../../tied/docs/client-development-index.md) |

## Next build-plan slices

1. ~~**Phase 3** — client-development-index REQ vs FEAT matrix row.~~ **Delivered 2026-09-23 (slice 4).**
2. **Integrated MCP inquiry** — run `tied_adversarial_inquiry_run` when Mode B supports TypeScript paths (or supply obligation graph); restore `depth_tier: integrated` pairing for close-out.
3. **Live Claude AgentDriver** — frozen stream oracles + subprocess fixtures before enabling checklist automation.

---

**program_phase (Tracker):** `close-out-pending` — Phases 0–3 delivered; `traceable-commit` and `sub-close-out-evidence-sync` remain.

**Authoritative process record:** project TIED YAML + **Authoritative Tracker** — not this file alone.
