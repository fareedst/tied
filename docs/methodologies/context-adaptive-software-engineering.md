# Context-Adaptive Software Engineering

## Research Foundation, Comparative Analysis, and Proposed Adoption Methodology

Research proposal — October 2026

## 1. Executive Summary

The central research proposition is:

Software engineering should have a stable, evidence-driven process for selecting and adapting engineering practices, rather than assuming that one collection of practices is optimal for every problem.

This proposition has foundations in established research, standards, and successful industrial practice.

The proposed methodology combines:

- Situational Method Engineering for selecting and composing practices.
- Context and complexity analysis for identifying the nature of the problem.
- Risk-based engineering for determining necessary rigor.
- Verification and validation for establishing confidence in outputs.
- Evidence-based measurement for evaluating results.
- Continuous process improvement for learning which practices work under which conditions.
- AI agents for context discovery, method selection, execution, evidence collection, and evaluation.

The important distinction is between a universal engineering control process and a context-dependent engineering execution process.

The control process remains relatively stable:

```
Characterize
    |
    v
Select Practices
    |
    v
Define Evidence
    |
    v
Execute
    |
    v
Verify and Validate
    |
    v
Evaluate Outcomes
    |
    v
Improve the Method
    |
    +----> Characterize Again
```

The engineering practices inside this process change according to the problem.

This is not a proposal to replace TDD, Scrum, XP, formal verification, or other established practices. It is a proposal to place them within a higher-level process that selects, combines, and evaluates them.

### Research status

The individual foundations are well established. In particular:

