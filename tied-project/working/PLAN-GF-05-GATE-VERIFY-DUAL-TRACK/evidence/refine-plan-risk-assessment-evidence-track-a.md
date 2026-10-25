# risk-assessment — refine-plan pass 3 (Track A)

**CITDP:** `CITDP-PLAN-GF-05-SCOPE-CLOSE-OUT-EXT`  
**Depth:** minimal · **gate_policy:** advisory · **eligibility_triggers:** none matched (persistence I/O is in-scope for minimal; no integrated waiver)

**Costly choices (disposition):**

| Choice | Disposition |
| --- | --- |
| Default persist **on** for `close_out` | **Accepted** — addresses GF-05 missing receipt |
| Opt-in persist only | **Rejected** |
| Persist all phases in one wave | **Deferred** — close_out default; pre_implementation/verification optional follow-on |
| New REQ mint in refine | **Deferred** — build-plan may doc-only extend existing tokens |

**Residual:** Track B closed (`ddb7ae14`); clients still need `--refresh` for checklist. Track A does not remove need for `checklist_gate` on `tied_verify`.

**Evidence owner:** store bootstrap + mcp-server gate-receipt tests.
