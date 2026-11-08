# Plan: WF trial range 1794165* — harness abort vs prompt difficulty

**Slug:** `wf-trial-range-1794165-composer25-analysis`  
**Track:** `non-tied-plan` → **non-tied-refine** (this revision) → `@non-tied-build` → optional `@non-tied-close`  
**Linked Cursor plan:** `.cursor/plans/wf_trial_range_analysis_b3129fed.plan.md`

---

## Sponsor question (locked)

After a **`workflow_trial_range`** pass (`cursor` + `composer-2.5-fast`), disposable clients **WF-01–03** reported orchestrator **`exit_code: 0`** and **WF-04/WF-05** reported **`exit_code: 1`**, contrary to prior **gold readouts** for the same harness and model. What is **intrinsically harder** about the last two **PROMPT-WF-*** cells versus WF-01–03, as opposed to **harness / batch** effects?

**Proof boundary:** Facilitator analysis and evidence markdown only — not a new catalog **`[REQ-*]`**, not a maturity score, not a model leaderboard.

---

## RESOLVE (Touchpoint 1)

| Sponsor term | Resolved meaning |
| --- | --- |
| **`workflow_trial_range`** | Shell helper in [`scripts/build-commands.sh`](../../../scripts/build-commands.sh): `harness`, `model_slug`, `model_config`, `end`, `start` (defaults `1`); loops `workflow_trial_agentstream wf-NN` with **`|| return $?`** (stops batch on first non-zero). |
| **Harness** | Short key **`cursor`** → four-phase **agentstream** batch (`run-traditional-four-phase-agentstream.sh`). |
| **Model config** | Registry bucket **`composer25`**; slug **`composer-2.5-fast`**. |
| **Workflow complete** | Four scheduled turns (`add-feature` → `close-out`) each with a new session; manifest **`exit_code: 0`**; close-out artifacts when applicable. |
| **Workflow incomplete** | Manifest **`exit_code: 1`** and/or fewer than four turn banners with `session_id` in `process.stderr.log`. |
| **Split signal** | Strong on-disk implementation (tests green) but orchestrator or close-out fingerprint incomplete — catalog term; WF-04 in this batch fits **implementation delivered / workflow incomplete**. |
| **WritableIterable** | Agentstream launch noise (`RetriableError: WritableIterable is closed`); in prior readouts, **co-occurs with aborted ranges** but does not by itself prove root cause. |
| **Intrinsic prompt difficulty** | Catalog **`workflow_stress`** and primary LLM differentiator when the harness completes four turns — bounded by gold cells for same model. |

**Accepted ambiguity:** Root cause of WritableIterable is **out of scope** for this non-tied plan unless sponsor later scopes harness hardening; plan records **correlation** only.

---

## Refinements applied (non-tied-refine)

1. **Two-axis answer (required in build):** Every conclusion labels **harness axis** vs **prompt axis**; do not collapse into “model failed WF-04.”
2. **WF-04 turn model corrected:** stderr shows turns **1–3** (turn 3 **missing `session_id`**); stdout proves **build-plan GREEN**; **turn 4 close-out never started** — not “failed at turn 3 product work.”
3. **Deliverables are facilitator docs**, not registry rows unless sponsor runs `@record-wf-trial` separately.
4. **`test-strategy.md`** defines verification steps only (no RED product tests in repo root).
5. **Evidence paths** use absolute client roots under `/Users/fareed/Documents/dev/test/1794165*-wf-agentstream-wf-*-cursor-composer25`.

---

## Executive summary (for `@non-tied-build`)

| Axis | WF-04 | WF-05 |
| --- | --- | --- |
| **Harness** | Abort after turn 3; no close-out; **`WritableIterable`** at launch | Abort after turn 2; no build-plan; **`WritableIterable`** at launch |
| **Prompt (catalog)** | **Traceability scan** — fixture tree, REQ marker grammar, index compare, CLI exits | **Refine expands edges** — AC-ZERO-* locked before RED |
| **This batch on disk** | 11/11 tests, `REQ-REQID_MARKER_SCAN_CLI` | Refine complete, `REQ-CSV_ROW_MAP`, no parser |
| **Prior gold (same model)** | [1793851888](../../../docs/demos/trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md) complete | [1794049382](../../../docs/demos/trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md) complete |

**Bottom line:** Last-two failures in batch **1794165\*** are **primarily workflow incomplete (harness/batch)**, not evidence that PROMPT-WF-04/05 exceed Composer 2.5 bounds. WF-03 **composition** completed in the same chained window **before** harness divergence — disconfirming a simple “later ID = harder” ladder.

---

## Batch evidence matrix

| Client ID | WF | Manifest exit | Stderr turns / `session_id` | Session-handoff “do next” | Wall UTC |
| --- | --- | --- | --- | --- | --- |
| `1794165312` | 01 | 0 | 4/4 | close-out done | 19:15–19:26 |
| `1794165972` | 02 | 0 | 4/4 | full workflow | 19:26–19:36 |
| `1794166601` | 03 | 0 | 4/4 | `close_out` receipt | 19:36–19:49 |
| `1794167373` | 04 | 1 | 3 banners; turn 3 no `session_id` | `@close-out` | 19:49–19:57 |
| `1794167900` | 05 | 1 | 2/4 | `@build-plan` | 19:58–20:04 |

**Cumulative runtime before WF-04:** ~49 minutes of agentstream (01+02+03).

**Catalog stress (when four turns complete):** see [facilitator index](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md#facilitator-index-maps-trial-prompt--stress--grading).

---

## `workflow_trial_range` behavior

```text
workflow_trial_range [harness] [model_slug] [model_config] [end] [start] [monit]
```

Each iteration: bootstrap disposable client + four agentstream sessions. First failure returns non-zero from the shell function unless operator starts later cells manually (explains WF-05 one minute after WF-04).

---

## Consequence ladder (sponsor choices)

| Choice | Ladder | Effect on interpretation |
| --- | --- | --- |
| Single 01–05 range without pause | Costly | Confounds prompt stress with late-batch stream errors |
| Isolated `workflow_trial_agentstream wf-04` / `wf-05` | Reversible | Matches gold-cell protocol |
| Manual `@close-out` on `1794167373` | Reversible | Product value; does not rewrite orchestrator manifest |
| Harness WritableIterable root-cause fix | Costly | Store / agentstream change; separate work item |

---

## Deliverables (`@non-tied-build`)

| File | Purpose |
| --- | --- |
| `PLAN.md` | This file |
| `test-strategy.md` | Facilitator verification checklist |
| `ANALYSIS.md` | Long-form answer (two-axis tables + links to gold readouts) |
| `evidence/turn-matrix.md` | Stderr vs stdout vs handoff crosswalk |
| `evidence/catalog-stress-compare.md` | WF-01–05 stress + gold links |
| `evidence/session-handoff.md` | Plan execution steps (disk handoff) |
| Optional `evidence/npm-test-wf04-rerun.txt` | Output of verifier step |

**Forbidden:** Product code in store repo; project TIED V+R+A+I YAML; git commits unless `@non-tied-close`.

---

## Optional follow-up (sponsor / separate tracks)

1. `@record-wf-trial` readouts for `1794167373` and `1794167900` (workflow incomplete labels).
2. Isolated orchestrator re-runs for WF-04/WF-05.
3. Store harness investigation (`REQ-WF_TRIAL_FOUR_PHASE_*` family) if WritableIterable reproduction is required.

---

## Handoff

**Next:** `@non-tied-build` — materialize `ANALYSIS.md` and `evidence/*` per [test-strategy.md](./test-strategy.md).
