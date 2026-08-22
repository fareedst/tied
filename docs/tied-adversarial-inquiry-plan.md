# TIED Adversarial Inquiry and Fidelity Adherence Plan

**Status:** Proposed methodology plan; bounded implementation slice completed
**Scope:** Improve semantic adherence across domain vocabulary → REQ → ARCH →
IMPL `essence_pseudocode` → tests → production code → documentation and
operational evidence
**Priority:** P0 foundation, followed by risk-triggered P1 assurance, P2
calibration and adoption, and P3 advanced research
**Purpose:** Add falsification-oriented inquiry to the existing TIED fidelity,
test-adequacy, composition, evidence, and LEAP processes without creating a
second source of intent.

This is a planning artifact. It does not create a new requirement, architecture
decision, implementation decision, process token, or CITDP record; it does not
authorize changes to project TIED YAML, tests, or production code. Each
behavior-changing implementation batch must establish or update its own
REQ/ARCH/IMPL traceability before RED tests.

The bounded implementation slice recorded by
`REQ-TIED_ADVERSARIAL_INQUIRY` and its linked ARCH/IMPL/CITDP records is now
complete. The statement above remains the governing rule for future batches;
the linked records and adoption guide are the source of truth for what this
slice actually implements.

### 1.1 Bounded change definition

**Current behavior:** TIED validates structural traceability, pseudo-code shape,
declared loci, risk-triggered test plans, and supplied composition observations.
The fidelity audit can confirm that test and production loci exist, but it does
not yet compare statement-level reliability or completeness. These checks do not
claim runtime correctness or REQ completeness.

**Desired behavior:** Add a language-neutral, read-only obligation and fidelity
analysis that maps changed REQ criteria to ARCH constraints, IMPL blocks, test
and production evidence, and composition bindings. Add bounded adapters,
negative controls, review-gated findings, and evidence-scoped status projection.
Enable blocking only for a declared supported subset after strict-mode
eligibility has been demonstrated.

**Unchanged behavior:** REQ/ARCH/IMPL remains the authority; TIED methodology YAML
remains read-only in clients; TDD, module validation, composition-before-E2E,
CITDP, LEAP, and human review remain mandatory. Analysis never mutates canonical
project YAML.

**Non-goals:** replacing TIED with generated artifacts; universal mutation,
fuzzing, formal methods, model checking, predictive risk scoring, or additional
language adapters beyond the approved pilot; treating structural presence,
heuristic output, or inventory rows as runtime proof.

**Batch ownership:** Batch 0 owns vocabulary, contracts, identity, fixtures, and
TIED preparation; Batch 1 owns the obligation graph; Batch 2 owns
language-neutral statement-level fidelity; Batch 3 owns the Ruby Minitest
vertical slice; Batch 4 owns checklist, findings, and scoped status integration;
Batch 5 owns bounded executable assurance and controlled fault seams; Batch 6
owns strict-mode eligibility, pilot calibration, and client guidance.

**Artifact authority:** REQ/ARCH/IMPL and their detail files are canonical
intent. IMPL pseudo-code sidecars are the canonical behavior body. Obligation
graphs, normalized evidence, reports, findings, and pilot measurements are
generated or append-only research artifacts; they never replace canonical
intent. TIED YAML writes use the TIED YAML MCP/tied-cli surface, while
pseudo-code sidecars and domain vocabulary remain plain-text artifacts.

**Inspection baseline:** This plan was inspected at git revision
`472a5a8d23a7755af11cf95b91c9ac6c44c80535` on 2026-08-21.

Related plans and controls:

- [`tied-fidelity-research-plan.md`](tied-fidelity-research-plan.md)
- [`pseudocode-fidelity-audit-agent-prompt.md`](../tied/docs/pseudocode-fidelity-audit-agent-prompt.md)
- [`pseudocode-writing-and-validation.md`](../tied/docs/pseudocode-writing-and-validation.md)
- [`composition-coverage.md`](../tied/docs/composition-coverage.md)
- [`agent-req-implementation-checklist.md`](../tied/docs/agent-req-implementation-checklist.md)
- [`processes.md`](../tied/docs/processes.md)
- [`quality-assurance.md`](../tied/vocab/quality-assurance.md)
- [`fidelity-research.md`](../tied/vocab/fidelity-research.md)

---

## 1. Executive decision

TIED should apply adversarial inquiry as a **falsification mode** over its
existing canonical artifacts, not as a new parallel specification layer.

The authority direction remains:

```text
domain vocabulary
  → REQ
  → ARCH
  → IMPL essence_pseudocode
  → tests
  → production code
```

The audit direction is bidirectional:

```text
upstream intent → downstream evidence
downstream behavior → upstream specification
```

The remediation direction remains LEAP-governed:

```text
confirmed divergence
  → update IMPL first
  → update ARCH and REQ when scope changed
  → align tests
  → align production code
  → rerun structural and executable evidence
```

The central question at every translation edge is:

> What counterexample would show that the downstream artifact preserved the
> words or token references but failed to preserve the upstream meaning?

Adversarial inquiry therefore strengthens three existing canonical concepts:

1. **Fidelity audit** — whether each translation is reliable and complete.
2. **Test adequacy** — whether tests can detect meaningful incorrect
   implementations, not merely exercise lines.
3. **Proof boundary** — what each structural, semantic, executable, or human
   result does and does not establish.

The sponsor phrase **adversarial inquiry** is not yet proposed as a canonical
domain term. During implementation planning, vocabulary refinement should
decide whether it remains a descriptive phrase or becomes a preferred term. No
new token or glossary row should be created merely because this plan uses the
phrase.

---

## 2. Why this is needed

TIED already provides strong traceability, strict TDD ordering, pseudo-code
contracts, literal block-lead linkage, composition evidence, quality profiles,
verification evidence, and LEAP. Those controls reduce accidental drift, but
several current checks establish **presence and structure**, not semantic
adherence.

### 2.1 Structural linkage can be semantically wrong

A REQ token can occur in a test and production file while both artifacts
implement the same mistaken interpretation. Literal block-lead parity proves
that artifacts declare the same relationship; it does not prove that the test
assertions or production behavior preserve the declared contract.

