# Concept brief — manage TIED client operating environment

**Working title:** TIED client delivery externalities  
**Business purpose:** Reduce fleet risk when methodology, MCP, and agent workflows change while client operators depend on stable habits and paths.

**Desired capability:** Before behavior-changing methodology delivery work, maintain a register of **external workflows** (human + agent) and explicit **compatibility stances** so breaking changes are sponsor-visible.

**Non-goals:**

- Prove client business outcomes (revenue, SLA).
- Replace CITDP or the agent checklist for enrolled `[REQ-*]` work.
- Mandate OEE for trivial doc-only edits.

**Constraints:**

- Methodology under `tied-bundle/` remains read-only in clients ([PROC-TIED_METHODOLOGY_READONLY]).
- MCP writes only to client `tied-project/`.

**Stakeholders:**

- Sponsor: methodology maintainers (STDD)
- Service owner: MCP / agentstream / bootstrap tooling
- Reviewer: checklist gate owners
- Consumers: TIED client repo operators, IDE agents

**Success signals:**

- Pilot folder copied for at least one real client change program.
- Compatibility ledger cited in a PLAN.md or CITDP before a costly layout/MCP change.
- Zero silent cross-repo YAML writes attributed to wrong `TIED_BASE_PATH` in pilot review.

**Known dependencies:**

- `tied-install.sh`, `.cursor/skills/tied-yaml/`, `mcp-server/dist/index.js`
- `[PROC-AGENT_REQ_CHECKLIST]`, request evidence envelope (when Planned/enabled)

**Open costly choices:**

- Whether OEE activation becomes mandatory for methodology-surface changes (see methodology surface experiment gate).
