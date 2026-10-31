# PLAN-EVALUATION-ENVELOPE-CORPUS-FULL

**Scope:** Close brownfield gap `process:envelope_sample_ten_tokens_not_full_corpus` (G5) — batch visibility across **all** store `tied-project/working/` envelopes, not the 10-token sample.

**Invocation:** `@non-tied-plan` (no REQ index writes).

**Depends on:** `[REQ-REQUEST_EVIDENCE_ENVELOPE]`, `request_evidence_envelope_batch_collect`.

**Deliverables:**

- [tools/evaluation/build-envelope-corpus-manifest.mjs](../../../tools/evaluation/build-envelope-corpus-manifest.mjs)
- [evaluation/README.md](../evaluation/README.md)
- [envelope-corpus-manifest.v1.yaml](../evaluation/envelope-corpus-manifest.v1.yaml)
- Regenerated [envelope-gap-report.v1.yaml](../evaluation/envelope-gap-report.v1.yaml)

**Evidence:** [evidence/session-handoff.md](./evidence/session-handoff.md)