- Situational Method Engineering has a research tradition in method construction, adaptation, and tailoring.&#x20;

  [image](https://www.google.com/s2/favicons?domain=https://www.sciencedirect.com\&sz=32)

  ScienceDirect

- ISO/IEC/IEEE 12207:2026 explicitly supports constructing suitable software life-cycle models from selected processes.&#x20;

  [image](https://www.google.com/s2/favicons?domain=https://standards.ieee.org\&sz=32)

  IEEE/ISO/IEC 12207-2026

- ISO/IEC 25010:2023 provides a framework for specifying and evaluating software product quality.&#x20;

  [image](https://www.google.com/s2/favicons?domain=https://www.iso.org\&sz=32)

  Product quality model

- Google's 2025 DORA research emphasizes how engineering capabilities and organizational conditions affect the benefits of AI-assisted development.&#x20;

  [image](https://www.google.com/s2/favicons?domain=https://research.google\&sz=32)

  Google Research



What remains unproven is whether combining these foundations into an autonomous, AI-first, context-adaptive methodology consistently produces better engineering results than carefully designed fixed workflows.

That is the principal hypothesis to investigate, not a conclusion to assume.

## 2. The Fundamental Distinction: Universal versus Context-Specific

Some principles should apply to nearly all serious engineering work.

Examples include explicit objectives, identifiable assumptions, consideration of failure, traceable decisions, appropriate verification, and evaluation of outcomes.

However, those principles do not imply that every project requires the same activities, artifacts, or level of rigor.

Consider three situations.

Situation A: Implementing a deterministic parser

The input and output are well defined. Requirements are stable, behavior is observable, and tests can exercise most relevant conditions.

A suitable process might emphasize specification by example, property-based testing, TDD, fuzzing, and deterministic regression tests.

Situation B: Understanding an undocumented legacy service

Requirements are incomplete. The system's actual behavior may differ from its intended behavior. Critical dependencies may be hidden.

A suitable process would emphasize code archaeology, static analysis, runtime observation, characterization tests, dependency discovery, and explicit uncertainty tracking.

Writing tests against assumed requirements before understanding the system could preserve incorrect assumptions or overlook essential behavior.

Situation C: Designing a distributed coordination protocol

Even with clear requirements, correctness may depend on message ordering, partial failures, retries, concurrency, and recovery after crashes.

A suitable process might emphasize state-machine modeling, invariants, model checking, fault injection, and testing under controlled failure conditions.

Amazon Web Services has documented using formal specifications and model checking to address difficult design problems in critical distributed systems.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.amazon.science\&sz=32)

Amazon Science



The same principle of verification applies in all three cases, but the appropriate verification method differs substantially.

The research objective is therefore to establish:

Which context characteristics should activate which engineering practices, at what level of rigor, and with what evidence of effectiveness?

## 3. Comparison of Established Foundations

The most useful research approach is to combine several existing disciplines rather than attempt to derive a new methodology from first principles.

| Foundation                           | Primary contribution                           | Strength                                     | Limitation                                                           |
| ------------------------------------ | ---------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------- |
| Situational Method Engineering (SME) | Select and compose practices                   | Directly addresses context-dependent methods | Selection criteria and measured outcomes require further development |
| OMG Essence                          | Describe modular practices and method elements | Shared vocabulary for composing methods      | Does not prescribe which practice is best in a given situation       |
| Cynefin                              | Classify decision environments                 | Distinguishes analysis from experimentation  | Not a software-specific selection algorithm                          |
| ISO/IEC/IEEE 12207                   | Define life-cycle processes                    | Standardized process coverage and tailoring  | Relatively high-level                                                |
| ISO/IEC 25010                        | Define product quality attributes              | Common language for quality evaluation       | Does not establish which process will achieve quality                |
| Assurance cases / independent V&V    | Connect claims to supporting evidence          | Explicit, auditable justification            | Assurance can become expensive and bureaucratic                      |
| Goal Question Metric (GQM)           | Derive measurements from objectives            | Prevents arbitrary metric selection          | Requires valid measurement instruments                               |
| DORA / SRE                           | Evaluate delivery and operational outcomes     | Strong operational feedback                  | Does not cover every aspect of software correctness or suitability   |
| Continuous process improvement       | Improve practices from results                 | Creates organizational learning              | Can optimize the wrong objective if metrics are invalid              |

### 3.1. Situational Method Engineering

SME provides the closest conceptual foundation.

Its basic model is to represent development methods using reusable method components, commonly called method fragments or method chunks.

A method component can describe an activity, its inputs, outputs, required capabilities, and conditions of application.

For example, property-based testing might be represented as a reusable component applicable when a meaningful set of invariants and input generators can be constructed.

SME then becomes a method-composition problem:

```
Project context
      +
Engineering objectives
      +
Method component library
      |
      v
Selection and composition
      |
      v
Project-specific engineering method
```

The 2008 research comparing method chunks and fragments addresses their different representations and composition properties. A later systematic literature review examines method adaptation, terminology, prerequisites, and unresolved challenges.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.researchgate.net\&sz=32)

ResearchGate

+1



Research opportunity: Extend conventional SME with explicit evidence requirements, measurable effectiveness, adaptive selection, and AI execution.

### 3.2. OMG Essence

The Essence standard supplies a language and kernel for describing engineering methods and practices.

It is particularly relevant because a context-adaptive methodology needs reusable practice definitions rather than large, indivisible process documents.

Essence 1.2 is a formal OMG standard. A 2.0 beta 2 specification was published in March 2026, but was still a beta at the time of this research.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.omg.org\&sz=32)

OMG

+1



Essence could provide the conceptual model for the practice library.

However, I would not initially require full Essence compliance. Its concepts are more valuable for an experimental implementation than adopting its entire modeling infrastructure.

### 3.3. Cynefin and the uncertainty problem

Cynefin contributes an important distinction that conventional software engineering methodologies sometimes obscure.

Not all problems are suitable for the same reasoning process.

| Problem condition | Appropriate reasoning pattern                      | Example                                |
| ----------------- | -------------------------------------------------- | -------------------------------------- |
| Clear             | Recognize and apply established practice           | Routine configuration update           |
| Complicated       | Analyze, compare, then implement                   | Database performance optimization      |
| Complex           | Experiment, observe, and adapt                     | Discovery of a new user workflow       |
| Chaotic           | Stabilize conditions before systematic improvement | Major uncontrolled production incident |

Snowden and Boone's 2007 framework describes why different decision contexts require different responses.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://hbr.org\&sz=32)

HBR



Cynefin is useful as an initial classifier, but it is insufficient by itself.

For example, a distributed protocol may be mathematically analyzable yet still have a high operational failure risk. A prototype may be uncertain but trivial to reverse. Those situations require additional dimensions.

Recommendation: Use Cynefin as an inspiration for decision classification, not as the complete taxonomy.

### 3.4. ISO life-cycle and quality standards

ISO/IEC/IEEE 12207:2026 provides a standardized foundation for software life-cycle processes and allows suitable life-cycle models to be constructed through selected processes.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://standards.ieee.org\&sz=32)

IEEE/ISO/IEC 12207-2026



ISO/IEC 25010:2023 identifies nine software product quality characteristics and associated subcharacteristics. It provides a way to define which qualities matter for a particular product.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.iso.org\&sz=32)

Product quality model



These standards address different questions.

12207: What kinds of engineering processes and activities should be considered?

25010: What characteristics of the resulting product should be evaluated?

SME: How should the actual method be constructed?

A proposed adaptive methodology must connect all three questions.

### 3.5. Verification, validation, and assurance cases

NASA's software IV&V guidance explicitly distinguishes verification and validation and describes using requirements, design, code, tests, static analysis, and other evidence to build confidence in software.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://swehb.nasa.gov\&sz=32)

Global Site



Assurance cases provide a particularly useful structure:

```
Claim
  |
  +-- Argument
  |      |
  |      +-- Supporting evidence
  |      +-- Assumptions
  |      +-- Limitations
  |
  +-- Unresolved objections
```

NASA describes assurance cases as structured arguments connecting engineering claims to evidence, including the reasons why that evidence is appropriate.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://sma.nasa.gov\&sz=32)

SMA NASA



The idea can be generalized beyond safety-critical software.

For example:

```
Claim:
  The parser handles all valid input records.

Argument:
  Its accepted grammar matches the documented format.

Evidence:
  Grammar specification
  Reference examples
  Property-based tests
  Fuzzing results

Limitations:
  Unknown undocumented historical record variants

Status:
  Partially verified
```

This is substantially more informative than recording that the agent completed the implementation and all generated tests passed.

## 4. Context Taxonomy: What Should Determine the Method?

I recommend beginning with a multidimensional context model.

A single label such as "legacy system" or "complex problem" is inadequate because different characteristics can coexist.

### Proposed context dimensions

| Dimension                 | Low end                      | High end                          | Engineering consequence                               |
| ------------------------- | ---------------------------- | --------------------------------- | ----------------------------------------------------- |
| Requirements uncertainty  | Explicit and stable          | Unknown or changing               | More discovery and experimentation                    |
| Behavioral uncertainty    | Well documented              | Undocumented or contradictory     | More observation and characterization                 |
| Failure criticality       | Recoverable inconvenience    | Severe or irreversible harm       | Stronger assurance and independent review             |
| Structural complexity     | Localized dependencies       | Extensive coupling                | More architectural and dependency analysis            |
| Concurrency complexity    | Sequential and deterministic | Asynchronous and nondeterministic | More state modeling and concurrency testing           |
| Observability             | Directly measurable          | Difficult to observe              | More instrumentation and inference validation         |
| Reversibility             | Easily rolled back           | Irreversible effects              | More pre-execution verification                       |
| Environmental variability | Controlled runtime           | Unreliable external dependencies  | More resilience and fault testing                     |
| Rate of change            | Stable interfaces            | Frequently changing ecosystem     | More continuous integration and compatibility testing |
| Security exposure         | Isolated, low-trust impact   | Sensitive data or hostile inputs  | Threat modeling and security assurance                |

Each dimension can initially be classified as LOW, MEDIUM, HIGH, or UNKNOWN.

UNKNOWN must not be treated as LOW.

Unknown criticality, behavior, or dependencies should trigger investigation or impose conservative controls.

The dimensions are not necessarily independent. For example, poor observability can increase behavioral uncertainty, while high coupling can make rollback more difficult. Selection rules must account for these relationships.

### Context-to-practice mapping

| Context signal                 | Candidate practices                                            | Evidence expected                                         |
| ------------------------------ | -------------------------------------------------------------- | --------------------------------------------------------- |
| High requirements uncertainty  | Prototypes, stakeholder experiments, hypothesis testing        | Observed outcomes, rejected hypotheses                    |
| High behavioral uncertainty    | Characterization tests, traces, code analysis                  | Reproducible observations tied to code                    |
| High failure criticality       | Hazard analysis, formal verification, independent V&V          | Risk arguments, verified properties, independent findings |
| High concurrency complexity    | State machines, model checking, fault injection                | Counterexamples, invariant checks, fault results          |
| High structural coupling       | Dependency graphs, seams, incremental refactoring              | Coupling analysis, regression evidence                    |
| High security exposure         | Threat modeling, static security analysis, adversarial testing | Findings, mitigations, residual risk                      |
| Low reversibility              | Simulation, dry runs, staged release, backups                  | Recovery tests and rollback feasibility                   |
| High environmental variability | Fault injection, retry analysis, contract testing              | Results under controlled failures                         |

These are initial selection hypotheses, not scientifically established universal mappings.

They should become testable hypotheses within the proposed research.

### Important complication: interacting contexts

Consider a legacy payment-processing service.

It may simultaneously exhibit:

```
Requirements uncertainty:   MEDIUM
Behavioral uncertainty:     HIGH
Failure criticality:       HIGH
Structural complexity:     HIGH
Concurrency complexity:    MEDIUM
Reversibility:             LOW
Security exposure:         HIGH
```

This should not cause the system to choose one methodology called "legacy development."

Instead, it should compose multiple compatible practices:

```
Code and dependency analysis
           +
Behavioral characterization
           +
Threat modeling
           +
Transaction invariant testing
           +
Independent validation
           +
Staged, reversible deployment
```

The method must recognize dependencies between practices.

For example, characterization may need to precede refactoring, and transaction invariants should be established before a migration that could modify stored financial records.

This is one of the strongest reasons to adopt method composition instead of whole-method selection.

## 5. Compare and Contrast: Common Engineering Methodologies

Traditional methodologies are not uniformly applicable or uniformly ineffective. Their strengths depend on assumptions.

| Practice or methodology        | Strong fit                                                          | Weaker fit or limitation                                      |
| ------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| TDD                            | Well-defined, testable behavior                                     | Requirements discovery when the correct behavior is unknown   |
| BDD / specification by example | Shared behavioral rules and examples                                | Hidden emergent behavior without a known oracle               |
| XP / continuous delivery       | Rapid feedback and reversible changes                               | Environments where deployment is costly or heavily restricted |
| Formal methods                 | Precisely expressible invariants, concurrency, critical correctness | Unstable requirements and properties not yet understood       |
| SRE                            | Measurable production reliability objectives                        | Software with no ongoing operational service                  |
| Chaos engineering              | Resilience of fault-tolerant distributed systems                    | Situations where failures cannot be safely contained          |
| Incremental modernization      | Legacy systems that can be decomposed behind boundaries             | Systems without feasible incremental seams                    |
| Experimental development       | Uncertain user value and multiple possible solutions                | Tasks with a precisely mandated outcome                       |