### 2.2 Passing tests can share the specification defect

Tests derived only from the same IMPL pseudo-code may repeat an omitted failure
mode, inverted boundary, or misunderstood requirement. A green suite proves
conformance to those tests in one environment; it does not prove that the tests
are a complete or independent oracle for the REQ.

### 2.3 Current validators have intentionally bounded proof claims

As of this plan:

- `mcp-server/src/analysis/pseudocode-validator.ts` validates structural
  pseudo-code shape, token linkage, contracts, symbols, dependencies, and
  declared coverage references. Its proof boundary explicitly excludes runtime
  behavioral coverage.
- `mcp-server/src/analysis/traceability-gap.ts` detects REQ/IMPL token occurrence
  gaps. It explicitly keeps block-level pseudo-code mapping out of scope.
- `mcp-server/src/quality-adequacy.ts` validates the completeness of a
  risk-triggered test plan. It does not execute mutation, property, fuzz,
  flaky-test, dependency, maintainability, or external-call checks.
- `mcp-server/src/fidelity-research/fidelity-audit.ts` currently discovers
  procedure names and test/production loci. A block receives `PASS` when both
  loci exist; statement-level reliability and completeness comparison are not
  yet implemented.
- `mcp-server/src/fidelity-research/binding-analysis.ts` evaluates supplied
  boolean observations. It does not itself execute a composition test or prove
  that the evidence fails under a removed or miswired binding.

These boundaries are correct and should remain explicit. The improvement is to
add stronger evidence layers, not to relabel structural checks as semantic or
runtime proof.

### 2.4 The most dangerous gap is correlated agreement

REQ, IMPL, tests, and code can all agree with one another and still be wrong
relative to sponsor intent, an invariant, or an omitted environment condition.
Adversarial inquiry is valuable because it tries to break that correlated
agreement with:

- counterexamples and anti-examples;
- independent test derivation;
- mutation and fault injection;
- property and metamorphic relations;
- bidirectional specification/evidence comparison;
- independent reviewer adjudication.

---

## 3. Goals and non-goals

### 3.1 Goals

1. Make every meaningful translation edge falsifiable.
2. Measure semantic adherence at the IMPL block and REQ criterion level.
3. Detect false, stale, incomplete, vacuous, or implementation-coupled tests.
4. Verify that composition tests fail when bindings are removed or miswired.
5. Preserve the distinction between structural, semantic, executable, and human
   evidence.
6. Apply expensive techniques according to risk rather than universally.
7. Preserve candidate findings and pre-remediation evidence before LEAP.
8. Reduce false confidence without forcing every ambiguity into a “code bug.”
9. Make strict status or promotion gates depend on evidence, not marker presence
   alone.
10. Produce measurements that can calibrate whether the added controls improve
    defect prevention and discovery.

### 3.2 Non-goals

- Replacing REQ/ARCH/IMPL with generated tests or a model.
- Making tests the authority for desired behavior.
- Automatically changing canonical project YAML from an agent suspicion.
- Requiring mutation, fuzz, load, accessibility, or security testing for every
  low-risk documentation or internal change.
- Claiming formal verification from heuristic or LLM-generated counterexamples.
- Conflating a valid binding inventory with executable proof that the binding
  works.
- Replacing TDD, module validation, composition evidence, E2E constraints,
  CITDP, LEAP, or TIED consistency validation.
- Using raw token count or line coverage as a semantic-adherence score.

---

## 4. Operating principles

### 4.1 Falsifiability before confirmation

Every gate should ask what evidence would make the claim fail. A review that
only searches for confirming examples is incomplete.

### 4.2 Edge-by-edge translation

Assess each edge separately:

- vocabulary → REQ;
- REQ → ARCH;
- ARCH → IMPL;
- IMPL → tests;
- IMPL → code;
- test oracle → observed code behavior;
- module units → composition binding;
- approved stack → user/developer documentation;
- operational evidence → reviewed LEAP feedback.

Do not infer the origin layer from the discovery layer. A unit test can discover
a REQ ambiguity; a user report can expose an ARCH-to-IMPL omission.

### 4.3 Bidirectional completeness

For each IMPL block:

- **Direction A — specification to evidence:** every contract row, procedure
  step, branch, failure mode, effect, data transition, ordering rule, and
  delegation must have matching test and production evidence.
- **Direction B — evidence to specification:** every meaningful production
  branch, early return, thrown/returned error, side effect, collaborator call,
  and test assertion must be represented by the IMPL or classified as
  incidental/non-behavioral with rationale.

### 4.4 Independent oracle construction

At least one adversarial test-design pass should use only the upstream REQ/ARCH
and declared invariants, without reading the production implementation. This
reduces the chance that tests encode the same local implementation assumptions.

### 4.5 Negative controls

A gate must be tested with a known-bad fixture or mutation. “Passes on valid
input” is insufficient evidence that a validator detects the failure it claims
to detect.

### 4.6 Risk proportionality

The baseline-functional profile receives bounded counterexamples, negative
controls, block mapping, and composition fault checks. Mutation, property,
metamorphic, fuzz, deterministic replay, concurrency, security abuse cases, and
performance controls are selected by applicable assurance profiles and changed
module risk.

### 4.7 Evidence before status

`Implemented`, `Active`, promotion, and close-out claims should derive from
passing evidence appropriate to the claim. Marker presence alone must not
activate a requirement or IMPL.

### 4.8 Findings before mutation

Adversarial observations enter the existing finding lifecycle:

```text
observed → triaged → confirmed / dismissed / deferred
  → linked → remediated → verified
```

Research and ordinary development observations must not write directly to
canonical REQ/ARCH/IMPL. Confirmed remediation is a separate LEAP operation.

---

## 5. Adversarial inquiry by translation edge

### 5.1 Domain vocabulary → REQ

**Objective:** Prevent sponsor language, synonyms, overloaded concepts, and
missing distinctions from producing a technically testable but semantically
wrong requirement.

Ask:

- Which words have multiple plausible meanings?
- Which preferred term, naming bridge, or distinction is missing?
- Could the criterion pass literally while violating the sponsor’s stated goal?
- Are “all,” “any,” “never,” “eventually,” “same,” “unique,” “valid,” and
  “secure” bounded and observable?
- What is a positive example, anti-example, boundary example, and out-of-scope
  example?
- Which behavior must remain unchanged?
- Which similar behavior is explicitly a non-goal?
- What user-visible outcome would reveal that the vocabulary-to-REQ translation
  was wrong?

Required output for behavior-changing work:

- preferred-term map;
- current, desired, unchanged, and non-goal behavior;
- criterion-level positive and negative examples;
- observable success and failure conditions;
- unresolved ambiguity recorded as a blocker rather than silently defaulted.

### 5.2 REQ → ARCH

**Objective:** Prove that the architecture preserves every criterion, invariant,
boundary, and dependency without introducing an ungoverned bypass.

Ask:

- Which ARCH mechanism enforces each REQ criterion?
- Can a valid-looking call path bypass that mechanism?
- What invalid state can the architecture represent?
- What happens under retry, concurrency, restart, partial failure, timeout, or
  stale revision?
- Are ownership and mutation boundaries explicit?
- Can two modules satisfy their local contracts while violating the system
  invariant?
- Does the selected design preserve unchanged behavior and non-goals?
- Which rejected alternative would expose a hidden assumption in the chosen
  design?

Required output:

- criterion-to-constraint mapping;
- invariant and ownership map;
- failure and recovery boundaries;
- ordering and concurrency constraints;
- explicit architectural counterexamples and their mitigations.

### 5.3 ARCH → IMPL pseudo-code

**Objective:** Ensure the language-agnostic implementation prescription is a
complete, internally consistent transform of architecture and requirements.

Ask:

- Are PRE and POST predicates strong enough to exclude invalid behavior?
- Are EFFECTS truthful and complete?
- Is FAILURE_MODES a closed set for every fallible path?
- Does DATA_TRANSITION cover success, failure, retry, and partial-progress
  outcomes?
- Is TERMINATION stated for loops, recursion, waits, retries, and polling?
- Are all architecture ordering constraints represented?
- Are shared-data and composed-IMPL assumptions compatible?
- Can the same procedure name conceal two different meanings?
- Is there a branch, delegation, or environment dependency that appears in ARCH
  but not IMPL?
- Can a pseudo-code step be implemented in a way that technically follows the
  words but violates the intended invariant?

Required output:

- contract and branch catalog;
- closed failure-mode inventory;
- shared-state and ordering notes;
- cross-IMPL dependency links;
- at least one counterexample per high-risk contract or a bounded N/A rationale.

### 5.4 IMPL pseudo-code → tests

**Objective:** Make tests capable of falsifying the IMPL rather than merely
illustrating its happy path.

Ask:

- Does each success POST have an assertion?
- Does every named failure mode have a test that distinguishes it from the
  others?
- Does setup satisfy PRE, or is the test accidentally exercising undefined
  input?
- Which boundary value, empty/minimal input, malformed/extreme input, duplicate,
  stale value, retry, or ordering case is absent?
- Can the assertion pass without observing the declared effect?
- Is the test coupled to the implementation’s private structure rather than the
  contract?
- Which incorrect implementation would still pass?
- Was any adversarial case derived independently from REQ/ARCH rather than from
  the implementation?

Required output:

- block-to-test-group mapping;
- assertion-to-POST/failure-mode mapping;
- adversarial case catalog;
- expected RED reason;
- declared fault or mutation each critical test is expected to detect.

### 5.5 Tests → production code

**Objective:** Show that tests reject realistic incorrect implementations and
that code preserves the current IMPL contract.

Apply, when relevant:

- mutation testing for branch inversions, removed checks, altered comparisons,
  missing calls, wrong return variants, and swallowed errors;
- property testing for invariants over generated input ranges;
- metamorphic testing when no simple oracle exists but transformations should
  preserve or predict outcomes;
- fuzzing for parsers, untrusted input, serialization, protocol, and file
  boundaries;
- differential testing against a trusted implementation or executable model;
- deterministic replay for retries, concurrency, state transitions, and agent
  workflows;
- fault injection for IO, network, persistence, dependency, and timeout
  failures;
- harness self-tests that prove fixtures, fakes, clocks, randomness, and
  dependency injection do not suppress the behavior under test.

Every applied technique must record:

- selected assurance profile and trigger;
- exact command, seed, repeat count, threshold, and environment;
- surviving failures or mutations;
- proof boundary and limitation;
- owner and expiry for a waiver or accepted residual risk.

### 5.6 Module units → composition bindings

**Objective:** Prove that independently valid units are connected correctly.

For each binding, adversarially alter:

- trigger delivery;
- channel or entry point;
- selected callee;
- argument identity, shape, or ordering;
- call count and idempotency behavior;
- effect propagation;
- ordering relative to other bindings;
- failure routing and recovery;
- cancellation, timeout, retry, or resume behavior.

The composition test must fail when an applicable fault is injected. A binding
inventory row or boolean assertion supplied by a caller is not sufficient by
itself.

E2E remains additive. Use it only when a named platform constraint prevents
UI-free composition testing.

### 5.7 Stack → documentation and operational feedback

**Objective:** Prevent generated views, README text, changelogs, incidents, or
runtime observations from silently becoming alternate intent.

Ask:

- Does documentation describe current approved behavior or a stale projection?
- Does the operational observation contradict implementation, specification, or
  only an environmental assumption?
- Is the observed behavior a product defect, specification change,
  implementation lag, missing specification, or unresolved case?
- Which first divergent edge is supported by evidence?
- Would remediation overwrite pre-remediation evidence?

Operational observations remain findings or reviewed LEAP proposals until
promoted through the existing human-review boundary.

---

## 6. Ranked recommendations

Priority rankings describe implementation order and gate strength. P0 is
required before strict semantic-adherence claims. P1 adds executable assurance.
P2 scales and calibrates the controls. P3 is advanced research that must not
block the foundation.

### P0 — Required foundation

#### P0.1 Create a block-level obligation model

