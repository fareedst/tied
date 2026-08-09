# TIED Fidelity and Defect-Origin Research Plan

**Status:** First vertical slice implemented; pilot execution pending
**Scope:** Integrated development capture plus cross-project, read-only analysis  
**Purpose:** Determine where behavior defects originate across the domain vocabulary → REQ → ARCH → IMPL `essence_pseudocode` → tests → code → docs chain.

This document defines the research and implementation plan. It does not create a new product requirement, modify project TIED YAML, or authorize remediation of audited projects.

## 1. Research premise

TIED needs to distinguish two questions:

1. **Behavioral correctness:** Does observed behavior satisfy the currently approved desired behavior?
2. **Translation fidelity:** Does each artifact accurately preserve the meaning of the preceding artifact?

These questions must not be collapsed into one “bug” label.

Let `S0` be the prior approved specification and `S1` the later approved specification:

- The implementation satisfies `S0`, and `S1` is approved later: this is a **specification change**, not a regression against `S0`.
- `S1` is already authoritative, but implementation still satisfies only `S0`: this is **implementation lag** against the current specification.
- No approved `S1` exists: the observation is a **missing or unresolved specification**, not automatically a code bug.
- The implementation partially applies `S1`: it may be both a specification-change work item and an implementation defect.

Tests and shipped code are evidence of observed behavior. They are not automatically the authority for desired behavior when the approved specification has changed.

## 2. Vocabulary and scope

This plan uses the canonical terms:

- **Domain vocabulary:** preferred names and naming bridges in `tied/vocab/`.
- **IMPL pseudo-code:** the language-agnostic `essence_pseudocode` behavior specification.
- **Three-way alignment:** IMPL block lead ↔ test locus ↔ production locus.
- **CITDP record:** the change-analysis record for current, desired, unchanged, and non-goal behavior.
- **LEAP:** IMPL-first resynchronization when tests or code diverge from documented intent.
- **Binding inventory:** trigger → callee → arguments → effect → ordering → failure behavior for composition seams.
- **Composition evidence:** UI-free evidence that a binding connects independently validated units.

“IPC” is reserved for inter-process communication. When referring to the behavior specification, this plan says **IMPL pseudo-code**.

## 3. Operating profiles

The implementation uses one findings model with two operating profiles:

- **Integrated agent profile:** lightweight, frequent, mostly automatic, and suitable for ordinary development.
- **Human research profile:** complete, slower, evidence-rich, and suitable for retrospective study and root-cause adjudication.

The integrated profile records more observations than it reports to the user. It must not classify every agent suspicion as a confirmed bug.

### 3.1 Finding lifecycle

Every observation follows a controlled lifecycle:

`observed → triaged → confirmed / dismissed / deferred → linked → remediated → verified`

Initial observations remain separate from confirmed bugs. A confirmed finding may be promoted to:

- a CITDP record;
- an IMPL or LEAP correction;
- a REQ or ARCH change;
- a user-facing bug report;
- a methodology improvement.

Findings must not be written directly into REQ, ARCH, or IMPL merely because an agent noticed them.

### 3.2 Integrated agent profile

During normal development, the agent should:

1. Load findings related to touched REQ, ARCH, IMPL, and pseudo-code blocks.
2. Run targeted tests, lint, TIED consistency, traceability, and binding checks.
3. Emit a structured finding whenever it detects a discrepancy, ambiguity, failed check, or possible missing specification.
4. Continue development when the finding is low-confidence or non-blocking.
5. Escalate correctness, security, data-integrity, or blocking findings immediately.
6. Append the observation to the findings ledger with evidence references.
7. Summarize confirmed and important open findings to the developer.

The integrated profile should use warn-only behavior by default. Strict blocking is reserved for configured high-risk profiles or confirmed error-severity findings.

### 3.3 Human research profile

The human profile uses the complete stages in this document and the read-only stages 0–4 of `tied/docs/pseudocode-fidelity-audit-agent-prompt.md`:

- complete block inventory;
- bidirectional pseudo-code/code/test matrices;
- specification-state reconstruction;
- composition and IPC analysis;
- independent reviewer adjudication;
- scorecards, confidence, and study metrics.

