# Jargon glossary (writer aid — not for Reddit paste unless trimmed)

| Term | Plain English for Reddit |
| --- | --- |
| TIED | Structured stack of requirements, architecture, and implementation records (with pseudo-code) kept aligned with code and tests |
| REQ-* / token | Stable ID tying a requirement to decisions, tests, and code |
| ARCH / IMPL | Architecture decision vs implementation decision (how to structure vs how steps behave) |
| Pseudo-code (`essence_pseudocode`) | Step-wise behavior contract agents implement against |
| Gate receipt | Small JSON file: did this workflow checkpoint pass or block? |
| Evidence envelope | Packaged proof that a request was completed under process rules |
| Pre-implementation gate | Checkpoint before writing product code |
| Verification gate | Checkpoint after implementation vs plan/tests |
| Close-out gate | Final checkpoint before treating work as shipped |
| RED / GREEN | Test fails first (missing code), then code makes it pass |
| Composition test | Test that only checks modules wired together — not UI, not CLI |
| Four-phase workflow | Define feature → refine plan → build → close-out (four separate agent sessions here) |
| Orchestrator | Script that starts each session, logs stdout/stderr, records manifest |
| Harness | Which IDE/agent runner configuration was used (here: Cursor) |
| Disposable client | Throwaway git clone for one trial |
| Facilitator | Person/process that re-runs tests and writes the readout |
| Agentstream | Batch runner for multi-turn agent workflows |
| CITDP | Pre-build change-impact analysis document (scope/risk — name optional in post) |
| LEAP | When code/tests diverge from written plan, update the plan stack in the same work item |
| Adherence reconcile | Automated check that agent actions matched checklist (not run in this trial) |
| WF-03 | Catalog prompt id for the composition-seam trial |
| Process log manifest | Index pointing to orchestrator stdout/stderr for replay |
