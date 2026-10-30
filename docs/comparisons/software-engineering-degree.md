# Software Engineering Degree — Expanded Course Curriculum

| Field | Value |
| --- | --- |
| **Source** | **Sponsor-proposed** in-repo curriculum (not external accreditation) |
| **Purpose** | Read-only Wave 1 capture of graduate software-engineering course outline |
| **Captured** | 2026-10-26 |
| **Analysis (sibling)** | [software-engineering-degree-vs-tied.md](software-engineering-degree-vs-tied.md) — **887** Interpretation + Observance rows |
| **Evidence boundary** | Curriculum text is sponsor input; stdd did not verify degree accreditation or educational outcomes (**not_measured**) |

---

## TL;DR

1. **16 courses** in four parts: Computing Foundations, Software Engineering, AI and Agentic Software Engineering, Integrative Engineering.
2. **167** numbered modules in this capture (~175 cited in intro is approximate scope text).
3. **887** hyphenated detail points under modules plus framing definitions.
4. **Conceptual / Practical / Evaluative** mastery and **four scales** (algorithm → process) at capture end.
5. **Agentic programming** integrated from mid-curriculum; labs and assessments assumed but not part of this markdown proof.

## Notes for stdd readers

Label all curriculum claims **Sponsor-proposed**. TIED capability claims belong in the sibling Wave 2 doc as **TIED-existing** or **Recommendation-only**. Wave 2 row target: **887** (884 course-attached bullets + 3 framing bullets). Do not treat module titles as extra rows. **`tied_validate_consistency`** and degree competence are **not** equivalent — see sibling proof boundary. Structural body below (`# I.` … `# IV.`) is preserved from capture; normalize edits are limited to this preamble.

---

16 courses · Approximately 175 instructional modules · Two levels of subject coverage

This expands the proposed curriculum by one level:

- Course: A major body of computer science or software engineering knowledge.
- Module: A coherent subject taught within the course.
- Detailed coverage: The specific concepts, mechanisms, techniques, and practices included in that module.

The curriculum is intended for a rigorous undergraduate software engineering degree, with agentic programming integrated into the engineering discipline.

Mathematics, chemistry, physics, and general education are excluded. Each course assumes extensive programming laboratories and practical assessments.

# I. Computing Foundations

## Course 1. Programming and Software Construction

Objective: Develop competence in constructing, understanding, debugging, and maintaining software using multiple programming paradigms.

1\. Programming paradigms

- Procedural: procedures, mutable state, control flow, decomposition.
- Object-oriented: classes, interfaces, encapsulation, inheritance, composition.
- Functional: pure functions, immutability, higher-order functions, closures.
- Event-driven: callbacks, event loops, observers, handlers.
- Selecting paradigms according to problem characteristics.

2\. Variables, types, and control structures

- Primitive, composite, nullable, and user-defined types.
- Expressions, operators, evaluation order, type conversion.
- Conditional execution, iteration, pattern matching.
- Variable scope, lifetime, visibility, initialization.
- Static versus dynamic typing and runtime type errors.

3\. Data structures, modules, and interfaces

- Collections, records, maps, sets, and sequences.
- Abstract data types and encapsulated representations.
- Modules, namespaces, packages, and dependency boundaries.
- Public contracts versus private implementation.
- Reusable libraries and dependency management.

4\. Recursion, exceptions, and resource management

- Recursive decomposition, base cases, stack behavior.
- Error propagation, exception handling, and recovery.
- Result types, error codes, and failure signaling.
- Resource acquisition and deterministic cleanup.
- Files, memory, network handles, and resource ownership.

5\. File I/O, serialization, and command-line programs

- Byte streams versus character streams and encodings.
- Text, CSV, JSON, YAML, and binary formats.
- Parsing, validation, serialization, and schema compatibility.
- Command-line arguments, environment variables, configuration.
- Standard input/output, pipes, exit codes, and shell integration.

6\. Debugging, profiling, and instrumentation

- Breakpoints, stepping, watches, stack traces.
- Hypothesis-driven debugging and defect reproduction.
- Logging, assertions, diagnostic counters, trace output.
- CPU, memory, and I/O profiling.
- Distinguishing symptoms, causes, and contributing conditions.

7\. Development environments and version control

- Compilers, interpreters, runtimes, and build tools.
- Integrated development environments and command-line tools.
- Git branches, commits, diffs, merges, and conflict resolution.
- Dependency installation and environment reproducibility.
- Collaborative workflows, pull requests, and reviews.

8\. Defensive programming and maintainability

- Preconditions, postconditions, and invariants.
- Input validation and error containment.
- Naming, cohesion, readability, and documentation.
- Refactoring without changing observable behavior.
- Small automated tests and basic quality checks.

## Course 2. Algorithms, Data Structures, and Computational Complexity

Objective: Understand how algorithms operate, why they work, and how their performance changes with input characteristics.

1\. Fundamental data structures

- Arrays, dynamic arrays, linked lists.
- Stacks, queues, deques, priority queues.
- Trees, binary search trees, balanced trees.
- Graph representations and adjacency structures.
- Operation costs, memory layouts, and access patterns.

2\. Hashing and indexing

- Hash functions, collision resolution, load factors.
- Hash maps, hash sets, resizing.
- Tree-based indexes and ordered access.
- Index selection for lookup, insertion, and range queries.
- Trade-offs between memory, speed, and ordering.

3\. Sorting and searching

- Linear and binary search.
- Insertion, selection, merge, heap, and quicksort.
- Stable versus unstable sorting.
- In-place versus auxiliary-memory algorithms.
- Searching sorted, unsorted, and indexed data.

4\. Algorithm design techniques

- Recursion and recursive decomposition.
- Divide-and-conquer strategies.
- Greedy algorithms and correctness conditions.
- Dynamic programming and overlapping subproblems.
- Backtracking, branch-and-bound, and pruning.

5\. Graph algorithms

- Depth-first and breadth-first traversal.
- Connected components and cycle detection.
- Topological sorting and dependency ordering.
- Shortest-path and minimum-spanning-tree algorithms.
- Applications to scheduling, routing, and dependency analysis.

