# Catalog of compact programming exercises for testing algorithmic resilience

| Field | Value |
| --- | --- |
| **Purpose** | **Agent resilience exercise catalog** — compact programs graded on algorithmic resilience (not full TIED stack required). |
| **Status** | Draft catalog (docs-only; exercise IDs such as `REQ-01` are catalog labels, not registered TIED `[REQ-*]` tokens). |
| **See also** | [TIED compact demo tool catalog](catalog-tied-compact-tools.md) · [Demos index](README.md) |

The most useful exercises are small programs operating in environments that are larger, less predictable, or less complete than the programs themselves.

The goal is to evaluate whether an AI coding agent can translate a requirement containing uncertainty into an algorithm, tests, and working code that behave correctly when reality does not match the expected path.

A particularly useful distinction is:

- Uncertainty: The program does not know what will happen.
- Incompleteness: The program does not have all the information it needs.
- Ambiguity: More than one interpretation of the input or requirement is possible.
- Nondeterminism: The same actions can produce different observable outcomes.
- Concurrency: Events interact through timing and shared resources.
- Chaos: Multiple changes, failures, and interactions compound in ways that are difficult to predict.
- Adversarial conditions: Inputs or environmental behavior deliberately exploit weaknesses in the implementation.

An algorithm may handle each condition individually yet fail when several occur together.

## 1. Catalog of programming tasks

Each exercise below should be implementable as a compact CLI utility, small library, or in-memory simulation. External dependencies can be simulated to make tests deterministic.

### A. Unreliable external environments

| ID     | Exercise                | Complexity the implementation must handle                                                     |
| ------ | ----------------------- | --------------------------------------------------------------------------------------------- |
| ENV-01 | Unreliable HTTP Fetcher | Timeouts, intermittent failures, retryable vs permanent errors, retry limits, deadlines       |
| ENV-02 | Multi-host Port Scanner | Concurrent connections, refused connections, slow hosts, timeouts, completion guarantees      |
| ENV-03 | File Stability Detector | Files growing during observation, replaced files, clock granularity, incomplete writes        |
| ENV-04 | Process Supervisor      | Child process crashes, hangs, restart limits, rapid failure loops, clean shutdown             |
| ENV-05 | Resumable Downloader    | Partial downloads, interrupted connections, inconsistent content lengths, server-side changes |
| ENV-06 | Rate-limited Job Sender | Variable service capacity, HTTP 429 responses, cancellation, bounded queues                   |

Example requirement — ENV-04

> Write a utility that starts a child process, observes its behavior, and restarts it when necessary. The utility must distinguish between a crash, a normal exit, and an unresponsive process. It must prevent unlimited restart loops and always terminate its managed processes when requested.

A superficial implementation may repeatedly relaunch processes. A resilient implementation needs a process lifecycle model, deadlines, restart policy, and termination protocol.

### B. Incomplete, inconsistent, or ambiguous data

| ID      | Exercise                       | Complexity the implementation must handle                                          |
| ------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| DATA-01 | Partial Configuration Merger   | Multiple sources, missing keys, conflicting settings, precedence, explicit nulls   |
| DATA-02 | Corrupted Log Reader           | Truncated lines, invalid encodings, malformed records, continued processing        |
| DATA-03 | Schema Evolution Reader        | Old/new record formats, missing fields, defaults, unknown fields                   |
| DATA-04 | Out-of-order Event Aggregator  | Late arrivals, duplicates, missing events, event time vs arrival time              |
| DATA-05 | CSV Dialect Detector           | Unknown delimiters, quoted newlines, inconsistent column counts, ambiguous samples |
| DATA-06 | Incomplete Dependency Resolver | Missing dependencies, cycles, incompatible versions, partial solutions             |

Example requirement — DATA-04

> Accept timestamped events from multiple sources and maintain a running count for fixed time windows. Events may arrive late, be duplicated, or never arrive. Results must describe when they are provisional and when they are final.

The interesting problem isn't counting events. It's defining what a result means when the available evidence can still change.

### C. Concurrency and nondeterminism

| ID     | Exercise                       | Complexity the implementation must handle                                      |
| ------ | ------------------------------ | ------------------------------------------------------------------------------ |
| CON-01 | Bounded Concurrent Worker Pool | Scheduling, failures, cancellation, resource limits, completion tracking       |
| CON-02 | Concurrent File Indexer        | Files deleted or modified during scanning, duplicate discoveries, shared state |
| CON-03 | Ordered Parallel Mapper        | Parallel completion out of order, ordered output, buffering, errors            |
| CON-04 | Lease-based Task Queue         | Worker crashes, expired leases, duplicate execution, acknowledgement           |
| CON-05 | Concurrent Account Ledger      | Conflicting transactions, atomic updates, invariant preservation               |
| CON-06 | Debounced Event Processor      | Bursts, resettable deadlines, races, shutdown with pending events              |

