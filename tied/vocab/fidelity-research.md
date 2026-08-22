# TIED fidelity research (canonical)

**Scope:** Read-only analysis of translation fidelity and defect origin across the
domain vocabulary → REQ → ARCH → IMPL pseudo-code → tests → code → documentation
chain. This glossary defines names only; analysis behavior belongs in the
implementation decisions and pseudo-code for the research tooling.

**Traceability:** [REQ-TIED_FIDELITY_RESEARCH](../requirements/REQ-TIED_FIDELITY_RESEARCH.yaml) ·
[ARCH-TIED_FIDELITY_RESEARCH](../architecture-decisions/ARCH-TIED_FIDELITY_RESEARCH.yaml) ·
[IMPL-TIED_FIDELITY_RESEARCH](../implementation-decisions/IMPL-TIED_FIDELITY_RESEARCH.yaml)

**Status:** Active design vocabulary for the first vertical slice.

**See also:** [`routing.md`](routing.md) · [`pseudocode-and-citdp.md`](pseudocode-and-citdp.md) ·
[`../docs/tied-fidelity-research-plan.md`](../../docs/tied-fidelity-research-plan.md)

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
|---|---|---|
| **fidelity finding** | bug, issue, suspicion | A structured observation about behavior or translation fidelity; it is not confirmed until triage. |
| **candidate finding** | confirmed bug | Initial lifecycle state: `observed` and awaiting triage. |
| **finding lifecycle** | bug workflow | `observed → triaged → confirmed / dismissed / deferred → linked → remediated → verified`. |
| **specification state** | expected behavior version | The approved prior/current REQ, ARCH, and IMPL state used to classify behavior. |
| **origin layer** | bug location | The first layer where meaning diverged from the approved preceding layer. |
| **divergent edge** | root-cause file | The first translation edge that failed, such as REQ→ARCH or IMPL→code. |
| **proof boundary** | validation guarantee | The explicit claim limit of one evidence source. |
| **evidence provenance** | test metadata | Revision, environment, command, result, and artifact identity behind evidence. |
| **read-only research profile** | audit mode | Analysis mode that does not mutate the audited project or its project YAML. |
| **integrated agent profile** | automatic bug detector | Lightweight warn-first observation during ordinary development. |
| **human research profile** | manual audit | Complete evidence-rich retrospective study and adjudication mode. |
| **fidelity research pilot** | pilot run | Concrete bounded execution path for the first slice; distinct from cross-project aggregation. |
| **successful control change** | non-bug sample | A behavior-changing change included to estimate defect rates without selection bias. |
| **integrated activation evidence** | activation signal, metric-only activation | Paired request-scoped inquiry metric and complete bounded artifacts demonstrating tool-backed activation. |
| **activation artifact pairing** | artifact check, activation completeness | The rule that an inquiry metric and all four request-scoped artifacts are required together. |

## Naming bridge

| Concept | Storage or symbol | First-slice role |
|---|---|---|
| Project manifest | `project-manifest` | Project root, TIED base path, versions, languages, classifiers, and ignore rules. |
| Artifact snapshot | `artifact-snapshot` | Immutable revisioned inputs collected without mutation. |
| Specification state | `specification-state` | Prior/current approved behavior reconstruction. |
| Candidate finding | `candidate-finding` | Append-only observation before adjudication. |
| Finding ledger | `finding-ledger` | Append-only research record for observations and evidence revisions. |
| Fidelity audit | `fidelity-audit` | Bidirectional pseudo-code ↔ evidence analysis. |
| Composition evidence | `composition-evidence` | UI-free proof for binding seams; distinct from unit behavior. |
| Case report | `case-report` | Promoted, adjudicated finding with origin and evidence. |
| Evidence provenance | `evidence-provenance` | Deterministic commands, revisions, hashes, and artifact references. |
| Research dataset | `research-dataset` / `researchDataset` | Append-only findings, duplicate links, and case reports emitted outside audited project YAML. |
| Integrated activation evidence | `activation-evidence` | Paired metric and artifact evidence used to classify integrated activation. |
| Activation artifact pairing | `activation-artifact-pairing` | Completeness check joining the inquiry metric to the four bounded artifacts. |

## First-slice pseudo-code block names

| Preferred term | UPPER_SNAKE block | Owning IMPL | Role |
|---|---|---|---|
| Project manifest | `PROJECT_MANIFEST` | `[IMPL-TIED_FIDELITY_RESEARCH]` | Resolve and validate one project’s analysis boundary. |
| Candidate finding | `APPEND_CANDIDATE_FINDING` | `[IMPL-TIED_FIDELITY_RESEARCH]` | Append one deduplicable finding without interruption. |
| Artifact snapshot | `SNAPSHOT_CHANGE` | `[IMPL-TIED_FIDELITY_RESEARCH]` | Capture one change and its prior/current specification. |
| Specification state | `ANALYZE_SPECIFICATION_STATE` | `[IMPL-TIED_FIDELITY_RESEARCH]` | Distinguish specification change, implementation lag, and unresolved specification. |
| Structural analysis | `RUN_STRUCTURAL_ANALYSIS` | `[IMPL-TIED_FIDELITY_RESEARCH]` | Run TIED checks while preserving proof boundaries. |
| Fidelity audit | `AUDIT_IMPL_FIDELITY` | `[IMPL-TIED_FIDELITY_RESEARCH]` | Produce block inventory and bidirectional evidence matrices. |
| Binding analysis | `ANALYZE_BINDING_EVIDENCE` | `[IMPL-TIED_FIDELITY_RESEARCH]` | Evaluate one composition seam separately from unit behavior. |
| Case report | `PROMOTE_CONFIRMED_CASE` | `[IMPL-TIED_FIDELITY_RESEARCH]` | Link one confirmed finding without automatic REQ/ARCH/IMPL mutation. |
| Deterministic rerun | `VERIFY_DETERMINISTIC_RERUN` | `[IMPL-TIED_FIDELITY_RESEARCH]` | Confirm repeatability and duplicate-link behavior. |
| First-slice orchestration | `RUN_FIRST_SLICE` | `[IMPL-TIED_FIDELITY_RESEARCH]` | Connect validated modules through one read-only composition seam. |
| Fidelity research pilot | `RUN_FIDELITY_RESEARCH_PILOT` | `[IMPL-TIED_FIDELITY_RESEARCH]` | Connect concrete adapters through the first-slice ordering and emit bounded research-dataset records. |