6\. Complexity analysis

- Best, average, expected, and worst-case performance.
- Big-O, Big-Theta, and Big-Omega notation.
- Time-space trade-offs and amortized cost.
- Effects of input size, distribution, and structure.
- Recognizing scalability limits.

7\. Algorithm correctness

- Preconditions, postconditions, and loop invariants.
- Termination arguments and partial versus total correctness.
- Inductive reasoning about recursive algorithms.
- Counterexamples and boundary conditions.
- Distinguishing mathematical correctness from implementation correctness.

8\. Algorithm evaluation

- Benchmark design and representative workloads.
- Input generation and adversarial cases.
- Cache effects, allocation overhead, and constant factors.
- Comparing theoretical predictions with measurements.
- Profiling and performance regression detection.

9\. Computational limits

- Decision problems and computability.
- Decidability and undecidable problems.
- P, NP, and NP-completeness.
- Reductions and computational hardness.
- Heuristics, approximations, and bounded solutions.

## Course 3. Programming Languages, Compilers, and Program Analysis

Objective: Understand how source code represents meaning, how language implementations execute it, and how programs can be analyzed mechanically.

1\. Language syntax and semantics

- Grammars, tokens, productions, and syntax trees.
- Operational and denotational views of program behavior.
- Expression evaluation and execution semantics.
- Ambiguity and language-design trade-offs.
- Syntactic correctness versus semantic correctness.

2\. Type systems

- Static, dynamic, strong, and weak typing.
- Type inference, checking, and compatibility.
- Generic types, parametric polymorphism, subtyping.
- Sum types, product types, and algebraic data types.
- Null safety, ownership, and type-based guarantees.

3\. Interpreters, compilers, and virtual machines

- Source-to-source and native compilation.
- Interpretation and bytecode execution.
- Virtual machines and just-in-time compilation.
- Compilation versus runtime errors.
- Runtime libraries, linking, and loading.

4\. Lexing, parsing, and abstract syntax trees

- Lexical analysis and token streams.
- Recursive-descent and grammar-based parsers.
- Concrete syntax trees versus abstract syntax trees.
- Parse errors and error recovery.
- AST traversal and transformation.

5\. Memory and execution models

- Stack frames, heap allocation, object layouts.
- Garbage collection and reference counting.
- Manual allocation and ownership systems.
- Aliasing, pointer safety, and memory lifetime.
- Memory leaks, dangling references, and use-after-free errors.

6\. Scope, binding, and evaluation

- Lexical versus dynamic scope.
- Variable binding and name resolution.
- Closures and captured environments.
- Eager versus lazy evaluation.
- Evaluation order and observable side effects.

7\. Intermediate representations

- Abstract syntax and compiler IR.
- Control-flow graphs and basic blocks.
- Static single assignment form.
- Data dependencies and def-use chains.
- Compiler optimization and code generation.

8\. Static and dynamic program analysis

- Control-flow and dataflow analysis.
- Reaching definitions and liveness.
- Abstract interpretation fundamentals.
- Type analysis, taint analysis, and dependency analysis.
- Runtime instrumentation and dynamic tracing.

9\. Program transformation and code generation

- AST-based rewriting and refactoring.
- Source-to-source transformation.
- Code templates versus structural generators.
- Automated migrations and API transformations.
- Correctness preservation and transformation validation.

## Course 4. Computer Architecture, Operating Systems, and Runtime Behavior

Objective: Understand the physical and operating-system mechanisms that determine how software executes and fails.

1\. Machine representation and processor architecture

- Binary data, integers, floating-point representation.
- Endianness, alignment, and machine word sizes.
- Registers, instruction sets, and addressing modes.
- Assembly language and machine-level execution.
- CPU pipelines, branches, and instruction execution.

2\. Processes, threads, and scheduling

- Process creation, termination, and hierarchy.
- Threads, context switching, and scheduling.
- User mode versus kernel mode.
- Process isolation and interprocess communication.
- CPU-bound versus I/O-bound execution.

3\. Virtual memory and protection

- Address spaces, pages, and page tables.
- Virtual-to-physical address translation.
- Stack, heap, mapped files, and shared memory.
- Protection boundaries and access violations.
- Paging, swapping, and memory pressure.

4\. Filesystems and storage

- Files, directories, inodes, and metadata.
- File descriptors and filesystem APIs.
- Buffered I/O, caching, and writeback.
- Journaling, atomic rename, and crash consistency.
- Storage durability and filesystem failure modes.

5\. System calls, signals, and interrupts

- User-kernel transitions.
- System call conventions and error handling.
- Signals, handlers, and process control.
- Hardware interrupts and device interaction.
- Blocking, nonblocking, and asynchronous I/O.

6\. Synchronization and concurrency

- Shared memory and synchronization requirements.
- Mutexes, semaphores, condition variables.
- Atomic operations and memory-ordering constraints.
- Race conditions and deadlocks.
- Livelock, starvation, and contention.

7\. Memory hierarchy and performance

- Registers, CPU caches, main memory, storage.
- Spatial and temporal locality.
- Cache misses, page faults, and latency.
- CPU utilization versus system throughput.
- Performance bottlenecks across hardware layers.

8\. Containers and isolation

- Operating-system namespaces and resource controls.
- Container filesystems and process isolation.
- Resource quotas and enforcement.
- Virtual machines versus operating-system containers.
- Container security and isolation limitations.

9\. Crash recovery and process failure

- Abrupt termination versus graceful shutdown.
- Volatile state versus persistent state.
- Flush, synchronization, and durability guarantees.
- Recovery records, checkpoints, and journals.
- Process supervision and restart behavior.

## Course 5. Networking, Concurrency, and Distributed Systems

Objective: Design software that communicates and coordinates correctly despite latency, concurrent execution, and partial failure.

1\. Network protocols and transport

- IP addressing, routing, DNS, and name resolution.
- TCP connections, retransmissions, and congestion.
- UDP datagrams and delivery limitations.
- HTTP requests, headers, status codes, and connection reuse.
- TLS handshakes, encryption, and certificate verification.

2\. Network programming

