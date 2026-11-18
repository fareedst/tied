# Replacement Discovery Baseline — agent runbook

**Status:** Generic methodology (v1.0 body below). Not a TIED `[PROC-*]` token until wave 2 enrollment.

**Plan:** [replacement-discovery-baseline/PLAN.md](../../tied-project/non-tied-plans/replacement-discovery-baseline/PLAN.md)

**Pilot (declared):** TIED methodology store (`stdd`)—subject boundaries in PLAN § Stdd analysis boundary.

**Program scope (plan):** **Analysis phase only** (runbook phases **0–7**, artifacts **00–09**). Phases **8–11**, successor design, and next-generation product replacement are **deferred** per [PLAN.md § Phase scope gate](../../tied-project/non-tied-plans/replacement-discovery-baseline/PLAN.md).

**Non-claims:** RDB record prefixes (OUT, CAP, CON, EV, …) are **not** TIED semantic tokens. Observed behavior does not become requirements without brownfield intent elevation / sponsor decision.

**Related TIED docs:** [brownfield-intent-elevation.md](../../tied-bundle/docs/brownfield-intent-elevation.md) · [EDPC](../../tied-bundle/docs/EDPC_Methodology_and_Workflows.md) · [EASAR](evidence-assured-software-architecture-recovery.md)

---

# Agent Runbook: Deconstruct a Working Software System to Re-engineer Its Replacement

Version: 1.0
Audience: An engineering agent familiar with a large, complex, working application
Mission: Discover and document the value, obligations, actual behavior, and constraints of the current system so that a simpler, more purpose-built successor can be designed, implemented, and validated.

## 1. Objective

Treat the existing application as an evidence source, **not** as the design specification for the replacement.

Produce an independently reviewable baseline that answers:

1. What valuable outcomes does the existing system deliver, for whom, and under what conditions?
2. Which externally observable behaviors, guarantees, and obligations must the successor preserve?
3. How does the system actually behave, including failures, edge cases, workarounds, and accidental behavior?
4. Which implementation mechanisms, internal boundaries, historical choices, and sources of complexity are replaceable?
5. What opportunities exist to simplify, consolidate, eliminate, or improve the system without losing its value?
6. What evidence and acceptance tests would demonstrate that the successor is functionally sufficient and materially better?
7. How can the successor take over safely, including data, integrations, operations, migration, and rollback?

The required outcome is a **Replacement Discovery Baseline (RDB)** followed by an evidence-based replacement design and transition plan. Do not equate success with rewriting the current software or reproducing its component architecture.

## 2. Governing rules

- **Preserve value, not implementation.** Keep required outcomes and contracts; challenge mechanisms and accidental complexity.
- **Separate five views:** PURPOSE (why), CONTRACT (what must be true), REALITY (what happens), MECHANISM (how it happens), OPPORTUNITY (what could improve).
- **Differentiate fact, inference, proposal, and decision.** Label each. Never quietly convert observed behavior into a requirement.
- **Use evidence.** Record the source code revision, file or symbol, test, document, log, metric, runtime observation, or stakeholder statement behind each material claim. State when evidence is unavailable or contradictory.
- **Characterize before changing.** Where safe, establish reproducible behavioral tests and baseline measurements before relying on a claim about the current system.
- **Use risk-directed depth.** Investigate critical behavior and uncertain dependencies deeply; do not require exhaustive line-by-line explanation of the codebase.
- **Do not disrupt a working system.** Discovery actions must be read-only by default. Do not change production data, external integrations, credentials, schedules, or live workflows without explicit authorization. Use sanitized samples and isolated environments.
- **Protect sensitive information.** Record data classes and controls, not credentials, secrets, patient details, or unnecessary personal data in generated artifacts.
- **Respect decision authority.** The agent may propose eliminations, changed guarantees, new dependencies, budget choices, and migration tradeoffs; the sponsor approves consequential changes.
- **Track unknowns rather than inventing answers.** Where unresolved uncertainty matters, create a question, impact assessment, and verification plan.
- **Keep traceability.** Connect each user outcome to capabilities, contracts, evidence, verification, proposed successor design, and migration acceptance criteria.
- **Maintain working-system continuity.** Account for user continuity, operational availability, data integrity, integrations, support procedures, and transition risk.

## 3. Record conventions

Use stable IDs and cross-references. Suggested prefixes:

