# Evidence-Driven Program Comprehension (EDPC)
## Methodology and Operational Workflows

**Version:** Proposed methodology, 1.0  
**Date:** 2026-10-19  
**Status:** Working specification; not an independently certified standard

---

## 1. Purpose and definition

**Evidence-Driven Program Comprehension (EDPC)** is a systematic, AI-assisted methodology for discovering, modeling, verifying, and maintaining an understanding of an existing software system. It addresses not only the source code, but also how the system is built, deployed, invoked, used, operated, depended upon, and changed—and what effects and failures it produces in its environment.

EDPC constructs a versioned, evidence-backed **Software Comprehension Model (SCM)**. The model distinguishes:

1. **Declared intent:** what requirements, specifications, names, comments, and people say the software is supposed to do.
2. **Implemented possibilities:** what inspection and analysis establish the code can do under stated assumptions.
3. **Observed behavior:** what tests, telemetry, data, and actual executions demonstrate for a specified build, configuration, workload, and time window.
4. **Environmental consequences:** what the system changes or influences beyond its own functions, including external systems, users, resources, costs, and data.
5. **Failure and adaptation:** how components have failed, may be failing now, can fail, and how compensations, recovery mechanisms, and dependencies respond.
6. **Uncertainty:** what is unknown, unobservable, contradicted, out of scope, or insufficiently supported.

**Primary outcome:** a usable and verifiable body of knowledge from which engineers and decision-makers can answer both anticipated and newly discovered questions. **Not the primary outcome:** a generic repository summary or a declaration that a system is healthy because tests pass.

EDPC is a *methodology proposed here*, assembled from established techniques in program comprehension, static and dynamic analysis, architecture recovery, observability, reliability engineering, and evidence-based assessment. It is not presented as an existing formal standard.

### 1.1 Meta-hub engagements (TIED clients)

When normative TIED data lives under `tied-project/` but the investigation spans the **full repository**, use the **meta-hub** pattern: charter template, bounded paths that always include the hub, and a working-folder artifact tree. Operational detail, checklist mapping, and corpus-map template: [edpc-meta-hub-engagement.md](./edpc-meta-hub-engagement.md). Example charter: [edpc-meta-hub-engagement-charter.v1.example.yaml](../templates/edpc-meta-hub-engagement-charter.v1.example.yaml).

## 2. Governing principles

1. **Evidence precedes conclusions.** Every material claim has traceable support, scoped to the versions, environment, and period to which it applies.
2. **Distinguish assertion, inference, observation, and verification.** A comment is evidence of claimed intent, not proof of correct behavior; a successful test is evidence only for what that test exercises.
3. **Treat failure and degradation as normal possibilities.** Do not assume that the current operating state is correct, complete, or free of hidden compensations.
4. **Discover questions, not just answers.** Every unexpected dependency, discrepancy, uncertainty, or side effect can create a new investigation item.
5. **Work from whole system to focused slices and back.** Build a broad map, investigate particular behaviors, and update the map as knowledge improves.
6. **Use independent verification.** AI explanation is a hypothesis source, not self-validating evidence. Prefer parsers, analyzers, tests, observed traces, records, and independently checked references.
7. **Time-bound operational conclusions.** A production observation can go stale; current state must always specify an observation period.
8. **Record negative and missing evidence accurately.** “Not observed,” “not measured,” “not reproduced,” and “did not happen” are different claims.
9. **Be proportionate and safe.** Default to read-only investigation. Production instrumentation, load testing, fault injection, data access, and code changes require approval and controls.
10. **Remain useful under incomplete access.** Explicitly state limits rather than fabricating certainty; report what additional access or measurements would resolve important unknowns.

## 3. Scope of comprehension

The methodology examines the system through related, nonexclusive domains:

