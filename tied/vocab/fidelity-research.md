# TIED fidelity research (canonical)

**Scope:** Read-only analysis of translation fidelity and defect origin across the
domain vocabulary → REQ → ARCH → IMPL pseudo-code → tests → code → documentation
chain. This glossary defines names only; analysis behavior belongs in the
implementation decisions and pseudo-code for the research tooling.

**Traceability:** [REQ-TIED_FIDELITY_RESEARCH](../requirements/REQ-TIED_FIDELITY_RESEARCH.yaml) ·
[ARCH-TIED_FIDELITY_RESEARCH](../architecture-decisions/ARCH-TIED_FIDELITY_RESEARCH.yaml) ·
[IMPL-TIED_FIDELITY_RESEARCH](../implementation-decisions/IMPL-TIED_FIDELITY_RESEARCH.yaml) ·
[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT](../requirements/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) ·
[ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT](../architecture-decisions/ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) ·
[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml)

**Status:** Active design vocabulary for the first vertical slice.

**See also:** [`routing.md`](routing.md) · [`pseudocode-and-citdp.md`](pseudocode-and-citdp.md) ·
[`../docs/tied-fidelity-research-plan.md`](../../docs/tied-fidelity-research-plan.md)

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
|---|---|---|
| **fidelity finding** | bug, issue, suspicion | A structured observation about behavior or translation fidelity; it is not confirmed until triage. |
| **candidate finding** | confirmed bug | Initial lifecycle state: `observed` and awaiting triage. |
| **checklist evidence gate** | prose-only gate, caller assertion | Shared fail-closed validation boundary for Tracker dispositions, CITDP depth, and activation evidence. |
| **finding lifecycle** | bug workflow | `observed → triaged → confirmed / dismissed / deferred → linked → remediated → verified`. |
| **specification state** | expected behavior version | The approved prior/current REQ, ARCH, and IMPL state used to classify behavior. |
| **origin layer** | bug location | The first layer where meaning diverged from the approved preceding layer. |
| **divergent edge** | root-cause file | The first translation edge that failed, such as REQ→ARCH or IMPL→code. |
| **proof boundary** | validation guarantee | The explicit claim limit of one evidence source. |
| **evidence provenance** | test metadata | Revision, environment, command, result, and artifact identity behind evidence. |
| **read-only research profile** | audit mode | Analysis mode that does not mutate the audited project or its project YAML. |
| **integrated agent profile** | automatic bug detector | Lightweight warn-first observation during ordinary development. |
| **human research profile** | manual audit | Complete evidence-rich retrospective study and adjudication mode. |
| **evidence chain profile** | maturity report, chain score | Read-only `evidence-chain-profile.v1` artifact owned by quality-assurance vocabulary; compose existing fidelity modules, do not append findings or promote cases. |
| **evidence-chain profile depth** | research profile (alone) | `integrated` or `human_research` measurement depth on the evidence chain profile. Not the same token as **integrated agent profile** or **human research profile**, though `human_research` depth may *read* those modules. |
| **evidence chain statistics report** | cross-project audit, maturity dashboard | TIED-source offline batch owned by quality-assurance vocabulary; consumes profile artifacts only; does not append findings or promote cases. |
| **fidelity research pilot** | pilot run | Concrete bounded execution path for the first slice; distinct from cross-project aggregation. |
| **successful control change** | non-bug sample | A behavior-changing change included to estimate defect rates without selection bias. |
| **integrated activation evidence** | activation signal, metric-only activation | Paired request-scoped inquiry metric and complete bounded artifacts demonstrating tool-backed activation. |
| **activation artifact pairing** | artifact check, activation completeness | The rule that an inquiry metric and all four request-scoped artifacts are required together. |
| **Tracker disposition** | checklist status, generic skip | One of `pending`, `completed`, `not_applicable`, or `waived`, with disposition-specific evidence contracts. |
| **prior depth tier** | last depth, previous depth_tier | Snapshot of `depth_tier` before the current CITDP edit. Required for **depth-change waiver** detection; null on first selection. |
| **depth-change waiver** | integrated_waiver, depth_change_waiver, silent downgrade exception | Owner/expiry/rationale/approval allowing `depth_tier` to drop from `integrated` or `strict_candidate` to `minimal`. |
| **close-out inquiry waiver** | close_out re-run waiver, verification-run reuse | Owner/expiry/rationale/approval allowing `close_out` to skip a new inquiry pass when findings are unchanged; does **not** authorize passing a verification-phase receipt as the close_out `activation` payload. |
| **phase-aware slug set** | INTEGRATED_REQUIRED_SLUGS, auto slugs | Phase-specific Tracker slugs the checklist evidence gate derives at integrated depth (and at `strict_candidate` verification/close_out). Caller slugs union with this set and cannot subtract. |
| **phase artifact directory** | phase folder, snapshot folder | Request-scoped `working/{REQ-TOKEN}/adversarial-inquiry/phase-{phase}/` storage that prevents one inquiry phase from overwriting another; each receipt references only its own phase directory. |
| **metrics client attribution** | client label, tied-cli tag | Operator-facing label in MCP usage JSONL; resolved from env, `--client`, or `/dev/test/{id}` auto-detect in tied-cli; supports provenance only and never gates activation alone. |
| **Go Mode B adapter** | go-test adapter, PARSE_GO_TEST_EVIDENCE | Native Go project-input Mode B dispatch with realpath confinement; `_test.go` paths select the go-test manifest profile. |
| **Go Mode A builder** | build_adversarial_inquiry_from_tied, from-tied builder | Ruby script emitting normalized graph/fidelity for Go and language-neutral stacks from TIED tokens, declared paths, and optional build-config; optional when Mode B suffices. |
| **reference fixture** | adversarial-inquiry-go-rootjobs | Checked-in 1787507684 / REQ-ROOTJOBS graph/fidelity + build-config for CI regression; repo-relative paths only. |
| **controlled fixture** | test client, sample project (for remediation) | Reproducible snapshot-bound project (e.g. client alias `1787603099`) with labeled negative/positive gate cases; fixture manifest is authoritative input only. |
| **evidence corpus** | fixture corpus, regression inputs | The controlled fixture's labeled rejection cases, valid positive reference, snapshots, and replay inputs bound to corpus-manifest.json. |
| **phase-aware activation report** | metrics activation summary | Offline analyzer view of per-phase artifact completeness plus inquiry count; phase dirs remain authoritative over root projection. |
| **activation expected identity** | expected payload, expected fields | Gate-side identity projection derived from a valid activation receipt when omitted by the caller; it does not replace receipt/artifact pairing. |
| **placeholder waiver** | empty waiver, tilde waiver | An unusable waiver value (`null`, empty string, or `~`) that must be treated as absent rather than approval evidence. |
| **minimal sub-stub disposition** | pending sub-stub at minimal | At minimal depth, `sub-adversarial-inquiry-pass` must be `not_applicable` or `waived` with rationale; `pending` fails at every gate phase. |
| **parent-child slug consistency** | sub-stub pending vs parent completed | At integrated depth, a completed auto-required parent slug cannot coexist with a pending `sub-adversarial-inquiry-pass`. |
| **open-record shape** | persistence validation, citdp write shape | Adversarial section contract enforced by `citdp_record_write` / `validateCitdpOpenRecord`; allows integrated depth without activation pre-inquiry. |
| **depth upgrade path** | minimal-to-integrated upgrade, chicken-and-egg bypass | Lawful sequence: write integrated depth with `prior_depth_tier: minimal`, run inquiry per phase, gate with pairing, then cite verification activation. |

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
| Checklist evidence gate | `checklist-evidence-gate` / `validateChecklistGate` | Shared read-only progression check for Tracker, CITDP, and activation evidence. |
| Case report | `case-report` | Promoted, adjudicated finding with origin and evidence. |
| Evidence provenance | `evidence-provenance` | Deterministic commands, revisions, hashes, and artifact references. |
| Research dataset | `research-dataset` / `researchDataset` | Append-only findings, duplicate links, and case reports emitted outside audited project YAML. |
| Integrated activation evidence | `activation-evidence` | Paired metric and artifact evidence used to classify integrated activation. |
| Activation artifact pairing | `activation-artifact-pairing` | Completeness check joining the inquiry metric to the four bounded artifacts. |
| Tracker disposition | `tracker-disposition` | Machine-checked disposition and evidence contract for one checklist step. |
| Evidence remediation diagnostic | `tracker_sparse`, `tracker_not_authoritative`, `provenance_incomplete`, `finding_unresolved`, `warn_not_success`, `command_success_unproven`, `evidence_stale`, `tree_dirty_post_gate`, `activation_pairing_incomplete`, `sub_stub_pending`, `parent_child_inconsistent`, `waiver_invalid` | Stable checklist-gate diagnostics emitted alongside granular validation codes. |
| Prior depth tier | `prior_depth_tier` | Previous `depth_tier` used to detect a downgrade on a single CITDP snapshot. |
| Depth-change waiver | `integrated_waiver` / `depth_change_waiver` | Required fields when lowering depth mid-request. |
| Close-out inquiry waiver | `close_out_inquiry_waiver` | Documents why `close_out` has no new inquiry `run_id`. |
| Phase-aware slug set | `INTEGRATED_REQUIRED_SLUGS` | Auto-required Tracker slugs inside `validateChecklistGate`. |
| Phase artifact directory | `working/{REQ-TOKEN}/adversarial-inquiry/phase-{phase}/` | Per-phase bounded artifact storage; canonical root is reserved for the latest/close-out view. |
| Metrics client attribution | `TIED_MCP_METRICS_CLIENT` / tied-cli `--client` | JSONL client label for operator provenance; auto-detect from `project_root` under `/dev/test/{id}` when unset. |
| Go Mode A builder | `build_adversarial_inquiry_from_tied.rb` | Emits normalized graph/fidelity for Go stacks; optional `--build-config`; `--emit-mode-a` delegates envelope assembly. |
| Go Mode B fixture | `mcp-server/test/fixtures/adversarial-inquiry-go-mode-b/` | Deterministic Go divide mini-project for Mode B loader/orchestrator regression. |
| Reference fixture | `mcp-server/test/fixtures/adversarial-inquiry-go-rootjobs/` | 1787507684 REQ-ROOTJOBS pilot layout for Mode A builder regression. |
| Phase-aware activation report | `integrated_activation_complete` in metrics analyzer | Offline completeness signal combining three phase dirs and inquiry count; does not replace checklist gate receipts. |
| Activation expected identity | `activation.expected` / `expected` | Derived gate identity fields from `activation.receipt` when safe and complete. |
| Placeholder waiver | `~`, `null`, or empty waiver fields | Invalid waiver input; never satisfies a waiver contract. |
| Minimal sub-stub disposition | `sub-adversarial-inquiry-pass` at minimal depth | Must be `not_applicable` or `waived`; `pending` blocks every gate phase. |
| Parent-child slug consistency | `sub_stub_pending_while_parent_completed` | Integrated-only diagnostic when parent slugs are completed while sub-stub is pending. |
| Open-record shape | `validateCitdpOpenRecord` | Persistence-only adversarial CITDP validation; integrated depth may omit activation pre-inquiry. |
| Depth upgrade path | `prior_depth_tier: minimal` on upgrade | Auditable minimal→integrated upgrade without `upgrade_pending_inquiry` state; progression gates unchanged. |