Two examples demonstrate why context matters.

TDD: correctness versus productivity

A systematic review of 27 studies published between 1999 and 2014 found generally favorable reported effects on software quality, but mixed productivity results, including decreased productivity in industrial settings.

This does not establish that TDD is universally preferable. It provides a reason to investigate which conditions make it worthwhile.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.sciencedirect.com\&sz=32)

ScienceDirect



Incremental modernization: risk versus overhead

A 2024 Thoughtworks case study reported median cycle times of approximately 9–10 days for newly modularized mobile components compared with 20 days for the legacy application.

The same account describes added integration complexity and testing challenges. The result is encouraging, but it is a case study, not a controlled proof that incremental replacement will produce the same results elsewhere.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://martinfowler.com\&sz=32)

martinfowler.com



### Complementarity matters more than competition

An important finding for the proposed methodology is that many practices answer different questions and should not be compared as mutually exclusive alternatives.

TDD evaluates executable behavior.

Formal methods investigate mathematically specified properties.

BDD helps establish shared expectations.

SRE evaluates operational reliability.

Security engineering evaluates threats and controls.

An effective method may combine several of them, with different depths of application.

Therefore, the research should investigate both practice selection and practice interaction.

## 6. Proposed Methodology: Evidence-Driven Situational Engineering

I propose the working name Evidence-Driven Situational Engineering (EDSE).

This is a proposed methodology, not an existing standard.

Its distinguishing feature is that the engineering process is itself an object of evaluation.

EDSE would evaluate three things separately:

1. The quality of the resulting software or engineering artifact.
2. The appropriateness and effectiveness of the method used to produce it.
3. The validity and sufficiency of the evidence supporting those evaluations.

### 6.1. The method library

The fundamental reusable unit should be a practice contract.

A practice contract describes not merely what to do, but when the practice is useful, what it requires, what it produces, and how to evaluate it.

A simple YAML representation:

```
id: PRACTICE-CHARACTERIZATION-TESTING
name: Behavioral Characterization Testing

purpose:
  Establish reproducible observations of
  existing software behavior.

applicability:
  behavioral_uncertainty: HIGH
  executable_system: REQUIRED

prerequisites:
  - Reproducible execution environment
  - Identifiable inputs and outputs

activities:
  - Identify observable behaviors
  - Capture representative input cases
  - Record actual outputs
  - Convert observations to regression tests
  - Identify unexplored behavior

evidence:
  - Executable tests
  - Test execution results
  - Input/output records
  - Known coverage gaps

limitations:
  - Existing behavior may be incorrect
  - Observed cases may not be representative

success_criteria:
  - Important observations are reproducible
  - Tests detect relevant behavioral changes

evaluation:
  - Regression detection effectiveness
  - Evidence completeness
  - Cost of execution
```

Crucially, the limitations section prevents a method from making claims beyond the evidence it produces.

For example, characterization testing can establish what a system currently does. It cannot, by itself, establish that the behavior is desirable or correct.

### 6.2. Practice selection

Initially, use explicit rules rather than asking an AI model to invent the selection process.

For each engineering request:

```
1. Determine engineering objectives.
2. Characterize the context.
3. Identify mandatory constraints.
4. Select candidate practices.
5. Check prerequisites and compatibility.
6. Estimate costs and expected benefits.
7. Construct an execution plan.
8. Define evidence and acceptance requirements.
9. Execute and evaluate.
10. Update knowledge about practice effectiveness.
```

Method selection should use two mechanisms.

Hard constraints

These eliminate unacceptable choices or impose mandatory engineering activities.

For example, safety requirements may demand independent verification. Security policies may require specific controls. An inability to recover from an operation may require a simulation or explicit authorization before execution.

NIST's Secure Software Development Framework illustrates how baseline security practices can be incorporated into different software development life cycles. As of October 2026, SSDF 1.1 remains the finalized base framework, while version 1.2 is a public draft.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://csrc.nist.gov\&sz=32)

CSRC

+1



Contextual preferences

Among acceptable practices, choose based on predicted value, information gained, effort, risk reduction, and suitability.

Initially these predictions will be heuristic.

Over time, recorded outcomes may support a more quantitative selection model.

Do not start by attempting to train an optimal policy. First establish a reliable way to record contexts, decisions, and outcomes.

### 6.3. Practice compatibility

The library should describe relationships between methods.

For example:

```
Characterization testing
    BEFORE
Behavior-preserving refactoring

Threat modeling
    INFORMS
Security testing

Requirements discovery
    BEFORE
Specification-based testing

Formal specification
    SUPPORTS
Model checking

Runtime instrumentation
    ENABLES
Operational hypothesis testing
```