Example requirement — CON-04

> Implement a task queue in which workers claim tasks using temporary leases. Workers may disappear without acknowledging completion. Expired work becomes available again, but no task may be lost.

This forces the algorithm to confront a fundamental distinction: at-least-once delivery does not imply exactly-once execution.

### D. State, recovery, and changing reality

| ID       | Exercise                           | Complexity the implementation must handle                                  |
| -------- | ---------------------------------- | -------------------------------------------------------------------------- |
| STATE-01 | Crash-resumable Batch Processor    | Checkpoints, crashes between operations, replay, progress preservation     |
| STATE-02 | Atomic File Replacer               | Temporary files, write failures, rename operations, durability assumptions |
| STATE-03 | Incremental Directory Synchronizer | Renames, deletions, timestamps, content changes, conflicting updates       |
| STATE-04 | Expiring Cache                     | TTL, concurrent misses, stale data, refresh failures, clock changes        |
| STATE-05 | State Machine with Invalid Events  | Duplicate commands, illegal transitions, retries, invariants               |
| STATE-06 | Reconciliation Engine              | Desired vs observed state, external changes, partial corrective actions    |

Example requirement — STATE-06

> Maintain a set of resources so that observed state converges toward desired state. Operations may fail, succeed only partially, or be superseded by a new desired state.

This is a compact version of a Kubernetes-style reconciliation problem.

The implementation must repeatedly observe and correct rather than assume that issuing a command produces its intended result.

### E. Algorithms under uncertain constraints

| ID     | Exercise                       | Complexity the implementation must handle                                        |
| ------ | ------------------------------ | -------------------------------------------------------------------------------- |
| ALG-01 | Memory-bounded Top-K Finder    | Input too large for memory, streaming updates, duplicates, tie-breaking          |
| ALG-02 | Deadline-aware Search          | Incomplete exploration, resource limits, best-so-far solutions                   |
| ALG-03 | Adaptive Batch Processor       | Variable processing cost, changing resource limits, feedback-driven batch sizing |
| ALG-04 | Approximate Duplicate Detector | False positives, thresholds, memory constraints, quality tradeoffs               |
| ALG-05 | Dynamic Route Planner          | Changing edge costs, unavailable paths, incremental replanning                   |
| ALG-06 | Fair Work Scheduler            | Differing job durations, starvation, priorities, throughput vs fairness          |

Example requirement — ALG-02

> Search a large solution space and return the best candidate found before a deadline. If exploration is incomplete, report that fact without incorrectly claiming optimality.

This tests an important quality: whether the algorithm can provide a useful answer while accurately representing what it does not know.

### F. Adversarial inputs and failure amplification

| ID     | Exercise                    | Complexity the implementation must handle                                    |
| ------ | --------------------------- | ---------------------------------------------------------------------------- |
| ADV-01 | Recursive Archive Inspector | Nested archives, decompression bombs, cyclic references, size limits         |
| ADV-02 | Path Normalization Guard    | Traversal attempts, symbolic links, path aliases, escape from root           |
| ADV-03 | Hostile Input Parser        | Extremely deep nesting, huge tokens, malformed input, computational limits   |
| ADV-04 | Retry Storm Simulator       | Coordinated clients, service saturation, retry amplification, backpressure   |
| ADV-05 | Malicious Graph Traversal   | Cycles, huge branching factors, invalid node references, bounded exploration |
| ADV-06 | Untrusted Plugin Executor   | Crashes, hanging operations, output flooding, resource exhaustion, isolation |

These exercises are especially useful for distinguishing algorithms that merely work from algorithms designed to remain controlled when assumptions fail.

## 2. Exercises with particularly high evaluation value

Not all exercises provide the same information about an AI coding agent. The best exercises require several distinct reasoning capabilities while remaining small enough for an independent correctness oracle.

STATE-01 — Crash-resumable batch processor

Tests state preservation, recovery, transactional boundaries, and reasoning about incomplete operations.

High value

DATA-04 — Out-of-order event aggregator

Tests incomplete evidence, time semantics, provisional results, duplicate handling, and eventual convergence.

High value

CON-04 — Lease-based task queue

Tests distributed-state reasoning, concurrency, failure recovery, ownership, and delivery guarantees.

High value

STATE-06 — Reconciliation engine

Tests feedback loops, convergence, partial success, changing objectives, and idempotency.

High value

ALG-02 — Deadline-aware search

Tests bounded effort, partial answers, quality estimation, and honest reporting of uncertainty.

High value

ADV-04 — Retry storm simulator

Tests whether locally reasonable behavior produces globally destructive behavior.

High value

## 3. Define what the exercise is actually measuring

A conventional benchmark generally asks:

Does the program produce the right answer for a given input?

These exercises should ask a stronger question:

Does the implementation preserve its guarantees when inputs, timing, state, and environmental assumptions change?

I would evaluate five distinct aspects of generated work.

| Dimension                  | What to evaluate                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------- |
| Requirement interpretation | Does the agent recognize ambiguity, missing guarantees, and implicit assumptions?  |
| Algorithm quality          | Are the algorithm and its policies appropriate for the stated failure model?       |
| Test quality               | Do tests exercise important failures, boundaries, races, and invariant violations? |
| Code quality               | Is the implementation structured, bounded, maintainable, and explicit about state? |
| Operational resilience     | Does it recover, degrade, stop safely, and communicate uncertainty accurately?     |

A particularly important feature is independent grading of the tests.

An agent that generates incorrect code and tests that agree with that code has not demonstrated correctness.

## 4. Interactive grading rubric

The following weighting is a useful starting point. It deliberately places substantial weight on algorithm correctness and adversarial testing.

WEIGHTED QUALITY SCORE

# 60.0

/ 100

Reset

Requirement interpretation

15% weight

Assumptions, ambiguity, missing information

3/5

Algorithm quality

30% weight

Correctness, invariants, failure policies

3/5

Test quality

25% weight

Fault injection, boundaries, hidden tests

3/5

Code quality

15% weight

Structure, resource safety, maintainability

3/5

Operational resilience

15% weight

Recovery, convergence, graceful failure

3/5

Weight total: 100%

Copy results

Each dimension receives 0–5 points. Default weights total 100%. A score of 5 means the implementation meets the strongest defined criteria for that dimension.

For more rigorous grading, use explicit gates: an implementation with a demonstrable data-loss failure or violated safety invariant should not receive a high overall grade even if the code is elegant.

## 5. Grade the tests using controlled chaos

An excellent approach is to give every exercise an independently controlled environment with a seeded event generator and fault injector.

A reproducible adversarial harness separates the behavior of the generated solution from the correctness criteria used to judge it.

For example, in STATE-01, inject a crash at every persistence boundary: before the operation, after the operation, before the checkpoint, and after the checkpoint.

Then check whether the observable output meets the specified processing guarantee. If exactly-once externally visible effects are required, the exercise must provide an appropriate transactional or idempotency mechanism; checkpoints alone cannot ensure that guarantee.

Different levels of grading can probe different failures:

| Test level               | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| L0 — Nominal             | Normal input, stable environment                               |
| L1 — Boundary            | Empty, maximum, minimum, malformed inputs                      |
| L2 — Isolated failure    | One timeout, crash, missing item, or duplicate                 |
| L3 — Combined failures   | Two or more interacting faults                                 |
| L4 — Changing conditions | Input or environment changes during execution                  |
| L5 — Adversarial         | Fault timing or input chosen to expose assumptions             |
| L6 — Long-running        | Repeated disturbances, resource pressure, eventual convergence |

## 6. Use properties, not just expected outputs

A benchmark gets significantly stronger when the evaluator can test general properties rather than only comparing fixed outputs.

| Property      | Example                                                                     |
| ------------- | --------------------------------------------------------------------------- |
| Safety        | No acknowledged work disappears                                             |
| Liveness      | Work eventually completes when failures cease                               |
| Boundedness   | Memory, concurrency, retries, and execution time remain limited             |
| Idempotency   | Repeating an operation does not produce an additional unintended effect     |
| Monotonicity  | Confirmed completed work is not silently reclassified as incomplete         |
| Convergence   | System eventually approaches the requested state under suitable assumptions |
| Determinism   | Same seed and simulated event sequence produce the same observable result   |
| Observability | Failures and incomplete outcomes are distinguishable from success           |
| Conservation  | No values, tasks, or transactions appear or disappear unexpectedly          |

These can support property-based, fuzz, model-based, and metamorphic testing.

For example, permuting independent input events should leave the final aggregate unchanged. Repeating an event bearing the same unique identifier should not affect a deduplicated total.

Neither test requires hardcoding every expected result.

## 7. Increase difficulty by combining sources of complexity

Rather than creating hundreds of unrelated exercises, take a small collection of foundational tasks and introduce orthogonal disturbances.

Consider the resumable batch processor:

Exercise variant builder — STATE-01

Crashes at arbitrary boundaries

Duplicate input records

Out-of-order inputs

Multiple competing workers

Input files change during execution

Tight memory and deadline limits

GENERATED VARIANT REQUIREMENT

Implement a crash-resumable batch processor that preserves processing guarantees across restarts. It must additionally handle: crashes at arbitrary boundaries; duplicate input records. The implementation must explicitly document its processing and durability guarantees.

Develop this benchmark

This makes complexity measurable in two directions:

- Disturbance complexity: How many independent sources of uncertainty can the algorithm tolerate?
- Interaction complexity: What happens when those disturbances occur simultaneously or in unfavorable sequences?

A solution that passes every isolated disturbance but fails under combinations has revealed a significant weakness in its architecture.

## 8. A reusable exercise specification

For agent-based generation and automated evaluation, each catalog entry can use the same schema.

```
id: STATE-01
name: Crash-resumable Batch Processor
category: state_recovery

task:
  objective: Process records while preserving progress
  interface: CLI
  dependencies: simulated
  constraints:
    bounded_memory: true
    persistent_checkpoint: true
    multiple_workers: false

environment:
  deterministic_seed: true
  controllable_clock: true
  fault_injection: true

disturbances:
  - process_crash
  - partial_write
  - duplicate_input
  - checkpoint_corruption

required_guarantees:
  - no_silent_data_loss
  - bounded_resource_usage
  - resumability
  - explicit_failure_reporting

evaluation:
  artifact_scores:
    - requirements
    - algorithm
    - tests
    - implementation
    - resilience

  test_levels:
    - nominal
    - boundary
    - isolated_failure
    - combined_failure
    - changing_environment
    - adversarial
    - long_running

  oracle:
    type: reference_state_machine
    checks:
      - state_invariants
      - processing_guarantees
      - termination
      - resource_bounds

  reproducibility:
    save_seed: true
    save_event_trace: true
    minimize_failing_trace: true
```

Specific delivery semantics, crash boundaries, and allowed recovery outcomes would be added before this becomes an executable benchmark.

## 9. A more revealing grading experiment

I would evaluate each exercise in three separate passes.

Pass 1 — Algorithm only

Give the agent the requirement and request its algorithm, state model, assumptions, invariants, and failure policies. Grade the design before any code exists.

Pass 2 — Tests before implementation

Request the test suite independently. Run it against correct and deliberately defective reference implementations. Grade how many defects the generated tests detect.

Pass 3 — Working implementation

Generate the code, execute the public tests, and then evaluate it against hidden disturbances, invariant checks, and adversarial schedules.

This distinguishes at least four important failure patterns:

1. Correct reasoning, defective implementation.
2. Defective reasoning, tests designed around the same misconception.
3. Correct nominal implementation, poor resilience.
4. Correct implementation, weak tests that fail to demonstrate its correctness.

It also allows you to compare agents by whether their tests detect mutations deliberately introduced into a known-good implementation.

## 10. An additional class: uncertainty in the requirement itself

The previous exercises mostly place complexity in the execution environment. For AI coding agents, I would add another benchmark class where the requirement is intentionally incomplete.

| ID     | Exercise                 | Missing or conflicting requirement                                                         |
| ------ | ------------------------ | ------------------------------------------------------------------------------------------ |
| REQ-01 | Reliable Message Sender  | Does reliable mean no loss, no duplicates, ordered delivery, or eventual delivery?         |
| REQ-02 | Latest File Selector     | Does latest mean modification time, creation time, filename date, or last observed change? |
| REQ-03 | Fair Job Scheduler       | Does fair mean equal CPU time, equal completions, bounded waiting, or equal opportunity?   |
| REQ-04 | Data Synchronizer        | Which side wins when both modify the same record?                                          |
| REQ-05 | Timeout Controller       | Does the timeout apply to each attempt or to the entire operation?                         |
| REQ-06 | Duplicate Record Cleaner | What constitutes identity, and is uncertain similarity enough to delete?                   |

Here, a top-quality agent should not invent certainty.

It should identify the missing decision, select a defensible policy when permitted, and clearly separate a user-specified guarantee from an assumption introduced by the implementation.

These are especially valuable for evaluating the quality of generated algorithms, rather than just code.

## 11. Recommended benchmark architecture

The strongest overall catalog would use:

- 36 foundational exercises: 30 covering environmental complexity and 6 covering requirement ambiguity.
- Seven levels of disturbance: From nominal to long-running adversarial behavior.
- Deterministic chaos injection: Controllable clocks, failures, reorderings, crashes, and resource limits.
- Independent oracles: Invariants and reference models not generated by the agent being graded.
- Mutation testing: Deliberately defective implementations to measure test-suite strength.
- Artifact-separated scores: Requirements, algorithms, tests, implementation, and operational resilience.
- Reproducible failure traces: Every failed execution should be replayable and ideally reducible to a minimal counterexample.

The essential insight is that complexity should be introduced systematically, not merely by making the programming task larger.

A 100-line solution facing uncertain state, partial failures, and conflicting events may expose much more about an agent's engineering competence than a 5,000-line application operating under ideal conditions.

The most revealing metric may be not simply how much complexity an agent can handle, but how much uncertainty it can transform into explicit assumptions, verifiable invariants, controlled failure modes, and recoverable behavior.