- **Purpose and requirements:** intended users, workflows, outcomes, constraints, business rules, and implicit contracts.
- **Implementation:** repository inventory, source structure, APIs, algorithms, control/data flow, state machines, persistence, configuration, and dependencies.
- **Architecture and deployment:** runtime topology, hosting, processes, services, permissions, networking, third-party providers, CI/CD, build/release identity.
- **Usage and operations:** actual callers, workloads, invocation patterns, schedules, operating procedures, ownership, observable activity, and user journeys.
- **Effects:** data and state mutations, emitted events, downstream processes, resource use, monetary costs, external behavior, and security/privacy implications.
- **Failure and recovery:** prior incidents, current anomalies, partial failures, masked failures, latent defects, failure propagation, durability, backups, and recovery readiness.
- **Evolution and change:** revisions, coupling, historical repairs, technical debt, change impact, testability, upgrade paths, and obsolescence.
- **Quality and confidence:** test coverage in the behavioral sense, evidence quality, unknowns, contradictions, assessment boundaries, and readiness for change.

Not every engagement needs the same depth in every domain. The **scope matrix** must state which domains are sampled, fully investigated, deferred, or excluded, and why.

## 4. Core information model

EDPC keeps a linked set of records (in a database, graph, structured files, or another inspectable format). Stable identifiers allow traceability.

**Entities**

- **System / component:** software boundary, owner, repository path, service, process, dependency, or deployed instance.
- **Capability / behavior:** expected input, output, preconditions, invariants, decision rules, state transitions, and side effects.
- **Environment / interaction:** external actor, API, database, message topic, file, device, permission, configuration, workload, or vendor.
- **Question / hypothesis:** who asked it, why it matters, its current status, and what evidence could distinguish possible answers.
- **Claim:** a precise assertion with applicability boundaries and confidence.
- **Evidence:** source code, commit, dependency inventory, configuration, test, trace, metric, log, incident record, user interview, or runtime experiment.
- **Observation:** what was actually seen, where, under which conditions, and when.
- **Failure mode / finding:** deviation from expected behavior, possible triggers, likelihood if supportable, consequences, mitigations, and uncertainties.
- **Recommendation / decision:** candidate action, rationale, cost/risk assumptions, owner, and validation condition.

**Required claim fields**

`claim_id; statement; classification; subject; applicable_version; environment; time_window; evidence_ids; verification_method; result; confidence; limitations; reviewer; last_reviewed`

A practical classification distinguishes:

- **Declared** — supported by requirements, documentation, comments, or stakeholder statements.
- **Derived** — supported by code reading or static analysis under stated assumptions.
- **Observed** — supported by a specific execution, dataset, or period of telemetry.
- **Verified** — supported by an appropriate independent check of the precise claim.
- **Contradicted** — meaningful evidence conflicts with the claim.
- **Unknown** — available evidence cannot establish a conclusion.

Classification is not a simple ladder: a verified *declaration of intent* is not proof of production behavior. Track confidence separately as **high / medium / low / indeterminate**, with a recorded rationale; avoid false numeric precision.

**Evidence provenance** should include source URI or path, exact code revision/build identifier where relevant, line/range or query, timestamp, system/environment, collection method, relevant sampling constraints, and cryptographic digest when practical. Treat sensitive operational evidence according to agreed retention and access controls.

**Relationships** should include `implements`, `calls`, `depends_on`, `reads`, `writes`, `emits`, `invoked_by`, `deployed_as`, `observed_in`, `supports`, `contradicts`, `causes_or_contributes_to`, `mitigates`, `affects`, and `answers_question`. Mark causal links as hypotheses unless supported by appropriate causal evidence.

## 5. Process control: queues, gates, and iteration

EDPC is managed as a bounded investigation rather than an unending analysis.

**Inputs:** engagement charter; repositories/builds; architecture and operational records; runtime access where authorized; stakeholder questions; known incidents; time and risk constraints.

**Live queues:**

- **Question queue:** client questions plus questions EDPC discovers.
- **Hypothesis queue:** alternative explanations for noteworthy behavior or anomalies.
- **Evidence gap queue:** missing logs, missing tests, inaccessible systems, unverifiable assumptions.
- **Finding queue:** confirmed problems, possible risks, inconsistencies, and positive characteristics.
- **Action queue:** approved follow-up work, investigations, recommendations, and decisions.

**Prioritization:** rank work by potential consequence, exposure, uncertainty, relevance to client objectives, information gained per unit effort, and feasibility/safety of verification. Distinguish *severity* from *confidence*. A high-impact unknown may be more urgent than a low-impact confirmed defect.

