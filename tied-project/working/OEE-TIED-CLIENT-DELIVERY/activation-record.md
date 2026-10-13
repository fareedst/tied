# OEE activation — TIED client delivery

**OEE id:** OEE-TIED-CLIENT-DELIVERY  
**Date:** 2026-10-12  
**Author:** AI agent (pilot scaffold)

## Criteria met (§2)

- [x] **External workflow dependency** — Client teams and IDE agents follow multi-step bootstrap + YAML + checklist paths not fully captured in a single REQ.
- [x] **Undocumented behavioral contract** — Operators rely on `.cursor/mcp.json`, `TIED_BASE_PATH`, and skill prefixes; misconfiguration mutates the wrong `tied-project/` silently.
- [x] **High consumer / integration fan-out** — Many client repos inherit `tied-bundle/`; MCP tools, CLI, and agentstream share gate semantics.
- [ ] **Environmental stress dominates** — Partial (wrong base path, offline MCP); not primary for this pilot.
- [x] **Brownfield promotion risk** — Methodology refresh and layout migration change operator habit without always changing product code.
- [x] **Compatibility is costly** — Breaking MCP tool names, checklist slug contracts, or install layout affects fleet clients.

## Delegated envelope

Document external workflows and compatibility stances for methodology delivery surfaces. **No** production code or project REQ mutation in this pilot pass.

## Proof boundary

- **TIED can prove after build:** MCP/CLI behavior enrolled under existing `[REQ-*]` with tests in `mcp-server/`.
- **Requires business measurement:** Client adoption, IDE configuration correctness, operator time-to-green — outside this repo unless explicit cohort REQ exists.

## Related

- Spec: [tied-operating-environment-externalities.md](../../../docs/tied-operating-environment-externalities.md)
- Risk: CITDP RISK-010 (`TIED_BASE_PATH` cross-repo writes) — see `tied-project/citdp/` and AGENTS.md
- Future link (when enrolled): `REQ-TIED_LAYERED_CLIENT_INSTALL`, `REQ-TIED_CHECKLIST_GATE_ENFORCEMENT`