| Prefix | Record | Meaning |
| --- | --- | --- |
| OUT | Outcome | User or business value to preserve or improve |
| ACT | Actor | User, operator, external system, or other participant |
| CAP | Capability | A unit of meaningful system functionality |
| WF | Workflow | End-to-end activity and its branches |
| CON | Contract | Observable behavior, interface, invariant, or guarantee |
| DOM | Domain | Vocabulary, rules, and domain entities |
| DAT | Data | State, lifecycle, ownership, and lineage |
| INT | Integration | External interface or dependency |
| QUA | Quality | Quantified or qualitative nonfunctional requirement |
| FAIL | Failure | Failure mode, symptom, cause, impact, detection, recovery |
| EV | Evidence | Citable source or reproducible observation |
| GAP | Gap | Missing information or unsupported/contradictory assertion |
| HYP | Hypothesis | Proposed simplification or improvement to test |
| DEC | Decision | Sponsor/architectural decision and rationale |
| VER | Verification | Test, experiment, measurement, or acceptance evidence |
| MIG | Migration | Cutover, compatibility, data migration, rollback item |

For each material assertion, include:

- `status`: verified / observed / inferred / reported / proposed / disputed / unknown
- `evidence`: one or more `EV-*` references, or an explicit evidence gap
- `confidence`: high / medium / low, with rationale when important
- `impact_if_wrong`: consequence if the assertion is false
- `owner`: who can verify, decide, or resolve the matter

An evidence reference should identify **where and when** it was obtained: repository revision and location; test identifier and result; runtime environment and timestamp; monitoring window; or document/version and responsible source. Protect private information.

## 4. Required output package

Maintain the following artifacts, as text/Markdown/YAML suitable for review and downstream agent processing:

```text
replacement-discovery/
  00-mission-boundary-and-assumptions.md
  01-users-outcomes-and-domain.md
  02-capabilities-and-workflows.md
  03-contracts-and-observed-behavior.md
  04-as-built-and-as-operated.md
  05-data-state-and-integrations.md
  06-quality-operations-security.md
  07-failure-risk-and-historical-decisions.md
  08-verification-and-characterization.md
  09-evidence-uncertainties-and-questions.md
  10-replacement-opportunities.md
  11-target-requirements-and-options.md
  12-replacement-design-and-transition.md
  13-decision-log-and-readiness-review.md
  registry/
    capabilities.yaml
    contracts.yaml
    evidence.yaml
    gaps.yaml
    decisions.yaml
    verification.yaml
```

This structure is a recommended artifact layout, not a demand to fill every file before learning anything useful. Use incremental updates. Avoid duplicating facts across artifacts; reference the canonical record by ID.

## 5. Execution process

The phases below are ordered to prevent premature solution bias. Within a phase, work iteratively, and revisit earlier records as new evidence appears. At each phase end, publish findings, confidence, unresolved questions, and proposed next investigations.

### Phase 0 — Establish authority, scope, and safety

**Actions**

1. Confirm the replacement's intended beneficiaries and broad mission: deliver the same essential end-user benefits with a more focused system.
2. Identify sponsor, product/domain representatives, engineering/operations contacts, and decision authority.
3. Identify software boundaries: repositories, deployed environments, databases, jobs, services, clients, third-party components, configuration, and external systems.
4. Record what is in scope for deconstruction, what is out of scope, and what is unknown.
5. Inventory available evidence: source, commit history, tests, documentation, support issues, incident reports, telemetry, build manifests, deployment descriptions, database schemas, usage analytics, user interviews.
6. Define safe observation modes and approved test environments. Confirm whether any representative inputs or data are sensitive.
7. Establish the traceability IDs, uncertainty register, and decision log.

**Outputs:** mission statement, system boundary, evidence inventory, access/safety constraints, stakeholders, initial assumptions and gaps.

**Gate:** Discovery can proceed without modifying or destabilizing the working system; the agent can distinguish verified scope from assumed scope.

### Phase 1 — Recover the purpose and user value

**Actions**

1. Enumerate user types, operators, administrators, downstream consumers, and external systems.
2. For each actor, identify the problems they solve with this software, not merely the screens or commands they use.
3. Map end-to-end outcomes and criteria for successful completion; identify the consequences of failure.
4. Determine how users actually work, including manual workarounds, exports, unofficial interfaces, and processes beyond the application boundary.
5. Identify recurring activities, rare but business-critical activities, and features that exist only for historical reasons.
6. Distinguish contractual, regulatory, financial, safety, and other mandatory commitments from preferences and incidental behavior.
7. Define an initial measure of value for each major outcome (accuracy, turnaround time, effort, reliability, cost, discoverability, etc.).

