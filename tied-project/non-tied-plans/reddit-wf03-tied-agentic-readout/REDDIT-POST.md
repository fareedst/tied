# What one documented agent run looks like when “done” means more than green tests

**Thesis:** Facilitator documentation of one controlled four-phase agent workflow on a small TypeScript composition task.

---

This post summarizes one documented agent run: a small TypeScript feature built under a four-phase workflow with written requirements, design records, and machine-checked completion gates. The run used Composer 2.5 inside Cursor, driven by an external orchestrator script that started **four separate agent sessions** over about thirteen minutes. The disposable project ended with a passing automated test, a traceable git commit, and a pile of structured artifacts that describe *what* was built, *why*, and *how the process claimed to finish*.

Most demos show a chat transcript and a diff. This write-up focuses on a different question: when you treat agent work like engineering work—with explicit intent, phased delivery, and auditable checkpoints—what shows up in the repo besides the executable?

---

## What you are reading

**Thesis:** A facilitator readout of trial prompt WF-03, recorded 2026-11-04.

The source is a **trial readout**: a structured summary written after a controlled experiment. Facilitators re-ran tests, checked consistency between decision records and code, and compared git history to the claimed phase boundaries. Session grades in the readout apply to **this session only**—one data point in a larger pilot matrix.

The experiment used a **disposable client**: a throwaway git repository cloned for one trial, tagged so cohort comparisons stay honest. An **orchestrator** (a batch runner) invoked four skills in order—define feature, refine plan, build, close out—each in a **new agent session** with a new session id. Continuity came from files in the repo and from handoff notes, not from one long conversation memory.

The orchestrator exited successfully. Wall-clock time was on the order of thirteen minutes for all four turns combined.

Cohort claims need baselines, pairing, and explicit proof boundaries. The readout’s **future-test rule** is that one trial stands alone until replicated.

---

## What TIED is (plain language)

**Thesis:** TIED names a discipline for keeping requirements, architecture, and implementation records aligned with code.

**TIED** (used here as a proper name) is a discipline for maintaining a **parallel knowledge stack** in the same repository as the product:

1. **Requirements** — what must be true when the work is done (scope, acceptance).
2. **Architecture decisions** — structural choices and constraints (how pieces relate).
3. **Implementation decisions** — step-wise **pseudo-code** treated as the logical contract: the behavior you intend before and while you write source.

Stable identifiers (for example a requirement id for module composition) link those layers to tests and to comments in code. The point is traceability: you can walk from “what we asked for” to “how we said it would behave” to “what we shipped” without reconstructing intent from diffs alone.

Agents in this trial followed a **phased workflow** with checklists and **gate receipts**—small machine-readable records that say whether a checkpoint allowed progress or blocked it. A **request evidence envelope** packaged proof that the workflow considered the request complete under its rules.

When tests or code disagree with the written plan, the intended loop is to update the written stack in the **same** change item so the next agent turn reads accurate intent. That loop has a name internally (LEAP); what matters for readers is the outcome: documentation stays the source of truth alongside the code.

The trial is useful for comparing the **artifact bundle** (requirements, plan, gates, code) to a single chat export as a review surface.

---

## The task: composition seam

**Thesis:** WF-03 is small on purpose but forces a real design split—wiring proved before CLI or UI glue.

The sponsor prompt (catalog id WF-03) asked for:

- Two small **library modules**: a **producer** and a **consumer**.
- A separate **wiring module** that connects them.
- An **automated test** that proves the connection **without starting a graphical UI**.
- Business logic kept out of any CLI entry file; a minimal CLI only if needed to run tests.

The catalog labels the stress theme **composition seam**: prove that modules connect correctly in a test **before** you lean on command-line glue or a UI to hide wiring mistakes.

That pattern shows up constantly in real systems. Teams merge producer/consumer logic into a `main.ts`, ship, and only discover integration bugs under manual clicking or brittle end-to-end tests. WF-03 is intentionally tiny, but it probes whether an agent respects **boundaries**—libraries vs wiring vs entrypoint—even when the feature could be hacked together in one file.

Before any source files existed, the trial locked vocabulary: producer module, consumer module, wiring module, composition test, and a **push** delivery mode (described below). Those terms lived in a project glossary and in the plan so later turns did not argue over names.

---

## The executable outcome

**Thesis:** Three TypeScript modules, one composition test, tests pass on facilitator re-run; no CLI in v1.

What shipped in the disposable client:

| Piece | What it is |
| --- | --- |
| Producer | Creates a producer with subscribe/emit; exports a Message type from the same module (no separate types file) |
| Consumer | Creates a consumer with receive and a way to read what was received |
| Wiring | Connects producer and consumer |
| Test | One composition test; no GUI |
| CLI | None by design—`npm test` only |

**Implementation outcome:** Successful. A facilitator re-ran **`npm test`** and got **one test, one pass**.

**Git shape:** Bootstrap commit first; **no `src/` directory** until the single feature commit that contained product code and close-out scope. That matters for phase-boundary audits: turns one and two were documentation-only on disk.

