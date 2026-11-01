# Risk assessment — REQ-TIED_META_HUB_REPRESENTATION (refine pass 1)

**Date:** 2026-11-01  
**depth_tier:** minimal · **gate_policy:** advisory

| Id | Risk | Likelihood | Impact | Mitigation | Ladder |
| --- | --- | --- | --- | --- | --- |
| R1 | Reconcile `--apply` overwrites newer canonical CITDP | Medium | High | mtime winner; `structural_conflict` fail closed; dry-run ledger; traceable commit | **Costly** — sponsor ack before apply |
| R2 | Slice basename family (checklist gate) wrong persist target | Medium | Medium | Policy table in PLAN-refine-pass1; per-row disposition in ledger | **Costly** |
| R3 | Operators confuse corpus map with Implemented status | Low | Medium | comprehension-gap-backlog + EDPC G7 semantics | Reversible |
| R4 | MCP apply flag mutates wrong repo (TIED_BASE_PATH) | Low | High | Hub path guard; session `tied_config_get_base_path` check | Reversible |
| R5 | Store-wide `tied_validate_consistency` unrelated failures block close-out | Medium | Low | Scope verify to REQ tests + envelope; document debt | Reversible |
| R6 | Working CITDP deleted while divergent content still needed | Low | Medium | Ledger `delete_working_after_persist` only after successful citdp write | Reversible |

**Adversarial falsification (minimal tier):**

- Apply must not change `requirements.yaml` — verify with git diff scope in close-out.
- No `structural_conflict` row applied without `force_disposition`.
