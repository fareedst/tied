# MCP-First Intent Engineering Control Plane
## Architecture Review and Engineering Handoff

**Document type:** Architecture assessment and proposed requirements  
**Status:** Recommendations for evaluation, not sponsor-approved design decisions  
**Audience:** Software architecture, implementation, verification, and methodology-development agents

**Related:** [anonymized-mcp-traceability-platform.txt](anonymized-mcp-traceability-platform.txt) (shorter feature description for initial review)

---

## 1. Objective

Evaluate and evolve an MCP-first engineering control plane that manages structured software-development intent and enforces methodology adherence across different coding-agent hosts.

The system must support:

- Canonical requirements, architecture, and implementation records.
- Semantic token registration and traceability.
- YAML-based implementation specifications and optional pseudo-code sidecars.
- Validated project-owned writes through MCP.
- CLI parity for scripts and continuous integration.
- Checklist-driven engineering workflows.
- Test-driven development.
- Independent verification and evidence collection.
- Sponsor authority for consequential decisions.
- Portability across agent hosts.
- Reliable recovery from incomplete, interrupted, or failed work.

The intended result is a methodology-enforcing engineering system, not merely a collection of tools that agents are instructed to use.

## 2. Existing Architectural Foundation

The current proposed system has these properties:

1. A local MCP server exposes canonical intent operations.
2. Project data resides in writable filesystem-based indexes and detail records.
3. An inherited methodology corpus supplies read-only baseline definitions.
4. Methodology and project data are merged for reading; project writes remain scoped to project-owned records.
5. The coding agent edits source files and tests.
6. The MCP control plane manages intent records, consistency, traceability, and verification-related status.
7. Host rules, skills, prompts, and shell drivers supply orchestration.
8. Optional verification operations produce quality evidence.
9. The CLI uses the same core operations and validation semantics as MCP.
10. Sponsor-controlled decisions must not be silently delegated to agents.

Preserve these architectural principles unless a documented alternative provides demonstrable benefits.

## 3. Primary Architectural Conclusion

MCP is a communication protocol and tool-access mechanism. It is not independently sufficient to enforce a software-engineering methodology.

Reliable adherence requires three logically separate responsibilities.

### 3.1 Intent Authority

Responsible for:

- Canonical structured records.
- Semantic tokens.
- Validated mutations.
- Cross-record consistency.
- Traceability.
- Project identity.
- Revision management.
- Sponsor decision records.

### 3.2 Process Authority

Responsible for:

- Checklist sequencing.
- Workflow eligibility.
- Phase transitions.
- Dependencies.
- Required evidence.
- Durable execution state.
- Gate evaluation.
- Completion acceptance.

### 3.3 Execution Authority

Responsible for:

- Agent invocation.
- Source-code editing.
- Test development and execution.
- Bounded command execution.
- Collection of observations.
- Reporting execution results.

These are logical responsibilities, not necessarily independently deployed services.

**Core principle: Execution may be delegated, but completion authority must remain independently controlled.**

An agent statement that a task is complete is not sufficient evidence that the task satisfies its requirements.

## 4. Mandatory System Invariants

The following invariants are proposed as non-negotiable conditions for controlled or automated operation.

**INV-001: Canonical mutation**

All accepted changes to canonical intent records must use validated control-plane operations.

**INV-002: Project identity**

Every accepted write must target the explicitly bound project identity and permitted writable root.

**INV-003: Transaction consistency**

A multi-record update must not leave the canonical corpus in a partially published, inconsistent state.

**INV-004: Traceability**

Accepted records must satisfy applicable reference and linkage constraints.

**INV-005: Independent completion**

An agent's completion claim cannot independently advance an authoritative phase or verified requirement status.

**INV-006: Evidence provenance**

Verification evidence must identify the relevant project, source revision, intent revision, verification procedure, and execution outcome.

**INV-007: Evidence freshness**

Evidence must not remain applicable after a change invalidates the assumptions under which it was collected.

**INV-008: Sponsor authority**

Consequential decisions requiring sponsor authorization cannot be approved through ordinary agent-controlled mutations.

**INV-009: Durable workflow state**

Workflow progress must survive agent context loss, process termination, and execution restarts.

**INV-010: Explicit failure**

Missing evidence, failed validation, unresolved authority requirements, and unsupported capabilities must produce explicit non-success outcomes.

**INV-011: Read-only methodology**