- Socket creation, binding, listening, and connection.
- Blocking versus nonblocking operations.
- Connection lifecycles and resource cleanup.
- Network errors, timeouts, and disconnections.
- Framing messages over byte-stream protocols.

3\. Communication models

- Request-response APIs and REST conventions.
- RPC, serialization, and service contracts.
- WebSockets and persistent bidirectional connections.
- Publish-subscribe and message-oriented communication.
- Streaming and long-lived communication sessions.

4\. Concurrent and asynchronous execution

- Threads, processes, coroutines, and event loops.
- Futures, promises, tasks, and asynchronous I/O.
- Shared-state versus message-passing concurrency.
- Cancellation, deadlines, and structured concurrency.
- Work queues and task coordination.

5\. Distributed state and consistency

- Replication and authoritative state ownership.
- Strong versus eventual consistency.
- Linearizability and consistency guarantees.
- Ordering, logical clocks, and distributed events.
- Consistency, availability, and network-partition trade-offs.

6\. Messaging and event processing

- Queues, topics, brokers, and consumers.
- Delivery acknowledgments and consumer offsets.
- Event ordering, reordering, and duplication.
- At-most-once and at-least-once delivery.
- Event sourcing and stream processing.

7\. Transactions and reliable operations

- Atomic operations within local boundaries.
- Idempotency keys and duplicate suppression.
- Retry strategies, exponential backoff, and jitter.
- Distributed workflows, sagas, and compensating actions.
- Safe operation under ambiguous completion outcomes.

8\. Partial failures and resilience

- Network partitions, lost responses, and delayed messages.
- Timeout selection and deadline propagation.
- Circuit breakers, bulkheads, and failure containment.
- Retry storms and cascading failures.
- Distinguishing unavailable, slow, and incorrect services.

9\. Replication, coordination, and consensus

- Leader election and replicated state machines.
- Quorums and majority-based decisions.
- Consensus concepts, including Raft.
- Split-brain behavior and fencing.
- Coordination service failure and recovery.

10\. Scalability and capacity management

- Horizontal versus vertical scaling.
- Load balancing and partitioning.
- Throughput, latency, concurrency, and utilization.
- Backpressure, queue growth, and admission control.
- Performance testing and bottleneck identification.

## Course 6. Databases and Data Engineering

Objective: Design, operate, and evolve data systems that preserve integrity while satisfying application performance and availability requirements.

1\. Relational data modeling

- Entities, attributes, relationships, and cardinality.
- Primary keys, foreign keys, and uniqueness constraints.
- Normalization and controlled denormalization.
- Schema design and integrity enforcement.
- Mapping application domain models to relational structures.

2\. SQL and query execution

- Selection, projection, joins, grouping, and aggregation.
- Subqueries, common table expressions, and window functions.
- Indexes and execution plans.
- Query optimization and statistics.
- Avoiding unnecessary scans, joins, and data transfers.

3\. Transactions and isolation

- Atomicity, consistency, isolation, and durability.
- Locking, multiversion concurrency control, and snapshots.
- Read phenomena, lost updates, and write conflicts.
- Deadlocks, retries, and transaction boundaries.
- Appropriate isolation guarantees for application invariants.

4\. Nonrelational database models

- Document databases and nested records.
- Key-value stores and access-by-key patterns.
- Wide-column databases and distributed partitioning.
- Graph databases and relationship traversal.
- Selecting a data model according to query and consistency requirements.

5\. Distributed data management

- Primary-replica and multi-primary architectures.
- Partitioning, sharding, and replica placement.
- Replication lag and read consistency.
- Distributed transactions and coordination.
- Data rebalancing and node-failure recovery.

6\. Data pipelines and event processing

- Batch versus streaming pipelines.
- Extraction, transformation, and loading.
- Change data capture and event ingestion.
- Stream processing, windows, and late-arriving events.
- Pipeline retries, checkpoints, and replay.

7\. Data integrity and schema evolution

- Constraints and application-level validation.
- Backward- and forward-compatible schema changes.
- Database migration strategies.
- Data correction, deduplication, and reconciliation.
- Coordinating schema updates with software deployments.

8\. Data provenance and quality

- Identifying data sources and transformation history.
- Lineage across applications and pipelines.
- Completeness, accuracy, consistency, and freshness.
- Detecting corruption, duplication, and unexpected changes.
- Auditing and explaining derived results.

9\. Backup, recovery, and retention

- Full, incremental, and point-in-time backups.
- Recovery logs and transaction replay.
- Recovery point and recovery time objectives.
- Retention, archival, and deletion policies.
- Backup integrity verification and restoration testing.

10\. Data access and application performance

- Connection pooling and transaction lifetimes.
- Query batching and N+1 query avoidance.
- Caching and cache invalidation.
- Pagination and large-result handling.
- Database telemetry, slow-query diagnosis, and capacity planning.

# II. Software Engineering

## Course 7. Requirements Engineering, Domain Modeling, and Human Interaction

Objective: Translate stakeholder needs and operating constraints into precise, testable descriptions of intended system behavior.

1\. Stakeholder discovery and problem definition

- Identifying stakeholders, users, operators, and affected parties.
- Interviews, observation, workshops, and document analysis.
- Separating stated requests from underlying needs.
- Establishing system purpose, scope, and boundaries.
- Identifying assumptions, uncertainties, and conflicts.

2\. Functional and nonfunctional requirements

- Describing behaviors, inputs, outputs, and outcomes.
- Performance, reliability, availability, and security requirements.
- Maintainability, usability, portability, and operational constraints.
- Measurable quality targets and acceptance thresholds.
- Distinguishing requirements from implementation choices.

3\. Domain-driven design and bounded contexts

- Domain vocabulary and ubiquitous language.
- Entities, value objects, aggregates, and domain services.
- Business invariants and consistency boundaries.
- Bounded contexts and context relationships.
- Domain events and domain-specific behaviors.

4\. Use cases, scenarios, and user stories

- Actors, goals, triggers, and success conditions.
- Main flows, alternative flows, and exception flows.
- User journeys and interaction sequences.
- Scenario-based requirement discovery.
- Acceptance examples and executable specifications.

