# We stopped arguing about which model “won” and started publishing how agent workflows actually finish—or don’t

**Thesis:** TIED turns agent work into inspectable engineering: phased skills, written intent, gates, graded readouts, and cohort tables you can read without trusting chat.

---

Green CI tells you a test passed. It does not tell you whether the agent **respected plan-before-code**, whether requirements still match the diff, or whether “done” was **narrated** or **gated**. If you are scaling coding agents, that gap is where projects silently rot.

**TIED** (Token-Integrated Engineering & Development) is built for that gap: a **per-change knowledge stack** in the same repo as the product—vocabulary, requirements, architecture, implementation pseudo-code—wired to **tests in a fixed order** and **machine-readable gate receipts**. Agents do not get a free pass on “I think we’re done.” Facilitators can **reconstruct** what happened from disk.

We have been running the same **four-phase workflow** on disposable clients—define feature, refine plan, build plan, close-out—across **Cursor and Claude** harnesses, on small TypeScript product tasks. We now publish **~195 per-run readouts**, a **runs registry**, a **WF×model comparison matrix**, and a **project-size cohort table** that joins traceability mass, pseudo-code lift, test facets, wall clock, and session grades.

This post is what that corpus is **for**, and what TIED buys you if you care about **intent that survives the next session**.

---

## What TIED adds that chat and diffs do not

**Thesis:** A parallel stack agents can read; humans can audit.

| You often have today | What TIED adds on the same change |
| --- | --- |
| Thread + diff | **REQ / ARCH / IMPL** records with stable ids |
| “The agent understood me” | **Vocabulary** resolved before names fossilize in `src/` |
| Tests whenever | **Order**: unit → composition (wiring) → UI E2E only when justified |
| Shipped = merged | **Done** = tests green + trace stack consistent + gates where defined |
| Drift next week | **LEAP**: update the written stack in the **same** PR when tests teach you |

Two mechanics matter for agentic work specifically:

- **Elevation** — behavior lives in implementation pseudo-code first; source implements it. The next turn reads **records**, not twenty files of inferred intent.
- **Workflow choreography** — we grade whether the agent honored **phase boundaries** (e.g. no product `src/` before the build-plan turn). That dimension has real weight in our workflow trials because it is the failure mode agents hide behind “it works on my machine.”

Illustrative contract style (logic-only):

```text
CLOSE_OUT(change):
  PRE: verification gate allowed; envelope has zero blocking gaps
  POST: traceable commit OR honest incomplete labeled in readout
  EFFECTS: REQ index reflects test-derived status when verify runs
```

Strategy decks shrink because **how you finish a change** is standardized: one checklist-shaped path, one place decisions live.

---

## What we actually run (workflow trials)

**Thesis:** Fixed experiment surface; vary harness and model; measure process, not vibes.

Each **workflow trial cell** is:

- One **fresh disposable git client** per `(prompt × harness × model configuration)`.
- A **product-only prompt**—no “use TIED” pasted into the task; methodology is already in the client bootstrap.
- Often **four separate agent sessions** (or the same choreography via an orchestrator), with continuity from repo files and inventories.
- A locked **implementation stack** (`wf-trial-ts-node-test-v1`): TypeScript under `src/`, colocated `node:test`, so we compare **workflow discipline**, not “agent invented a new stack.”

We grade **seven facilitator dimensions**—requirement interpretation, traceability closure, test strategy, implementation quality, process adherence, **workflow choreography**, and methodology learning—with a **rationale sentence per row** grounded in the readout. Registry rows expose a compact `mean · Req/Tr/Ts/Al/Pr/Ch/Ml` string for cohort sorting.

**That mean sorts rows in a table. It is not a universal AI leaderboard.** The value is **comparability under identical workflow stress**, not crowning a champion model.

---

## What we publish now (the part worth bookmarking)

**Thesis:** Progress you can open in a browser—analysis, not anecdotes.

1. **Per-run trial readouts** — structured post-mortems: what was built, four-turn table, three **completion signals** (machine close-out, process contract, orchestrator exit), session grading with rationales. Example pattern: orchestrator **`exit_code: 0`** while **close-out is blocked** because CITDP gates reject persist—we document that **split signal** instead of calling the run “green.”

2. **Runs registry** — slim master table: harness, model, exit, wall time, grades, latest cell per matrix slot.

3. **Latest-run comparison matrix** — WF prompts × model columns, regenerated from readouts.

4. **Cohort comparison table** — **three size layers** on every discovered client:
   - **Atoms** — did REQ/ARCH/IMPL and vocab land beside the code?
   - **Operational intent** — pseudo-code mass (what the agent elevated into writing)
   - **Proof facets** — unit, composition, E2E case counts by path rules  
   Plus optional grade join and **wall_clock** minutes.

5. **Public guide** — one narrative for sponsors and curious devs: how runs work, how grading works, how summaries refresh (`workflow-trials-guide` in the agent-harness-evaluation docs tree).

Regeneration is boring on purpose: after new readouts, a publish step rebuilds indexes from files on disk so the cohort view stays aligned with what facilitators actually wrote.

---

## Reading the matrix (WF-07…10 × Haiku, Sonnet, Composer)

**Thesis:** One screenshot is worth a hundred “our agent is great” threads—if you know what each cell means.