**Common activity cycle:**

`Question -> hypotheses -> evidence plan -> collect -> analyze -> independent challenge -> classify -> update model -> identify next questions`

**Common quality gate:** an activity cannot be marked verified unless the claim, applicable context, source evidence, method, and outcome are recorded and reviewed. Unverified items remain visible; they do not block all other work unless safety, contractual, or decision needs require it.

**Stop criteria:** stop a bounded investigation when its agreed questions are answered to the required evidence threshold, risks are documented, new lines of inquiry have insufficient expected value, or an access/budget/safety limit is reached. Record which condition ended the work.

## 6. Workflow A — Commission and bound the engagement

**Goal:** establish what is being examined, why, with which permissions, and what constitutes a useful result.

**Inputs:** client objectives, system and organizational context, known incidents, available artifacts, contractual and security constraints.

**Steps**

1. Interview stakeholders for explicit questions, critical business outcomes, past surprises, known pain points, and planned decisions.
2. Identify system boundaries and dependencies, including environments, vendors, owners, and users.
3. Establish a baseline identity: source revision(s), build(s), deployment(s), configurations, tenancy, regions, and relevant time periods.
4. Agree permitted evidence sources and activities, including production read-only access, telemetry retention, test environments, data handling, and restrictions on intrusive testing.
5. Define a domain-by-domain scope matrix, criticality tiers, the required confidence by decision type, and delivery dates.
6. Create seed questions, risk hypotheses, known unknowns, safety constraints, and an investigation backlog.

**Outputs:** engagement charter; evidence-access matrix; target-system definition; prioritized question backlog; acceptance criteria.

**Exit gate:** system identity, scope, access boundaries, decision owners, and verification expectations are explicit. Where unavailable, limitations are formally recorded.

## 7. Workflow B — Broad discovery and baseline model

**Goal:** establish a navigable system map without pretending to understand every file.

**Steps**

1. Inventory repositories, languages, generated versus authored code, build scripts, packages, containers, services, configurations, tests, schemas, infrastructure, and documentation.
2. Identify entry points: user actions, APIs, scheduled jobs, event consumers, startup hooks, CLI commands, and administrative utilities.
3. Recover the logical and deployment architecture: modules, boundaries, external interfaces, dependencies, and data stores.
4. Generate dependency/call/import graphs where tools can do so reliably; annotate reflection, dynamic dispatch, generated code, plugins, and other blind spots.
5. Identify stateful operations and potential external effects: writes, deletes, events, network calls, credentials, privileged actions, and expensive operations.
6. Find existing evidence of expected behavior: tests, contracts, schemas, runbooks, design records, tickets, and commit history.
7. Compare deployment inventory and runtime discovery against repository expectations to reveal undeployed code, unknown running components, configuration drift, and missing source.
8. Produce a **coverage map** distinguishing fully mapped, sampled, inferred, unknown, and excluded components.

**Outputs:** inventory; context and architecture views; entry-point map; dependency and data-flow maps; evidence index; initial operational and unknowns registers.

**Exit gate:** critical external boundaries, primary workflows, high-value data stores, and major deployments are accounted for or marked unknown. Baseline map and actual deployed inventory are not silently conflated.

## 8. Workflow C — Deep comprehension of a capability or question

**Goal:** answer one bounded behavioral or architectural question with evidence, not just an AI explanation.

**Steps**

1. Select a user journey, capability, entry point, change request, incident, or discovered question.
2. Specify expected outputs, relevant invariants, side effects, relevant inputs, and known environmental assumptions.
3. Trace execution pathways with call graphs, data flow, program slicing, persistence paths, and cross-service contracts.
4. Reconstruct decision rules, state transitions, exceptional branches, error handling, retries, fallbacks, and concurrency behavior.
5. List plausible alternative interpretations and failure hypotheses, not just the first persuasive narrative.
6. Compare stated intent, code-derived possibilities, tests, and observed executions; challenge discrepancies with targeted checks.
7. Model downstream consequences: who or what invokes the capability, which resources it changes, and which other workflows depend on its outputs.
8. Publish an explanation with explicit citations, conditions, confidence, and unanswered questions; update broader system maps.