Stage 5 LEAP remediation remains a separate, explicitly approved operation.

### 3.4 Visibility policy

Each finding has a visibility level:

- **Internal:** low-confidence observations, duplicate candidates, and agent/tool friction.
- **Developer-visible:** confirmed inconsistencies, missing tests, specification ambiguity, and likely implementation defects.
- **User-visible:** confirmed product defects, security or data issues, or behavior changes affecting the requested outcome.

Important findings must never be silently discarded because they are not user-facing. They may remain internal while still being included in the developer summary.

## 4. Research questions

The study must answer:

1. What proportion of observed defects are specification changes, implementation lag, missing specifications, translation defects, test defects, binding defects, or code defects?
2. Where are problems discovered: unit tests, composition tests, E2E, code review, audit, production monitoring, or user reports?
3. Where did the first divergence originate?
4. Are missing or incomplete IMPL pseudo-code statements associated with later defects?
5. Are composition and IPC bindings riskier than isolated unit blocks?
6. Do structural TIED gates predict behavioral correctness, or only artifact consistency?
7. Does domain-vocabulary drift predict later REQ/ARCH/IMPL or test/code disagreement?
8. How often does a LEAP correction identify a real scope change versus merely repair documentation?

## 5. Root-cause taxonomy

Each case receives one primary origin label and may receive contributing labels:

- **Specification change:** approved desired behavior changed after the prior implementation.
- **Implementation lag:** current approved behavior exists, but implementation remains on the prior behavior.
- **Missing specification:** behavior exists in tests or code but is not represented in current IMPL pseudo-code or higher-level intent.
- **Vocabulary-to-REQ translation defect:** a concept, distinction, or naming bridge changed meaning before becoming a requirement.
- **REQ-to-ARCH defect:** architecture does not preserve a requirement criterion, boundary, invariant, or dependency.
- **ARCH-to-IMPL defect:** implementation logic omits or contradicts an architectural constraint, ordering rule, data transition, or failure mode.
- **IMPL reliability defect:** pseudo-code states behavior that tests or code do not perform.
- **IMPL completeness defect:** tests or code contain behavior that pseudo-code does not state.
- **IMPL-to-test defect:** tests do not exercise the declared success path, failure mode, invariant, or boundary.
- **IMPL-to-code defect:** production code violates the current IMPL contract or procedure steps.
- **Binding/composition defect:** a trigger, channel, collaborator, argument, effect, ordering rule, or failure path is missing or miswired.
- **CITDP defect:** change definition, impact discovery, risk assessment, or test strategy omitted an affected area or used the wrong desired behavior.
- **LEAP/process defect:** known divergence was not elevated through IMPL → ARCH → REQ when required.
- **Documentation defect:** user-facing or developer-facing documentation describes behavior differently from the current stack.
- **Environment/external defect:** behavior depends on an unmodeled platform, dependency, resource, or deployment condition.

The study must preserve “unresolved” as a valid outcome. Reviewers must not force ambiguous cases into “code bug.”

## 6. Findings and case records

The integrated profile records a **finding** whenever a possible problem is discovered. The human research profile groups findings into one primary unit: a behavior-changing change represented by a CITDP record, pull request, commit range, or retrospective change record. A single change may produce multiple block-level findings.

Every finding record must contain:

- finding ID and lifecycle state;
- project, commit, branch, and TIED base path;
- discovery source: test, code review, audit, runtime, user, or agent;
- category, severity, confidence, and visibility;
- related REQ, ARCH, IMPL, and pseudo-code block;
- discovery layer, suspected origin layer, and first divergent edge;
- current versus desired behavior;
- evidence paths, line ranges, commands, revisions, and artifact hashes;
- recommended next action;
- reviewer decision and verification result.

The agent must emit findings at the point of discovery rather than relying only on later transcript analysis. Existing hook logs may provide backfill, but natural-language extraction is lower-confidence evidence.

The ledger is append-only for research purposes. A remediation creates a new evidence revision rather than overwriting the original observation.

The case record must additionally contain:

- project identity and repository revision;
- TIED methodology version and effective TIED base path;
- change identity and prior/current specification revisions;
- prior and desired behavior, unchanged behavior, non-goals, and success criteria;
- affected REQ, ARCH, IMPL, and pseudo-code blocks;
- affected test, production, binding, and documentation loci;
- observed behavior and reproducible evidence;
- discovery location;
- origin layer and first divergent edge;
- reliability findings, completeness findings, or both;
- applicable quality attributes, risk tier, and proof boundaries;
- evidence references with file paths, line ranges, commit IDs, command results, and artifact hashes;
- reviewer decisions, confidence, disagreements, and final adjudication.

The case record must preserve the pre-remediation state. Remediation must produce a new revision rather than overwrite the original finding.

## 7. Study design

### 7.1 Corpus selection

Begin with a pilot of three to five TIED projects:

- include projects with different TIED maturity levels;
- include projects with and without pseudo-code sidecars;
- include multiple languages and test conventions;
- include changes with and without composition or IPC bindings;
- include all high-severity incidents in the selected period;
- include a random control sample of successful behavior-changing changes.

The control sample is necessary. Studying only known bugs cannot estimate defect rates or determine whether a fidelity finding predicts failure.

### 7.2 Project safety and normalization

Each project is analyzed independently:

1. Confirm `tied_config_get_base_path` points to that project’s absolute `tied/` directory.
2. Use explicit analysis roots and ignore patterns from the project’s `.tiedanalysis.yaml`.
3. Exclude methodology YAML, templates, examples, fixtures, and generated output from production conclusions.
4. Record test-file classification rules and any project-specific overrides.
5. Never allow one project’s TIED MCP configuration to write to another project.
6. Keep the cross-project research dataset separate from client project TIED YAML.

Raw token counts must not be compared across projects until roots, exclusions, test classification, and TIED versions are normalized.

## 8. Per-change analysis workflow

### Phase A — Establish the specification state

Before treating tests or code as behavioral evidence:

1. Identify the prior approved REQ/ARCH/IMPL state.
2. Identify the current approved REQ/ARCH/IMPL state.
3. Read the CITDP change definition, if present.
4. Determine whether the desired behavior actually changed.
5. Record whether tests are stale evidence of `S0`, current evidence of `S1`, or insufficient evidence.

This phase prevents an approved specification change from being misclassified as a regression.

### Phase B — Collect immutable evidence

Collect, without modifying the project:

- TIED indexes and affected detail records through the TIED YAML tool surface;
- IMPL pseudo-code sidecars;
- tests and production files at the relevant revisions;
- binding inventories and composition tests;
- CITDP records and LEAP proposals or remediation records;
- release notes, issue descriptions, and user-facing documentation;
- test results, lint results, and quality evidence manifests;
- relevant git history and change diffs.

### Phase C — Run structural analysis

Run and retain the outputs of:

- `tied_validate_consistency`;
- `pseudocode_validate`;
- `tied_scoped_analysis_run` with `traceability_gap_report`;
- `tied_cycles` for requirements and implementation decisions;
- `binding_inventory_validate` for structured binding rows;
- `test_adequacy_validate` when a quality profile requires advanced testing;
- quality evidence collection and manifest generation where commands are declared.

Every result must state its proof boundary. Structural success is not runtime correctness.

### Phase D — Run the pseudo-code fidelity audit

Use `tied/docs/pseudocode-fidelity-audit-agent-prompt.md` for one IMPL set or module boundary at a time.

Stages 0–4 are read-only:

1. Confirm scope and base path.
2. Build an inventory mapping every pseudo-code block to test and production loci.
3. Audit reliability: every pseudo-code statement must be true of the evidence.
4. Audit completeness: every meaningful code behavior and test assertion must appear in pseudo-code.
5. Produce the scorecard and prioritized findings.

The audit must produce both directions:

- pseudo-code → code/test evidence: false, stale, or misordered specification statements;
- code/test behavior → pseudo-code: unknown or missing specification statements.

The audit report is the primary evidence for the IMPL-to-code theory.

### Phase E — Audit composition and IPC boundaries

For every binding, verify:

1. the trigger fires;
2. the correct channel or entry point is used;
3. the correct callee is invoked;
4. arguments satisfy the IMPL preconditions;
5. effects and postconditions are observable;
6. ordering is correct;
7. failure behavior is covered;
8. a UI-free composition test exists unless a named platform constraint justifies E2E.

