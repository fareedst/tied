# Risk assessment — EASAR Slice 6

**REQ:** [REQ-TIED_EASAR_RECOVERY] · **depth_tier:** integrated · **gate_policy:** advisory  
**Date:** 2026-10-18

## Consequence ladder

| Decision | Classification |
| --- | --- |
| MVP six required portable slots + explicit gaps | Reversible |
| Default export under `tied-bundle/working/` | Reversible |
| MCP `tied_easar_recovery_export_build` vs script-only | Reversible |
| Copy full `docs/methodologies/` into export tree | **Costly** — forbidden |
| Commit repo-root `recovery/` | **Costly** — forbidden ([ARCH-TIED_EASAR_ARTIFACT_MODEL] portable-export-readonly) |
| Re-run program `close_out` after Slice 6 | **Costly** — default slice verification only |
| Blocking gate on full §6.2 completeness | **Costly** — forbidden |

## Integrated triggers

- MCP surface expansion (new export tool)
- Persistence of manifest under committed working evidence

## Counterexamples watched

- Export mutates TIED YAML indexes
- reflexion adapter merges finding-ledger body
- Silent empty files for missing canonical sources (must land in `errors[]` or `gaps[]`)
