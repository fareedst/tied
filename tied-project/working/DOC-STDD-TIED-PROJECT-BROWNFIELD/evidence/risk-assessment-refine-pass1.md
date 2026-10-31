# Risk assessment — refine pass 1

**Request token:** DOC-STDD-TIED-PROJECT-BROWNFIELD  
**Date:** 2026-10-31  
**profile_depth:** minimal · **gate_policy:** doc_comprehension_hygiene

| Id | Risk | Likelihood | Impact | Mitigation | Ladder |
| --- | --- | --- | --- | --- | --- |
| R1 | SCM misread as REQ authority | Medium | High | Publish gaps; corpus map states indexes win | Reversible narrative |
| R2 | Wrong dedupe deletes draft | Low | Medium | SHA-256 only; divergent keep; log | Costly if wrong — sponsor ack before bulk delete |
| R3 | Stale TIED_BASE_PATH env | Medium | High | `tied_config_get_base_path` each session | Reversible |
| R4 | Static read implies Implemented | Medium | High | Tier rules; tie status to `tied_verify` in map | Reversible |
| R5 | Envelope batch mis-scoped | Low | Low | Fixed 10-token sample; document gaps | Reversible |
| R6 | Accidental index YAML commit | Low | High | git diff gate in test strategy | Costly |

**Integrated inquiry:** Not enrolled (minimal DOC engagement).