These are conditional relationships, not universal ordering rules.

The planner should construct a dependency graph, checking for prerequisites, incompatibilities, duplicated work, and missing assurance activities.

### 6.4. Context should be reassessed

An engineering context is not static.

A legacy system may initially have high behavioral uncertainty. After characterization and analysis, that uncertainty may decrease enough to support a conventional test-driven implementation process.

Likewise, discovery work might reveal that a supposedly local change affects a critical distributed transaction.

The engineering method should adapt at defined checkpoints, while preserving the previous decisions and their rationale.

Uncontrolled switching between methods would introduce its own instability. Changes should require new evidence or a meaningful change in objectives or risk.

## 7. AI-First Execution Architecture

An AI-first implementation should separate responsibilities.

Not because every function requires a separate model, but because each function has different evidence requirements and potential failure modes.

| Function             | Responsibility                                               | Required output                              |
| -------------------- | ------------------------------------------------------------ | -------------------------------------------- |
| Context analyzer     | Investigate the problem and environment                      | Context profile with supporting observations |
| Method selector      | Identify suitable practices                                  | Proposed method and selection rationale      |
| Planner              | Establish dependencies, checkpoints, and acceptance criteria | Executable engineering plan                  |
| Executor             | Perform engineering activities                               | Code, tests, analysis, documentation         |
| Evidence collector   | Preserve observations and provenance                         | Evidence records                             |
| Independent verifier | Challenge claims and test results                            | Verification findings and counterexamples    |
| Evaluator            | Assess outcome and process quality                           | Evaluation report                            |
| Process improver     | Identify useful changes to methods                           | Proposed updates to the practice library     |

### A critical design principle: independent verification

The agent that implements a change should not be the sole authority deciding whether its change is correct.

For example, an implementation agent may generate code and tests using the same mistaken assumption. Passing those tests then provides less assurance than it appears to.

Independent verification should draw on other evidence: independently developed test oracles, static analyzers, specifications, runtime observations, adversarial cases, or human domain review.

Separate agents using the same underlying model and assumptions are not necessarily independent.

### A practical evidence model

Each important claim should be traceable through a small collection of linked artifacts:

```
[CONTEXT-001]
    |
    v
[DECISION-001]
    |
    v
[PRACTICE-001]
    |
    v
[ARTIFACT-001]
    |
    v
[EVIDENCE-001]
    |
    v
[CLAIM-001]
    |
    v
[EVALUATION-001]
```

An evidence record should include its source, relevant repository revision, environment, command or method of collection, result, limitations, and whether the finding can be reproduced.

This resembles the underlying ideas of assurance cases and the digital engineering thread. A September 2026 JPL research preprint describes a unified V&V activity schema linking requirements, methods, environments, and evidence. It is directly relevant emerging work, although it should not be treated as established empirical validation of EDSE.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://arxiv.org\&sz=32)

arXiv



### Avoid starting with a large agent framework

The important architecture is the separation of responsibilities and preservation of evidence, not the number of agents.

I recommend first implementing these capabilities as a deterministic workflow with a small number of AI-assisted steps.

An orchestration framework such as LangGraph could implement state transitions, conditional execution, checkpoints, and human approvals. However, the engineering methodology should remain portable across agent frameworks.

The process is the system of record; the agent framework is an implementation mechanism.

## 8. Verification, Validation, and Grading

The proposed methodology needs stronger evaluation than "all tests pass."

I recommend four independent evaluation dimensions.

### 8.1. Product correctness

Does the resulting software satisfy its requirements and intended behavior?

Possible evidence includes executable tests, independently constructed examples, invariants, model-checking results, performance benchmarks, and stakeholder validation.

### 8.2. Evidence quality

Can the claims be justified from the recorded evidence?

Evaluate provenance, reproducibility, coverage of important claims, independence, contradictory findings, and acknowledged limitations.

### 8.3. Method appropriateness

Was the selected process suitable for the problem?

For example, did it recognize concurrency risks, investigate uncertain behavior before changing code, or impose additional verification where consequences were severe?

This assessment must not simply assume that a method was correct because its final output passed.

### 8.4. Process efficiency

What did the method cost, and what value did it produce?

Evaluate elapsed time, compute consumption, human intervention, unnecessary activities, escaped defects, and rework.

A comprehensive evaluation should preserve these dimensions independently.

A proposed grading rubric might be:

| Grade | Interpretation                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------- |
| 0     | Failed; critical requirement or assurance condition unmet                                           |
| 1     | Substantial unsupported claims or incomplete engineering work                                       |
| 2     | Partial success with meaningful evidence gaps                                                       |
| 3     | Meets agreed acceptance criteria with reproducible evidence                                         |
| 4     | Meets acceptance criteria with independently challenged evidence and well-characterized limitations |

The rubric should be applied to individual dimensions, rather than collapsing all results into one score.