**Outputs:** actor registry, outcomes, value stream, user journeys, domain vocabulary, preliminary criticality tiers.

**Gate:** Major user benefits can be stated without naming current classes, databases, frameworks, or service boundaries.

### Phase 2 — Inventory capabilities and reconstruct workflows

**Actions**

1. Inventory entry points: UI actions, CLI commands, API endpoints, event handlers, scheduled jobs, batch operations, inbound files, messaging consumers, administrative operations.
2. Group behaviors into capabilities by meaningful outcome, not by source directory or microservice.
3. For each capability, identify actor, trigger, inputs, preconditions, decisions, outputs, side effects, completion criteria, dependencies, and observable failures.
4. Reconstruct end-to-end workflows, including branching, cancellation, retries, partial completion, timeouts, and manual interventions.
5. Trace across boundaries where multiple services or human processes together realize a single capability.
6. Flag duplicate and overlapping capabilities, orphaned code, features lacking known users, and capabilities performed outside the system.
7. Link each workflow to the user outcomes it serves and to the technical entry points that implement it.

**Outputs:** capability registry, workflow maps, entry-point inventory, capability-to-outcome matrix.

**Gate:** Critical workflows are end-to-end, with no unexplained handoff or owner; uncertainty is explicitly identified.

### Phase 3 — Characterize actual behavior and contracts

**Actions**

1. For each important workflow, document intended behavior from requirements and test expectations separately from runtime-observed behavior.
2. Identify externally visible contracts: UI semantics, APIs, event ordering, error responses, notification content, file formats, timing, retry behavior, ordering, idempotency, and consistency expectations.
3. Identify invariants: properties that must remain true across normal operations, failures, concurrency, restarts, and upgrades.
4. Investigate boundaries and exceptional cases: malformed input, duplicates, race conditions, partial transactions, interruptions, stale data, degraded dependencies, resource exhaustion.
5. Locate behaviors that consumers depend upon but that are undocumented, accidental, or known to be incorrect.
6. Mark each behavior as `required`, `observed-not-yet-approved`, `undesired`, or `unresolved`; the first category requires supporting authority or an explicit decision.
7. Design safe characterization experiments and record exact inputs, environment, outputs, and conclusions.

**Outputs:** contract registry, behavior comparison (intended vs observed), invariant list, characterization candidates, compatibility concerns.

**Gate:** The agent can explain what must remain stable at the replacement's boundary without presupposing how it is implemented.

### Phase 4 — Discover data semantics, state, and external dependencies

**Actions**

1. Catalog persistent and transient data, entities, identifiers, derived values, ownership, and authoritative sources.
2. Trace data lineage: ingress, validation, transformation, business rules, persistence, events, reporting, export, deletion, and retention.
3. Identify state machines, transaction boundaries, consistency models, deduplication, reconciliation, and recovery mechanisms.
4. Determine which data, audit history, or metadata users or external systems will need after the replacement takes over.
5. Catalog every external interface, including undocumented consumers, outbound jobs, files, webhook subscribers, protocols, versions, rate limits, and operational obligations.
6. Establish actual usage and compatibility constraints where evidence exists; mark inferred dependencies as such.
7. Record data quality defects and discrepancies between declared schema and observed contents.

**Outputs:** domain/data model, state transition maps, data ownership and lifecycle, integration registry, migration data requirements.

**Gate:** No critical capability depends on an unidentified authoritative state store or unexplained integration; known exceptions become risks/gaps.

### Phase 5 — Reconstruct as-built and as-operated architecture

**Actions**

1. Map deployed components and runtime interactions: processes, services, libraries, queues, databases, jobs, caches, user clients, and third-party services.
2. Identify deployment topology, runtime configuration, environment differences, build/release process, upgrade dependencies, and disaster recovery procedures.
3. Trace the concrete implementation of high-value capabilities and critical paths through source and runtime boundaries.
4. Describe coupling, cycles, shared mutable state, duplicated logic, incidental abstractions, and hidden sequencing assumptions.
5. Record operational procedures that substitute for missing automation or compensate for past failures.
6. Distinguish **architectural constraints still needed** from **historical or arbitrary design choices**.
7. Document known past redesigns, decisions, rejected options, and the conditions that motivated them; verify whether those conditions still hold.

**Outputs:** as-built topology, as-operated workflow, dependency map, historical decision record, complexity inventory.

**Gate:** Current mechanisms are understandable well enough to identify what can change without losing essential contracts.

### Phase 6 — Investigate quality, failures, and current health