5\. Ambiguity, incompleteness, and conflicting requirements

- Detecting undefined terminology and hidden assumptions.
- Discovering missing cases and unspecified outcomes.
- Identifying inconsistent or incompatible requirements.
- Constructing counterexamples and probing questions.
- Recording unresolved decisions and their consequences.

6\. Constraints, invariants, and acceptance criteria

- Preconditions, postconditions, and allowed state changes.
- Safety and correctness invariants.
- Boundary conditions and prohibited behaviors.
- Observable acceptance tests and expected outcomes.
- Distinguishing mandatory behavior from preferences.

7\. Behavioral and state-based specifications

- State machines and state-transition tables.
- Sequence diagrams and interaction protocols.
- Event-response rules and temporal requirements.
- Concurrent behavior and exceptional states.
- Behavioral equivalence and specification consistency.

8\. Human-computer interaction

- User-centered design and task analysis.
- Interface navigation, feedback, and error prevention.
- Accessibility principles and assistive technology.
- Cognitive load and information presentation.
- Usability evaluation and interaction testing.

9\. Requirements traceability

- Requirement identifiers and structured links.
- Mapping requirements to architecture, implementation, and tests.
- Detecting missing, unsupported, or orphaned artifacts.
- Change propagation and impact analysis.
- Maintaining traceability evidence as systems evolve.

10\. Validation and prioritization

- Prototypes, reviews, simulations, and stakeholder walkthroughs.
- Risk-based and value-based prioritization.
- Cost, dependencies, uncertainty, and sequencing.
- Negotiating requirements and documenting decisions.
- Confirming that specifications represent actual needs.

## Course 8. Software Architecture and System Design

Objective: Design structures that satisfy behavioral requirements while accommodating change, operational constraints, and failure.

1\. Abstraction and decomposition

- Functional and responsibility-based decomposition.
- Coupling, cohesion, and dependency direction.
- Information hiding and stable interfaces.
- Complexity management through boundaries.
- Evaluating competing decompositions.

2\. Modularity and component design

- Modules, components, libraries, services, and subsystems.
- Encapsulation of state and behavior.
- Dependency injection and inversion.
- Component contracts and lifecycle management.
- Independent development, testing, and replacement.

3\. Architectural patterns

- Layered and hexagonal architectures.
- Ports and adapters.
- Client-server, microservices, and modular monoliths.
- Event-driven and message-oriented architectures.
- CQRS, event sourcing, and pipeline designs.
- Criteria for selecting and combining patterns.

4\. Vertical slices and domain boundaries

- Feature-centered organization.
- Keeping behavior and dependencies within a feature boundary.
- Shared infrastructure versus shared business logic.
- Bounded-context alignment.
- Minimizing cross-feature changes.

5\. API and interface architecture

- Service contracts and interface semantics.
- REST, RPC, and asynchronous event interfaces.
- Versioning, deprecation, and compatibility.
- Error models and failure signaling.
- Schema evolution and contract testing.

6\. State and transaction architecture

- Ownership and location of mutable state.
- Stateless versus stateful components.
- Transaction scopes and consistency boundaries.
- Persistence abstractions and caching.
- Coordinating state changes across components.

7\. Quality attributes and trade-offs

- Reliability, availability, security, and performance.
- Maintainability, portability, extensibility, and testability.
- Scalability and operational cost.
- Quality-attribute scenarios and measurable targets.
- Identifying competing architectural goals.

8\. Architecture decisions and documentation

- Architecture decision records.
- Alternatives, constraints, and consequences.
- Component, deployment, and runtime views.
- Context and sequence diagrams.
- Recording assumptions and decisions that may need revision.

9\. Architecture evaluation and failure analysis

- Scenario-based architecture reviews.
- Identifying single points of failure.
- Dependency, fault-propagation, and bottleneck analysis.
- Technical debt and architectural erosion.
- Evolutionary risks and migration options.

10\. Architectural fitness and evolution

- Automated architectural constraints.
- Dependency rules and architecture tests.
- Fitness functions for quality attributes.
- Incremental restructuring and modernization.
- Monitoring architecture as the implementation changes.

## Course 9. Software Maintenance, Reverse Engineering, and Program Comprehension

Objective: Reconstruct what an existing software system actually does, how it interacts with its environment, and how it can safely be changed.

1\. Codebase discovery

- Repository structure and module inventory.
- Build systems, languages, dependencies, and configurations.
- Entry points, execution modes, and deployment artifacts.
- Identifying unused, duplicated, or generated code.
- Constructing an initial system map.

2\. Static and dynamic analysis

- Syntax-tree and symbol analysis.
- Call graphs and dependency graphs.
- Runtime tracing and instrumentation.
- Code search and structural pattern detection.
- Reconciling static predictions with runtime observations.

3\. Execution and dataflow reconstruction

- Following execution from inputs to outputs.
- Tracking mutations and state transitions.
- Identifying external reads and writes.
- Mapping control paths, loops, and exception handling.
- Detecting implicit dependencies and side effects.

4\. Behavioral reconstruction

- Recovering undocumented rules.
- Inferring preconditions and postconditions.
- Characterizing current behavior with tests.
- Distinguishing intended behavior from implemented behavior.
- Identifying unexplained and unreachable behaviors.

5\. Legacy systems and hidden assumptions

- Historical compatibility and obsolete interfaces.
- Implicit environmental and timing assumptions.
- Hidden global state and cross-module coupling.
- Dependency on undocumented data formats.
- Assumptions that become invalid under change.

6\. Refactoring and modernization

- Extracting functions, modules, and interfaces.
- Dependency isolation and incremental replacement.
- Strangler migration and compatibility layers.
- Safe restructuring using characterization tests.
- Reducing complexity without changing externally observable behavior.

7\. Behavior preservation and compatibility

- Public API and binary compatibility.
- Data compatibility and schema migration.
- Regression and differential testing.
- Golden-master and snapshot techniques.
- Identifying tolerated defects that have become dependencies.

8\. Defect localization and root-cause analysis