A severe safety failure must not be offset by a high productivity score.

### 8.5. Validating the grader

This deserves special attention.

Software engineering benchmarks themselves can be unreliable.

In February 2026, OpenAI documented substantial test-validity and contamination problems in SWE-bench Verified. In July 2026, a further audit identified serious quality problems in SWE-bench Pro and withdrew the earlier recommendation to use it.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://openai.com\&sz=32)

OpenAI

+1



The lesson is directly applicable to this research:

A grading system also requires verification and validation.

An EDSE evaluator should be tested against intentionally correct, incorrect, ambiguous, and incomplete submissions.

It should measure false acceptance and false rejection, not just agreement with existing test suites.

Where objective correctness cannot be fully automated, blind review by multiple qualified evaluators may be necessary.

## 9. Recommended Adoption Strategy

I would compare three implementation approaches before choosing one.

| Approach                                                            | Advantages                                | Disadvantages                                                  |
| ------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| Adopt a single comprehensive existing framework                     | Established conventions and documentation | Limited adaptability; potentially excessive overhead           |
| Construct a fully dynamic AI methodology selector immediately       | Maximum theoretical flexibility           | Difficult to validate; many interacting failure modes          |
| Build an evidence-driven adaptive layer around an existing workflow | Incremental, measurable, reversible       | Requires careful definition of practice and evidence contracts |

I recommend the third approach.

It offers the greatest opportunity to obtain defensible evidence before expanding the system.

### Phase 1: Establish the invariant engineering process

Use one standard workflow for all experiments:

```
Understand the task
  -> Establish objectives
  -> Assess context and risks
  -> Create a plan
  -> Execute
  -> Verify and validate
  -> Evaluate
  -> Record findings
```

Do not introduce dynamic method selection yet.

At this stage, standardize artifact identities, evidence requirements, completion criteria, and evaluation records.

This provides the baseline against which later adaptations can be compared.

### Phase 2: Establish a small practice library

Start with approximately 10–15 techniques that have clearly different applications.

An initial collection could cover requirements discovery, characterization testing, TDD, property-based testing, static analysis, dependency analysis, contract testing, fault injection, performance testing, threat modeling, formal specification, and independent review.

Each practice receives a contract describing applicability, prerequisites, execution, evidence, limitations, and expected costs.

Do not attempt to catalog every existing software methodology.

### Phase 3: Implement deterministic method selection

Begin with explicit, inspectable selection rules.

For example:

```
IF behavioral uncertainty is HIGH
THEN investigate and characterize behavior
BEFORE behavior-changing implementation.

IF concurrency complexity is HIGH
AND correctness depends on event ordering
THEN consider state-machine modeling.

IF consequences are severe
THEN increase required assurance rigor
AND require independent verification.
```

Retain the selected rules and the evidence used to activate them.

The AI can recommend additional practices, but should not initially have unrestricted authority to override critical constraints.

### Phase 4: Introduce AI-generated adaptation

After deterministic selection is working, allow AI to propose changes based on newly discovered information.

For example:

```
Initial assessment:
  Sequential file-processing utility.

Discovery:
  Concurrent processes modify the same directory.

New context:
  Concurrency risk increased.

Proposed adaptation:
  Add race-condition testing and
  filesystem consistency checks.

Required action:
  Revise the plan and verification criteria.
```

The system should retain both the original assessment and the revised assessment, so the adaptation can itself be evaluated.

### Phase 5: Introduce evidence-driven process improvement

After collecting a meaningful number of completed tasks, investigate correlations between context, practices, and outcomes.

For example:

Does characterization testing reduce regressions in high-uncertainty legacy code?

Does formal modeling reduce concurrency defects enough to justify its cost?

Do independent test oracles improve defect detection in AI-generated code?

Use these observations to propose changes to practice-selection policies.

A process change should be tested before being permanently adopted.

ISO/IEC TR 33014:2013 and the GQM literature offer relevant foundations for systematic process improvement and objective-derived measurement.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.iso.org\&sz=32)

Guide for process improvement

+1



## 10. Research Design: How to Determine Whether EDSE Works

A successful demonstration should do more than show that an agent can use different engineering practices.

It should show that selecting them based on context produces measurably better outcomes.

### 10.1. Central hypothesis

H1: Context-adaptive method selection improves risk-adjusted engineering outcomes compared with a fixed engineering workflow.

This is the primary hypothesis.

Supporting hypotheses:

H2: Explicit evidence requirements improve the reliability of engineering claims.

H3: Independent verification detects defects and unsupported assumptions missed by implementation-generated tests.

H4: Reassessment of context during execution improves outcomes for tasks involving unexpected constraints.

H5: The benefits of adaptation vary significantly by problem context.

H6: Some practices offer negative marginal value in particular contexts because their overhead exceeds their contribution.

### 10.2. Experimental conditions

Compare three workflows.

Condition A — Fixed workflow

Every task receives the same established engineering procedure, with required risk and security controls retained.

Condition B — Rule-selected workflow

