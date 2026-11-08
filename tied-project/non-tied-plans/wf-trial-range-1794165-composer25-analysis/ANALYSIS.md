# Analysis: Why WF-04 and WF-05 failed in batch 1794165*

**Slug:** `wf-trial-range-1794165-composer25-analysis`  
**Audience:** Facilitator / sponsor interpreting a `workflow_trial_range` pass  
**Proof boundary:** This document does not score models, prove methodology effectiveness, or update the [trial runs registry](../../../docs/demos/traditional-workflow-trial-runs-registry.md).

---

## Sponsor question

You chained **`workflow_trial_range`** with **`HARNESS=cursor`**, **`composer-2.5-fast`**, and disposable tags `1794165*-wf-agentstream-wf-*-cursor-composer25`. WF-01–03 reported orchestrator **`exit_code: 0`**; WF-04/WF-05 reported **`exit_code: 1`**, while prior readouts show the same harness and model **completed** PROMPT-WF-04 and PROMPT-WF-05.

**What is harder about the last two prompts versus WF-01–03—and what is not?**

---

## Two-axis answer (required)

| Axis | Question | Verdict for batch 1794165* |
| --- | --- | --- |
| **Harness** | Did the four-phase agentstream schedule all turns and exit clean? | WF-04/05 **no**; WF-01–03 **yes** |
| **Prompt** | Is the catalog stress higher for WF-04/05? | **Yes** on paper; **bounded** by gold cells for same model |

**Do not merge axes.** WF-04 in this batch is a **split signal**: implementation delivered, workflow incomplete.

---

## Harness axis: what failed

Evidence: [turn-matrix.md](./evidence/turn-matrix.md)

1. **`WritableIterable`** appears at launch on **WF-04 and WF-05 only** in this batch (not on WF-01–03).
2. **WF-04** — stderr shows turns 1–2 with `session_id`, turn 3 banner **without** `session_id`, **no turn 4**. Manifest `exit_code: 1`. Session handoff requests **`@close-out`**.
3. **WF-05** — stderr shows **2/4** turns; manifest `exit_code: 1`. Handoff requests **`@build-plan`** after refine.
4. **Cumulative runtime** before WF-04: ~49 minutes of successful agentstream (01+02+03). Late-batch execution confounds “prompt harder” with “stream/session health.”

Comparable prior pattern: WF-05 incomplete [1794042383](../../../docs/demos/trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md) — refine on disk, harness abort before build.

**Facilitator re-run (T4):** `npm test` on client `1794167373` → **11/11 pass**, exit 0 — see [npm-test-wf04-rerun.txt](./evidence/npm-test-wf04-rerun.txt). The model **did** implement PROMPT-WF-04 traceability stress; the orchestrator **did not** run close-out.

---

## Prompt axis: catalog difficulty vs WF-01–03

Evidence: [catalog-stress-compare.md](./evidence/catalog-stress-compare.md)

| Prompt | What gets harder (when four turns complete) |
| --- | --- |
| **WF-01** | Baseline discipline — keep turn 1 PLAN-only. |
| **WF-02** | Document dedup policy before coding. |
| **WF-03** | Three modules + wiring test without UI — **completed in this batch right before WF-04**. |
| **WF-04** | Traceability scan — fixture-only tree, REQ marker grammar, index compare, CLI exits, optional JSON; more files and RESOLVE surface than WF-01/02. |
| **WF-05** | Refine expands edges — **AC for zero data rows must be written before RED**; turn 2 is longer and gate-adjacent. |

**Gold bounds (same model, same harness family):**

- WF-04: [1793851888 readout](../../../docs/demos/trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md) — 8/8 tests, four turns, exit 0.
- WF-05: [1794049382 readout](../../../docs/demos/trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md) — 6/6 tests, four turns, exit 0 (explicitly no WritableIterable).

Therefore: **intrinsic WF-04/05 stress is real but already achievable** under isolated cells; this batch’s failures are **not** evidence that Composer 2.5 newly exceeds those prompts.

---

## WF-04 vs WF-05 in *this* batch

| | WF-04 (`1794167373`) | WF-05 (`1794167900`) |
| --- | --- | --- |
| Harness stop point | After build-plan (turn 3 boundary) | After refine-plan (turn 2 boundary) |
| Product | `src/reqid-scan/*`, 11 tests green | No parser; refine + TIED locked |
| Catalog stress manifestation | Heavy **build** + fixtures | Heavy **refine** (AC-ZERO-*) — harness died **before** build stress |
| If harness had completed | Likely close-out gate/CITDP workload (see gold WF-04) | Would enter moderate CSV parser TDD (see gold WF-05) |

WF-05 looks “earlier” failure on the harness axis even though catalog ranks its **refine** harder than WF-03’s composition **build**.

---

## `workflow_trial_range` implication

From [`scripts/build-commands.sh`](../../../scripts/build-commands.sh): the loop **`|| return $?`** on first non-zero exit. WF-04 failure stops the shell function unless the operator starts WF-05 manually (your WF-05 client ~1 minute after WF-04 is consistent with a manual or separate invoke).

**Recommendation (reversible):** Run **`workflow_trial_agentstream wf-04`** and **`wf-05`** in **isolated** disposable clients—not chained 01–05—when comparing prompt stress to prior gold.

---

## What this single analysis does not prove

- Root cause of `WritableIterable` (correlation only).
- That chained 01–05 is a fair matrix design for WF-04/05 difficulty.
- Model ranking vs Luna/Claude cohorts.
- That methodology semver **4.2.1** regressed prompt completability (harness noise is sufficient explanation without LEAP).

---

## Optional sponsor follow-ups

1. `@record-wf-trial` for `1794167373` (**workflow incomplete**, implementation delivered) — [readout](../../../docs/demos/trial-readout-PROMPT-WF-04-composer25-1794167373-wf-agentstream-wf-04-cursor-composer25.md); and `1794167900` (**workflow incomplete**, refine only) — [readout](../../../docs/demos/trial-readout-PROMPT-WF-05-composer25-1794167900-wf-agentstream-wf-05-cursor-composer25.md).
2. Isolated orchestrator re-runs (test-strategy O1/O2).
3. Store harness hardening track if WritableIterable reproduction is required.

---

## Verification summary (test-strategy)

| ID | Status |
| --- | --- |
| T1 Manifests | Pass — five clients match PLAN matrix |
| T2 Turn crosswalk | Pass — [turn-matrix.md](./evidence/turn-matrix.md) |
| T3 Handoff vs stderr | Pass |
| T4 npm test WF-04 | Pass — 11/11 |
| T5 Two-axis prose | Pass — this document |

**Handoff:** optional `@non-tied-close` if you want these artifacts committed in the store repo.