The post image is a crop of the **Latest-run comparison matrix** in the [runs registry](https://github.com/fareedst/tied/blob/main/docs/agent-harness-evaluation/registries/traditional-workflow-trial-runs-registry.md#latest-run-comparison-matrix): the **bottom block of prompts** (**WF-07** through **WF-10**) and three **toolset columns** we compare most often:

| Column in the crop | Harness | Agent / model |
| --- | --- | --- |
| Claude Haiku 5.5 **@high** | Claude Code (agentstream) | Haiku with high effort |
| Claude Sonnet 5.5 **@high** | Claude Code (agentstream) | Sonnet with high effort |
| **Composer 2.5** | Cursor (agentstream) | `composer-2.5-fast` |

![Latest-run comparison matrix: PROMPT-WF-07 through WF-10 for Claude Haiku @high, Claude Sonnet @high, and Cursor Composer 2.5](assets/matrix-wf07-10-sonnet-haiku-composer.png)

**Each cell** (same format as the live markdown table) is three lines:

1. **Wall minutes** (`11m`, `18m`, …)—orchestrator time for **four sponsor turns**, not token latency.
2. **Session grades**—leading number is the arithmetic **mean** of seven facilitator bands; after `·` comes `Req/Tr/Ts/Al/Pr/Ch/Ml` (requirement interpretation, **traceability**, test strategy, implementation, process, **workflow choreography**, methodology learning). **A** is not a product quality certificate; it is how that run scored on that dimension in the readout.
3. **Readout link**—full post-mortem on disk (git phase, gates, split signals, rationales).

**What the four prompt rows stress** (so the matrix is not “random tasks”):

| Prompt | Workflow stress (catalog) | Why it shows up in a “harder” corner of the matrix |
| --- | --- | --- |
| **WF-07** | Resolve **null vs missing** (and related open questions) in **refine** before build | Traceability and requirement interpretation separate; fast wall times on Claude do not always mean clean close-out |
| **WF-08** | **State machine** behavior; illegal-transition tests after IMPL plan | Test strategy + choreography; Composer’s latest WF-08 cell is a reminder that **high means can mask weak choreography** |
| **WF-09** | **Ordered parallel map**; composition / binding without UI | Composition cohort: **Tr** (traceability) and **process** bands often dip when CITDP close-out blocks despite green unit tests |
| **WF-10** | **Thin CLI** wiring into core; composition evidence | Same composition bar as 09; grades spread when wiring tests are thin but narration sounds complete |

**How to read the crop without turning it into a leaderboard:**

- **Sonnet @high** on WF-07 and WF-08 shows **high session means** (e.g. **3.96**) with comparatively long wall times on WF-07—the readout still matters: did close-out gate **allow**, or only the orchestrator exit?
- **Haiku @high** stays competitive on means for WF-07 (**3.86**) but **WF-09** is where the story changes: latest **Haiku @low** readout is **2.56** with **D+** on traceability—tests on disk, **no traceable commit**, close-out **blocked**. That is the **split signal** TIED is designed to surface.
- **Composer 2.5** often posts strong means on earlier prompts; on **WF-08** the latest cell is **3.57** with **A−** on choreography—exactly the dimension TIED adds that generic benchmarks ignore.

The full matrix has many more columns (Grok, Luna tiers, effort variants). The crop is **not** “these three won”; it is **the same four product stresses, three harnesses we dogfood**, with **clickable readouts** behind every number.

Live table (always newer than a screenshot): [registry § Latest-run comparison matrix](https://github.com/fareedst/tied/blob/main/docs/agent-harness-evaluation/registries/traditional-workflow-trial-runs-registry.md#latest-run-comparison-matrix).

---

```text
  STRUCTURE (what landed)          FIDELITY (what held)
  -----------------------          ----------------------
  size snapshot                    tests green on replay
  batch comparison table           gate receipts / close-out honesty
  atoms / intent / proof counts    readout + acceptance criteria
  session grades + rationales      split signals documented
```

---

## Why this is TIED—not another “agent benchmark”

**Thesis:** We measure whether **engineering workflow** completed, with evidence.

Benchmark culture optimizes a score. TIED optimizes **whether the next person (or agent) can continue the work without re-deriving intent**:

- **Traceability closure** is a graded dimension—not optional paperwork.
- **Composition evidence** is required on wiring-heavy prompts—unit tests alone are not enough when the stress is the **seam**.
- **Process adherence** includes gate JSON, envelopes, and honest incomplete states.
- **HMEP** stream metrics (tokens, cost) live in a **separate** harness-eval lane—they do not replace session grades.

Cohort tables make tradeoffs visible: high unit counts with **zero composition cases** flag the next wave’s upgrade target (more wiring proof), not a flame war about model taste.

---

## Take the stack

**Thesis:** Clone the store; install into your repo; run one change with records, not hope.

Methodology corpus, client install, bundled phase skills, trial orchestrator, facilitator skills for recording and publishing cohort summaries:

https://github.com/fareedst/tied

Start here for the new narrative:

- https://github.com/fareedst/tied/blob/main/docs/agent-harness-evaluation/workflow-trials-guide.md
- https://github.com/fareedst/tied/blob/main/docs/agent-harness-evaluation/README.md

If your “spec” still lives only in chat, you are paying **re-discovery tax** every session. TIED is the multiplier: **written intent, phased delivery, tests in order, and public readouts when you choose to learn in the open.** One disposable trial is enough to feel the difference; **~195** published cells are enough to study patterns without pretending one row settles the industry.