- Failure reproduction and minimization.
- Fault isolation and hypothesis testing.
- Change history and regression bisection.
- Causal chains, triggers, and latent defects.
- Separating primary causes from secondary failures.

9\. Change impact and migration planning

- Dependency impact analysis.
- Identifying affected requirements and tests.
- Estimating migration and compatibility risk.
- Incremental rollout and rollback planning.
- Establishing evidence that a change is safe.

10\. Operational and environmental effects

- Filesystem, network, database, and external-service interactions.
- Configuration and environment sensitivity.
- Resource consumption and performance consequences.
- Failure propagation across system boundaries.
- Detecting degraded or already-failing components.
- Understanding system behavior under abnormal operating conditions.

## Course 10. Verification, Validation, and Software Quality

Objective: Develop rigorous methods for determining what software guarantees, what it actually does, and how strong the supporting evidence is.

1\. Software testing levels

- Unit, component, integration, system, and acceptance tests.
- Test isolation and dependency substitution.
- Test doubles, mocks, stubs, and fakes.
- End-to-end testing and realistic environments.
- Selecting tests for different failure classes.

2\. Test-driven and behavior-driven development

- Red-green-refactor development cycle.
- Test-first specification of behavior.
- Executable examples and acceptance scenarios.
- Tests as contracts and design feedback.
- Avoiding implementation-coupled and brittle tests.

3\. Property-based, fuzz, and mutation testing

- Input generators and constrained test domains.
- Properties, invariants, and metamorphic relations.
- Shrinking failing examples.
- Coverage-guided fuzzing.
- Mutation operators and surviving mutations.
- Evaluating the ability of tests to detect defects.

4\. Formal specifications and contracts

- Preconditions, postconditions, and invariants.
- Design by contract.
- State-transition and behavioral specifications.
- Safety and liveness properties.
- Refinement relationships between specifications and implementations.

5\. Model checking and symbolic execution

- Finite-state models and reachable states.
- Temporal properties and state exploration.
- Counterexample generation.
- Symbolic paths and path constraints.
- State explosion and bounded verification.
- Selecting practical verification boundaries.

6\. Static analysis and runtime verification

- Type checking, linting, and abstract interpretation.
- Taint analysis and security-oriented analysis.
- Dataflow and resource-lifetime analysis.
- Runtime assertions and invariant monitoring.
- False positives, false negatives, and soundness limitations.

7\. Fault injection and chaos testing

- Deliberate failures of components and dependencies.
- Crash-point and recovery testing.
- Timeouts, partitions, packet loss, and delayed responses.
- Disk-full, resource-exhaustion, and corruption scenarios.
- Recovery invariants and graceful degradation.

8\. Concurrency and distributed-system testing

- Race detection and scheduling variation.
- Deterministic simulation where practical.
- Testing retries, duplicate delivery, and reordering.
- State-machine and protocol testing.
- Testing idempotency, consistency, and recovery.

9\. Coverage and evidence adequacy

- Statement, branch, path, and condition coverage.
- Requirements and behavioral coverage.
- Risk-weighted test selection.
- Evaluating test effectiveness rather than test count.
- Identifying untested assumptions and failure modes.

10\. Verification versus validation

- Conformance to specifications versus fitness for intended use.
- Independent reviews and acceptance evidence.
- Traceability between claims and observations.
- Handling ambiguous or incomplete specifications.
- Explicit uncertainty and limitations of evidence.

11\. Reliability and continuous quality improvement

- Defect classification and escape analysis.
- Failure frequency, severity, and impact.
- Reliability indicators and operational evidence.
- Quality gates and trend analysis.
- Root-cause investigation and preventive improvements.
- Improving the development process using measured results.

## Course 11. Software Security, Privacy, and Safety

Objective: Build software that resists misuse and attack, protects sensitive information, and limits harm when systems fail.

1\. Threat modeling

- Assets, adversaries, trust boundaries, and attack surfaces.
- Threat enumeration and attack trees.
- STRIDE-style threat categorization.
- Likelihood, impact, and prioritization.
- Mapping threats to architecture and controls.

2\. Authentication and authorization

- Identity, authentication, and session management.
- Roles, attributes, and policy-based access control.
- Least privilege and separation of duties.
- Credential lifecycle and token security.
- Authorization at service and data boundaries.

3\. Cryptography and secure communication

- Encryption, hashing, and message authentication.
- Symmetric and asymmetric cryptography.
- Digital signatures and certificate chains.
- TLS and secure transport configuration.
- Key generation, storage, rotation, and revocation.
- Correct use of established cryptographic libraries.

4\. Secure development and supply-chain security

- Secure coding standards.
- Dependency vulnerability assessment.
- Software bills of materials.
- Signed artifacts and build provenance.
- Reproducible builds and protected pipelines.
- Dependency confusion and compromised build environments.

5\. Input validation and application vulnerabilities

- SQL, command, and template injection.
- Cross-site scripting and cross-site request forgery.
- Server-side request forgery and path traversal.
- Deserialization vulnerabilities.
- Output encoding and context-specific escaping.
- Applying established web application security guidance.

6\. Sandboxing and isolation

- Process and container isolation.
- Restricted execution environments.
- Capability-based access.
- Filesystem, network, and command restrictions.
- Resource quotas and execution limits.
- Containing untrusted or generated code.

7\. Privacy engineering

- Data classification and minimization.
- Purpose limitation and retention.
- Consent and access management.
- Encryption, pseudonymization, and de-identification.
- Deletion, auditability, and information lifecycle controls.

8\. Vulnerability assessment and testing

- Static and dynamic application security testing.
- Dependency and configuration scanning.
- Penetration-testing methodologies.
- Security fuzzing and adversarial testing.
- Vulnerability triage, remediation, and verification.

9\. Security operations and incident response

- Audit logging and security telemetry.
- Detection, investigation, and containment.
- Forensic preservation of evidence.
- Incident recovery and remediation.
- Post-incident analysis and control improvement.

10\. Safety engineering

- Hazards versus security threats.
- Hazard identification and impact analysis.
- Fault trees and failure-mode analysis.
- Fail-safe defaults and bounded behavior.
- Redundancy, interlocks, and emergency controls.
- Safety evidence and assurance arguments.

