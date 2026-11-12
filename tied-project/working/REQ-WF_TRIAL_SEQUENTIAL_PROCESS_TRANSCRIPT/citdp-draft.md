# CITDP draft — REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT

**record_identity**

- **request_token:** `REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT`
- **profile_depth:** `minimal`
- **gate_policy:** `advisory`
- **change_type:** agentstream_harness + wf_trial_evidence

**change_definition**

Emit turn operator lines on both orchestrator tee streams so `process.stdout.log` is a sequential transcript (agent text + turn boundaries) while the live terminal receives immediate stderr flushes; de-duplicate flushed operator lines from agentstream exit stderr.

**risk_analysis**

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Double operator noise in archived stderr | Med | Low | Exit de-dup (SC-WF-SPT-03); document dual-stream intent in ARCH |
| Flush performance on large batches | Low | Low | Operator lines only; no full agent stream on stderr |
| Abort classifier drift | Med | Med | Wave 1 stderr-only classifier; live fd 2 flush aligns timing with REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL |
| Breaking agentstream dry-run / tests | Low | Med | Package unit tests + SC-WF-ABS regression |

**adversarial_inquiry**

- **depth_tier:** `minimal`
- **gate_policy:** `advisory`
- **disposition:** not used (agentstream unit + bootstrap composition)

**test_strategy_ref**

[tied-project/working/REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT/test-strategy.md](./test-strategy.md)

**evidence**

- Motivation from parent abort-signal fixtures (reference only; **do not register** run 1794504138)
- Incident stderr fixture remains under `REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL/evidence/`