**Actions**

1. Characterize real and expected workload profiles: volumes, concurrency, latency, burstiness, data growth, geographic distribution, and peak periods.
2. Measure or find evidence for performance, capacity, reliability, availability, recovery times, cost, and maintainability; document measurement conditions.
3. Review security posture: trust boundaries, identities, authorization, secrets handling, sensitive data, audit events, vulnerability exposure, and applicable obligations.
4. Catalog known incidents, production defects, operational complaints, support load, technical debt, and repeat failure patterns.
5. Examine current signals of degradation or latent faults: error trends, stalled queues, orphaned records, mismatched totals, resource exhaustion, excessive retries, reconciliation failures.
6. Identify how faults are detected, contained, reported, remediated, and recovered. Note where detection is missing or recovery is manual.
7. Perform failure-mode analysis for high-impact paths: trigger, fault, local effect, downstream consequences, detection, recovery, and potential silent failure.
8. Distinguish proven current failures, plausible vulnerabilities, and theoretical risks.

**Outputs:** quality baseline, operational profile, failure/risk catalog, health indicators, reliability and security gaps.

**Gate:** High-consequence failure modes and required operational guarantees are explicit enough to influence successor acceptance criteria.

### Phase 7 — Build a verification baseline

**Actions**

1. Inventory existing tests and classify what they actually prove; identify stale, flaky, weak, and missing tests.
2. Create safe characterization tests for important observable behaviors where confidence is otherwise low.
3. Define representative datasets and workloads, including edge cases, concurrency, failure injection, restart/recovery, and integration boundaries as appropriate.
4. Define functional and nonfunctional baseline measures in reproducible terms; do not invent targets that have not been measured or approved.
5. Define contract tests for external interfaces and invariants; where direct execution is unsafe, specify simulation or analysis instead.
6. Explicitly separate “current behavior was reproduced” from “current behavior is desirable.”
7. Preserve test scripts, data generation procedures, measurements, environment metadata, and results as reusable successor verification assets.

**Outputs:** verification registry, characterization suite, baseline metrics, coverage gaps, reproducible comparison method.

**Gate:** Each critical outcome and high-risk contract has an available test, a practical verification plan, or a prominently tracked unresolved verification gap.

### Phase 8 — Distill the replacement specification

**Actions**

1. Restate user outcomes, capabilities, business rules, and externally observable contracts without current-implementation terminology where feasible.
2. Categorize each item as mandatory, desirable, optional, obsolete candidate, disputed, or unknown; record authority and rationale.
3. Identify what the replacement must preserve exactly, what may change compatibly, and what requires an explicit sponsor decision.
4. Separate core responsibilities from auxiliary tools, accidental complexity, and historic workarounds.
5. Identify minimal domain primitives, necessary state transitions, essential interfaces, and required operational guarantees.
6. Establish outcome-based acceptance criteria and quality targets; flag unapproved or immeasurable targets.
7. Record assumptions and decisions needed before making irreversible architectural choices.

**Outputs:** implementation-independent target requirements, essential behavior and invariant catalog, boundary contracts, acceptance criteria, open decisions.

**Gate:** A reviewer can judge a replacement design against the required outcomes without looking at the old implementation.

### Phase 9 — Generate improvement hypotheses and design alternatives

**Actions**

1. For each capability or major mechanism, propose a disposition: `preserve`, `refine`, `redesign`, `replace`, `consolidate`, `eliminate`, or `investigate`.
2. State the benefit sought by each proposal and the evidence that suggests it is achievable.
3. Consider simpler domain boundaries, reduced state duplication, fewer moving parts, simpler operations, removal of legacy integrations, and more direct workflows.
4. Produce at least two substantively different viable target designs where meaningful, including a conservative option and a more purpose-built option.
5. Compare alternatives against functional fit, complexity, operational burden, failure modes, security, compatibility, cost, team capability, observability, and migration risk.
6. Identify novel hazards introduced by each alternative, not just flaws it removes.
7. Run targeted prototypes, benchmarks, or architecture spikes only to resolve material uncertainty, using approved resources.
8. Seek sponsor decisions on changed guarantees, removed capabilities, cost/risk commitments, or irreversible choices.

**Outputs:** opportunity catalog, hypotheses with validation plans, option comparison, proposed architecture direction, decision requests.

**Gate:** The preferred design is justified by outcomes and evidence, not by resemblance to the current system or by the agent's preference for a technology.

### Phase 10 — Design transition, verification, and operational acceptance

**Actions**