**Outputs:** behavioral specification; pathway and effect map; claim/evidence register; test/verification results; generated questions.

**Exit gate:** the bounded question has an answer with sufficient evidence, or a clear explanation of why no reliable answer is yet possible.

## 9. Workflow D — Historical, current-state, and prospective failure analysis

**Goal:** identify how the system has failed, whether it is failing now, how failure is concealed or propagated, and what might fail next.

**Steps**

1. **Define correctness and service outcomes.** Identify user-visible success conditions, data invariants, contractual behaviors, SLOs if any, and expected end-to-end results. Uptime alone is insufficient.
2. **Review history.** Examine incidents, postmortems, outages, change records, rollbacks, alerts, recurring support complaints, and fixes that may be compensating for old defects.
3. **Baseline the present.** Correlate deployed version and configuration with a dated observation window. Examine logs, metrics, traces, queue age/backlog, error/retry rates, saturation, data reconciliation, completed business transactions, scheduled-task outcomes, and dependent services.
4. **Search for silent or masked failure.** Look for successful HTTP responses with wrong outcomes; retries hiding dependency errors; circuit breakers or fallback caches always engaged; dead-letter queues; stuck jobs; backlog growth; duplicate events; missing audit records; inconsistent datasets; unexplained resource consumption.
5. **Map failure modes.** For critical components, specify trigger, local effect, propagated effect, detectability, compensation, recovery path, and potential business consequence. Use FMEA-style reasoning where appropriate.
6. **Compare alternative causes.** Distinguish a failure symptom, contributing condition, and verified root cause. Confirm causality where possible; otherwise retain competing explanations.
7. **Verify safely.** Prefer existing evidence, read-only queries, data reconciliation, isolated tests, staging reproduction, or approved synthetic transactions. Production fault injection, load, destructive probes, and configuration changes require explicit authorization and rollback/abort safeguards.
8. **Assign current-state classifications.** For each critical capability use `healthy within observed scope`, `degraded`, `failing`, `masked/compensated`, `suspected`, or `unknown`; add timestamp, scope, evidence, and confidence.
9. **Quantify consequence where evidence permits.** Estimate users/transactions affected, error extent, risk exposure, latency/resource/cost impact, and recovery dependency. Otherwise describe ranges and unknowns without invented numbers.
10. **Update findings and questions.** A newly discovered workaround, damaged state, or observability gap becomes a first-class finding and may trigger another targeted investigation.

**Outputs:** historical incident map; present operational health snapshot; failure-mode/dependency graph; risk and uncertainty register; observability gap register; evidence-backed corrective options.

**Exit gate:** critical outcomes have observed-state assessments or explicitly named blind spots. No blanket “healthy” assertion follows solely from passing tests or process liveness.

## 10. Workflow E — Effects, impact, and change analysis

**Goal:** determine consequences of present behavior and foreseeable changes across the full operating environment.

**Steps**

1. Select a proposed modification, dependency outage, workload change, data failure, or retirement decision.
2. Traverse both directions: *upstream* callers and prerequisites; *downstream* consumers, writes, emitted events, external services, resource effects, and user outcomes.
3. Identify hidden coupling: shared databases, timing assumptions, feature flags, jobs, infrastructure policy, manual operations, and undocumented integrations.
4. Compare baseline and proposed system behavior; enumerate plausible failures, migration issues, rollback constraints, and data compatibility concerns.
5. Assess evidence supporting each impact assertion; distinguish proven dependency from plausible influence.
6. Identify tests, monitoring, deployment controls, and recovery preparations needed to validate the change safely.
7. Produce an impact analysis listing likely effects, assumptions, unresolved exposures, and validation checkpoints.

**Outputs:** change-impact map; dependency exposure analysis; proposed verification plan; implementation constraints and unknowns.

**Exit gate:** material impact pathways and important unknowns are visible to a decision-maker. EDPC does not equate impact analysis with authorization to change production.

## 11. Workflow F — Independent verification and synthesis

**Goal:** turn investigation records into a coherent, inspectable knowledge model and defensible findings.

**Steps**

