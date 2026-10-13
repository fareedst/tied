# Touchpoint 3 — vocab VALIDATE ([PROC-VOCABULARY_INDEX])

**REQ:** REQ-TIED_BROWNFIELD_INTENT_ELEVATION  
**Date:** 2026-10-13

## Preferred terms (stable)

| Concept | Preferred term | Recorded in |
| --- | --- | --- |
| Sponsor-adjudicated promotion from evidence matrix | **intent elevation** | `tied-project/vocab/pseudocode-and-citdp.md` |
| Row table with dispositions / proof boundaries | **evidence matrix (intent elevation)** | same |
| Report-only MCP path | **brownfield_intent_evidence_validate** | REQ/ARCH/IMPL + `mcp-server` module |

## Audit

- No duplicate glossary entries for matrix/disposition contract names introduced in this tranche.
- Checklist metadata `brownfield_intent_elevation.mode` values (`report_only`, `pilot`, `strict`) align with `tied-bundle/docs/brownfield-intent-elevation.md` and PROC token.
- Semantic tokens REQ/ARCH/IMPL/PROC present in `tied-project/semantic-tokens.yaml` and referenced consistently in tests (`brownfield-intent-evidence`).

**Outcome:** VALIDATE pass — ready to stage per sponsor.