1. Identify how users and external systems can move from old to new: incremental replacement, parallel run, adapters, domain-by-domain cutover, or a justified alternative.
2. Map data migration: source-to-target semantics, transformations, identifiers, history, lineage, reconciliation, retained audit information, and reversible operations where possible.
3. Define compatibility strategies for consumers that cannot move simultaneously.
4. Plan how the old and new systems will be compared: golden cases, contract checks, shadow processing, parallel reconciliation, or other safe methods.
5. Define observable cutover gates, error budgets or tolerances where relevant, monitoring, incident response, support procedures, and rollback criteria.
6. Address dual-write/conflicting-authority risks, data drift, at-least-once processing, repeated migration, and partial cutover where applicable.
7. Document the point at which rollback becomes impossible or requires compensating action, and require explicit approval.
8. Plan retirement and decommissioning, including retained records, licenses, credentials, infrastructure, and dependent integrations.

**Outputs:** incremental implementation outline, migration plan, verification strategy, cutover/rollback plan, operational readiness criteria, decommissioning plan.

**Gate:** The successor can be introduced without depending on an undocumented or unverified cutover assumption.

### Phase 11 — Conduct the replacement-readiness review

Review the package with sponsor, domain specialists, implementers, and operations representatives. Resolve or explicitly accept consequential uncertainties.

**Questions to answer**

- Are essential user benefits and workflows accounted for?
- Are preserve/change/remove proposals explicit and authorized?
- Are externally visible contracts and critical invariants traceable to evidence and tests?
- Are major risks and current failures visible, including potential silent failures?
- Do we understand which current complexity is necessary versus incidental?
- Are target design choices supported by comparative reasoning and measurable objectives?
- Is the migration safe enough, with verified data fidelity and workable fallbacks?
- Which unresolved assumptions might invalidate the design, and who owns them?

**Outputs:** reviewed baseline, accepted/declined decisions, residual-risk register, approved next implementation increments.

**Gate:** Proceed into successor implementation only for the scope whose required outcomes, contracts, assumptions, and acceptance criteria are sufficiently understood and authorized. Remaining uncertainties stay visible and can be resolved incrementally.

## 6. Minimum record template

Use structured records for important capabilities. This is an illustration, not an assertion about any particular system.

```yaml
id: CAP-042
name: Reliable downstream notification
purpose:
  - OUT-008
actors:
  - ACT-003
trigger: Committed business change
preconditions:
  - Valid change accepted by the application
required_outcomes:
  - Downstream recipient can learn that the change occurred
contracts:
  - CON-014
  - CON-015
workflows:
  - WF-019
current_mechanisms:
  - Database trigger
  - Polling worker
  - Message dispatcher
observed_behavior:
  - statement: Retries can produce duplicate deliveries
    status: observed
    evidence:
      - EV-121
    confidence: high
failure_modes:
  - FAIL-006
quality_requirements:
  - QUA-011
assumptions:
  - Subscriber idempotency remains to be confirmed
replacement:
  disposition: redesign
  hypothesis: Decouple persistence from delivery mechanism
  expected_benefit: Fewer recovery steps and clearer delivery status
  decision_status: proposed
verification:
  - VER-032
unknowns:
  - GAP-009
```

The same discipline applies to defects, integration contracts, data invariants, experiments, quality measurements, and proposed design changes. Every proposed requirement that originates from observed behavior needs a rationale and a decision or identified authority.

## 7. Required traceability paths

At a minimum, establish these linkages:

```text
ACTOR -> OUTCOME -> CAPABILITY -> WORKFLOW -> CONTRACT
                                     |             |
                                     v             v
                              CURRENT MECHANISM  VERIFICATION
                                     |
                                     v
                                  EVIDENCE

CAPABILITY + CONTRACT + RISK + EVIDENCE
            -> PROPOSED DISPOSITION
            -> TARGET REQUIREMENT
            -> TARGET DESIGN DECISION
            -> IMPLEMENTATION / TEST
            -> MIGRATION ACCEPTANCE
```

Bidirectional tracing should answer both “Why must this exist?” and “What would break if it changed?” An untraced component may be obsolete, undiscovered infrastructure, or an analysis gap; do not assume which.

## 8. Analysis questions the agent must repeatedly ask