1. Consolidate claims and evidence, remove duplicates, preserve disagreements, and record versions/time windows.
2. Run structural consistency checks: unresolved references, dangling dependencies, unsupported claims, contradictory representations, and coverage gaps.
3. Challenge material claims with an independent reviewer or verification agent that can inspect the *underlying evidence*, rather than only the original AI narrative.
4. Apply an evidence hierarchy appropriate to the claim: code and build artifacts for implemented possibilities; runtime records for observations; outcome checks for functional effects; authorization and configuration records for permissions; interviews for stated intent.
5. Identify limitations from access, sampling, nondeterminism, data quality, and monitoring blind spots.
6. Connect findings to consequences and candidate actions while keeping recommendations separate from observations.
7. Produce audience-specific views: technical model, operational health/failure view, evidence and unknowns register, and executive decision summary.
8. Freeze a reproducible snapshot with model version, source revisions, observation periods, reviewers, and open issues.

**Outputs:** Software Comprehension Model release; verification ledger; prioritized findings; coverage/confidence report; decision-ready summary.

**Exit gate:** every material conclusion is classified and traceable, unresolved material disputes are visible, and reported coverage is scoped rather than implied to be universal.

## 12. Workflow G — Refresh, learning, and continuous comprehension

**Goal:** keep the model useful as code, deployments, operating conditions, and organizational needs evolve.

**Triggers:** code merges; releases; configuration changes; incidents; telemetry anomalies; dependency advisories; recurring support issues; new client questions; operational drift; stale evidence.

**Steps**

1. Determine what changed since the last model snapshot.
2. Invalidate or mark stale claims whose code, configuration, environment, or observation period no longer matches.
3. Prioritize affected components and operational outcomes; run the appropriate portions of Workflows B–F.
4. Verify whether old findings were resolved, masked, worsened, or made irrelevant; preserve a history of findings and evidence.
5. Update model, confidence, open questions, and recommendations.
6. Review missed failures and prediction errors to improve detection, analysis prompts, tests, and workflow rules.

**Outputs:** incremental model release; change/health delta; revised risks and open-question queue; process-improvement findings.

**Exit gate:** important model changes are reviewed, and the remaining staleness or uncertainty is disclosed. Continuous mode does not imply continuous access or real-time monitoring unless explicitly implemented and authorized.

## 13. End-to-end orchestration

An EDPC engagement can follow this master sequence:

1. **A — Commission:** establish objective, scope, permissions, acceptance conditions.
2. **B — Baseline:** inventory the system and construct initial architecture and usage maps.
3. **C — Investigate:** answer top-ranked questions through bounded capability analysis.
4. **D — Assess failures:** inspect historical incidents, current health, and prospective failure modes; revisit C as needed.
5. **E — Assess consequences:** follow observed and possible effects through dependent systems, users, and proposed changes.
6. **F — Verify and publish:** independently test conclusions, report coverage and uncertainty, issue the model and findings.
7. **G — Refresh:** repeat affected investigations when new questions or evidence arise.

**Branching is expected.** If D discovers a silent data-integrity problem, it may trigger C for the implicated transformation, B for an unknown downstream consumer, and E for the effect of corrupted state. If source and runtime evidence disagree, a discrepancy investigation takes priority over polishing documentation.

**Example question-to-workflow routes:**

- “What does this module do?” -> B -> C -> F.
- “Is the billing processor currently working?” -> A -> B (targeted) -> D -> C -> F.
- “Why is this system expensive?” -> B -> D (resource and workload evidence) -> E -> F.
- “Can we safely replace the database?” -> B -> C -> E -> D (failure/recovery) -> F.
- “What are we missing?” -> B -> D (blind spots) -> F -> reprioritized C/E.

## 14. Discovery engine: finding questions the client did not ask

At each component boundary and each important observation, systematically ask:

- Who invokes this, and who consumes its output?
- What external state or resource does it read, change, create, or destroy?
- What assumptions must remain true for its result to be correct?
- What happens if it is delayed, repeated, skipped, partially completed, or given stale data?
- What failures could be hidden by retries, caches, fallbacks, defaults, or manual workarounds?
- How would we detect a wrong result that looks technically successful?
- Is this behavior actually exercised in the deployed system, and by whom?
- What would change or fail if this component, dependency, person, or vendor disappeared?
- Which claims are based on declaration alone, and which have runtime confirmation?
- What surprising discrepancy or absence of evidence warrants a new question?

