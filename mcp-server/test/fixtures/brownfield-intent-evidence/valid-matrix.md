# Intent elevation matrix — REQ-TIED_BROWNFIELD_INTENT_ELEVATION

**Baseline revision:** `abc123def`  
**Scope tokens:** REQ-TIED_BROWNFIELD_INTENT_ELEVATION, ARCH-TIED_BROWNFIELD_EVIDENCE_MODEL  
**Author / date:** fixture / 2026-10-13

---

## Matrix

| # | Claim | Source type | Location | Disposition | Confidence | Proof boundary | REQ/ARCH target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Validator returns receipt without YAML writes | test | mcp-server/src/brownfield-intent-evidence | approved | high | Does not prove all Markdown edge cases | REQ-TIED_BROWNFIELD_INTENT_ELEVATION |
| 2 | Observed behavior from legacy module | code | legacy/mod.rs | observed | medium | Static read only | |