Inherited methodology records must not be modified by ordinary project-scoped operations.

**INV-012: Portability**

Host-specific behavior must not redefine canonical methodology requirements, validation conditions, or verification meaning.

## 5. Review Question 1: MCP, Rules, Skills, and Enforcement

### Finding

MCP plus generic agent rules is adequate for exposing and explaining a methodology, but insufficient to guarantee full adherence during unattended execution.

Rules and skills are primarily advisory. They can influence an agent's actions but cannot independently guarantee that the agent follows all instructions.

### Recommended Compliance Levels

**Level 1 — Guided**

Components:

- MCP tools.
- Generic rules.
- Optional host-specific skills.

Characteristics:

- Human-directed execution.
- Advisory process guidance.
- Validated canonical writes.
- No guarantee of consistent checklist advancement.

**Level 2 — Controlled**

Components:

- MCP tools.
- Durable checklist state.
- Enforced phase-transition gates.
- Human or agent-driven execution.

Characteristics:

- Explicit process state.
- Validated progress transitions.
- Human-directed orchestration remains possible.

**Level 3 — Automated**

Components:

- MCP tools.
- Authoritative checklist controller.
- Pluggable agent driver.
- Independent evidence validation.
- Durable execution receipts.

Characteristics:

- Repeatable unattended execution.
- Explicit recovery semantics.
- Independently validated completion.

### Recommendation

Do not mandate a standalone shell checklist driver for every workflow.

Instead, mandate authoritative checklist-controller behavior for unattended execution.

The controller may be implemented in the same application as the MCP server.

### Security Qualification

An unrestricted coding agent with filesystem access may edit canonical YAML directly, bypassing MCP operations.

There are two different assurance levels:

1. Canonical acceptance is controlled by independent validation.
2. Every underlying filesystem mutation is prevented unless authorized.

The first is achievable through control-plane validation and independent acceptance gates.

The second requires operating-system permissions, sandboxing, filesystem isolation, or equivalent restrictions.

These assurance levels must not be conflated.

## 6. Review Question 2: Checklist Sequencing

### Finding

Checklist sequencing should have one authoritative owner outside the agent's conversational context.

### Recommended Responsibility Allocation

**Host rules and skills**

- Explain methodology.
- Supply task instructions.
- Provide agent-specific execution guidance.
- Remain nonauthoritative.

**Checklist controller**

- Select eligible phases.
- Maintain durable progress.
- Prepare execution requests.
- Evaluate dependencies.
- Handle retries and recovery.
- Request phase transitions.

**MCP validation gates**

- Validate applicable policy.
- Verify evidence requirements.
- Reject unauthorized transitions.
- Persist accepted transitions.

### Missing-Component Analysis

**Rules plus driver, without gates**

Failure:

- The workflow can advance with incomplete or invalid evidence.

**Rules plus gates, without a controller**

Failure:

- Individual operations are validated, but there is no guaranteed sequencing, recovery, or forward progress.

**Driver plus gates, without host skills**

Consequence:

- Execution can remain reliable if the controller supplies complete task instructions.
- Host-specific usability or guidance may be reduced.

**All three**

Result:

- Better agent guidance, durable sequencing, and independent gate enforcement.

### Recommended Workflow

1. Read canonical workflow state.
2. Identify the next eligible phase.
3. Capture the applicable intent and procedure revision.
4. Construct an immutable execution request.
5. Invoke a human operator or agent driver.
6. Collect execution observations and artifacts.
7. Evaluate required evidence.
8. Validate the phase gate.
9. Persist a transition receipt.
10. Advance only after acceptance.

On failure:

- Retain the last accepted phase.
- Record the failure reason.
- Preserve usable evidence.
- Apply the documented retry or escalation policy.
- Do not mark the phase complete.

### Key Rule

The agent may report that work is complete.

Only the designated authority may record that the phase has satisfied its acceptance conditions.

## 7. Review Question 3: Distribution and Deployment

### Finding

Git-bootstrap distribution and registry/package-based distribution serve different purposes and should be complementary.

### Recommended Artifact Separation

**Artifact A — Methodology Corpus**

Contains:

- Canonical methodology definitions.
- Schemas.
- Checklist procedures.
- Baseline tokens.
- Reference templates.
- Validation policy definitions.

**Artifact B — Control-Plane Runtime**

Contains:

- MCP server.
- Shared domain operations.
- CLI parity layer.
- Transaction handling.
- Consistency engine.
- Gate evaluator.
- Evidence validation.

**Artifact C — Host Adapters**

Contains:

- Host configuration.
- Optional skills.
- Optional rules.
- Agent-driver integrations.
- Host-specific invocation definitions.

### Distribution Strategy

Use:

- Git commits or releases for inspectable methodology versions.
- Versioned packages or container images for runtime deployment.
- MCP registry metadata for discovery where supported.
- Offline bundles for disconnected environments.

The MCP registry should not be treated as the authority for a project's canonical methodology state.

### Versioning Requirements

Track:

- Methodology version.
- Runtime version.
- Schema version.
- Host adapter version.
- Compatibility constraints.

An installation lockfile should identify the exact compatible versions.

### Wrong-Base-Path Prevention

Require:

1. A stable project identity marker.
2. Canonical writable-root resolution.
3. Validation against the expected project identity.
4. Prevention of writes outside permitted boundaries.
5. Read-only enforcement for inherited methodology content.
6. Revalidation when the project binding changes.
7. Project identity in mutation and transition receipts.

Wrong-project writes must fail closed.

Operator confirmation of the effective path is useful, but insufficient as the sole protection.

## 8. Review Question 4: Portable Agent Driver Contract

### Finding

An agent-driver contract should be host-neutral, minimal, and explicit about capabilities.

Avoid depending on implementation details unique to any specific IDE or coding-agent CLI.

### Proposed Required Interface

**probe()**

Purpose:

- Identify host availability.
- Report adapter version.
- Report supported capabilities.

**start(request)**

Purpose:

- Launch a bounded agent execution.
- Return or establish a durable execution identifier.

**events(run_id)**

Purpose:

- Expose observable progress and execution output where supported.

**cancel(run_id)**

Purpose:

- Request execution termination.

**result(run_id)**

Purpose:

- Retrieve a structured terminal disposition.

### Minimum Execution Request

Include:

- Project identity.
- Execution correlation ID.
- Procedure identifier and revision.
- Intent snapshot reference.
- Workspace or worktree binding.
- Task instructions.
- Permitted capabilities.
- Resource and execution limits.
- Required result artifacts.

### Required Terminal States

**completed**

- The agent driver finished normally.
- Does not imply engineering verification passed.

**failed**

- Agent or host execution failed.

**timed_out**

- Execution exceeded the permitted duration.

**cancelled**

- Cancellation completed.

**blocked**

- Execution cannot proceed because of permissions, policy, unavailable prerequisites, or another explicit obstacle.

**lost**

- The controller cannot establish the execution outcome reliably.

### Optional Capabilities

Capability negotiation may include:

- Structured tool-use events.
- Native session resumption.
- Sub-agent delegation.
- Worktree isolation.
- Native permissions.
- Model configuration.
- Detailed execution metadata.

The controller must determine whether a procedure can be supported using the available capabilities.

A missing mandatory capability must not be silently ignored.

### Architectural Boundary

Agent drivers execute work.

They do not decide whether canonical requirements are verified or checklist phases are accepted.

## 9. Review Question 5: Quality Evidence Execution

### Finding

Verification execution should be isolated from the authoritative intent-management process.

This does not require a separate remote service initially.

### Deployment Options

**Option A: Direct MCP-process execution**

Advantages:

- Simplicity.
- Minimal operational overhead.

Disadvantages:

- Shared privileges.
- Larger security and reliability impact.

**Option B: Dedicated local runner**

Advantages:

- Smaller execution boundary.
- Practical local development.
- Explicit limits and captured artifacts.

Disadvantages:

- Requires process and isolation management.

**Option C: External sandbox or CI runner**

Advantages:

- Stronger isolation potential.
- Reproducible execution environments.
- Independent verification infrastructure.

Disadvantages:

- Higher operational complexity.
- Artifact and provenance management.

### Recommendation

Use a dedicated local runner by default.

Use stronger sandboxing or independent CI execution for unattended, untrusted, or high-assurance workloads.

### Runner Contract

Verification requests should declare:

- Approved command identifier.
- Structured executable and arguments.
- Working directory.
- Allowed environment variables.
- Filesystem access policy.
- Network access policy.
- Timeout.
- Resource limits.
- Expected output artifacts.

Avoid accepting unrestricted agent-generated shell commands as authoritative verification procedures.