11\. AI and agent-specific security

- Prompt injection and malicious retrieved content.
- Tool-output poisoning and trust-boundary violations.
- Excessive permissions and unauthorized actions.
- Data exfiltration through prompts or tools.
- Agent-to-agent trust and delegated authority.
- Human approval gates and auditable execution.

## Course 12. DevOps, Platform Engineering, and Site Reliability

Objective: Build, release, operate, observe, and improve software as a continuously running system.

1\. Build and dependency engineering

- Build graphs and dependency resolution.
- Reproducible and deterministic builds.
- Artifact creation and packaging.
- Dependency version pinning.
- Build caching and incremental compilation.
- Artifact integrity and provenance.

2\. Continuous integration and delivery

- Automated build, test, and validation pipelines.
- Pipeline stages and quality gates.
- Parallel testing and environment management.
- Release approval and automated deployment.
- Secrets and credentials in CI/CD environments.
- Pipeline failure diagnosis.

3\. Cloud and infrastructure engineering

- Virtual machines, containers, and orchestration.
- Infrastructure as code.
- Network and storage configuration.
- Service discovery and workload placement.
- Environment isolation and configuration.
- Infrastructure testing and drift detection.

4\. Release and deployment strategies

- Versioning and release artifact management.
- Rolling, blue-green, and canary deployments.
- Feature flags and progressive delivery.
- Database and API compatibility during rollout.
- Rollback, roll-forward, and recovery procedures.

5\. Observability

- Structured logs and contextual identifiers.
- Metrics, dimensions, histograms, and aggregation.
- Distributed traces and request correlation.
- Dashboards, alerts, and operational signals.
- Identifying symptoms and tracing causal relationships.

6\. Service reliability management

- Service-level indicators.
- Service-level objectives and agreements.
- Availability and latency measurement.
- Error budgets and release risk.
- Balancing reliability investment against delivery.

7\. Capacity, performance, and cost

- Load generation and representative workload testing.
- Throughput, concurrency, and latency distributions.
- CPU, memory, storage, and network saturation.
- Scaling policies and resource planning.
- Cloud cost attribution and cost-performance trade-offs.

8\. Operational resilience

- Redundancy and high availability.
- Failure detection and automated recovery.
- Backup and disaster recovery.
- Regional and dependency failures.
- Recovery objectives and continuity planning.
- Routine recovery drills.

9\. Automated operations and configuration

- Declarative configuration and desired state.
- Configuration versioning.
- Automated provisioning and reconciliation.
- Scheduled tasks and operational runbooks.
- Safe automation, idempotency, and rollback.

10\. Production debugging and incident management

- Incident severity and triage.
- Live-system diagnostics.
- Correlation of changes and failures.
- Mitigation versus permanent remediation.
- Incident communication and coordination.
- Preserving diagnostic evidence.

11\. Continuous operational improvement

- Blameless postmortems and contributing factors.
- Reliability trend analysis.
- Defect and incident recurrence prevention.
- Improving alerts, runbooks, and automation.
- Measuring whether corrective actions work.
- Using production evidence to revise architecture and engineering practices.

# III. AI and Agentic Software Engineering

## Course 13. Artificial Intelligence and Language Model Engineering

Objective: Understand the construction, operation, capabilities, limitations, and evaluation of AI systems used in software applications.

1\. Classical artificial intelligence

- Problem representation and state-space search.
- Heuristic search and goal-directed reasoning.
- Knowledge representation and rule-based systems.
- Planning, constraints, and decision procedures.
- Reactive versus deliberative AI systems.

2\. Machine learning and neural networks

- Supervised, unsupervised, and reinforcement learning.
- Training, validation, and test datasets.
- Features, labels, parameters, and learned representations.
- Neural network layers, activations, and training concepts.
- Generalization, overfitting, and distribution shift.

3\. Transformers and language models

- Transformer architecture and attention mechanisms.
- Token embeddings and positional representations.
- Pretraining and instruction tuning.
- Autoregressive generation.
- Model scale, capabilities, and inference characteristics.

4\. Tokenization, context, and inference

- Tokenization algorithms and vocabulary representations.
- Context windows and attention limitations.
- Sampling temperature, top-p, and output variability.
- Context truncation and information loss.
- KV caches, batching, and inference efficiency.

5\. Prompt engineering and structured generation

- Instructions, examples, and task constraints.
- Prompt templates and role separation.
- JSON schemas and constrained output generation.
- Validation, parsing, and repair of model output.
- Prompt robustness and sensitivity testing.

6\. Retrieval-augmented generation

- Document segmentation and chunking.
- Embeddings and vector similarity search.
- Keyword, semantic, and hybrid retrieval.
- Metadata filtering and reranking.
- Context assembly and source attribution.
- Retrieval quality and grounded-answer evaluation.

7\. Model adaptation

- Prompting versus retrieval versus fine-tuning.
- Supervised fine-tuning.
- Parameter-efficient adaptation such as LoRA.
- Domain adaptation and data preparation.
- Evaluating adaptation benefits and regressions.

8\. Model selection and deployment

- Hosted versus locally deployed models.
- General-purpose versus specialized models.
- Capability, context length, latency, and cost trade-offs.
- Quantization and inference optimization.
- Caching, batching, and serving architectures.

9\. Model limitations and uncertainty

- Hallucination and unsupported claims.
- Context omissions and attention failures.
- Sensitivity to prompt wording and ordering.
- Dataset bias and knowledge limitations.
- Confidence estimates versus demonstrated correctness.
- Detecting and communicating uncertainty.

10\. AI evaluation and benchmarking

- Benchmark design and representative task selection.
- Exact-match, semantic, and task-completion evaluation.
- Model-based judges and judge calibration.
- Human evaluation and inter-rater agreement.
- Robustness, adversarial inputs, and distribution shift.
- Regression testing across model versions.

11\. Responsible AI and governance

- Privacy and data handling.
- Training data provenance and licensing.
- Bias, fairness, and disparate impacts.
- Transparency and explainability limitations.
- Human oversight and accountability.
- Model lifecycle governance and risk management.