## Evidence remediation diagnostics

The checklist evidence gate emits these stable identifiers for remediation classes. Granular
diagnostics remain alongside them so operators can locate the precise failing field or artifact.

| Diagnostic | Meaning |
|---|---|
| `activation_pairing_incomplete` | Inquiry receipt and required artifacts are missing or cannot be paired. |
| `command_success_unproven` | A claimed successful command lacks retained output, manifest, or exit evidence. |
| `evidence_stale` | Evidence is cross-phase, stale, or hash-mismatched. |
| `finding_unresolved` | A gate result or finding ledger still contains an unresolved finding. |
| `parent_child_inconsistent` | An auto-required parent step is complete while the inquiry sub-stub remains pending. |
| `provenance_incomplete` | Evidence provenance lacks required identity, command, tool, or schema fields. |
| `sub_stub_pending` | The required `sub-adversarial-inquiry-pass` step remains pending. |
| `tracker_not_authoritative` | A synthetic Tracker projection was supplied instead of the authoritative file. |
| `tracker_sparse` | Required phase-aware Tracker dispositions are absent. |
| `tree_dirty_post_gate` | Dirty or untracked paths remain at close-out. |
| `waiver_invalid` | A waiver contains placeholder or otherwise unusable approval fields. |
| `warn_not_success` | A warning-status gate result was incorrectly presented as success. |

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
| BUILD_MODE_A_FROM_TIED | `BUILD_MODE_A_FROM_TIED` | `[IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST]` | Emit normalized graph/fidelity for Go/non-Ruby Mode A from TIED tokens and declared paths. |
| Checklist evidence gate | `VALIDATE_CHECKLIST_GATE` | `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` | Evaluate Tracker, CITDP, and activation contracts before progression. |
| Activation artifact pairing | `VALIDATE_ACTIVATION_PAIRING` | `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` | Pair a successful inquiry receipt with four identity-bound artifacts. |

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
| `flag-insufficient-specs` | Counterexample-derived flags → finding ledger; CALL `sub-adversarial-inquiry-pass` (`phase: pre_implementation`) |
| `flag-contradictory-specs` | Contradiction counterexamples → finding ledger; CALL sub-procedure (`structural`) |
| `gate-pseudocode-validation` | CALL `sub-adversarial-inquiry-pass` (`phase: pre_implementation`); no runtime claim |
| `risk-assessment` | Adversarial depth tier; strict-eligibility prerequisites when blocking desired |
| `test-strategy` | Independent oracle sources; bounded command rows when profile-triggered |
| `unit-test-red` | Fault matrix row with expected failure reason |
| `unit-test-green` | Bidirectional adapter check (warn-only → `sub-leap-micro-cycle`) |
| `three-way-alignment-unit` | Bidirectional adapter check; CALL sub-procedure (`phase: verification`) |
| `composition-integration` | Binding-local adversarial cases; controlled fault injection rows |
| `verification-gate` | Full fidelity matrix; CALL sub-procedure (`phase: verification`); scoped blocking when strict-eligible |
| `sync-tied-stack` | LEAP only for **confirmed** findings (not observed-only) |
| `traceable-commit` | Evidence provenance, open findings, waivers, proof boundaries; CALL sub-procedure (`phase: close_out`) |
| `persist-citdp-record` | Pilot evidence when gate policy is strict-candidate or strict-approved |
| `sub-adversarial-inquiry-pass` | Binds `SELECT_ADVERSARIAL_INQUIRY_DEPTH` → `MAP_ADVERSARIAL_OBLIGATIONS` → `EVALUATE_ADVERSARIAL_FINDINGS` → `ROUTE_UNRESOLVED_CRITICAL_FINDINGS` → `PERSIST_WORKING_ARTIFACTS` |