### Verification Evidence Contract

A verification receipt should record:

- Receipt ID.
- Project ID.
- Intent revision.
- Source revision.
- Verification procedure ID and revision.
- Runner identity.
- Execution outcome.
- Exit status.
- Output artifact references.
- Evidence integrity information.
- Execution timestamps.
- Relevant environment identity.

Where assurance requires it, evidence provenance should be authenticated, rather than relying solely on file hashes.

### Critical Distinction

A passing command establishes that the command succeeded under specified execution conditions.

It does not establish that all requirements were adequately tested.

### Status Activation

Do not permit requirement or implementation verification status to be activated solely from an agent-supplied list of passing test names.

Require applicable, trusted evidence associated with current source and intent revisions.

## 10. Review Question 6: Privacy and Usage Metrics

### Finding

Operational audit records and usage telemetry must be separate datasets.

### Audit Records

Purpose:

- Reconstruct authoritative changes.
- Identify decisions and transitions.
- Preserve necessary evidence.
- Support troubleshooting and accountability.

May require controlled project identifiers and specific record references.

### Usage Telemetry

Purpose:

- Measure control-plane reliability.
- Detect operational friction.
- Evaluate methodology effectiveness.
- Support continuous improvement.

Recommended fields:

- Tool operation category.
- Outcome category.
- Validation failure code.
- Duration bucket.
- Retry count.
- Recovery outcome.
- Gate rejection category.

Avoid collecting:

- Raw prompts.
- Source code.
- Full requirement content.
- Credentials.
- Secrets.
- Raw command output.
- Full filesystem paths.
- Unnecessary operator identity.

### Required Privacy Policies

1. Local-only telemetry by default.
2. Explicit opt-in for external export.
3. Redaction before storage or export.
4. Separate retention rules for audit and telemetry.
5. Operator inspection and deletion controls.
6. Separate authorization for detailed diagnostic capture.
7. No unsupported anonymity claims.

### Useful Methodology Metrics

Measure:

- Phase rejection frequency.
- Evidence staleness frequency.
- Retry frequency.
- Workflow recovery success.
- Sponsor escalation frequency.
- Verification failure patterns.
- Unresolved consistency violations.
- Percentage of runs requiring manual intervention.

Metrics must not automatically change canonical methodology policy.

Advisory process improvements require explicit review and adoption.

## 11. Additional Architectural Requirements

### 11.1 Transactionality Across Files

Problem:

Canonical state spans multiple YAML indexes, detail files, and optional pseudo-code sidecars.

A process interruption can leave partially updated records.

Recommended mechanisms:

- Expected-revision checks.
- Optimistic concurrency.
- Idempotent mutation identifiers.
- Pre-commit validation of the complete proposed state.
- Atomic publication or durable recovery.
- Transaction receipts.
- Recovery after interrupted writes.

A dry run must evaluate the same proposed post-transaction state as a real commit.

Possible alternative:

Use a transactional canonical store and produce YAML files as projections.

Do not adopt this alternative automatically; evaluate its compatibility with filesystem ownership, Git workflows, offline editing, and existing methodology assumptions.

### 11.2 Evidence Freshness

Problem:

Verification evidence may become invalid after code, test, requirement, or architecture changes.

Recommendation:

Treat verification as an evidence-backed claim with applicability conditions, not a permanent Boolean.

Suggested states:

- draft
- implemented
- verified
- evidence_stale

Evidence staleness is not equivalent to a failed test.

It means the existing evidence is insufficient to establish the current claim.

Determine invalidation using:

- Source revision changes.
- Intent revision changes.
- Test changes.
- Dependency changes.
- Verification procedure changes.
- Explicit impact analysis.

Avoid automatically invalidating every requirement for every unrelated change when reliable dependency analysis permits narrower invalidation.

### 11.3 Sponsor Decision Authority

Problem:

Schema validation alone cannot determine whether an agent is authorized to make a consequential choice.

Recommendation:

Introduce a first-class decision object containing:

- Stable decision identifier.
- Decision question.
- Alternatives.
- Anticipated consequences.
- Cost and reversibility assessment.
- Required authority.
- Disposition.
- Authorization evidence.
- Applicable intent revision.

Agents may propose, investigate, and evaluate alternatives.

Ordinary agent-controlled write operations must not manufacture sponsor authorization.

