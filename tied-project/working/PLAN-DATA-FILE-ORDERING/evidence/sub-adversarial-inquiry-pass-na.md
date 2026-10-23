# sub-adversarial-inquiry-pass — minimal depth (refine-plan)

**Request:** PLAN-DATA-FILE-ORDERING  
**Phase:** pre_implementation  
**depth_tier:** minimal  
**Date:** 2026-10-23

Integrated MCP `tied_adversarial_inquiry_run` was **not** invoked. At minimal depth this change extends an existing serialization REQ ([REQ-TIED_YAML_CANONICALIZATION](../../requirements/REQ-TIED_YAML_CANONICALIZATION.yaml)) with fixture-backed parity tests and documented counterexamples in CITDP.

Structural review at refine: ordered-key suffix `*_sequence` intentionally matches workflow keys such as `tdd_sequence`; JSON hash churn called out as costly choice in PLAN-refine-pass1.md.