Working artifacts persist under `working/{REQ-TOKEN}/adversarial-inquiry/`.
When `activation.phase` is present, the **phase artifact directory**
(`working/{REQ-TOKEN}/adversarial-inquiry/phase-{phase}/`) is the
authoritative pairing location; the four root files are a latest/close-out
convenience projection only and never satisfy another phase's pairing. See
[`docs/adversarial-inquiry-adoption.md`](../../docs/adversarial-inquiry-adoption.md).

## Alphabetical index

| Term | Section |
|---|---|
| activation artifact pairing | Preferred terms vs synonyms |
| activation_pairing_incomplete | Evidence remediation diagnostics |
| command_success_unproven | Evidence remediation diagnostics |
| close-out inquiry waiver | Preferred terms vs synonyms |
| depth-change waiver | Preferred terms vs synonyms |
| phase-aware slug set | Preferred terms vs synonyms |
| phase artifact directory | Preferred terms vs synonyms |
| activation expected identity | Preferred terms vs synonyms |
| placeholder waiver | Preferred terms vs synonyms |
| prior depth tier | Preferred terms vs synonyms |
| artifact snapshot | Naming bridge |
| candidate finding | Preferred terms vs synonyms |
| case report | Naming bridge |
| checklist evidence gate | Preferred terms vs synonyms |
| composition evidence | Naming bridge |
| divergent edge | Preferred terms vs synonyms |
| evidence remediation diagnostic | Naming bridge |
| evidence_stale | Evidence remediation diagnostics |
| evidence provenance | Preferred terms vs synonyms |
| evidence chain profile | Preferred terms vs synonyms |
| evidence chain statistics report | Preferred terms vs synonyms |
| evidence-chain profile depth | Preferred terms vs synonyms |
| first-slice orchestration | Pseudo-code block names |
| fidelity audit | Naming bridge |
| fidelity finding | Preferred terms vs synonyms |
| fidelity research pilot | Preferred terms vs synonyms |
| finding_unresolved | Evidence remediation diagnostics |
| finding lifecycle | Preferred terms vs synonyms |
| finding ledger | Naming bridge |
| human research profile | Preferred terms vs synonyms |
| integrated activation evidence | Preferred terms vs synonyms |
| integrated agent profile | Preferred terms vs synonyms |
| origin layer | Preferred terms vs synonyms |
| parent_child_inconsistent | Evidence remediation diagnostics |
| proof boundary | Preferred terms vs synonyms |
| provenance_incomplete | Evidence remediation diagnostics |
| project manifest | Naming bridge |
| research dataset | Naming bridge |
| read-only research profile | Preferred terms vs synonyms |
| RUN_FIDELITY_RESEARCH_PILOT | Pseudo-code block names |
| specification state | Preferred terms vs synonyms |
| sub_stub_pending | Evidence remediation diagnostics |
| successful control change | Preferred terms vs synonyms |
| Tracker disposition | Preferred terms vs synonyms |
| tracker_not_authoritative | Evidence remediation diagnostics |
| tracker_sparse | Evidence remediation diagnostics |
| tree_dirty_post_gate | Evidence remediation diagnostics |
| VALIDATE_ACTIVATION_PAIRING | Pseudo-code block names |
| waiver_invalid | Evidence remediation diagnostics |
| warn_not_success | Evidence remediation diagnostics |
