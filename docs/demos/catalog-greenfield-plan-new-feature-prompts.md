# Catalog of greenfield `plan-new-feature` trial prompts

| Field | Value |
| --- | --- |
| **Purpose** | Short **invocation remainders** (sponsor-facing requirement text only) for `@plan-new-feature` in a **disposable client** bootstrapped with `test-new-tied-client`. The pasted prompt describes the product task; methodology, `tied-bundle/`, MCP, and installed skills supply process. |
| **Audience** | Trial sponsors (paste text) · facilitators (grading maps below) |
| **Status** | Draft catalog |
| **Last updated** | 2026-10-11 |
| **Facilitator maps** | [TIED compact demo tool catalog](catalog-tied-compact-tools.md) (`TIED-DEMO-*`) · [Agent resilience exercise catalog](catalog-compact-programming-exercises.md) · [Multi-faceted grading](#facilitator-grading-readout) |

---

## Trial protocol (facilitator — not part of the pasted prompt)

1. From the TIED store, run **`test-new-tied-client`** ([runbook](../pseudocode-new-client-tied-adherence-runbook.md)); open the new client root in Cursor.
2. Confirm **`tied-yaml`** MCP and **plan-new-feature** skill are available (default after bootstrap).
3. Attach **`@plan-new-feature`** and paste **one** block from [Trial prompts](#trial-prompts) below—nothing else unless the sponsor adds product constraints.
4. Let the skill run; optionally **`@build-plan`** on the linked plan the session produces.
5. Score the session using [facilitator grading](#facilitator-grading-readout); do not add methodology instructions to the pasted text.

**Do not paste into the remainder:** TIED, REQ/ARCH/IMPL tokens, CITDP, checklists, MCP tool names, pseudo-code, LEAP, Kaizen, gates, or “use tied-bundle.” The client already loads those.

---

## What the pasted prompt is / is not

| It **is** | It **is not** |
| --- | --- |
| A small product or library requirement for **this repo** | Instructions on how to develop with TIED |
| Plain language a sponsor could give without methodology training | A linked plan, git commands, or host path placeholders |
| One **entire trial task** per paste (single feature scope) | A maturity score, benchmark leaderboard, or multi-feature epic |

---

## Facilitator index (maps trial prompt → demo + exercise + grading)

| ID | maps_to | Exercise bridge | Facilitator grading emphasis | proof_boundary |
| --- | --- | --- | --- | --- |
| PROMPT-GF-01 | TIED-DEMO-01 | REQ-01 (catalog) | Requirement interpretation · Algorithm | human_decision |
| PROMPT-GF-02 | TIED-DEMO-02 | DATA-01 | Test strategy · Algorithm | executable_behavior |
| PROMPT-GF-03 | TIED-DEMO-03 | DATA-03 | Traceability · Algorithm | executable_behavior |
| PROMPT-GF-04 | TIED-DEMO-04 | — | Traceability · Process | traceability_structure |
| PROMPT-GF-05 | TIED-DEMO-05 | — | Traceability · Process | traceability_structure |
| PROMPT-GF-06 | TIED-DEMO-06 | — | Traceability · Process | traceability_structure |
| PROMPT-GF-07 | TIED-DEMO-07 | — | Traceability · Process | traceability_structure |
| PROMPT-GF-08 | TIED-DEMO-08 | — | Traceability · Test strategy | traceability_structure |
| PROMPT-GF-09 | TIED-DEMO-09 | CON-01 | Test strategy · Algorithm | executable_behavior |
| PROMPT-GF-10 | TIED-DEMO-10 | CON-03 | Test strategy · Algorithm | executable_behavior |
| PROMPT-GF-11 | TIED-DEMO-11 | CON-04 | Test strategy · Algorithm | executable_behavior |
| PROMPT-GF-12 | TIED-DEMO-12 | STATE-05 | Test strategy · Algorithm | executable_behavior |
| PROMPT-GF-13 | TIED-DEMO-13 | — | Test strategy · Process | executable_behavior |
| PROMPT-GF-14 | TIED-DEMO-14 | STATE-01 | Test strategy · Algorithm | executable_behavior |
| PROMPT-GF-15 | TIED-DEMO-15 | DATA-04 | Algorithm · Traceability | executable_behavior |
| PROMPT-GF-16 | TIED-DEMO-16 | STATE-06 | Algorithm · Test strategy | executable_behavior |
| PROMPT-GF-17 | TIED-DEMO-17 | ALG-02 | Requirement interpretation · Algorithm | executable_behavior |
| PROMPT-GF-18 | TIED-DEMO-18 | ADV-04 | Test strategy · Algorithm | executable_behavior |
| PROMPT-GF-19 | TIED-DEMO-19 | — | Process · Methodology readout | human_decision |
| PROMPT-GF-20 | TIED-DEMO-20 | — | Methodology readout · Process | human_decision |
| PROMPT-GF-25 | — | — | Traceability · Test strategy | executable_behavior |

Meta trials (bootstrap smoke, gate dry-run, store MCP slices) are **facilitator-runbook** steps—not listed as pasted prompts. See [TIED demo catalog — Family F](catalog-tied-compact-tools.md#family-f--meta-tied-tooling-tied-demo-2324).

---

## Facilitator grading readout

After the trial, score **separate dimensions** (defaults in [catalog-tied-compact-tools.md](catalog-tied-compact-tools.md#grading-model-human--agent)); do not collapse to one number or equate session notes with **process grade** / **evidence chain profile** unless **proof boundaries** are stated.

| Dimension | Weight (default) | Facilitator inspects |
| --- | --- | --- |
| Requirement interpretation | 15% | Ambiguity resolved in writing; assumptions labeled |
| Traceability closure | 20% | Project decision records align with code and tests |
| Test strategy | 20% | Tests before over-implementation; disturbance levels L0–L6 where applicable |
| Algorithm / implementation | 20% | Behavior under faults; honest limits |
| Process adherence | 15% | Session artifacts the methodology expects (facilitator checklist) |
| Methodology learning readout | 10% | Only for PROMPT-GF-19–20 style trials |

**Forbidden:** `maturity_score`, universal scores, CMMI levels, leaderboard ranking as maturity proxy.

---

## Trial prompts

Copy **one** block verbatim into `@plan-new-feature` after opening the `test-new-tied-client` project.

### PROMPT-GF-01

```text
Build a CLI “reliable message sender” that reads messages from stdin and simulates delivery to a flaky endpoint (timeouts and random failures in tests). The written requirement is intentionally vague about what “reliable” means. Before coding, document which interpretation you chose and what you did not guarantee. Include automated tests for nominal sends and for at least one failure mode.
```

### PROMPT-GF-02

```text
Build a library that merges partial configuration from multiple sources (defaults file, override file, environment-style map). Handle missing keys, conflicting values, explicit nulls, and a documented precedence order. Ship unit tests; no UI.
```

### PROMPT-GF-03

```text
Build a library that reads records that may be in an older or newer JSON shape. Support missing fields, defaults, and unknown fields without crashing. Tests must cover at least two schema versions.
```

### PROMPT-GF-04

```text
Build a CLI that scans markdown glossary files under this project and reports preferred-term inconsistencies after a simulated bulk rename (provide a small fixture tree in the repo for the tool to check). Output a human-readable report; tests use the fixture tree only.
```

### PROMPT-GF-05

```text
Build a CLI that scans source and test files for requirement identifiers referenced in comments or names and compares them to requirement records in this project’s requirements index. Report missing, orphan, and matched IDs. Include tests with a tiny sample tree.
```

### PROMPT-GF-06

```text
Build a CLI that validates one implementation design document in this project against a fixed checklist of required sections (inputs, outputs, preconditions, postconditions, failure modes). Exit non-zero when a required section is missing or empty. Tests use a good and a bad fixture document.
```

### PROMPT-GF-07

```text
Build a small library plus CLI that, given a requirement identifier, prints related architecture and implementation decision identifiers by walking this project’s decision indexes. Include tests against checked-in fixture YAML, not live network.
```

### PROMPT-GF-08

```text
Build a two-module in-memory demo (producer and consumer) connected by an explicit wiring layer. Prove the connection with an automated test that does not start a graphical UI. Keep business logic out of the entry-point module.
```

### PROMPT-GF-09

```text
Build a bounded worker pool library: schedule tasks with a concurrency limit, support cancellation, and surface failures without losing track of completion. Simulated workers in tests; include unit tests and one integration-style test across scheduler and worker interfaces.
```

### PROMPT-GF-10

```text
Build a library that maps items in parallel but returns results in input order. Tests must show that completion order can differ while output order cannot.
```

### PROMPT-GF-11

```text
Build an in-memory lease-based task queue: workers claim tasks with expiring leases; crashed workers must not permanently block tasks. Document whether execution is at-least-once or stronger. Tests inject worker loss and lease expiry.
```

### PROMPT-GF-12

```text
Build a command processor backed by an explicit state machine. Reject illegal transitions, tolerate duplicate commands safely where specified, and preserve stated invariants. Tests include illegal events and duplicates.
```

### PROMPT-GF-13

```text
Build a thin CLI that only parses arguments and delegates to two existing-style library modules (create minimal libraries in the same repo). No business rules in the CLI file. One test must fail if modules are not actually invoked.
```

### PROMPT-GF-14

```text
Build a CLI batch processor that reads records from a file, checkpoints progress, and resumes after simulated crashes between operations. Tests must crash at configurable points and assert no silent loss of work beyond what the documented guarantee allows.
```

### PROMPT-GF-15

```text
Build a library that aggregates timestamped events into fixed time windows. Events may arrive late or duplicate; results must say when they are provisional and when they are final. Tests cover lateness and duplication.
```

### PROMPT-GF-16

```text
Build a reconciliation engine: desired state vs observed state, apply corrective actions that may fail or partially succeed, and loop until converged or a documented stop condition. Tests include partial failures and superseding desired state.
```

### PROMPT-GF-17

```text
Build a library that searches a large discrete space and stops on a deadline, returning the best candidate found and an explicit flag if search was incomplete. Tests must not treat incomplete search as optimal.
```

### PROMPT-GF-18

```text
Build an in-memory retry storm simulator: many clients, failing server, configurable retry policy. Demonstrate amplification and a mitigation (backoff, cap, or jitter). Deterministic seeded tests; document abuse limits exercised.
```

### PROMPT-GF-19

```text
Build a bounded worker pool library (concurrency limit, cancellation, failures visible, completion tracked; simulated workers in tests). Additionally, keep a dated friction log in the project working folder: at least two short notes about workflow obstacles encountered during the build (what happened, not root-cause essays). The product must still ship with tests.
```

### PROMPT-GF-20

```text
Build a small CLI utility of your choice that solves a concrete file or text processing problem in this repo. Before implementation, write down one hypothesis about what will be hardest and a one-line “before” observation you can compare after the feature works. Keep both in the project working folder alongside the shipped tool and tests.
```

### PROMPT-GF-25

```text
Build one publishable library package in this repo (TypeScript or Python—pick one and stay consistent) with a clear public API, README usage section, and a single command to run all tests. Scope one feature only; no unrelated modules.
```

---

## Recommended trial sequences (facilitator)

| Goal | Prompts |
| --- | --- |
| First greenfield trial | PROMPT-GF-25 or PROMPT-GF-09 |
| Requirement ambiguity | PROMPT-GF-01 → PROMPT-GF-17 |
| Resilience | PROMPT-GF-14 → PROMPT-GF-18 |
| Process friction note | PROMPT-GF-19 after any loop-1 build |
| Hypothesis + observation | PROMPT-GF-20 |

---

## Recorded trials (facilitator)

| Prompt | Client | Readout |
| --- | --- | --- |
| PROMPT-GF-01 | `1791731617` | [trial-readout-PROMPT-GF-01-1791731617.md](trial-readout-PROMPT-GF-01-1791731617.md) |
| PROMPT-GF-02 | `1791739774` | [trial-readout-PROMPT-GF-02-1791739774.md](trial-readout-PROMPT-GF-02-1791739774.md) |
| PROMPT-GF-25 | `1791754135` | [trial-readout-PROMPT-GF-25-1791754135.md](trial-readout-PROMPT-GF-25-1791754135.md) |
| PROMPT-GF-09 | `1791767366` | [trial-readout-PROMPT-GF-09-1791767366.md](trial-readout-PROMPT-GF-09-1791767366.md) |
| PROMPT-GF-03 | `1792315611` | [trial-readout-PROMPT-GF-03-1792315611.md](trial-readout-PROMPT-GF-03-1792315611.md) |

## Related references

- [Demos index](README.md)
- [TIED compact demo tool catalog](catalog-tied-compact-tools.md)
- [Agent resilience exercise catalog](catalog-compact-programming-exercises.md)
- [New-client adherence runbook](../pseudocode-new-client-tied-adherence-runbook.md)