The task receives practices selected using deterministic context rules.

Condition C — Adaptive workflow

Practices are initially selected from context and may be revised during execution when new evidence emerges.

All conditions should use comparable tools, agent models, compute budgets, and evaluation criteria.

### 10.3. Task portfolio

I recommend four initial task categories.

| Category                     | Example task                              | Principal challenge                    |
| ---------------------------- | ----------------------------------------- | -------------------------------------- |
| Deterministic behavior       | Parser or transformation utility          | Functional correctness                 |
| Legacy analysis              | Repair an undocumented service            | Incomplete knowledge                   |
| Distributed behavior         | Concurrent queue or retry mechanism       | Nondeterminism and partial failure     |
| Reliability-sensitive change | Data migration with recovery requirements | Failure consequences and reversibility |

Each category should contain multiple tasks with varying difficulty.

For a pilot, 12 tasks per category would produce 48 distinct tasks. This is a practical starting point, not a statistically justified final sample size. A formal study would require power analysis, appropriate repeated trials, and controls for task difficulty.

Include tasks with known defects, injected faults, incomplete specifications, and misleading observations.

Include previously unseen tasks in a held-out evaluation set.

### 10.4. Outcome measurements

Use multiple measurements rather than optimizing only for passing tests.

Quality: Independently detected defects, correctness, omitted requirements, residual risks, and regressions.

Assurance: Supported claims, unsupported claims, evaluator errors, reproducibility, and evidence completeness.

Efficiency: Completion time, compute cost, human review time, rework, and unnecessary analysis.

Adaptation: Context classification errors, inappropriate method selections, useful adaptations, and unnecessary adaptations.

Operations: Where applicable, deployment failure, recovery time, and service-level performance.

DORA's current software delivery measurement model uses five metrics organized around throughput and instability. Its guidance also warns against treating individual metrics as targets or comparing unlike contexts indiscriminately.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://dora.dev\&sz=32)

DORA’s software delivery performance metrics



### 10.5. Experimental safeguards

Randomize workflow assignment where possible, blind evaluators to the workflow used, preserve identical acceptance criteria, and freeze method-selection policies during each evaluation round.

Analyze results by context category rather than reporting only aggregate averages.

A method that improves legacy-code performance but degrades small deterministic tasks could look neutral in aggregate while offering valuable context-specific information.

Also measure process overhead. If adaptive selection improves quality slightly but triples effort, the result must be interpreted against the consequences of failure.

### 10.6. What would falsify the central hypothesis?

The research should explicitly consider evidence against the methodology.

Examples include:

- Context classification is too unreliable to improve practice selection.
- A well-designed fixed workflow performs as well as adaptation.
- Practice-selection overhead outweighs its benefits.
- Method selection overfits benchmark categories.
- AI-generated evidence creates unwarranted confidence.
- Adaptation improves test scores but not correctness or operational results.

These are genuine risks and should be treated as research outcomes, not implementation failures to conceal.

## 11. Important Risks in the Proposed Methodology

### Excessive process complexity

A methodology designed to eliminate unnecessary engineering work can accidentally create more administrative work than it saves.

Mitigation: Use compact method contracts, automate evidence capture, and measure the cost of process execution.

### Premature formalization

Requiring detailed specifications before a problem is understood can turn assumptions into authoritative-looking requirements.

Mitigation: Distinguish exploratory evidence from verified knowledge and permit discovery to precede specification.

### Method instability

Repeatedly switching techniques can interrupt work and create inconsistent artifacts.

Mitigation: Reassess at meaningful checkpoints and require evidence before changing the selected method.

### False assurance

An AI agent can produce extensive documentation, tests, and plausible arguments that all depend on a false premise.

Mitigation: Employ independent evidence and verification, preserve contradictory findings, and require explicit treatment of uncertainty.

### Overfitting to benchmark performance

An adaptive selector might learn which practices score well on a particular set of tasks without improving real engineering outcomes.

Mitigation: Use held-out tasks, unseen repositories, adversarial cases, and independently validated evaluation criteria.

### Neglecting baseline controls

Context adaptation must not become permission to ignore mandatory security, safety, legal, or organizational requirements.

Mitigation: Separate mandatory controls from optional or context-selected techniques.

## 12. Prioritized Research Sources

The following sources form a focused reading program rather than an exhaustive bibliography.