**Test strategy evidence:** Before the modules existed, a failing test run was **archived** (module-not-found errors). That is classic test-first ordering: red, then green. Peer trials in the same cohort did not always retain that stdout artifact; this cell did.

**Tooling note:** The project ran TypeScript via `tsx` and npm test without a committed `tsconfig.json`. That matched the locked harness setup.

### Behavior in words (no repo required)

Delivery mode was **push**: when the producer **emits** a message, wired listeners run **synchronously** so the consumer can **receive** before emit returns. The composition test asserts that a message sent through the wired pair shows up on the consumer side—without launching a UI.

Illustrative logic only:

```text
wire(producer, consumer):
  producer.onEmit(msg) -> consumer.receive(msg)

test:
  p = createProducer(); c = createConsumer()
  wireModules(p, c)
  p.emit({ text: "hello" })
  assert c.getReceived() equals "hello"
```

---

## How the four phases ran

**Thesis:** Four isolated sessions; define and refine before src/; build with red-then-green; close-out with envelope and commit.

Each phase was a **separate agent session**. The orchestrator logged turn boundaries on stderr; inventory and git history were cross-checked afterward (heuristic audit—per-turn commit shas were not all recorded in the inventory).

```text
[Session 1: Define]     → requirement/architecture/implementation scaffold, plan — no src/
[Session 2: Refine]     → glossary locked, pre-build gates (some churn)
[Session 3: Build]      → failing test logged, then modules, verification gate
[Session 4: Close-out]  → evidence pack, close gate, one traceable commit
```

### Session 1 — Define feature

Outcome: requirement, architecture, and implementation records scaffolded; change-impact analysis draft; plan; checklist tracker; interaction inventory seeded; preload contract materialized for the agent. **No product code.**

Friction: cold session—full scaffold before touching the feature. That is deliberate in a documentation-first workflow, but it feels slow if you expect instant codegen.

### Session 2 — Refine plan

Outcome: sponsor terms resolved to canonical names; pre-implementation gate receipts; still **no** `src/`.

Friction: **gate churn**—seven pre-implementation gate json files before the narrative settled on one allowed receipt. Wide fan-out in one turn: architecture, implementation pseudo-code, vocabulary, tracker, test strategy. That is real operational cost, not a clean demo arc.

### Session 3 — Build

Outcome: archived red test output; implementation of producer, consumer, wiring; composition test green; verification gate. Close-out **deferred by design** at handoff so session four could handle shipping discipline.

Friction: no tsconfig; TypeScript executed through the harness path only.

### Session 4 — Close-out

Outcome: evidence envelope built and validated with zero blocking gaps; close-out gate **allowed**; changelog; single traceable feature commit; requirement marked **Implemented** in the project index.

Friction:

- **Adherence reconcile skipped**—tooling to compare agent actions against the full checklist was unavailable in this harness build; status **not_run**, waiver documented.
- **Post-commit evidence drift**—two evidence files were updated with the commit hash **after** the main commit but were **not** included in that commit. The agent disclosed this in stdout; it falls short of an ideal single-commit envelope.
- Orchestrator run folder left untracked by close-out gitignore policy (operator artifacts, separate from product).

Cross-turn: four distinct session ids; orchestrator exit code zero; process log manifest plus stdout/stderr tee for facilitator replay. Those logs support **harness** replay; they capture turn summaries and orchestrator diagnostics, not full agent reasoning.

---

## What lived in the project besides executable code

**Thesis:** The runnable test is the tip; the repo also holds intent, design, language, process proof, and audit trails.

| Layer | Purpose | Present in this trial |
| --- | --- | --- |
| Intent | What “done” means | Requirement record marked implemented; plan locked no CLI in v1 |
| Design | Structure and behavior contract | Architecture and implementation decision records with pseudo-code |
| Language | Shared terms | Glossary entries for modules, wiring test, delivery mode |
| Process | Proof the workflow ran | Gate receipts (pre-implementation, verification, close-out); request evidence envelope |
| Audit | Cohort and replay | Interaction inventory (four turns, harness id); orchestrator manifest and process logs |
| Analysis | Pre-build thinking | Change-impact analysis persisted with the feature |

### Contrast: executable alone vs full record

| If you only had… | You might say… | With this trial’s layer you also have… |
| --- | --- | --- |
| Green CI | “Ship it” | Requirement status plus consistency validation **ok** on facilitator check |
| Chat summary | “The agent said it done” | Phase handoffs and gate json with allowed/blocked |
| Ad-hoc names in code | “Obviously a producer” | Glossary-resolved terms locked **before** implementation |
| One commit message | “Added modules” | Plan and pseudo-code explaining wiring semantics and delivery mode |

The executable proves **a** behavior path. The TIED-shaped representation records **how the run claimed to satisfy a defined requirement** under a defined process—including gaps (reconcile skipped, evidence drift).

Completion signals from the readout:

- Machine close-out gate: **pass** (allowed, minimal depth).
- Process contract: **pass** (envelope, analysis doc, four handoffs).
- Adherence ledger: **not_run** (reconcile skipped).
- Close-out honesty on requirement status: **pass**, with drift **disclosed**.