Sponsor authorization must originate from an independently controlled trust boundary.

### 11.4 MCP Protocol Compatibility

The implementation must explicitly pin or negotiate supported MCP protocol capabilities.

Review current protocol specifications before implementation.

Do not use transport-session state as the sole durable source of checklist or project state.

Do not assume MCP project-root metadata provides a filesystem security boundary.

Protocol compatibility tests must cover supported agent hosts.

### 11.5 Pseudo-Code and Runtime Verification

Structural pseudo-code validation establishes form, linkage, and consistency with declared contracts.

It does not prove runtime behavior.

Maintain separate evidence categories for:

- Structural validity.
- Intent traceability.
- Test coverage.
- Test execution.
- Runtime observations.
- Requirement verification.

Do not collapse these categories into one generic success result.

## 12. Prioritized Engineering Backlog

### Priority P0 — Mandatory Foundations

**REQ-CTRL-001: Project identity binding**

Wrong-project writes are rejected.

**REQ-CTRL-002: Atomic or recoverable canonical mutations**

Interrupted multi-file updates cannot leave accepted inconsistent state.

**REQ-CTRL-003: Traceability validation**

Invalid references and missing required records prevent acceptance.

**REQ-CTRL-004: Authoritative phase transitions**

A phase cannot advance without satisfying applicable gate policy.

**REQ-CTRL-005: Trusted verification provenance**

Untrusted pass lists cannot confer verified status.

**REQ-CTRL-006: Sponsor authorization enforcement**

Sponsor-controlled decisions cannot be approved through ordinary agent writes.

### Priority P1 — Controlled Automation

**REQ-CTRL-007: Durable checklist controller**

Execution can resume from the last accepted state after interruption.

**REQ-CTRL-008: Portable agent driver**

At least two different agent hosts can execute the same canonical procedure.

**REQ-CTRL-009: Isolated verification runner**

Verification runs with bounded permissions and structured evidence capture.

**REQ-CTRL-010: Evidence and transition ledger**

Accepted decisions, changes, and transitions can be reconstructed.

**REQ-CTRL-011: Evidence freshness**

Invalidated evidence no longer supports verified status.

### Priority P2 — Distribution and Improvement

**REQ-CTRL-012: Reproducible packaging**

Methodology, runtime, and adapters are independently versioned and compatible.

**REQ-CTRL-013: Privacy-controlled metrics**

Operators can measure methodology effectiveness without exposing project content.

**REQ-CTRL-014: Advisory analyzers**

Automated analysis can identify gaps without automatically promoting findings into canonical records.

## 13. Required End-to-End Acceptance Workflow

Implement and validate one complete requirement lifecycle before expanding orchestration complexity.

### Nominal Sequence

1. Create a requirement record.
2. Validate and register its semantic identity.
3. Create an associated architecture decision.
4. Establish traceability.
5. Create an implementation specification.
6. Add optional structured pseudo-code.
7. Validate implementation linkage.
8. Define failing tests.
9. Capture evidence that the tests initially fail for the expected reason.
10. Implement the minimum necessary code.
11. Execute declared verification.
12. Capture trusted evidence.
13. Evaluate all applicable gates.
14. Activate the eligible verified status.
15. Persist a completion receipt.

A test-first workflow must distinguish expected initial test failure from unexpected infrastructure or setup failure.

### Adversarial Acceptance Scenarios

The system must be exercised with deliberately invalid or incomplete conditions.

**CASE-001:** Agent claims completion without evidence.  
Expected: Completion rejected.

**CASE-002:** Agent supplies fabricated passing-test names.  
Expected: Verification rejected.

**CASE-003:** Project identity differs from the expected identity.  
Expected: Write rejected.

**CASE-004:** Process terminates during a multi-record mutation.  
Expected: Recovery preserves or restores a consistent accepted state.

**CASE-005:** Source changes after verification.  
Expected: Affected evidence becomes stale when its applicability conditions no longer hold.

**CASE-006:** Required traceability reference is missing.  
Expected: Consistency or transition gate rejects acceptance.

**CASE-007:** Agent attempts a sponsor-controlled decision without authorization.  
Expected: Decision remains unresolved.

**CASE-008:** Agent execution host is unavailable.  
Expected: Explicit blocked or failed outcome; no false completion.

**CASE-009:** Verification runner times out.  
Expected: Explicit timeout evidence and non-success disposition.

