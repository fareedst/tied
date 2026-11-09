# Trial readout: PROMPT-WF-04 → GPT-5.6 Luna high (Cursor agentstream) → `1794079332-wf-agentstream-wf-04-cursor-lunahigh`

| Field | Value |
| --- | --- |
| **Recorded** | 2026-11-07 |
| **Touchpoint** | `add-feature` → `refine-plan` → `build-plan` → `close-out` via **`workflow-trial-agentstream wf-04`** (`HARNESS=cursor`) + facilitator inspection |
| **Trial prompt** | [PROMPT-WF-04](catalog-traditional-workflow-trial-prompts.md#prompt-wf-04) |
| **Model config** | `luna-high` |
| **Model slug** | `gpt-5.6-luna-high-fast` |
| **Harness** | `cursor-agentstream-four-phase` ([run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh) via [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh)) |
| **Client root** | `/Users/fareed/Documents/dev/test/1794079332-wf-agentstream-wf-04-cursor-lunahigh` |
| **Factory tag** | `wf-agentstream-wf-04-cursor-lunahigh` |
| **Product REQ** | `REQ-WF_TRIAL_REQUIREMENT_MARKER_SCAN` |
| **TIED methodology version (session)** | **4.2.1** — source **`install_json`** on session file; evidence `…/REQ-WF_TRIAL_REQUIREMENT_MARKER_SCAN/evidence/tied-methodology-version.session.v1.json` |
| **Cohort comparison** | First **luna-high** **PROMPT-WF-04** readout; contrasts complete [Composer @ 1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md) (**8/8** fixture scan tests, traceable commits). |

Store documentation only; not a catalog `[REQ-*]` token.

---

## Sponsor intent (verbatim)

```text
Build a CLI that scans a tiny committed fixture directory of source files for comment markers that look like requirement identifiers and compares them to a fixture index file listing allowed ids. Report orphans and matches. Tests must use only the fixture tree, not live project indexes.
```

**Catalog stress:** fixture-grounded traceability scan. **Proof boundary:** `executable_behavior` **not reached**.

---

## Agent processing difficulties (per turn)

| Turn | Skill | Difficulties / friction |
| --- | --- | --- |
| **1** | `add-feature` | Session `53e80507-…`. REQ/PLAN/CITDP/tracker scaffold; **no fixtures or product code**. |
| **2** | `refine-plan` | Session `b2a04e5a-…`. **No refine artifacts** on disk. |
| **3** | `build-plan` | Session `c1d44c5e-…`. **No implementation, fixtures, or tests**. |
| **4** | `close-out` | Session `75013af2-…`. Envelope **0** blocking gaps; **`close_out` gate `allowed: false`**; commit skipped. |

**Cross-turn harness notes:** batch `/var/folders/.../traditional-four-phase-batch.BW0lRl4cG5.yaml`; ~9.9 min wall (`2026-11-07T19:22:13Z` → `19:32:07Z`).

---

## RESOLVE table (subject client)

| Sponsor term | Resolved concept | Where recorded |
| --- | --- | --- |
| requirement markers | Planned comment grammar (unrefined) | PLAN “planned refinement” |
| fixture directory | Intended under `src/fixtures/` — **not created** | PLAN intent only |
| fixture index | Allowlist file beside scenarios — **not created** | — |
| orphans / matches | Report shape **deferred** to refine | PLAN |
| hermetic tests | Fixture-only isolation rule stated | PLAN; **no tests** |

---

## What was built

- **Planning / TIED:** `REQ-WF_TRIAL_REQUIREMENT_MARKER_SCAN` scaffold (uncommitted); draft CITDP; tracker; add-feature + close-out handoffs; not-applicable receipt for minimal adversarial depth.
- **Product:** **None** — `src/.gitkeep`; facilitator `npm test` **0/0**.
- **Stack:** `wf-trial-ts-node-test-v1` seeded (uncommitted `package.json`, `tsconfig.json`).
- **Git:** bootstrap **`5f417f7`** (TIED **4.2.1**); REQ working tree **untracked**.
- **Orchestrator:** **`exit_code: 0`**; four session ids in stderr.

---

## Outcome record

**Implementation outcome:** **Not started** — no scanner, fixtures, or tests.

**Workflow outcome:** **Incomplete** — close-out attempted; machine gate **blocked**; refine/build absent on disk.

**Grading outcome:** Dimension bands describe this session only — not methodology effectiveness or a model leaderboard.

---

## Completion signals (three-way)

| Signal | Status | Notes |
| --- | --- | --- |
| **Machine close_out** | **fail** | `tied_gate_check` → `allowed: false`; no `close_out_gate_receipt` in inventory |
| **Process contract** | **partial** | add-feature scaffold + envelope validate; no verification manifest |
| **Adherence ledger** | **not_run** | Gate blocked before reconcile |
| **Close-out honesty** | **pass** | Handoff names refine/build gap |

---

## TIED db capture + workflow inventory

| Artifact | Location |
| --- | --- |
| REQ | `tied-project/requirements/REQ-WF_TRIAL_REQUIREMENT_MARKER_SCAN.yaml` (**uncommitted**) |
| PLAN | `tied-project/working/REQ-WF_TRIAL_REQUIREMENT_MARKER_SCAN/PLAN.md` |
| Envelope | `…/evidence/request-evidence-envelope.v1.json` |
| **Interaction inventory** | `…/evidence/trial-workflow-interaction-inventory.v1.json` — turns 2–3 **pending**; turn 4 **no gate receipt** |
| **Orchestrator manifest** | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |

**Facilitator verification (store):** [build-plan-verification-evidence.md](../../tied-project/working/FACILITATOR-WF-04-1794079332-wf-agentstream-wf-04-cursor-lunahigh/evidence/build-plan-verification-evidence.md) — `npm test` **0/0**.

**Proof boundary:** `facilitator_session_reconstruction` — paths, SHAs, orchestrator excerpts; not full chat transcripts.

---

## Four-turn table

| Turn | Skill | Outcome (observed) |
| --- | --- | --- |
| 1 | `add-feature` | REQ scaffold + methodology capture |
| 2 | `refine-plan` | **Not observed on disk** |
| 3 | `build-plan` | **Not observed on disk** |
| 4 | `close-out` | Envelope ok; **gate blocked** |

---

## Orchestrator process log

| Field | Value |
| --- | --- |
| **Manifest** | `/Users/fareed/Documents/dev/test/1794079332-wf-agentstream-wf-04-cursor-lunahigh/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| **Exit code** | **`0`** |
| **Wall time** | ~9.9 min |
| **Stderr log** | `…/process.stderr.log` |

**Friction excerpts:**

- `DIAGNOSTIC: tied_methodology_version=4.2.1 …`
- WF trial stack seeded; `harness=cursor model=gpt-5.6-luna-high-fast`
- `session_id=53e80507-…` … `75013af2-…` (four turns)
- Manifest **`exit_code: 0`**

**Cross-check:** Same **harness-0 / delivery-empty** pattern as [WF-01 luna-high @ 1794075385](trial-readout-PROMPT-WF-01-luna-high-1794075385-wf-agentstream-wf-01-cursor-lunahigh.md) vs rich [Composer WF-04 @ 1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md).

---

## Phase boundary audit

| Check | Finding |
| --- | --- |
| Git history | Bootstrap **`5f417f7`** only |
| Inventory vs git | Scaffold uncommitted; no `src/fixtures/` |
| RED evidence | **Absent** |
| Uncertainty | Turns 2–3 session ids present without handoffs — **heuristic** |

---

## Stack compliance

| Check | Result |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Product paths | **`src/.gitkeep` only** |
| Facilitator `npm test` | **0** tests |
| Deviation | None on seeding |

---

## Session grading

| Dimension | Band | Rationale |
| --- | --- | --- |
| Requirement interpretation | **B−** | add-feature captures fixture-only intent; refine never ran |
| Traceability closure | **C+** | Scaffold only; no ARCH/IMPL |
| Test strategy | **F** | RED/GREEN path exists but case count stays lean versus richer peer WF cells (0 green tests). |
| Algorithm / implementation | **F** | Shipped behavior matches PROMPT shape; gaps leave some fault paths lightly exercised. |
| Process adherence | **C+** | Blocked close-out documented |
| Workflow choreography | **B−** | Four sessions + **`0`**; missing mid-phase artifacts |
| Methodology learning readout | **B** | **luna-high** WF-04 **scaffold-only** row @ **4.2.1** |

**Feedback ingest:** N/A (facilitator default; no store `tied_feedback_add` this pass).

**Future-test rule:** One trial does not prove methodology effectiveness; cohort claims need baseline, pairing disposition, and explicit proof boundaries. The **`workflow-trial-agentstream`** path documents **operator reproducibility**, not that agentstream beats manual IDE skills.

---

## Cross-model notes (PROMPT-WF-04)

Compared with [Composer @ 1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md): peer delivers **`src/audit.ts`**, eight hermetic scenarios, **`8/8`** tests, and traceable commits; this cell stops at add-feature scaffold.

Compared with [Claude Haiku @ 1793853737](trial-readout-PROMPT-WF-04-claudehaiku55-1793853737-wf-agentstream-wf-04-claude-claudehaiku55.md) and [Claude Sonnet @ 1793852946](trial-readout-PROMPT-WF-04-claudesonnet55-1793852946-wf-agentstream-wf-04-claude-claudesonnet55.md): earlier harness family cells — this **luna-high** cell under **4.2.1** orchestrator matches **exit 0** but lacks their delivery depth.

No ranking — prose cohort context only.

---

## Cohort comparisons vs peer WF readouts

Adds **2026-11-07 luna-high** **scaffold-only** row for **PROMPT-WF-04**, contrasting Composer **fixture scan** completion in the same catalog stress class.

---

## TIED version / dogfood

Session file on turn 1 records **4.2.1**. Documents WF trial preload + four-phase shell on **luna-high** without fixture scanner delivery; **not** an effectiveness claim.

---

## Facilitator follow-ups

- Investigate missing refine/build handoffs despite four stderr session ids (stdout).
- Re-run after refine lands marker grammar + fixture layout.
- Optional promotion of scaffold commit for REQ token hygiene only.

---

## Related links

- [Traditional workflow catalog](catalog-traditional-workflow-trial-prompts.md)
- [Facilitator evidence folder](../../tied-project/working/FACILITATOR-WF-04-1794079332-wf-agentstream-wf-04-cursor-lunahigh/PLAN.md)