---

## What the readout establishes for this session

**Thesis:** Observable phase boundaries, traceability, and retained red evidence on one composition-seam prompt.

On the evidence described in the readout:

1. A **phased, gated workflow completed** on the prompt through close-out, with workflow marked **complete** at turn four.
2. **Phase boundaries were observable on disk**: no product source tree before the build phase commit heuristic.
3. **Traceability closure** was graded **A** for this session: decision records aligned with code and tests; facilitator consistency check **ok**.
4. **Test-first discipline left artifacts**: failing module-not-found output archived before green.
5. **Requirement interpretation** graded **A**: producer/consumer/wiring split and no-CLI default locked before code.
6. **Workflow choreography** graded **A**: four turns, inventory, tagged disposable client, process log manifest for operator replay.

These are **session documentation** claims—feasibility of a particular process shape on a particular prompt, useful for replication design.

---

## Scope of the evidence

**Thesis:** One pilot cell; generalize only after replication with stated baselines.

- **Single trial.** The readout documents TIED 4.0.0 dogfood and Composer 2.5 on WF-03; broader effectiveness claims wait on more cells and baselines.
- **Cohort is incomplete.** Other WF-03 runs differ (close-out incomplete on one model path, different commit shapes, different red-test archives). Notes in the readout are experimental context.
- **Adherence ledger gap.** Gates and envelope passed; reconcile was **not_run** because the tool was missing from this harness build.
- **Hygiene gap.** Evidence files updated after the feature commit without being in that commit—disclosed in agent stdout.
- **Audit limits.** Phase audit is **heuristic** (inventory vs git); per-turn shas were not fully captured in the inventory. Four fresh sessions mean each turn relied on disk state as much as session memory.
- **Size.** Three modules and one happy-path test; scale and risk profile of production systems lie outside this prompt.

---

## Session grades

**Thesis:** Facilitator bands for this run—inputs to cohort comparison, not a universal score.

| Dimension | Band | One-line rationale |
| --- | --- | --- |
| Requirement interpretation | A | Wiring split and no CLI locked before code |
| Traceability closure | A | Full decision stack; requirement implemented; consistency ok |
| Test strategy | A− | Red stdout kept; single happy-path composition test |
| Algorithm / implementation | A | Push delivery; message type colocated on producer |
| Process adherence | B+ | Gates and envelope pass; reconcile not run; evidence drift |
| Workflow choreography | A | Four turns, inventory, tag, process log manifest |
| Methodology learning readout | B+ | First WF-03 cell with default orchestrator logs; documents friction |

Grading outcome in the readout: dimension bands describe **this session only**.

---

## Peer context (same prompt, other cells)

**Thesis:** Same catalog prompt, different observed outcomes—material for matrix design.

The same catalog prompt was run in other cells. Differences noted in the readout:

- One peer completed four turns but lacked archived red test output and used a different preload fallback.
- Another peer used two commits (feature plus evidence follow-up) where this cell used one feature commit.
- A Claude Haiku cell stopped after build-plan on disk—close-out incomplete for that cell.

This cell was the first WF-03 facilitator readout with default orchestrator process logs end-to-end, which improves **operator reproducibility** for harness debugging.

Pilot intent elsewhere in the catalog: add more harness and model cells before cross-harness composition claims. You are reading one cell, not a finished matrix.

---

## Practical takeaways

**Thesis:** Judge agentic workflows by artifacts and boundaries.

1. **Artifact boundaries matter as much as model choice.** Gate receipts, envelopes, and git phase shape show whether “done” was checked—or merely narrated.
2. **Forced phases reduce failure modes.** Documentation and glossary before `src/` made the composition seam explicit; build turn retained red evidence.
3. **The deliverable is often a bundle.** Requirement id, plan, pseudo-code, tests, gates, and code together are what a reviewer needs.
4. **Friction is data.** Gate churn, skipped reconcile, and evidence drift belong in the record when you evaluate a process.
5. **Replicate with the same prompt.** Manual four-phase discipline vs orchestrated runs; compare gate receipts and git history under agreed proof boundaries.

Treat agent runs like submissions that must be inspectable.

---

## Source note

**Thesis:** Paraphrase of a facilitator trial readout (WF-03, Composer 2.5, Cursor harness, orchestrator process logging).

Subject client bootstrapped at TIED 4.0.0. Readout is store documentation from that dogfood trial. It shows how a four-phase composition-seam run can be recorded with orchestrator logs and gate receipts for facilitator replay.

---

## Terms (short)

- **Gate receipt:** JSON record of whether a workflow checkpoint passed or blocked.
- **Evidence envelope:** Packaged proof that a request completed under process rules.
- **Composition test:** Automated test that exercises module wiring without UI or CLI business logic.
- **Orchestrator:** Script that runs sequential agent sessions and captures logs.
- **Disposable client:** One-off git clone for a single trial.
- **Facilitator:** Role that re-runs tests and validates readouts against disk state.
- **RED / GREEN:** Failing test captured before implementation makes it pass.
