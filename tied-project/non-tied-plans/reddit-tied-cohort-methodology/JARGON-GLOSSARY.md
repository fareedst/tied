# Jargon glossary (writer aid — not for Reddit paste unless trimmed)

| Term | Plain English for Reddit |
| --- | --- |
| TIED | Structured stack of vocabulary, requirements, architecture, and implementation records (with step-wise pseudo-code) kept aligned with code and tests |
| Vocabulary layer | Shared glossary: resolve sponsor words before they become ids in docs and code |
| REQ / ARCH / IMPL | Requirement vs architecture decision vs implementation decision (what vs structure vs behavior steps) |
| Token / stable id | Label linking requirement, decisions, tests, and code comments |
| Pseudo-code (`essence_pseudocode`) | Step-wise behavior contract written before or while coding |
| LEAP | When tests or code disagree with written IMPL, update the written stack in the same change item |
| Atoms (size layer) | Count of indexed REQ/ARCH/IMPL plus vocab term rows — “agreement footprint” |
| Operational intent (size layer) | Non-template pseudo-code mass (lines, procedures) on disk |
| Proof facets (size layer) | Unit, composition, and E2e test **case** counts, classified by path rules |
| Cross-layer ratios | e.g. pseudo-code lines per atom, test cases per atom — proportionality only |
| Project size snapshot | Machine receipt counting the three layers; not a grade |
| Composition test | Test that wiring/modules connect without starting a UI |
| Four-phase workflow | Define → refine plan → build → close-out (often four separate agent sessions in trials) |
| Disposable client | Throwaway git clone for one controlled trial |
| Facilitator | Operator who re-runs tests and writes readouts; runs batch discover + comparison tables |
| Methodology fidelity | How complete the trace artifact stack is — not whether the product is correct |
| Proof boundary | Explicit limit: structure counts do not prove tests pass or requirements met |
| CITDP | Pre-build change-impact analysis (optional name in post) |
| Pre-implementation gate | Checkpoint before product code |
| Consistency validation | Automated check that indexes, detail files, and token refs align |
| RED / GREEN | Failing test first, then minimal code to pass |
| L1 (apply level) | One bounded change this week with falsifiable done criteria |
