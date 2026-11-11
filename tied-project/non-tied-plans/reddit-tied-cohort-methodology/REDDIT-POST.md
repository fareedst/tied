# Neither waterfall nor agile: one change, written intent, and measurable agent trials

**Thesis:** Stop debating lifecycle brands—run one change with a trace stack you can ship, teach, and measure.

---

Here is the move that actually changes outcomes in the agent era: **one scoped change**, **written intent** beside the code, **tests in a fixed order**, and **snapshots** so the next session does not reopen twenty files to guess what you meant.

Waterfall gave you phases. Agile gave you cadence. Neither guarantees that **this merge** still matches what the sponsor asked for after three agent turns and two rebases. **TIED** (Token-Integrated Engineering & Development) targets that gap: a **per-change resolver**—vocabulary, requirements, architecture, implementation pseudo-code, then tests and source that all point at the same stable ids. When reality diverges, you repair the record in the **same** work item. No cleanup epic six sprints later.

I run workflow trials on disposable repos and batch-read what lands on disk. This post is the synthesis: why TIED is a third axis, why **V+R+A+I** absorbs the decisions waterfall crammed into phases, and how three **size layers** make agent experiments **boring in the best way**—same columns, same semantics, cohort after cohort.

---

## Three threads worth your time

**Thesis:** Philosophy, practice, and measurement—one story.

1. **Philosophy** — TIED is not waterfall, not agile; it is **what must be true on one PR**.
2. **Decisions** — Vocabulary, requirements, architecture, and implementation **replace phase-gate document dumps** with per-change records that stay linked.
3. **Measurement** — Atoms, operational intent, and proof facets so you can compare runs **without** argument-by-anecdote.

We also publish deep dives on individual trial readouts. This piece is the **frame** that makes those numbers legible.

---

## Waterfall and agile are calendars; TIED is a change resolver

**Thesis:** Compare definition of done, not posters on the wall.

| Question | Waterfall (caricature) | Agile (caricature) | TIED (per change) |
| --- | --- | --- | --- |
| Unit of work | Phase or release | Story or sprint | **Scoped change** with stable ids |
| Source of truth | Document set (then neglected) | Working software + talk | **Implementation pseudo-code** plus linked REQ/ARCH |
| When tests land | Late integration | Team choice | **Fixed order**: unit → composition (wiring) → UI E2E only when justified |
| When docs update | Before code, then drift | When someone remembers | **Same change item** when tests force behavior shifts |
| “Done” | Sign-off | Demo / deploy | Tests green **and** trace stack consistent **and** vocab reconciled |

Keep your kanban. Keep your sprints. Upgrade the quiet definition of done: **merged code plus a durable intent record**, not chat plus diffs.

---

## TIED in plain language

**Thesis:** A parallel knowledge stack in the same repo as the product—and agents love it.

**TIED** gives every serious change a **parallel stack**:

1. **Vocabulary** — lock what the sponsor meant before it fossilizes into class names.
2. **Requirements** — measurable “done” for **this** change only.
3. **Architecture** — boundaries: modules, interfaces, what must not leak.
4. **Implementation** — **step-wise pseudo-code** as the logical contract you implement against.

Stable ids tie those layers to tests and code comments. Walk from ask → behavior → ship without archaeology.

Two mechanics make agent work **faster**, not slower:

- **Elevation** — logic lives in pseudo-code first; source implements it. The next session reads **records**, not the whole tree.
- **LEAP** — tests or code disagree with IMPL? Update the written stack **in this PR**. Drift dies here.

Illustrative contract style:

```text
HANDLE_WEBHOOK(payload):
  PRE: payload is non-null and signed
  POST: idempotent outcome recorded OR duplicate ignored
  EFFECTS: persist event; return 200
```

Strategy decks shrink because **how you resolve a requirement** is standardized: one checklist-shaped path per change. Less quarterly theology, more shippable clarity.

---

## Why V+R+A+I takes over decisions waterfall forced into phases

**Thesis:** Waterfall did not invent decisions—it invented **when you are allowed to make them**.

Classic waterfall packs the hard thinking into **phase boundaries**: a requirements baseline before design, a design baseline before construction, a test plan after build, change control if reality disagrees. Each gate is really a bundle of decisions—what words mean, what “done” means, what shape the system has, what steps happen in what order—that **must** be settled before the organization unlocks the next org chart box.

The pain is not that those decisions exist. The pain is **batching and detachment**: hundred-page BRDs that age out, architecture PDFs that never meet the repo, implementation detail that only lives in code by month three, and “approved scope” that becomes folklore while merges keep shipping.

**V+R+A+I is the same decision stack, unbundled from the calendar:**