| Priority | Source                                                                                                                                                                   | Research purpose                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| 1        | [Method Engineering — Systematic Literature Review](https://www.sciencedirect.com/science/article/pii/S2212827124003093?utm_source=chatgpt.com)                          | Determine what method tailoring already provides                       |
| 2        | [OMG Essence 1.2](https://www.omg.org/spec/Essence/1.2?utm_source=chatgpt.com)                                                                                           | Study formal representations of reusable practices                     |
| 3        | [ISO/IEC/IEEE 12207:2026](https://standards.ieee.org/ieee/12207/11416/?utm_source=chatgpt.com)                                                                           | Establish life-cycle process coverage and tailoring                    |
| 4        | [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html?utm_source=chatgpt.com)                                                                                     | Establish product quality dimensions                                   |
| 5        | [NASA Software IV&V](https://swehb.nasa.gov/spaces/SWEHBVC/pages/50888971/SWE-141%2B-%2BSoftware%2BIndependent%2BVerification%2Band%2BValidation?utm_source=chatgpt.com) | Define rigorous verification and evidence requirements                 |
| 6        | [NASA Assurance Cases](https://sma.nasa.gov/news/articles/newsitem/2020/09/22/new-tool-for-developing-safety-assurance-cases?utm_source=chatgpt.com)                     | Connect claims, arguments, and evidence                                |
| 7        | [2025 DORA Research](https://dora.dev/research/2025/dora-report/?utm_source=chatgpt.com)                                                                                 | Study relationships between AI, engineering capabilities, and outcomes |
| 8        | [DORA Performance Metrics](https://dora.dev/guides/dora-metrics/?utm_source=chatgpt.com)                                                                                 | Establish operational outcome measurements                             |
| 9        | [Google SRE Error Budget Policy](https://sre.google/workbook/error-budget-policy/?utm_source=chatgpt.com)                                                                | Study risk-based adaptation using measured operational conditions      |
| 10       | [How AWS Uses Formal Methods](https://www.amazon.science/publications/how-amazon-web-services-uses-formal-methods?utm_source=chatgpt.com)                                | Examine context-specific application of rigorous methods               |
| 11       | [NIST Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final?utm_source=chatgpt.com)                                                         | Establish mandatory security-oriented practices                        |
| 12       | [Separating Signal from Noise in Coding Evaluations](https://openai.com/index/separating-signal-from-noise-coding-evaluations/?utm_source=chatgpt.com)                   | Understand the risk of invalid AI engineering benchmarks               |

The research should distinguish standards, systematic reviews, observational research, industrial case studies, and practitioner guidance. All can contribute useful knowledge, but they provide different strengths of evidence.

## 13. Recommended Initial Implementation

I recommend making AI-assisted reverse engineering of an existing codebase the first application of EDSE.

It offers an unusually good experimental environment because much of the material already exists, while the engineering process must still contend with uncertainty.

The goal would be to produce a verified architectural and behavioral description of a codebase.

Initial input:

```
Repository
Task or investigation objective
Available documentation
Execution constraints
```

Expected output:

```
System inventory
Dependency model
Behavioral model
Architecture description
Identified assumptions
Uncertainty register
Evidence references
Verification results
Known gaps
Evaluation report
```

This domain also permits useful objective evaluation.

For example, the system could be evaluated on its ability to identify actual dependency relationships, recover undocumented behavior, locate relevant code for a specified feature, reconstruct data flows, and distinguish observations from inferences.

The resulting methodology could then be extended to implementation, refactoring, and migration tasks.

### Minimal viable architecture

```
Repository + Objective
        |
        v
Context Analyzer
        |
        v
Context Record
        |
        v
Rule-Based Method Selector
        |
        v
Practice Library
        |
        v
Plan and Evidence Requirements
        |
        v
AI-Assisted Execution
        |
        v
Independent Verification
        |
        v
Quality and Method Evaluation
        |
        v
Evidence and Outcomes Repository
        |
        v
Method Improvement Proposals
```

For the initial implementation, I would use plain YAML or JSON for context, practice contracts, decisions, and evidence references, together with Markdown for human-readable reports.

Version all artifacts with the repository or project. Maintain immutable records of completed evaluations so that later process improvements cannot rewrite earlier evidence.

This would make the process relatively straightforward to implement in an existing agent workflow without creating a new framework first.

## 14. Final Research Position

The proposal can be summarized as three layers.

| Layer                                  | Purpose                                                         | Source of authority                                       |
| -------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------- |
| Stable engineering principles          | Maintain objectives, evidence, verification, and accountability | Engineering standards and agreed constraints              |
| Context-specific engineering practices | Select suitable techniques and rigor                            | Context, risks, method contracts, and accumulated results |
| Adaptive process improvement           | Improve future method selection                                 | Verified outcomes and controlled experiments              |

The main novelty is not choosing different practices for different projects. Experienced engineers already do that.

The more significant opportunity is to make that selection process:

- Explicit enough to inspect.
- Structured enough for an agent to execute.
- Traceable enough to audit.
- Measurable enough to compare.
- Adaptive enough to improve.
- Constrained enough to remain reliable.

My recommendation is to establish EDSE first as a measurable process-selection and assurance layer, not as a new all-encompassing software development methodology.

Start with one domain, one baseline workflow, a small practice library, deterministic selection, and independent evaluation. Demonstrate that adaptation produces better results before automating increasingly sophisticated selection decisions.

The central research question then becomes:

> Can we develop a software engineering system that not only improves its software outputs, but uses verified evidence to improve its own choice of engineering methods?

That is a focused, testable direction for an AI-first software engineering research program.