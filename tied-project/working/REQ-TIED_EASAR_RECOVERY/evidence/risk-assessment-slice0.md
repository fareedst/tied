# Risk assessment — REQ-TIED_EASAR_RECOVERY (slice 0)

**Date:** 2026-10-17  
**depth_tier:** integrated · **gate_policy:** advisory

## Consequence ladder

| Choice | Class | Note |
| --- | --- | --- |
| BFIE mode + `engagement: easar_full` | reversible (confirmed C1) | No parallel `recovery_engagement.mode` |
| MVP slices 1–4 only | reversible (confirmed C2) | Slices 5–6 child plans |
| Integrated phase-aware gates | costly if skipped (C3) | Structural inquiry before Slice 1 RED |

## Counterexamples (CITDP-aligned)

- Inventory overstates coverage; matrix rows promoted without sponsor
- Reflexion merges adversarial ledger into claims ledger
- `easar_full` bypasses disposition rules or mutates project YAML from receipts
- Stale graph cited as high-confidence `code_graph` proof
- Scope creep ships SWE-QA or `recovery/` export in parent REQ

## Disposition

Proceed with enrollment + receipt library TDD; block Slice 1 RED until pre_implementation gate allows.