**Why first:** Current token/file occurrence cannot establish criterion or block
semantics. Every later fidelity and adequacy check needs a stable unit of
comparison.

Define a versioned logical record containing:

```text
obligation_id
requirement_token
requirement_criterion_id
architecture_tokens and constraint_ids
implementation_token
implementation_block_name
  criterion_identity
  block_identity
  block_revision
  identity_derivation
  source_revision
test_loci and assertion_ids
production_loci
binding_ids when applicable
adversarial_case_ids
evidence_refs
proof_boundaries
status and unresolved_reason
```

The record should reference canonical artifacts rather than copy full REQ, ARCH,
IMPL, test, or source bodies. Identity derivation must specify canonical
whitespace and line-ending normalization, token and block-name normalization,
semantic digest inputs and omitted fields, rename aliases or migrations,
legacy-project fallback, and duplicate/collision handling. A semantic edit
changes `block_revision`; a non-semantic formatting change does not. A rename
preserves identity only through an explicit alias or deterministic migration
record.

Open storage decision:

- IMPL detail extra fields;
- an evidence-manifest extension;
- a feature/task projection;
- or a separate generated, non-canonical obligation index.

The selected storage must preserve one canonical source of intent and support
stable criterion/block identities.

**Exit criteria:**

- every changed REQ criterion maps to one or more ARCH constraints and IMPL
  blocks;
- every changed IMPL block maps to test and production loci or an explicit
  justified boundary;
- stale or unresolved references fail deterministically;
- generated obligation data cannot replace canonical TIED records.

#### P0.2 Implement statement-level bidirectional fidelity analysis

**Why:** The current fidelity implementation proves locus presence, not
reliability or completeness.

Extend the fidelity audit to:

1. Parse IMPL contracts, steps, branches, failure modes, effects, transitions,
   ordering, and delegations with source locations.
2. Normalize adapter-supplied test assertions and production behaviors into a
   comparable evidence vocabulary.
3. Produce Direction A and Direction B matrices.
4. Classify each block:
   - `PASS` — reliable and complete;
   - `RELIABLE_INCOMPLETE` — no false statements but missing behavior;
   - `UNRELIABLE` — at least one false, stale, contradictory, or misordered
     statement;
   - `UNRESOLVED` — insufficient or conflicting evidence.
5. Prohibit `PASS` based solely on the existence of test and production loci.
6. Preserve diagnostics with source location, evidence references, confidence,
   and proof boundary.

Language-specific behavior extraction belongs in adapters. The core fidelity
model remains language-agnostic.

**Exit criteria:**

- known false statements produce reliability findings;
- known missing behavior produces completeness findings;
- reordered steps, wrong delegations, missing errors, and unobserved effects are
  detectable in fixtures;
- absent or ambiguous evidence produces `UNRESOLVED`, never false `PASS`;
- reports are deterministic for the same artifact snapshot and configuration.

#### P0.3 Preserve separate proof boundaries

Define and report these evidence classes separately:

1. **Traceability structure** — tokens, indexes, detail files, block references.
2. **Pseudo-code structure** — contracts, symbols, dependencies, declared
   coverage.
3. **Semantic fidelity** — statement/evidence agreement and completeness.
4. **Executable behavior** — observed unit, composition, E2E, mutation,
   property, fuzz, replay, and fault-injection results.
5. **Human decision** — ambiguity resolution, waiver, residual-risk acceptance,
   and finding adjudication.

No result may be promoted as proof of another class.

**Exit criteria:**

- every report and evidence record includes a proof boundary;
- structural success is never labeled runtime correctness;
- an executable test result does not claim REQ completeness without fidelity
  evidence;
- human acceptance is stored separately from machine-derived results.

#### P0.4 Integrate inquiry into the canonical checklist

Add bounded adversarial questions to existing steps rather than creating a
parallel workflow:

- `translate-sponsor-intent` / `change-definition` — anti-examples, ambiguity,
  unchanged behavior, non-goals.
- `impact-discovery` — first-divergence hypotheses and affected obligation
  inventory.
- `risk-assessment` — select assurance profiles and adversarial depth.
- `author-requirement` — criterion positive/negative examples.
- `author-architecture` — criterion-to-constraint and invalid-state analysis.
- `catalog-pseudocode-contracts` — closed failure, state, ordering, and
  termination catalog.
- `flag-insufficient-specs` / `flag-contradictory-specs` — counterexample-driven
  findings.
- `gate-pseudocode-validation` — structural pass plus adversarial contract
  review; no runtime claim.
- `test-strategy` — independent oracle source and applied adequacy techniques.
- `unit-test-red` — expected failure reason and targeted fault/mutation.
- `unit-test-green` / `three-way-alignment-unit` — bidirectional block check.
- `composition-integration` — binding fault injection.
- `verification-gate` — full fidelity matrix plus executable evidence.
- `sync-tied-stack` — reviewed LEAP only for confirmed divergence.
- `traceable-commit` — evidence provenance, open findings, waivers, and proof
  boundaries.

**Exit criteria:**

- no new parallel implementation checklist;
- low-risk work has bounded requirements rather than universal ceremony;
- later-phase divergence routes back to the correct pseudo-code/ARCH/REQ owner;
- high-risk unresolved error findings block verification.

#### P0.5 Add negative controls and harness self-tests

For each validator or evidence gate, maintain known-bad fixtures such as:

- missing REQ/ARCH/IMPL token;
- valid tokens attached to the wrong block;
- missing PRE, POST, effect, failure mode, transition, or termination;
- inverted condition;
- removed error return;
- stale pseudo-code step;
- added production branch absent from IMPL;
- vacuous test assertion;
- swallowed dependency failure;
- removed composition call;
- wrong callee, arguments, ordering, or effect;
- structural pass paired with runtime failure.

The test harness must demonstrate that each injected defect is detected at the
claimed boundary.

**Exit criteria:**

- every blocking diagnostic has at least one fixture that triggers it;
- tests fail if a detector is disabled;
- fixture provenance records the exact expected finding;
- negative controls run in CI for the methodology tooling.

#### P0.6 Keep findings review-gated before LEAP