Record a new question only when it is distinct, relevant, and actionable. Link it to the observation or evidence that generated it. Apply prioritization so discovery does not become uncontrolled scope expansion.

## 15. Methods and tools, selected by evidence need

**Source/structure:** repository indexing, AST/parser-based analysis, symbol references, dependency/SBOM tooling, call/data/control-flow analysis, schema diffing, version history, infrastructure-as-code review.

**Runtime/operations:** process and service inventory, deployment manifests, metrics, logs, distributed traces, queue and job observations, database consistency checks, business-outcome reconciliation, incident timelines, and approved synthetic tests.

**Behavior/verification:** characterization and regression tests, property and invariant checks, targeted instrumentation, reproducible traces, contract testing, bounded staging experiments, and independent review.

**Failures and risks:** FMEA-style analysis, dependency failure propagation, recovery-path mapping, incident analysis, observability coverage review, configuration/security assessment, and safe resilience exercises when approved.

**AI agent roles:**

- **Planner:** converts questions into scope-limited investigation plans and verification gates.
- **Extractor:** collects structured facts with exact provenance using deterministic tools wherever feasible.
- **Interpreter:** proposes explanations, hypotheses, behavior models, and candidate relationships.
- **Skeptic/verifier:** tries to disconfirm material claims using evidence independent of the interpretation.
- **Integrator:** maintains consistency and updates the shared model and question registry.
- **Reporter:** prepares domain-specific explanations while preserving evidence links and caveats.

An implementation may combine roles, but **hypothesis generation and verification must remain logically separate**. Neither model agreement nor several AI agents repeating the same unsupported statement constitutes independent verification.

## 16. Assessment measures and acceptance criteria

Do not compress understanding, health, and risk into one opaque numerical grade. Report a small set of scoped measures, with transparent denominators and exclusions:

- **Structural coverage:** critical components/interfaces accounted for out of those in the discovered and declared scope.
- **Behavioral coverage:** prioritized workflows with sufficiently analyzed conditions, effects, and failure paths.
- **Evidence coverage:** material claims with adequate linked evidence, stratified by domain and importance.
- **Verification coverage:** material claims independently checked for their specific assertion.
- **Operational observability:** critical outcomes/failure modes with usable detection evidence versus blind spots.
- **Current health:** time-bounded capability statuses with signal quality and unresolved anomalies.
- **Risk exposure:** prioritized credible failures and consequences, separated by confidence and urgency.
- **Knowledge freshness:** claims invalidated or unreviewed following relevant code/environment changes.
- **Open uncertainty:** high-consequence questions or contradictions remaining unresolved.

**Minimum acceptance test for a published assessment:**

1. The scope, version/build, environment, observation window, and access limitations are explicit.
2. Critical capabilities, external boundaries, and their effects are mapped or explicitly marked unknown.
3. Every high-impact finding provides evidence, confidence, consequence, and a validation or action path.
4. Current-health statements are supported by operational/outcome evidence—or reported as unknown.
5. A reviewer can reproduce or independently evaluate sampled high-impact conclusions.
6. Coverage and unresolved uncertainties are reported without suggesting completeness where it has not been shown.
7. Newly discovered questions are captured and either answered, prioritized, deferred, or excluded with reason.

A particular engagement may impose stricter thresholds. Lack of access can yield a valid *limited-scope assessment*, not an unrestricted assurance statement.

## 17. Standard deliverables

**Required**

1. **Engagement charter and scope matrix:** goals, permitted evidence, safety boundaries, priority questions, and completion standards.
2. **Software Comprehension Model:** versioned architecture, capabilities, flows, dependencies, runtime context, usage, and environmental effects.
3. **Evidence and verification ledger:** claims, references, methods, results, assumptions, disagreements, and confidence.
4. **Operational and Failure State Model:** historical incidents, current-health snapshots, failure modes, compensations, propagation, recovery, and detection blind spots.
5. **Findings and uncertainty register:** material findings, limitations, risks, open questions, and discovered investigation opportunities.
6. **Technical and decision summaries:** comprehensible, audience-appropriate views with traceability back to the model.

