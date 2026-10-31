# Risk assessment — PLAN-EDPC-META-HUB-ENGAGEMENT (refine pass 1)

**depth_tier:** minimal · **gate_policy:** doc_comprehension_hygiene

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Template fields not accepted by EDPC validators | Low | Medium | Validate against DOC charter; defer schema extension |
| Sponsors confuse comprehension with REQ authority | Medium | High | Reuse corpus-map “Authority rules” verbatim in new doc |
| Template obsolete after second dogfood | Medium | Low | `@citdp-promote` gate; version `v1` in filename |
| bounded_paths too narrow (miss hub) | Low | Medium | Require `tied-project` in every meta-hub charter example |

**Costly choices deferred:** REQ mint, vocab RECORD, MCP schema change, auto gap clearance in publish builder.