## Course 14. Agentic Programming and Autonomous Software Systems

Objective: Design and implement software agents that can use tools, manage state, plan and execute work, and operate within explicitly controlled boundaries.

1\. Agents versus deterministic workflows

- Deterministic pipelines and scripted automation.
- Model-directed decisions and branching behavior.
- Agent loops: observe, reason, act, and evaluate.
- Goal-directed versus event-driven execution.
- Selecting agentic behavior only where it provides value.
- Identifying operations that require deterministic guarantees.

2\. Tool use and function calling

- Tool declarations, schemas, and typed parameters.
- Tool discovery and selection.
- Input validation and output interpretation.
- Tool errors, retries, and exception handling.
- Tool composition and chained operations.
- Side effects, authorization, and idempotency.

3\. Context, memory, and state

- Working context versus persistent memory.
- Conversation history and task state.
- Context selection, compression, and summarization.
- Retrieval from external knowledge stores.
- State persistence and memory invalidation.
- Provenance, freshness, and trust of remembered information.

4\. Task planning and execution

- Goal decomposition and subtask generation.
- Dependency graphs and task ordering.
- Planning before execution versus dynamic replanning.
- Progress tracking and completion criteria.
- Handling incomplete instructions and uncertain outcomes.
- Detecting stalled, circular, or unproductive execution.

5\. Agent orchestration

- Sequential and parallel agent operations.
- Routing tasks to specialized agents.
- Supervisor-worker and hierarchical arrangements.
- Explicit state-machine orchestration.
- Event-driven execution and conditional branching.
- Error propagation, cancellation, and recovery.

6\. Multi-agent systems

- Agent roles, responsibilities, and capabilities.
- Delegation contracts and output expectations.
- Communication protocols and shared artifacts.
- Coordination, consensus, and conflict resolution.
- Redundant or adversarial review.
- Costs and risks of multi-agent complexity.

7\. Agent interfaces, protocols, and skills

- Model Context Protocol (MCP) concepts.
- Tools, resources, prompts, and capability discovery.
- Tool-provider contracts and interface schemas.
- Reusable procedural skills and instructions.
- Client-server trust boundaries.
- Versioning, compatibility, and permission management.

8\. Persistent workflow execution

- Explicit execution state and checkpoints.
- Resuming after process interruption.
- Durable task queues and workflow engines.
- State transitions and transition guards.
- Retrying without duplicating completed side effects.
- Recovery from partially completed operations.

9\. Security and execution boundaries

- Least-privilege tool access.
- Sandboxed command execution.
- Filesystem and network restrictions.
- Secrets isolation and credential handling.
- Prompt injection and untrusted tool results.
- Restricting unauthorized external actions.

10\. Human-agent interaction and control

- Approval gates and delegated authority.
- Interrupting, inspecting, and resuming execution.
- Explaining proposed actions and observed results.
- Escalating uncertainty, risk, and policy conflicts.
- Human override and emergency termination.
- Maintaining auditable decision histories.

11\. Agent evaluation and failure analysis

- Task success versus plausible output.
- Tool-selection and argument-correctness evaluation.
- Trajectory and execution-trace analysis.
- Tool misuse, loops, omissions, and premature completion.
- Benchmark suites and repeatability.
- Independent verification of external effects.

12\. Autonomy, reliability, and resource trade-offs

- Reasoning effort versus execution latency.
- Token, tool-call, and monetary budgets.
- Execution deadlines and task cancellation.
- Probability of success across multi-step workflows.
- Cost of supervision versus autonomous operation.
- Deciding where autonomy should stop.

13\. Graceful degradation and bounded autonomy

- Maximum execution depth and iteration limits.
- Failure thresholds and circuit breakers.
- Fallback from agents to deterministic procedures.
- Safe partial completion.
- Explicit unresolved-task reporting.
- Recovery, rollback, and human escalation.

## Course 15. Software Engineering Process, Evidence, and Agentic Development

Objective: Establish repeatable engineering processes in which humans and agents collaboratively produce verifiable software artifacts.

This course integrates software engineering methodology with AI-assisted development, independent validation, and continuous process improvement.

1\. Software development lifecycles

- Waterfall, iterative, incremental, and agile processes.
- Scrum, Kanban, and continuous delivery.
- Lifecycle selection according to uncertainty and risk.
- Short feedback loops and incremental commitments.
- Work-in-progress controls and task completion criteria.
- Process adaptation as project conditions change.

2\. Lean engineering and improvement systems

- Lean principles and waste reduction.
- Kaizen and continuous improvement.
- Plan-Do-Check-Act cycles.
- Theory of constraints and bottleneck reduction.
- Feedback from defects, production behavior, and stakeholders.
- Measuring whether process changes improve outcomes.

3\. Specification-driven and test-driven development

- Specifications as explicit behavioral contracts.
- Requirement refinement into testable assertions.
- Test-first implementation cycles.
- Acceptance-test-driven development.
- Formal invariants and specification consistency.
- Separating expected behavior from implementation details.

4\. Agent-assisted engineering activities

- Requirements extraction and clarification.
- Architecture alternatives and design evaluation.
- Source generation and code modification.
- Automated test generation and execution.
- Code review, documentation, and refactoring.
- Using agents for reverse engineering and defect investigation.

5\. Planning agentic engineering work

- Converting requirements into executable work plans.
- Decomposing work into bounded units.
- Dependency ordering and prerequisite verification.
- Completion conditions and evidence requirements.
- Replanning when results contradict assumptions.
- Preventing unverified task completion claims.

6\. Delegation and context engineering

- Defining the delegated scope of authority.
- Providing relevant requirements, constraints, and artifacts.
- Context filtering and avoiding irrelevant information.
- Agent-to-agent handoff contracts.
- Managing context degradation and information loss.
- Preventing uncontrolled expansion of work scope.

7\. Traceability and change propagation

- Unique requirement, design, and implementation identifiers.
- Linking requirements, architecture, implementation, tests, and code.
- Traceability matrices and dependency graphs.
- Identifying missing or contradictory links.
- Change impact across artifacts.
- Automated traceability consistency checks.

