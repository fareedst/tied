# Trial readout: PROMPT-WF-01 → Claude Haiku 5.5 (low effort) → `1794971027-wf-agentstream-wf-01-claude-claudehaiku55low`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-17 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow_trial_agentstream wf-01`** (`HARNESS=claude`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-01](../catalogs/catalog-traditional-workflow-trial-prompts.md#prompt-wf-01) |
| **Model config** | `claude-haiku-5-5` (`low` effort) |
| **Model slug** | `claude-haiku-5-5` |
| **Harness** | `claude-agentstream-four-phase` |
| **Client root** | `/Users/fareed/Documents/dev/test/1794971027-wf-agentstream-wf-01-claude-claudehaiku55low` |
| **Factory tag** | `1794971027-wf-agentstream-wf-01-claude-claudehaiku55low` |
| **Product REQ** | `REQ-SEMVER_COMPARATOR` |
| **TIED methodology version (session)** | **4.2.2** — source **`install_json`** — `tied-project/working/REQ-SEMVER_COMPARATOR/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **Haiku low** WF-01 on **4.2.2** with default-on **minimal checklist gates** in four-phase batch; peer [Haiku high @ 1794845395](trial-readout-PROMPT-WF-01-claudehaiku55high-1794845395-wf-agentstream-wf-01-claude-claudehaiku55high.md) reached **close_out allowed**. |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.
```

---

## RESOLVE (subject)

| Term | Resolution |
| --- | --- |
| Export | `satisfies(version, comparator)` |
| Stack | `wf-trial-ts-node-test-v1` (locked refine) |
| Depth | CITDP `profile_depth: minimal`, `gate_policy: advisory` |

---

## What was built

- **Product:** `src/semver-comparator.ts`, `src/semver-comparator.test.ts`; facilitator **11/11** pass.
- **TIED:** PLAN + handoffs 1–4; draft CITDP on disk; **legacy-shaped** `checklist-tracker.yaml` (`tracker:` wrapper, slugs `red-tests-src` / `refine-open-choices`).
- **Stack:** `wf-trial-ts-node-test-v1`; orchestrator **`exit_code: 0`**; wall **~250s** (~4.2 min).
- **Git:** bootstrap **`e05b717`** only — product tree **untracked**.
- **Project size layers:** snapshot **atoms** req index **1** · **proof_facets** **11** `unit.default` · **operational_intent** empty (no IMPL pseudo-code on client); facilitator **11/11** tests (evidence-only; not a grade).
- **Proof manifest:** one `files[]` row for `src/semver-comparator.test.ts`; `tied_wf_proof_manifest_validate` **ok** per build-plan handoff.

---

## Outcome record

**Implementation outcome:** **Pass (local)** — semver comparator green at facilitator replay.

**Workflow outcome:** **Incomplete (split signal)** — orchestrator **`exit_code: 0`**; machine **close_out** and **verification** gates **blocked**; **no** product commit.

**Grading outcome:** **Grade mean (registry compact):** 2.99 · A/D+/B+/A−/C+/B/B+.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `tied_gate_check` `allowed: false`, `gate_blocked`; no `gates/close_out-*.json` |
| **Process contract** | **partial** | RED/GREEN archived; proof manifest ok; **no** `gates/verification-*.json` |
| **Adherence ledger** | **not_run** | No `tied_adherence_reconcile_run` on client |
| **Orchestrator** | **pass shell** | **`exit_code: 0`**; phase-handoff + proof manifest default-on |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| PLAN | `tied-project/working/REQ-SEMVER_COMPARATOR/PLAN.md` |
| **Interaction inventory** | `tied-project/working/REQ-SEMVER_COMPARATOR/evidence/trial-workflow-interaction-inventory.v1.json` |
| **Proof manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../../tied-project/working/FACILITATOR-WF-01-1794971027-wf-agentstream-wf-01-claude-claudehaiku55low/evidence/build-plan-verification-evidence.md).

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ + PLAN + **legacy-style** tracker |
| 2 | `refine-plan` | D1–D7 locked; pre_implementation gate **`allowed: false`** (advisory) |
| 3 | `build-plan` | **11/11** GREEN; verification gate **`blocking: true`** |
| 4 | `close-out` | **Incomplete** — gate blocked; envelope backfill ok; **no** commit |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | **~250s** (~4.2 min) |

**Friction excerpts (stderr):**

- `DIAGNOSTIC: WF trial proof manifest gate: default on`
- `DIAGNOSTIC: WF trial phase handoff gate: default on`
- `DIAGNOSTIC: WF trial slim checklist tracker exists: …/checklist-tracker.yaml` (post-run materialize **skipped** — agent tracker already present)
- Four turns with fresh `session_id` per turn

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Commits | **Bootstrap only** — close-out correctly skipped traceable commit |
| Tracker shape | add-feature slugs vs slim template (`red-tests` / `verification-gate`) — gate diagnostics `malformed_tracker:steps` |
| vs 1794845395 | Peer **high** cell committed **`418dcdf`** with **67** tests and **close_out allowed** |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Facilitator `npm test` | **11/11** |
| Product under `src/` | **Present** |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **A** | Comparator scope and invalid-input rule locked in PLAN before RED. |
| Traceability closure | **D+** | Facilitator **11/11** green but **no** product commit after blocked close_out. |
| Test strategy | **B+** | RED and GREEN stdout archived with eleven cases, fewer than the high-effort peer. |
| Algorithm / implementation | **A−** | `satisfies` behavior matches PLAN at facilitator replay with eleven passing tests. |
| Process adherence | **C+** | Gates invoked and respected; verification receipt and tracker sync never completed. |
| Workflow choreography | **B** | Four turns in ~4 minutes with explicit gate-blocked inventory statuses. |
| Methodology learning readout | **B+** | Documents checklist-gate friction versus Haiku high complete peer on same prompt. |

**Feedback ingest:** N/A.

**Future-test rule:** One trial does not prove methodology effectiveness; split signals (shell pass vs machine close_out) require reading inventory and gate receipts together.

---

## Cross-model notes (PROMPT-WF-01)

Compare [Haiku high @ 1794845395](trial-readout-PROMPT-WF-01-claudehaiku55high-1794845395-wf-agentstream-wf-01-claude-claudehaiku55high.md) (**close_out allowed**, **67** tests) and [WF-10 Haiku low gate friction @ 1794408633](trial-readout-PROMPT-WF-10-claudehaiku55low-1794408633-wf-agentstream-wf-10-claude-claudehaiku55low.md). **No ranking.**

---

## Cohort comparisons

Same **minimal checklist playbook** stress class as WF-10 low cells: green product tests with **machine workflow incomplete**. Size snapshot proof boundary applies (counts are not REQ **Implemented** proof).

---

## TIED version / dogfood

Session **4.2.2** captured at turn 1 (`install_json`). Bootstrap pin **`e05b717`** on client; store HEAD may differ — not an effectiveness claim.

---

## Facilitator follow-ups

- Orchestrator: consider seeding **slim tracker before turn 1** or reconciling add-feature tracker shape with `wf-trial-minimal-checklist-tracker.yaml`.
- Methodology: align turn-1 tracker slugs with gate registry or document waiver for disposable trials at minimal depth.

---

## Related links

- [Facilitator evidence](../../../tied-project/working/FACILITATOR-WF-01-1794971027-wf-agentstream-wf-01-claude-claudehaiku55low/evidence/)