Use the existing append-only finding lifecycle and read-only research boundary.
Adversarial inquiry produces candidate findings first. A confirmed finding must
record:

- specification state;
- discovery layer;
- suspected and adjudicated origin layer;
- first divergent edge;
- current and desired behavior;
- reliability/completeness dimension;
- evidence locations and revisions;
- severity, confidence, and proof boundary;
- reviewer decision;
- recommended LEAP action.

**Exit criteria:**

- analysis cannot mutate audited project TIED YAML;
- pre-remediation evidence is retained;
- dismissed, deferred, unresolved, and confirmed findings remain distinct;
- remediation is a separately authorized pass;
- LEAP updates IMPL first and propagates to ARCH/REQ only when scope changed.

### P1 — Executable assurance

#### P1.1 Execute risk-triggered test-adequacy techniques

Extend adequacy from plan validation to adapters that execute and normalize:

- mutation testing;
- property testing;
- metamorphic testing;
- fuzzing;
- deterministic replay;
- flaky-test detection;
- harness self-tests;
- applicable dependency, maintainability, and external-call controls.

Do not put language-specific runners into the language-agnostic core. Each
project declares supported commands and proof boundaries.

**Exit criteria:**

- command identity, version, cwd, seed, repeat count, timeout, threshold, result,
  and artifacts are retained;
- surviving mutations and minimized counterexamples become findings;
- unsupported techniques produce explicit limitations, not guessed commands;
- high-risk profile obligations require evidence or owner/expiry-bound waivers.

#### P1.2 Add mutation targets tied to IMPL contracts

Prefer semantic mutants over indiscriminate mutation counts:

- negate PRE checks;
- weaken or remove POST effects;
- change boundary comparisons;
- remove or merge failure variants;
- skip DATA_TRANSITION;
- reorder composed calls;
- replace collaborator identity;
- swallow exceptions;
- alter retry/idempotency rules;
- bypass authorization or validation.

Map each mutant to the IMPL block and REQ criterion it challenges.

**Exit criteria:**

- critical blocks declare applicable mutant classes;
- surviving critical mutants block or require explicit accepted risk;
- mutation score is reported with classes and denominators, not as an isolated
  percentage;
- equivalent mutants can be reviewed and classified without silently inflating
  success.

#### P1.3 Add executable binding fault injection

Create adapters that run the real composition test while replacing one binding
property at a time. The test must fail for applicable:

- missing trigger;
- wrong channel;
- wrong callee;
- wrong arguments;
- missing effect;
- incorrect ordering;
- failure suppression;
- duplicate delivery;
- retry/resume corruption.

**Exit criteria:**

- a valid inventory row without executable evidence cannot receive a binding
  pass;
- every changed binding has at least one meaningful negative control;
- UI-free evidence is preferred;
- E2E-only status requires a named platform constraint.

#### P1.4 Separate specification-derived and implementation-derived test design

Use two passes:

1. **Conformance pass:** derive tests from IMPL contracts and blocks.
2. **Adversarial pass:** derive tests from REQ criteria, ARCH invariants, quality
   profiles, and domain boundaries without seeing production internals.

Compare the case sets. Missing overlap is not automatically a defect, but every
unique high-risk case requires classification.

**Exit criteria:**

- the source artifact set for each test-design pass is recorded;
- independent cases are traceable to REQ/ARCH and later mapped to IMPL;
- implementation details do not silently define desired behavior;
- unresolved conflicts route to specification review before code changes.

#### P1.5 Add evidence-gated status and promotion policy

When verification-gated mode is enabled, require:

- passing applicable tests;
- no unresolved error-severity structural or fidelity finding;
- complete changed-block obligation mapping;
- passing changed-binding composition evidence;
- required assurance evidence or accepted-risk decision;
- current TIED consistency and pseudo-code validation.

Do not demote unrelated records because a scoped run lacks their evidence.

**Exit criteria:**

- status updates are scoped and reproducible;
- marker-only presence cannot activate a record;
- evidence revisions identify the exact commit and configuration;
- overrides are explicit, owned, expiring, and visible.

### P2 — Scale, calibration, and adoption

#### P2.1 Add incremental CI scoping

Use diff impact and dependency traversal to select changed:

- REQ criteria;
- ARCH constraints;
- IMPL blocks;
- test groups;
- production loci;
- bindings;
- assurance profiles.

Run full expensive analysis periodically and targeted analysis on ordinary
changes. Sampling must never exclude known high-risk or unresolved findings.

**Exit criteria:**

- scope selection is deterministic and inspectable;
- removed tokens and code are included in impact analysis;
- strict mode cannot silently skip an unresolved impacted block;
- full and incremental runs use the same evidence schema.

#### P2.2 Pilot and calibrate before universal strictness

Run a representative pilot across:

- different TIED maturity levels;
- multiple languages and test frameworks;
- unit-only and binding-heavy changes;
- high-severity incidents;
- successful control changes;
- greenfield and brownfield work.

Apply strict blocking only to already-defined correctness, security, or
data-integrity errors and to new rules that have passed the eligibility criteria
in §10.2; keep other new semantic observations visible but non-blocking.

**Exit criteria:**

- candidate-to-confirmed precision is measured;
- false positives and false negatives are reviewed;
- audit effort and runtime cost are reported;
- strict gates are enabled only where evidence shows acceptable precision and
  value.

#### P2.3 Measure semantic-adherence outcomes

Primary metrics:

- percentage of changed blocks reliable and complete;
- missing behaviors per changed block;
- false/stale pseudo-code statements per changed block;
- REQ criteria with complete obligation paths;
- declared success, failure, invariant, and boundary coverage;
- critical mutation survival by class;
- binding negative-control pass rate;
- time from divergence to discovery;
- time from confirmed finding to verified LEAP correction;
- candidate-to-confirmed finding ratio;
- reviewer agreement;
- structural-gate false negatives;
- escaped defects per 100 behavior-changing changes;
- audit effort and execution cost.

Guardrails:

- use behavior-changing change count as the main denominator;
- do not use token count as a quality metric;
- do not compare projects without normalizing roots, exclusions, versions, and
  test classifiers;
