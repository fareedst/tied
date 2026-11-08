# Trial readout: PROMPT-WF-01 → GPT-5.6 Luna high (Cursor agentstream) → `1794091020-wf-agentstream-wf-01-cursor-lunahigh`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` + `build-plan` (merged in turn 2) → **(harness abort at turn 3)** — planned `close-out` via **`workflow-trial-agentstream wf-01`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-01](catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) |
| **Model config** | `luna-high` |
| **Model slug** | `gpt-5.6-luna-high-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794091020-wf-agentstream-wf-01-cursor-lunahigh` |
| **Factory tag** | `wf-agentstream-wf-01-cursor-lunahigh` |
| **Product REQ** | `REQ-SEMVER_COMPARATOR` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** (`tied_cli_server_info`); evidence `…/REQ-SEMVER_COMPARATOR/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | **Repeat** **luna-high** WF-01 @ **4.2.1** after pilot [1794075385](trial-readout-PROMPT-WF-01-luna-high-1794075385-wf-agentstream-wf-01-cursor-lunahigh.md); pairs [luna-med partial @ 1794050603](trial-readout-PROMPT-WF-01-gpt56lunamediumfast-1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast.md) (build without close-out, harness **`1`**). Evaluation charter: [methodology evaluation framework](../tied-methodology-evaluation-framework.md) — **live** trial row; Q5 pairs orchestrator wall time vs product proof, not shell exit alone. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.
```

**Catalog stress:** baseline four-phase — premature coding vs clean PLAN-only add-feature. **Proof boundary:** `executable_behavior` reached at build-plan; **traceable commit** and machine **`close_out`** not reached.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `4d4fa7af-…`. Launch **`RetriableError: WritableIterable is closed`** (stderr). Clean scaffold: REQ, CITDP, PLAN, tracker, session methodology **4.2.1** capture; **no** product `src/*.ts`. |
| **2** | `refine-plan` + `build-plan` | Session `f1a2fb10-…`. **No discrete `phase-handoff-refine`** — agent repaired missing ARCH/IMPL/pre-implementation artifacts inline, passed pre-implementation gate, then executed full RED→GREEN in the **same** session (stdout). **`tsx`** missing on first RED → dependency install before attributable RED. Pseudo-code Layer B/C fixes before GREEN. Verification gate **allowed**; `tied_verify` moved REQ index **Implemented**. |
| **3** | `build-plan` (planned) | Turn banner in stderr **without** trailing `session_id`; manifest finalize **`exit_code: 1`**. Product already on disk from turn 2. |
| **4** | `close-out` | **Not run** — no request-evidence envelope, no `close_out` gate, no feature commit. |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.7dc5FC60Hg.yaml`; ~18.4 min wall (`2026-11-07T22:37:01Z` → `22:55:23Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| semantic version | `major.minor.patch` + prerelease ordering | PLAN; `IMPL-SEMVER_COMPARATOR` |
| simple comparator | Operators `<`, `<=`, `=`, `>=`, `>` | PLAN; `src/semver-comparator.ts` |
| one exported function | `satisfiesSemver(version, comparator): boolean` | `src/semver-comparator.ts` |
| malformed input | Return **`false`** (no throw) | Tests + IMPL |
| run all tests | **`npm test`** (`wf-trial-ts-node-test-v1`) | `package.json` |

---

## What was built

- **Library:** `src/semver-comparator.ts` + colocated **`node:test`** suite (**5** cases).
- **TIED stack:** REQ index **Implemented** (verification gate); `ARCH-SEMVER_COMPARATOR`, `IMPL-SEMVER_COMPARATOR` + pseudo-code sidecar; CITDP YAML under working folder; adherence ledger with pre-implementation + verification gate events.
- **Git:** bootstrap **`30ff223`** (TIED **4.2.1**) only; **full trial tree uncommitted**.
- **Orchestrator:** `workflow_trial_agentstream wf-01`, `HARNESS=cursor`, `gpt-5.6-luna-high-fast`, **`exit_code: 1`**.

**Uncommitted (expected disposable drift):** product stack, TIED indexes/details, `tied-project/working/REQ-SEMVER_COMPARATOR/`, orchestrator evidence.

---

## Outcome record

**Implementation outcome:** **Partial success** — facilitator `npm test` **5/5**; `npm run typecheck` pass; `tied_validate_consistency` **`ok: true`**; no traceable product commit.

**Workflow outcome:** **Incomplete** — orchestrator **`exit_code: 1`** at turn-3 boundary; **`close-out` not executed**; phase choreography **collapsed** refine+build into turn 2.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **not_run** | No `close_out` gate receipt |
| **Process contract** | **partial** | add-feature handoff + build-plan handoff; verification gate **allowed**; no envelope |
| **Adherence ledger** | **partial** | pre_implementation + verification `gate_decided`; close-out reconciliation **not_run** |
| **Close-out honesty** | **gap** | build-plan handoff defers close-out explicitly — sponsor should not treat index **Implemented** as shipped without commit |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-SEMVER_COMPARATOR.yaml` (**uncommitted**; detail `status` may lag index) |
| PLAN | `tied-project/working/REQ-SEMVER_COMPARATOR/PLAN.md` |
| Verification | `…/gates/verification-2026-11-07T22-54-48-434Z.json`; manifest under `evidence/verification-evidence-manifest.v1.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — metadata only; **`phase`: `add-feature`** (stale vs disk) |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-01-1794091020-wf-agentstream-wf-01-cursor-lunahigh/evidence/build-plan-verification-evidence.md).

