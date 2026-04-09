# Reddit intro: TIED, agentstream, and Cursor `agent` CLI

Use this as the **introduction** for a Reddit post. Pair it with [checklist_feedback_loops.md](checklist_feedback_loops.md) (or a paste of that doc) as **detail** in a follow-up comment or below the fold.

**Subreddit notes:** Keep links non-commercial; follow local rules for self-promotion and repo links.

---

## Title idea

*Using Cursor's `agent` CLI to drive a specification-first build*

---

## Post body

### How Cursor helped

- **`agent` CLI + durable session:** Using the **`agent`** command-line to drive Cursor through the checklist step-by-step, with **persistent session context** so the next call continues the **same** change request (not a fresh chat that forgets which REQ/ARCH/IMPL pass you're in). That persistence is basically required for "ongoing analysis" to work across multiple terminal runs.
- **Rules + pinned context:** Project rules pointing at **AGENTS.md** so every session gets the same obligations (tokens, MCP-first TIED edits, methodology boundaries).
- **MCP for TIED:** REQ/ARCH/IMPL reads/writes through the **TIED YAML MCP** plus `tied_validate_consistency`, which cuts invalid YAML and wrong-`TIED_BASE_PATH` mistakes.
- **Prompts that mattered:** e.g. *"Follow PROC-AGENT_REQ_CHECKLIST; use the per-request checklist copy; one step per turn; on failure use the YAML loop-back and clear the listed step IDs."* and *"Before GREEN, if pseudo-code is wrong, LEAP micro-cycle—no silent divergence."*

### What I made

I'm using **TIED** (traceable **Requirements → Architecture → Implementation** with semantic tokens) as the backbone for how I build software. On top of that I added **agentstream**: a Ruby app that turns the full agent checklist (YAML) into **concrete, ordered steps** so Cursor can execute the workflow end-to-end—bootstrap, impact analysis, REQ/ARCH/IMPL updates, pseudo-code quality gates, TDD, composition, E2E only where justified, YAML validation, and a final sync so docs match code.

[TIED](https://github.com/fareedst/tied)

I drive it from the terminal with Cursor's **`agent` command-line**: each run can pick up the same repo, rules, and checklist state, but **session persistence really matters** for follow-up calls. Later `agent` invocations need to land in the **same ongoing analysis** (same working copy of the per-request checklist, same IMPL inventory, same open gates)—otherwise you lose continuity and the model re-derives context from scratch, which is where teams usually skip steps or drift from R+A+I.

The **feedback loops** are what keep that honest: if tests, wiring, E2E, or consistency disagree with the spec, the flow **loops back**—**implementation pseudo-code first**, then tests, then code (**LEAP**), and **scope** changes propagate **up** to architecture and requirements. So **R+A+I stay aligned**, pseudo-code is **solid before** RED tests, and logical issues get caught in **earlier checklist passes** (spec loop, validation, micro-LEAP during green) instead of after you've "finished."

### Example Ruby

[treegrep](https://github.com/fareedst/treegrep) was 100% implemented with this tooling.


## 1. End-to-end spine (forward path)

The default run is **one long forward pass**. Feedback loops (later sections) are **jumps back** to an earlier kind of work—not extra steps on this main line.

```
Bootstrap and change analysis
  Session context and governance
  -> Change definition and success criteria
  -> Impact map and implementation-decision inventory

TIED stack before coding
  -> Requirements
  -> Architecture
  -> Specification loop (contracts through persisted implementation records)

Plan and build
  -> Risk analysis
  -> Test plan and testability
  -> Test-driven cycle per pseudo-code block
  -> Composition testing
  -> End-to-end testing where justified

Close out
  -> Final validation gate
  -> TIED sync to code and tests
  -> README and changelog if needed
  -> CITDP analysis record
  -> Commit
```

Linear shortcut (same order):  
`Session/governance` → `Change + criteria` → `Impact + IMPL inventory` → `Requirements` → `Architecture` → `Specification loop` → `Risks` → `Test plan` → `TDD per block` → `Composition` → `E2E` → `Final validation` → `TIED sync` → `README/CHANGELOG` → `CITDP record` → `Commit`.

- The **specification** column is where pseudo-code is hardened before tests—see §4.
- The **test-driven cycle** node is the tight TDD loop—see §5 and §6.

---

## 2. What “feedback loop” means; LEAP ordering

**Feedback loop:** later work produces evidence (fails, missing coverage, consistency errors) that forces **revisiting** an earlier activity.

**Aligning artifacts (same scope):** bring **implementation pseudo-code**, **tests**, and **production code** into agreement in this order:

**Plain-text flow:** align in this order (repeat until stable):

1. **Implementation pseudo-code** (authoritative for behavior)
2. **Tests** (match pseudo-code)
3. **Production code** (pass tests)

**When scope changes** (what the system must do or how it is shaped), updates may need to move **up** the traceability stack—not only down into code:

**Plain-text flow:** scope shifts propagate **up** the stack (not only into code).

```
Evidence implies scope shift
  -> Update implementation pseudo-code and records
       -> If architectural scope changed: update architecture decisions
       -> If requirement scope changed: update requirements
  (Architecture changes may require requirement updates.)
```

---

## 3. CITDP: feed-forward analysis, then retrospective record

Early outputs (**change definition**, **impact**, **risks**, **test strategy**) are **consumed** during implementation; they are not a tight retry loop in the middle of the run.

**Plain-text flow:**

```
Early CITDP outputs  ->  Implementation and validation  ->  CITDP record (e.g. under docs/citdp)
```

The **record** step captures **what happened versus the early analysis** (divergences, required TIED updates, status)—closing the loop into **durable memory**, not into an immediate redo of analysis.

---

## 4. Specification loop (before relying on failing tests)

This loop keeps **implementation pseudo-code** authoritative and complete **before** the main test-writing phase.

**Plain-text flow:**

```
Start: implementation decisions discovered
  -> Catalog contracts from pseudo-code
  -> Flag insufficient or contradictory specs
  -> Resolve in essence_pseudocode
        |-> If architecture scope changed: update architecture, then back to Resolve
        |-> If requirement scope changed: update requirements, then back to Resolve
  -> Apply block token comments
  -> Pseudo-code validation (gating)
        |-> Fail or iterate: back to Resolve
        |-> Pass or waived: Persist implementation records to TIED
```

- **Irreconcilable** contradictions between two implementation views: **restructure or split** decisions—do not patch over conflicts.
- **Validation** repeats until gates pass or a waiver is documented.

---

## 5. Test-driven inner loop and exit to composition

Per **logical block** of pseudo-code:

```
Write failing test
  -> Minimal production code
  -> Refactor
  -> Three-way alignment
        |-> More blocks to cover: loop to "Write failing test"
        |-> Unit/integration blocks done: go to Composition testing
```

- **Three-way alignment:** pseudo-code, test, and code share the same semantic token set and intent; on mismatch, use the **pseudo-code → tests → code** order from §2.

---

## 6. LEAP micro-cycle during minimal coding

When “green” work shows pseudo-code is wrong, incomplete, or needs a new dependency—**stop** adding production code and realign.

```
Minimal production code
  -> Spec wrong, incomplete, or new dependency?
       NO  -> Continue refactor or three-way alignment (normal checklist)
       YES -> Stop coding
              -> Update implementation decision in TIED
              -> YAML lint and consistency sub-procedure
              -> Update architecture or requirements if scope changed
              -> Update test to match pseudo-code
              -> Update code to pass test
              -> Verify three-way alignment
              -> Resume minimal production code
```

- **Architecture or requirements** updates run through the same YAML validation path before retargeting tests and code.
- After a micro-cycle, **minimal coding** resumes until the increment passes; when there is **no** spec mismatch, follow the normal **refactor** and **alignment** steps without entering the halt branch.

---

## 7. Composition and end-to-end: discovery loops back into implementation intent

Integration and UI-level work can expose **missing** formal implementation coverage.

```
Composition testing
  -> Binding lacks IMPL coverage?
       Yes: run implementation sub-flow (catalog contracts through persist), then return to Composition testing

End-to-end testing
  -> Missing pseudo-code block for observed behavior?
       Yes: run the same implementation sub-flow, then return to End-to-end testing
```

- **Light gap:** extend existing implementation pseudo-code, then return to **token-comment** work before returning to composition.
- **Separate design:** rerun the full **specification loop** from contract cataloging through persistence, then return.

---

## 8. Final validation gate (compound exit check)

Everything must pass before treating the work as complete. Failures **route back** by kind of problem:

```
Final validation (suite, lint, tokens, alignment, metadata)
  -> All gates pass?
       YES -> Continue to TIED sync
       NO  -> By failure kind:
                Unit test failure        -> Return to failing-test phase
                Composition failure      -> Return to composition testing
                E2E failure              -> Return to E2E
                Lint                     -> Fix lint, re-run final validation
                Tokens / consistency     -> Fix traceability, re-run final validation
                Three-way drift          -> LEAP (pseudo-code, then test, then code), re-run final validation
```

---

## 9. Post-implementation TIED sync (outer drift loop)

After behavior stabilizes, **sync** ensures TIED still matches code and tests.

```
TIED sync step
  -> Documentation matches code and tests?
       YES -> Continue (README, changelog, CITDP record, commit)
       NO  -> LEAP: resolve pseudo-code; update architecture and requirements if needed
              -> Re-run consistency validation
              -> Return to TIED sync step (repeat until aligned)
```

This prevents **long-lived drift** between repository behavior and traceable intent.

---

## 10. YAML edit and validation sub-procedure

Any TIED YAML mutation goes through **lint** (for direct edits) and **consistency validation**. The main checklist does not advance on broken or inconsistent YAML.

```
Create or update TIED YAML
  -> lint_yaml (where applicable)
  -> tied_validate_consistency
        |-> FAIL: fix indexes or detail files via prescribed tooling, then validate again
        |-> PASS: return to the calling checklist step
```

**Callers** include (conceptually): requirement, architecture, and implementation persistence; three-way alignment; composition; final validation; sync; CITDP record write; and the LEAP micro-cycle when it touches implementation files.

---

## 11. Checklist tracking on re-entry

The machine-readable checklist defines **which completion markers to clear** when an agent **re-enters** an earlier phase after a loop-back—so downstream steps are not left incorrectly marked finished. This is **bookkeeping** for honest re-runs, not a separate business logic loop.

---

## 12. Compact mental model (three pillars)

| Pillar | Role in loops |
|--------|----------------|
| **CITDP** | Analyze early; **close** with a stored record that can hold divergences. |
| **TIED** | Wrap doc changes in **validate → fix → re-validate** (§10). |
| **LEAP** | Surface gaps from tests, composition, E2E, or sync → return to **implementation pseudo-code** (and **architecture** or **requirements** when scope changes) → propagate **pseudo-code → tests → code** (§2, §5, §6). |

**Plain-text flow:**

```
Checklist unifies three ideas in parallel:
  - CITDP: analysis early, then a closing record
  - TIED: YAML edits wrapped in lint + consistency until pass
  - LEAP: pseudo-code first, then tests, then code; scope changes move up REQ/ARCH/IMPL
```