- do not use the same audit outcome both to define and predict an incident.

#### P2.4 Improve reviewer ergonomics

Generate compact reports that lead with:

- scope and specification state;
- failed obligations;
- first divergent edge;
- source-located reliability/completeness findings;
- surviving mutants or counterexamples;
- affected bindings;
- proof boundaries;
- recommended LEAP action;
- unresolved decisions.

Keep full matrices and command artifacts available without forcing every reader
through them.

#### P2.5 Publish client adoption guidance

Document:

- baseline low-risk workflow;
- high-risk profile expansion;
- supported language adapters;
- offline/manual behavior;
- warn-only versus strict policy;
- finding review and LEAP promotion;
- waiver/expiry handling;
- examples of structural pass with semantic/runtime failure.

Client projects must retain the ability to configure roots, classifiers,
commands, thresholds, and applicable profiles without editing inherited
methodology YAML.

### P3 — Advanced research

#### P3.1 Generate adversarial cases from normalized contracts

Explore deterministic generation from:

- PRE negation;
- POST violation;
- each FAILURE_MODE;
- state-transition invalid edges;
- ordering permutations;
- boundary partitions;
- metamorphic relations;
- declared invariants.

Generated cases remain proposals until reviewed. Generation success is not test
adequacy.

#### P3.2 Add semantic diffing for IMPL revisions

Compare normalized prior/current contracts to identify:

- strengthened/weakened PRE;
- changed POST;
- added/removed failure modes;
- altered effects or data transitions;
- changed ordering/dependencies;
- new or removed blocks.

Use the diff to select tests, mutations, bindings, and LEAP propagation.

#### P3.3 Explore executable models for selected domains

For state machines, parsers, schedulers, and deterministic transforms, evaluate:

- model-based tests;
- reference interpreters for a constrained IMPL subset;
- temporal properties;
- state-transition exploration;
- differential execution.

Do not claim general executable semantics for unrestricted prose pseudo-code.

#### P3.4 Explore formal methods only where justified

For high-consequence bounded components, consider:

- schema and invariant solvers;
- model checking for finite state machines;
- property proofs for deterministic pure functions;
- concurrency schedule exploration.

Formal artifacts require their own proof boundaries and maintenance ownership.

#### P3.5 Develop risk prediction only after calibrated evidence exists

Potential predictors include:

- missing or frequently changed IMPL contracts;
- vocabulary drift;
- high branch/failure density;
- binding count;
- surviving mutation classes;
- repeated LEAP loops;
- stale specification state;
- low reviewer agreement.

Do not use predictive scores as automatic defect labels. Use them only to select
review depth after validating precision and bias.

---

## 7. Proposed artifact contracts

These are conceptual contracts for implementation planning, not authorized file
schemas.

### 7.1 Block obligation

```yaml
schema_version: tied-block-obligation.v1
obligation_id: stable-id
requirement:
  token: REQ-EXAMPLE
  criterion_id: CRIT-001
architecture:
  constraints:
    - token: ARCH-EXAMPLE
      constraint_id: CONST-001
implementation:
  token: IMPL-EXAMPLE
  block: EXAMPLE_WORKFLOW
  revision: content-hash-or-record-revision
tests:
  - locus: path-and-symbol
    assertions: [ASSERT-001]
production:
  - locus: path-and-symbol
bindings: []
adversarial_cases: []
evidence_refs: []
proof_boundaries: []
status: mapped | incomplete | unresolved | verified
```

### 7.2 Adversarial case

```yaml
schema_version: tied-adversarial-case.v1
case_id: stable-id
obligation_id: stable-id
source: requirement | architecture | implementation | quality-profile | finding
challenge_kind: anti-example | boundary | mutation | property | metamorphic | fuzz | fault-injection
claim_challenged: bounded-description
setup: bounded-description
expected_observation: bounded-description
test_locus: optional
evidence_ref: optional
result: planned | killed | survived | failed | waived | not_applicable
proof_boundary: bounded-claim
```

### 7.3 Fidelity finding

Reuse the existing finding model and add, if absent:

```text
obligation_id
direction: specification_to_evidence | evidence_to_specification
dimension: reliability | completeness
statement_or_behavior_id
adversarial_case_id
expected and observed behavior
source locations
first divergent edge
specification state
confidence
proof boundary
recommended LEAP target
```

### 7.4 Gate result

```text
scope and artifact revisions
structural results
semantic-fidelity results
executable evidence results
human decisions
blocking findings
accepted risks and expiry
proof boundaries
suggested status/promotion action
```

---

## 8. Recommended implementation batches

### Batch 0 — Contracts, vocabulary, fixtures, and TIED preparation

Resolve terminology and ownership; define conceptual obligation, adversarial
case, finding, gate, evidence, and proof-boundary contracts; specify content-
derived identity; and create deterministic language-neutral known-good,
known-bad, and negative-control fixtures. Produce a draft CITDP analysis and
token-commented IMPL pseudo-code. Persist the CITDP record only after
behavior-changing implementation evidence exists, unless project policy
explicitly permits a planning-only record.

**Gate:** pseudo-code structural validation, TIED YAML validation, deterministic
fixtures, no duplicate source of intent, and no analyzer beyond approved
identity/fixture foundations.

### Batch 1 — Language-neutral obligation graph and read-only projection

Implement independently testable identity resolution, graph construction,
stale-reference validation, and read-only reporting. Map
REQ criterion → ARCH constraint → IMPL block → test/production loci → bindings.
Cover malformed, duplicate, stale, unresolved, and cross-revision references.

**Gate:** unit and composition tests pass; output is deterministic; analysis
cannot mutate canonical project YAML; generated data remains non-canonical.

### Batch 2 — Language-neutral statement-level fidelity engine

Implement contract/step normalization, test-evidence and production-behavior
interfaces, Direction A and Direction B matchers, verdicts
(`PASS`, `RELIABLE_INCOMPLETE`, `UNRELIABLE`, `UNRESOLVED`), source locations,
evidence references, confidence, and proof boundaries. Locus presence alone
cannot produce `PASS`; detect false statements, missing behavior, wrong
delegation, missing errors, reordered steps, and unobserved effects.

