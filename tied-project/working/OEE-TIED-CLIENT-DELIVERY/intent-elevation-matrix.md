# Intent elevation matrix — OEE-TIED-CLIENT-DELIVERY (sample)

**Baseline revision:** `b74d9548ffba11e44e081dbc055fe09824544497`  
**Scope:** Sample rows linking **external workflow register** claims to promotion targets. **Pilot only** — not an approved REQ pass.

Template: [tied-bundle/templates/brownfield-evidence-to-intent-matrix.md](../../../tied-bundle/templates/brownfield-evidence-to-intent-matrix.md)

## Legend

Dispositions follow [brownfield intent elevation](../../../tied-bundle/docs/brownfield-intent-elevation.md). Only `approved` rows may drive REQ criteria in a real enrollment.

## Matrix

| # | Claim | Source type | Location | Disposition | Confidence | Proof boundary | REQ/ARCH target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Session must confirm MCP base path before project YAML writes | help | `AGENTS.md` §1–2 | observed | high | Does not prove operators always run it | (future) `[REQ-TIED_*]` session bootstrap |
| 2 | Gate check composes checklist gate validate with Tracker + CITDP paths | test | `mcp-server` gate tests | observed | high | Does not prove all clients enable gates | `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]` |
| 3 | Wrong base path may write another project’s YAML | arch | CITDP RISK-010 references | approved | medium | Does not quantify fleet incident rate | ARCH/MCP docs — hinge: sponsor ack for pilot |
| 4 | agentstream receipts must not replace WF-003 gate receipts | help | `agentstream.md` cross-topic | observed | high | Does not prove CI never misconfigures | `[REQ-TIED_*]` harness docs |
| 5 | OEE register required before methodology-surface break | help | OEE spec §2 (draft) | rejected | — | Out of scope until `[REQ-TIED_OPERATING_ENVIRONMENT_EXTERNALITIES]` | — |

## Acceptance (pilot documentation)

- [x] 100% sample rows dispositioned
- [ ] ≥80% promoted REQ criteria map to IMPL block + evidence — **N/A** (no REQ promotion in pilot)
- [ ] Zero product behavior diffs — **N/A** (docs-only pilot)