- What user outcome does this feature or mechanism enable?
- If this code disappeared, what observable behavior would change and who would care?
- Is this behavior required, merely observed, or undesirable but relied upon?
- What invariant would be violated by a naive rewrite?
- Does this implementation complexity solve a real domain problem, or an implementation-created problem?
- Which hidden consumers, batch jobs, manual processes, or operational tools rely on it?
- How does it behave when inputs, timing, dependencies, or stored state are wrong?
- Could it already be silently failing, and what evidence would reveal that?
- What must be tested before claiming functional equivalence or improvement?
- What assumption, if false, would most seriously invalidate the proposed design?
- Would a smaller system accomplish the same outcome with fewer states, transitions, interfaces, and recovery paths?
- How would we prove the replacement is better, not just newer?

## 9. Readiness and quality checklist

Before authorizing a replacement architecture or implementation increment, verify:

- [ ] Actors, user outcomes, and major domain concepts are documented independently of existing technology.
- [ ] Critical capabilities and end-to-end workflows have stable identifiers and evidence links.
- [ ] Intended and observed behavior have not been conflated.
- [ ] Essential invariants, external contracts, and integration dependencies are identified.
- [ ] Data ownership, lifecycle, state transitions, and migration constraints are understood or explicitly risk-tracked.
- [ ] Current architecture and runtime operations are documented only to the depth needed for safe replacement decisions.
- [ ] Known defects, plausible failures, current-health indicators, recovery paths, and silent-failure risks are documented.
- [ ] Performance, reliability, security, cost, and operational claims have baseline evidence or open measurement tasks.
- [ ] Characterization tests and successor acceptance tests are defined for critical behaviors.
- [ ] Opportunities distinguish preserving, refining, redesigning, replacing, consolidating, eliminating, and investigating.
- [ ] The sponsor has approved material changes to value, guarantees, or other consequential obligations.
- [ ] The preferred design has been compared against alternatives, with tradeoffs and new risks recorded.
- [ ] Migration, reconciliation, cutover, rollback, and decommissioning are addressed.
- [ ] High-impact unknowns have named owners, verification actions, and decision deadlines where necessary.
- [ ] Every significant successor requirement traces back to an outcome, contract, risk, or explicit sponsor decision.

## 10. Agent report format after each phase

Publish a compact, reviewable report containing:

1. **Findings:** what was established, with record IDs and evidence references.
2. **Changes to understanding:** which previous assumptions were corrected or contradicted.
3. **Risks and gaps:** what remains uncertain and why it matters.
4. **Decisions needed:** decisions that exceed the agent's authority, with options and consequences.
5. **Verification performed:** experiments, test cases, measurements, and their results.
6. **Next investigations:** highest-value actions ranked by consequence and uncertainty.
7. **Artifact changes:** records/files created or amended and links to related records.

Avoid a single monolithic narrative and avoid generating unreviewed bulk documentation. Prefer small, evidence-backed records aggregated into readable reports. Stop analysis on a subsystem when it is sufficiently understood for the pending decision; deepen investigation when evidence is weak or the consequence of being wrong is high.

## 11. Explicit anti-patterns

Do **not**:

- Translate each existing source module directly into a new module and call it re-engineering.
- Infer user requirements solely from code paths or existing UI structure.
- Assume existing tests establish correctness or completeness.
- Preserve every existing feature for parity without asking whether it still delivers value.
- Treat all current behaviors as contracts or all historical design decisions as constraints.
- Assume unobserved failures cannot happen or operational success means data integrity.
- Design the new architecture before domain obligations and external contracts are clear enough.
- Replace unknowns with confident prose, or suppress contradictory evidence.
- Recommend a big-bang cutover by default.
- Mix target designs with factual descriptions of the current system.
- Collect sensitive production data when schemas, synthetic examples, or redacted evidence suffice.
- Require perfect knowledge of every line of code before delivering useful, risk-bounded design options.

## 12. Final delivery contract

Produce a coherent set of artifacts enabling a new agent or team, without prior familiarity with the old codebase, to:

1. Explain the problem domain, important user journeys, and essential outcomes.
2. Identify behavior and obligations that must survive the replacement.
3. Reconstruct where the current system implements those obligations and how reliably it does so.
4. Identify avoidable complexity and defensible opportunities for simplification.
5. Evaluate replacement designs against measurable outcomes and traceable constraints.
6. Implement and validate the successor incrementally, with safe migration and operational continuity.

### Governing statement

**Understand the existing system deeply enough to preserve its value, not to reproduce its design.** The current system is evidence. The new system's specification is the validated set of user outcomes, domain invariants, external contracts, quality targets, and authorized changes. Re-engineering succeeds when the replacement delivers those outcomes demonstrably better with an appropriately simpler and more maintainable design.