**Gate:** all verdict fixture classes pass, diagnostics are source-located and
deterministic, and unresolved evidence never becomes `PASS`.

### Batch 3 — Ruby Minitest vertical slice

Analyze one existing `scripts/*_test.rb` module end-to-end. Initially support
`assert`, `assert_equal`, `assert_empty`, `assert_raises`, and `refute`.
Unsupported constructs produce `UNRESOLVED` with `unsupported_adapter`.
Record whether cases derive from IMPL or independently from REQ/ARCH. This
batch does not promote strict status until strict-mode eligibility is met.

**Gate:** one real scripts module is analyzed end-to-end; all fixture verdict
classes are detected; adapter validation, TypeScript checks, and Ruby checks
pass.

### Batch 4 — Checklist, findings, evidence, and scoped status integration

Extend the existing checklist and finding lifecycle; do not create a parallel
workflow. Add adversarial questions, negative controls, risk-triggered
assurance selection, composition checks, verification evidence, and review-
gated LEAP handoff. Keep structural, semantic, executable, and human proof
boundaries separate. Scoped verification must not demote unrelated records.

**Gate:** checklist and gate-reporter composition tests pass; findings remain
review-gated; scoped status projection is isolated from unrelated records.

### Batch 5 — Executable assurance and controlled composition faults

Add only risk-triggered mutation, property/metamorphic, fuzz, replay, harness
self-test, and controlled-seam fault-injection adapters. Require argv-only
bounded execution, timeout/output limits, seed/version/cwd/threshold capture,
redaction, and fail-closed unsupported commands. `not_applicable` requires a
named limitation; inventory presence cannot establish executable proof.

**Gate:** every blocking detector has a known-bad fixture; critical mutants are
killed or explicitly reviewed; unsupported commands fail closed.

### Batch 6 — Strict eligibility, pilot, calibration, and client guidance

Enable strict blocking only after negative controls, bounded deterministic
execution, explicit proof boundaries, deterministic scope selection,
false-positive handling, waiver support, and representative evidence exist.
Measure changed-block denominators, verdict/finding rates, negative-control
detection, reviewer agreement, escaped-defect association (not causality
without study design), discovery/remediation time, and local/CI cost. Enforce
the five-minute local and fifteen-minute CI budgets; stop expansion after two
consecutive breaches. Document client configuration and offline behavior,
close the CITDP with evidence, validate vocabulary, and defer P3 research.

---

## 9. Validation strategy for the new tooling

### 9.1 Unit tests

Validate each parser, normalizer, matcher, classifier, identity resolver, and
evidence formatter independently with:

- valid minimal input;
- malformed and oversized input;
- missing and duplicate identifiers;
- stale revisions;
- ambiguous mappings;
- branch, error, state, effect, and ordering variants;
- deterministic output.

### 9.2 Property and metamorphic tests

Examples:

- adding irrelevant whitespace must not change normalized block identity;
- reordering unordered evidence must not change a verdict;
- removing matched evidence cannot improve completeness;
- adding a contradiction cannot improve reliability;
- replacing a passing locus with an unresolved locus cannot produce PASS;
- duplicate findings link rather than inflate counts.

### 9.3 Mutation tests

Target the methodology tooling itself:

- disable a diagnostic;
- invert verdict comparison;
- accept a missing locus;
- ignore a failure mode;
- treat unresolved as PASS;
- skip a binding field;
- drop proof-boundary labels.

The test suite must kill these critical mutants.

### 9.4 Composition tests

Prove:

- diff/scope selection → obligation analyzer;
- TIED/detail/sidecar reads → normalized block graph;
- adapters → fidelity matcher;
- fidelity and executable evidence → gate reporter;
- findings → review boundary;
- approved remediation handoff → existing LEAP workflow.

### 9.5 E2E

No E2E is required for language-agnostic analysis modules, MCP handlers, CLI
adapters, or report generation when they are programmatically invokable. E2E is
reserved for a named platform/UI constraint.

### 9.6 Verification evidence

Each batch records:

- exact test, build, lint, and validator commands;
- tool and runtime versions;
- commit and configuration;
- results, thresholds, seeds, repeat counts, and artifacts;
- covered tokens and obligations;
- proof boundaries;
- limitations and accepted risks.

---

## 10. Promotion and strictness policy

### 10.1 Initial rollout and strict-mode eligibility

During initial rollout, structural schema/token errors and already-defined
correctness, security, or data-integrity errors remain blocking. New semantic
fidelity rules remain non-blocking only until their eligibility criteria are
demonstrated; unresolved findings remain visible and can never be counted as
`PASS`.

### 10.2 Strict-mode eligibility

A new fidelity or adequacy rule may become blocking only when:

1. its claimed failure has a negative-control fixture;
2. the detector is deterministic or bounded by a recorded seed/configuration;
3. its proof boundary is explicit;
4. applicable scope is deterministic;
5. false-positive handling and remediation are documented;
6. waiver ownership and expiry are supported;
7. representative evidence and acceptable pilot precision are recorded.

### 10.3 High-risk minimum

For selected high-risk profiles, verification should require:

- complete changed-block obligations;
- no unresolved error-severity fidelity findings;
- success and failure-path tests;
- binding negative controls for changed seams;
- selected mutation/property/fuzz/replay evidence;
- review of surviving critical mutations or counterexamples;
- current TIED and pseudo-code validation;
- owner/expiry for any accepted residual risk.

---

## 11. Risks and mitigations

### 11.1 Correlated oracle risk

**Risk:** REQ, pseudo-code, tests, and code repeat the same misunderstanding.

**Mitigation:** Independent REQ/ARCH-derived adversarial test design, anti-
examples, and reviewer separation.

### 11.2 False semantic confidence

**Risk:** Heuristic parsing is reported as behavioral proof.

**Mitigation:** Separate proof boundaries and retain `UNRESOLVED`.

### 11.3 Specification pollution

**Risk:** Agent-generated counterexamples automatically change canonical intent.

**Mitigation:** Candidate finding lifecycle and review-gated LEAP.