| Decision waterfall hides in a phase | Where it lives in TIED | Why that wins |
| --- | --- | --- |
| Requirements baseline / scope sign-off | **Vocabulary + Requirements** for **this change** | Sponsor language resolved first; acceptance is measurable; scope is one merge, not a release train |
| Preliminary & detailed design | **Architecture** linked to that requirement | Boundaries and interfaces recorded beside code; agents and reviewers read ids, not slide #47 |
| Program logic / module spec | **Implementation pseudo-code** | Behavior is elevated **before** RED; the “design doc” is the contract you implement and test against |
| Integration & test planning | **Proof facets** (unit → composition → justified E2E) | Test **tier** is a decision captured in structure, not a late department after dev “finishes” |
| Change control board | **LEAP** in the same work item | Drift updates the stack when tests teach you—no parallel “documentation recovery” phase |

Waterfall asks: **“Have we passed the gate?”** TIED asks: **“Is the decision recorded, linked, and still true after this PR?”** You still make architecture calls. You still nail acceptance. You still fight ambiguity. You stop **queueing** those calls behind artificial phase walls and stop **orphaning** the answers in SharePoint while git moves on.

That is why TIED can feel “documentation-heavy” without being “waterfall-slow”: the work is **slice-sized**, the records are **machine-navigable**, and the repair loop is **LEAP**, not a change-request ritual three weeks later. Agents amplify the payoff—elevation gives the next session a **bounded read set** instead of twenty files of inferred intent. The size-layer **atoms** row in trial snapshots is literally counting whether those phase-gate decisions landed as **indexed agreement** next to the product or evaporated when the phase clock ticked.

You do not need a methodology war to get there. You need to stop treating V, R, A, and I as **ceremony between phases** and start treating them as **the place decisions live** for every change that matters.

---

## Repeatable agent trials

**Thesis:** Fix the experiment surface; then compare harnesses and models for real.

Our workflow trials use:

- **Disposable client** — one clone per cell, tagged for discover.
- **Fixed stack** — e.g. TypeScript under `src/`, colocated `node:test`—so we measure process, not “agent picked Rust.”
- **Four phases** — define, refine, build, close-out; often **four sessions**, continuity via repo files.
- **Product-only prompts** — methodology already in the client bootstrap.

Same prompt family. Same stack. Vary harness, model, depth—**apples to apples**.

```text
  STRUCTURE (what landed)          FIDELITY (what holds)
  -----------------------          ---------------------
  size snapshot                    tests green
  batch comparison table           consistency validation
  atoms / intent / proof counts    readout + acceptance
  wall-clock minutes
```

Structure answers **what got written beside the code**. Fidelity answers **whether it holds**. Use both; celebrate structure when you are learning **how** agents leave intent behind.

Batch tables regenerate from a discover parent—same eligibility, same snapshot builder, same column registry. Boring tooling is how science scales.

---

## Three size layers—read any trial in five minutes

**Thesis:** Agreement footprint, elevated intent, and proof shape—on one row.

### Atoms

Indexed REQ/ARCH/IMPL plus vocabulary rows. **Did the run record agreement next to the code?** One requirement for a trial is normal; architecture and implementation rows signal the full stack showed up.

### Operational intent

Applied pseudo-code lines and procedures (template noise stripped out). **Was behavior elevated into writing?** This is the layer agents consume instead of spelunking `src/`.

### Proof facets

Unit, composition, and E2E **case counts** by path rules. Unit proves modules. **Composition proves wiring without a UI**—the discipline that stops “it worked in `main`.” In UI-free trials, E2E is often zero by design.

A pattern we watch in cohort summaries: **unit cases plentiful, composition cases often still at zero.** That is a clear **upgrade target** for the next trial wave—more wiring proof, not more debate threads.

### Cross-layer ratios

Pseudo-code per atom. Tests per atom. High tests with zero intent? **Invest in elevation.** Dense intent per atom? **You built teachable state** for the next agent.

### wall_clock

Minutes on the orchestrator clock—experiment cost. Pair with layers: slow can mean rich records; fast can mean thin stack. The table tells you **which**.

---

## Take the stack

**Thesis:** Clone the store; install into your repo; point agents at records, not diffs.

Methodology corpus, client install, checklists, trial tooling:

https://github.com/fareedst/tied

You get LEAP, the agent checklist, client development index, and the size-layer catalog. Disposable trials plus batch comparison are how we **learn in public**—same yardstick, run after run.

If you are shipping with agents and your spec still lives in chat, you are leaving the best multiplier on the table: **intent that the next session can read.** TIED is built for that future. One change is enough to feel the difference.