A valid binding inventory is not proof that the binding works. The composition test must fail when the binding is removed or miswired.

### Phase F — Independent adjudication

Two reviewers independently classify each finding. They must cite evidence rather than infer intent from the location where the problem was discovered.

For each finding, record:

- discovery layer;
- origin layer;
- first divergent edge;
- specification state at the time;
- primary and contributing causes;
- confidence;
- unresolved questions.

Measure reviewer agreement. Resolve disagreements only after both initial classifications are recorded.

### Phase G — Optional LEAP remediation

Do not mutate the audited project during the research pass.

After the report is reviewed, a separate implementation pass may apply `[PROC-LEAP]`:

1. update IMPL pseudo-code first;
2. propagate to ARCH and REQ if scope changed;
3. align tests and production block leads;
4. fix code only when a definite implementation defect exists;
5. rerun structural validation, fidelity analysis, composition evidence, and the test suite.

Record the remediation as a new evidence revision.

## 9. Metrics

Report metrics per project, per change, and per IMPL block:

- defects per 100 behavior-changing changes;
- percentage by origin layer;
- percentage by discovery layer;
- percentage of changes with specification changes;
- percentage of blocks that are reliable and complete;
- number of missing pseudo-code behaviors per block;
- declared branch and failure-mode coverage;
- composition binding coverage;
- time from divergence to discovery;
- time from discovery to LEAP correction;
- number of LEAP loops;
- structural-gate false negatives;
- severity and impact;
- reviewer agreement;
- audit effort and execution cost.
- candidate-to-confirmed finding ratio;
- dismissed and deferred finding rate;
- time from observation to triage and verification;
- user-visible finding rate;
- duplicate-finding rate;
- precision of agent-generated findings after human adjudication.

Use change count as the primary denominator, not token count. Token count is affected by project size and documentation style.

For association testing, compare incidents with matched successful changes using project, change size, domain, and binding presence as controls. If the corpus becomes large enough, use a mixed-effects model with project as a random effect. Do not use the same fidelity audit result both to define the incident and to claim that it predicted the incident.

Measure agent-finding precision separately from product-defect rate. An agent can discover many useful inconsistencies that are not user-visible bugs.

## 10. Planned implementation modules

When this plan is approved for implementation, create the required project REQ/ARCH/IMPL records before production tooling. The implementation should be divided into independently validated modules:

1. **Project manifest handling:** resolves project roots, TIED base paths, versions, languages, test classifiers, and ignore rules.
2. **Artifact snapshot collection:** obtains versioned TIED, test, code, documentation, CITDP, and evidence inputs without mutation.
3. **Specification-state analysis:** identifies prior/current behavior and classifies approved specification changes.
4. **Finding capture and lifecycle:** emits append-only candidate findings, supports triage states, deduplication, severity, confidence, and visibility.
5. **Finding promotion:** links confirmed findings to CITDP, LEAP, REQ, ARCH, IMPL, bug-report, or methodology-improvement workflows without automatic specification mutation.
6. **Structural analysis adapter:** invokes existing TIED validators and preserves proof boundaries.
7. **Fidelity analysis adapter:** decomposes IMPL blocks and records bidirectional evidence matrices.
8. **Binding analysis adapter:** evaluates binding inventories and composition-test evidence.
9. **Case adjudication storage:** stores discovery, origin, edge, confidence, reviewer decisions, and unresolved questions.
10. **Evidence and provenance writer:** stores deterministic command results, revisions, hashes, and artifact references.
11. **Cross-project aggregation:** computes normalized metrics, stratified summaries, and cohort comparisons.
12. **Report generation:** produces internal, developer-visible, and human research output without changing client TIED data.

Each module requires unit tests with mocks, boundary and malformed-input tests, and contract validation before integration. The adapters require composition tests that prove trigger → analysis call → arguments → result without invoking a UI. E2E is permitted only for a named external platform constraint.

## 11. Implementation acceptance criteria

The implementation is ready for pilot use only when:

- it can analyze multiple projects without cross-project TIED writes;
- the integrated agent profile can append a candidate finding without interrupting ordinary development;
- candidate, confirmed, dismissed, deferred, remediated, and verified states remain distinguishable;
- findings can be promoted to the appropriate workflow without automatic REQ/ARCH/IMPL mutation;
- internal, developer-visible, and user-visible outputs are separated by policy;
- the effective TIED base path is recorded for every project;
- the same revisions produce reproducible results;
- specification change, implementation lag, missing specification, and bug remain distinct;
- every finding has an evidence location and proof boundary;
- every sampled IMPL block has an inventory row;
- every sampled block has both pseudo-code-to-evidence and evidence-to-pseudo-code analysis;
- composition bindings are separately reported from unit behavior;
- missing data and unresolved classifications are retained, not silently omitted;
- duplicate observations can be linked without inflating defect counts;
- remediation is disabled in the read-only research mode;
- structural passes cannot be reported as proof of runtime correctness;
- aggregate reports include denominators, project stratification, and audit limitations;
- all implementation modules pass independent validation before integration.

## 12. Risks and mitigations

- **Wrong TIED base path:** fail closed after `tied_config_get_base_path`; use absolute paths.
- **Example/template token noise:** use explicit roots, ignore rules, and production/test classifiers.
- **Stale tests treated as authority:** establish prior/current specification state first.
- **Selection bias:** include successful controls and report missing CITDP data.
- **Reviewer bias:** use two independent classifications and measure agreement.
- **False semantic confidence:** label structural tools as structural; require fidelity and executable evidence.
- **Remediation erases evidence:** make research artifacts immutable and separate from LEAP fixes.
- **Cross-project schema drift:** version the research record and preserve project-specific raw evidence.
- **Sensitive project data:** collect bounded metadata and artifact references; do not centralize secrets or unrestricted source content.
- **Agent over-reporting:** preserve candidate status and measure candidate-to-confirmed precision.
- **Agent under-reporting:** emit structured findings at tool/test boundaries and retain raw evidence.
- **User-report conflation:** keep internal findings separate from user-facing bug reports.
- **Automatic spec pollution:** require human or policy-based promotion before changing REQ/ARCH/IMPL.

## 13. First implementation slice

The first vertical slice should support both lightweight capture and full analysis for one project and one IMPL/module boundary:

1. create the project manifest;
2. define the versioned finding record and append one candidate finding;
3. snapshot one change and its prior/current specification;
4. run structural TIED checks;
5. run the stages 0–4 fidelity audit;
6. analyze any composition bindings;
7. promote one confirmed finding to a case report without modifying product TIED YAML;
8. verify deterministic rerun and duplicate-link behavior.

Only after this slice is reviewed should the project add cross-project aggregation, statistical comparisons, or automated LEAP proposal generation.

## References

- [`tied/docs/pseudocode-fidelity-audit-agent-prompt.md`](../tied/docs/pseudocode-fidelity-audit-agent-prompt.md)
- [`tied/docs/pseudocode-writing-and-validation.md`](../tied/docs/pseudocode-writing-and-validation.md)
- [`tied/docs/agent-req-implementation-checklist.md`](../tied/docs/agent-req-implementation-checklist.md)
- [`tied/docs/composition-coverage.md`](../tied/docs/composition-coverage.md)
- [`tied/docs/citdp-policy.md`](../tied/docs/citdp-policy.md)
- [`docs/scoped-analysis-and-ignore.md`](scoped-analysis-and-ignore.md)
- [`docs/plumb-audit-gate.md`](plumb-audit-gate.md)
- [`docs/conversation-analysis-tools.md`](conversation-analysis-tools.md)
- [`tied/docs/client-development-index.md`](../tied/docs/client-development-index.md)

This plan uses existing `[PROC-VOCABULARY_INDEX]`, `[PROC-CITDP]`, `[PROC-LEAP]`, `[PROC-IMPL_CODE_TEST_SYNC]`, `[PROC-PSEUDOCODE_VALIDATION]`, `[PROC-TEST_STRATEGY]`, `[PROC-TOKEN_AUDIT]`, `[PROC-TOKEN_VALIDATION]`, and `[REQ-MODULE_VALIDATION]` obligations. No new semantic token is introduced by this planning document.