### 11.4 Stale tests treated as authority

**Risk:** Tests still represent prior specification state.

**Mitigation:** Reconstruct prior/current specification before classification.

### 11.5 Ceremony and execution cost

**Risk:** Full mutation/fuzz/fidelity analysis slows ordinary work.

**Mitigation:** Risk profiles, incremental scope, periodic full runs, and bounded
N/A rationale.

### 11.6 Gaming markers and coverage

**Risk:** Teams add tokens, assertions, or shallow tests to satisfy gates.

**Mitigation:** Obligation-level semantics, mutation targets, negative controls,
and evidence review.

### 11.7 Equivalent or noisy mutants

**Risk:** Mutation score penalizes behaviorally equivalent changes.

**Mitigation:** Classify mutant types, permit reviewed equivalence, report
denominators and survivors.

### 11.8 LLM nondeterminism

**Risk:** Generated adversarial cases vary or overstate confidence.

**Mitigation:** Treat generated cases as proposals, record model/configuration,
require deterministic core validators and human review.

### 11.9 Adapter inconsistency

**Risk:** Language adapters normalize behavior differently.

**Mitigation:** Versioned adapter contracts, shared conformance fixtures, and
independent module validation.

### 11.10 Wrong project boundary

**Risk:** Analysis or remediation targets the wrong TIED tree.

**Mitigation:** Confirm absolute TIED base path for every project; keep analysis
read-only and remediation separate.

### 11.11 Sensitive evidence

**Risk:** Fuzz inputs, source excerpts, logs, or model prompts expose secrets.

**Mitigation:** Bounded artifacts, redaction, local storage policy, and reference
paths instead of unrestricted source copying.

### 11.12 Strict-gate false positives

**Risk:** New rules block valid changes and erode trust.

**Mitigation:** Bounded rollout, eligibility-gated promotion, precision
measurement, explicit waiver audit, and phased subset expansion.

---

## 12. Decisions resolved before Batch 0

1. **Vocabulary:** “adversarial inquiry” remains descriptive unless Batch 0
   vocabulary review promotes it; no token is created solely for the phrase.
2. **Traceability:** extend existing fidelity/quality REQ/ARCH/IMPL records where
   ownership fits; create a new chain only for materially new obligation-graph
   or strict-gate behavior.
3. **Criterion identity:** use the requirement token plus an explicit stable
   criterion identifier; do not derive identity from display text alone.
4. **Block identity:** derive it from normalized token, block name, and semantic
   block content; preserve revisions separately from identity.
5. **Generated storage:** keep obligation graphs, normalized evidence, reports,
   and pilot measurements generated or append-only outside canonical intent.
6. **Evidence split:** reproducible command/validator results belong in the
   verification evidence manifest; research observations and adjudicated cases
   belong in the research dataset/finding ledger.
7. **Blocking policy:** existing structural and high-risk correctness,
   security, and data-integrity rules remain blocking; new semantic rules block
   only after strict-mode eligibility.
8. **Assurance selection:** baseline-functional is universal; specialized
   profiles are selected only by their documented triggers.
9. **Mutation policy:** report semantic mutant classes and denominators;
   critical survivors require remediation or explicit accepted risk, while
   equivalent mutants require review rather than silent success.
10. **First adapter:** Ruby Minitest only, using the supported assertion subset
    defined in Batch 3.
11. **Independent design:** record the source artifact set for each conformance
    and adversarial test-design pass; adversarial cases must be derived without
    production internals.
12. **Waivers:** represent owner, expiry, proof boundary, rationale, and
    residual risk in the gate/evidence record.
13. **Budget:** default maximum is five minutes locally and fifteen minutes in
    CI; two consecutive breaches stop expansion.
14. **Historical projects:** derive deterministic fallback identities from
    available token, block, and normalized content data; mark the derivation as
    legacy and do not imply continuity across unavailable revisions.

Any remaining ambiguity is recorded as a Batch 0 blocker and resolved in
vocabulary, REQ/ARCH/IMPL, pseudo-code, and test strategy before RED tests.

---

## 13. Definition of success

The plan succeeds when TIED can make these bounded claims with evidence:

1. Every changed REQ criterion has a traceable architecture constraint and IMPL
   block.
2. Every changed IMPL block has mapped test and production evidence or an
   explicit justified boundary.
3. A block cannot receive PASS merely because loci or tokens exist.
4. Every pseudo-code statement is checked for reliability against evidence.
5. Every meaningful test assertion and production behavior is checked for
   representation in pseudo-code.
6. Critical tests demonstrate sensitivity to named incorrect implementations.
7. Changed composition bindings demonstrate failure under applicable
   miswiring.
8. Structural, semantic, executable, and human proof boundaries remain
   separate.
9. Findings preserve specification state, origin, divergent edge, and
   pre-remediation evidence.
10. Confirmed divergence is repaired through reviewed LEAP in the correct order.
11. Status and promotion claims derive from scoped evidence rather than token
    presence.
12. Specialized assurance remains risk-triggered and affordable.
13. Pilot data demonstrates defined precision, reviewer agreement, review effort,
   and escaped-defect association; causality is not claimed without study design.
14. Client projects can adopt the controls without editing inherited
    methodology YAML or losing offline workflows.

---

## 14. Recommended next action

Start with a separately governed **Batch 0 planning request**:

1. Run vocabulary RESOLVE for the sponsor phrase and proposed artifact names.
2. Decide whether the existing fidelity and quality traceability stack is being
   extended or whether a new behavior requirement is needed.
3. Create the per-request checklist Tracker.
4. Define the change, scope, non-goals, proof boundaries, and P0 fixtures.
5. Author or update REQ/ARCH/IMPL through the TIED YAML tool surface.
6. Complete and validate token-commented IMPL pseudo-code.
7. Write RED tests for the block-obligation schema and known-bad fixtures.
8. Implement only the Batch 0 foundation after the normal gates pass.

P1–P3 work must not start before the P0 obligation model, statement-level
fidelity semantics, proof boundaries, negative controls, checklist integration,
and review-gated finding lifecycle are stable.