8\. Evidence collection and independent verification

- Defining claims that require supporting evidence.
- Capturing test results, traces, and measurements.
- Distinguishing generated assertions from independent observations.
- Reproducible verification procedures.
- Reviewer independence and separation of responsibility.
- Evaluating evidence completeness, relevance, and trustworthiness.

9\. Nondeterministic output evaluation

- Repeated trials and observed variability.
- Semantic equivalence versus exact equality.
- Evaluator models and deterministic validators.
- Reference implementations and differential evaluation.
- Controlled experimental comparisons.
- Measuring agent reliability across task distributions.

10\. Human-agent collaboration

- Division of responsibility between humans and agents.
- Review, approval, and escalation boundaries.
- Human judgment in ambiguous design decisions.
- Resolving contradictory agent recommendations.
- Trust calibration and automation bias.
- Maintaining clear responsibility for final outcomes.

11\. Quality gates and governance

- Required checks before design, implementation, and release.
- Automated and human validation gates.
- Traceability, provenance, and audit trails.
- Exception handling and controlled waivers.
- Evidence-based acceptance or rejection.
- Preventing unverified agent-generated changes from entering production.

12\. Engineering ethics and professional responsibility

- Duty of care and professional accountability.
- Risks to users, operators, and third parties.
- Transparency and disclosure of limitations.
- Data privacy and intellectual-property concerns.
- Responsibility for autonomous-agent actions.
- Choosing acceptable trade-offs under uncertainty.

13\. Empirical evaluation of engineering methods

- Defining engineering-process hypotheses.
- Measuring defect rates, rework, and lead time.
- Comparing agent-assisted and conventional approaches.
- Controlling for task difficulty and experience.
- Assessing evidence quality and validation costs.
- Adapting processes based on measured outcomes.

# IV. Integrative Engineering

## Course 16. Software Engineering Capstone — Two Semesters

Objective: Demonstrate the ability to engineer, validate, deploy, operate, and maintain a complex software system under realistic conditions.

The capstone is structured as a substantial real-world project, normally undertaken by a team. The project must contain uncertain requirements, external dependencies, persistent state, meaningful failure scenarios, and a justified use of agentic engineering.

1\. Problem discovery and requirements

- Identify the sponsoring problem and stakeholder needs.
- Establish objectives, scope, and explicit non-goals.
- Discover conflicting requirements and unknowns.
- Develop measurable functional and quality requirements.
- Establish acceptance criteria and traceability.

2\. Feasibility and risk analysis

- Compare solution architectures and technologies.
- Assess implementation, deployment, and operational risks.
- Identify high-impact assumptions.
- Prototype uncertain or technically risky components.
- Document decisions and rejected alternatives.

3\. System implementation

- Construct integrated application components.
- Apply modular design and explicit interfaces.
- Implement persistent data and transaction behavior.
- Manage configuration and external dependencies.
- Produce maintainable, version-controlled source code.

4\. Distributed systems and integration

- Build and integrate service interfaces.
- Handle asynchronous communication and partial failure.
- Implement retries, idempotency, and durable operations.
- Verify data consistency across boundaries.
- Test integration under realistic network conditions.

5\. Agentic engineering integration

- Use agents for bounded engineering tasks.
- Implement explicit delegation contracts.
- Preserve plans, execution histories, and outputs.
- Apply approval and independent verification gates.
- Measure agent success, rework, cost, and failure modes.

6\. Independent verification

- Establish correctness properties and invariants.
- Construct unit, integration, and acceptance tests.
- Apply property-based or model-based testing where appropriate.
- Verify requirements independently of the generating agent.
- Document evidence and uncovered risks.

7\. Traceability and engineering evidence

- Connect requirements to architectural decisions.
- Connect designs to implementations and tests.
- Identify omissions and contradictions.
- Maintain evidence for important claims.
- Demonstrate reproducibility of verification results.

8\. Failure, security, and resilience evaluation

- Perform threat and failure-mode analysis.
- Inject crashes, timeouts, and dependency failures.
- Demonstrate recovery and data integrity.
- Test security boundaries and authorization.
- Evaluate whether degraded behavior remains acceptable.

9\. Deployment and production operations

- Implement CI/CD and reproducible builds.
- Deploy to a representative production environment.
- Configure logs, metrics, traces, and alerts.
- Establish operational targets and recovery procedures.
- Perform performance, capacity, and reliability testing.

10\. Maintenance and controlled evolution

- Introduce revised or conflicting requirements.
- Assess system-wide change impact.
- Modify architecture and implementation safely.
- Preserve compatibility and regressions tests.
- Demonstrate recovery from introduced defects.
- Measure the effect of changes on quality.

11\. Documentation and engineering defense

- Deliver requirements, architecture, and operational documentation.
- Demonstrate normal and abnormal execution.
- Present verification claims and supporting evidence.
- Defend architectural and engineering choices.
- Explain limitations, unresolved risks, and alternatives.

12\. Quantitative project evaluation

- Measure requirement satisfaction.
- Evaluate defect rates and test effectiveness.
- Measure runtime reliability and performance.
- Assess maintainability and technical debt.
- Evaluate agent productivity and supervision cost.
- Identify improvements to the engineering process.

## Expected depth of mastery

The curriculum distinguishes three types of knowledge that should be assessed in every module.

| Dimension  | What the student must demonstrate                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Conceptual | Explain the mechanism, its assumptions, its limitations, and competing approaches.                                 |
| Practical  | Implement, inspect, debug, or operate the mechanism in working software.                                           |
| Evaluative | Establish through evidence whether the solution meets its requirements and under what circumstances it might fail. |

By graduation, students should be able to work at four scales: the algorithm, the software component, the complete operating system, and the engineering process that produces and maintains it.

The defining principle of this curriculum: software engineering competence is not merely the ability to produce working code. It is the ability to reason about what software must do, construct a solution, understand its actual behavior, evaluate its reliability under uncertainty, and improve both the system and the process used to build it.

Agentic programming becomes an extension of that competence, rather than a substitute for it.