## Classification terms

Use these primary origin labels exactly as defined by the research plan:
`specification-change`, `implementation-lag`, `missing-specification`,
`vocabulary-to-REQ-translation-defect`, `REQ-to-ARCH-defect`,
`ARCH-to-IMPL-defect`, `IMPL-reliability-defect`,
`IMPL-completeness-defect`, `IMPL-to-test-defect`, `IMPL-to-code-defect`,
`binding-composition-defect`, `CITDP-defect`, `LEAP-process-defect`,
`documentation-defect`, and `environment-external-defect`.

## Checklist integration

Adversarial inquiry extends `[PROC-AGENT_REQ_CHECKLIST]` through existing step slugs and the
`sub-adversarial-inquiry-pass` sub-procedure — no second process token. Canonical checklist:
`tied/docs/agent-req-implementation-checklist.yaml`.

| Step slug | Integration role |
|---|---|
| `session-bootstrap` | PRELOAD this glossary and `quality-assurance.md` when work touches fidelity or obligation evidence |
| `translate-sponsor-intent` | Anti-examples, ambiguity probes, unchanged-behavior checklist |
| `change-definition` | Counterexamples and falsification questions for success criteria |
| `impact-discovery` | First-divergence hypotheses; obligation inventory; proof-boundary class per matrix row |
| `author-requirement` | Positive and negative (counterexample) case per satisfaction criterion |
| `author-architecture` | REQ criterion → ARCH constraint mapping; invalid-state analysis |
| `catalog-pseudocode-contracts` | Closed failure/state/ordering/termination catalog per block |
| `flag-insufficient-specs` | Counterexample-derived flags → finding ledger; CALL `sub-adversarial-inquiry-pass` (`phase: structural`) |
| `flag-contradictory-specs` | Contradiction counterexamples → finding ledger; CALL sub-procedure (`structural`) |
| `gate-pseudocode-validation` | CALL `sub-adversarial-inquiry-pass` (`phase: pre_red`); no runtime claim |
| `risk-assessment` | Adversarial depth tier; strict-eligibility prerequisites when blocking desired |
| `test-strategy` | Independent oracle sources; bounded command rows when profile-triggered |
| `unit-test-red` | Fault matrix row with expected failure reason |
| `unit-test-green` | Bidirectional adapter check (warn-only → `sub-leap-micro-cycle`) |
| `three-way-alignment-unit` | Bidirectional adapter check; CALL sub-procedure (`phase: post_test`) |
| `composition-integration` | Binding-local adversarial cases; controlled fault injection rows |
| `verification-gate` | Full fidelity matrix; CALL sub-procedure (`phase: verification`); scoped blocking when strict-eligible |
| `sync-tied-stack` | LEAP only for **confirmed** findings (not observed-only) |
| `traceable-commit` | Evidence provenance, open findings, waivers, proof boundaries; CALL sub-procedure (`phase: close_out`) |
| `persist-citdp-record` | Pilot evidence when gate policy is strict-candidate or strict-approved |
| `sub-adversarial-inquiry-pass` | Binds `SELECT_ADVERSARIAL_INQUIRY_DEPTH` → `MAP_ADVERSARIAL_OBLIGATIONS` → `EVALUATE_ADVERSARIAL_FINDINGS` → `ROUTE_UNRESOLVED_CRITICAL_FINDINGS` → `PERSIST_WORKING_ARTIFACTS` |

Working artifacts persist only under `working/{REQ-TOKEN}/adversarial-inquiry/`. See
[`docs/adversarial-inquiry-checklist-integration-plan.md`](../../docs/adversarial-inquiry-checklist-integration-plan.md).

## Alphabetical index

| Term | Section |
|---|---|
| activation artifact pairing | Preferred terms vs synonyms |
| artifact snapshot | Naming bridge |
| candidate finding | Preferred terms vs synonyms |
| case report | Naming bridge |
| composition evidence | Naming bridge |
| divergent edge | Preferred terms vs synonyms |
| evidence provenance | Preferred terms vs synonyms |
| first-slice orchestration | Pseudo-code block names |
| fidelity audit | Naming bridge |
| fidelity finding | Preferred terms vs synonyms |
| fidelity research pilot | Preferred terms vs synonyms |
| finding lifecycle | Preferred terms vs synonyms |
| finding ledger | Naming bridge |
| human research profile | Preferred terms vs synonyms |
| integrated activation evidence | Preferred terms vs synonyms |
| integrated agent profile | Preferred terms vs synonyms |
| origin layer | Preferred terms vs synonyms |
| proof boundary | Preferred terms vs synonyms |
| project manifest | Naming bridge |
| research dataset | Naming bridge |
| read-only research profile | Preferred terms vs synonyms |
| RUN_FIDELITY_RESEARCH_PILOT | Pseudo-code block names |
| specification state | Preferred terms vs synonyms |
| successful control change | Preferred terms vs synonyms |