**Conditional** (per charter)

- Change-impact report; data-integrity assessment; security and dependency assessment; capacity/cost analysis; remediation options; test and instrumentation backlog; release-to-release comparison; continuous-update integration.

**Finding template:** `ID | question | assertion/findings | affected scope | supporting/contradicting evidence | cause hypothesis | observed/possible consequence | confidence | urgency | proposed action or validation | owner | status`.

## 18. Relationship to a consulting assessment framework

**EDPC is the technical discovery and evidence-production layer; the consulting assessment framework is the client decision and action layer.** They should share identifiers and traceability, but remain distinct.

The consulting layer receives client objectives and questions; EDPC returns verified or explicitly uncertain findings **and** newly discovered questions. The consulting layer adds business context, risk appetite, financial implications, priorities, owners, options, and investment decisions. It may then commission additional EDPC investigations to resolve uncertainties material to those decisions.

**Interface:**

`Client objectives/questions -> EDPC investigation -> evidence-backed findings + discovered questions -> business significance and options -> decision/action -> measured outcome -> EDPC reassessment`

The client-facing service can organize conclusions around five decisions: **Understand, Trust, Protect, Change, Decide.** EDPC supplies evidence for all five, but does not by itself establish business value, regulatory compliance, financial return, or permission to remediate without the necessary independent evidence and client authority.

The strongest commercial result is not simply an inventory of defects; it is a transparent answer to **what exists, what works, what may be failing, what matters, what is unknown, and what the client can responsibly decide next**.

## 19. Foundational references and boundaries

The following are supporting disciplines and references, **not** claims that EDPC has a formal certification or that any standard specifically prescribes this methodology:

1. ISO/IEC/IEEE 42010:2022, *Software, systems and enterprise — Architecture description*. Useful for structured architecture descriptions and viewpoints. https://www.iso.org/standard/74393.html
2. ISO/IEC 25010:2023, *Systems and software Quality Requirements and Evaluation — Product quality model*. Useful for organizing software-quality concerns and evaluation criteria. https://www.iso.org/standard/78176.html
3. Google, *Site Reliability Engineering — Monitoring Distributed Systems*. The four golden signals and the distinction between explicit failures and wrong-but-successful results inform the operational workflow. https://sre.google/sre-book/monitoring-distributed-systems/
4. Google, *Site Reliability Engineering — Addressing Cascading Failures*. Supports examination of retries, overload, dependency failure propagation, and recovery behaviors. https://sre.google/sre-book/addressing-cascading-failures/
5. OpenTelemetry, *Observability primer* and *Signals*. Establishes traces, metrics, and logs as evidence sources; observability is not equivalent to functional correctness. https://opentelemetry.io/docs/concepts/observability-primer/ and https://opentelemetry.io/docs/concepts/signals/
6. NIST SP 800-218, *Secure Software Development Framework (SSDF) Version 1.1*. Informs secure development and vulnerability-related assessment practices. https://csrc.nist.gov/pubs/sp/800/218/final
7. OWASP, *Dependency Graph & SBOM Best Practices*. Supports component inventories, transitive dependencies, and explicit coverage limitations. https://cheatsheetseries.owasp.org/cheatsheets/Dependency_Graph_SBOM_Cheat_Sheet.html

**Boundary statement:** EDPC can produce evidence relevant to audits and professional assurance. It does not automatically certify security, compliance, operational safety, or conformance to the referenced standards. Claims requiring specialized legal, security, performance, accessibility, or regulatory judgment require appropriate qualified review and agreed acceptance criteria.

---

## 20. Compact definition

**EDPC is an iterative, question-driven and discovery-generating method for creating a verifiable model of an existing software system across source, architecture, runtime behavior, usage, environmental effects, failures, adaptation, and change.** It operates through bounded investigations that collect evidence, form and challenge hypotheses, preserve uncertainty, and continuously refine the model. The model supports technical understanding directly and supplies the factual foundation for broader client-facing risk, value, modernization, and investment assessments.