**CASE-010:** Checklist execution is interrupted and restarted.  
Expected: Resume from durable accepted state without duplicating committed transitions.

**CASE-011:** Unsupported driver capability is required.  
Expected: Explicit incompatibility or documented alternative verification.

**CASE-012:** Agent bypasses MCP and modifies canonical YAML directly.  
Expected: Independent validation detects or rejects unauthorized canonical state before acceptance; prevention of the filesystem mutation itself depends on configured isolation controls.

The test suite should also verify idempotent retries and concurrent updates using conflicting expected revisions.

## 14. Recommended Operational Modes

### Interactive Mode

- Human directs the process.
- Agent executes engineering work.
- MCP validates canonical writes.
- Human judgment controls progression where appropriate.

### Controlled Mode

- Durable checklists govern phases.
- MCP gates enforce acceptance.
- Human or agent may execute individual steps.
- Recovery state is maintained.

### Autonomous Mode

- Controller selects eligible steps.
- Agent driver executes work.
- Verification runner produces evidence.
- Independent gates determine acceptance.
- Sponsor decisions remain independently authorized.

All modes use the same canonical records and validation policies.

They differ in orchestration, not in the meaning of correctness, authorization, or verified completion.

## 15. Design Decisions Requiring Sponsor Review

The following remain recommendations, not automatically approved decisions.

**DEC-OPEN-001: Canonical storage**

Choose between transactional filesystem publishing and a transactional store with YAML projections.

**DEC-OPEN-002: Filesystem enforcement**

Determine whether accepted-state validation is sufficient or agents must be prevented from bypassing canonical write operations at the filesystem level.

**DEC-OPEN-003: Controller deployment**

Choose whether the checklist controller belongs inside the MCP runtime or in a separate local process.

**DEC-OPEN-004: Runner isolation**

Determine the minimum local sandbox and conditions requiring external CI or stronger isolation.

**DEC-OPEN-005: Sponsor authentication**

Define how sponsor authorization is obtained and verified independently of agent-controlled operations.

**DEC-OPEN-006: Evidence applicability**

Define how changes invalidate evidence and whether dependency-scoped invalidation is sufficiently reliable.

**DEC-OPEN-007: Compatibility baseline**

Define supported MCP protocol versions and the initial target agent hosts.

**DEC-OPEN-008: Compliance policy**

Determine which workflows require Guided, Controlled, or Automated operation.

These choices should be analyzed for complexity, reversibility, failure consequences, and migration costs.

Do not silently convert architectural recommendations into binding project requirements.

## 16. Instructions to the Next Engineering Agent

Use this document as an architecture review and candidate feature set.

Perform the following work:

1. Compare these recommendations against the existing methodology and implementation architecture.
2. Identify capabilities already implemented, partially implemented, or absent.
3. Map proposed requirements to existing requirement, architecture, and implementation tokens.
4. Identify contradictions, duplicated responsibilities, and unintended coupling.
5. Separate mandatory invariants from implementation alternatives.
6. Evaluate failure modes, recovery semantics, and authority boundaries.
7. Identify architecture decisions requiring sponsor approval.
8. Propose a phased implementation plan.
9. Define verification criteria before implementation.
10. Preserve existing, working methodology capabilities unless evidence justifies replacement.

Where the existing system already provides an equivalent guarantee, prefer reuse over duplication.

Where the proposed recommendation conflicts with an established design, record the conflict and alternatives rather than silently overwriting the existing decision.

Follow a test-driven sequence for implementation work:

**Intent → Contract → Failing test → Minimal implementation → Independent verification → Evidence → Accepted status.**

Do not infer behavioral correctness merely from schema validity, passing commands, generated code, or an agent completion message.

## 17. Final Architectural Principle

The system must distinguish four separate events:

1. **An agent performed work.**
2. **The work produced observable results.**
3. **The results satisfy declared verification conditions.**
4. **An authorized controller accepted the resulting state.**

These events may occur in sequence, but none is interchangeable with another.

The design succeeds when an agent can work flexibly across different hosts while the meaning of intent, evidence, authorized decisions, and completion remains stable, inspectable, and independently enforceable.

The recommended next milestone is a minimal, complete requirement lifecycle with injected failures at every authority, persistence, and verification boundary.

Demonstrating that lifecycle is more valuable than expanding the number of MCP tools before the foundational guarantees are established.