**Proof boundary:** `facilitator_session_reconstruction` — paths, SHAs, orchestrator log excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ/PLAN/tracker/CITDP draft; methodology **4.2.1** capture |
| 2 | `refine-plan` + `build-plan` | ARCH/IMPL + pseudo-code; RED/GREEN; verification **allowed** — **no** refine-only handoff file |
| 3 | `build-plan` (harness) | **Aborted** before new `session_id` |
| 4 | `close-out` | **Not run** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794091020-wf-agentstream-wf-01-cursor-lunahigh/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`1`** |
| **Wall time** | ~18.4 min |
| **Stdout log** | `…/evidence/process.stdout.log` |
| **Stderr log** | `…/evidence/process.stderr.log` |

**Friction excerpts (stderr / manifest):**

- `DIAGNOSTIC: tied_methodology_version=4.2.1 source=orchestrator_resolver (secondary; session evidence file canonical)`
- `RetriableError: WritableIterable is closed` (launch)
- `DIAGNOSTIC: harness=cursor model=gpt-5.6-luna-high-fast … dry_run=0`
- `--- turn 1/4 (new session) ---` / `session_id=4d4fa7af-3e21-4a2f-9f77-85ff4d65dae9`
- `--- turn 2/4 …` / `session_id=f1a2fb10-7778-41f5-ba2e-500970d9c212`
- `--- turn 3/4 (new session) ---` — **no** `session_id` line before manifest finalize
- Manifest **`exit_code: 1`**

**Stdout cross-check:** turn-2 narrative documents missing refine artifacts repaired before RED, `tsx` install friction, and GREEN **5/5** before harness opened turn 3.

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Single bootstrap **`30ff223`** — product exists only in working tree (**pass** “no early product commit”) |
| Inventory vs disk | Inventory phase **stale**; build-plan artifacts present; refine handoff **absent** |
| RED evidence | **Present** (`quality-manifest/unit-test-red-red.*`) |
| Uncertainty | Refine vs build boundaries **merged** in one agentstream session — heuristic from stdout only |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` in inventory + PLAN |
| Product paths | `src/semver-comparator.ts`, `src/semver-comparator.test.ts` |
| Facilitator `npm test` | **5** pass |
| `npm run typecheck` | Pass |
| Deviation | **`tsx`** install required mid-trial (documented in build handoff) |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A−** | PLAN + tests cover comparator operators and malformed input |
| Traceability closure | **B+** | Full R+A+I + pseudo-code + verification receipts; no close-out envelope |
| Test strategy | **A−** | RED archived; **5** focused node-test groups |
| Algorithm / implementation | **B+** | Working comparator on disk; uncommitted |
| Process adherence | **B−** | Gates honored through verification; **phase merge** blurs refine/build |
| Workflow choreography | **C+** | Harness **`1`** after productive turn 2 — **inverted** vs pilot [1794075385](trial-readout-PROMPT-WF-01-luna-high-1794075385-wf-agentstream-wf-01-cursor-lunahigh.md) (`exit_code: 0`, empty product) |
| Methodology learning readout | **A−** | Live row for [evaluation framework](../tied-methodology-evaluation-framework.md): **execution honesty** — label orchestrator **`live`** **`exit_code: 1`** separately from **`executable_behavior`** GREEN; Q5 cost ~18.4 min wall for partial workflow |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. Compare harness exit, close-out receipts, and facilitator test counts — never a single maturity scalar.

---

## Cross-model notes (PROMPT-WF-01)

Compared with [luna-high pilot @ 1794075385](trial-readout-PROMPT-WF-01-luna-high-1794075385-wf-agentstream-wf-01-cursor-lunahigh.md): peer runs four turns with orchestrator **`0`** but **no** product and blocked close-out; this repeat delivers **5** green tests with orchestrator **`1`** and no close-out — **harness exit and delivery decouple**.

Compared with [luna-med @ 1794050603](trial-readout-PROMPT-WF-01-gpt56lunamediumfast-1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast.md): similar **build without close-out** pattern; this cell has session methodology capture **4.2.1** and stronger gate/adherence artifacts.

Compared with [Composer complete @ 1794048393](trial-readout-PROMPT-WF-01-composer25-1794048393-wf-agentstream-wf-01-cursor-composer25.md): traceable commit + full four-phase closure remains the bar.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds a **2026-11-07 repeat luna-high / `gpt-5.6-luna-high-fast`** row for **PROMPT-WF-01** on **TIED 4.2.1**, illustrating **split signal**: **`executable_behavior`** at build-plan vs orchestrator **`exit_code: 1`** and absent **`close_out`**.

---

## TIED version / dogfood

Session capture file records **TIED 4.2.1** on turn 1 (`tied_cli_server_info`). Documents a **repeat** agentstream WF-01 cell — **not** an effectiveness claim for TIED 4.2.1 or GPT-5.6 Luna.

---

## Facilitator follow-ups

- Optional manual `@close-out` on subject client if sponsor wants envelope + traceable commit.
- Reconcile stale `trial-workflow-interaction-inventory.v1.json` `phase` field after build-plan.
- Investigate turn-3 harness abort (`WritableIterable` + missing `session_id`) against [WF-06 luna-high @ 1794081715](trial-readout-PROMPT-WF-06-luna-high-1794081715-wf-agentstream-wf-06-cursor-lunahigh.md) pattern.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [TIED methodology evaluation framework](../tied-methodology-evaluation-framework.md)
- [WF trial orchestrator process log REQ](../../tied-project/requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-01-1794091020-wf-agentstream-wf-01-cursor-lunahigh/PLAN.md)
